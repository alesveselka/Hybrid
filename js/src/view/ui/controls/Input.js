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

    var FontStyle = App.FontStyle;

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._fontSize = fontSize;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._enabled = false;
    this._focused = false;

    this._eventDispatcher = new App.EventDispatcher(App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._placeholder = placeholder;
    this._placeholderStyle = FontStyle.get(fontSize,FontStyle.GREY);
    this._currentStyle = this._placeholderStyle;
    this._textStyle = FontStyle.get(fontSize,FontStyle.BLUE);
    this._restrictPattern = null;

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
    var ColorTheme = App.ColorTheme;

    this.clear();
    this.beginFill(highlight ? ColorTheme.INPUT_HIGHLIGHT : ColorTheme.GREY_DARK);
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
 * Set restriction pattern
 * @param {RegExp} pattern
 */
App.Input.prototype.restrict = function restrict(pattern)
{
    this._restrictPattern = pattern;
};

/**
 * Is input focused?
 * @returns {boolean}
 */
App.Input.prototype.isFocused = function isFocused()
{
    return this._focused;
};

/**
 * Focus
 */
App.Input.prototype.focus = function focus()
{
    if (!this._focused)
    {
        this._renderBackground(true,this._pixelRatio);

        this._registerProxyEventListeners();

        this._inputProxy.focus();// requires Cordova preference: <preference name="KeyboardDisplayRequiresUserAction" value="false"/>

        this._focused = true;
    }
};

/**
 * Remove focus
 */
App.Input.prototype.blur = function blur()
{
    this._inputProxy.blur();

    this._unRegisterProxyEventListeners();

    this._focused = false;
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
App.Input.prototype._registerProxyEventListeners = function _registerProxyEventListeners()
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
App.Input.prototype._unRegisterProxyEventListeners = function _unRegisterProxyEventListeners()
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
    if (this._inputProxy !== document.activeElement) this.focus();

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

    this._focused = true;

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
    this._focused = false;

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
    //TODO limit text length to the input's width (minus 'clear' button width)
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
    if (this._restrictPattern)
    {
        var result = this._inputProxy.value.match(this._restrictPattern);
        if (result && result.length > 0) this._inputProxy.value = result[0];
        else this._inputProxy.value = "";
    }

    return this._inputProxy.value;
};

/**
 * Set value
 * @param {string} value
 */
App.Input.prototype.setValue = function setValue(value)
{
    this._inputProxy.value = value;
    this._updateText(false);
};

/**
 * Set value
 * @returns {string}
 */
App.Input.prototype.getValue = function getValue()
{
    return this._text;
};

/**
 * Set value
 * @param {string} value
 */
App.Input.prototype.setPlaceholder = function setPlaceholder(value)
{
    //TODO is this used?
    this._placeholder = value;
    this._updateText(false);
};

/**
 * Test if position passed in falls within this input boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.Input.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};
