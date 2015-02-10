/**
 * @class EditCategoryScreen
 * @extends InputScrollScreen
 * @param {Category} model
 * @param {Object} layout
 * @constructor
 */
App.EditCategoryScreen = function EditCategoryScreen(model,layout)
{
    App.InputScrollScreen.call(this,model,layout);

    var ScrollPolicy = App.ScrollPolicy,
        InfiniteList = App.InfiniteList,
        Direction = App.Direction,
        IconSample = App.IconSample,
        HeaderAction = App.HeaderAction,
        Input = App.Input,
        r = layout.pixelRatio,
        w = layout.width,
        icons = App.ModelLocator.getProxy(App.ModelName.ICONS),
        iconsHeight = Math.round(64 * r);

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
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

    this._headerInfo.leftAction = HeaderAction.CANCEL;
    this._headerInfo.rightAction = HeaderAction.CONFIRM;
    this._headerInfo.name = "Edit Category";
    this._swipeEnabled = true;
};

App.EditCategoryScreen.prototype = Object.create(App.InputScrollScreen.prototype);
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
        separatorWidth = w - this._inputPadding * 2;

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

    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_DARK,1,[0,0,separatorWidth,1,0,colorListHeight,separatorWidth,1],true,false);
    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_LIGHT,1,[0,1,separatorWidth,1,0,colorListHeight+1,separatorWidth,1],false,true);
    this._separators.x = this._inputPadding;
    this._separators.y = inputFragmentHeight - 1;

    this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;
    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;

    this._budget.x = this._inputPadding;
    this._budget.y = this._budgetHeader.y + this._budgetHeader.height + this._inputPadding;

    GraphicUtils.drawRect(this._background,ColorTheme.GREY,1,0,0,w,this._budget.y+this._budget.boundingBox.height+this._inputPadding);
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.InputScrollScreen.prototype.enable.call(this);

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
    this.resetScroll();//TODO reset before the screen start hiding

    App.InputScrollScreen.prototype.disable.call(this);

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
    App.InputScrollScreen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
    this._budget.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.InputScrollScreen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        position = this.stage.getTouchData().getLocalPosition(this._container),
        y = position.y,
        list = null;

    if (this._input.hitTest(y))
    {
        this._scrollInput = this._input;
        this._focusInput(this._scrollInput.y + this._container.y > 0);

        this._subCategoryList.closeButtons();
    }
    else if (this._colorList.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            list = this._colorList;
            list.selectItemByPosition(position.x);
        }
    }
    else if (this._topIconList.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            list = this._topIconList;
            list.selectItemByPosition(position.x);
            this._bottomIconList.selectItemByPosition(-1000);
        }
    }
    else if (this._bottomIconList.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            list = this._bottomIconList;
            list.selectItemByPosition(position.x);
            this._topIconList.selectItemByPosition(-1000);
        }
    }
    else if (this._budget.hitTest(y))
    {
        this._scrollInput = this._budget;
        this._focusInput(false);

        this._subCategoryList.closeButtons();
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
