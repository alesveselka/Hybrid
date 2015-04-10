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
    var HeaderAction = App.HeaderAction,
        changeScreenDataPool = new App.ObjectPool(App.ChangeScreenData,5);

    this._loadDataCommand.destroy();
    this._loadDataCommand = null;
    
    this._initModel(data,changeScreenDataPool);
    this._initController();
    this._initView();

    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenDataPool.allocate().update(
        App.ScreenName.MENU,
        0,
        null,
        HeaderAction.NONE,
        HeaderAction.CANCEL,
        App.ScreenTitle.MENU
    ));

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {{userData:string,transactions:string,icons:Object}} data
 * @param {ObjectPool} changeScreenDataPool
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data,changeScreenDataPool)
{
    var ModelName = App.ModelName,
        Collection = App.Collection,
        PaymentMethod = App.PaymentMethod,
        userData = JSON.parse(data.userData),
        currencyPairs = new App.CurrencyPairCollection(userData.currencyPairs,this._eventListenerPool);

    App.ModelLocator.init([
        ModelName.EVENT_LISTENER_POOL,this._eventListenerPool,
        ModelName.TICKER,new App.Ticker(this._eventListenerPool),
        ModelName.ICONS,Object.keys(data.icons).filter(function(element) {return element.indexOf("-app") === -1;}),
        ModelName.PAYMENT_METHODS,new Collection([PaymentMethod.CASH,PaymentMethod.CREDIT_CARD],PaymentMethod,null,this._eventListenerPool),
        ModelName.CURRENCY_PAIRS,currencyPairs,
        ModelName.CURRENCY_SYMBOLS,new Collection(this._getCurrencySymbols(currencyPairs),App.CurrencySymbol,null,this._eventListenerPool),
        ModelName.SETTINGS,new App.Settings(userData.settings),
        ModelName.SUB_CATEGORIES,new Collection(userData.subCategories,App.SubCategory,null,this._eventListenerPool),
        ModelName.CATEGORIES,new Collection(userData.categories,App.Category,null,this._eventListenerPool),
        ModelName.ACCOUNTS,new Collection(userData.accounts,App.Account,null,this._eventListenerPool),
        ModelName.TRANSACTIONS,new Collection(userData.transactions,App.Transaction,null,this._eventListenerPool),
        ModelName.CHANGE_SCREEN_DATA_POOL,changeScreenDataPool,
        ModelName.SCREEN_HISTORY,new App.Stack()
    ]);
};

/**
 * Goes through currencyPairs passed in and generate array of currency symbols
 * @param {App.Collection} currencyPairs
 * @returns {Array.<string>}
 * @private
 */
App.Initialize.prototype._getCurrencySymbols = function _getCurrencySymbols(currencyPairs)
{
    var symbols = [],
        currencyPair = null,
        i = 0,
        l = currencyPairs.length();

    for (;i<l;)
    {
        currencyPair = currencyPairs.getItemAt(i++);
        if (symbols.indexOf(currencyPair.symbol) === -1) symbols.push(currencyPair.symbol);
        if (symbols.indexOf(currencyPair.base) === -1) symbols.push(currencyPair.base);
    }

    return symbols;
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
        EventType.CHANGE_TRANSACTION,App.ChangeTransaction,
        EventType.CHANGE_ACCOUNT,App.ChangeAccount,
        EventType.CHANGE_CATEGORY,App.ChangeCategory,
        EventType.CHANGE_SUB_CATEGORY,App.ChangeSubCategory,
        EventType.CHANGE_CURRENCY_PAIR,App.ChangeCurrencyPair
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
    var canvas = document.getElementsByTagName("canvas")[0],
        context = canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1,
        pixelRatio = dpr / bsr > 2 ? 2 : dpr / bsr,
        width = window.innerWidth,
        height = window.innerHeight,
        stage = new PIXI.Stage(0xffffff),
        renderer = new PIXI.CanvasRenderer(width,height,{
            view:canvas,
            resolution:1,
            transparent:false,
            autoResize:false,
            clearBeforeRender:false
        }),
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName;

    if (pixelRatio > 1)
    {
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        context.scale(pixelRatio,pixelRatio);

        stage.interactionManager.setPixelRatio(pixelRatio);
    }

    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.tintWithOverlay;

    //context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
    context.lineCap = "square";

    this._initButtonPools(ViewLocator,ViewName,Math.round(width * pixelRatio),pixelRatio);

    ViewLocator.addViewSegment(ViewName.APPLICATION_VIEW,stage.addChild(new App.ApplicationView(stage,renderer,width,height,pixelRatio)));
};

/**
 * Initialize button pools
 * @param {Object} ViewLocator
 * @param {Object} ViewName
 * @param {number} width
 * @param {number} pixelRatio
 * @private
 */
App.Initialize.prototype._initButtonPools = function _initButtonPools(ViewLocator,ViewName,width,pixelRatio)
{
    var ObjectPool = App.ObjectPool,
        FontStyle = App.FontStyle.init(pixelRatio),
        skin = new App.Skin(width,pixelRatio),
        transactionButtonOptions = {
            labelStyles:{
                edit:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                accountIncome:FontStyle.get(14,FontStyle.BLUE_LIGHT,null,FontStyle.LIGHT_CONDENSED),
                amountIncome:FontStyle.get(26,FontStyle.BLUE),
                currencyIncome:FontStyle.get(16,FontStyle.BLUE_DARK,null,FontStyle.LIGHT_CONDENSED),
                date:FontStyle.get(14,FontStyle.GREY_DARK),
                pending:FontStyle.get(12,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                accountPending:FontStyle.get(14,FontStyle.RED_DARK),
                amountPending:FontStyle.get(26,FontStyle.WHITE),
                currencyPending:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                datePending:FontStyle.get(14,FontStyle.WHITE,"right",FontStyle.LIGHT_CONDENSED)
            },
            greySkin:skin.GREY_70,
            redSkin:skin.RED_70,
            width:width,
            height:Math.round(70 * pixelRatio),
            pixelRatio:pixelRatio,
            openOffset:Math.round(120 * pixelRatio)
        };

    //TODO move some pools to the actual screens?; they may not be accessed anywhere else anyway ...
    ViewLocator.init([
        ViewName.SKIN,skin,
        ViewName.TRANSACTION_BUTTON_POOL,new ObjectPool(App.TransactionButton,4,transactionButtonOptions)
    ]);
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
