App.ReportCategoryButton = function ReportCategoryButton(model,width,height,pixelRatio)
{
    App.ExpandButton.call(this,width,height);

    var FontStyle = App.FontStyle;

    this._model = model;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text(model,FontStyle.get(18,FontStyle.BLUE));
    this._priceField = new PIXI.Text("1,560.00",FontStyle.get(14,FontStyle.BLUE));
    this._percentField = new PIXI.Text("24 %",FontStyle.get(16,FontStyle.SHADE_DARK));
    this._subList = new App.SubCategoryReportList(null,width,pixelRatio);

    this._render();

    this._setContent(this._subList);
    this.addChild(this._subList);
    this.addChild(this._background);
    this.addChild(this._nameField);
    this.addChild(this._priceField);
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

    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,this._width,h],true,false);
    GraphicUtils.drawRects(this._background,0xff3300,1,[0,0,Math.round(4 * this._pixelRatio),h],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this._nameField.x = padding;
    this._nameField.y = Math.round((h - this._nameField.height) / 2);
    this._percentField.x = Math.round(this._width * 0.7 - this._percentField.width);
    this._percentField.y = Math.round((h - this._percentField.height) / 2);
    this._priceField.x = Math.round(this._width - padding - this._priceField.width);
    this._priceField.y = Math.round((h - this._priceField.height) / 2);
};
