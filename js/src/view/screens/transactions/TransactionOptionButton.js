/**
 * @class TransactionOptionButton
 * @extends Graphics
 * @param {string} iconName
 * @param {string} name
 * @param {string} value
 * @param {number} targetScreenName
 * @param {{width:number,height:number,pixelRatio:number,nameStyle:Object,valueStyle:Object,valueDetailStyle:Object}} options
 * @constructor
 */
App.TransactionOptionButton = function TransactionOptionButton(iconName,name,value,targetScreenName,options)
{
    PIXI.Graphics.call(this);

    var Text = PIXI.Text,
        Sprite = PIXI.Sprite;

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._pixelRatio = options.pixelRatio;
    this._icon = new Sprite.fromFrame(iconName);
    this._nameField = new Text(name,options.nameStyle);
    this._valueField = new Text(value,options.valueStyle);
    this._valueDetailField = null;
    this._targetScreenName = targetScreenName;
    this._arrow = new Sprite.fromFrame("arrow-app");
    this._iconResizeRatio = Math.round(20 * this._pixelRatio) / this._icon.height;
    this._arrowResizeRatio = Math.round(12 * this._pixelRatio) / this._arrow.height;

    if (value.indexOf("\n") > -1)
    {
        this._valueField.setText(value.substring(0,value.indexOf("\n")));
        this._valueDetailField = new Text(value.substring(value.indexOf("\n"),value.length),options.valueDetailStyle);
    }

    this._render();

    this.addChild(this._icon);
    this.addChild(this._nameField);
    this.addChild(this._valueField);
    if (this._valueDetailField) this.addChild(this._valueDetailField);
    this.addChild(this._arrow);
};

App.TransactionOptionButton.prototype = Object.create(PIXI.Graphics.prototype);
App.TransactionOptionButton.prototype.constructor = App.TransactionOptionButton;

/**
 * Render
 * @private
 */
App.TransactionOptionButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        padding = Math.round(10 * r);

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = ColorTheme.GREY_DARK;

    this._nameField.x = Math.round(50 * r);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);

    this._valueField.x = Math.round(w - 35 * r - this._valueField.width);
    if (this._valueDetailField)
    {
        this._valueField.y = Math.round(9 * r);
        this._valueDetailField.y = Math.round(17 * r);
        this._valueDetailField.x = Math.round(w - 35 * r - this._valueDetailField.width);
    }
    else
    {
        this._valueField.y = Math.round((h - this._valueField.height) / 2);
    }

    this._arrow.scale.x = this._arrowResizeRatio;
    this._arrow.scale.y = this._arrowResizeRatio;
    this._arrow.x = Math.round(w - 15 * r - this._arrow.width);
    this._arrow.y = Math.round((h - this._arrow.height) / 2);
    this._arrow.tint = ColorTheme.GREY_DARK;

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);
};

/**
 * Return target screen name
 * @returns {number}
 */
App.TransactionOptionButton.prototype.getTargetScreenName = function getTargetScreenName()
{
    return this._targetScreenName;
};
