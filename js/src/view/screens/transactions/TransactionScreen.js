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
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight,
        buttonOptions = {
            labelStyles:{
                edit:FontStyle.get(18,FontStyle.WHITE),
                account:FontStyle.get(14,FontStyle.BLUE_LIGHT),
                amount:FontStyle.get(26,FontStyle.BLUE_DARK),
                date:FontStyle.get(14,FontStyle.GREY_DARK),
                pending:FontStyle.get(12,FontStyle.WHITE),
                accountPending:FontStyle.get(14,FontStyle.RED_DARK),
                amountPending:FontStyle.get(26,FontStyle.WHITE),
                datePending:FontStyle.get(14,FontStyle.WHITE,"right")
            },
            width:w,
            height:Math.round(70*r),
            pixelRatio:r
        },
        i = 0,
        l = 50,
        transactions = new Array(l);

    this._interactiveButton = null;

    //TODO load real data later ...
    for (;i<l;i++) transactions[i] = {amount:100+i,account:"Personal",category:"Cinema / Entertainment",date:"10/21/2013",iconName:"transactions",pending:(i % 23) === 0};

    this._buttonList = new App.VirtualList(transactions,App.TransactionButton,buttonOptions,App.Direction.Y,w,h,r);
    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);
};

App.TransactionScreen.prototype = Object.create(App.Screen.prototype);
App.TransactionScreen.prototype.constructor = App.TransactionScreen;

/**
 * Enable
 */
App.TransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._buttonList.reset();
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
