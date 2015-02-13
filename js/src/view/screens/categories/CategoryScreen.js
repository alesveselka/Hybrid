/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var CategoryButton = App.CategoryButtonExpand,
        ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        nameLabelStyle = FontStyle.get(18,FontStyle.BLUE),
        editLabelStyle = FontStyle.get(18,FontStyle.WHITE),
        i = 0,
        l = this._model.length,
        button = null;

    this._interactiveButton = null;
    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,layout.contentHeight);

    for (;i<l;i++)
    {
//        button = new CategoryButton(this._model.getItemAt(i),layout,nameLabelStyle,editLabelStyle);
        button = new CategoryButton(this._model[i],layout,nameLabelStyle);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._buttonsInTransition = [];
    this._layoutDirty = false;

    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,layout.contentHeight,layout.pixelRatio,false);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);

    this._headerInfo.name = "Categories";
//    this._swipeEnabled = true;
};

App.CategoryScreen.prototype = Object.create(App.Screen.prototype);
App.CategoryScreen.prototype.constructor = App.CategoryScreen;

/**
 * Enable
 */
App.CategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.CategoryScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();

    //TODO also disable buttons
};

/**
 * On tick
 * @private
 */
App.CategoryScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._layoutDirty) this._updateLayout();
};

/**
 * On tween complete
 * @private
 */
App.CategoryScreen.prototype._onTweenComplete = function _onTweenComplete()
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
App.CategoryScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    if (!preferScroll) this._pane.cancelScroll();

    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this._closeButtons(false);
};

/**
 * Called when swipe ends
 * @private
 */
App.CategoryScreen.prototype._swipeEnd = function _swipeEnd()
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
App.CategoryScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttons.length,
        button = null,
        EventType = App.EventType;

    for (;i<l;)
    {
        button = this._buttons[i++];
        //if (button !== this._interactiveButton) button.close(immediate);
        if (button !== this._interactiveButton && button.isOpen()) // For ~Expand button ...
        {
            if (this._buttonsInTransition.indexOf(button) === -1)
            {
                this._buttonsInTransition.push(button);

                button.addEventListener(EventType.LAYOUT_UPDATE,this,this._onButtonLayoutUpdate);
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
App.CategoryScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        EventType = App.EventType;

    this._interactiveButton = this._buttonList.getItemUnderPoint(data);

    if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
    {
        this._buttonsInTransition.push(this._interactiveButton);

        this._interactiveButton.addEventListener(EventType.LAYOUT_UPDATE,this,this._onButtonLayoutUpdate);
        this._interactiveButton.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
    }

    this._interactiveButton.onClick(data.getLocalPosition(this));
    this._pane.cancelScroll();

    //this._closeButtons();

    //App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ACCOUNT);
};

/**
 * On button layout update
 * @private
 */
App.CategoryScreen.prototype._onButtonLayoutUpdate = function _onButtonLayoutUpdate()
{
    this._layoutDirty = true;
};

/**
 * On button transition complete
 * @param {App.ExpandButton} button
 * @private
 */
App.CategoryScreen.prototype._onButtonTransitionComplete = function _onButtonTransitionComplete(button)
{
    var i = 0,
        l = this._buttonsInTransition.length,
        EventType = App.EventType;

    button.removeEventListener(EventType.LAYOUT_UPDATE,this,this._onButtonLayoutUpdate);
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
        this._interactiveButton = null;

        this._layoutDirty = false;
        this._updateLayout();
    }
};

/**
 * Update layout
 * @private
 */
App.CategoryScreen.prototype._updateLayout = function _updateLayout()
{
    this._buttonList.updateLayout(true);
    this._pane.resize();
};
