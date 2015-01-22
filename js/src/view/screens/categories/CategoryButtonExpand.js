/**
 * @class CategoryButtonExpand
 * @extends ExpandButton
 * @param {Category} model
 * @param {Object} layout
 * @param {{font:string,fill:string}} nameLabelStyle
 * @constructor
 */
App.CategoryButtonExpand = function CategoryButtonExpand(model,layout,nameLabelStyle)
{
    App.ExpandButton.call(this,layout.width,Math.round(50 * layout.pixelRatio));

    this._model = model;
    this._layout = layout;
    this._surface = new App.CategoryButtonSurface(model.icon,model.name,nameLabelStyle);
    this._subCategoryList = new PIXI.Graphics();

    this._render();

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

    this._surface.render(w,this.boundingBox.height,this._layout.pixelRatio);

    App.GraphicUtils.drawRect(this._subCategoryList,App.ColorTheme.GREY_LIGHT,1,0,0,w,300);
};
