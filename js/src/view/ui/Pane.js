App.Pane = function Pane(xScrollPolicy,yScrollPolicy,width,height)
{
    PIXI.DisplayObjectContainer.call(this);

    this._content = null;
    this._width = width;
    this._height = height;

    this._enabled = false;
    this._xOriginalScrollPolicy = xScrollPolicy;
    this._yOriginalScrollPolicy = yScrollPolicy;
    this._xScrollPolicy = xScrollPolicy;
    this._yScrollPolicy = yScrollPolicy;
    this._state = null;

    this._mouseData = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;
    this._xOffset = 0.0;
    this._yOffset = 0.0;
    this._newX = 0.0;
    this._newY = 0.0;
    this._oldX = 0.0;
    this._oldY = 0.0;
    this._friction = 0.9;
    this._dumpForce = 0.5;
};

App.Pane.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Pane.prototype.constructor = App.Pane;

/**
 * Set content of the pane
 *
 * @method setContent
 * @param {DisplayObject} content
 */
App.Pane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;

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
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerDown = function _onMouseDown(data)
{
    data.originalEvent.preventDefault();

    this._mouseData = data;

    var mp = this._mouseData.getLocalPosition(this.stage);
    this._xOffset = mp.x - this._content.x;
    this._yOffset = mp.y - this._content.y;

    this._state = App.InteractiveState.DRAGGING;
};

/**
 * On pointer up
 *
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerUp = function _onMouseUp(data)
{
    data.originalEvent.preventDefault();

    this._state = App.InteractiveState.SCROLLING;

    this._mouseData = null;
};

/**
 * On pointer move
 * @param {InteractionData} data
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
    var pullDistance = 0;

    if (this._state === App.InteractiveState.DRAGGING)
    {
        // Calculate speed
        var mp = this._mouseData.getLocalPosition(this.stage),
            speed = 1,
            ScrollPolicy = App.ScrollPolicy;

        pullDistance = 1;

        if (this._xScrollPolicy === ScrollPolicy.ON)
        {
            this._newX = mp.x;
            this._xSpeed = (this._newX - this._oldX) * speed;
            this._oldX = this._newX;

            this._content.x = Math.round(this._newX - this._xOffset);
        }

        if (this._yScrollPolicy === ScrollPolicy.ON)
        {
            this._newY = mp.y;
            this._ySpeed = (this._newY - this._oldY) * speed;
            this._oldY = this._newY;

            if (this._content.y > 0)
            {
                pullDistance = 1 - this._content.y / this._height;
                pullDistance *= this._dumpForce;

                this._content.y = Math.round(this._newY * pullDistance);
            }
            else if (this._content.y + this._content.height < this._height)
            {
                pullDistance = (this._content.y + this._content.height) / this._height;
                pullDistance *= this._dumpForce;

                this._content.y = Math.round((this._height - this._content.height) - (this._height - this._newY) * pullDistance);
            }
            else
            {
                this._content.y = Math.round(this._newY - this._yOffset);
            }
            //console.log("pullDistance C ",pullDistance,this._newY,this._yOffset);
        }
    }
    else if (this._state === App.InteractiveState.SCROLLING)
    {
        this._content.x = Math.round(this._content.x + this._xSpeed);
        this._content.y = Math.round(this._content.y + this._ySpeed);

        this._xSpeed *= this._friction;
        this._ySpeed *= this._friction;

        if (this._content.x > 0)
        {
            //this._content.x = 0;
            this._xSpeed *= this._dumpForce;
            //this._xSpeed *= -1;
            //ySpeed = 0;
        }
        else if (this._content.x + this._content.width < this._width)
        {
            //this._content.x = Math.round(this._width - this._content.width);
            this._xSpeed *= this._dumpForce;
            //this._xSpeed *= -1;
            //ySpeed  = 0;
        }

        if (this._content.y > 0)
        {
            pullDistance = 1 - this._content.y / this._height;
            pullDistance *= this._dumpForce;

            //this._content.y = 0;
            this._ySpeed *= pullDistance;
            //this._ySpeed *= -1;
            //ySpeed = 0;
        }
        else if (this._content.y + this._content.height < this._height)
        {
            pullDistance = (this._content.y + this._content.height) / this._height;
            pullDistance *= this._dumpForce;

            //this._content.y = Math.round(this._height - this._content.height);
            this._ySpeed *= pullDistance;
            //this._ySpeed *= -1;
            //ySpeed  = 0;
        }

//        console.log("pullDistance ",pullDistance);

        if (Math.abs(this._ySpeed) < .1)
        {
            this._ySpeed = 0;
            //this._content.y = Math.round(this._content.y);
            //running = false;
        }

        if (Math.abs(this._xSpeed) < .1)
        {
            this._xSpeed = 0;
            //this._content.x = Math.round(this._content.x);
            //running = false;
        }
    }
    else if (this._state === App.InteractiveState.SNAPPING)
    {

    }
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
