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

/**
 * Execute the command
 *
 * @method execute
 * @param {{account:App.Account,name:string,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
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
        account.name = data.name;

        if (account.lifeCycleState === App.LifeCycleState.CREATED)
        {
            var collection = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS);
            if (collection.indexOf(account) === -1) collection.addItem(account);

            account.lifeCycleState = App.LifeCycleState.ACTIVE;

            // Save
            App.ServiceLocator.getService(App.ServiceName.STORAGE).setData(
                App.StorageKey.ACCOUNTS,
                App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).serialize()
            );
        }
    }
    else if (type === EventType.DELETE)
    {
        //TODO keep checking when this account is not really needed and delete it
        account.lifeCycleState = App.LifeCycleState.DELETED;
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};
