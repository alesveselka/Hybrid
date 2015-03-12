/**
 * @class PopUpButton
 * @extend Graphics
 * @param {string} label
 * @param {string} message
 * @param {{width:number,height:number,pixelRatio:number,popUpLayout:{x:number,y:number,width:number,height:number,overlayWidth:number,overlayHeight:number}}} options
 * @constructor
 */
App.PopUpButton = function PopUpButton(label,message,options)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Button = App.Button,
        Graphics = PIXI.Graphics,
        FontStyle = App.FontStyle,
        ColorTheme = App.ColorTheme,
        r = options.pixelRatio,
        w = options.width;

    this.boundingBox = new App.Rectangle(0,0,w,options.height);

    this._pixelRatio = r;
//    this._label = label;
//    this._message = message;
//    this._style = FontStyle.get(18,FontStyle.WHITE);
    this._popUpLayout = options.popUpLayout;
    this._backgroundColor = ColorTheme.RED;
    this._transitionState = App.TransitionState.HIDDEN;
    this._eventsRegistered = App.EventLevel.NONE;

    this._overlay = new Graphics();
    this._buttonBackground = new Graphics();
    this._popUpBackground = new Graphics();
    this._labelField = new PIXI.Text(label,FontStyle.get(18,FontStyle.WHITE));
    this._messageField = new PIXI.Text(message,FontStyle.get(18,FontStyle.BLUE,"center",FontStyle.LIGHT_CONDENSED));
    this._cancelButton = new Button("Cancel",{
        width:w,
        height:Math.round(50*r),
        pixelRatio:r,
        style:FontStyle.get(18,FontStyle.BLACK_LIGHT,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:ColorTheme.GREY_DARK
    });
    this._confirmButton = new Button("Delete",{
        width:w,
        height:Math.round(30*r),
        pixelRatio:r,
        style:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:ColorTheme.RED
    });

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._tween = new App.TweenProxy(0.4,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this._render();

    this.addChild(this._overlay);
    this.addChild(this._buttonBackground);
    this.addChild(this._popUpBackground);
    this.addChild(this._labelField);
    this.addChild(this._messageField);
    this.addChild(this._cancelButton);
    this.addChild(this._confirmButton);
};

App.PopUpButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.PopUpButton.prototype.constructor = App.PopUpButton;

/**
 * Render
 * @private
 */
App.PopUpButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    GraphicUtils.drawRoundedRect(this._buttonBackground,this._backgroundColor,1,0,0,w,h,Math.round(5 * this._pixelRatio));

    this._labelField.x = Math.round((w - this._labelField.width) / 2);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);

    this._overlay.visible = false;
    this._messageField.visible = false;
    this._messageField.alpha = 0.0;
    this._cancelButton.visible = false;
    this._cancelButton.alpha = 0.0;
    this._confirmButton.visible = false;
    this._confirmButton.alpha = 0.0;
};

/**
 * Set message
 * @param {string} message
 * @param {{font:string,fill:string}} style
 */
/*App.PopUpButton.prototype.setMessage = function setMessage(message,style)
{
    this._messageField.setText(message);
    if (style) this._messageField.setStyle(style);
};*/

/**
 * Set position
 * @param {number} x
 * @param {number} y
 */
App.PopUpButton.prototype.setPosition = function setPosition(x,y)
{
    this.boundingBox.x = x;
    this.boundingBox.y = y;

    this.x = x;
    this.y = y;
};

/**
 * Set popUp layout
 * @param {number} x
 * @param {number} y
 * @param {number} overlayWidth
 * @param {number} overlayHeight
 * @param {number} width
 * @param {number} height
 */
App.PopUpButton.prototype.setPopUpLayout = function setPopUpLayout(x,y,overlayWidth,overlayHeight,width,height)
{
    this._popUpLayout.overlayWidth = overlayWidth || this._popUpLayout.overlayWidth;
    this._popUpLayout.overlayHeight = overlayHeight || this._popUpLayout.overlayHeight;
    this._popUpLayout.width = width || this._popUpLayout.width;
    this._popUpLayout.height = height || this._popUpLayout.height;
    this._popUpLayout.x = x || this._popUpLayout.x;
    this._popUpLayout.y = this._popUpLayout.height / 2 - this.boundingBox.y - y;

    //TODO move to render function?
    App.GraphicUtils.drawRect(this._overlay,App.ColorTheme.BLUE,1,0,0,this._popUpLayout.overlayWidth,this._popUpLayout.overlayHeight);

    this._overlay.x = -this.boundingBox.x;
    this._overlay.y = -this.boundingBox.y;
};

/**
 * Show popUp
 */
App.PopUpButton.prototype.showPopUp = function showPopUp()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN || this._transitionState === TransitionState.HIDING)
    {
        this._registerEventListeners(App.EventLevel.LEVEL_1);

        this._transitionState = TransitionState.SHOWING;

        this._tween.restart();
    }
};

/**
 * Hide popUp
 */
App.PopUpButton.prototype.hidePopUp = function hidePopUp()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWN || this._transitionState === TransitionState.SHOWING)
    {
//        this.enable();

        this._transitionState = TransitionState.HIDING;

        this._tween.start(true);

//        this.visible = true;
    }
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.PopUpButton.prototype._registerEventListeners = function _registerEventListeners(level)
{
    var EventLevel = App.EventLevel;

    if (level === EventLevel.LEVEL_1 && this._eventsRegistered !== EventLevel.LEVEL_1)
    {
        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._tween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
    }

    if (level === EventLevel.LEVEL_2 && this._eventsRegistered !== EventLevel.LEVEL_2)
    {
        /*if (App.Device.TOUCH_SUPPORTED)
        {
            this.touchstart = this._onPointerDown;
            this.touchend = this._onPointerUp;
            this.touchendoutside = this._onPointerUp;
        }
        else
        {
            this.mousedown = this._onPointerDown;
            this.mouseup = this._onPointerUp;
            this.mouseupoutside = this._onPointerUp;
        }

        this.interactive = true;*/
    }

    this._eventsRegistered = level;
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.PopUpButton.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    var EventLevel = App.EventLevel;

    if (level === EventLevel.LEVEL_1)
    {
        this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

        this._tween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

        this._eventsRegistered = EventLevel.NONE;
    }

    if (level === EventLevel.LEVEL_2)
    {
        this.interactive = false;

        /*if (App.Device.TOUCH_SUPPORTED)
        {
            this.touchstart = null;
            this.touchend = null;
            this.touchendoutside = null;
        }
        else
        {
            this.mousedown = null;
            this.mouseup = null;
            this.mouseupoutside = null;
        }*/

        this._eventsRegistered = EventLevel.LEVEL_1;
    }
};

/**
 * On tick
 * @private
 */
App.PopUpButton.prototype._onTick = function _onTick()
{
    if (this._tween.isRunning())
    {
        var TransitionState = App.TransitionState;

        if (this._transitionState === TransitionState.SHOWING) this._onTweenUpdate(this._tween.progress);
        else if (this._transitionState === TransitionState.HIDING) this._onTweenUpdate(1.0 - this._tween.progress);
    }
};

/**
 * On tween update
 * @param {number} progress
 * @private
 */
App.PopUpButton.prototype._onTweenUpdate = function _onTweenUpdate(progress)
{
    var r = this._pixelRatio,
        x = this.boundingBox.x,
        y = this.boundingBox.y,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        pw = this._popUpLayout.width,
        ph = this._popUpLayout.height,
        padding = Math.round(10 * r),
        buttonsHeight = this._cancelButton.boundingBox.height + this._confirmButton.boundingBox.height + padding;

    /*App.GraphicUtils.drawRoundedRect(
        this._buttonBackground,
        this._backgroundColor,
        1,
        Math.round(this._popUpLayout.x * progress),
        Math.round(this._popUpLayout.y * progress),
        Math.round(w + this._popUpLayout.width * progress),
        Math.round(h + this._popUpLayout.height * progress),
        Math.round(5 * this._pixelRatio)
    );*/
    this._overlay.visible = true;
    this._overlay.alpha = 0.8 * progress;

    App.GraphicUtils.drawRoundedRect(this._buttonBackground,App.ColorTheme.RED,1,0,0,w+(pw-w)*progress,h+(ph-h)*progress,Math.round(5 * this._pixelRatio));
    App.GraphicUtils.drawRoundedRect(this._popUpBackground,App.ColorTheme.GREY,1,0,0,w+(pw-w)*progress,h+(ph-h)*progress,Math.round(5 * this._pixelRatio));

    this._popUpBackground.x = (this._popUpLayout.x) * progress;
    this._popUpBackground.y = (this._popUpLayout.y) * progress;
    this._buttonBackground.x = this._popUpBackground.x;
    this._buttonBackground.y = this._popUpBackground.y;

    this._cancelButton.resize(this._popUpBackground.width-padding*2);
    this._cancelButton.x = this._popUpBackground.x + padding;
    this._cancelButton.y = this._popUpBackground.y + this._popUpBackground.height - buttonsHeight - padding;
    this._confirmButton.resize(this._popUpBackground.width-padding*2);
    this._confirmButton.x = this._popUpBackground.x + padding;
    this._confirmButton.y = this._cancelButton.y + this._cancelButton.boundingBox.height + padding;

    this._messageField.x = this._popUpBackground.x + (this._popUpBackground.width - this._messageField.width) / 2;
    this._messageField.y = this._popUpBackground.y + ((this._popUpBackground.height - buttonsHeight - padding - this._messageField.height) / 2);

    this._messageField.visible = true;
    this._cancelButton.visible = true;
    this._confirmButton.visible = true;

    this._popUpBackground.alpha = progress;
    this._messageField.alpha = progress;
    this._cancelButton.alpha = progress;
    this._confirmButton.alpha = progress;
    this._labelField.alpha = 1.0 - progress;
};

/**
 * On tween complete
 * @private
 */
App.PopUpButton.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.SHOWN;

//        this.alpha = 1.0;

        this._registerEventListeners(App.EventLevel.LEVEL_2);
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.HIDDEN;

        this._unRegisterEventListeners(App.EventLevel.LEVEL_1);

//        this.alpha = 0.0;

//        this.visible = false;

        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,{target:this,state:this._transitionState});
    }
};

/**
 * Test if position passed in falls within this input boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.PopUpButton.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};
