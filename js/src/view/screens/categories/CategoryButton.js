/**
 * @class CategoryButton
 * @extends DisplayObjectContainer
 * @param {Category} model
 * @param {Object} layout
 * @param {Object} labelStyle
 * @constructor
 */
App.CategoryButton = function CategoryButton(model,layout,labelStyle)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName;

//    this.boundingBox = ModelLocator.getProxy(ModelName.RECTANGLE_POOL).allocate();
//    this.boundingBox.width = layout.width;
//    this.boundingBox.height = Math.round(50 * layout.pixelRatio);

    this._model = model;
    this._layout = layout;
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);

    this._surfaceSkin = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame(model.icon);
    this._nameLabel = new PIXI.Text(model.name,labelStyle);

    this._surfaceSkin.addChild(this._colorStripe);
    this._surfaceSkin.addChild(this._icon);
    this._surfaceSkin.addChild(this._nameLabel);
    this.addChild(this._surfaceSkin);
};

App.CategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButton.prototype.constructor = App.CategoryButton;

/**
 * @method render
 * @private
 */
App.CategoryButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        pixelRatio = this._layout.pixelRatio,
        padding = Math.round(10 * pixelRatio),
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    GraphicUtils.drawRects(this._surfaceSkin,0xefefef,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this._surfaceSkin,0xffffff,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this._surfaceSkin,0xcccccc,1,[padding,h-1,w-padding*2,1],false,true);

    GraphicUtils.drawRect(
        this._colorStripe,
        "0x"+App.MathUtils.rgbToHex(
            Math.round(Math.sin(0.3 * 10 + 0) * 127 + 128),
            Math.round(Math.sin(0.3 * 10 + 2) * 127 + 128),
            Math.round(Math.sin(0.3 * 10 + 4) * 127 + 128)
        ),
        1,
        0,
        0,
        Math.round(4 * pixelRatio),
        h
    );

    this._icon.width = Math.round(20 * pixelRatio);
    this._icon.height = Math.round(20 * pixelRatio);
    this._icon.x = Math.round(25 * pixelRatio);
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

    this.interactive = false;

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
