/**
 * @class Button
 * @extend Graphics
 * @param {string} label
 * @param {{width:number,height:number,pixelRatio:number,style:Object,backgroundColor:number}} options
 * @constructor
 */
App.Button = function Button(label,options)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._pixelRatio = options.pixelRatio;
    this._label = label;
    this._style = options.style;
    this._backgroundColor = options.backgroundColor;
    this._labelField = new PIXI.Text(label,this._style);

    this._render();

    this.addChild(this._labelField);
};

App.Button.prototype = Object.create(PIXI.Graphics.prototype);
App.Button.prototype.constructor = App.Button;

/**
 * Render
 * @private
 */
App.Button.prototype._render = function _render()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height;

    App.GraphicUtils.drawRoundedRect(this,this._backgroundColor,1,0,0,w,h,Math.round(5 * this._pixelRatio));

    this._labelField.x = Math.round((w - this._labelField.width) / 2);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
};

/**
 * Resize
 * @param {number} width
 * @param {number} height
 */
App.Button.prototype.resize = function resize(width,height)
{
    this.boundingBox.width = width || this.boundingBox.width;
    this.boundingBox.height = height || this.boundingBox.height;

    this._render();
};
