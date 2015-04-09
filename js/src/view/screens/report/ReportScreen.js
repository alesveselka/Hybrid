/**
 * @class ReportScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.ReportScreen = function ReportScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        ObjectPool = App.ObjectPool,
        h = layout.contentHeight,
        r = layout.pixelRatio,
        chartSize = Math.round(h * 0.3 - 20 * r),
        listWidth = Math.round(layout.width - 20 * r),// 10pts padding on both sides
        listHeight = Math.round(h * 0.7),
        itemHeight = Math.round(40 * r),
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        buttonOptions = {
            width:listWidth,
            height:itemHeight,
            pixelRatio:r,
            labelStyles:{
                name:FontStyle.get(20,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                amount:FontStyle.get(16,FontStyle.WHITE)
            },
            categoryButtonPool:new ObjectPool(App.ReportCategoryButton,5,{
                width:listWidth,
                height:itemHeight,
                pixelRatio:r,
                skin:skin.NARROW_GREY_40,
                labelStyles:{
                    name:FontStyle.get(18,FontStyle.BLUE),
                    percent:FontStyle.get(16,FontStyle.GREY_DARK),
                    amount:FontStyle.get(16,FontStyle.BLUE)
                },
                subCategoryButtonPool:new ObjectPool(App.ReportSubCategoryButton,5,{
                    width:listWidth,
                    height:itemHeight,
                    pixelRatio:r,
                    skin:skin.NARROW_WHITE_40,
                    labelStyles:{
                        name:FontStyle.get(14,FontStyle.BLUE),
                        percent:FontStyle.get(14,FontStyle.GREY_DARK),
                        amount:FontStyle.get(14,FontStyle.BLUE)
                    }
                })
            })
        };

    this._model = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS);
    this._buttonPool = new ObjectPool(App.ReportAccountButton,2,buttonOptions);

    this._chart = this.addChild(new App.ReportChart(this._model,chartSize,chartSize,r));
    this._buttonList = new App.TileList(App.Direction.Y,listHeight);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,listWidth,listHeight,r,true));
    this._pane.setContent(this._buttonList);

    this._updateLayout();

    this._interactiveButton = null;
    this._layoutDirty = false;
};

App.ReportScreen.prototype = Object.create(App.Screen.prototype);

/**
 * Enable
 */
App.ReportScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.ReportScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._layoutDirty = false;

    this._pane.disable();
};

/**
 * Update
 */
App.ReportScreen.prototype.update = function update()
{
    var i = 0,
        l = this._buttonList.length,
        deletedState = App.LifeCycleState.DELETED,
        account = null,
        button = null;

    for (;i<l;i++) this._buttonPool.release(this._buttonList.removeItemAt(0));

    for (i=0,l=this._model.length();i<l;)
    {
        account = this._model.getItemAt(i++);
        if (account.lifeCycleState !== deletedState)
        {
            button = this._buttonPool.allocate();
            button.setModel(account);
            this._buttonList.add(button);
        }
    }

    this._buttonList.updateLayout(true);
    this._pane.resize();

    this._chart.update();
};

/**
 * On screen show/hide tween complete
 * @private
 */
App.ReportScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    if (this._transitionState === App.TransitionState.SHOWN)
    {
        this._chart.showSegments(this._buttonList.getItemAt(0).getModel());
    }
};

/**
 * Update layout
 * @private
 */
App.ReportScreen.prototype._updateLayout = function _updateLayout()
{
    var w = this._layout.width,
        padding = Math.round(10 * this._layout.pixelRatio),
        chartBounds = this._chart.boundingBox;

    this._chart.x = Math.round((w - chartBounds.width) / 2);
    this._chart.y = padding;

    this._pane.x = padding;
    this._pane.y = Math.round(this._layout.contentHeight * 0.3);
};

/**
 * On tick
 * @private
 */
App.ReportScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._layoutDirty)
    {
        this._layoutDirty = this._buttonsInTransition();

        this._updateListLayout(false);
    }
};

/**
 * Close opened buttons
 * @private
 */
App.ReportScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        if (button !== this._interactiveButton && button.isOpen()) button.close(immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.ReportScreen.prototype._onClick = function _onClick()
{
    var pointerData = this.stage.getTouchData(),
        categoryButton = null;

    this._interactiveButton = this._buttonList.getItemUnderPoint(pointerData);

    if (this._interactiveButton)
    {
        categoryButton = this._interactiveButton.onClick(pointerData);
        if (categoryButton)
        {
            this._chart.highlightSegment(categoryButton.getModel());
        }
        else
        {
            this._closeButtons();
            this._chart.showSegments(this._interactiveButton.getModel());
        }

        this._pane.cancelScroll();

        this._layoutDirty = true;
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.ReportScreen.prototype._onHeaderClick = function _onHeaderClick(action)
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

/**
 * Update list layout
 * @private
 */
App.ReportScreen.prototype._updateListLayout = function _updateListLayout()
{
    if (this._interactiveButton) this._interactiveButton.updateLayout();
    this._buttonList.updateLayout(true);
    this._pane.resize();
};

/**
 * Check if buttons are in transition
 * @returns {boolean}
 * @private
 */
App.ReportScreen.prototype._buttonsInTransition = function _buttonsInTransition()
{
    var i = 0,
        l = this._buttonList.children.length,
        inTransition = false;

    for (;i<l;)
    {
        if (this._buttonList.getChildAt(i++).isInTransition())
        {
            inTransition = true;
            break;
        }
    }

    return inTransition;
};
