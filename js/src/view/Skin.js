/**
 * @class Skin
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.Skin = function Skin(width,pixelRatio)
{
    var ColorTheme = App.ColorTheme,
        defaultScaleMode = PIXI.scaleModes.DEFAULT,
        padding = Math.round(10 * pixelRatio),
        graphics = new PIXI.Graphics(),
        w = width - padding * 2,
        h = Math.round(40 * pixelRatio),
        draw = App.GraphicUtils.drawRects,
        color = ColorTheme.GREY,
        lightColor = ColorTheme.GREY_LIGHT,
        darkColor = ColorTheme.GREY_DARK;

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_40 = graphics.generateTexture(1,defaultScaleMode);

    draw(graphics,ColorTheme.WHITE,1,[0,0,width,h],true,false);
    draw(graphics,color,1,[padding,h-1,w,1],false,true);

    this.WHITE_40 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(50 * pixelRatio);

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_50 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(60 * pixelRatio);

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_60 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(70 * pixelRatio);

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_70 = graphics.generateTexture(1,defaultScaleMode);

    draw(graphics,ColorTheme.RED,1,[0,0,width,h],true,false);
    draw(graphics,ColorTheme.RED_LIGHT,1,[padding,0,w,1],false,false);
    draw(graphics,ColorTheme.RED_DARK,1,[padding,h-1,w,1],false,true);

    this.RED_70 = graphics.generateTexture(1,defaultScaleMode);

    w = Math.round(40 * pixelRatio);
    h = w;

    graphics.clear();
    graphics.beginFill(ColorTheme.BLUE_DARK,1.0);
    graphics.drawRect(0,0,w,h);
    graphics.beginFill(ColorTheme.BLUE_LIGHT,1.0);
    graphics.drawRect(0,h/2,w/2,h/2);
    graphics.beginFill(ColorTheme.BLUE,1.0);
    graphics.drawShape(new PIXI.Polygon([0,0,w,0,w,h,0,0]));
    graphics.endFill();

    this.BLUE_PATTERN = graphics.generateTexture(1,defaultScaleMode);

    graphics.clear();
    graphics.beginFill(ColorTheme.GREY_DARK,1.0);
    graphics.drawRect(0,0,w,h);
    graphics.beginFill(ColorTheme.GREY,1.0);
    graphics.drawRect(0,h/2,w/2,h/2);
    graphics.beginFill(0xdedede,1.0);
    graphics.drawShape(new PIXI.Polygon([0,0,w,0,w,h,0,0]));
    graphics.endFill();

    this.GREY_PATTERN = graphics.generateTexture(1,defaultScaleMode);
};
