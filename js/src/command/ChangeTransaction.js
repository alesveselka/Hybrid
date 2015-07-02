/**
 * @class ChangeTransaction
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeTransaction = function ChangeTransaction(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.ChangeTransaction.prototype = Object.create(App.SequenceCommand.prototype);

/**
 * Execute the command
 *
 * @method execute
 * @param {{nextCommand:Command,screenName:number}} data
 */
App.ChangeTransaction.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        settings = ModelLocator.getProxy(ModelName.SETTINGS),
        transactions = ModelLocator.getProxy(ModelName.TRANSACTIONS),
        transaction = transactions.getCurrent(),
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        transaction = new App.Transaction();
        transaction.id = transactions.getTransactionId();
        transactions.addItem(transaction);
        transactions.setCurrent(transaction);

        data.nextCommandData.updateData = transaction;
    }
    else if (type === EventType.COPY)
    {
        transaction = data.transaction.copy();
        transaction.id = transactions.getTransactionId();
        transactions.addItem(transaction);
        transactions.setCurrent(transaction);

        data.nextCommandData.updateData = transaction;
    }
    else if (type === EventType.CHANGE)
    {
        this._setInputs(transaction,data,false);
        this._setToggles(transaction,data);
        this._setCategories(transaction,data,settings);
        this._setTime(transaction,data);
        this._setMethod(transaction,data,settings);
        this._setCurrency(transaction,data,settings);
    }
    else if (type === EventType.CONFIRM)
    {
        // Update balances before saving
        this._updateCategoryBalance(type,transaction,data,settings);

        this._setToggles(transaction,data);
        this._setInputs(transaction,data,true);
        this._setMethod(transaction,data,settings);

        transaction.currencyBase = settings.baseCurrency;
        transaction.save();
        transactions.setCurrent(null);

        this._saveCollection(transaction,transactions);
    }
    else if (type === EventType.CANCEL)
    {
        if (transaction.isSaved())
        {
            transaction.revokeState();
            transactions.setCurrent(null);
        }
        else
        {
            transactions.removeItem(transaction).destroy();
        }
    }
    else if (type === EventType.DELETE)
    {
        // Update balances before deleting
        this._updateCategoryBalance(type,transaction,data,settings);

        transactions.removeItem(transaction).destroy();

        data.nextCommandData.updateData = transactions.copySource().reverse();

        this._saveCollection(transaction,transactions);
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * Save input texts
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @param {boolean} setDefault
 * @private
 */
App.ChangeTransaction.prototype._setInputs = function _setInputs(transaction,data,setDefault)
{
    transaction.amount = isNaN(parseFloat(data.amount)) ? transaction.amount : parseFloat(data.amount);
    transaction.note = data.note || transaction.note;

    if (setDefault && !transaction.amount) transaction.amount = "0";
};

/**
 * Save toggle button values
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @private
 */
App.ChangeTransaction.prototype._setToggles = function _setToggles(transaction,data)
{
    transaction.type = data.transactionType || transaction.type;
    if (typeof data.pending === "boolean") transaction.pending = data.pending;
    if (typeof data.repeat === "boolean") transaction.repeat = data.repeat;
};

/**
 * Save Account, Category, and SubCategory
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @param {App.Settings} settings
 * @private
 */
App.ChangeTransaction.prototype._setCategories = function _setCategories(transaction,data,settings)
{
    if (data.account && data.category && data.subCategory)
    {
        transaction.account = data.account;
        transaction.category = data.category;
        transaction.subCategory = data.subCategory;

        //TODO move this into its own command!
        settings.defaultAccount = data.account;
        settings.defaultCategory = data.category;
        settings.defaultSubCategory = data.subCategory;
    }
};

/**
 * Save time and data
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @private
 */
App.ChangeTransaction.prototype._setTime = function _setTime(transaction,data)
{
    var date = data.date,
        time = data.time;

    if (date && time)
    {
        transaction.date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
        if (time.length > 0) transaction.date.setHours(parseInt(time.split(":")[0],10),parseInt(time.split(":")[1],10));
    }
};

/**
 * Save payment method
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @param {App.Settings} settings
 * @private
 */
App.ChangeTransaction.prototype._setMethod = function _setMethod(transaction,data,settings)
{
    if (data.method)
    {
        var method = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).find("name",data.method);
        transaction.method = method;
        settings.defaultPaymentMethod = method;
    }
};

/**
 * Save currency quote
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @param {App.Settings} settings
 * @private
 */
App.ChangeTransaction.prototype._setCurrency = function _setCurrency(transaction,data,settings)
{
    if (data.currencyQuote)
    {
        transaction.currencyQuote = data.currencyQuote;
        settings.defaultCurrencyQuote = data.currencyQuote;
    }
};

/**
 * Update subCategory balance
 * @param {string} eventType
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @param {App.Settings} settings
 * @private
 */
App.ChangeTransaction.prototype._updateCategoryBalance = function _updateCategoryBalance(eventType,transaction,data,settings)
{
    var currencyPairCollection = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS);

    if (eventType === App.EventType.CONFIRM)
    {
        if (transaction.isSaved() && !transaction.savedPending) this._updateSavedBalance(transaction,currencyPairCollection);

        if (!data.pending) this._updateCurrentBalance(transaction,currencyPairCollection,data,settings);
    }
    else if (eventType === App.EventType.DELETE)
    {
        this._updateSavedBalance(transaction,currencyPairCollection);
    }
};

/**
 * Update saved subCategory balance
 * @param {App.Transaction} transaction
 * @param {App.CurrencyPairCollection} currencyPairCollection
 * @private
 */
App.ChangeTransaction.prototype._updateSavedBalance = function _updateSavedBalance(transaction,currencyPairCollection)
{
    var TransactionType = App.TransactionType,
        savedSubCategory = transaction.savedSubCategory,
        rate = transaction.savedCurrencyRate ? transaction.savedCurrencyRate : currencyPairCollection.findRate(transaction.savedCurrencyBase,transaction.savedCurrencyQuote),
        savedAmount = transaction.savedAmount / rate;

    if (transaction.savedType === TransactionType.EXPENSE)
    {
        savedSubCategory.balance = savedSubCategory.balance + savedAmount;
    }
    else if (transaction.savedType === TransactionType.INCOME)
    {
        savedSubCategory.balance = savedSubCategory.balance - savedAmount;
    }

    App.ServiceLocator.getService(App.ServiceName.STORAGE).setData(
        App.StorageKey.SUB_CATEGORIES,
        App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).serialize()
    );
};

/**
 * Update current subCategory balance
 * @param {App.Transaction} transaction
 * @param {App.CurrencyPairCollection} currencyPairCollection
 * @param {Object} data
 * @param {App.Settings} settings
 * @private
 */
App.ChangeTransaction.prototype._updateCurrentBalance = function _updateCurrentBalance(transaction,currencyPairCollection,data,settings)
{
    var TransactionType = App.TransactionType,
        subCategory = transaction.subCategory,
        currentAmount = parseFloat(data.amount) / currencyPairCollection.findRate(settings.baseCurrency,transaction.currencyQuote);

    if (!isNaN(currentAmount))
    {
        if (data.transactionType === TransactionType.EXPENSE)
        {
            subCategory.balance = subCategory.balance - currentAmount;
        }
        else if (data.transactionType === TransactionType.INCOME)
        {
            subCategory.balance = subCategory.balance + currentAmount;
        }
    }

    App.ServiceLocator.getService(App.ServiceName.STORAGE).setData(
        App.StorageKey.SUB_CATEGORIES,
        App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).serialize()
    );
};

/**
 * Save transaction collection
 * @param {App.Transaction} transaction
 * @param {App.TransactionCollection} collection
 * @private
 */
App.ChangeTransaction.prototype._saveCollection = function _saveCollection(transaction,collection)
{
    var metaId = transaction.id.split(".")[0],
        StorageKey = App.StorageKey,
        Storage = App.ServiceLocator.getService(App.ServiceName.STORAGE);

    Storage.setData(StorageKey.TRANSACTIONS+metaId,collection.serialize(metaId,false));
    Storage.setData(StorageKey.TRANSACTIONS_META,collection.serializeMeta());
};
