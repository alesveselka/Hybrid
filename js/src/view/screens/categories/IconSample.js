App.IconSample = function IconSample(modelIndex,model,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var size = Math.round(64 * pixelRatio);

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    this.boundingBox.width = size;
    this.boundingBox.height = size * 2;

    this._modelIndex = modelIndex;
    this._model = model;
    this._pixelRatio = pixelRatio;
    this._topIcon = PIXI.Sprite.fromFrame(model);
    this._iconResizeRatio = Math.round(32 * pixelRatio) / this._topIcon.height;
    this._selected = false;

    this._render();

    this.addChild(this._topIcon);
};

App.IconSample.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.IconSample.prototype.constructor = App.IconSample;

/**
 * Render
 * @private
 */
App.IconSample.prototype._render = function _render()
{
    var size = this.boundingBox.width;

    this._topIcon.scale.x = this._iconResizeRatio;
    this._topIcon.scale.y = this._iconResizeRatio;
    this._topIcon.x = Math.round((size - this._topIcon.width) / 2);
    this._topIcon.y = Math.round((size - this._topIcon.height) / 2);
    this._topIcon.tint = this._selected ? 0x394264 : 0xcccccc;// TODO pass color from global setting?
};

/**
 * Set color
 * @param {number} index
 * @param {{top:string,bottom:string}} model
 * @param {number} selectedIndex
 */
App.IconSample.prototype.setModel = function setModel(index,model,selectedIndex)
{
    this._modelIndex = index;
    this._model = model;

    this._topIcon.setTexture(PIXI.TextureCache[model]);

    this._selected = selectedIndex === this._modelIndex;

    this._render();
};

/**
 * Return model index
 * @return {number}
 */
App.IconSample.prototype.getModelIndex = function getModelIndex()
{
    return this._modelIndex;
};

/**
 * Select
 * @param {number} selectedIndex Index of selected item in the collection
 */
App.IconSample.prototype.select = function select(selectedIndex)
{
    var selected = this._modelIndex === selectedIndex;

    if (this._selected === selected) return;

    this._selected = selected;

    this._render();
};
