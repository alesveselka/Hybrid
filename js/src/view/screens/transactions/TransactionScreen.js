/**
 * @class TransactionScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.TransactionScreen = function TransactionScreen(layout)
{
    App.Screen.call(this,null,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight;

    this._interactiveButton = null;
    this._buttonList = new App.VirtualList(App.ViewLocator.getViewSegment(App.ViewName.TRANSACTION_BUTTON_POOL),App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false));
    this._pane.setContent(this._buttonList);
};

App.TransactionScreen.prototype = Object.create(App.Screen.prototype);
App.TransactionScreen.prototype.constructor = App.TransactionScreen;

/**
 * Enable
 */
App.TransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();

    this._swipeEnabled = true;
};

/**
 * Disable
 */
App.TransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();

    this._swipeEnabled = false;
};

/**
 * Update
 * @private
 */
App.TransactionScreen.prototype.update = function update(model)
{
    if (this._model) this._model.length = 0;

    this._model = model;

    this._buttonList.update(model);
    this._pane.resize();
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.TransactionScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this._closeButtons(false);
};

/**
 * Called when swipe ends
 * @private
 */
App.TransactionScreen.prototype._swipeEnd = function _swipeEnd()
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
App.TransactionScreen.prototype._closeButtons = function _closeButtons(immediate)
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
 * On Header click
 * @param {number} action
 * @private
 */
App.TransactionScreen.prototype._onHeaderClick = function _onHeaderClick(action)
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
        changeScreenData.update(App.ScreenName.MENU,0,null,HeaderAction.NONE,HeaderAction.CANCEL,App.ScreenTitle.MENU);
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
};
