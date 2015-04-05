/**
 * @class Radio
 * @param {number} pixelRatio
 * @param {boolean} selected
 * @constructor
 */
App.Radio = function Radio(pixelRatio,selected)
{
    PIXI.Graphics.call(this);

    this._selected = selected;
    this._size = Math.round(20 * pixelRatio);
    this._pixelRatio = pixelRatio;
    this._check = new PIXI.Graphics();

    this.boundingBox = new App.Rectangle(0,0,this._size,this._size);

    this._render();

    this._check.alpha = selected ? 1.0 : 0.0;

    this.addChild(this._check);
};

App.Radio.prototype = Object.create(PIXI.Graphics.prototype);

/**
 * Render
 * @private
 */
App.Radio.prototype._render = function _render()
{
    var drawArc = App.GraphicUtils.drawArc,
        ColorTheme = App.ColorTheme,
        size = this._size,
        center = new PIXI.Point(Math.round(size/2),Math.round(size/2));

    drawArc(this,center,size,size,Math.round(2*this._pixelRatio),0,360,20,0,0,0,ColorTheme.GREY,1);

    size -= Math.round(8*this._pixelRatio);

    drawArc(this._check,center,size,size,Math.round(6*this._pixelRatio),0,360,20,0,0,0,ColorTheme.BLUE,1);
};

/**
 * Select
 */
App.Radio.prototype.select = function select()
{
    this._selected = true;

    this._check.alpha = 1.0;
};

/**
 * Select
 */
App.Radio.prototype.deselect = function deselect()
{
    this._selected = false;

    this._check.alpha = 0.0;
};
