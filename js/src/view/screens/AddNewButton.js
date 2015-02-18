App.AddNewButton = function AddNewButton(label,fontStyle,width,height,pixelRatio)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._icon = PIXI.Sprite.fromFrame("plus-app");
    this._iconResizeRatio = Math.round(20 * pixelRatio) / this._icon.height;
    this._labelField = new PIXI.Text(label,fontStyle);

    this._render();

    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.AddNewButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AddNewButton.prototype.constructor = App.AddNewButton;

/**
 * Render
 * @private
 */
App.AddNewButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        gap = Math.round(10 * this._pixelRatio),
        height = this.boundingBox.height,
        padding = Math.round(10 * this._pixelRatio),
        position = 0;

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;

    w = this._labelField.width;

    w += this._icon.width + gap;
    position = Math.round((this.boundingBox.width - w) / 2);

    this._icon.x = position;
    this._icon.y = Math.round((height - this._icon.height) / 2);
    this._icon.tint = ColorTheme.GREY_DARK;

    this._labelField.x = position + this._icon.width + gap;
    this._labelField.y = Math.round((height - this._labelField.height) / 2);
};
