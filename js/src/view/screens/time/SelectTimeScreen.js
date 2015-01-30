/**
 * @class SelectTimeScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.SelectTimeScreen = function SelectTimeScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();//TODO do I need BG? I can use BG below whole screen ...
    this._inputOverlay = new PIXI.Graphics();
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(new Date(),w,r);
    this._inputFocused = false;
    //TODO enable 'swiping' for interactively changing calendar's months
    this._render();

    this._container.addChild(this._inputBackground);
    this._container.addChild(this._header);
    this._container.addChild(this._calendar);
    this._container.addChild(this._input);

    this._pane.setContent(this._container);

    this.addChild(this._pane);
};

App.SelectTimeScreen.prototype = Object.create(App.Screen.prototype);
App.SelectTimeScreen.prototype.constructor = App.SelectTimeScreen;

/**
 * Render
 * @private
 */
App.SelectTimeScreen.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        r = this._layout.pixelRatio,
        inputBgHeight = Math.round(60 * r),
        w = this._layout.width;

    GraphicUtils.drawRects(this._inputBackground,ColorTheme.GREY,1,[0,0,w,inputBgHeight],true,false);
    GraphicUtils.drawRects(this._inputBackground,ColorTheme.GREY_DARK,1,[0,inputBgHeight-1,w,1],false,true);

    this._input.x = Math.round(10 * r);
    this._input.y = Math.round((inputBgHeight - this._input.height) / 2);

    this._header.y = inputBgHeight;

    this._calendar.y = Math.round(this._header.y + this._header.height);

    GraphicUtils.drawRect(this._inputOverlay,0x000000,0.2,0,0,w,this._calendar.y+this._calendar.boundingBox.height);
};

/**
 * Enable
 */
App.SelectTimeScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.SelectTimeScreen.prototype._registerEventListeners = function _registerEventListener()
{
    App.Screen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;
    this._input.addEventListener(EventType.FOCUS,this,this._onInputFocus);
    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.SelectTimeScreen.prototype._unRegisterEventListeners = function _unRegisterEventListener()
{
    var EventType = App.EventType;
    this._input.removeEventListener(EventType.FOCUS,this,this._onInputFocus);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);

    App.Screen.prototype._unRegisterEventListeners.call(this);
};

/**
 * On input focus
 * @private
 */
App.SelectTimeScreen.prototype._onInputFocus = function _onInputFocus()
{
    this._inputFocused = true;
    //TODO sometimes when input focuses, content scrolls inside Pane as SW keyboard shows!!! - it may be that I swipe and scroll, and after keyboard is shown, the scroll resumes ...
    if (!this._container.contains(this._inputOverlay)) this._container.addChildAt(this._inputOverlay,this._container.getChildIndex(this._input));
};

/**
 * On input blur
 * @private
 */
App.SelectTimeScreen.prototype._onInputBlur = function _onInputBlur()
{
    if (this._container.contains(this._inputOverlay)) this._container.removeChild(this._inputOverlay);

    this._inputFocused = false;
};

/**
 * Click handler
 * @private
 */
App.SelectTimeScreen.prototype._onClick = function _onClick()
{
    if (this._inputFocused) this._input.blur();

    this._calendar.onClick();
};
