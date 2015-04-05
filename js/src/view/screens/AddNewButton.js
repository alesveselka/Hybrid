/**
 * @class AddNewButton
 * @extends DisplayObjectContainer
 * @param {string} label
 * @param {{font:string,fill:string}} fontStyle
 * @param {Texture} skin
 * @param {number} pixelRatio
 * @constructor
 */
App.AddNewButton = function AddNewButton(label,fontStyle,skin,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new App.Rectangle(0,0,skin.width,skin.height);

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._skin = new PIXI.Sprite(skin);
    this._icon = PIXI.Sprite.fromFrame("plus-app");
    this._iconResizeRatio = Math.round(20 * pixelRatio) / this._icon.height;
    this._labelField = new PIXI.Text(label,fontStyle);

    this._render();

    this.addChild(this._skin);
    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.AddNewButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Render
 * @private
 */
App.AddNewButton.prototype._render = function _render()
{
    var gap = Math.round(10 * this._pixelRatio),
        h = this.boundingBox.height,
        position = 0;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;

    position = Math.round((this.boundingBox.width - (this._labelField.width + gap + this._icon.width)) / 2);

    this._icon.x = position;
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = App.ColorTheme.GREY_DARK;

    this._labelField.x = position + this._icon.width + gap;
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
};
