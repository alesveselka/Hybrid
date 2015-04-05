/**
 * @class SwipeButton
 * @extends DisplayObjectContainer
 * @param {number} width
 * @param {number} openOffset
 * @constructor
 */
App.SwipeButton = function SwipeButton(width,openOffset)
{
    PIXI.DisplayObjectContainer.call(this);

    this._width = width;
    this._interactionEnabled = false;
    this._interactiveState = null;
    this._dragFriction = 0.5;
    this._snapForce = 0.5;
    this._openOffset = openOffset;
    this._isOpen = false;
    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
};

App.SwipeButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Disable
 */
App.SwipeButton.prototype.disable = function disable()
{
    this._disableInteraction();
    this.close(true);
};

/**
 * Enable interaction
 * @private
 */
App.SwipeButton.prototype._enableInteraction = function _enableInteraction()
{
    if (!this._interactionEnabled)
    {
        this._interactionEnabled = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this.interactive = true;
    }
};

/**
 * Disable interaction
 * @private
 */
App.SwipeButton.prototype._disableInteraction = function _disableInteraction()
{
    this.interactive = false;

    this._interactiveState = null;

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._interactionEnabled = false;
};

/**
 * Tick handler
 * @private
 */
App.SwipeButton.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;
    if (this._interactiveState === InteractiveState.SWIPING) this._swipe();
    else if (this._interactiveState === InteractiveState.SNAPPING) this._snap();
};

/**
 * @method swipeStart
 * @param {string} direction
 */
App.SwipeButton.prototype.swipeStart = function swipeStart(direction)
{
    var Direction = App.Direction,
        InteractiveState = App.InteractiveState;

    if (!this._interactiveState)
    {
        if (!this._isOpen && direction === Direction.LEFT)
        {
            this._interactiveState = InteractiveState.SWIPING;
            this._enableInteraction();
        }
        else if (this._isOpen && direction === Direction.RIGHT)
        {
            this._interactiveState = InteractiveState.SNAPPING;
            this._enableInteraction();
        }
    }
};

/**
 * @method swipeEnd
 */
App.SwipeButton.prototype.swipeEnd = function swipeEnd()
{
    if (this._interactiveState === App.InteractiveState.SWIPING) this._interactiveState = App.InteractiveState.SNAPPING;
};

/**
 * @method _swipe
 * @private
 */
App.SwipeButton.prototype._swipe = function _swipe()
{
    if (this.stage && !this._isOpen)
    {
        var x = this.stage.getTouchPosition().x;

        if (x <= -10000) return;

        this._updateSwipePosition(-Math.round(this._width * (1 - (x / this._width)) * this._dragFriction));
    }
};

/**
 * @method _snap
 * @private
 */
App.SwipeButton.prototype._snap = function _snap()
{
    var swipePosition = this._getSwipePosition(),
        result = Math.round(swipePosition * this._snapForce);

    // Snap to open
    if (swipePosition < -this._openOffset)
    {
        if (result >= -this._openOffset)
        {
            this._isOpen = true;
            this._disableInteraction();

            this._updateSwipePosition(-this._openOffset);
        }
        else
        {
            this._updateSwipePosition(result);
        }
    }
    // Snap to close
    else
    {
        if (result >= -1)
        {
            this._isOpen = false;
            this._disableInteraction();

            this._updateSwipePosition(0);
        }
        else
        {
            this._updateSwipePosition(result);
        }
    }
};

/**
 * Close Edit button
 * @param {boolean} [immediate=false]
 */
App.SwipeButton.prototype.close = function close(immediate)
{
    if (this._isOpen)
    {
        if (immediate)
        {
            this._updateSwipePosition(0);
            this._isOpen = false;
        }
        else
        {
            this._interactiveState = App.InteractiveState.SNAPPING;
            this._enableInteraction();
        }
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.SwipeButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    // Abstract
};

/**
 * Return swipe position
 * @private
 */
App.SwipeButton.prototype._getSwipePosition = function _getSwipePosition()
{
    // Abstract
};
