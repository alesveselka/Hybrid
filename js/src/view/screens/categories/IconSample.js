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
    this._topIcon = PIXI.Sprite.fromFrame(model/*.top*/);
    //this._bottomIcon = PIXI.Sprite.fromFrame(model.bottom);
    this._iconResizeRatio = Math.round(32 * pixelRatio) / this._topIcon.height;

    this._render();

    this.addChild(this._topIcon);
    //this.addChild(this._bottomIcon);
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
    this._topIcon.tint = 0xcccccc;// TODO pass color from global setting?

    /*this._bottomIcon.scale.x = this._iconResizeRatio;
    this._bottomIcon.scale.y = this._iconResizeRatio;
    this._bottomIcon.x = Math.round((size - this._bottomIcon.width) / 2);
    this._bottomIcon.y = size + Math.round((size - this._bottomIcon.height) / 2);
    this._bottomIcon.tint = 0x394264;// TODO pass color from global setting?*/
};

/**
 * Set color
 * @param {number} index
 * @param {{top:string,bottom:string}} model
 */
App.IconSample.prototype.setModel = function setModel(index,model)
{
    this._modelIndex = index;
    this._model = model;

    this._topIcon.setTexture(PIXI.TextureCache[model/*.top*/]);
    //this._bottomIcon.setTexture(PIXI.TextureCache[model.bottom]);

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
