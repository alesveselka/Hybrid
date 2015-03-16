/**
 * @class EditScreen
 * @param {Object} layout
 * @constructor
 */
App.EditScreen = function EditScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var r = layout.pixelRatio,
        inputWidth = layout.width - Math.round(20 * r),
        inputHeight = Math.round(40 * r);

    this._target = null;

    this._background = this.addChild(new PIXI.Graphics());
    this._input = this.addChild(new App.Input("",20,inputWidth,inputHeight,r,true));
    this._deleteButton = new App.PopUpButton("Delete","Are you sure you want to\ndelete this sub-category?",{//TODO message will differ based on model to delete
        width:inputWidth,
        height:inputHeight,
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:layout.width,overlayHeight:0}
    });
    this._renderAll = true;
};

App.EditScreen.prototype = Object.create(App.Screen.prototype);
App.EditScreen.prototype.constructor = App.EditScreen;

/**
 * Render
 * @private
 */
App.EditScreen.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        ScreenMode = App.ScreenMode,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r),
        w = this._layout.width - padding * 2;

    if (this._renderAll)
    {
        this._renderAll = false;

        this._input.x = padding;
        this._input.y = padding;

        this._deleteButton.setPosition(padding,inputHeight+padding);
    }

    if (this._mode === ScreenMode.EDIT)
    {
        if (!this.contains(this._deleteButton)) this.addChild(this._deleteButton);

        //TODO use skin
        GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w+padding*2,inputHeight*2],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,inputHeight-1,w,1],false,false);
        GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,inputHeight,w,1],false,true);
    }
    else if (this._mode === ScreenMode.ADD)
    {
        if (this.contains(this._deleteButton)) this.removeChild(this._deleteButton);

        GraphicUtils.drawRect(this._background,ColorTheme.GREY,1,0,0,w+padding*2,inputHeight);
    }
};

/**
 * Hide
 */
App.EditScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Enable
 */
App.EditScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
};

/**
 * Disable
 */
App.EditScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
};

/**
 * Update
 * @param {{category:App.Category,subCategory:App.SubCategory}} model
 * @param {string} mode
 */
App.EditScreen.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;
    this._target = this._model instanceof App.Account ? App.Account : App.SubCategory;

    if (this._target === App.Account) this._input.setValue(this._model.name);
    else if (this._target === App.SubCategory && this._model.subCategory) this._input.setValue(this._model.subCategory.name);

    this._deleteButton.hidePopUp(true);

    this._render();
};

/**
 * Register delete button event listeners
 * @private
 */
App.EditScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
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
App.EditScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
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
App.EditScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.EditScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._onHidePopUpComplete();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();

    changeScreenData.updateBackScreen = true;

    if (this._target === App.Account)
    {
        /*App.Controller.dispatchEvent(EventType.CHANGE_ACCOUNT,{
            type:EventType.DELETE,
            account:this._model,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });*/
    }
    else if (this._target === App.SubCategory)
    {
        App.Controller.dispatchEvent(EventType.CHANGE_SUB_CATEGORY,{
            type:EventType.DELETE,
            subCategory:this._model.subCategory,
            category:this._model.category,
            nextCommand:new App.ChangeCategory(),
            nextCommandData:{
                type:EventType.CHANGE,
                category:this._model.category,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            }
        });
    }
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.EditScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.EditScreen.prototype._onClick = function _onClick()
{
    if (this._deleteButton.hitTest(this.stage.getTouchData().getLocalPosition(this).y))
    {
        if (this._input.isFocused())
        {
            this._input.blur();
        }
        else
        {
            this.disable();
            this._unRegisterEventListeners(App.EventLevel.LEVEL_1);
            App.ViewLocator.getViewSegment(App.ViewName.HEADER).disableActions();
            this._registerDeleteButtonListeners();
            this._deleteButton.setPopUpLayout(0,this._layout.headerHeight,0,this._layout.contentHeight > this._background.height ? this._layout.contentHeight : this._background.height);
            this._deleteButton.showPopUp();
        }
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._input.blur();

    //TODO check first if value is set

    if (action === App.HeaderAction.CONFIRM)
    {
        changeScreenData.updateBackScreen = true;

        if (this._target === App.Account)
        {
            App.Controller.dispatchEvent(EventType.CHANGE_ACCOUNT,{
                type:EventType.CHANGE,
                account:this._model,
                name:this._input.getValue(),
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
        else if (this._target === App.SubCategory)
        {
            App.Controller.dispatchEvent(EventType.CHANGE_SUB_CATEGORY,{
                type:EventType.CHANGE,
                subCategory:this._model.subCategory,
                category:this._model.category,
                name:this._input.getValue(),
                nextCommand:new App.ChangeCategory(),
                nextCommandData:{
                    type:EventType.CHANGE,
                    category:this._model.category,
                    nextCommand:new App.ChangeScreen(),
                    nextCommandData:changeScreenData
                }
            });
        }
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(EventType.CHANGE_SCREEN,changeScreenData);
    }
};
