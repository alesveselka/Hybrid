/**
 * @class Header
 * @extends Graphics
 * @param {Object} layout
 * @constructor
 */
App.Header = function Header(layout)
{
    PIXI.Graphics.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        HeaderIcon = App.HeaderIcon,
        HeaderAction = App.HeaderAction,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio;

    this._layout = layout;
    this._iconSize = Math.round(50 * r);
    this._leftIcon = new HeaderIcon(HeaderAction.CANCEL,this._iconSize,this._iconSize,r);
    this._rightIcon = new HeaderIcon(HeaderAction.CONFIRM,this._iconSize,this._iconSize,r);
    this._title = new App.HeaderTitle("Cashius",this._layout.width-this._iconSize*2,this._iconSize,r,FontStyle.get(20,FontStyle.WHITE));
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._tween = new App.TweenProxy(0.7,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this._render();

    this.addChild(this._leftIcon);
    this.addChild(this._title);
    this.addChild(this._rightIcon);

    this.interactive = true;
};

App.Header.prototype = Object.create(PIXI.Graphics.prototype);
App.Header.prototype.constructor = App.Header;

/**
 * Render
 * @private
 */
App.Header.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this._layout.width,
        h = this._layout.headerHeight,
        offset = h - this._iconSize,
        padding = Math.round(10 * r);

    this._title.x = this._iconSize;
    this._rightIcon.x = w - this._iconSize;

    GraphicUtils.drawRects(this,ColorTheme.BLUE,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_LIGHT,1,[
        this._iconSize+1,offset+padding,1,this._iconSize-padding*2,
        w-this._iconSize,offset+padding,1,this._iconSize-padding*2
    ],false,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_DARK,1,[
        0,h-1,w,1,
        this._iconSize,offset+padding,1,this._iconSize-padding*2,
        w-this._iconSize-1,offset+padding,1,this._iconSize-padding*2
    ],false,true);
};

/**
 * Register event listeners
 * @param {App.ApplicationView} applicationView
 * @private
 */
App.Header.prototype.registerEventListeners = function registerEventListeners(applicationView)
{
    //applicationView.addEventListener(App.EventType.CHANGE,this,this._onScreenChange);

    if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
    else this.click = this._onClick;

    this._tween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
};

/**
 * Change
 * @param {{leftAction:number,rightAction:number,name:string}} info
 * @private
 */
App.Header.prototype.change = function change(info)
{
    this._leftIcon.change(info.leftAction);
    this._title.change(info.name);
    this._rightIcon.change(info.rightAction);

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

    this._tween.restart();
};

/**
 * On RAF Tick
 * @private
 */
App.Header.prototype._onTick = function _onTick()
{
    this._onTweenUpdate();
};

/**
 * On tween update
 * @private
 */
App.Header.prototype._onTweenUpdate = function _onTweenUpdate()
{
    var progress = this._tween.progress;
    //TODO offset each segment for effect
    this._leftIcon.update(progress);
    this._title.update(progress);
    this._rightIcon.update(progress);
};

/**
 * On tween complete
 * @private
 */
App.Header.prototype._onTweenComplete = function _onTweenComplete()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._onTweenUpdate();
};

/**
 * On click
 * @param {InteractionData} data
 * @private
 */
App.Header.prototype._onClick = function _onClick(data)
{
    var position = data.getLocalPosition(this).x,
        HeaderAction = App.HeaderAction,
        action = HeaderAction.NONE;

    //TODO here dispatch event, and each screen will handle action accordingly, instead of handling it here ...
    //TODO "pipe" events from icons?
    if (position <= this._iconSize)
    {
        action = this._leftIcon.getAction();
        if (action === HeaderAction.MENU || action === HeaderAction.CANCEL) App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.MENU);
    }
    else if (position >= this._layout.width - this._iconSize)
    {
        action = this._rightIcon.getAction();
        if (action === HeaderAction.ADD_TRANSACTION) App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ADD_TRANSACTION);
    }
};
