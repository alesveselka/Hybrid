/**
 * @class CategoryButtonEdit
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {{width:number,height:number,pixelRatio:number,nameLabelStyle:{font:string,fill:string},editLabelStyle:{font:string,fill:string}}} options
 * @constructor
 */
App.CategoryButtonEdit = function CategoryButtonEdit(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,Math.round(80*options.pixelRatio));

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._pixelRatio = options.pixelRatio;
    this._swipeSurface = new App.CategoryButtonSurface(options.nameLabelStyle);
    this._background = new PIXI.Graphics();
    this._editLabel = new PIXI.Text("Edit",options.editLabelStyle);

    this._render();

    this.addChild(this._background);
    this.addChild(this._editLabel);
    this.addChild(this._swipeSurface);
};

App.CategoryButtonEdit.prototype = Object.create(App.SwipeButton.prototype);
App.CategoryButtonEdit.prototype.constructor = App.CategoryButtonEdit;

/**
 * Render
 * @private
 */
App.CategoryButtonEdit.prototype._render = function _render()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._swipeSurface.render(w,h,this._pixelRatio);

    App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

    this._editLabel.x = Math.round(w - 50 * this._pixelRatio);
    this._editLabel.y = Math.round(18 * this._pixelRatio);
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.CategoryButtonEdit.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.CategoryButtonEdit.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};
