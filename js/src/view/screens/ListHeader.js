/**
 * @class ListHeader
 * @param {string} label
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.ListHeader = function ListHeader(label,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    this._width = width;
    this._pixelRatio = pixelRatio;
    this._textField = new PIXI.Text(label,{font:Math.round(12 * pixelRatio)+"px HelveticaNeueCond",fill:"#ffffff"});

    this._render();

    this.addChild(this._textField);
};

App.ListHeader.prototype = Object.create(PIXI.Graphics.prototype);
App.ListHeader.prototype.constructor = App.ListHeader;

/**
 * Render
 * @private
 */
App.ListHeader.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        r = this._pixelRatio,
        h = Math.round(30 * this._pixelRatio);

    GraphicUtils.drawRects(this,0x394264,1,[0,0,this._width,h],true,false);
    GraphicUtils.drawRects(this,0x252B44,1,[0,h-1,this._width,1],false,true);

    this._textField.x = Math.round((this._width - this._textField.width) / 2);
    this._textField.y = Math.round((h - this._textField.height) / 2);
};
