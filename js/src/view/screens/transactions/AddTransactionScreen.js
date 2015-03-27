/**
 * @class AddTransactionScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.AddTransactionScreen = function AddTransactionScreen(layout)
{
    App.InputScrollScreen.call(this,layout);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        FontStyle = App.FontStyle,
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(10 * r) * 2,
        inputHeight = Math.round(40 * r),
        toggleOptions = {
            width:Math.round(w / 3),
            height:Math.round(40 * r),
            pixelRatio:r,
            style:FontStyle.get(14,FontStyle.BLUE),
            toggleStyle:FontStyle.get(14,FontStyle.WHITE)
        },
        options = {
            pixelRatio:r,
            width:w,
            height:Math.round(50*r),
            skin:skin.GREY_50,
            nameStyle:FontStyle.get(18,FontStyle.GREY_DARKER),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInput = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._separators = new PIXI.Graphics();
    this._deleteBackground = new PIXI.Sprite(skin.GREY_60);
    this._deleteButton = new App.PopUpButton("Delete","Are you sure you want to\ndelete this transaction?",{
        width:inputWidth,
        height:inputHeight,
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:w,overlayHeight:0}
    });

    this._optionList = new App.List(App.Direction.Y);
    this._accountOption = this._optionList.add(new TransactionOptionButton("account","Account",options));
    this._categoryOption = this._optionList.add(new TransactionOptionButton("folder-app","Category",options));
    this._timeOption = this._optionList.add(new TransactionOptionButton("calendar","Time",options));
    this._methodOption = this._optionList.add(new TransactionOptionButton("credit-card","Method",options));
    this._currencyOption = this._optionList.add(new TransactionOptionButton("currencies","Currency",options),true);

    this._toggleButtonList = new App.List(App.Direction.X);
    this._typeToggle = this._toggleButtonList.add(new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income",toggleColor:false}));
    this._pendingToggle = this._toggleButtonList.add(new TransactionToggleButton("pending-app","Pending",toggleOptions,{toggleColor:true}));
    this._repeatToggle = this._toggleButtonList.add(new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{toggleColor:true}),true);
    this._renderAll = true;

    //TODO automatically focus input when this screen is shown?
    //TODO add repeat frequency when 'repeat' is on?

    this._transactionInput.restrict(/\d{1,}(\.\d*){0,1}/g);

    this._container.addChild(this._background);
    this._container.addChild(this._transactionInput);
    this._container.addChild(this._toggleButtonList);
    this._container.addChild(this._optionList);
    this._container.addChild(this._noteInput);
    this._container.addChild(this._separators);
    this._pane.setContent(this._container);
    this.addChild(this._pane);

    this._clickThreshold = 10 * r;
};

App.AddTransactionScreen.prototype = Object.create(App.InputScrollScreen.prototype);
App.AddTransactionScreen.prototype.constructor = App.AddTransactionScreen;

/**
 * Render
 * @private
 */
App.AddTransactionScreen.prototype._render = function _render()
{
    var w = this._layout.width,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r);

    if (this._renderAll)
    {
        var ColorTheme = App.ColorTheme,
            GraphicUtils = App.GraphicUtils,
            inputHeight = Math.round(60 * r),
            toggleHeight = this._toggleButtonList.boundingBox.height,
            toggleWidth = Math.round(w / 3),
            separatorWidth = w - padding * 2,
            bottom = 0;

        this._renderAll = false;

        this._transactionInput.x = padding;
        this._transactionInput.y = padding;

        this._toggleButtonList.y = inputHeight;

        this._optionList.y = this._toggleButtonList.y + toggleHeight;

        bottom = this._optionList.y + this._optionList.boundingBox.height;

        this._noteInput.x = padding;
        this._noteInput.y = bottom + padding;

        GraphicUtils.drawRects(this._separators,ColorTheme.GREY_LIGHT,1,[
            padding,inputHeight,separatorWidth,1,
            toggleWidth,inputHeight+padding,1,toggleHeight-padding*2,
            toggleWidth*2,inputHeight+padding,1,toggleHeight-padding*2,
            padding,bottom,separatorWidth,1
        ],true,false);

        bottom = this._noteInput.y + this._noteInput.boundingBox.height + padding;

        this._deleteBackground.y = bottom;
        this._deleteButton.setPosition(padding,this._deleteBackground.y + padding);

        GraphicUtils.drawRects(this._separators,ColorTheme.GREY_DARK,1,[
            padding,inputHeight-1,separatorWidth,1,
            toggleWidth-1,inputHeight+padding,1,toggleHeight-padding*2,
            toggleWidth*2-1,inputHeight+padding,1,toggleHeight-padding*2,
            padding,inputHeight+toggleHeight-1,separatorWidth,1,
            padding,bottom-1,separatorWidth,1
        ],false,true);
    }

    if (this._mode === App.ScreenMode.EDIT)
    {
        App.GraphicUtils.drawRect(this._background,App.ColorTheme.GREY,1,0,0,w,this._deleteButton.y+this._deleteButton.boundingBox.height+padding);

        if (!this._container.contains(this._deleteBackground)) this._container.addChild(this._deleteBackground);
        if (!this._container.contains(this._deleteButton)) this._container.addChild(this._deleteButton);
    }
    else
    {
        App.GraphicUtils.drawRect(this._background,App.ColorTheme.GREY,1,0,0,w,this._noteInput.y+this._noteInput.boundingBox.height+padding);

        if (this._container.contains(this._deleteBackground)) this._container.removeChild(this._deleteBackground);
        if (this._container.contains(this._deleteButton)) this._container.removeChild(this._deleteButton);
    }
};

/**
 * Update
 * @param {App.Transaction} data
 * @param {number} mode
 * @private
 */
App.AddTransactionScreen.prototype.update = function update(data,mode)
{
    this._model = data || this._model;
    this._mode = mode || this._mode;

    var settings = App.ModelLocator.getProxy(App.ModelName.SETTINGS),
        account = this._model.account ? this._model.account : settings.defaultAccount,
        category = this._model.category ? this._model.category : settings.defaultCategory,
        subCategory = this._model.subCategory ? this._model.subCategory : settings.defaultSubCategory;

    this._transactionInput.setValue(this._model.amount);

    this._typeToggle.setState(this._model.type === App.TransactionType.INCOME);
    this._pendingToggle.setState(this._model.pending);
    this._repeatToggle.setState(this._model.repeat);

    this._accountOption.setValue(account.name);
    this._categoryOption.setValue(subCategory.name,category.name);
    this._timeOption.setValue(App.DateUtils.getMilitaryTime(this._model.date),this._model.date.toDateString());
    this._methodOption.setValue(this._model.method.name);
    this._currencyOption.setValue(this._model.currencyQuote);

    this._deleteButton.hidePopUp(true);

    this._noteInput.setValue(this._model.note);

    this._render();
    this._pane.resize();
    this.resetScroll();
};

/**
 * Hide
 */
App.AddTransactionScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Enable
 */
App.AddTransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.AddTransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._transactionInput.disable();
    this._noteInput.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.AddTransactionScreen.prototype._registerEventListeners = function _registerEventListeners(level)
{
    App.Screen.prototype._registerEventListeners.call(this,level);

    if (level === App.EventLevel.LEVEL_2)
    {
        var EventType = App.EventType;

        this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

        this._transactionInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
        this._noteInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
    }
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    App.Screen.prototype._unRegisterEventListeners.call(this,level);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._transactionInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._noteInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Register delete button event listeners
 * @private
 */
App.AddTransactionScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
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
App.AddTransactionScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
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
App.AddTransactionScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.AddTransactionScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    var HeaderAction = App.HeaderAction,
        changeTransactionData = this._getChangeTransactionData(
            App.ScreenName.TRANSACTIONS,
            0,
            null,
            HeaderAction.MENU,
            HeaderAction.ADD_TRANSACTION,
            App.ScreenTitle.TRANSACTIONS
        );

    this._onHidePopUpComplete();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();

    App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).setCurrent(this._model);

    changeTransactionData.type = App.EventType.DELETE;

    App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,changeTransactionData);
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.AddTransactionScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.AddTransactionScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        pointerData = this.stage.getTouchData(),
        position = pointerData.getLocalPosition(this._container).y;

    if (this._transactionInput.hitTest(position))
    {
        this._scrollInput = this._transactionInput;
        this._focusInput(this._scrollInput.y + this._container.y > 0);
    }
    else if (this._toggleButtonList.hitTest(position))
    {
        if (inputFocused) this._scrollInput.blur();
        else this._toggleButtonList.getItemUnderPoint(pointerData).toggle();
    }
    else if (this._optionList.hitTest(position))
    {
        if (inputFocused) this._scrollInput.blur();

        var button = this._optionList.getItemUnderPoint(pointerData);
        if (button === this._accountOption) this._onAccountOptionClick();
        else if (button === this._categoryOption) this._onCategoryOptionClick();
        else if (button === this._timeOption) this._onTimeOptionClick();
        else if (button === this._methodOption) this._onMethodOptionClick();
        else if (button === this._currencyOption) this._onCurrencyOptionClick();
    }
    else if (this._noteInput.hitTest(position))
    {
        this._scrollInput = this._noteInput;
        this._focusInput(false);
    }
    else if (this._deleteButton.hitTest(position))
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
 * On account option button click
 * @private
 */
App.AddTransactionScreen.prototype._onAccountOptionClick = function _onAccountOptionClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
        App.ScreenName.ACCOUNT,
        App.ScreenMode.SELECT,
        null,
        0,
        App.HeaderAction.NONE,
        App.ScreenTitle.SELECT_ACCOUNT
    ));
};

/**
 * On category option button click
 * @private
 */
App.AddTransactionScreen.prototype._onCategoryOptionClick = function _onCategoryOptionClick()
{
    if (this._model.account)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
            App.ScreenName.CATEGORY,
            App.ScreenMode.SELECT,
            this._model.account,
            0,
            App.HeaderAction.NONE,
            App.ScreenTitle.SELECT_CATEGORY
        ));
    }
};

/**
 * On time option button click
 * @private
 */
App.AddTransactionScreen.prototype._onTimeOptionClick = function _onTimeOptionClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
        App.ScreenName.SELECT_TIME,
        App.ScreenMode.SELECT,
        this._model.date,
        0,
        0,
        App.ScreenTitle.SELECT_TIME
    ));
};

/**
 * On payment method option button click
 * @private
 */
App.AddTransactionScreen.prototype._onMethodOptionClick = function _onMethodOptionClick()
{
    this._methodOption.setValue(this._methodOption.getValue() === App.PaymentMethod.CASH ? App.PaymentMethod.CREDIT_CARD : App.PaymentMethod.CASH);
};

/**
 * On currency option button click
 * @private
 */
App.AddTransactionScreen.prototype._onCurrencyOptionClick = function _onCurrencyOptionClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
        App.ScreenName.CURRENCIES,
        App.ScreenMode.SELECT,
        null,
        0,
        App.HeaderAction.NONE,
        App.ScreenTitle.SELECT_CURRENCY
    ));
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AddTransactionScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeTransactionData = this._getChangeTransactionData(
            App.ScreenName.TRANSACTIONS,
            0,
            App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).copySource().reverse(),
            HeaderAction.MENU,
            HeaderAction.ADD_TRANSACTION,
            App.ScreenTitle.TRANSACTIONS
        );

    if (this._scrollState === App.TransitionState.SHOWN && this._scrollInput) this._scrollInput.blur();

    if (action === HeaderAction.CONFIRM)
    {
        changeTransactionData.type = App.EventType.CONFIRM;

        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,changeTransactionData);
    }
    else
    {
        changeTransactionData.type = App.EventType.CANCEL;
        changeTransactionData.nextCommandData.screenName = App.ScreenName.BACK;
        changeTransactionData.nextCommandData.updateBackScreen = true;

        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,changeTransactionData);
    }
};

/**
 * Construct and return change transaction data object
 * @param {number} screenName
 * @param {number} screenMode
 * @param {*} updateData
 * @param {number} headerLeftAction
 * @param {number} headerRightAction
 * @param {string} headerName
 * @returns {{type:string,amount:string,transactionType:string,pending:boolean,repeat:boolean,method:string,note:string,nextCommand:App.ChangeScreen,nextCommandData:Object}}
 * @private
 */
App.AddTransactionScreen.prototype._getChangeTransactionData = function _getChangeTransactionData(screenName,screenMode,updateData,headerLeftAction,headerRightAction,headerName)
{
    return {
        type:App.EventType.CHANGE,
        amount:this._transactionInput.getValue(),
        transactionType:this._typeToggle.isSelected() ? App.TransactionType.INCOME : App.TransactionType.EXPENSE,
        pending:this._pendingToggle.isSelected(),
        repeat:this._repeatToggle.isSelected(),
        method:this._methodOption.getValue(),
        note:this._noteInput.getValue(),
        nextCommand:new App.ChangeScreen(),
        nextCommandData:App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            screenName,
            screenMode,
            updateData,
            headerLeftAction,
            headerRightAction,
            headerName
        )
    };
};
