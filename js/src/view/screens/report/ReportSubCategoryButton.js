/**
 * @class ReportSubCategoryButton
 * @extends ExpandButton
 * @param {Category} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {Object} labelStyles
 * @constructor
 */
App.ReportSubCategoryButton = function ReportSubCategoryButton(poolIndex,options)
{
    PIXI.DisplayObjectContainer.call(this);

    var Text = PIXI.Text,
        labelStyles = options.subCategoryLabelStyles;

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._width = options.width;//TODO do I need this when i have bounds?
    this._height = options.height;
    this._pixelRatio = options.pixelRatio;

    this._background = this.addChild(new PIXI.Graphics());
    this._nameField = this.addChild(new Text("",labelStyles.name));
    this._percentField = this.addChild(new Text("%",labelStyles.percent));
    this._amountField = this.addChild(new Text("",labelStyles.amount));

    this._render();
};

App.ReportSubCategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ReportSubCategoryButton.prototype.constructor = App.ReportSubCategoryButton;

/**
 * Render
 * @private
 */
App.ReportSubCategoryButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * this._pixelRatio),
        w = this._width - padding * 2,
        h = this.boundingBox.height;

    //TODO use skin instead
    GraphicUtils.drawRects(this._background,ColorTheme.WHITE,1,[0,0,this._width,h],true,false);
    GraphicUtils.drawRects(this._background,0xff3300,1,[0,0,Math.round(4 * this._pixelRatio),h],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this._nameField.x = Math.round(20 * this._pixelRatio);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);
    this._percentField.x = Math.round(this._width * 0.7 - this._percentField.width);
    this._percentField.y = Math.round((h - this._percentField.height) / 2);
    this._amountField.x = Math.round(this._width - padding - this._amountField.width);
    this._amountField.y = Math.round((h - this._amountField.height) / 2);
};

/**
 * Set model
 * @param {App.Category} model
 */
App.ReportSubCategoryButton.prototype.setModel = function setModel(model)
{
    this._model = model;

    this._update();
};

/**
 * Update
 * @private
 */
App.ReportSubCategoryButton.prototype._update = function _update()
{
    this._nameField.setText(this._model.name);
};
