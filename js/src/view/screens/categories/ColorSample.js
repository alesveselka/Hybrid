App.ColorSample = function ColorSample(i,color,pixelRatio)
{
    PIXI.Graphics.call(this);

    var size = Math.round(40 * pixelRatio);

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    this.boundingBox.width = size;
    this.boundingBox.height = size;

    this._pixelRatio = pixelRatio;
    this._color = color;
    this._label = new PIXI.Text(i,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#ffffff"});

    this._render();

    this.addChild(this._label);
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

    this._label.x = Math.round((this.boundingBox.width - this._label.width) / 2);
    this._label.y = Math.round((this.boundingBox.height - this._label.height) / 2);
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
