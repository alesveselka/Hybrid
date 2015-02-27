/**
 * @class AccountButton
 * @extends Graphics
 * @param {Account} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {{font:string,fill:string}} nameStyle
 * @param {{font:string,fill:string}} detailStyle
 * @constructor
 */
App.AccountButton = function AccountButton(model,width,height,pixelRatio,nameStyle,detailStyle)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);
    //TODO also make 'swipe-able' version as Category button have
    this._model = model;
    this._pixelRatio = pixelRatio;
    this._nameLabel = new PIXI.Text(this._model.name,nameStyle);
    this._detailsLabel = new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",detailStyle);//TODO remove hard-coded data

    this._render();

    this.addChild(this._nameLabel);
    this.addChild(this._detailsLabel);
};

App.AccountButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        r = this._pixelRatio,
        offset = Math.round(15 * r),
        padding = Math.round(10 * r);

    this._nameLabel.x = offset;
    this._nameLabel.y = offset;

    this._detailsLabel.x = offset;
    this._detailsLabel.y = Math.round(45 * r);

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);
};

/**
 * Return model
 * @returns {Account}
 */
App.AccountButton.prototype.getModel = function getModel()
{
    return this._model;
};
