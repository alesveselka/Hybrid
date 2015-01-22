App.ReportAccountButton = function ReportAccountButton(model,width,height,pixelRatio)
{
    App.ExpandButton.call(this,width,height);

    var FontStyle = App.FontStyle,
        ReportCategoryButton = App.ReportCategoryButton;

    this._model = model;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text(model,FontStyle.get(22,FontStyle.WHITE));
    this._amountField = new PIXI.Text("1,560.00",FontStyle.get(16,FontStyle.WHITE));
    this._categoryList = new App.List(App.Direction.Y);
    this._categoryList.add(new ReportCategoryButton("Entertainment",width,Math.round(40 * pixelRatio),pixelRatio),false);
    this._categoryList.add(new ReportCategoryButton("Food",width,Math.round(40 * pixelRatio),pixelRatio),false);
    this._categoryList.add(new ReportCategoryButton("Household",width,Math.round(40 * pixelRatio),pixelRatio),false);
    this._categoryList.add(new ReportCategoryButton("Shopping",width,Math.round(40 * pixelRatio),pixelRatio),true);

    this._render();

    this._setContent(this._categoryList);
    this.addChild(this._categoryList);
    this.addChild(this._background);
    this.addChild(this._nameField);
    this.addChild(this._amountField);
};

App.ReportAccountButton.prototype = Object.create(App.ExpandButton.prototype);
App.ReportAccountButton.prototype.constructor = App.ReportAccountButton;

/**
 * Render
 * @private
 */
App.ReportAccountButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme;

    GraphicUtils.drawRects(this._background,ColorTheme.BLUE,1,[0,0,this._width,this._height],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.BLUE_DARK,1,[0,this._height-1,this._width,1],false,true);

    this._nameField.x = Math.round(10 * this._pixelRatio);
    this._nameField.y = Math.round((this._height - this._nameField.height) / 2);

    this._amountField.x = Math.round(this._width - this._amountField.width - 10 * this._pixelRatio);
    this._amountField.y = Math.round((this._height - this._amountField.height) / 2);
};
