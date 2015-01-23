App.SubCategoryReportList = function SubCategoryReportList(model,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var FontStyle = App.FontStyle,
        Text = PIXI.Text,
        i = 0,
        l = 3,//Number of sub-categories
        item = null,
        textField = null;

    this._model = [{name:"Cinema",percent:"24",price:"50.00"},{name:"Theatre",percent:"71",price:"176.50"},{name:"Gallery",percent:"5",price:"87.00"}];
    this._width = width;
    this._itemHeight = Math.round(30 * pixelRatio);
    this._pixelRatio = pixelRatio;
    this._nameFields = new Array(l);
    this._percentFields = new Array(l);
    this._priceFields = new Array(l);

    for (;i<l;i++)
    {
        item = this._model[i];
        textField = new Text(item.name,FontStyle.get(14,FontStyle.BLUE));
        this._nameFields[i] = textField;
        this.addChild(textField);
        textField = new Text(item.percent+" %",FontStyle.get(14,FontStyle.SHADE_DARK));
        this._percentFields[i] = textField;
        this.addChild(textField);
        textField = new Text(item.price,FontStyle.get(14,FontStyle.BLUE));
        this._priceFields[i] = textField;
        this.addChild(textField);
    }

    this.boundingBox = new App.Rectangle(0,0,this._width,this._itemHeight*l);

    this._render();
};

App.SubCategoryReportList.prototype = Object.create(PIXI.Graphics.prototype);
App.SubCategoryReportList.prototype.constructor = App.SubCategoryReportList;

/**
 * Render
 * @private
 */
App.SubCategoryReportList.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * this._pixelRatio),
        w = this._width - padding * 2,
        h = this.boundingBox.height,
        percentOffset = Math.round(this._width * 0.7),
        i = 0,
        l = 3,
        y = 0,
        textField = null;

    GraphicUtils.drawRects(this,0xffffff,1,[0,0,this._width,h],true,false);

    for (;i<l;i++)
    {
        textField = this._nameFields[i];
        y = Math.round(this._itemHeight * i + (this._itemHeight - textField.height) / 2);
        textField.x = padding;
        textField.y = y;
        textField = this._percentFields[i];
        textField.x = Math.round(percentOffset - textField.width);
        textField.y = y;
        textField = this._priceFields[i];
        textField.x = Math.round(this._width - padding - textField.width);
        textField.y = y;

        if (i > 0) GraphicUtils.drawRects(this,ColorTheme.GREY,1,[padding,this._itemHeight*i,w,1],false,false);
    }

    GraphicUtils.drawRects(this,0xff3366,1,[0,0,Math.round(2 * this._pixelRatio),h],false,true);
};
