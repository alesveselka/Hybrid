App.Menu = function Menu(layout)
{
    App.Screen.call(this,null,layout);

    var MenuItem = App.MenuItem,
        ScreenName = App.ScreenName,
        HeaderAction = App.HeaderAction,
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

    this._headerInfo.leftAction = HeaderAction.NONE;
    this._headerInfo.rightAction = HeaderAction.CANCEL;
    this._headerInfo.name = "Menu";
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

    var y = this.stage.getTouchData().getLocalPosition(this._container).y,
        i = 0,
        l = this._items.length,
        item = null;

    for (;i<l;)
    {
        item = this._items[i++];
        if (y >= item.y && y < item.y + item.boundingBox.height)
        {
            if (item.getScreenId() > -1)
            {
                App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,item.getScreenId());
                break;
            }
        }
    }
};
