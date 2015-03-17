/**
 * @class ApplicationView
 * @extends DisplayObjectContainer
 * @param {Stage} stage
 * @param {CanvasRenderer} renderer
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ApplicationView = function ApplicationView(stage,renderer,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        listenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this._renderer = renderer;
    this._stage = stage;

    this._layout = {
        originalWidth:width,
        originalHeight:height,
        width:Math.round(width * pixelRatio),
        height:Math.round(height * pixelRatio),
        headerHeight:Math.round(50 * pixelRatio),
        contentHeight:Math.round((height - 50) * pixelRatio),
        pixelRatio:pixelRatio
    };

    //TODO do I need event dispatcher here?
    this._eventDispatcher = new App.EventDispatcher(listenerPool);
    this._background = new PIXI.Graphics();

    //TODO use ScreenFactory for the screens?
    //TODO deffer initiation and/or rendering of most of the screens?
    this._screenStack = ViewLocator.addViewSegment(ViewName.SCREEN_STACK,new App.ViewStack([
        new App.AccountScreen(this._layout),
        new App.CategoryScreen(this._layout),
        new App.SelectTimeScreen(this._layout),
        new App.EditCategoryScreen(this._layout),
        new App.TransactionScreen(this._layout),
        new App.ReportScreen(this._layout),
        new App.AddTransactionScreen(this._layout),
        new App.EditScreen(this._layout),
        new App.CurrencyPairScreen(this._layout),
        new App.Menu(this._layout)
    ],false,listenerPool));

    this._header = ViewLocator.addViewSegment(ViewName.HEADER,new App.Header(this._layout));

    this._init();

    this.addChild(this._background);
    this.addChild(this._screenStack);
    this.addChild(this._header);
};

App.ApplicationView.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ApplicationView.prototype.constructor = App.ApplicationView;

/**
 * Init
 * @private
 */
App.ApplicationView.prototype._init = function _init()
{
    App.GraphicUtils.drawRect(this._background,0xbada55,1,0,0,this._layout.width,this._layout.height);

    this.scrollTo(0);

    this._registerEventListeners();

    this._screenStack.y = this._layout.headerHeight;
};

/**
 * Register event listeners
 *
 * @method _registerEventListeners
 * @private
 */
App.ApplicationView.prototype._registerEventListeners = function _registerEventListeners()
{
    var EventType = App.EventType;

    this._screenStack.addEventListener(EventType.CHANGE,this,this._onScreenChange);

    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(EventType.TICK,this,this._onTick);
};

/**
 * On screen change
 * @private
 */
App.ApplicationView.prototype._onScreenChange = function _onScreenChange()
{
    this._screenStack.show();
    this._screenStack.hide();
};

/**
 * Scroll to value passed in
 * @param {number} value
 */
App.ApplicationView.prototype.scrollTo = function scrollTo(value)
{
    if (document.documentElement && document.documentElement.scrollTop) document.documentElement.scrollTop = value;
    else document.body.scrollTop = value;
};

/**
 * On Ticker's  Tick event
 *
 * @method _onTick
 * @private
 */
App.ApplicationView.prototype._onTick = function _onTick()
{
    //TODO do not render if nothing happens (prop 'dirty'?) - drains battery
    this._renderer.render(this._stage);
};

/**
 * On resize
 * @private
 */
App.ApplicationView.prototype._onResize = function _onResize()
{
    //this.scrollTo(0);
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ApplicationView.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ApplicationView.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};
