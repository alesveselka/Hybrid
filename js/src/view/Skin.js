/**
 * @class Skin
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.Skin = function Skin(width,pixelRatio)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        defaultScaleMode = PIXI.scaleModes.DEFAULT,
        padding = Math.round(10 * pixelRatio),
        graphics = new PIXI.Graphics(),
        w = width - padding * 2,
        h = Math.round(40 * pixelRatio);

    GraphicUtils.drawRects(graphics,ColorTheme.GREY,1,[0,0,width,h],true,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this.GREY_40 = graphics.generateTexture(1,defaultScaleMode);

    GraphicUtils.drawRects(graphics,ColorTheme.WHITE,1,[0,0,width,h],true,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY,1,[padding,h-1,w,1],false,true);

    this.WHITE_40 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(50 * pixelRatio);

    GraphicUtils.drawRects(graphics,ColorTheme.GREY,1,[0,0,width,h],true,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this.GREY_50 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(60 * pixelRatio);

    GraphicUtils.drawRects(graphics,ColorTheme.GREY,1,[0,0,width,h],true,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this.GREY_60 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(70 * pixelRatio);

    GraphicUtils.drawRects(graphics,ColorTheme.GREY,1,[0,0,width,h],true,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(graphics,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this.GREY_70 = graphics.generateTexture(1,defaultScaleMode);

    GraphicUtils.drawRects(graphics,ColorTheme.RED,1,[0,0,width,h],true,false);
    GraphicUtils.drawRects(graphics,ColorTheme.RED_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(graphics,ColorTheme.RED_DARK,1,[padding,h-1,w,1],false,true);

    this.RED_70 = graphics.generateTexture(1,defaultScaleMode);
};
