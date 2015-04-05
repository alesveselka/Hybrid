/**
 * @class CurrencyScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CurrencyScreen = function CurrencyScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        h = layout.contentHeight,
        w = layout.width,
        r = layout.pixelRatio,
        buttonOptions = {
            width:w,
            height:Math.round(50 * r),
            pixelRatio:r,
            skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,
            symbolLabelStyle:FontStyle.get(18,FontStyle.BLUE)
        };

    this._model = App.ModelLocator.getProxy(App.ModelName.CURRENCY_SYMBOLS);

    this._interactiveButton = null;
    this._buttonPool = new App.ObjectPool(App.CurrencyButton,4,buttonOptions);
    this._buttonList = new App.VirtualList(this._buttonPool,App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false));
    this._pane.setContent(this._buttonList);

    this._initialized = false;
};

App.CurrencyScreen.prototype = Object.create(App.Screen.prototype);

/**
 * Enable
 */
App.CurrencyScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.CurrencyScreen.prototype.disable = function disable()
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
App.CurrencyScreen.prototype.update = function update(data,mode)
{
    if (this._initialized)
    {
        this._pane.resetScroll();
        this._buttonList.reset();
    }
    else
    {
        this._initialized = true;

        this._buttonList.update(this._model.copySource());
        this._pane.resize();
    }
};

/**
 * Click handler
 * @private
 */
App.CurrencyScreen.prototype._onClick = function _onClick()
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (button) button.onClick();
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CurrencyScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    if (action === App.HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,
            App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK)
        );
    }
};
