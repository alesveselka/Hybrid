/**
 * @class SubCategoryButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {number} options.openOffset
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.deleteLabelStyle
 * @constructor
 */
App.SubCategoryButton = function SubCategoryButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._mode = null;
    this._pixelRatio = options.pixelRatio;
    this._swipeSurface = new PIXI.Graphics();
    this._nameLabel = new PIXI.Text("",options.nameLabelStyle);
    this._background = new PIXI.Graphics();
    this._deleteLabel = new PIXI.Text("Delete",options.deleteLabelStyle);
    this._renderAll = true;

    this.addChild(this._background);
    this.addChild(this._deleteLabel);
    this._swipeSurface.addChild(this._nameLabel);
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
    this._nameLabel.setText(this._model.name);

    if (this._renderAll)
    {
        this._renderAll = false;

        var ColorTheme = App.ColorTheme,
            GraphicUtils = App.GraphicUtils,
            r = this._pixelRatio,
            w = this.boundingBox.width,
            h = this.boundingBox.height,
            padding = Math.round(10 * r);

        GraphicUtils.drawRect(this._background,ColorTheme.RED,1,0,0,w,h);

        this._deleteLabel.x = Math.round(w - 50 * r);
        this._deleteLabel.y = Math.round((h - this._deleteLabel.height) / 2);

        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.GREY,1,[0,0,w,h],true,false);
        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);

        this._nameLabel.x = Math.round(20 * r);
        this._nameLabel.y = Math.round((h - this._nameLabel.height) / 2);
    }
};

/**
 * Disable
 */
App.SubCategoryButton.prototype.disable = function disable()
{
    App.SwipeButton.prototype.disable.call(this);
};

/**
 * Update
 * @param {Category} model
 * @param {string} mode
 */
App.SubCategoryButton.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._render();

    this.close(true);
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
