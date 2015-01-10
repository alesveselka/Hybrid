App.ColorSample = function ColorSample(color,pixelRatio)
{
    PIXI.Graphics.call(this);

    var size = Math.round(40 * pixelRatio);

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    this.boundingBox.width = size;
    this.boundingBox.height = size;

    this._pixelRatio = pixelRatio;
    this._color = color;

    this._render();
};

App.ColorSample.prototype = Object.create(PIXI.Graphics.prototype);
App.ColorSample.prototype.constructor = App.ColorSample;

/**
 * Render
 * @private
 */
App.ColorSample.prototype._render = function _render()
{
    var padding = Math.round(5 * this._pixelRatio),//TODO padding depends on if its selected or not
        size = this.boundingBox.width - padding * 2;

    this.clear();
    this.beginFill("0x"+this._color);
    this.drawRoundedRect(padding,padding,size,size,padding);
    this.endFill();
};

/**
 * Set color
 * @param {number} value
 */
App.ColorSample.prototype.setColor = function setColor(value)
{
    this._color = value;

    this._render();
};
