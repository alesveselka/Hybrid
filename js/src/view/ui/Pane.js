App.Pane = function Pane(xScrollPolicy,yScrollPolicy,width,height)
{
    PIXI.DisplayObjectContainer.call(this);

    this._content = null;
    this._width = width;
    this._height = height;
    this._contentHeight = 0;
    this._contentWidth = 0;

    this._enabled = false;
    this._xOriginalScrollPolicy = xScrollPolicy;
    this._yOriginalScrollPolicy = yScrollPolicy;
    this._xScrollPolicy = xScrollPolicy;
    this._yScrollPolicy = yScrollPolicy;
    this._state = null;

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
 * @param {PIXI.DisplayObject} content
 */
App.Pane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = this._content.boundingBox.height;
    this._contentWidth = this._content.boundingBox.width;

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
 * Enable
 */
App.Pane.prototype.enable = function enable()
{
    if (!this._enabled)
    {
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
    
};

/**
 * Register event listeners
 * @private
 */
App.Pane.prototype._registerEventListeners = function _registerEventListeners()
{
    //TODO can register only either mouse or touch, based on device
    this.mousedown = this._onPointerDown;
    this.mouseup = this._onPointerUp;
    this.mouseupoutside = this._onPointerUp;
    this.touchstart = this._onPointerDown;
    this.touchend = this._onPointerUp;
    this.touchendoutside = this._onPointerUp;
    this.mousemove = this._onPointerMove;
    this.touchmove = this._onPointerMove;

    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * UnRegister event listeners
 * @private
 */
App.Pane.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{

};

/**
 * Pointer Down handler
 *
 * @method _onPointerDown
 * @param {PIXI.InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerDown = function _onMouseDown(data)
{
    //TODO handle multiple pointers at once (at touch screens)

    data.originalEvent.preventDefault();

    this._mouseData = data;

    var mp = this._mouseData.getLocalPosition(this.stage);
    this._xOffset = mp.x - this._content.x;
    this._yOffset = mp.y - this._content.y;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._state = App.InteractiveState.DRAGGING;
};

/**
 * On pointer up
 *
 * @param {PIXI.InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerUp = function _onMouseUp(data)
{
    data.originalEvent.preventDefault();

    if (this._isContentPulled()) this._state = App.InteractiveState.SNAPPING;
    else this._state = App.InteractiveState.SCROLLING;

    this._mouseData = null;
};

/**
 * On pointer move
 * @param {PIXI.InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerMove = function _onMouseMove(data)
{
    data.originalEvent.preventDefault();

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
    else if (this._state === InteractiveState.SCROLLING) this._scroll(App.ScrollPolicy,App.InteractiveState);
    else if (this._state === InteractiveState.SNAPPING) this._snap(App.ScrollPolicy,App.InteractiveState);
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

    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        var mouseX = this._mouseData.getLocalPosition(this.stage).x,
            contentX = this._content.x,
            contentRight = contentX + this._contentWidth,
            contentLeft = contentX - this._contentWidth;

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

        if (contentX > 0)
        {
            this._xSpeed *= (1 - contentX / this._width) * this._dumpForce;
        }
        else if (contentRight < this._width)
        {
            this._xSpeed *= (contentRight / this._width) * this._dumpForce;
        }

        if (Math.abs(this._xSpeed) < .1)
        {
            this._xSpeed = 0;

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

        if (contentY > 0)
        {
            this._ySpeed *= (1 - contentY / this._height) * this._dumpForce;
        }
        else if (contentBottom < this._height)
        {
            this._ySpeed *= (contentBottom / this._height) * this._dumpForce;
        }

        if (Math.abs(this._ySpeed) < .1)
        {
            this._ySpeed = 0;

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
            }
            else
            {
                this._content.y = Math.round(result);
            }
        }
        else if (contentBottom < this._height)
        {
            result = contentTop + (contentY - contentTop) * this._snapForce;
            if (result >= this._height - 5)
            {
                this._state = null;
                this._content.y = contentTop;
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

App.Pane.prototype._updateScrollers = function _updateScrollBars()
{
    var bounds = this._content.boundingBox, ScrollPolicy = App.ScrollPolicy;
    if (bounds)
    {
        if (this._xOriginalScrollPolicy === ScrollPolicy.AUTO)
        {
            //TODO use this Pane's height instead of the layout's
            if (bounds.width > this._width) this._xScrollPolicy = ScrollPolicy.ON;
            else this._xScrollPolicy = ScrollPolicy.OFF;
        }

        if (this._yOriginalScrollPolicy === ScrollPolicy.AUTO)
        {
            //TODO use this Pane's height instead of the layout's
            if (bounds.height > this._height) this._yScrollPolicy = ScrollPolicy.ON;
            else this._yScrollPolicy = ScrollPolicy.OFF;
        }
    }
};

App.Pane.prototype.destroy = function destroy()
{

};
