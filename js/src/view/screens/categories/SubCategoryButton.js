/**
 * @class SubCategoryButton
 * @param {string} label
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.SubCategoryButton = function SubCategoryButton(label,width,pixelRatio)
{
    App.SwipeButton.call(this,width,Math.round(80*pixelRatio));

    var FontStyle = App.FontStyle;

    this.boundingBox = new App.Rectangle(0,0,width,Math.round(40*pixelRatio));

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._swipeSurface = new PIXI.Graphics();
    this._labelField = new PIXI.Text(label,FontStyle.get(14,FontStyle.BLUE));
    this._background = new PIXI.Graphics();
    this._deleteLabel = new PIXI.Text("Delete",FontStyle.get(14,FontStyle.WHITE));

    this._render();

    this.addChild(this._background);
    this.addChild(this._deleteLabel);
    this._swipeSurface.addChild(this._labelField);
    this.addChild(this._swipeSurface);
};

App.SubCategoryButton.prototype = Object.create(App.SwipeButton.prototype);
App.SubCategoryButton.prototype.constructor = App.SubCategoryButton;

/**
 * Render
 * @private
 */
App.SubCategoryButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        padding = Math.round(10 * r);

    GraphicUtils.drawRect(this._background,ColorTheme.SWIPE_BACKGROUND,1,0,0,w,h);

    this._deleteLabel.x = Math.round(w - 50 * r);
    this._deleteLabel.y = Math.round((h - this._deleteLabel.height) / 2);

    GraphicUtils.drawRects(this._swipeSurface,ColorTheme.BACKGROUND,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this._swipeSurface,ColorTheme.LIGHT_SHADE,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this._swipeSurface,ColorTheme.DARK_SHADE,1,[padding,h-1,w-padding*2,1],false,true);

    this._labelField.x = Math.round(20 * r);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.SubCategoryButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.SubCategoryButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};