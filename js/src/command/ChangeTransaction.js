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
    else if (type === EventType.CHANGE)
    {
        var date = data.date,
            time = data.time;

        transaction.account = data.account || transaction.account;
        transaction.category = data.category || transaction.category;
        transaction.subCategory = data.subCategory || transaction.subCategory;
        transaction.method = data.method || transaction.method;
        transaction.currency = data.currency || transaction.currency;

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
        transaction.pending = data.type === true;
        transaction.repeat = data.type === true;
        transaction.note = data.note || transaction.note;

        transactions.setCurrent(null);
    }
    else if (type === EventType.CANCEL)
    {
        transactions.removeItem(transaction).destroy();
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
