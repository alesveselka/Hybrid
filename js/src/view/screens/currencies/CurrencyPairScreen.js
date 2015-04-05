/**
 * @class CurrencyPairScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CurrencyPairScreen = function CurrencyPairScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        h = layout.contentHeight - Math.round(60 * r),
        w = layout.width,
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        buttonOptions = {
            width:w,
            height:Math.round(50 * r),
            pixelRatio:r,
            skin:skin.GREY_50,
            editLabelStyle:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            pairLabelStyle:FontStyle.get(18,FontStyle.BLUE),
            rateLabelStyle:FontStyle.get(18,FontStyle.BLUE,null,FontStyle.LIGHT_CONDENSED),
            openOffset:Math.round(80 * r)
        };

    this._model = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS);

    this._interactiveButton = null;
    this._downloadButtonBackground = this.addChild(new PIXI.Sprite(skin.GREY_60));//TODO may not need this - I can use Screen BG
    this._downloadButton = this.addChild(new App.Button("Update rates from internet",{
        width:Math.round(w - 20 * r),
        height:Math.round(40 * r),
        pixelRatio:r,
        style:FontStyle.get(18,FontStyle.BLACK_LIGHT,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:App.ColorTheme.GREY_DARK
    }));
    this._buttonPool = new App.ObjectPool(App.CurrencyPairButton,4,buttonOptions);
    this._buttonList = new App.VirtualList(this._buttonPool,App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,true));
    this._pane.setContent(this._buttonList);

    this._swipeEnabled = true;
    this._initialized = false;
};

App.CurrencyPairScreen.prototype = Object.create(App.Screen.prototype);

/**
 * Render
 * @private
 */
App.CurrencyPairScreen.prototype._render = function _render()
{
    var padding = Math.round(10 * this._layout.pixelRatio),
        buttonHeight = this._downloadButton.boundingBox.height + padding * 2;

    this._downloadButton.x = padding;
    this._downloadButton.y = padding;

    this._pane.y = buttonHeight;
};

/**
 * Enable
 */
App.CurrencyPairScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.CurrencyPairScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Update
 * @param {App.Collection} data
 * @param {string} mode
 * @private
 */
App.CurrencyPairScreen.prototype.update = function update(data,mode)
{
    if (this._initialized)
    {
        this._pane.resetScroll();
        this._buttonList.reset();
    }
    else
    {
        this._initialized = true;

        this._render();

        this._buttonList.update(this._model.copySource());
        this._pane.resize();
    }
};

/**
 * On tween complete
 * @private
 */
App.CurrencyPairScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    if (this._transitionState === App.TransitionState.HIDDEN) this._closeButtons(true);
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.CurrencyPairScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button)
    {
        if (!preferScroll) this._pane.cancelScroll();

        this._interactiveButton = button;
        this._interactiveButton.swipeStart(direction);

        this._closeButtons(false);
    }
};

/**
 * Called when swipe ends
 * @private
 */
App.CurrencyPairScreen.prototype._swipeEnd = function _swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.CurrencyPairScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.CurrencyPairScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button) button.onClick(data);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CurrencyPairScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(
            App.ScreenName.MENU,
            0,
            null,
            HeaderAction.NONE,
            HeaderAction.CANCEL,
            App.ScreenTitle.MENU
        ));
    }
};
