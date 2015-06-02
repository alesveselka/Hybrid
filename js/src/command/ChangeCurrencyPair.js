/**
 * @class ChangeCurrencyPair
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeCurrencyPair = function ChangeCurrencyPair(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.ChangeCurrencyPair.prototype = Object.create(App.SequenceCommand.prototype);

/**
 * Execute the command
 *
 * @method execute
 * @param {{account:App.Account,name:string,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeCurrencyPair.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    data.currencyPair.rate = parseFloat(data.rate);

    // Save
    App.ServiceLocator.getService(App.ServiceName.STORAGE).setData(
        App.StorageKey.CURRENCY_PAIRS,
        App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).serialize()
    );

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
