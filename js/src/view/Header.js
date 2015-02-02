App.Header = function Header(layout)
{
    PIXI.Graphics.call(this);

    var FontStyle = App.FontStyle;

    this._layout = layout;
    this._leftIcon = PIXI.Sprite.fromFrame("menu-app");
    this._title = new PIXI.Text("Add Transaction",FontStyle.get(20,FontStyle.WHITE));
    this._rightIcon = PIXI.Sprite.fromFrame("close-app");
    this._iconResizeRatio = Math.round(20 * layout.pixelRatio) / this._leftIcon.height;

    this._render();

    this.addChild(this._leftIcon);
    this.addChild(this._title);
    this.addChild(this._rightIcon);
};

App.Header.prototype = Object.create(PIXI.Graphics.prototype);
App.Header.prototype.constructor = App.Header;

/**
 * Render
 * @private
 */
App.Header.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this._layout.width,
        h = this._layout.headerHeight,
        size = Math.round(50 * r),
        offset = h - size,
        padding = Math.round(10 * r);

    this._leftIcon.scale.x = this._iconResizeRatio;
    this._leftIcon.scale.y = this._iconResizeRatio;
    this._leftIcon.x = Math.round((size - this._leftIcon.width) / 2);
    this._leftIcon.y = Math.round(offset + (size - this._leftIcon.height) / 2);
    this._leftIcon.tint = ColorTheme.WHITE;

    this._rightIcon.scale.x = this._iconResizeRatio;
    this._rightIcon.scale.y = this._iconResizeRatio;
    this._rightIcon.x = Math.round(w - (size - this._rightIcon.width) / 2 - this._rightIcon.width);
    this._rightIcon.y = Math.round(offset + (size - this._rightIcon.height) / 2);
    this._rightIcon.tint = ColorTheme.WHITE;

    this._title.x = Math.round((w - this._title.width) / 2);
    this._title.y = Math.round(offset + (size - this._title.height) / 2);

    GraphicUtils.drawRects(this,ColorTheme.BLUE,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_LIGHT,1,[
        size+1,offset+padding,1,size-padding*2,
        w-size,offset+padding,1,size-padding*2
    ],false,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_DARK,1,[
        0,h-1,w,1,
        size,offset+padding,1,size-padding*2,
        w-size-1,offset+padding,1,size-padding*2
    ],false,true);
};
