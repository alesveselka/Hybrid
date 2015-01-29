/**
 * @class AddTransactionScreen
 * @extends Screen
 * @param {Transaction} model
 * @param {Object} layout
 * @constructor
 */
App.AddTransactionScreen = function AddTransactionScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(10 * r) * 2,
        inputHeight = Math.round(40 * r),
        FontStyle = App.FontStyle,
        ColorTheme = App.ColorTheme,
        toggleOptions = {
            width:Math.round(w / 3),
            height:Math.round(40 * r),
            pixelRatio:r,
            style:FontStyle.get(14,FontStyle.BLUE)
        },
        options = {
            pixelRatio:r,
            width:w,
            height:Math.round(50*r),
            nameStyle:FontStyle.get(18,"#999999"),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.height,r);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInpup = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._notePosition = 0;
    this._scrollTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._scrollState = App.TransitionState.HIDDEN;

    this._toggleButtonList = new App.List(App.Direction.X);
    this._toggleButtonList.add(new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income"}),false);
    this._toggleButtonList.add(new TransactionToggleButton("pending-app","Pending",toggleOptions,{color:0xffffff,background:ColorTheme.BLUE}),false);
    this._toggleButtonList.add(new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{color:0xffffff,background:ColorTheme.BLUE}),true);

    this._optionList = new App.List(App.Direction.Y);
    this._optionList.add(new TransactionOptionButton("account","Account","Personal",options),false);
    this._optionList.add(new TransactionOptionButton("folder-app","Category","Cinema\nin Entertainment",options),false);
    this._optionList.add(new TransactionOptionButton("credit-card","Mode","Cash",options),false);
    this._optionList.add(new TransactionOptionButton("calendar","Time","14:56\nJan 29th, 2014",options),false);
    this._optionList.add(new TransactionOptionButton("currencies","Currency","CZK",options),true);

    //TODO add overlay for bluring inputs?

    this._transactionInpup.restrict(/\D/);
    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._transactionInpup);
    this._container.addChild(this._toggleButtonList);
    this._container.addChild(this._optionList);
    this._container.addChild(this._noteInput);
    this._pane.setContent(this._container);
    this.addChild(this._pane);
};

App.AddTransactionScreen.prototype = Object.create(App.Screen.prototype);
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
        separatorWidth = w - padding * 2;

    this._transactionInpup.x = padding;
    this._transactionInpup.y = padding;

    this._toggleButtonList.y = inputHeight;

    this._optionList.y = this._toggleButtonList.y + toggleHeight;

    this._notePosition = this._optionList.y + this._optionList.boundingBox.height;

    this._noteInput.x = padding;
    this._noteInput.y = this._notePosition + padding;

    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w,this._notePosition+inputHeight],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[
        padding,inputHeight-1,separatorWidth,1,
        toggleWidth-1,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2-1,inputHeight+padding,1,toggleHeight-padding*2,
        padding,inputHeight+toggleHeight-1,separatorWidth,1
    ],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[
        padding,inputHeight,separatorWidth,1,
        toggleWidth,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2,inputHeight+padding,1,toggleHeight-padding*2,
        padding,this._notePosition,separatorWidth,1
    ],false,true);
};

/**
 * Enable
 */
App.AddTransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._transactionInpup.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.AddTransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._transactionInpup.disable();
    this._noteInput.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.AddTransactionScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.Screen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._noteInput.addEventListener(EventType.BLUR,this,this._onNoteBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.Screen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onNoteBlur);
};

/**
 * Click handler
 * @private
 */
App.AddTransactionScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var position = this.stage.getTouchData().getLocalPosition(this._container),
        y = position.y,
        list = null;

    if (y >= this._noteInput.y && y < this._noteInput.y + this._noteInput.boundingBox.height)
    {
        this._focusNote();
    }
};

/**
 * On tick
 * @private
 */
App.AddTransactionScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._scrollTween.isRunning()) this._onScrollTweenUpdate();
};

/**
 * On scroll tween update
 * @private
 */
App.AddTransactionScreen.prototype._onScrollTweenUpdate = function _onScrollTweenUpdate()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWING)
    {
        this._pane.y = -Math.round((this._notePosition + this._container.y) * this._scrollTween.progress);
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._pane.y = -Math.round((this._notePosition + this._container.y) * (1 - this._scrollTween.progress));
    }
};

/**
 * On scroll tween complete
 * @private
 */
App.AddTransactionScreen.prototype._onScrollTweenComplete = function _onScrollTweenComplete()
{
    var TransitionState = App.TransitionState;

    this._onScrollTweenUpdate();

    if (this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.SHOWN;

        this._noteInput.enable();
        this._noteInput.focus();
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
App.AddTransactionScreen.prototype._focusNote = function _focusNote()
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
App.AddTransactionScreen.prototype._onNoteBlur = function _onNoteBlur()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWN || this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.HIDING;

        this._noteInput.disable();

        this._scrollTween.restart();
    }
};
