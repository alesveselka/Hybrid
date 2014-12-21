/**
 * @class CategoryButton
 * @extends DisplayObjectContainer
 * @param {number} index ObjectPool index
 * @constructor
 */
App.CategoryButton = function CategoryButton(index)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName;

    this.allocated = false;
    this.poolIndex = index;
    this.boundingBox = ModelLocator.getProxy(ModelName.RECTANGLE_POOL).allocate();

    this._model = null;
    this._layout = null;
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);

    this._surfaceSkin = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._nameLabel = new PIXI.Text("");

    this._surfaceSkin.addChild(this._colorStripe);
    this._surfaceSkin.addChild(this._icon);
    this._surfaceSkin.addChild(this._nameLabel);
    this.addChild(this._surfaceSkin);
};

App.CategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButton.prototype.constructor = App.CategoryButton;

/**
 * Init
 * @param {Category} model
 * @param {Object} layout
 * @param {Object} labelStyle
 */
App.CategoryButton.prototype.init = function init(model,layout,labelStyle)
{
    this._model = model;
    this._layout = layout;

    this.boundingBox.width = layout.width;
    this.boundingBox.height = Math.round(50 * layout.pixelRatio);

    this._icon.setTexture(PIXI.TextureCache[this._model.icon]);

    this._nameLabel.setText(this._model.name);
    this._nameLabel.setStyle(labelStyle);

    this._render();

    return this;
};

App.CategoryButton.prototype.reset = function reset()
{
    this.interactive = false;
};

/**
 * @method render
 * @private
 */
App.CategoryButton.prototype._render = function _render()
{
    var pixelRatio = this._layout.pixelRatio,
        padding = Math.round(10 * pixelRatio),
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    //TODO cache this as texture?
    this._surfaceSkin.clear();
    this._surfaceSkin.beginFill(0xefefef);
    this._surfaceSkin.drawRect(0,0,w,h);
    this._surfaceSkin.beginFill(0xffffff);
    this._surfaceSkin.drawRect(padding,0,w-padding*2,1);
    this._surfaceSkin.beginFill(0xcccccc);
    this._surfaceSkin.drawRect(padding,h-1,w-padding*2,1);
    this._surfaceSkin.endFill();

    this._colorStripe.clear();
    this._colorStripe.beginFill("0x"+App.MathUtils.rgbToHex(
        Math.round(Math.sin(0.3 * 10 + 0) * 127 + 128),
        Math.round(Math.sin(0.3 * 10 + 2) * 127 + 128),
        Math.round(Math.sin(0.3 * 10 + 4) * 127 + 128)
    ));
    this._colorStripe.drawRect(0,0,Math.round(4 * pixelRatio),h);
    this._colorStripe.endFill();

    if (pixelRatio === 1)
    {
        this._icon.scale.x *= 0.5;
        this._icon.scale.y *= 0.5;
    }
    this._icon.x = Math.round(15 * pixelRatio);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = 0x394264;

    this._nameLabel.x = Math.round(64 * pixelRatio);
    this._nameLabel.y = Math.round(18 * pixelRatio);
};

/**
 * Destroy
 */
App.CategoryButton.prototype.destroy = function destroy()
{
    this.clear();

    this.allocated = false;
    this.interactive = false;

    App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).release(this.boundingBox);
    this.boundingBox.reset();
    this.boundingBox = null;

    this._layout = null;
    this._model = null;
    this._ticker = null;

    this._surfaceSkin.removeChild(this._colorStripe);
    this._colorStripe.clear();
    this._colorStripe = null;

    this._surfaceSkin.removeChild(this._icon);
    this._icon = null;

    this._surfaceSkin.removeChild(this._nameLabel);
    this._nameLabel = null;

    this.removeChild(this._surfaceSkin);
    this._surfaceSkin.clear();
    this._surfaceSkin = null;
};
