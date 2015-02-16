/**
 * @class CreateTransaction
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CreateTransaction = function CreateTransaction(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.CreateTransaction.prototype = Object.create(App.SequenceCommand.prototype);
App.CreateTransaction.prototype.constructor = App.CreateTransaction;

/**
 * Execute the command
 *
 * @method execute
 * @param {{nextCommand:Command,screenName:number}} data
 */
App.CreateTransaction.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var transactions = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS),
        transaction = new App.Transaction();

    transactions.addItem(transaction);
    transactions.setCurrent(transaction);

    if (this._nextCommand) this._executeNextCommand(data.screenName);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
