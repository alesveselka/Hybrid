/**
 * @class AccountButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {PIXI.Texture} options.skin
 * @param {{font:string,fill:string}} options.nameStyle
 * @param {{font:string,fill:string}} options.detailStyle
 * @param {{font:string,fill:string}} options.editStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.AccountButton = function AccountButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new PIXI.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._mode = App.ScreenMode.SELECT;
    this._pixelRatio = options.pixelRatio;
    this._background = this.addChild(new PIXI.Graphics());
    this._editLabel = this.addChild(new PIXI.Text("Edit",options.editStyle));
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._skin = this._swipeSurface.addChild(new PIXI.Sprite(options.skin));
    this._nameLabel = this._swipeSurface.addChild(new PIXI.Text("",options.nameStyle));
    this._detailsLabel = this._swipeSurface.addChild(new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",options.detailStyle));//TODO remove hard-coded data
    this._renderAll = true;
};

App.AccountButton.prototype = Object.create(App.SwipeButton.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    if (this._renderAll)
    {
        var w = this.boundingBox.width,
            h = this.boundingBox.height,
            r = this._pixelRatio,
            offset = Math.round(15 * r);

        this._renderAll = false;

        App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

        this._editLabel.x = Math.round(w - 50 * this._pixelRatio);
        this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

        this._nameLabel.x = offset;
        this._nameLabel.y = offset;

        this._detailsLabel.x = offset;
        this._detailsLabel.y = Math.round(45 * r);
    }
};

/**
 * Set model
 * @param {App.Account} model
 * @param {string} mode
 */
App.AccountButton.prototype.setModel = function getModel(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._nameLabel.setText(this._model.name);

    this._render();
};

/**
 * Return model
 * @returns {Account}
 */
App.AccountButton.prototype.getModel = function getModel()
{
    return this._model;
};

/**
 * Click handler
 * @param {InteractionData} data
 * @returns {number}
 */
App.AccountButton.prototype.getClickMode = function getClickMode(data)
{
    if (this._isOpen && data.getLocalPosition(this).x >= this._width - this._openOffset) return App.ScreenMode.EDIT;
    else return App.ScreenMode.SELECT;
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.AccountButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.AccountButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};
