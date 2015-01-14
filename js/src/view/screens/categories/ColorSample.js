App.ColorSample = function ColorSample(modelIndex,color,pixelRatio)
{
    PIXI.Graphics.call(this);

    var width = Math.round(40 * pixelRatio),
        height = Math.round(50 * pixelRatio);

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    this.boundingBox.width = width;
    this.boundingBox.height = height;

    this._modelIndex = modelIndex;
    this._pixelRatio = pixelRatio;
    this._color = color;
    this._label = new PIXI.Text(modelIndex,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#000000"});

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
    var xPadding = Math.round(5 * this._pixelRatio),//TODO padding depends on if its selected or not
        yPadding = Math.round(10 * this._pixelRatio),//TODO padding depends on if its selected or not
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this.clear();
    this.beginFill("0x"+this._color);
    this.drawRoundedRect(xPadding,yPadding,w-xPadding*2,h-yPadding*2,Math.round(5*this._pixelRatio));
    this.endFill();

    this._label.setText(this._modelIndex);
    this._label.x = Math.round((w - this._label.width) / 2);
    this._label.y = Math.round((h - this._label.height) / 2);
};

/**
 * Set color
 * @param {number} index
 * @param {number} color
 */
App.ColorSample.prototype.setModel = function setModel(index,color)
{
    this._modelIndex = index;
    this._color = color;

    this._render();
};

/**
 * Return model index
 * @return {number}
 */
App.ColorSample.prototype.getModelIndex = function getModelIndex()
{
    return this._modelIndex;
};
