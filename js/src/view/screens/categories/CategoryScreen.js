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

    var CategoryButton = App.CategoryButtonEdit,
        font = Math.round(18 * layout.pixelRatio)+"px HelveticaNeueCond",
        nameLabelStyle = {font:font,fill:"#394264"},
        editLabelStyle = {font:font,fill:"#ffffff"},
        i = 0,
        l = this._model.length(),
        button = null;

    this._interactiveButton = null;
    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,layout.height);

    for (;i<l;i++)
    {
        button = new CategoryButton(this._model.getItemAt(i),layout,nameLabelStyle,editLabelStyle);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,layout.width,layout.height,layout.pixelRatio);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);

    this._swipeEnabled = true;
    this._preferScroll = false;
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
 * On tween complete
 * @private
 */
App.CategoryScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    if (this._transitionState === App.TransitionState.HIDDEN) this._closeOpenedButtons(true);
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

    this._interactiveButton = this._getButtonUnderPoint(this.stage.getTouchPosition());
    this._interactiveButton.swipeStart(direction);

    this._closeOpenedButtons(false);
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
App.CategoryScreen.prototype._closeOpenedButtons = function _closeOpenedButtons(immediate)
{
    var i = 0,
        l = this._buttons.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttons[i++];
        if (button !== this._interactiveButton) button.closeEditButton(immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.CategoryScreen.prototype._onClick = function _onClick()
{
    //this._getButtonUnderPoint(this._getPointerPosition()).open();

    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ACCOUNT);
};

/**
 * Find button under point passed in
 * @param {Point} point
 * @private
 */
App.CategoryScreen.prototype._getButtonUnderPoint = function _getButtonUnderPoint(point)
{
    //TODO also check 'x'?
    var i = 0,
        l = this._buttons.length,
        height = this._buttons[0].boundingBox.height,
        y = point.y,
        buttonY = 0,
        containerY = this._buttonList.y;

    for (;i<l;i++)
    {
        buttonY = this._buttons[i].y + containerY;
        if (buttonY <= y && buttonY + height >= y)
        {
            return this._buttons[i];
        }
    }

    return null;
};

/**
 * Destroy
 */
App.CategoryScreen.prototype.destroy = function destroy()
{
    App.Screen.prototype.destroy.call(this);

    this.disable();

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    /*var i = 0, l = this._buttons.length, button = null;
    for (;i<l;)
    {
        button = this._buttons[i++];
        if (this._buttonList.contains(button)) this._buttonList.removeChild(button);
        button.destroy();
    }
    this._buttonList.destroy();
    this._buttonList = null;*/

    this._buttons.length = 0;
    this._buttons = null;
};
