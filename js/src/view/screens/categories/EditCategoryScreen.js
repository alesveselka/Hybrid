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
    this._background = this._container.addChild(new PIXI.Graphics());
    this._colorStripe = this._container.addChild(new PIXI.Graphics());
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._iconResizeRatio = Math.round(32 * r) / this._icon.height;
    this._input = this._container.addChild(new Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true));
    this._separators = this._container.addChild(new PIXI.Graphics());
    this._colorList = this._container.addChild(new InfiniteList(this._getColorSamples(),App.ColorSample,Direction.X,w,Math.round(50 * r),r));
    this._topIconList = this._container.addChild(new InfiniteList(icons.slice(0,Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r));
    this._bottomIconList = this._container.addChild(new InfiniteList(icons.slice(Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r));
    this._subCategoryList = this._container.addChild(new App.SubCategoryList(subCategoryButtonOptions));
    this._budgetHeader = this._container.addChild(new App.ListHeader("Budget",w,r));
    this._budget = this._container.addChild(new Input("Enter Budget",20,inputWidth,inputHeight,r,true));
    this._deleteButton = new App.PopUpButton("Delete","Are you sure you want to\ndelete this category with all its\ndata and sub-categories?",{
        width:inputWidth,
        height:inputHeight,
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:w,overlayHeight:0}
    });
    this._renderAll = true;

    //TODO center selected color/icon when shown

    this._budget.restrict(/\D/g);

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
        icon = this._getSelectedIcon(),
        color = this._colorList.getSelectedValue(),
        bottom = 0;

    GraphicUtils.drawRect(this._colorStripe,"0x"+color,1,0,0,Math.round(4*r),Math.round(59 * r));

    if (this._icon)
    {
        this._icon.setTexture(PIXI.TextureCache[icon]);
        this._icon.tint = parseInt(color,16);
    }

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(icon);
        this._iconResizeRatio = Math.round(32 * r) / this._icon.height;
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(15 * r);
        this._icon.y = Math.round((inputFragmentHeight - this._icon.height) / 2);
        this._icon.tint = parseInt(color,16);
        this._container.addChild(this._icon);

        this._input.x = Math.round(60 * r);
        this._input.y = Math.round((inputFragmentHeight - this._input.height) / 2);

        this._colorList.y = inputFragmentHeight;
        this._topIconList.y = inputFragmentHeight + this._colorList.boundingBox.height;
        this._bottomIconList.y = this._topIconList.y + this._topIconList.boundingBox.height;
        this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;

        this._budget.x = this._inputPadding;
        this._separators.x = this._inputPadding;
    }

    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;

    bottom = this._budgetHeader.y + this._budgetHeader.height;

    this._budget.y = bottom + this._inputPadding;

    if (this._mode === App.ScreenMode.EDIT)
    {
        bottom = bottom + inputFragmentHeight;

        this._deleteButton.setPosition(this._inputPadding,bottom+this._inputPadding);

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
 * Hide
 */
App.EditCategoryScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Update
 * @param {App.Category} model
 * @param {string} mode
 */
App.EditCategoryScreen.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._input.setValue(this._model.name);

    if (this._model.color) this._colorList.selectItemByValue(this._model.color);
    else this._colorList.selectItemByPosition(0);

    if (this._model.icon)
    {
        this._topIconList.selectItemByValue(this._model.icon);
        this._bottomIconList.selectItemByValue(this._model.icon);
    }
    else
    {
        this._topIconList.selectItemByPosition(0);
        this._bottomIconList.selectItemByValue(-10000);
    }

    this._subCategoryList.update(this._model,App.ScreenMode.EDIT);
    this._budget.setValue(this._model.budget);

    this._deleteButton.hidePopUp(true);

    this._render();

    this._pane.resize();
    this.resetScroll();
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

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
 * @param {number} level
 * @private
 */
App.EditCategoryScreen.prototype._registerEventListeners = function _registerEventListeners(level)
{
    App.Screen.prototype._registerEventListeners.call(this,level);

    if (level === App.EventLevel.LEVEL_2)
    {
        var EventType = App.EventType;

        this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

        this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
        this._budget.addEventListener(EventType.BLUR,this,this._onInputBlur);
    }
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    App.Screen.prototype._unRegisterEventListeners.call(this,level);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Register delete button event listeners
 * @private
 */
App.EditCategoryScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.addEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.addEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.addEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * UnRegister delete button event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.removeEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.removeEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.removeEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * On delete cancel
 * @private
 */
App.EditCategoryScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.EditCategoryScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._onHidePopUpComplete();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();

    changeScreenData.updateBackScreen = true;

    App.Controller.dispatchEvent(EventType.CHANGE_CATEGORY,{
        type:EventType.DELETE,
        category:this._model,
        nextCommand:new App.ChangeScreen(),
        nextCommandData:changeScreenData
    });
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.EditCategoryScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        touchData = this.stage.getTouchData(),
        position = touchData.getLocalPosition(this._container),
        y = position.y;

    if (this._input.hitTest(y))
    {
        this._scrollInput = this._input;
        this._focusInput(this._scrollInput.y + this._container.y > 0);

        this._subCategoryList.closeButtons();
    }
    else if (this._colorList.hitTest(y))
    {
        this._onSampleClick(this._colorList,position.x,inputFocused);
    }
    else if (this._topIconList.hitTest(y))
    {
        this._onSampleClick(this._topIconList,position.x,inputFocused);
    }
    else if (this._bottomIconList.hitTest(y))
    {
        this._onSampleClick(this._bottomIconList,position.x,inputFocused);
    }
    else if (this._subCategoryList.hitTest(y))
    {
        var button = this._subCategoryList.getItemUnderPoint(touchData);

        if (button)
        {
            if (inputFocused) this._scrollInput.blur();

            if (button instanceof App.AddNewButton)
            {
                App.Controller.dispatchEvent(App.EventType.CHANGE_SUB_CATEGORY,{
                    type:App.EventType.CREATE,
                    category:this._model,
                    nextCommand:new App.ChangeScreen(),
                    nextCommandData:App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                        App.ScreenName.EDIT,
                        App.ScreenMode.ADD,
                        null,
                        0,
                        0,
                        App.ScreenTitle.ADD_SUB_CATEGORY
                    )
                });
            }
            else
            {
                //TODO check how many sub-categories the category have and allow to delete sub-category if there is more than one
                button.onClick(touchData,this._model);
            }
        }

        this._subCategoryList.closeButtons();
    }
    else if (this._budget.hitTest(y))
    {
        this._scrollInput = this._budget;
        this._focusInput(false);

        this._subCategoryList.closeButtons();
    }
    else if (this._deleteButton.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            this.disable();
            this._unRegisterEventListeners(App.EventLevel.LEVEL_1);
            App.ViewLocator.getViewSegment(App.ViewName.HEADER).disableActions();
            this._registerDeleteButtonListeners();
            this._deleteButton.setPopUpLayout(0,this._container.y + this._layout.headerHeight,0,this._layout.contentHeight > this._container.height ? this._layout.contentHeight : this._container.height);
            this._deleteButton.showPopUp();
        }
    }
    else
    {
        if (inputFocused) this._scrollInput.blur();
    }
};

/**
 * On sample click
 * @param {App.InfiniteList} list
 * @param {number} position
 * @param {boolean} inputFocused
 * @private
 */
App.EditCategoryScreen.prototype._onSampleClick = function _onSampleClick(list,position,inputFocused)
{
    if (inputFocused) this._scrollInput.blur();

    list.cancelScroll();
    var sample = list.selectItemByPosition(position);

    if (sample instanceof App.ColorSample)
    {
        App.GraphicUtils.drawRect(this._colorStripe,"0x"+sample.getValue(),1,0,0,this._colorStripe.width,this._colorStripe.height);

        this._icon.tint = parseInt(sample.getValue(),16);
    }
    else if (sample instanceof App.IconSample)
    {
        this._icon.setTexture(PIXI.TextureCache[sample.getValue()]);

        (list === this._topIconList ? this._bottomIconList : this._topIconList).selectItemByPosition(-10000);
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditCategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK),
        changeCategoryData = {
            type:EventType.CONFIRM,
            category:this._model,
            name:this._input.getValue(),
            color:this._colorList.getSelectedValue(),
            icon:this._getSelectedIcon(),
            budget:this._budget.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        };

    if (this._scrollState === App.TransitionState.SHOWN && this._scrollInput) this._scrollInput.blur();

    if (action === App.HeaderAction.CONFIRM)
    {
        this._model.clearSavedStates();

        changeScreenData.updateBackScreen = true;
        //TODO when i create new Category, or edit current one, user can delete all subCategories!!!
        App.Controller.dispatchEvent(EventType.CHANGE_CATEGORY,changeCategoryData);
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        changeCategoryData.type = EventType.CANCEL;

        App.Controller.dispatchEvent(EventType.CHANGE_CATEGORY,changeCategoryData);
    }
};

/**
 * Return selected icon
 * @returns {string}
 * @private
 */
App.EditCategoryScreen.prototype._getSelectedIcon = function _getSelectedIcon()
{
    var selectedIcon = this._topIconList.getSelectedValue();
    if (!selectedIcon) selectedIcon = this._bottomIconList.getSelectedValue();

    return selectedIcon;
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
