/**
 * @class AccountScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var AccountButton = App.AccountButton,
        FontStyle = App.FontStyle,
        nameStyle = FontStyle.get(24,FontStyle.BLUE),
        detailStyle = FontStyle.get(12,FontStyle.GREY_DARKER),
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight,
        i = 0,
        l = this._model.length(),
        itemHeight = Math.round(70 * r),
        button = null;

    //TODO when there is nothing set up at beginning yet, add messages to guide user how to set things up

    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,h);

    //TODO move this to 'update' method
    for (;i<l;i++)
    {
        button = new AccountButton(this._model.getItemAt(i),w,itemHeight,r,nameStyle,detailStyle);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,h,r,false);
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
 * Click handler
 * @private
 */
App.AccountScreen.prototype._onClick = function _onClick()
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData()),
        HeaderAction = App.HeaderAction;

    if (button)
    {
        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,{
                screenName:App.ScreenName.CATEGORY,
                screenMode:App.ScreenMode.SELECT,
                updateData:button.getModel().categories,
                headerLeftAction:HeaderAction.CANCEL,
                headerRightAction:HeaderAction.NONE,//TODO add back(arrow) button?
                headerName:"Select Category"//TODO remove hard-coded value
            }
        );
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AccountScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction;

    if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,{
                screenName:App.ScreenName.ADD_TRANSACTION,
                screenMode:App.ScreenMode.ADD,
                updateData:App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).getCurrent(),
                headerLeftAction:HeaderAction.CANCEL,
                headerRightAction:HeaderAction.CONFIRM,
                headerName:"Add Transaction"//TODO remove hard-coded value
            }
        );
    }
};
