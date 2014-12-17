/**
 * @class Pane
 * @extends {DisplayObjectContainer}
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.Pane = function Pane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._content = null;
    this._width = width;
    this._height = height;
    this._contentHeight = 0;
    this._contentWidth = 0;

    this._enabled = false;
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
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;
    this._xOffset = 0.0;
    this._yOffset = 0.0;
    this._friction = 0.9;
    this._dumpForce = 0.5;
    this._snapForce = 0.2;
};

App.Pane.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Pane.prototype.constructor = App.Pane;

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
    this._contentHeight = this._content.height;
    this._contentWidth = this._content.width;

    this.addChildAt(this._content,0);

    this._updateScrollers();
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
    this._width = width;
    this._height = height;

    if (this._content)
    {
        this._contentHeight = this._content.height;
        this._contentWidth = this._content.width;

        this._updateScrollers();
    }
};

/**
 * Enable
 */
App.Pane.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        //TODO check scroll policy before registering events; no need to register them if policy is OFF
        this._registerEventListeners();

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

    //TODO also stop scrolling, but if 'snapping' make sure the content is not pulled after cancelling the state
    if (this._state === App.InteractiveState.DRAGGING) this._onPointerUp();

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
        this._content.x = 0;
        this._content.y = 0;

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
};

/**
 * Pointer Down handler
 *
 * @method _onPointerDown
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerDown = function _onMouseDown(data)
{
    //TODO make sure just one input is registered (multiple inputs on touch screens) ...
    //data.originalEvent.preventDefault();

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
App.Pane.prototype._onPointerUp = function _onMouseUp(data)
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
App.Pane.prototype._onPointerMove = function _onMouseMove(data)
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
            var mouseX = this._mouseData.getLocalPosition(this.stage).x,
                contentX = this._content.x,
                contentRight = contentX + this._contentWidth,
                contentLeft = contentX - this._contentWidth;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentX > 0)
            {
                pullDistance = (1 - contentX / this._width) * this._dumpForce;
                this._content.x = Math.round(mouseX * pullDistance - this._xOffset * pullDistance);
            }
            else if (contentRight < this._width)
            {
                pullDistance = (contentRight / this._width) * this._dumpForce;
                this._content.x = Math.round(contentLeft - (this._width - mouseX) * pullDistance + (this._contentWidth - this._xOffset) * pullDistance);
            }
            else
            {
                this._content.x = Math.round(mouseX - this._xOffset);
            }

            this._xSpeed = mouseX - this._oldMouseX;
            this._oldMouseX = mouseX;
        }

        if (this._yScrollPolicy === ScrollPolicy.ON)
        {
            var mouseY = this._mouseData.getLocalPosition(this.stage).y,
                contentY = this._content.y,
                contentBottom = contentY + this._contentHeight,
                contentTop = this._height - this._contentHeight;

            if (mouseY <= -10000) return;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentY > 0)
            {
                pullDistance = (1 - contentY / this._height) * this._dumpForce;
                this._content.y = Math.round(mouseY * pullDistance - this._yOffset * pullDistance);
            }
            else if (contentBottom < this._height)
            {
                pullDistance = (contentBottom / this._height) * this._dumpForce;
                this._content.y = Math.round(contentTop - (this._height - mouseY) * pullDistance + (this._contentHeight - this._yOffset) * pullDistance);
            }
            else
            {
                this._content.y = Math.round(mouseY - this._yOffset);
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
        this._content.x = Math.round(this._content.x + this._xSpeed);

        var contentX = this._content.x,
            contentRight = contentX + this._contentWidth;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentX > 0)
        {
            this._xSpeed *= (1 - contentX / this._width) * this._dumpForce;
        }
        else if (contentRight < this._width)
        {
            this._xSpeed *= (contentRight / this._width) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._xSpeed) < .1)
        {
            this._xSpeed = 0.0;
            this._state = null;
            this._xScrollIndicator.hide();

            if (contentX > 0 || contentRight < this._width) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._xSpeed *= this._friction;
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        this._content.y = Math.round(this._content.y + this._ySpeed);

        var contentY = this._content.y,
            contentBottom = contentY + this._contentHeight;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentY > 0)
        {
            this._ySpeed *= (1 - contentY / this._height) * this._dumpForce;
        }
        else if (contentBottom < this._height)
        {
            this._ySpeed *= (contentBottom / this._height) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._ySpeed) < .1)
        {
            this._ySpeed = 0.0;
            this._state = null;
            this._yScrollIndicator.hide();

            if (contentY > 0 || contentBottom < this._height) this._state = InteractiveState.SNAPPING;
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
        var contentX = this._content.x,
            contentRight = contentX + this._contentWidth,
            contentLeft = contentX - this._contentWidth,
            result = contentX * this._snapForce;

        if (contentX > 0)
        {
            if (result < 5)
            {
                this._state = null;
                this._content.x = 0;
                this._xScrollIndicator.hide();
            }
            else
            {
                this._content.x = Math.round(result);
            }
        }
        else if (contentRight < this._width)
        {
            result = contentLeft + (contentX - contentLeft) * this._snapForce;
            if (result >= this._width - 5)
            {
                this._state = null;
                this._content.x = contentLeft;
                this._xScrollIndicator.hide();
            }
            else
            {
                this._content.x = Math.round(result);
            }
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        var contentY = this._content.y,
            contentBottom = contentY + this._contentHeight,
            contentTop = this._height - this._contentHeight;

        if (contentY > 0)
        {
            result = contentY * this._snapForce;
            if (result < 5)
            {
                this._state = null;
                this._content.y = 0;
                this._yScrollIndicator.hide();
            }
            else
            {
                this._content.y = Math.round(result);
            }
        }
        else if (contentBottom < this._height)
        {
            result = contentTop + (contentY - contentTop) * this._snapForce;
            if (result >= contentTop - 5)
            {
                this._state = null;
                this._content.y = contentTop;
                this._yScrollIndicator.hide();
            }
            else
            {
                this._content.y = Math.round(result);
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
    return this._content.x > 0 ||
        this._content.y > 0 ||
        this._content.y + this._contentHeight < this._height ||
        this._content.x + this._contentWidth < this._width;
};

/**
 * Update scroll indicators
 * @private
 */
App.Pane.prototype._updateScrollers = function _updateScrollBars()
{
    var ScrollPolicy = App.ScrollPolicy;
    //TODO (un)register event listeners based on the policy!
    if (this._xOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentWidth >= this._width)
        {
            this._xScrollPolicy = ScrollPolicy.ON;

            this._xScrollIndicator.resize(this._width,this._contentWidth);
            this._xScrollIndicator.x = this._height - this._xScrollIndicator.boundingBox.height;
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
        if (this._contentHeight >= this._height)
        {
            this._yScrollPolicy = ScrollPolicy.ON;

            this._yScrollIndicator.resize(this._height,this._contentHeight);
            this._yScrollIndicator.x = this._width - this._yScrollIndicator.boundingBox.width;
            if (!this.contains(this._yScrollIndicator)) this.addChild(this._yScrollIndicator);
        }
        else
        {
            this._yScrollPolicy = ScrollPolicy.OFF;

            this._yScrollIndicator.hide();
            if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
        }
    }
};

/**
 * Destroy
 */
App.Pane.prototype.destroy = function destroy()
{
    //TODO also destroy PIXI's DisplayObjectContainer object!

    this.disable();

    this._ticker = null;

    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;
    this._mouseData = null;

    this.removeContent();

    if (this.contains(this._xScrollIndicator)) this.removeChild(this._xScrollIndicator);
    this._xScrollIndicator.destroy();
    this._xScrollIndicator = null;

    if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
    this._yScrollIndicator.destroy();
    this._yScrollIndicator = null;

    this._xOriginalScrollPolicy = null;
    this._yOriginalScrollPolicy = null;
    this._xScrollPolicy = null;
    this._yScrollPolicy = null;
};
