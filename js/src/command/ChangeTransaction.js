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
        transactions = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS),
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
        var date = data.date,
            time = data.time;

        transaction.amount = data.amount || transaction.amount;
        transaction.account = data.account || transaction.account;
        transaction.category = data.category || transaction.category;
        transaction.subCategory = data.subCategory || transaction.subCategory;
        transaction.method = data.method || transaction.method;
        transaction.currency = data.currency || transaction.currency;
        transaction.note = data.note || transaction.note;

        if (date && time)
        {
            transaction.date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
            if (time.length > 0) transaction.date.setHours(parseInt(time.split(":")[0],10),parseInt(time.split(":")[1],10));
        }
    }
    else if (type === EventType.CONFIRM)
    {
        transaction.amount = data.amount || transaction.amount;
        transaction.type = data.transactionType || transaction.type;
        transaction.pending = data.pending === true;
        transaction.repeat = data.repeat === true;
        transaction.note = data.note || transaction.note;

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
