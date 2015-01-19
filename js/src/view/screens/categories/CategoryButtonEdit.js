/**
 * @class CategoryButtonEdit
 * @extends SwipeButton
 * @param {Category} model
 * @param {Object} layout
 * @param {{font:string,fill:string}} nameLabelStyle
 * @param {{font:string,fill:string}} editLabelStyle
 * @constructor
 */
App.CategoryButtonEdit = function CategoryButtonEdit(model,layout,nameLabelStyle,editLabelStyle)
{
    App.SwipeButton.call(this,layout.width,Math.round(80*layout.pixelRatio));

    this.boundingBox = new App.Rectangle(0,0,layout.width,Math.round(50*layout.pixelRatio));

    this._model = model;
    this._layout = layout;
    this._swipeSurface = new App.CategoryButtonSurface(model.icon,model.name,nameLabelStyle);
    this._background = new PIXI.Graphics();
    this._editLabel = new PIXI.Text("Edit",editLabelStyle);

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
    var pixelRatio = this._layout.pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._swipeSurface.render(w,h,pixelRatio);

    App.GraphicUtils.drawRect(this._background,App.ColorTheme.SWIPE_BACKGROUND,1,0,0,w,h);

    this._editLabel.x = Math.round(w - 50 * pixelRatio);
    this._editLabel.y = Math.round(18 * pixelRatio);
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
