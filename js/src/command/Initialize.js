/**
 * @class Initialize
 * @extends {Command}
 * @constructor
 */
App.Initialize = function Initialize()
{
    this._eventListenerPool = new App.ObjectPool(App.EventListener,10);

    App.Command.call(this,false,this._eventListenerPool);

    this._loadDataCommand = new App.LoadData(this._eventListenerPool);
};

App.Initialize.prototype = Object.create(App.Command.prototype);
App.Initialize.prototype.constructor = App.Initialize;

/**
 * Execute the command
 *
 * @method execute
 */
App.Initialize.prototype.execute = function execute()
{
    this._loadDataCommand.addEventListener(App.EventType.COMPLETE,this,this._onLoadDataComplete);
    this._loadDataCommand.execute();
};

/**
 * Load data complete handler
 *
 * @method _onLoadDataComplete
 * @param {string} data
 * @private
 */
App.Initialize.prototype._onLoadDataComplete = function _onLoadDataComplete(data)
{
    this._loadDataCommand.destroy();
    this._loadDataCommand = null;
    
    this._initModel(data);
    this._initCommands();
    this._initView();

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {{accounts:string,icons:Object}} data
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Collection = App.Collection;

    //TODO initiate all proxies in once 'init' method? Same as Controller ...
    ModelLocator.addProxy(ModelName.EVENT_LISTENER_POOL,this._eventListenerPool);
    ModelLocator.addProxy(ModelName.TICKER,new App.Ticker(this._eventListenerPool));
    ModelLocator.addProxy(ModelName.ICONS,Object.keys(data.icons).filter(function(element) {return element.indexOf("-app") === -1}));
    ModelLocator.addProxy(ModelName.ACCOUNTS,new Collection(
        JSON.parse(data.accounts).accounts,//TODO parse JSON on data from localStorage
        App.Account,
        null,
        this._eventListenerPool
    ));
    /*ModelLocator.addProxy(ModelName.TRANSACTIONS,new Collection(
        localStorage.getItem(ModelName.TRANSACTIONS),
        App.Transaction,
        null,
        this._eventListenerPool
    ));
    ModelLocator.addProxy(ModelName.FILTERS,new Collection(
        localStorage.getItem(ModelName.FILTERS),
        App.Filter,
        null,
        this._eventListenerPool
    ));*/

    App.Settings.setStartOfWeek(1);
};

/**
 * Initialize commands
 *
 * @method _initCommands
 * @private
 */
App.Initialize.prototype._initCommands = function _initCommands()
{
    App.Controller.init(this._eventListenerPool,[
        {eventType:App.EventType.CHANGE_SCREEN,command:App.ChangeScreen}
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
    //TODO initialize textures, icons, patterns?

    var canvas = document.getElementsByTagName("canvas")[0],
        context = canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1,
        pixelRatio = dpr / bsr,
        w = window.innerWidth,
        h = window.innerHeight,
        stage = new PIXI.Stage(0xffffff),
        renderer = new PIXI.CanvasRenderer(w,h,{
            view:canvas,
            resolution:1,
            transparent:false,
            autoResize:false,
            clearBeforeRender:false
        });

    if (pixelRatio > 1)
    {
        if (pixelRatio > 2) pixelRatio = 2;

        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        context.scale(pixelRatio,pixelRatio);

        stage.interactionManager.setPixelRatio(pixelRatio);
    }

    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.tintWithOverlay;

    //context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
    context.lineCap = "square";

    App.FontStyle.init(pixelRatio);

    App.ViewLocator.addViewSegment(
        App.ViewName.APPLICATION_VIEW,
        stage.addChild(new App.ApplicationView(stage,renderer,w,h,pixelRatio))
    );

    renderer.render(stage);
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.Initialize.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    if (this._loadDataCommand)
    {
        this._loadDataCommand.destroy();
        this._loadDataCommand = null;
    }

    this._eventListenerPool = null;
};
