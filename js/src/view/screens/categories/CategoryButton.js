/**
 * @class CategoryButton
 * @extends Graphics
 * @param {Account} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryButton = function CategoryButton(model,layout,index)
{
    PIXI.Graphics.call(this);

    this._model = model;
    this._layout = layout;

    var pixelRatio = this._layout.pixelRatio,
        height = Math.round(50 * pixelRatio);

    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,height);

    this._colorStripe = new PIXI.Graphics();
    this._colorStripe.beginFill("0x"+App.MathUtils.rgbToHex(
        Math.round(Math.sin(0.3 * index + 0) * 127 + 128),
        Math.round(Math.sin(0.3 * index + 2) * 127 + 128),
        Math.round(Math.sin(0.3 * index + 4) * 127 + 128)
    ));
    this._colorStripe.drawRect(0,0,Math.round(4 * pixelRatio),height);
    this._colorStripe.endFill();

    this._icon = new PIXI.Sprite.fromFrame("currencies");
    if (pixelRatio === 1)
    {
        this._icon.scale.x *= 0.5;
        this._icon.scale.y *= 0.5;
    }
    this._icon.x = Math.round(15 * pixelRatio);
    this._icon.y = Math.round((height - this._icon.height) / 2);
    this._icon.tint = 0x394264;

    //TODO move texts and their settings objects into pools?
    this._nameLabel = new PIXI.Text("Category "+index,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});
    this._nameLabel.x = Math.round(64 * pixelRatio);
    this._nameLabel.y = Math.round(18 * pixelRatio);

    this.addChild(this._colorStripe);
    this.addChild(this._icon);
    this.addChild(this._nameLabel);

    this.interactive = true;

    this._render();
};

App.CategoryButton.prototype = Object.create(PIXI.Graphics.prototype);
App.CategoryButton.prototype.constructor = App.CategoryButton;

/**
 * @method _resize
 * @param {number} width
 */
App.CategoryButton.prototype.resize = function resize(width)
{
    this.boundingBox.width = width;

    this._render();
};

/**
 * @method render
 * @private
 */
App.CategoryButton.prototype._render = function _render()
{
    //TODO cache this as texture?

    var padding = Math.round(10 * this._layout.pixelRatio);

    this.clear();
    this.beginFill(0xefefef);
    this.drawRect(0,0,this.boundingBox.width,this.boundingBox.height);
    this.beginFill(0xffffff);
    this.drawRect(padding,0,this.boundingBox.width-padding*2,1);
    this.beginFill(0xcccccc);
    this.drawRect(padding,this.boundingBox.height-1,this.boundingBox.width-padding*2,1);
    this.endFill();
};

/**
 * Destroy
 */
App.CategoryButton.prototype.destroy = function destroy()
{
    this.clear();

    this.interactive = false;

    this._layout = null;
    this._model = null;

    this.boundingBox = null;

    this.removeChild(this._colorStripe);
    this._colorStripe = null;

    this.removeChild(this._icon);
    this._icon = null;

    this.removeChild(this._nameLabel);
    this._nameLabel = null;
};
