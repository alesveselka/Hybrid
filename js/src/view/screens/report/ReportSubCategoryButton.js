/**
 * @class ReportSubCategoryButton
 * @extends DisplayObjectContainer
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {Object} options.labelStyles
 * @constructor
 */
App.ReportSubCategoryButton = function ReportSubCategoryButton(poolIndex,options)
{
    PIXI.DisplayObjectContainer.call(this);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._pixelRatio = options.pixelRatio;

    this._background = this.addChild(new PIXI.Sprite(options.skin));
    this._colorStripe = this.addChild(new PIXI.Graphics());
    this._nameField = this.addChild(new PIXI.Text("",options.labelStyles.name));
    this._percentField = this.addChild(new PIXI.Text("%",options.labelStyles.percent));
    this._amountField = this.addChild(new PIXI.Text("",options.labelStyles.amount));

    this._render();
};

App.ReportSubCategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Render
 * @private
 */
App.ReportSubCategoryButton.prototype._render = function _render()
{
    var padding = Math.round(10 * this._pixelRatio),
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._nameField.x = padding * 2;
    this._nameField.y = Math.round((h - this._nameField.height) / 2);
    this._percentField.x = Math.round(w * 0.7 - this._percentField.width);
    this._percentField.y = Math.round((h - this._percentField.height) / 2);
    this._amountField.x = Math.round(w - padding - this._amountField.width);
    this._amountField.y = Math.round((h - this._amountField.height) / 2);
};

/**
 * Set model
 * @param {App.SubCategory} model
 * @param {string} color
 */
App.ReportSubCategoryButton.prototype.setModel = function setModel(model,color)
{
    this._model = model;

    this._update(color);
};

/**
 * Update
 * @param {string} color
 * @private
 */
App.ReportSubCategoryButton.prototype._update = function _update(color)
{
    this._nameField.setText(this._model.name);

    App.GraphicUtils.drawRect(this._colorStripe,color,1,0,0,Math.round(2 * this._pixelRatio),this.boundingBox.height);
};
