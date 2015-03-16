/**
 * @class AccountScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        h = layout.contentHeight;

    this._model = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS);

    this._interactiveButton = null;
    this._buttonList = new App.TileList(App.Direction.Y,h);
    this._addNewButton = new App.AddNewButton("ADD ACCOUNT",FontStyle.get(16,FontStyle.GREY_DARK),App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_60,r);
    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,h,r,false);

    this._pane.setContent(this._buttonList);
    this.addChild(this._pane);
};

App.AccountScreen.prototype = Object.create(App.Screen.prototype);
App.AccountScreen.prototype.constructor = App.AccountScreen;

/**
 * Enable
 */
App.AccountScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.AccountScreen.prototype.disable = function disable()
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
App.AccountScreen.prototype.update = function update(data,mode)
{
    this._buttonList.remove(this._addNewButton);

    var buttonPool = App.ViewLocator.getViewSegment(App.ViewName.ACCOUNT_BUTTON_POOL),
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    for (i=0,l=this._model.length();i<l;)
    {
        button = buttonPool.allocate();
        button.setModel(this._model.getItemAt(i++),mode);
        this._buttonList.add(button);
    }

    this._buttonList.add(this._addNewButton);
    this._buttonList.updateLayout(true);

    this._pane.resize();

    this._mode = mode;
    this._swipeEnabled = mode === App.ScreenMode.EDIT;
};

/**
 * On tween complete
 * @private
 */
App.AccountScreen.prototype._onTweenComplete = function _onTweenComplete()
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
App.AccountScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button && !(button instanceof App.AddNewButton))
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
App.AccountScreen.prototype._swipeEnd = function _swipeEnd()
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
App.AccountScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    if (this._mode === App.ScreenMode.EDIT)
    {
        var i = 0,
            l = this._buttonList.length - 1,// last button is 'AddNewButton'
            button = null;

        for (;i<l;)
        {
            button = this._buttonList.getItemAt(i++);
            if (button !== this._interactiveButton) button.close(immediate);
        }
    }
};

/**
 * Click handler
 * @private
 */
App.AccountScreen.prototype._onClick = function _onClick()
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button)
    {
        var EventType = App.EventType,
            changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.EDIT);

        if (button instanceof App.AddNewButton)
        {
            changeScreenData.headerName = App.ScreenTitle.ADD_ACCOUNT;

            App.Controller.dispatchEvent(EventType.CHANGE_ACCOUNT,{
                type:EventType.CREATE,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
        else
        {
            var HeaderAction = App.HeaderAction;

            changeScreenData.update(
                App.ScreenName.CATEGORY,
                this._mode,
                button.getModel(),
                HeaderAction.MENU,
                HeaderAction.ADD_TRANSACTION,
                App.ScreenTitle.CATEGORIES
            );

            if (this._mode === App.ScreenMode.SELECT)
            {
                changeScreenData.headerLeftAction = HeaderAction.CANCEL;
                changeScreenData.headerRightAction = HeaderAction.NONE;
                changeScreenData.headerName = App.ScreenTitle.SELECT_CATEGORY;
            }

            App.Controller.dispatchEvent(EventType.CHANGE_SCREEN,changeScreenData);
        }
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AccountScreen.prototype._onHeaderClick = function _onHeaderClick(action)
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
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.MENU,0,null,HeaderAction.NONE,HeaderAction.CANCEL,App.ScreenTitle.MENU));
    }
    else if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.BACK));
    }
};
