/**
 * @class Input
 * @extends Graphics
 * @param {string} placeholder
 * @param {number} fontSize
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} displayIcon
 * @constructor
 */
App.Input = function Input(placeholder,fontSize,width,height,pixelRatio,displayIcon)
{
    PIXI.Graphics.call(this);

    var fontStyle = Math.round(fontSize * pixelRatio)+"px HelveticaNeueCond";

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._fontSize = fontSize;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._enabled = false;

    this._eventDispatcher = new App.EventDispatcher(App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._placeholder = placeholder;
    this._placeholderStyle = {font:fontStyle,fill:"#efefef"};
    this._currentStyle = this._placeholderStyle;
    this._textStyle = {font:fontStyle,fill:"#394264"};//TODO remove hard-coded values?

    this._text = "";
    this._textField = new PIXI.Text(this._placeholder,this._currentStyle);
    this._inputProxy = document.getElementById("textInputProxy");
    this._inputProxyListeners = {
        focus:this._onFocus.bind(this),
        blur:this._onBlur.bind(this),
        change:this._onChange.bind(this)
    };
    if (displayIcon) this._icon = PIXI.Sprite.fromFrame("clear-app");
    this._iconHitThreshold = Math.round(this._width - 40 * this._pixelRatio);

    this._render();

    this.addChild(this._textField);
    if (this._icon) this.addChild(this._icon);
};

App.Input.prototype = Object.create(PIXI.Graphics.prototype);
App.Input.prototype.constructor = App.Input;

/**
 * Render
 * @private
 */
App.Input.prototype._render = function _render()
{
    var r = this._pixelRatio;

    this._renderBackground(false,r);

    this._textField.x = Math.round(10 * r);
    this._textField.y = Math.round((this._height - this._textField.height) / 2 + r);

    if (this._icon)
    {
        this._icon.width = Math.round(20 * r);
        this._icon.height = Math.round(20 * r);
        this._icon.x = Math.round(this._width - this._icon.width - 10 * r);
        this._icon.y = Math.round((this._height - this._icon.height) / 2);
        this._icon.tint = 0xdddddd;
    }
};

/**
 * Highlight focused input
 * @param {boolean} highlight
 * @param {number} r pixelRatio
 * @private
 */
App.Input.prototype._renderBackground = function _renderBackground(highlight,r)
{
    this.clear();
    this.beginFill(highlight ? 0x0099ff : 0xcccccc);
    this.drawRoundedRect(0,0,this._width,this._height,Math.round(5 * r));
    this.beginFill(0xffffff);
    this.drawRoundedRect(Math.round(r),Math.round(r),this._width-Math.round(2 * r),this._height-Math.round(2 * r),Math.round(4 * r));
    this.endFill();
};

/**
 * Enable
 */
App.Input.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._enabled = true;

        this._registerEventListeners();

        this.interactive = true;
    }
};

/**
 * Disable
 */
App.Input.prototype.disable = function disable()
{
    this._unRegisterEventListeners();
    this._unRegisterProxyEventListeners();

    this.interactive = false;

    this._enabled = false;
};

/**
 * Remove focus
 */
App.Input.prototype.blur = function blur()
{
    this._inputProxy.blur();
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Input.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Input.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Register event listeners
 * @private
 */
App.Input.prototype._registerEventListeners = function _registerEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
    else this.click = this._onClick;
};

/**
 * UnRegister event listeners
 * @private
 */
App.Input.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED) this.tap = null;
    else this.click = null;
};

/**
 * Register input proxy event listeners
 * @private
 */
App.Input.prototype._registerProxyEventListeners = function _registerEventListeners()
{
    var EventType = App.EventType;
    this._inputProxy.addEventListener(EventType.FOCUS,this._inputProxyListeners.focus,false);
    this._inputProxy.addEventListener(EventType.BLUR,this._inputProxyListeners.blur,false);
    this._inputProxy.addEventListener(EventType.CHANGE,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.KEY_PRESS,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.PASTE,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.TEXT_INPUT,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.INPUT,this._inputProxyListeners.change,false);
};

/**
 * Register input proxy event listeners
 * @private
 */
App.Input.prototype._unRegisterProxyEventListeners = function _registerEventListeners()
{
    var EventType = App.EventType;
    this._inputProxy.removeEventListener(EventType.FOCUS,this._inputProxyListeners.focus,false);
    this._inputProxy.removeEventListener(EventType.BLUR,this._inputProxyListeners.blur,false);
    this._inputProxy.removeEventListener(EventType.CHANGE,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.KEY_PRESS,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.PASTE,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.TEXT_INPUT,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.INPUT,this._inputProxyListeners.change,false);
};

/**
 * On click
 * @param {InteractionData} data
 * @private
 */
App.Input.prototype._onClick = function _onClick(data)
{
    if (this._inputProxy !== document.activeElement)
    {
        this._renderBackground(true,this._pixelRatio);

        this._registerProxyEventListeners();

        this._inputProxy.focus();
    }

    if (this._icon)
    {
        // If user click/tap at 'close' icon, erase actual text
        if (data.getLocalPosition(this).x >= this._iconHitThreshold)
        {
            this._inputProxy.value = "";
            this._onChange();
        }
    }
};

/**
 * On input proxy focus
 * @private
 */
App.Input.prototype._onFocus = function _onFocus()
{
    var r = this._pixelRatio,
        localPoint = this.toLocal(new PIXI.Point(this.x,this.y),this.stage);

    this._inputProxy.style.display = "none";
    this._inputProxy.style.left = Math.round((this.x - localPoint.x) / r) +"px";
    this._inputProxy.style.top = Math.round((this.y - localPoint.y) / r) + "px";
    this._inputProxy.style.width = this._icon ? Math.round(this._iconHitThreshold / r) + "px" : Math.round(this._width / r) + "px";
    this._inputProxy.style.height = Math.round(this._height / r) + "px";
    this._inputProxy.style.fontSize = this._fontSize + "px";
    this._inputProxy.style.lineHeight = this._fontSize + "px";
    this._inputProxy.value = this._text;
    this._inputProxy.style.display = "block";

    this._eventDispatcher.dispatchEvent(App.EventType.FOCUS);
};

/**
 * On input proxy blur
 * @private
 */
App.Input.prototype._onBlur = function _onBlur()
{
    this._updateText(true);

    this._inputProxy.style.top = "-1000px";
    this._inputProxy.value = "";

    this._renderBackground(false,this._pixelRatio);

    this._unRegisterProxyEventListeners();

    this._eventDispatcher.dispatchEvent(App.EventType.BLUR);
};

/**
 * Input change handler
 * @param {Event} [e=null]
 * @private
 */
App.Input.prototype._onChange = function _onChange(e)
{
    this._updateText(false);

    // If RETURN is hit, remove focus
    if (e && e.keyCode === 13) this._inputProxy.blur();
};

/**
 * Update text
 * @param {boolean} [finish=false]
 * @private
 */
App.Input.prototype._updateText = function _updateText(finish)
{
    this._text = this._format(finish);

    if (this._text === this._placeholder || this._text.length === 0)
    {
        if (this._currentStyle === this._textStyle)
        {
            this._currentStyle = this._placeholderStyle;
            this._textField.setStyle(this._currentStyle);
        }

        this._textField.setText(this._placeholder);
    }
    else
    {
        if (this._currentStyle === this._placeholderStyle)
        {
            this._currentStyle = this._textStyle;
            this._textField.setStyle(this._currentStyle);
        }

        this._textField.setText(this._text);
    }
};

/**
 * Format the text input
 * @param {boolean} [finish=false]
 * @private
 */
App.Input.prototype._format = function _format(finish)
{
    return this._inputProxy.value;
};
