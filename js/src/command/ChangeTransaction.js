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
App.ChangeTransaction.prototype.constructor = App.ChangeTransaction;

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
        transactions.addItem(transaction);
        transactions.setCurrent(transaction);

        data.nextCommandData.updateData = transaction;
    }
    else if (type === EventType.COPY)
    {
        transaction = data.transaction.copy();
        transactions.addItem(transaction);
        transactions.setCurrent(transaction);

        data.nextCommandData.updateData = transaction;
    }
    else if (type === EventType.CHANGE)
    {
        this._saveInputs(transaction,data);
        this._saveToggles(transaction,data);
        this._saveCategories(transaction,data,settings);
        this._saveTime(transaction,data);
        this._saveMethod(transaction,data,settings);
        this._saveCurrency(transaction,data,settings);
    }
    else if (type === EventType.CONFIRM)
    {
        this._saveInputs(transaction,data);
        this._saveToggles(transaction,data);
        this._saveMethod(transaction,data,settings);

        transaction.save();
        transactions.setCurrent(null);
    }
    else if (type === EventType.CANCEL)
    {
        if (transaction.isSaved()) transactions.setCurrent(null);
        else transactions.removeItem(transaction).destroy();
    }
    else if (type === EventType.DELETE)
    {
        transactions.removeItem(transaction).destroy();

        data.nextCommandData.updateData = transactions.copySource().reverse();
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * Save input texts
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @private
 */
App.ChangeTransaction.prototype._saveInputs = function _saveInputs(transaction,data)
{
    transaction.amount = data.amount || transaction.amount;
    transaction.note = data.note || transaction.note;
};

/**
 * Save toggle button values
 * @param {App.Transaction} transaction
 * @param {Object} data
 * @private
 */
App.ChangeTransaction.prototype._saveToggles = function _saveToggles(transaction,data)
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
App.ChangeTransaction.prototype._saveCategories = function _saveCategories(transaction,data,settings)
{
    if (data.account && data.category && data.subCategory)
    {
        transaction.account = data.account;
        transaction.category = data.category;
        transaction.subCategory = data.subCategory;

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
App.ChangeTransaction.prototype._saveTime = function _saveTime(transaction,data)
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
App.ChangeTransaction.prototype._saveMethod = function _saveMethod(transaction,data,settings)
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
App.ChangeTransaction.prototype._saveCurrency = function _saveCurrency(transaction,data,settings)
{
    if (data.currencyQuote)
    {
        transaction.currencyQuote = data.currencyQuote;
        settings.defaultCurrencyQuote = data.currencyQuote;
    }
};
