/**
 * @class CategoryButtonExpand
 * @extends ExpandButton
 * @param {number} poolIndex
 * @param {{width:number,height:number,pixelRatio:number,nameLabelStyle:{font:string,fill:string},editLabelStyle:{font:string,fill:string}}} options
 * @constructor
 */
App.CategoryButtonExpand = function CategoryButtonExpand(poolIndex,options)
{
    App.ExpandButton.call(this,options.width,options.height,true);

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._pixelRatio = options.pixelRatio;
    this._surface = new App.CategoryButtonSurface(options.nameLabelStyle);
    this._subCategoryList = new PIXI.Graphics();

    this._setContent(this._subCategoryList);
    this.addChild(this._subCategoryList);
    this.addChild(this._surface);
};

App.CategoryButtonExpand.prototype = Object.create(App.ExpandButton.prototype);
App.CategoryButtonExpand.prototype.constructor = App.CategoryButtonExpand;

/**
 * Render
 * @private
 */
App.CategoryButtonExpand.prototype._render = function _render()
{
    var w = this.boundingBox.width;

    this._surface.render(this._model.name,this._model.icon,w,this.boundingBox.height,this._pixelRatio);

    App.GraphicUtils.drawRect(this._subCategoryList,App.ColorTheme.GREY_LIGHT,1,0,0,w,300);
};

/**
 * Update
 * @param {Category} model
 */
App.CategoryButtonExpand.prototype.update = function update(model)
{
    this._model = model;

    this._render();
};

/**
 * Destroy
 */
App.CategoryButtonExpand.prototype.destroy = function destroy()
{
    App.ExpandButton.prototype.destroy.call(this);
};
