/**
 * @class Initialize
 * @extends {Command}
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Initialize = function Initialize(eventListenerPool)
{
    App.Command.call(this,false,eventListenerPool);
};

App.Initialize.prototype = Object.create(App.Command.prototype);
App.Initialize.prototype.constructor = App.Initialize;

/**
 * Execute the command
 *
 * @method execute
 * @param {ObjectPool} eventListenerPool
 */
App.Initialize.prototype.execute = function execute(eventListenerPool)
{
    this._initModel(eventListenerPool);
    this._initCommands();
    this._initView();

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {ObjectPool} eventListenerPool
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(eventListenerPool)
{
    var ModelLocator = App.ModelLocator;
    var ModelName = App.ModelName;

    ModelLocator.addProxy(ModelName.EVENT_LISTENER_POOL,eventListenerPool);
    ModelLocator.addProxy(ModelName.TICKER,new App.Ticker(eventListenerPool));
    //TODO TextField object pool?
};

/**
 * Initialize commands
 *
 * @method _initCommands
 * @private
 */
App.Initialize.prototype._initCommands = function _initCommands()
{
    App.Controller.init([
        {eventType:App.EventType.INITIALIZE,command:App.Initialize}
    ]);
};

/**
 * Initialize view
 *
 * @method _initView
 * @private
 */
App.Initialize.prototype._initView = function _initView()
{
    App.ViewLocator.addViewSegment(App.ViewName.APPLICATION_VIEW,new App.ApplicationView());
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.Initialize.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    //console.log("LoadData.destroy() called");
};
