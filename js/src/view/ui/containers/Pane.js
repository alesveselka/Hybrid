/**
 * @class Pane
 * @extends {DisplayObjectContainer}
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} useMask
 * @constructor
 */
App.Pane = function Pane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio,useMask)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._content = null;
    this._contentHeight = 0;
    this._contentWidth = 0;
    this._contentBoundingBox = new App.Rectangle();
    this._useMask = useMask;
    this.hitArea = this.boundingBox;

    this._enabled = false;
    this._eventsRegistered = false;
    this._state = null;
    this._xOriginalScrollPolicy = xScrollPolicy;
    this._yOriginalScrollPolicy = yScrollPolicy;
    this._xScrollPolicy = xScrollPolicy;
    this._yScrollPolicy = yScrollPolicy;
    this._xScrollIndicator = new App.ScrollIndicator(App.Direction.X,pixelRatio);
    this._yScrollIndicator = new App.ScrollIndicator(App.Direction.Y,pixelRatio);

    this._mouseData = null;
    this._oldMouseX = 0.0;
    this._oldMouseY = 0.0;
    this._xSpeed = 0.0;//TODO Average speed to avoid 'jumps'?
    this._ySpeed = 0.0;
    this._xOffset = 0.0;
    this._yOffset = 0.0;
    this._friction = 0.9;
    this._dumpForce = 0.5;
    this._snapForce = 0.2;//TODO allow to disable snapping?

    if (this._useMask)
    {
        this._mask = new PIXI.Graphics();
        this.mask = this._mask;
        this.addChild(this._mask);
    }
};

App.Pane.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Set content of the pane
 *
 * @method setContent
 * @param {PIXI.DisplayObjectContainer} content
 */
App.Pane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = Math.round(this._content.height);
    this._contentWidth = Math.round(this._content.width);
    this._contentBoundingBox.width = this._contentWidth;
    this._contentBoundingBox.height = this._contentHeight;

    this.addChildAt(this._content,0);

    this._updateScrollers();
    if (this._useMask) this._updateMask();
};

/**
 * Remove content
 *
 * @method removeContent
 */
App.Pane.prototype.removeContent = function removeContent()
{
    if (this._content && this.contains(this._content))
    {
        this.removeChild(this._content);

        this._content = null;
    }
};

/**
 * Resize
 *
 * @param {number} width
 * @param {number} height
 */
App.Pane.prototype.resize = function resize(width,height)
{
    this.boundingBox.width = width || this.boundingBox.width;
    this.boundingBox.height = height || this.boundingBox.height;

    if (this._content)
    {
        this._contentHeight = Math.round(this._content.height);
        this._contentWidth = Math.round(this._content.width);
        this._contentBoundingBox.width = this._contentWidth;
        this._contentBoundingBox.height = this._contentHeight;

        this._checkPosition();

        this._updateScrollers();
        if (this._useMask) this._updateMask();
    }
};

/**
 * Return content bounding box
 * @returns {Rectangle|*}
 */
App.Pane.prototype.getContentBounds = function getContentBounds()
{
    return this._contentBoundingBox;
};

/**
 * Re-draw mask
 * @private
 */
App.Pane.prototype._updateMask = function _updateMask()
{
    App.GraphicUtils.drawRect(this._mask,0xff0000,1,0,0,this.boundingBox.width,this.boundingBox.height);
};

/**
 * Update content's x position
 * @param {number} position
 * @private
 */
App.Pane.prototype._updateX = function _updateX(position)
{
    this._content.x = Math.round(position);
};

/**
 * Update content's y position
 * @param {number} position
 * @private
 */
App.Pane.prototype._updateY = function _updateY(position)
{
    this._content.y = Math.round(position);
};

/**
 * Enable
 */
App.Pane.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        var ScrollPolicy = App.ScrollPolicy;
        if (this._xScrollPolicy !== ScrollPolicy.OFF || this._yScrollPolicy !== ScrollPolicy.OFF) this._registerEventListeners();

        this.interactive = true;

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Pane.prototype.disable = function disable()
{
    this._unRegisterEventListeners();

    this.cancelScroll();

    this._checkPosition();

    this.interactive = false;

    this._enabled = false;
};

/**
 * Reset content scroll
 */
App.Pane.prototype.resetScroll = function resetScroll()
{
    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    if (this._content)
    {
        this._updateX(0);
        this._updateY(0);

        this._xScrollIndicator.hide(true);
        this._yScrollIndicator.hide(true);
    }
};

/**
 * Cancel scroll
 */
App.Pane.prototype.cancelScroll = function cancelScroll()
{
    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._xScrollIndicator.hide(true);
    this._yScrollIndicator.hide(true);
};

/**
 * Register event listeners
 * @private
 */
App.Pane.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        if (App.Device.TOUCH_SUPPORTED)
        {
            this.touchstart = this._onPointerDown;
            this.touchend = this._onPointerUp;
            this.touchendoutside = this._onPointerUp;
            this.touchmove = this._onPointerMove;
        }
        else
        {
            this.mousedown = this._onPointerDown;
            this.mouseup = this._onPointerUp;
            this.mouseupoutside = this._onPointerUp;
            this.mousemove = this._onPointerMove;
        }

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
    }
};

/**
 * UnRegister event listeners
 * @private
 */
App.Pane.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = null;
        this.touchend = null;
        this.touchendoutside = null;
        this.touchmove = null;
    }
    else
    {
        this.mousedown = null;
        this.mouseup = null;
        this.mouseupoutside = null;
        this.mousemove = null;
    }

    this._eventsRegistered = false;
};

/**
 * Pointer Down handler
 *
 * @method _onPointerDown
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerDown = function _onPointerDown(data)
{
    //TODO make sure just one input is registered (multiple inputs on touch screens) ...

    this._mouseData = data;

    var mp = this._mouseData.getLocalPosition(this.stage);
    this._xOffset = mp.x - this._content.x;
    this._yOffset = mp.y - this._content.y;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._state = App.InteractiveState.DRAGGING;

    if (this._xScrollPolicy === App.ScrollPolicy.ON) this._xScrollIndicator.show();
    if (this._yScrollPolicy === App.ScrollPolicy.ON) this._yScrollIndicator.show();
};

/**
 * On pointer up
 *
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerUp = function _onPointerUp(data)
{
    if (this._isContentPulled())
    {
        this._state = App.InteractiveState.SNAPPING;
        this._xSpeed = 0.0;
        this._ySpeed = 0.0;
    }
    else
    {
        this._state = App.InteractiveState.SCROLLING;
    }

    this._mouseData = null;
};

/**
 * On pointer move
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerMove = function _onPointerMove(data)
{
    this._mouseData = data;
};

/**
 * Tick handler
 *
 * @private
 */
App.Pane.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;

    if (this._state === InteractiveState.DRAGGING) this._drag(App.ScrollPolicy);
    else if (this._state === InteractiveState.SCROLLING) this._scroll(App.ScrollPolicy,InteractiveState);
    else if (this._state === InteractiveState.SNAPPING) this._snap(App.ScrollPolicy,InteractiveState);

    if (this._xScrollIndicator.visible) this._xScrollIndicator.update(this._content.x);
    if (this._yScrollIndicator.visible) this._yScrollIndicator.update(this._content.y);
};

/**
 * Perform drag operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @private
 */
App.Pane.prototype._drag = function _drag(ScrollPolicy)
{
    var pullDistance = 0;

    if (this.stage)
    {
        if (this._xScrollPolicy === ScrollPolicy.ON)
        {
            var w = this.boundingBox.width,
                mouseX = this._mouseData.getLocalPosition(this.stage).x,
                contentX = this._content.x,
                contentRight = contentX + this._contentWidth,
                contentLeft = contentX - this._contentWidth;

            if (mouseX <= -10000) return;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentX > 0)
            {
                pullDistance = (1 - contentX / w) * this._dumpForce;
                this._updateX(mouseX * pullDistance - this._xOffset * pullDistance);
            }
            else if (contentRight < w)
            {
                pullDistance = (contentRight / w) * this._dumpForce;
                this._updateX(contentLeft - (w - mouseX) * pullDistance + (this._contentWidth - this._xOffset) * pullDistance);
            }
            else
            {
                this._updateX(mouseX - this._xOffset);
            }

            this._xSpeed = mouseX - this._oldMouseX;
            this._oldMouseX = mouseX;
        }

        if (this._yScrollPolicy === ScrollPolicy.ON)
        {
            var h = this.boundingBox.height,
                mouseY = this._mouseData.getLocalPosition(this.stage).y,
                contentY = this._content.y,
                contentBottom = contentY + this._contentHeight,
                contentTop = h - this._contentHeight;

            if (mouseY <= -10000) return;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentY > 0)
            {
                pullDistance = (1 - contentY / h) * this._dumpForce;
                this._updateY(mouseY * pullDistance - this._yOffset * pullDistance);
            }
            else if (contentBottom < h)
            {
                pullDistance = (contentBottom / h) * this._dumpForce;
                this._updateY(contentTop - (h - mouseY) * pullDistance + (this._contentHeight - this._yOffset) * pullDistance);
            }
            else
            {
                this._updateY(mouseY - this._yOffset);
            }

            this._ySpeed = mouseY - this._oldMouseY;
            this._oldMouseY = mouseY;
        }
    }
};

/**
 * Perform scroll operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @param {App.InteractiveState} InteractiveState
 * @private
 */
App.Pane.prototype._scroll = function _scroll(ScrollPolicy,InteractiveState)
{
    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        this._updateX(this._content.x + this._xSpeed);

        var w = this.boundingBox.width,
            contentX = this._content.x,
            contentRight = contentX + this._contentWidth;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentX > 0)
        {
            this._xSpeed *= (1 - contentX / w) * this._dumpForce;
        }
        else if (contentRight < w)
        {
            this._xSpeed *= (contentRight / w) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._xSpeed) < .1)
        {
            this._xSpeed = 0.0;
            this._state = null;
            this._xScrollIndicator.hide();

            if (contentX > 0 || contentRight < w) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._xSpeed *= this._friction;
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        this._updateY(this._content.y + this._ySpeed);

        var h = this.boundingBox.height,
            contentY = this._content.y,
            contentBottom = contentY + this._contentHeight;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentY > 0)
        {
            this._ySpeed *= (1 - contentY / h) * this._dumpForce;
        }
        else if (contentBottom < h)
        {
            this._ySpeed *= (contentBottom / h) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._ySpeed) < .1)
        {
            this._ySpeed = 0.0;
            this._state = null;
            this._yScrollIndicator.hide();

            if (contentY > 0 || contentBottom < h) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._ySpeed *= this._friction;
        }
    }
};

/**
 * Perform snap operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @private
 */
App.Pane.prototype._snap = function _snap(ScrollPolicy)
{
    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        var w = this.boundingBox.width,
            contentX = this._content.x,
            contentRight = contentX + this._contentWidth,
            contentLeft = contentX - this._contentWidth,
            result = contentX * this._snapForce;

        if (contentX > 0)
        {
            if (result < 5)
            {
                this._state = null;
                this._updateX(0);
                this._xScrollIndicator.hide();
            }
            else
            {
                this._updateX(result);
            }
        }
        else if (contentRight < w)
        {
            result = contentLeft + (contentX - contentLeft) * this._snapForce;
            if (result >= w - 5)
            {
                this._state = null;
                this._updateX(contentLeft);
                this._xScrollIndicator.hide();
            }
            else
            {
                this._updateX(result);
            }
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        var h = this.boundingBox.height,
            contentY = this._content.y,
            contentBottom = contentY + this._contentHeight,
            contentTop = h - this._contentHeight;

        if (contentY > 0)
        {
            result = contentY * this._snapForce;
            if (result < 5)
            {
                this._state = null;
                this._updateY(0);
                this._yScrollIndicator.hide();
            }
            else
            {
                this._updateY(result);
            }
        }
        else if (contentBottom < h)
        {
            result = contentTop + (contentY - contentTop) * this._snapForce;
            if (result >= contentTop - 5)
            {
                this._state = null;
                this._updateY(contentTop);
                this._yScrollIndicator.hide();
            }
            else
            {
                this._updateY(result);
            }
        }
    }
};

/**
 * Is content pulled
 * @returns {boolean}
 * @private
 */
App.Pane.prototype._isContentPulled = function _isContentPulled()
{
    if (this._contentHeight > this.boundingBox.height)
    {
        if (this._content.y > 0) return true;
        else if (this._content.y + this._contentHeight < this.boundingBox.height) return true;
    }

    if (this._contentWidth > this.boundingBox.width)
    {
        if (this._content.x > 0) return true;
        else if (this._content.x + this._contentWidth < this.boundingBox.width) return true;
    }

    return false;
};

/**
 * Update scroll indicators
 * @private
 */
App.Pane.prototype._updateScrollers = function _updateScrollers()
{
    var ScrollPolicy = App.ScrollPolicy,
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    if (this._xOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentWidth >= w)
        {
            this._xScrollPolicy = ScrollPolicy.ON;

            this._xScrollIndicator.resize(w,this._contentWidth);
            this._xScrollIndicator.x = h - this._xScrollIndicator.boundingBox.height;
            if (!this.contains(this._xScrollIndicator)) this.addChild(this._xScrollIndicator);
        }
        else
        {
            this._xScrollPolicy = ScrollPolicy.OFF;

            this._xScrollIndicator.hide();
            if (this.contains(this._xScrollIndicator)) this.removeChild(this._xScrollIndicator);
        }
    }

    if (this._yOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentHeight >= h)
        {
            this._yScrollPolicy = ScrollPolicy.ON;

            this._yScrollIndicator.resize(h,this._contentHeight);
            this._yScrollIndicator.x = w - this._yScrollIndicator.boundingBox.width;
            if (!this.contains(this._yScrollIndicator)) this.addChild(this._yScrollIndicator);
        }
        else
        {
            this._yScrollPolicy = ScrollPolicy.OFF;

            this._yScrollIndicator.hide();
            if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
        }
    }

    if (this._xScrollPolicy === ScrollPolicy.OFF && this._yScrollPolicy === ScrollPolicy.OFF) this._unRegisterEventListeners();
    else this._registerEventListeners();
};

/**
 * Check position
 * @private
 */
App.Pane.prototype._checkPosition = function _checkPosition()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height;

    if (this._contentWidth > w)
    {
        if (this._content.x > 0) this._updateX(0);
        else if (this._content.x + this._contentWidth < w) this._updateX(w - this._contentWidth);
    }
    else if (this._contentWidth <= w)
    {
        if (this._content.x !== 0) this._updateX(0);
    }

    if (this._contentHeight > h)
    {
        if (this._content.y > 0) this._updateY(0);
        else if (this._content.y + this._contentHeight < h) this._updateY(h - this._contentHeight);
    }
    else if (this._contentHeight <= h)
    {
        if (this._content.y !== 0) this._updateY(0);
    }
};
