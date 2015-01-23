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
        ScrollPolicy = App.ScrollPolicy;

    this._chart = new PIXI.Graphics();
    App.GraphicUtils.drawArc(this._chart,new PIXI.Point(150,150),200,200,34,0,3.6*66,40,0x000000,.5,10,0xff0000,1);

    this._buttonList = new App.TileList(App.Direction.Y,layout.height);
    this._buttonList.add(new ReportAccountButton("Private",layout.width,Math.round(40*layout.pixelRatio),layout.pixelRatio),false);
    this._buttonList.add(new ReportAccountButton("Travel",layout.width,Math.round(40*layout.pixelRatio),layout.pixelRatio),false);
    this._buttonList.add(new ReportAccountButton("Business",layout.width,Math.round(40*layout.pixelRatio),layout.pixelRatio),true);

    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,layout.height,layout.pixelRatio);
    this._pane.setContent(this._buttonList);

    this._interactiveButton = null;
    this._buttonsInTransition = [];
    this._layoutDirty = false;

    //this.addChild(this._chart);
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

    this._unRegisterButtonEventListeners();
};

/**
 * UnRegister button event listeners
 * @private
 */
App.ReportScreen.prototype._unRegisterButtonEventListeners = function _unRegisterButtonEventListeners()
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null,
        EventType = App.EventType;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        button.removeEventListener(EventType.START,this,this._onButtonTransitionStart);
        button.removeEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
        button.disable();
    }
};

/**
 * On tick
 * @private
 */
App.ReportScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._layoutDirty) this._updateLayout(false);
};

/**
 * Close opened buttons
 * @private
 */
App.ReportScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null,
        EventType = App.EventType;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        if (button !== this._interactiveButton && button.isOpen())
        {
            if (this._buttonsInTransition.indexOf(button) === -1)
            {
                this._buttonsInTransition.push(button);

                button.addEventListener(EventType.START,this,this._onButtonTransitionStart);
                button.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
            }

            button.close(immediate);
        }
    }
};

/**
 * Click handler
 * @private
 */
App.ReportScreen.prototype._onClick = function _onClick()
{
    var pointerData = this.stage.getTouchData(),
        EventType = App.EventType;

    this._interactiveButton = this._getButtonUnderPosition(pointerData.getLocalPosition(this).y);

    if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
    {
        this._buttonsInTransition.push(this._interactiveButton);

        this._interactiveButton.addEventListener(EventType.START,this,this._onButtonTransitionStart);
        this._interactiveButton.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
    }

    this._interactiveButton.onClick(pointerData);
    this._pane.cancelScroll();

    this._closeButtons();
};

/**
 * On button transition start
 * @private
 */
App.ReportScreen.prototype._onButtonTransitionStart = function _onButtonTransitionStart()
{
    this._layoutDirty = true;
};

/**
 * On button transition complete
 * @param {App.ExpandButton} button
 * @private
 */
App.ReportScreen.prototype._onButtonTransitionComplete = function _onButtonTransitionComplete(button)
{
    var i = 0,
        l = this._buttonsInTransition.length,
        EventType = App.EventType;

    button.removeEventListener(EventType.START,this,this._onButtonTransitionStart);
    button.removeEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

    for (;i<l;i++)
    {
        if (button === this._buttonsInTransition[i])
        {
            this._buttonsInTransition.splice(i,1);
            break;
        }
    }

    if (this._buttonsInTransition.length === 0)
    {
        this._layoutDirty = false;
        this._updateLayout(true);

        this._interactiveButton = null;
    }
};

/**
 * Update layout
 * @param {boolean} [complete=false]
 * @private
 */
App.ReportScreen.prototype._updateLayout = function _updateLayout(complete)
{
    if (this._interactiveButton) this._interactiveButton.updateLayout(complete);
    this._buttonList.updateLayout(true);
    this._pane.resize();
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
        if (buttonY <= position && buttonY + height >= position)
        {
            return button;
        }
    }

    return null;
};
