/**
 * @class CategoryButtonEdit
 * @extends CategoryButton
 * @param {Category} model
 * @param {Object} layout
 * @param {{font:string,fill:string}} nameLabelStyle
 * @param {{font:string,fill:string}} editLabelStyle
 * @constructor
 */
App.CategoryButtonEdit = function CategoryButtonEdit(model,layout,nameLabelStyle,editLabelStyle)
{
    App.CategoryButton.call(this,model,layout,nameLabelStyle);

    this._enabled = false;
    this._interactiveState = null;
    this._dragFriction = 0.5;
    this._snapForce = 0.5;
    this._editOffset = Math.round(80 * layout.pixelRatio);
    this._editButtonShown = false;

    this._background = new PIXI.Graphics();
    this._editLabel = new PIXI.Text("Edit",editLabelStyle);

    this._render();

    this.addChildAt(this._editLabel,0);
    this.addChildAt(this._background,0);
};

App.CategoryButtonEdit.prototype = Object.create(App.CategoryButton.prototype);
App.CategoryButtonEdit.prototype.constructor = App.CategoryButtonEdit;

/**
 * Render
 * @private
 */
App.CategoryButtonEdit.prototype._render = function _render()
{
    App.CategoryButton.prototype._render.call(this);

    var pixelRatio = this._layout.pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._background.beginFill(0xE53013);
    this._background.drawRect(0,0,w,h);
    this._background.endFill();

    this._editLabel.x = Math.round(w - 50 * pixelRatio);
    this._editLabel.y = Math.round(18 * pixelRatio);
};

/**
 * Enable interaction
 * @private
 */
App.CategoryButtonEdit.prototype._enableInteraction = function _enableInteraction()
{
    if (!this._enabled)
    {
        this._enabled = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this.interactive = true;
    }
};

/**
 * Disable interaction
 * @private
 */
App.CategoryButtonEdit.prototype._disableInteraction = function _disableInteraction()
{
    this.interactive = false;

    this._interactiveState = null;

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._enabled = false;
};

/**
 * Tick handler
 * @private
 */
App.CategoryButtonEdit.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;
    if (this._interactiveState === InteractiveState.SWIPING) this._swipe();
    else if (this._interactiveState === InteractiveState.SNAPPING) this._snap();
};

/**
 * @method swipe
 * @param {string} direction
 * @private
 */
App.CategoryButtonEdit.prototype.swipeStart = function swipeStart(direction)
{
    var Direction = App.Direction,
        InteractiveState = App.InteractiveState;

    if (!this._interactiveState)
    {
        if (!this._editButtonShown && direction === Direction.LEFT)
        {
            this._interactiveState = InteractiveState.SWIPING;
            this._enableInteraction();
        }
        else if (this._editButtonShown && direction === Direction.RIGHT)
        {
            this._interactiveState = InteractiveState.SNAPPING;
            this._enableInteraction();
        }
    }
};

/**
 * @method swipe
 * @private
 */
App.CategoryButtonEdit.prototype.swipeEnd = function swipeEnd()
{
    if (this._interactiveState === App.InteractiveState.SWIPING) this._interactiveState = App.InteractiveState.SNAPPING;
};

/**
 * @method swipe
 * @private
 */
App.CategoryButtonEdit.prototype._swipe = function _swipe()
{
    if (this.stage && !this._editButtonShown)
    {
        var w = this._layout.width;
        this._surfaceSkin.x = -Math.round(w * (1 - (this.stage.getTouchPosition().x / w)) * this._dragFriction);
    }
};

/**
 * @method _snap
 * @private
 */
App.CategoryButtonEdit.prototype._snap = function _snap()
{
    var result = Math.round(this._surfaceSkin.x * this._snapForce);

    // Snap to show edit button
    if (this._surfaceSkin.x < -this._editOffset)
    {
        if (result >= -this._editOffset)
        {
            this._editButtonShown = true;
            this._disableInteraction();

            this._surfaceSkin.x = -this._editOffset;
        }
        else
        {
            this._surfaceSkin.x = result;
        }
    }
    // Snap to close edit button
    else
    {
        if (result >= -1)
        {
            this._editButtonShown = false;
            this._disableInteraction();

            this._surfaceSkin.x = 0;
        }
        else
        {
            this._surfaceSkin.x = result;
        }
    }
};

/**
 * Close Edit button
 * @param {boolean} [immediate=false]
 */
App.CategoryButtonEdit.prototype.closeEditButton = function closeEditButton(immediate)
{
    if (this._editButtonShown)
    {
        if (immediate)
        {
            this._surfaceSkin.x = 0;
            this._editButtonShown = false;
        }
        else
        {
            this._interactiveState = App.InteractiveState.SNAPPING;
            this._enableInteraction();
        }
    }
};

/**
 * Destroy
 */
App.CategoryButtonEdit.prototype.destroy = function destroy()
{
    //TODO implement
};
