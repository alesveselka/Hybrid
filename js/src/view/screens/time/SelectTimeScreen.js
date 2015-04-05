/**
 * @class SelectTimeScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.SelectTimeScreen = function SelectTimeScreen(layout)
{
    App.InputScrollScreen.call(this,layout);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();//TODO do I need BG? I can use BG below whole screen ...
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(w,r);

    //TODO enable 'swiping' for interactively changing calendar's months

    this._render();

    this._container.addChild(this._inputBackground);
    this._container.addChild(this._header);
    this._container.addChild(this._calendar);
    this._container.addChild(this._input);
    this._pane.setContent(this._container);
    this.addChild(this._pane);
};

App.SelectTimeScreen.prototype = Object.create(App.InputScrollScreen.prototype);

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
};

/**
 * Enable
 */
App.SelectTimeScreen.prototype.enable = function enable()
{
    App.InputScrollScreen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    this.resetScroll();

    App.InputScrollScreen.prototype.disable.call(this);

    this._input.disable();
    this._pane.disable();
};

/**
 * Update
 * @param {Date} date
 * @param {string} mode
 * @private
 */
App.SelectTimeScreen.prototype.update = function update(date,mode)
{
    this._input.setValue(App.DateUtils.getMilitaryTime(date));

    this._calendar.update(date);
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.SelectTimeScreen.prototype._registerEventListeners = function _registerEventListener(level)
{
    App.Screen.prototype._registerEventListeners.call(this,level);

    if (level === App.EventLevel.LEVEL_2)
    {
        var EventType = App.EventType;

        this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

        this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
    }
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.SelectTimeScreen.prototype._unRegisterEventListeners = function _unRegisterEventListener(level)
{
    App.Screen.prototype._unRegisterEventListeners.call(this,level);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Click handler
 * @private
 */
App.SelectTimeScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        pointerData = this.stage.getTouchData(),
        position = pointerData.getLocalPosition(this._container).y;

    if (this._input.hitTest(position))
    {
        this._scrollInput = this._input;
        this._focusInput(this._input.y + this._container.y > 0);
    }
    else
    {
        if (inputFocused) this._scrollInput.blur();
        else this._calendar.onClick();
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.SelectTimeScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    if (this._scrollState === App.TransitionState.SHOWN && this._scrollInput) this._scrollInput.blur();

    if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else if (action === HeaderAction.CONFIRM)
    {
        changeScreenData.updateBackScreen = true;

        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CHANGE,
            date:this._calendar.getSelectedDate(),
            time:this._input.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
};
