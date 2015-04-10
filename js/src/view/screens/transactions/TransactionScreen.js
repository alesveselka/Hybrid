/**
 * @class TransactionScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.TransactionScreen = function TransactionScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight,
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        buttonOptions = {
            labelStyles:{
                edit:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                accountIncome:FontStyle.get(14,FontStyle.BLUE_LIGHT,null,FontStyle.LIGHT_CONDENSED),
                amountIncome:FontStyle.get(26,FontStyle.BLUE),
                currencyIncome:FontStyle.get(16,FontStyle.BLUE_DARK,null,FontStyle.LIGHT_CONDENSED),
                date:FontStyle.get(14,FontStyle.GREY_DARK),
                pending:FontStyle.get(12,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                accountPending:FontStyle.get(14,FontStyle.RED_DARK),
                amountPending:FontStyle.get(26,FontStyle.WHITE),
                currencyPending:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                datePending:FontStyle.get(14,FontStyle.WHITE,"right",FontStyle.LIGHT_CONDENSED)
            },
            greySkin:skin.GREY_70,
            redSkin:skin.RED_70,
            width:w,
            height:Math.round(70 * r),
            pixelRatio:r,
            openOffset:Math.round(120 * r)
        };

    this._interactiveButton = null;
    this._buttonPool = new App.ObjectPool(App.TransactionButton,4,buttonOptions);
    this._buttonList = new App.VirtualList(this._buttonPool,App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false));
    this._pane.setContent(this._buttonList);
};

App.TransactionScreen.prototype = Object.create(App.Screen.prototype);

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
 * Click handler
 * @private
 */
App.TransactionScreen.prototype._onClick = function _onClick()
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
