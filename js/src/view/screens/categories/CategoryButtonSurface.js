/**
 * @class CategoryButtonSurface
 * @extends DisplayObjectContainer
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @constructor
 */
App.CategoryButtonSurface = function CategoryButtonSurface(options)
{
    PIXI.DisplayObjectContainer.call(this);

    this._width = options.width;
    this._height = options.height;
    this._pixelRatio = options.pixelRatio;

    this._skin = this.addChild(new PIXI.Sprite(options.skin));
    this._colorStripe = this.addChild(new PIXI.Graphics());
    this._icon = null;
    this._nameLabel = this.addChild(new PIXI.Text("",options.nameLabelStyle));
    this._renderAll = true;
};

App.CategoryButtonSurface.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButtonSurface.prototype.constructor = App.CategoryButtonSurface;

/**
 * Render
 * @param {string} label
 * @param {string} iconName
 * @param {string} color
 */
App.CategoryButtonSurface.prototype.render = function render(label,iconName,color)
{
    this._nameLabel.setText(label);

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[iconName]);

    App.GraphicUtils.drawRect(this._colorStripe,"0x"+color,1,0,0,Math.round(4 * this._pixelRatio),this._height);

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(iconName);
        this.addChild(this._icon);

        this._icon.width = Math.round(20 * this._pixelRatio);
        this._icon.height = Math.round(20 * this._pixelRatio);
        this._icon.x = Math.round(25 * this._pixelRatio);
        this._icon.y = Math.round((this._height - this._icon.height) / 2);

        this._nameLabel.x = Math.round(64 * this._pixelRatio);
        this._nameLabel.y = Math.round(18 * this._pixelRatio);
    }

    this._icon.tint = parseInt(color,16);
};
