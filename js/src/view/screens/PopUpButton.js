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
    this._popUpLayout = options.popUpLayout;
    this._backgroundColor = ColorTheme.RED;
    this._transitionState = App.TransitionState.HIDDEN;
    this._eventsRegistered = App.EventLevel.NONE;

    this._overlay = this.addChild(new Graphics());
    this._container = this.addChild(new Graphics());
    this._popUpBackground = this._container.addChild(new Graphics());
    this._labelField = this._container.addChild(new PIXI.Text(label,FontStyle.get(18,FontStyle.WHITE)));
    this._messageField = this._container.addChild(new PIXI.Text(message,FontStyle.get(18,FontStyle.BLUE,"center",FontStyle.LIGHT_CONDENSED)));
    this._cancelButton = this._container.addChild(new Button("Cancel",{
        width:w,
        height:Math.round(50*r),
        pixelRatio:r,
        style:FontStyle.get(18,FontStyle.BLACK_LIGHT,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:ColorTheme.GREY_DARK
    }));
    this._confirmButton = this._container.addChild(new Button("Delete",{
        width:w,
        height:Math.round(30*r),
        pixelRatio:r,
        style:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:ColorTheme.RED
    }));
    this._containerMask = this._container.addChild(new Graphics());
    this._container.mask = this._containerMask;

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._tween = new App.TweenProxy(0.3,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this._updateLayout(0);
};

App.PopUpButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.PopUpButton.prototype.constructor = App.PopUpButton;

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

    this._overlay.x = -x;
    this._overlay.y = -y;
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

        this._onShowStart();

        this._transitionState = TransitionState.SHOWING;

        this._tween.restart();
    }
};

/**
 * Hide popUp
 * @param {boolean} immediate
 */
App.PopUpButton.prototype.hidePopUp = function hidePopUp(immediate)
{
    var TransitionState = App.TransitionState;

    if (immediate)
    {
        this._unRegisterEventListeners(App.EventLevel.LEVEL_2);

        this._transitionState = TransitionState.HIDDEN;

        this._tween.stop();

        this._updateLayout(0);
        this._onHideComplete();
    }
    else
    {
        if (this._transitionState === TransitionState.SHOWN || this._transitionState === TransitionState.SHOWING)
        {
            this._unRegisterEventListeners(App.EventLevel.LEVEL_2);

            this._transitionState = TransitionState.HIDING;

            this._tween.start(true);
        }
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
        if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
        else this.click = this._onClick;

        this.interactive = true;
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

        if (App.Device.TOUCH_SUPPORTED) this.tap = null;
        else this.click = null;

        this._eventsRegistered = EventLevel.LEVEL_1;
    }
};

/**
 * Click handler
 * @param {PIXI.InteractionData} data
 * @private
 */
App.PopUpButton.prototype._onClick = function _onClick(data)
{
    var position = this.stage.getTouchData().getLocalPosition(this._container);

    if (this._cancelButton.hitTest(position)) this._eventDispatcher.dispatchEvent(App.EventType.CANCEL);
    else if (this._confirmButton.hitTest(position)) this._eventDispatcher.dispatchEvent(App.EventType.CONFIRM);
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

        if (this._transitionState === TransitionState.SHOWING) this._updateLayout(this._tween.progress);
        else if (this._transitionState === TransitionState.HIDING) this._updateLayout(1.0 - this._tween.progress);
    }
};

/**
 * On show start
 * @private
 */
App.PopUpButton.prototype._onShowStart = function _onShowStart()
{
    var padding = Math.round(10 * this._pixelRatio);

    this._cancelButton.x = padding;
    this._confirmButton.x = padding;

    App.GraphicUtils.drawRect(this._overlay,App.ColorTheme.BLUE,1,0,0,this._popUpLayout.overlayWidth,this._popUpLayout.overlayHeight);
    this._overlay.alpha = 0.0;
    this._overlay.visible = true;

    this._popUpBackground.alpha = 0.0;
    this._popUpBackground.visible = true;

    this._messageField.alpha = 0.0;
    this._messageField.visible = true;

    this._cancelButton.alpha = 0.0;
    this._cancelButton.visible = true;

    this._confirmButton.alpha = 0.0;
    this._confirmButton.visible = true;
};

/**
 * Update layout
 * @param {number} progress
 * @private
 */
App.PopUpButton.prototype._updateLayout = function _updateLayout(progress)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        bw = this.boundingBox.width,
        bh = this.boundingBox.height,
        w = Math.round(bw + (this._popUpLayout.width - bw) * progress),
        h = Math.round(bh + (this._popUpLayout.height - bh) * progress),
        padding = Math.round(10 * r),
        radius = Math.round(5 * r),
        buttonWidth = Math.round(w - padding * 2),
        buttonsHeight = this._cancelButton.boundingBox.height + this._confirmButton.boundingBox.height + padding;

    GraphicUtils.drawRect(this._containerMask,ColorTheme.BLACK,1,0,0,w,h);
    GraphicUtils.drawRoundedRect(this._container,ColorTheme.RED,1,0,0,w,h,radius);
    GraphicUtils.drawRoundedRect(this._popUpBackground,ColorTheme.GREY,1,0,0,w,h,radius);

    this._container.x = Math.round(this._popUpLayout.x * progress);
    this._container.y = Math.round(this._popUpLayout.y * progress);

    this._cancelButton.resize(buttonWidth);
    this._cancelButton.y = h - buttonsHeight - padding;
    this._confirmButton.resize(buttonWidth);
    this._confirmButton.y = this._cancelButton.y + this._cancelButton.boundingBox.height + padding;

    this._labelField.x = Math.round((w - this._labelField.width) / 2);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
    this._messageField.x = Math.round((w - this._messageField.width) / 2);
    this._messageField.y = Math.round((h - buttonsHeight - padding - this._messageField.height) / 2);

    this._overlay.alpha = 0.8 * progress;
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

        this._registerEventListeners(App.EventLevel.LEVEL_2);

        this._updateLayout(1);
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.HIDDEN;

        this._updateLayout(0);

        this._onHideComplete();
    }
};

/**
 * On hide complete
 * @private
 */
App.PopUpButton.prototype._onHideComplete = function _onHideComplete()
{
    this._unRegisterEventListeners(App.EventLevel.LEVEL_1);

    this._overlay.visible = false;
    this._popUpBackground.visible = false;
    this._messageField.visible = false;
    this._cancelButton.visible = false;
    this._confirmButton.visible = false;

    this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,{target:this,state:this._transitionState});
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

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.PopUpButton.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.PopUpButton.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};
