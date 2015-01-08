App.SelectTimeScreen = function SelectTimeScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(new Date(),w,r);
    this._inputFocused = false;

    this._render();

    this._container.addChild(this._inputBackground);
    this._container.addChild(this._input);
    this._container.addChild(this._header);
    this._container.addChild(this._calendar);

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
    var r = this._layout.pixelRatio,
        inputBgHeight = Math.round(60 * r),
        w = this._layout.width;

    this._inputBackground.clear();
    this._inputBackground.beginFill(0xefefef);
    this._inputBackground.drawRect(0,0,w,inputBgHeight);
    this._inputBackground.beginFill(0xcccccc);
    this._inputBackground.drawRect(0,inputBgHeight-r,w,r);
    this._inputBackground.endFill();

    this._input.x = Math.round(10 * r);
    this._input.y = Math.round((inputBgHeight - this._input.height) / 2);

    this._header.y = inputBgHeight;

    this._calendar.y = Math.round(this._header.y + this._header.height);
};

/**
 * Enable
 */
App.SelectTimeScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
    this._pane.enable();

    this._registerEventListener();
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._unRegisterEventListener();

    this._input.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.SelectTimeScreen.prototype._registerEventListener = function _registerEventListener()
{
    var EventType = App.EventType;
    this._input.addEventListener(EventType.FOCUS,this,this._onInputFocus);
    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.SelectTimeScreen.prototype._unRegisterEventListener = function _unRegisterEventListener()
{
    var EventType = App.EventType;
    this._input.removeEventListener(EventType.FOCUS,this,this._onInputFocus);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * On input focus
 * @private
 */
App.SelectTimeScreen.prototype._onInputFocus = function _onInputFocus()
{
    this._inputFocused = true;
};

/**
 * On input blur
 * @private
 */
App.SelectTimeScreen.prototype._onInputBlur = function _onInputBlur()
{
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
