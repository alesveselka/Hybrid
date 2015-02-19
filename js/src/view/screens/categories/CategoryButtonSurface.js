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

    this._skin = new PIXI.Sprite(options.skin);
    this._colorStripe = new PIXI.Graphics();
    this._icon = null;
    this._nameLabel = new PIXI.Text("",options.nameLabelStyle);
    this._renderAll = true;

    this.addChild(this._skin);
    this.addChild(this._colorStripe);
    this.addChild(this._nameLabel);
};

App.CategoryButtonSurface.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButtonSurface.prototype.constructor = App.CategoryButtonSurface;

/**
 * Render
 * @param {string} label
 * @param {string} iconName
 */
App.CategoryButtonSurface.prototype.render = function render(label,iconName)
{
    this._nameLabel.setText(label);

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[iconName]);

    App.GraphicUtils.drawRect(this._colorStripe,0xffcc00,1,0,0,Math.round(4 * this._pixelRatio),this._height);

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(iconName);
        this.addChild(this._icon);

        this._icon.width = Math.round(20 * this._pixelRatio);
        this._icon.height = Math.round(20 * this._pixelRatio);
        this._icon.x = Math.round(25 * this._pixelRatio);
        this._icon.y = Math.round((this._height - this._icon.height) / 2);
        this._icon.tint = App.ColorTheme.BLUE;

        this._nameLabel.x = Math.round(64 * this._pixelRatio);
        this._nameLabel.y = Math.round(18 * this._pixelRatio);
    }
};
