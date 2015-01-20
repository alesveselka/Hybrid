App.TransactionScreen = function TransactionScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var TransactionButton = App.TransactionButton,
        FontStyle = App.FontStyle,
        labelStyles = {
            edit:FontStyle.get(18,"#ffffff"),
            account:FontStyle.get(14,"#50597B"),
            amount:FontStyle.get(26,"#252B44"),
            date:FontStyle.get(14,"#cccccc"),
            pending:FontStyle.get(12,"#ffffff"),
            accountPending:FontStyle.get(14,"#900000"),
            amountPending:FontStyle.get(26,"#ffffff"),
            datePending:FontStyle.get(14,"#ffffff","right")
        },
        i = 0,
        l = 200,
        button = null;

    this._interactiveButton = null;
    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,layout.height);
    //TODO create just screen*2 buttons and postpone creating the rest for later
    for (;i<l;i++)
    {
        button = new TransactionButton(i,layout,labelStyles);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,layout.width,layout.height,layout.pixelRatio);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);

    this._swipeEnabled = true;
};

App.TransactionScreen.prototype = Object.create(App.Screen.prototype);
App.TransactionScreen.prototype.constructor = App.TransactionScreen;

/**
 * Enable
 */
App.TransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.TransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.TransactionScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    this._interactiveButton = this._getButtonUnderPosition(this.stage.getTouchPosition().y);
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this._closeButtons(false);
};

/**
 * Called when swipe ends
 * @private
 */
App.TransactionScreen.prototype._swipeEnd = function _swipeEnd()
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
App.TransactionScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttons.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttons[i++];
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Find button under point passed in
 * @param {Point} position
 * @private
 */
App.TransactionScreen.prototype._getButtonUnderPosition = function _getButtonUnderPosition(position)
{
    var i = 0,
        l = this._buttons.length,
        height = 0,
        buttonY = 0,
        containerY = this.y + this._buttonList.y,
        button = null;

    for (;i<l;)
    {
        button = this._buttons[i++];
        buttonY = button.y + containerY;
        height = button.boundingBox.height;
        if (buttonY <= position && buttonY + height >= position)
        {
            return button;
        }
    }

    return null;
};
