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
    this._swipeSurface = new PIXI.DisplayObjectContainer();
    this._skin = new PIXI.Sprite(options.skin);
    this._icon = PIXI.Sprite.fromFrame("subcategory-app");
    this._nameLabel = new PIXI.Text("",options.nameLabelStyle);
    this._background = new PIXI.Graphics();
    this._deleteLabel = new PIXI.Text("Delete",options.deleteLabelStyle);
    this._renderAll = true;

    this.addChild(this._background);
    this.addChild(this._deleteLabel);
    this._swipeSurface.addChild(this._skin);
    this._swipeSurface.addChild(this._icon);
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
            r = this._pixelRatio,
            w = this.boundingBox.width,
            h = this.boundingBox.height,
            iconResizeRatio = Math.round(20 * r) / this._icon.height;

        App.GraphicUtils.drawRect(this._background,ColorTheme.RED,1,0,0,w,h);

        this._deleteLabel.x = Math.round(w - 50 * r);
        this._deleteLabel.y = Math.round((h - this._deleteLabel.height) / 2);

        this._icon.scale.x = iconResizeRatio;
        this._icon.scale.y = iconResizeRatio;
        this._icon.x = Math.round(25 * r);
        this._icon.y = Math.round((h - this._icon.height) / 2);
        this._icon.tint = ColorTheme.GREY;

        this._nameLabel.x = Math.round(64 * r);
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
