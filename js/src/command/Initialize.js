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
    this._initController();
    this._initView();

    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,{
        screenName:App.ScreenName.MENU,
        headerLeftAction:App.HeaderAction.CANCEL,
        headerRightAction:App.HeaderAction.NONE,
        headerName:"Menu"//TODO remove hard-coded value
    });

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {{userData:string,transactions:string,icons:Object}} data
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data)
{
    var ModelName = App.ModelName,
        Collection = App.Collection,
        PaymentMethod = App.PaymentMethod,
        Currency = App.Currency,
        userData = JSON.parse(data.userData),
        currencies = new Collection(userData.currencies,Currency,null,this._eventListenerPool);

    currencies.addItem(new Currency([1,"USD"]));

    App.ModelLocator.init([
        ModelName.EVENT_LISTENER_POOL,this._eventListenerPool,
        ModelName.TICKER,new App.Ticker(this._eventListenerPool),
        ModelName.ICONS,Object.keys(data.icons).filter(function(element) {return element.indexOf("-app") === -1}),
        ModelName.PAYMENT_METHODS,new Collection([PaymentMethod.CASH,PaymentMethod.CREDIT_CARD],PaymentMethod,null,this._eventListenerPool),
        ModelName.CURRENCIES,currencies,
        ModelName.SETTINGS,new App.Settings(userData.settings),
        ModelName.SUB_CATEGORIES,new Collection(userData.subCategories,App.SubCategory,null,this._eventListenerPool),
        ModelName.CATEGORIES,new Collection(userData.categories,App.Category,null,this._eventListenerPool),
        ModelName.ACCOUNTS,new Collection(userData.accounts,App.Account,null,this._eventListenerPool),
        ModelName.TRANSACTIONS,new Collection(userData.transactions,App.Transaction,null,this._eventListenerPool)
    ]);
};

/**
 * Initialize commands
 *
 * @method _initController
 * @private
 */
App.Initialize.prototype._initController = function _initController()
{
    var EventType = App.EventType;

    App.Controller.init(this._eventListenerPool,[
        EventType.CHANGE_SCREEN,App.ChangeScreen,
        EventType.CREATE_TRANSACTION,App.CreateTransaction
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
        }),
        ViewName = App.ViewName,
        ObjectPool = App.ObjectPool,
        FontStyle = App.FontStyle,
        categoryButtonOptions = {
            width:Math.round(w * r),
            height:Math.round(50 * r),
            pixelRatio:pixelRatio,
            nameLabelStyle:FontStyle.get(18,FontStyle.BLUE),
            editLabelStyle:FontStyle.get(18,FontStyle.WHITE)
        };

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

    App.ViewLocator.init([
        ViewName.CATEGORY_BUTTON_EXPAND_POOL,new ObjectPool(App.CategoryButtonExpand,5,categoryButtonOptions),
        ViewName.CATEGORY_BUTTON_EDIT_POOL,new ObjectPool(App.CategoryButtonEdit,5,categoryButtonOptions),
        ViewName.APPLICATION_VIEW,stage.addChild(new App.ApplicationView(stage,renderer,w,h,pixelRatio))
    ]);

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
