/**
 * @class AddTransactionScreen
 * @extends InputScrollScreen
 * @param {Transaction} model
 * @param {Object} layout
 * @constructor
 */
App.AddTransactionScreen = function AddTransactionScreen(model,layout)
{
    App.InputScrollScreen.call(this,model,layout);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        HeaderAction = App.HeaderAction,
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
            nameStyle:FontStyle.get(18,"#999999"),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInput = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._deleteButton = new App.Button("Delete",{width:inputWidth,height:inputHeight,pixelRatio:r,style:FontStyle.get(18,FontStyle.WHITE),backgroundColor:App.ColorTheme.RED});

    this._toggleButtonList = new App.List(App.Direction.X);
    this._toggleButtonList.add(new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income",toggleColor:false}),false);
    this._toggleButtonList.add(new TransactionToggleButton("pending-app","Pending",toggleOptions,{toggleColor:true}),false);
    this._toggleButtonList.add(new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{toggleColor:true}),true);

    this._optionList = new App.List(App.Direction.Y);
    this._optionList.add(new TransactionOptionButton("account","Account","Personal",ScreenName.ACCOUNT,options),false);
    this._optionList.add(new TransactionOptionButton("folder-app","Category","Cinema\nin Entertainment",ScreenName.CATEGORY,options),false);
    this._optionList.add(new TransactionOptionButton("credit-card","Mode","Cash",ScreenName.CATEGORY,options),false);
    this._optionList.add(new TransactionOptionButton("calendar","Time","14:56\nJan 29th, 2014",ScreenName.SELECT_TIME,options),false);
    this._optionList.add(new TransactionOptionButton("currencies","Currency","CZK",ScreenName.ACCOUNT,options),true);

    //TODO automatically focus input when this screen is shown?

    this._transactionInput.restrict(/\D/);
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
    this._headerInfo.leftAction = HeaderAction.CANCEL;
    this._headerInfo.rightAction = HeaderAction.CONFIRM;
    this._headerInfo.name = "Add Transaction";
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

    bottom = bottom + inputHeight;

    this._deleteButton.x = padding;
    this._deleteButton.y = bottom + padding;

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
    this.resetScroll();//TODO reset before the screen start hiding

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
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            App.Controller.dispatchEvent(
                App.EventType.CHANGE_SCREEN,
                this._optionList.getItemUnderPoint(pointerData).getTargetScreenName()
            );
        }
    }
    else if (this._noteInput.hitTest(position))
    {
        this._scrollInput = this._noteInput;
        this._focusInput(false);
    }
};
