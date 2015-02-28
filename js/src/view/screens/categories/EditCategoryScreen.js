/**
 * @class EditCategoryScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.EditCategoryScreen = function EditCategoryScreen(layout)
{
    App.InputScrollScreen.call(this,null,layout);

    var ScrollPolicy = App.ScrollPolicy,
        InfiniteList = App.InfiniteList,
        Direction = App.Direction,
        IconSample = App.IconSample,
        FontStyle = App.FontStyle,
        Input = App.Input,
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(20 * r),
        inputHeight = Math.round(40 * r),
        icons = App.ModelLocator.getProxy(App.ModelName.ICONS),
        iconsHeight = Math.round(64 * r),
        subCategoryButtonOptions = {
            width:w,
            height:inputHeight,
            pixelRatio:r,
            addButtonSkin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_40,
            addLabelStyle:FontStyle.get(14,FontStyle.GREY_DARK),
            displayHeader:true
        };

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._iconResizeRatio = Math.round(32 * r) / this._icon.height;
    this._input = new Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true);
    this._separators = new PIXI.Graphics();
    this._colorList = new InfiniteList(this._getColorSamples(),App.ColorSample,Direction.X,w,Math.round(50 * r),r);
    this._topIconList = new InfiniteList(icons.slice(0,Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._bottomIconList = new InfiniteList(icons.slice(Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._subCategoryList = new App.SubCategoryList(subCategoryButtonOptions);
    this._budgetHeader = new App.ListHeader("Budget",w,r);
    this._budget = new Input("Enter Budget",20,inputWidth,inputHeight,r,true);
    this._deleteButton = new App.Button("Delete",{width:inputWidth,height:inputHeight,pixelRatio:r,style:FontStyle.get(18,FontStyle.WHITE),backgroundColor:App.ColorTheme.RED});
    this._renderAll = true;

    //TODO add modal window to confirm deleting sub-category. Also offer option 'Edit'?
    //TODO center selected color/icon when shown

    this._budget.restrict(/\D/g);

    //TODO use list instead of DisplayObjectContainer for container?
    this._container.addChild(this._background);
    this._container.addChild(this._colorStripe);
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
        separatorWidth = w - this._inputPadding * 2,
        bottom = 0;

    GraphicUtils.drawRect(this._colorStripe,"0x"+this._model.color,1,0,0,Math.round(4*r),Math.round(59 * r));

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[this._model.icon]);

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(this._model.icon);
        this._iconResizeRatio = Math.round(32 * r) / this._icon.height;
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(15 * r);
        this._icon.y = Math.round((inputFragmentHeight - this._icon.height) / 2);
        this._icon.tint = ColorTheme.BLUE;
        this._container.addChild(this._icon);

        this._input.x = Math.round(60 * r);
        this._input.y = Math.round((inputFragmentHeight - this._input.height) / 2);

        this._colorList.y = inputFragmentHeight;
        this._topIconList.y = inputFragmentHeight + this._colorList.boundingBox.height;
        this._bottomIconList.y = this._topIconList.y + this._topIconList.boundingBox.height;
        this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;

        this._budget.x = this._inputPadding;
        this._deleteButton.x = this._inputPadding;
        this._separators.x = this._inputPadding;
    }

    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;

    bottom = this._budgetHeader.y + this._budgetHeader.height;

    this._budget.y = bottom + this._inputPadding;

    if (this._mode === App.ScreenMode.EDIT)
    {
        bottom = bottom + inputFragmentHeight;

        this._deleteButton.y = bottom + this._inputPadding;

        if (!this._container.contains(this._deleteButton)) this._container.addChild(this._deleteButton);
    }
    else
    {
        if (this._container.contains(this._deleteButton)) this._container.removeChild(this._deleteButton);
    }

    GraphicUtils.drawRect(this._background,ColorTheme.GREY,1,0,0,w,bottom+inputFragmentHeight);
    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_DARK,1,[
        0,inputFragmentHeight-1,separatorWidth,1,
        0,inputFragmentHeight+colorListHeight,separatorWidth,1,
        0,bottom-1,separatorWidth,1
    ],true,false);
    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_LIGHT,1,[
        0,inputFragmentHeight,separatorWidth,1,
        0,inputFragmentHeight+colorListHeight+1,separatorWidth,1,
        0,bottom,separatorWidth,1
    ],false,true);
};

/**
 * Update
 * @param {Category} model
 * @param {string} mode
 */
App.EditCategoryScreen.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._input.setValue(this._model.name);
    this._colorList.selectItemByValue(this._model.color);//TODO items don't select when they're off screen
    this._topIconList.selectItemByValue(this._model.icon);
    this._bottomIconList.selectItemByValue(this._model.icon);
    this._subCategoryList.update(this._model,this._mode);
    this._budget.setValue(this._model.budget);

    this._render();

    this._pane.resize();
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
            list.cancelScroll();
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
            list.cancelScroll();
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
            list.cancelScroll();
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
 * On Header click
 * @param {number} action
 * @private
 */
App.EditCategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    if (action === App.HeaderAction.CONFIRM)
    {
        //TODO first check if all values are set and save changes!
    }

    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK));
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
    var convertFn = App.MathUtils.rgbToHex,
        i = 0,
        l = 30,
        frequency = 2 * Math.PI/l,
        amplitude = 127,
        center = 128,
        colorSamples = new Array(l);

    for (;i<l;i++)
    {
        colorSamples[i] = convertFn(
            Math.round(Math.sin(frequency * i + 0) * amplitude + center),
            Math.round(Math.sin(frequency * i + 2) * amplitude + center),
            Math.round(Math.sin(frequency * i + 4) * amplitude + center)
        );
    }
    return colorSamples;
};
