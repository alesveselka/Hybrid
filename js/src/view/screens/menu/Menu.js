/**
 * @class Menu
 * @param {Object} layout
 * @constructor
 */
App.Menu = function Menu(layout)
{
    App.Screen.call(this,null,layout);

    var MenuItem = App.MenuItem,
        ScreenName = App.ScreenName,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        itemLabelStyle = FontStyle.get(20,FontStyle.WHITE),
        itemOptions = {
            width:w,
            height:Math.round(40 * r),
            pixelRatio:r,
            style:itemLabelStyle
        };

    this._addTransactionItem = new MenuItem("Add Transaction","transactions",ScreenName.ADD_TRANSACTION,{width:w,height:Math.round(50*r),pixelRatio:r,style:itemLabelStyle});
    this._accountsItem = new MenuItem("Accounts","account",ScreenName.ACCOUNT,itemOptions);
    this._reportItem = new MenuItem("Report","chart",ScreenName.REPORT,itemOptions);
    this._budgetItem = new MenuItem("Budgets","budget",ScreenName.EDIT_CATEGORY,itemOptions);
    this._transactionsItem = new MenuItem("Transactions","transactions",ScreenName.TRANSACTIONS,itemOptions);
    this._currenciesItem = new MenuItem("Currencies","currencies",-1,itemOptions);
    this._settignsItem = new MenuItem("Settings","settings-app",-1,itemOptions);
    this._container = new PIXI.Graphics();
    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._background = new PIXI.Graphics();
    this._items = [];

    this._render();

    this.addChild(this._background);
    this._items.push(this._container.addChild(this._addTransactionItem));
    this._items.push(this._container.addChild(this._accountsItem));
    this._items.push(this._container.addChild(this._reportItem));
    this._items.push(this._container.addChild(this._budgetItem));
    this._items.push(this._container.addChild(this._transactionsItem));
    this._items.push(this._container.addChild(this._currenciesItem));
    this._items.push(this._container.addChild(this._settignsItem));
    this._pane.setContent(this._container);
    this.addChild(this._pane);
};

App.Menu.prototype = Object.create(App.Screen.prototype);
App.Menu.prototype.constructor = App.Menu;

/**
 * Render
 * @private
 */
App.Menu.prototype._render = function _render()
{
    var r = this._layout.pixelRatio,
        smallGap = Math.round(2 * r),
        bigGap = Math.round(25 * r),
        GraphicUtils = App.GraphicUtils,
        bgColor = App.ColorTheme.BLUE_DARK;

    this._accountsItem.y = this._addTransactionItem.boundingBox.height + bigGap;
    this._reportItem.y = this._accountsItem.y + this._accountsItem.boundingBox.height + smallGap;
    this._budgetItem.y = this._reportItem.y + this._reportItem.boundingBox.height + smallGap;
    this._transactionsItem.y = this._budgetItem.y + this._budgetItem.boundingBox.height + smallGap;
    this._currenciesItem.y = this._transactionsItem.y + this._transactionsItem.boundingBox.height + bigGap;
    this._settignsItem.y = this._currenciesItem.y + this._currenciesItem.boundingBox.height + smallGap;

    GraphicUtils.drawRect(this._container,bgColor,1,0,0,this._layout.width,this._settignsItem.y+this._settignsItem.boundingBox.height);
    GraphicUtils.drawRect(this._background,bgColor,1,0,0,this._layout.width,this._layout.contentHeight);
};

/**
 * Enable
 */
App.Menu.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.Menu.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Click handler
 * @private
 */
App.Menu.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var ScreenName = App.ScreenName,
        ScreenTitle = App.ScreenTitle,
        HeaderAction = App.HeaderAction,
        item = this._getItemByPosition(this.stage.getTouchData().getLocalPosition(this._container).y),
        screenName = item ? item.getScreenName() : ScreenName.BACK,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(screenName,0,null,HeaderAction.MENU,HeaderAction.ADD_TRANSACTION);

    switch (screenName)
    {
        case ScreenName.ADD_TRANSACTION:
            App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
                type:App.EventType.CREATE,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData.update()
            });
            break;

        case ScreenName.ACCOUNT:
            changeScreenData.screenMode = App.ScreenMode.EDIT;
            changeScreenData.headerName = ScreenTitle.ACCOUNTS;
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;

        case ScreenName.REPORT:
            changeScreenData.headerName = ScreenTitle.REPORT;
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;

        case ScreenName.TRANSACTIONS:
            changeScreenData.headerName = ScreenTitle.TRANSACTIONS;
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;
    }
};

/**
 * Return item by position passed in
 * @param {number} position
 * @return {MenuItem}
 * @private
 */
App.Menu.prototype._getItemByPosition = function _getItemByPosition(position)
{
    var i = 0,
        l = this._items.length,
        item = null;

    for (;i<l;)
    {
        item = this._items[i++];
        if (position >= item.y && position < item.y + item.boundingBox.height) return item;
    }

    return null;
};
