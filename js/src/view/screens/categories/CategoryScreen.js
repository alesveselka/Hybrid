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

    var i = 0,
        l = this._model.length(),
        CategoryButton = App.CategoryButton,
        button = null;

    this._swipeButton = null;
    this._buttons = new Array(l);
    this._buttonContainer = new PIXI.DisplayObjectContainer();

    for (;i<30;i++)
    {
        button = new CategoryButton(this._model.getItemAt(0),this._layout,i);
        this._buttons[i] = button;
        this._buttonContainer.addChild(button);
    }

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio);
    this._pane.setContent(this._buttonContainer);

//    this._addButton =

    this._updateLayout();

    this.addChild(this._pane);

    this._swipeEnabled = true;
    this._preferScroll = true;
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
    //TODO also implement 'disable'
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
 * @private
 */
App.CategoryScreen.prototype._swipeStart = function _swipeStart(preferScroll)
{
    if (!preferScroll) this._pane.cancelScroll();

    this._swipeButton = this._getButtonUnderPoint(this._getPointerPosition());

    this._closeOpenedButtons(false);
};

/**
 * Called when swipe ends
 * @param {string} direction
 * @private
 */
App.CategoryScreen.prototype._swipeEnd = function _swipeEnd(direction)
{
    if (this._swipeButton)
    {
        this._swipeButton.snap(direction);
        this._swipeButton = null;
    }
};

/**
 * Swipe handler
 * @param {string} direction
 * @private
 */
App.CategoryScreen.prototype._swipe = function _swipe(direction)
{
    if (this._swipeButton && direction === App.Direction.LEFT) this._swipeButton.swipe(this._getPointerPosition().x);
};

/**
 * Close opened buttons
 * @private
 */
App.CategoryScreen.prototype._closeOpenedButtons = function _closeOpenedButtons(immediate)
{
    var i = 0,
        l = this._buttons.length,
        button = null,
        rightDirection = App.Direction.RIGHT;

    for (;i<l;)
    {
        button = this._buttons[i++];
        if (button.isEditButtonShown() && button !== this._swipeButton) button.snap(rightDirection,immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.CategoryScreen.prototype._onClick = function _onClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ACCOUNT);
};

/**
 * Find button under point passed in
 * @param {Point} point
 * @private
 */
App.CategoryScreen.prototype._getButtonUnderPoint = function _getButtonUnderPoint(point)
{
    var i = 0,
        l = this._buttons.length,
        height = this._buttons[0].boundingBox.height,
        y = point.y,
        buttonY = 0,
        containerY = this._buttonContainer.y;

    for (;i<l;i++)
    {
        buttonY = this._buttons[i].y + containerY;
        if (buttonY < y && buttonY + height > y)
        {
            return this._buttons[i];
        }
    }

    return null;
};

/**
 * @method _updateLayout
 * @private
 */
App.CategoryScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0,
        l = this._buttons.length,
        height = this._buttons[0].boundingBox.height;

    for (;i<l;i++)
    {
        this._buttons[i].y = i * height;
    }

    this._pane.resize(this._layout.width,this._layout.height);
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

    var i = 0, l = this._buttons.length, button = null;
    for (;i<l;)
    {
        button = this._buttons[i++];
        if (this._buttonContainer.contains(button)) this._buttonContainer.removeChild(button);
        button.destroy();
    }
    this._buttonContainer = null;

    this._buttons.length = 0;
    this._buttons = null;
};
