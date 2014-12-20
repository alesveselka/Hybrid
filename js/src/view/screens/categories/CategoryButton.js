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
        height = Math.round(50 * pixelRatio),
        width = layout.width,
        ModelLocator = App.ModelLocator,
        ModelName = App.ModelName;

    this._model = model;
    this._layout = layout;
    this._interactiveState = null;
//    this._transitionState = App.TransitionState.CLOSED;
    this._dragFriction = 0.5;
    this._snapForce = 0.5;
    this._editOffset = Math.round(80 * pixelRatio);
    this._editButtonShown = false;

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);

    this._background = new PIXI.Graphics();
    this._background.beginFill(0xE53013);
    this._background.drawRect(0,0,width,height);
    this._background.endFill();

    //TODO add this to stage only when needed?
    //TODO also not all variation of CategoryButtons will have editable option!
    this._editLabel = new PIXI.Text("Edit ",{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#ffffff"});
    this._editLabel.x = Math.round(width - 50 * pixelRatio);
    this._editLabel.y = Math.round(18 * pixelRatio);

    this._surfaceSkin = new PIXI.Graphics();
    this._icon = new PIXI.Sprite.fromFrame("currencies");
    this._nameLabel = new PIXI.Text("Category "+index,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
//    this._openCloseTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this._renderSurface();

    this.addChild(this._background);
    this.addChild(this._editLabel);
    this.addChild(this._surfaceSkin);

//    this.interactive = true;
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
    if (this._interactiveState === App.InteractiveState.SNAPPING) this.snap();
};

/**
 * Enable snapping
 * @private
 */
App.CategoryButton.prototype._enableSnap = function _enableSnap()
{
    this._interactiveState = App.InteractiveState.SNAPPING;

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * Disable snapping
 * @private
 */
App.CategoryButton.prototype._disableSnap = function _disableSnap()
{
    this._interactiveState = null;

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
        if (!this._interactiveState) this._interactiveState = App.InteractiveState.SWIPING;

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
    if (this._interactiveState === App.InteractiveState.SWIPING)
    {
        this._enableSnap();
    }
    // Or snap to close edit button, if it is open ...
    else if (!this._interactiveState && this._editButtonShown)
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
 * Open
 */
//App.CategoryButton.prototype.open = function open()
//{
//    var TransitionState = App.TransitionState;
//
//    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
//    {
//        this._transitionState = TransitionState.OPENING;
//
//        this._openCloseTween.restart();
//    }
//};

/**
 * Close
 */
//App.CategoryButton.prototype.close = function close()
//{
//    var TransitionState = App.TransitionState;
//
//    if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
//    {
//        this._transitionState = TransitionState.CLOSING;
//
//        this._openCloseTween.start(true);
//    }
//};

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
