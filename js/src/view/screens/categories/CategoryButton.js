/**
 * @class CategoryButton
 * @extends DisplayObjectContainer
 * @param {Account} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryButton = function CategoryButton(model,layout,index)
{
    PIXI.DisplayObjectContainer.call(this);

    var pixelRatio = layout.pixelRatio,
        height = Math.round(50 * pixelRatio);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._model = model;
    this._layout = layout;
    this._state = null;
    this._dragFriction = 0.5;
    this._snapForce = 0.5;
    this._editOffset = Math.round(80 * pixelRatio);
    this._editButtonShown = false;

    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,height);

    this._background = new PIXI.Graphics();
    this._background.beginFill(0xE53013);
    this._background.drawRect(0,0,this.boundingBox.width,this.boundingBox.height);
    this._background.endFill();

    this._surfaceSkin = new PIXI.Graphics();
    this._icon = new PIXI.Sprite.fromFrame("currencies");
    this._nameLabel = new PIXI.Text("Category "+index,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});

    this._renderSurface();

    this.addChild(this._background);
    this.addChild(this._surfaceSkin);
};

App.CategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButton.prototype.constructor = App.CategoryButton;

/**
 * @method _resize
 * @param {number} width
 */
App.CategoryButton.prototype.resize = function resize(width)
{
    this.boundingBox.width = width;

    this._renderSurface();
    //TODO also resize background and other elements
};

/**
 * Is Edit button shown?
 * @returns {boolean}
 */
App.CategoryButton.prototype.isEditButtonShown = function isEditButtonShown()
{
    return this._editButtonShown;
};

/**
 * Tick handler
 * @private
 */
App.CategoryButton.prototype._onTick = function _onTick()
{
    if (this._state === App.InteractiveState.SNAPPING) this.snap();
};

/**
 * Enable snapping
 * @private
 */
App.CategoryButton.prototype._enableSnap = function _enableSnap()
{
    this._state = App.InteractiveState.SNAPPING;

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * Disable snapping
 * @private
 */
App.CategoryButton.prototype._disableSnap = function _disableSnap()
{
    this._state = null;

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * @method swipe
 * @param {number} position
 * @private
 */
App.CategoryButton.prototype.swipe = function swipe(position)
{
    if (!this._editButtonShown)
    {
        if (!this._state) this._state = App.InteractiveState.SWIPING;

        var w = this._layout.width;

        this._surfaceSkin.x = -Math.round(w * (1 - (position / w)) * this._dragFriction);
    }
};

/**
 * @method snap
 * @param {string} swipeDirection
 * @param {boolean} [immediate=false]
 * @private
 */
App.CategoryButton.prototype.snap = function snap(swipeDirection,immediate)
{
    if (immediate)
    {
        this._editButtonShown = false;
        this._surfaceSkin.x = 0;

        return;
    }

    // Snap back if button is swiping
    if (this._state === App.InteractiveState.SWIPING)
    {
        this._enableSnap();
    }
    // Or snap to close edit button, if it is open ...
    else if (!this._state && this._editButtonShown)
    {
        // ... and swipe direction is right
        if (swipeDirection === App.Direction.RIGHT)
        {
            this._enableSnap();
        }
        else
        {
            return;
        }
    }

    // Snap to show edit button
    if (this._surfaceSkin.x < -this._editOffset)
    {
        if (this._surfaceSkin.x * this._snapForce >= -this._editOffset)
        {
            this._editButtonShown = true;

            this._surfaceSkin.x = -this._editOffset;

            this._disableSnap();
        }
        else
        {
            this._surfaceSkin.x *= this._snapForce;
        }
    }
    // Snap to close edit button
    else
    {
        if (this._surfaceSkin.x * this._snapForce >= -1)
        {
            this._editButtonShown = false;

            this._surfaceSkin.x = 0;

            this._disableSnap();
        }
        else
        {
            this._surfaceSkin.x *= this._snapForce;
        }
    }
};

/**
 * @method render
 * @private
 */
App.CategoryButton.prototype._renderSurface = function _renderSurface()
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
    this._surfaceSkin.beginFill("0x"+App.MathUtils.rgbToHex(
        Math.round(Math.sin(0.3 * 10 + 0) * 127 + 128),
        Math.round(Math.sin(0.3 * 10 + 2) * 127 + 128),
        Math.round(Math.sin(0.3 * 10 + 4) * 127 + 128)
    ));
    this._surfaceSkin.drawRect(0,0,Math.round(4 * pixelRatio),h);
    this._surfaceSkin.endFill();

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

    this._surfaceSkin.addChild(this._icon);
    this._surfaceSkin.addChild(this._nameLabel);
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
