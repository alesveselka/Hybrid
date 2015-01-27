/**
 * @class ReportScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.ReportScreen = function ReportScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var ReportAccountButton = App.ReportAccountButton,
        ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        w = layout.width,
        h = layout.height,
        r = layout.pixelRatio,
        chartSize = Math.round(h * 0.3 - 20 * r),
        listWidth = Math.round(w - 20 * r),// 10pts padding on both sides
        listHeight = Math.round(h * 0.7),
        itemHeight = Math.round(40 * r),
        labelStyles = {
            accountName:FontStyle.get(22,FontStyle.WHITE),
            accountAmount:FontStyle.get(16,FontStyle.WHITE),
            categoryName:FontStyle.get(18,FontStyle.BLUE),
            categoryPercent:FontStyle.get(16,FontStyle.SHADE_DARK),
            categoryPrice:FontStyle.get(16,FontStyle.BLUE),
            subName:FontStyle.get(14,FontStyle.BLUE),
            subPercent:FontStyle.get(14,FontStyle.SHADE_DARK),
            subPrice:FontStyle.get(14,FontStyle.BLUE)
        };

    this._chart = new App.ReportChart(null,chartSize,chartSize,r);

    this._buttonList = new App.TileList(App.Direction.Y,listHeight);
    this._buttonList.add(new ReportAccountButton("Private",listWidth,itemHeight,r,labelStyles),false);
    this._buttonList.add(new ReportAccountButton("Travel",listWidth,itemHeight,r,labelStyles),false);
    this._buttonList.add(new ReportAccountButton("Business",listWidth,itemHeight,r,labelStyles),true);

    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,listWidth,listHeight,r);
    this._pane.setContent(this._buttonList);

    this._interactiveButton = null;
    this._layoutDirty = false;

    this._updateLayout();

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
    var padding = Math.round(10 * this._layout.pixelRatio);

    this._chart.x = Math.round((this._layout.width - this._chart.boundingBox.width) / 2);
    this._chart.y = padding;

    this._pane.x = padding;
    this._pane.y = Math.round(this._layout.height * 0.3);
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

    this._interactiveButton = this._getButtonUnderPosition(pointerData.getLocalPosition(this._pane).y);

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

/**
 * Find button under point passed in
 * @param {number} position
 * @private
 */
App.ReportScreen.prototype._getButtonUnderPosition = function _getButtonUnderPosition(position)
{
    var i = 0,
        l = this._buttonList.children.length,
        height = 0,
        buttonY = 0,
        containerY = this.y + this._buttonList.y,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        buttonY = button.y + containerY;
        height = button.boundingBox.height;
        if (buttonY <= position && buttonY + height > position)
        {
            return button;
        }
    }

    return null;
};
