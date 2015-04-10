/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        ObjectPool = App.ObjectPool,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight,
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        buttonOptions = {
            width:w,
            height:Math.round(50 * r),
            pixelRatio:r,
            skin:skin.GREY_50,
            addButtonSkin:skin.WHITE_40,
            nameLabelStyle:FontStyle.get(18,FontStyle.BLUE),
            editLabelStyle:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            addLabelStyle:FontStyle.get(14,FontStyle.GREY_DARK),
            displayHeader:false
        };

    this._interactiveButton = null;
    this._buttonsInTransition = [];
    this._layoutDirty = false;

    this._buttonExpandPool = new ObjectPool(App.CategoryButtonExpand,5,buttonOptions);
    this._buttonEditPool = new ObjectPool(App.CategoryButtonEdit,5,buttonOptions);
    this._buttonList = new App.TileList(App.Direction.Y,h);
    this._addNewButton = new App.AddNewButton("ADD CATEGORY",FontStyle.get(14,FontStyle.GREY_DARK),App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,r);
    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,h,r,false);

    this._pane.setContent(this._buttonList);
    this.addChild(this._pane);
};

App.CategoryScreen.prototype = Object.create(App.Screen.prototype);

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

    this._layoutDirty = false;

    this._pane.disable();
};

/**
 * Update
 * @param {App.Account} data
 * @param {string} mode
 * @private
 */
App.CategoryScreen.prototype.update = function update(data,mode)
{
    this._model = data;

    this._buttonList.remove(this._addNewButton);

    var ScreenMode = App.ScreenMode,
        buttonPool = this._mode === ScreenMode.SELECT ? this._buttonExpandPool : this._buttonEditPool,
        categories = this._model.categories,
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    buttonPool = mode === ScreenMode.SELECT ? this._buttonExpandPool : this._buttonEditPool;

    for (i=0,l=categories.length;i<l;)
    {
        button = buttonPool.allocate();
        button.update(categories[i++],mode);
        this._buttonList.add(button,false);
    }

    this._buttonList.add(this._addNewButton);

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
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button && !(button instanceof App.AddNewButton))
    {
        if (!preferScroll) this._pane.cancelScroll();

        this._interactiveButton = button;
        this._interactiveButton.swipeStart(direction);

        this._closeButtons(false);
    }
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
        l = this._buttonList.length - 1,// last button is 'AddNewButton'
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
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button)
    {
        if (button instanceof App.AddNewButton)
        {
            var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.EDIT_CATEGORY);
            changeScreenData.headerName = App.ScreenTitle.ADD_CATEGORY;

            App.Controller.dispatchEvent(App.EventType.CHANGE_CATEGORY,{
                type:App.EventType.CREATE,
                account:this._model,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
        else
        {
            if (this._mode === App.ScreenMode.SELECT)
            {
                this._interactiveButton = button;

                if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
                {
                    this._buttonsInTransition.push(this._interactiveButton);
                    this._interactiveButton.addEventListener(App.EventType.COMPLETE,this,this._onButtonTransitionComplete);

                    this._layoutDirty = true;
                }

                this._interactiveButton.onClick(data);
                this._pane.cancelScroll();
            }
            else if (this._mode === App.ScreenMode.EDIT)
            {
                button.onClick(data);
            }
        }
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            App.ScreenName.MENU,
            0,
            null,
            HeaderAction.NONE,
            HeaderAction.CANCEL,
            App.ScreenTitle.MENU
        );

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
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.BACK));
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
