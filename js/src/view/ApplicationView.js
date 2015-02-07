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
        categories = ModelLocator.getProxy(ModelName.ACCOUNTS).getItemAt(0).getCategories();

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

    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._background = new PIXI.Graphics();
    this._header = new App.Header(this._layout);

    //TODO use ScreenFactory for the screens?
    //TODO deffer initiation and/or rendering of most of the screens?
    this._screenStack = new App.ViewStack([
        new App.AccountScreen(categories,this._layout),
        new App.CategoryScreen(categories,this._layout),
        new App.SelectTimeScreen(null,this._layout),
        new App.EditCategoryScreen(null,this._layout),
        new App.TransactionScreen(null,this._layout),
        new App.ReportScreen(null,this._layout),
        new App.AddTransactionScreen(null,this._layout),
        new App.Menu(this._layout)//TODO is Menu part of stack? And if it is, it should be at bottom
    ]);

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
    this._screenStack.selectChildByIndex(App.ScreenName.MENU);//TODO move this into separate command?
    this._screenStack.show();
    this.changeScreen(App.ScreenName.MENU);
};

/**
 * Register event listeners
 *
 * @method _registerEventListeners
 * @private
 */
App.ApplicationView.prototype._registerEventListeners = function _registerEventListeners()
{
    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(App.EventType.TICK,this,this._onTick);

    this._header.registerEventListeners(this);
};

/**
 * Change screen by the name passed in
 * @param {number} screenName
 */
App.ApplicationView.prototype.changeScreen = function changeScreen(screenName)
{
    this._screenStack.selectChildByIndex(screenName);
    this._screenStack.show();
    this._screenStack.hide();

    //this._eventDispatcher.dispatchEvent(App.EventType.CHANGE,this._screenStack.getSelectedChild());
    this._header.change(this._screenStack.getSelectedChild().getHeaderInfo());
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
    //TODO do not render if nothing happens (prop 'dirty'?)
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
