/**
 * @class ReportCategoryButton
 * @extends ExpandButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {Object} options.labelStyles
 * @param {App.ObjectPool} options.subCategoryButtonPool
 * @constructor
 */
App.ReportCategoryButton = function ReportCategoryButton(poolIndex,options)
{
    App.ExpandButton.call(this,options.width,options.height,false);

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._pixelRatio = options.pixelRatio;
    this._buttonPool = options.subCategoryButtonPool;

    this._background = this.addChild(new PIXI.Sprite(options.skin));
    this._colorStripe = this.addChild(new PIXI.Graphics());
    this._nameField = this.addChild(new PIXI.Text("",options.labelStyles.name));
    this._percentField = this.addChild(new PIXI.Text("%",options.labelStyles.percent));
    this._amountField = this.addChild(new PIXI.Text("",options.labelStyles.amount));
    this._subCategoryList = new App.List(App.Direction.Y);
    this._updated = false;

    this._render();

    this._setContent(this._subCategoryList);
    this.addChild(this._subCategoryList);
};

App.ReportCategoryButton.prototype = Object.create(App.ExpandButton.prototype);
App.ReportCategoryButton.prototype.constructor = App.ReportCategoryButton;

/**
 * Render
 * @private
 */
App.ReportCategoryButton.prototype._render = function _render()
{
    var padding = Math.round(10 * this._pixelRatio),
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._nameField.x = Math.round(15 * this._pixelRatio);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);
    this._percentField.x = Math.round(w * 0.7 - this._percentField.width);
    this._percentField.y = Math.round((h - this._percentField.height) / 2);
    this._amountField.x = Math.round(w - padding - this._amountField.width);
    this._amountField.y = Math.round((h - this._amountField.height) / 2);
};

/**
 * Set model
 * @param {App.Category} model
 */
App.ReportCategoryButton.prototype.setModel = function setModel(model)
{
    this._updated = false;

    this._model = model;

    this.close(true);

    this._nameField.setText(this._model.name);

    App.GraphicUtils.drawRect(this._colorStripe,"0x" + this._model.color,1,0,0,Math.round(4 * this._pixelRatio),this.boundingBox.height);
};

/**
 * Update
 * @private
 */
App.ReportCategoryButton.prototype._update = function _update()
{
    this._updated = true;

    var i = 0,
        l = this._subCategoryList.length,
        subCategories = this._model.subCategories,
        color = "0x" + this._model.color,
        subCategory = null,
        button = null;

    for (;i<l;i++) this._buttonPool.release(this._subCategoryList.removeItemAt(0));

    for (i=0,l=subCategories.length;i<l;)
    {
        subCategory = subCategories[i++];
        button = this._buttonPool.allocate();
        button.setModel(subCategory,color);
        this._subCategoryList.add(button);
    }
    this._subCategoryList.updateLayout();
};

/**
 * Click handler
 * @param {Point} position
 */
App.ReportCategoryButton.prototype.onClick = function onClick(position)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
    {
        if (!this._updated) this._update();

        this.open(true);
    }
    else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
    {
        this.close(false,true);
    }
};
