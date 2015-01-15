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
    this._selected = false;

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
    var xPadding = Math.round((this._selected ? 0 : 5) * this._pixelRatio),
        yPadding = Math.round((this._selected ? 5 : 10) * this._pixelRatio),
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
 * @param {number} selectedIndex
 */
App.ColorSample.prototype.setModel = function setModel(index,color,selectedIndex)
{
    this._modelIndex = index;
    this._color = color;

    this._selected = selectedIndex === this._modelIndex;

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

/**
 * Select
 * @param {number} selectedIndex Index of selected item in the collection
 */
App.ColorSample.prototype.select = function select(selectedIndex)
{
    var selected = this._modelIndex === selectedIndex;

    if (this._selected === selected) return;

    this._selected = selected;

    this._render();
};
