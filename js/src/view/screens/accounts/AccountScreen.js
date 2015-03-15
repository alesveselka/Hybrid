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

    this._interactiveButton = null;

    this._buttonList = new App.TileList(App.Direction.Y,h);
    this._addNewButton = new App.AddNewButton("ADD CATEGORY",FontStyle.get(16,FontStyle.GREY_DARK),App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_60,r);
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

    //this._layoutDirty = false;

    this._pane.disable();
};

/**
 * Update
 * @param {App.Account} data
 * @param {string} mode
 * @private
 */
App.AccountScreen.prototype.update = function update(data,mode)
{
    /*this._model = data;

    this._buttonList.remove(this._addNewButton);

    var ScreenMode = App.ScreenMode,
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        expandButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EXPAND_POOL),
        editButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EDIT_POOL),
        buttonPool = this._mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool,
        categories = this._model.categories,
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    i = 0;
    l = categories.length;

    buttonPool = mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool;

    for (;i<l;)
    {
        button = buttonPool.allocate();
        button.update(categories[i++],mode);
        this._buttonList.add(button,false);
    }

    this._buttonList.add(this._addNewButton);

    this._updateLayout();

    this._mode = mode;
    this._swipeEnabled = mode === ScreenMode.EDIT;*/
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
        var ScreenMode = App.ScreenMode,
            HeaderAction = App.HeaderAction,
            changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.CATEGORY,this._mode,button.getModel());

        if (this._mode === ScreenMode.SELECT)
        {
            changeScreenData.headerRightAction = HeaderAction.NONE;
            changeScreenData.headerName = App.ScreenTitle.SELECT_CATEGORY;
        }
        else
        {
            changeScreenData.headerLeftAction = HeaderAction.MENU;
            changeScreenData.headerRightAction = HeaderAction.ADD_TRANSACTION;
            changeScreenData.headerName = App.ScreenTitle.CATEGORIES;
        }

        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
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
