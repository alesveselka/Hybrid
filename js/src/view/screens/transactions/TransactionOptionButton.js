/**
 * @class TransactionOptionButton
 * @extends Graphics
 * @param {string} iconName
 * @param {string} name
 * @param {number} targetScreenName
 * @param {{width:number,height:number,pixelRatio:number,nameStyle:Object,valueStyle:Object,valueDetailStyle:Object}} options
 * @constructor
 */
App.TransactionOptionButton = function TransactionOptionButton(iconName,name,targetScreenName,options)
{
    PIXI.DisplayObjectContainer.call(this);

    var Text = PIXI.Text,
        Sprite = PIXI.Sprite;

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._options = options;
    this._pixelRatio = options.pixelRatio;
    this._skin = new Sprite(options.skin);
    this._icon = new Sprite.fromFrame(iconName);
    this._nameField = new Text(name,options.nameStyle);
    this._valueField = new Text("",options.valueStyle);
    this._valueDetailField = null;
    this._targetScreenName = targetScreenName;
    this._arrow = new Sprite.fromFrame("arrow-app");
    this._iconResizeRatio = Math.round(20 * this._pixelRatio) / this._icon.height;
    this._arrowResizeRatio = Math.round(12 * this._pixelRatio) / this._arrow.height;

    this._render();
    this._update();

    this.addChild(this._skin);
    this.addChild(this._icon);
    this.addChild(this._nameField);
    this.addChild(this._valueField);
    this.addChild(this._arrow);
};

App.TransactionOptionButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.TransactionOptionButton.prototype.constructor = App.TransactionOptionButton;

/**
 * Render
 * @private
 */
App.TransactionOptionButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        h = this.boundingBox.height;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = ColorTheme.GREY_DARK;

    this._nameField.x = Math.round(50 * r);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);

    this._arrow.scale.x = this._arrowResizeRatio;
    this._arrow.scale.y = this._arrowResizeRatio;
    this._arrow.x = Math.round(this.boundingBox.width - 15 * r - this._arrow.width);
    this._arrow.y = Math.round((h - this._arrow.height) / 2);
    this._arrow.tint = ColorTheme.GREY_DARK;
};

/**
 * Update
 * @private
 */
App.TransactionOptionButton.prototype._update = function _update()
{
    var r = this._pixelRatio,
        offset = this.boundingBox.width - 35 * r;

    this._valueField.x = Math.round(offset - this._valueField.width);
    if (this._valueDetailField)
    {
        this._valueField.y = Math.round(9 * r);
        this._valueDetailField.y = Math.round(30 * r);
        this._valueDetailField.x = Math.round(offset - this._valueDetailField.width);
    }
    else
    {
        this._valueField.y = Math.round((this.boundingBox.height - this._valueField.height) / 2);
    }
};

/**
 * Set value
 * @param {string} value
 * @param {string} [details=null]
 */
App.TransactionOptionButton.prototype.setValue = function setValue(value,details)
{
    this._valueField.setText(value);

    if (details)
    {
        if (this._valueDetailField)
        {
            this._valueDetailField.setText(details);
        }
        else
        {
            this._valueDetailField = new PIXI.Text(details,this._options.valueDetailStyle);
            this.addChild(this._valueDetailField);
        }
    }

    this._update();
};
