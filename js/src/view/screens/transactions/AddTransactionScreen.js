/**
 * @class AddTransactionScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.AddTransactionScreen = function AddTransactionScreen(layout)
{
    App.InputScrollScreen.call(this,null,layout);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        FontStyle = App.FontStyle,
        ScreenName = App.ScreenName,
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
            skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,
            nameStyle:FontStyle.get(18,FontStyle.GREY_DARKER),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInput = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._deleteButton = new App.Button("Delete",{width:inputWidth,height:inputHeight,pixelRatio:r,style:FontStyle.get(18,FontStyle.WHITE),backgroundColor:App.ColorTheme.RED});

    this._optionList = new App.List(App.Direction.Y);
    this._accountOption = new TransactionOptionButton("account","Account",ScreenName.ACCOUNT,options);
    this._categoryOption = new TransactionOptionButton("folder-app","Category",ScreenName.CATEGORY,options);
    this._timeOption = new TransactionOptionButton("calendar","Time",ScreenName.SELECT_TIME,options);
    this._methodOption = new TransactionOptionButton("credit-card","Method",ScreenName.CATEGORY,options);
    this._currencyOption = new TransactionOptionButton("currencies","Currency",ScreenName.ACCOUNT,options);

    this._toggleButtonList = new App.List(App.Direction.X);
    this._typeToggle = new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income",toggleColor:false});
    this._pendingToggle = new TransactionToggleButton("pending-app","Pending",toggleOptions,{toggleColor:true});
    this._repeatToggle = new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{toggleColor:true});

    //TODO automatically focus input when this screen is shown?

    this._toggleButtonList.add(this._typeToggle,false);
    this._toggleButtonList.add(this._pendingToggle,false);
    this._toggleButtonList.add(this._repeatToggle,true);
    this._optionList.add(this._accountOption,false);
    this._optionList.add(this._categoryOption,false);
    this._optionList.add(this._timeOption,false);
    this._optionList.add(this._methodOption,false);
    this._optionList.add(this._currencyOption,true);

    this._transactionInput.restrict(/\D/g);
    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._transactionInput);
    this._container.addChild(this._toggleButtonList);
    this._container.addChild(this._optionList);
    this._container.addChild(this._noteInput);
    this._container.addChild(this._deleteButton);
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
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        w = this._layout.width,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r),
        toggleHeight = this._toggleButtonList.boundingBox.height,
        toggleWidth = Math.round(w / 3),
        separatorWidth = w - padding * 2,
        bottom = 0;

    this._transactionInput.x = padding;
    this._transactionInput.y = padding;

    this._toggleButtonList.y = inputHeight;

    this._optionList.y = this._toggleButtonList.y + toggleHeight;

    bottom = this._optionList.y + this._optionList.boundingBox.height;

    this._noteInput.x = padding;
    this._noteInput.y = bottom + padding;

    if (this._mode === App.ScreenMode.EDIT)
    {
        bottom = bottom + inputHeight;

        this._deleteButton.x = padding;
        this._deleteButton.y = bottom + padding;
    }

    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w,bottom+inputHeight],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[
        padding,inputHeight-1,separatorWidth,1,
        toggleWidth-1,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2-1,inputHeight+padding,1,toggleHeight-padding*2,
        padding,inputHeight+toggleHeight-1,separatorWidth,1,
        padding,bottom-1,separatorWidth,1
    ],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[
        padding,inputHeight,separatorWidth,1,
        toggleWidth,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2,inputHeight+padding,1,toggleHeight-padding*2,
        padding,bottom-inputHeight,separatorWidth,1,
        padding,bottom,separatorWidth,1
    ],false,true);
};

/**
 * Update
 * @private
 */
App.AddTransactionScreen.prototype.update = function update(data,mode)
{
    this._model = data || this._model;
    this._mode = mode || this._mode;

    var date = this._model.date;

    this._transactionInput.setValue(this._model.amount);

    if (this._model.type === App.TransactionType.INCOME && !this._typeToggle.isSelected()) this._typeToggle.toggle();
    if (this._model.pending && !this._pendingToggle.isSelected()) this._pendingToggle.toggle();
    if (this._model.repeat && !this._repeatToggle.isSelected()) this._repeatToggle.toggle();

    this._accountOption.setValue(this._model.account ? this._model.account.name : "?");
    this._categoryOption.setValue(this._model.subCategory ? this._model.subCategory.name : "?",this._model.category ? this._model.category.name : null);
    this._timeOption.setValue(App.DateUtils.getMilitaryTime(date),date.toDateString());
    this._methodOption.setValue(this._model.method.name);
    this._currencyOption.setValue(this._model.currency.symbol);

    this._noteInput.setValue(this._model.note);

    if (this._mode === App.ScreenMode.EDIT)
    {
        if (!this._container.contains(this._deleteButton)) this._container.addChild(this._deleteButton);
    }
    else
    {
        if (this._container.contains(this._deleteButton)) this._container.removeChild(this._deleteButton);
    }
};

/**
 * Enable
 */
App.AddTransactionScreen.prototype.enable = function enable()
{
    App.InputScrollScreen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.AddTransactionScreen.prototype.disable = function disable()
{
    this.resetScroll();

    App.InputScrollScreen.prototype.disable.call(this);

    this._transactionInput.disable();
    this._noteInput.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.AddTransactionScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.InputScrollScreen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._transactionInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
    this._noteInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.InputScrollScreen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._transactionInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._noteInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
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

        var HeaderAction = App.HeaderAction,
            ScreenTitle = App.ScreenTitle,
            ScreenName = App.ScreenName,
            button = this._optionList.getItemUnderPoint(pointerData),
            changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                ScreenName.ACCOUNT,
                App.ScreenMode.SELECT,
                null,
                null,
                HeaderAction.NONE,
                ScreenTitle.SELECT_ACCOUNT
            );

        if (button === this._categoryOption)
        {
            if (this._model.account)
            {
                changeScreenData.screenName = ScreenName.CATEGORY;
                changeScreenData.updateData = this._model.account.categories;
                changeScreenData.headerName = ScreenTitle.SELECT_CATEGORY;
            }
        }
        else if (button === this._timeOption)
        {
            changeScreenData.screenName = ScreenName.SELECT_TIME;
            changeScreenData.updateData = this._model.date;
            changeScreenData.headerName = ScreenTitle.SELECT_TIME;
            changeScreenData.headerRightAction = HeaderAction.CONFIRM;
        }

        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else if (this._noteInput.hitTest(position))
    {
        this._scrollInput = this._noteInput;
        this._focusInput(false);
    }
    else
    {
        if (inputFocused) this._scrollInput.blur();
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AddTransactionScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            App.ScreenName.TRANSACTIONS,
            0,
            null,
            HeaderAction.MENU,
            HeaderAction.ADD_TRANSACTION,
            App.ScreenTitle.TRANSACTIONS
        );

    if (action === App.HeaderAction.CONFIRM)
    {
        //TODO first check if all values are set!
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else
    {
        var collection = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS);

        collection.removeItem(collection.getCurrent()).destroy();

        changeScreenData.screenName = App.ScreenName.BACK;

        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
};

/**
 * On budget field blur
 * @private
 */
App.AddTransactionScreen.prototype._onInputBlur = function _onInputBlur()
{
    App.InputScrollScreen.prototype._onInputBlur.call(this);

    var transaction = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).getCurrent();

    if (this._scrollInput === this._transactionInput) transaction.amount = this._transactionInput.getValue();
    else if (this._scrollInput === this._noteInput) transaction.note = this._noteInput.getValue();
};
