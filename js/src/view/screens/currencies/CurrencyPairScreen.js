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
        h = layout.contentHeight;

    this._model = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS);
    this._initialized = false;

    this._interactiveButton = null;
    this._buttonList = new App.TileList(App.Direction.Y,h);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,h,layout.pixelRatio,false));
    this._pane.setContent(this._buttonList);

    this._swipeEnabled = true;
};

App.CurrencyPairScreen.prototype = Object.create(App.Screen.prototype);
App.CurrencyPairScreen.prototype.constructor = App.CurrencyPairScreen;

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
    var i = 0,
        l = this._buttonList.length;

    if (this._initialized)
    {
        for (;i<l;) this._buttonList.getItemAt(i++).update();
    }
    else
    {
        var CurrencyPairButton = App.CurrencyPairButton,
            FontStyle = App.FontStyle,
            r = this._layout.pixelRatio,
            buttonOptions = {
                width:this._layout.width,
                height:Math.round(50 * r),
                pixelRatio:r,
                skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,
                editLabelStyle:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                pairLabelStyle:FontStyle.get(18,FontStyle.BLUE),
                rateLabelStyle:FontStyle.get(18,FontStyle.BLUE,null,FontStyle.LIGHT_CONDENSED),
                openOffset:Math.round(80 * r)
            };

        for (l=this._model.length();i<l;) this._buttonList.add(new CurrencyPairButton(this._model.getItemAt(i++),buttonOptions));

        this._initialized = true;

        this._buttonList.updateLayout();
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
        l = this._buttonList.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getItemAt(i++);
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
