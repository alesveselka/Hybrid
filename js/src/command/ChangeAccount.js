/**
 * @class ChangeAccount
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeAccount = function ChangeAccount(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.ChangeAccount.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeAccount.prototype.constructor = App.ChangeAccount;

/**
 * Execute the command
 *
 * @method execute
 * @param {{subCategory:App.SubCategory,name:string,category:App.Category,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeAccount.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        account = data.account,
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        account = new App.Account();

        this._nextCommandData.updateData = account;
    }
    else if (type === EventType.CHANGE)
    {
        var collection = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS);

        account.name = data.name;

        if (collection.indexOf(account) === -1) collection.addItem(account);
    }
    /*else if (type === EventType.DELETE)
    {
        data.category.removeSubCategory(subCategory);
    }*/

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};
