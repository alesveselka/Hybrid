/**
 * @class EditCategoryScreen
 * @extends Screen
 * @param {Category} model
 * @param {Object} layout
 * @constructor
 */
App.EditCategoryScreen = function EditCategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        InfiniteList = App.InfiniteList,
        Direction = App.Direction,
        IconSample = App.IconSample,
        Input = App.Input,
        r = layout.pixelRatio,
        w = layout.width,
        icons = App.ModelLocator.getProxy(App.ModelName.ICONS),
        iconsHeight = Math.round(64 * r);

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._input = new Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true);
    this._separators = new PIXI.Graphics();
    this._colorList = new InfiniteList(this._getColorSamples(),App.ColorSample,Direction.X,w,Math.round(50 * r),r);
    this._topIconList = new InfiniteList(icons.slice(0,Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._bottomIconList = new InfiniteList(icons.slice(Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._subCategoryList = new App.SubCategoryList(null,w,r);
    this._budgetHeader = new App.ListHeader("Budget",w,r);
    this._budget = new Input("Enter Budget",20,w - Math.round(20 * r),Math.round(40 * r),r,true);
    this._scrollTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._scrollState = App.TransitionState.HIDDEN;

    //TODO add overlay for bluring inputs?
    //TODO add modal window to confirm deleting sub-category

    this._budget.restrict(/\D/);
    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._colorStripe);
    this._container.addChild(this._icon);
    this._container.addChild(this._input);
    this._container.addChild(this._separators);
    this._container.addChild(this._colorList);
    this._container.addChild(this._topIconList);
    this._container.addChild(this._bottomIconList);
    this._container.addChild(this._subCategoryList);
    this._container.addChild(this._budgetHeader);
    this._container.addChild(this._budget);
    this._pane.setContent(this._container);
    this.addChild(this._pane);

    this._swipeEnabled = true;
};

App.EditCategoryScreen.prototype = Object.create(App.Screen.prototype);
App.EditCategoryScreen.prototype.constructor = App.EditCategoryScreen;

/**
 * Render
 * @private
 */
App.EditCategoryScreen.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this._layout.width,
        inputFragmentHeight = Math.round(60 * r),
        colorListHeight = this._colorList.boundingBox.height,
        iconResizeRatio = Math.round(32 * r) / this._icon.height,
        padding = Math.round(10 * r),
        separatorWidth = w - padding * 2;

    GraphicUtils.drawRect(this._colorStripe,0xff6600,1,0,0,Math.round(4*r),Math.round(59 * r));

    this._icon.scale.x = iconResizeRatio;
    this._icon.scale.y = iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((inputFragmentHeight - this._icon.height) / 2);
    this._icon.tint = ColorTheme.BLUE;

    this._input.x = Math.round(60 * r);
    this._input.y = Math.round((inputFragmentHeight - this._input.height) / 2);

    this._colorList.y = inputFragmentHeight;
    this._topIconList.y = inputFragmentHeight + this._colorList.boundingBox.height;
    this._bottomIconList.y = this._topIconList.y + this._topIconList.boundingBox.height;

    GraphicUtils.drawRects(this._separators,ColorTheme.DARK_SHADE,1,[0,0,separatorWidth,1,0,colorListHeight,separatorWidth,1],true,false);
    GraphicUtils.drawRects(this._separators,ColorTheme.LIGHT_SHADE,1,[0,1,separatorWidth,1,0,colorListHeight+1,separatorWidth,1],false,true);
    this._separators.x = padding;
    this._separators.y = inputFragmentHeight - 1;

    this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;
    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;
    this._budget.x = padding;
    this._budget.y = this._budgetHeader.y + this._budgetHeader.height + Math.round(10 * r);

    GraphicUtils.drawRect(this._background,ColorTheme.BACKGROUND,1,0,0,w,this._budget.y+this._budget.boundingBox.height+padding);
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
    this._colorList.enable();
    this._topIconList.enable();
    this._bottomIconList.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.EditCategoryScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
    this._colorList.disable();
    this._topIconList.disable();
    this._bottomIconList.disable();
    this._budget.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.EditCategoryScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.Screen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.addEventListener(EventType.BLUR,this,this._onBudgetBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.Screen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onBudgetBlur);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var position = this.stage.getTouchData().getLocalPosition(this._container),
        y = position.y,
        list = null;

    if (y >= this._colorList.y && y < this._colorList.y + this._colorList.boundingBox.height)
    {
        list = this._colorList;
        list.selectItemByPosition(position.x);
    }
    else if (y >= this._topIconList.y && y < this._topIconList.y + this._topIconList.boundingBox.height)
    {
        list = this._topIconList;
        list.selectItemByPosition(position.x);
        this._bottomIconList.selectItemByPosition(-1000);
    }
    else if (y >= this._bottomIconList.y && y < this._bottomIconList.y + this._bottomIconList.boundingBox.height)
    {
        list = this._bottomIconList;
        list.selectItemByPosition(position.x);
        this._topIconList.selectItemByPosition(-1000);
    }
    else if (y >= this._budget.y && y < this._budget.y + this._budget.boundingBox.height)
    {
        this._focusBudget();
    }
};

/**
 * On tick
 * @private
 */
App.EditCategoryScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._scrollTween.isRunning()) this._onScrollTweenUpdate();
};

/**
 * On scroll tween update
 * @private
 */
App.EditCategoryScreen.prototype._onScrollTweenUpdate = function _onScrollTweenUpdate()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWING)
    {
        this._pane.y = -Math.round((this._budgetHeader.y + this._container.y) * this._scrollTween.progress);
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._pane.y = -Math.round((this._budgetHeader.y + this._container.y) * (1 - this._scrollTween.progress));
    }
};

/**
 * On scroll tween complete
 * @private
 */
App.EditCategoryScreen.prototype._onScrollTweenComplete = function _onScrollTweenComplete()
{
    var TransitionState = App.TransitionState;

    this._onScrollTweenUpdate();

    if (this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.SHOWN;

        this._subCategoryList.closeButtons(true);

        this._budget.enable();
        this._budget.focus();
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.HIDDEN;

        this._pane.enable();
    }
};

/**
 * Focus budget
 * @private
 */
App.EditCategoryScreen.prototype._focusBudget = function _focusBudget()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.HIDDEN || this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.SHOWING;

        this._pane.disable();

        this._scrollTween.start();
    }
};

/**
 * On budget field blur
 * @private
 */
App.EditCategoryScreen.prototype._onBudgetBlur = function _onBudgetBlur()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWN || this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.HIDING;

        this._budget.disable();

        this._scrollTween.restart();
    }
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.EditCategoryScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    if (!preferScroll) this._pane.cancelScroll();

    this._subCategoryList.swipeStart(direction);
};

/**
 * Called when swipe ends
 * @private
 */
App.EditCategoryScreen.prototype._swipeEnd = function _swipeEnd()
{
    this._subCategoryList.swipeEnd();
};

/**
 * Generate and return array of color samples
 * @returns {Array.<number>}
 * @private
 */
App.EditCategoryScreen.prototype._getColorSamples = function _getColorSamples()
{
    var MathUtils = App.MathUtils,
        i = 0,
        l = 30,
        frequency = 2 * Math.PI/l,
        amplitude = 127,
        center = 128,
        colorSamples = new Array(l);

    for (;i<l;i++)
    {
        colorSamples[i] = MathUtils.rgbToHex(
            Math.round(Math.sin(frequency * i + 0) * amplitude + center),
            Math.round(Math.sin(frequency * i + 2) * amplitude + center),
            Math.round(Math.sin(frequency * i + 4) * amplitude + center)
        );
    }
    return colorSamples;
};
