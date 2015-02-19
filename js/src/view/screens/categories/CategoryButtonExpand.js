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
    this._mode = null;
    this._pixelRatio = options.pixelRatio;
    this._surface = new App.CategoryButtonSurface(options.nameLabelStyle,options.skin);
    this._subCategoryList = new App.SubCategoryList(options.width,this._pixelRatio);

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
    this._surface.render(this._model.name,this._model.icon,this.boundingBox.width,this.boundingBox.height,this._pixelRatio);//TODO do I have to pass width and height?
};

/**
 * Update
 * @param {Category} model
 * @param {string} mode
 */
App.CategoryButtonExpand.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    //this._subCategoryList.update(model,mode);

    this._contentHeight = this._subCategoryList.boundingBox.height;

    this._render();

    this.close(true);
};

App.CategoryButtonExpand.prototype.open = function open()
{
    this._subCategoryList.update(this._model,this._mode);

    this._contentHeight = this._subCategoryList.boundingBox.height;

    App.ExpandButton.prototype.open.call(this);
};

/**
 * Disable
 */
App.CategoryButtonExpand.prototype.disable = function disable()
{
    this.close(true);
};
