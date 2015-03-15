/**
 * @class ReportScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.ReportScreen = function ReportScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ReportAccountButton = App.ReportAccountButton,
        ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        h = layout.contentHeight,
        r = layout.pixelRatio,
        chartSize = Math.round(h * 0.3 - 20 * r),
        listWidth = Math.round(layout.width - 20 * r),// 10pts padding on both sides
        listHeight = Math.round(h * 0.7),
        itemHeight = Math.round(40 * r),
        labelStyles = {
            accountName:FontStyle.get(20,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            accountAmount:FontStyle.get(16,FontStyle.WHITE),
            categoryName:FontStyle.get(18,FontStyle.BLUE),
            categoryPercent:FontStyle.get(16,FontStyle.GREY_DARK),
            categoryPrice:FontStyle.get(16,FontStyle.BLUE),
            subName:FontStyle.get(14,FontStyle.BLUE),
            subPercent:FontStyle.get(14,FontStyle.GREY_DARK),
            subPrice:FontStyle.get(14,FontStyle.BLUE)
        };

    this._percentField = new PIXI.Text("15 %",FontStyle.get(20,FontStyle.BLUE));//TODO set font size proportionally to chart size
    this._chart = new App.ReportChart(null,chartSize,chartSize,r);
    this._buttonList = new App.TileList(App.Direction.Y,listHeight);
    this._buttonList.add(new ReportAccountButton("Private",listWidth,itemHeight,r,labelStyles),false);
    this._buttonList.add(new ReportAccountButton("Travel",listWidth,itemHeight,r,labelStyles),false);
    this._buttonList.add(new ReportAccountButton("Business",listWidth,itemHeight,r,labelStyles),true);

    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,listWidth,listHeight,r,true);
    this._pane.setContent(this._buttonList);

    this._interactiveButton = null;
    this._layoutDirty = false;

    this._updateLayout();

    this.addChild(this._percentField);
    this.addChild(this._chart);
    this.addChild(this._pane);
};

App.ReportScreen.prototype = Object.create(App.Screen.prototype);
App.ReportScreen.prototype.constructor = App.ReportScreen;

/**
 * Enable
 */
App.ReportScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
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
 * On screen show/hide tween complete
 * @private
 */
App.ReportScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    this._chart.show();
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

    this._percentField.x = Math.round((w - this._percentField.width) / 2);
    this._percentField.y = Math.round(padding + (chartBounds.height - this._percentField.height) / 2);

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
    var pointerData = this.stage.getTouchData();

    this._interactiveButton = this._buttonList.getItemUnderPoint(pointerData);

    if (this._interactiveButton)
    {
        this._interactiveButton.onClick(pointerData);
        this._pane.cancelScroll();
        this._closeButtons();

        this._chart.highlightSegment(this._buttonList.getChildIndex(this._interactiveButton));

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
