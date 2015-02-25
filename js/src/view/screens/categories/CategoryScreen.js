/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(layout)
{
    App.Screen.call(this,null,layout,0.4);

    this._interactiveButton = null;
    this._buttonsInTransition = [];
    this._layoutDirty = false;

    this._buttonList = new App.TileList(App.Direction.Y,layout.contentHeight);
    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,layout.width,layout.contentHeight,layout.pixelRatio,false);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);
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

    //TODO do I need disable buttons? They'll be updated on show anyway
    /*var i = 0,
        l = this._buttonList.length;

    for (;i<l;) this._buttonList.getItemAt(i++).disable();*/
};

/**
 * Update
 * @param {Array.<Category>} data
 * @param {string} mode
 * @private
 */
App.CategoryScreen.prototype.update = function update(data,mode)
{
    this._model = data;

    var ScreenMode = App.ScreenMode,
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        expandButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EXPAND_POOL),
        editButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EDIT_POOL),
        buttonPool = this._mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool,
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    i = 0;
    l = this._model.length;

    buttonPool = mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool;

    for (;i<l;)
    {
        button = buttonPool.allocate();
        button.update(this._model[i++],mode);
        this._buttonList.add(button,false);
    }

    this._updateLayout();

    this._mode = mode;
    this._swipeEnabled = mode === ScreenMode.EDIT;
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
        l = this._buttonList.length,
        button = null,
        ScreenMode = App.ScreenMode,
        EventType = App.EventType;

    if (this._mode === ScreenMode.SELECT)
    {
        for (;i<l;)
        {
            button = this._buttonList.getItemAt(i++);
            if (button !== this._interactiveButton && button.isOpen())
            {
                if (this._buttonsInTransition.indexOf(button) === -1)
                {
                    this._buttonsInTransition.push(button);
                    button.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

                    this._layoutDirty = true;
                }

                button.close(immediate);
            }
        }
    }
    else if (this._mode === ScreenMode.EDIT)
    {
        for (;i<l;)
        {
            button = this._buttonList.getItemAt(i++);
            if (button !== this._interactiveButton) button.close(immediate);
        }
    }
};

/**
 * Click handler
 * @private
 */
App.CategoryScreen.prototype._onClick = function _onClick()
{
    if (this._mode === App.ScreenMode.SELECT)
    {
        var data = this.stage.getTouchData(),
            EventType = App.EventType;

        this._interactiveButton = this._buttonList.getItemUnderPoint(data);

        if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
        {
            this._buttonsInTransition.push(this._interactiveButton);
            this._interactiveButton.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

            this._layoutDirty = true;
        }

        this._interactiveButton.onClick(data);
        this._pane.cancelScroll();
    }

//    if (!this._swipeEnabled) this._closeButtons(false);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction;

    if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ChangeScreenData.update(0,App.ScreenMode.ADD,null,0,0,App.ScreenTitle.ADD_TRANSACTION));
    }
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
