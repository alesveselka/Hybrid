/**
 * @class CategoryButtonSurface
 * @extends Graphics
 * @param {string} iconName
 * @param {string} label
 * @param {{font:string,fill:string}} labelStyle
 * @constructor
 */
App.CategoryButtonSurface = function CategoryButtonSurface(iconName,label,labelStyle)
{
    PIXI.Graphics.call(this);

    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._nameLabel = new PIXI.Text(label,labelStyle);

    this.addChild(this._colorStripe);
    this.addChild(this._icon);
    this.addChild(this._nameLabel);
};

App.CategoryButtonSurface.prototype = Object.create(PIXI.Graphics.prototype);
App.CategoryButtonSurface.prototype.constructor = App.CategoryButtonSurface;

/**
 * Render
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 */
App.CategoryButtonSurface.prototype.render = function render(width,height,pixelRatio)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * pixelRatio);

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,width,height],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,width-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,height-1,width-padding*2,1],false,true);

    GraphicUtils.drawRect(this._colorStripe,0xffcc00,1,0,0,Math.round(4 * pixelRatio),height);

    this._icon.width = Math.round(20 * pixelRatio);
    this._icon.height = Math.round(20 * pixelRatio);
    this._icon.x = Math.round(25 * pixelRatio);
    this._icon.y = Math.round((height - this._icon.height) / 2);
    this._icon.tint = ColorTheme.BLUE;

    this._nameLabel.x = Math.round(64 * pixelRatio);
    this._nameLabel.y = Math.round(18 * pixelRatio);
};
