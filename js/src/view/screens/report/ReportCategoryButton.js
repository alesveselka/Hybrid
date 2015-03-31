/**
 * @class ReportCategoryButton
 * @extends ExpandButton
 * @param {Category} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {Object} labelStyles
 * @constructor
 */
App.ReportCategoryButton = function ReportCategoryButton(poolIndex,options)
{
    //TODO extend ReportAccountButton?
    App.ExpandButton.call(this,options.width,options.height,false);

    var labelStyles = options.categoryLabelStyles;

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._width = options.width;//TODO do I need this when i have bounds?
    this._height = options.height;
    this._pixelRatio = options.pixelRatio;
    this._buttonPool = new App.ObjectPool(App.ReportSubCategoryButton,5,options);//TODO pass in from parent

    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text("",labelStyles.categoryName);
    this._percentField = new PIXI.Text("%",labelStyles.categoryPercent);
    this._amountField = new PIXI.Text("",labelStyles.categoryPrice);
    this._subCategoryList = new App.List(App.Direction.Y);
//    this._subList = new App.SubCategoryReportList(null,this._width,this._pixelRatio,labelStyles);

    this._render();

    this._setContent(this._subCategoryList);
    this.addChild(this._subCategoryList);
    this.addChild(this._background);
    this.addChild(this._nameField);
    this.addChild(this._amountField);
    this.addChild(this._percentField);
};

App.ReportCategoryButton.prototype = Object.create(App.ExpandButton.prototype);
App.ReportCategoryButton.prototype.constructor = App.ReportCategoryButton;

/**
 * Render
 * @private
 */
App.ReportCategoryButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * this._pixelRatio),
        w = this._width - padding * 2,
        h = this.boundingBox.height;

    //TODO use skin instead
    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,this._width,h],true,false);
    GraphicUtils.drawRects(this._background,0xff3300,1,[0,0,Math.round(4 * this._pixelRatio),h],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this._nameField.x = Math.round(15 * this._pixelRatio);
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
App.ReportCategoryButton.prototype.setModel = function setModel(model)
{
    this._model = model;

    this.close(true);
    this._update();
};

/**
 * Update
 * @private
 */
App.ReportCategoryButton.prototype._update = function _update()
{
    this._nameField.setText(this._model.name);

    var i = 0,
        l = this._subCategoryList.length,
        subCategories = this._model.subCategories,
        subCategory = null,
        button = null;

    for (;i<l;i++) this._buttonPool.release(this._subCategoryList.removeItemAt(0));

    for (i=0,l=subCategories.length;i<l;)
    {
        subCategory = subCategories[i++];
        button = this._buttonPool.allocate();
        button.setModel(subCategory);
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

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open(true);
    else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close(false,true);
};
