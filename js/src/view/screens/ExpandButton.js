/**
 * @class ExpandButton
 * @extends DisplayObjectContainer
 * @param {number} width
 * @param {number} height
 * @param {boolean} useMask
 * @constructor
 */
App.ExpandButton = function ExpandButton(width,height,useMask)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        eventListenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._content = null;
    this._contentHeight = height;
    this._buttonHeight = height;
    this._useMask = useMask;
    this._updateBoundsInTransition = false;

    this._eventsRegistered = false;
    this._transitionState = App.TransitionState.CLOSED;
    this._expandTween = new App.TweenProxy(0.4,App.Easing.outExpo,0,eventListenerPool);
    this._eventDispatcher = new App.EventDispatcher(eventListenerPool);
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);

    if (this._useMask)
    {
        this._mask = new PIXI.Graphics();
        this.mask = this._mask;
        this._updateMask();
        this.addChild(this._mask);
    }
};

App.ExpandButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ExpandButton.prototype.constructor = App.ExpandButton;

/**
 * Set content
 * @param {Object} content
 * @private
 */
App.ExpandButton.prototype._setContent = function _setContent(content)
{
    this._content = content;
    this._contentHeight = this._content.boundingBox ? this._content.boundingBox.height : this._content.height;

    this._content.visible = false;
    this._content.y = this._buttonHeight;
};

/**
 * Enable interaction
 * @private
 */
App.ExpandButton.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._expandTween.addEventListener(App.EventType.COMPLETE,this,this._onTransitionComplete);
    }
};

/**
 * Disable interaction
 * @private
 */
App.ExpandButton.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._expandTween.removeEventListener(App.EventType.COMPLETE,this,this._onTransitionComplete);

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._eventsRegistered = false;
};

/**
 * Tick handler
 * @private
 */
App.ExpandButton.prototype._onTick = function _onTick()
{
    if (this._expandTween.isRunning()) this._updateTransition();
};

/**
 * Update transition
 * @private
 */
App.ExpandButton.prototype._updateTransition = function _updateTransition()
{
    this._updateBounds(this._updateBoundsInTransition);
    if (this._useMask) this._updateMask();
};

/**
 * On transition complete
 * @private
 */
App.ExpandButton.prototype._onTransitionComplete = function _onTransitionComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.OPENING)
    {
        this._transitionState = TransitionState.OPEN;
    }
    else if (this._transitionState === TransitionState.CLOSING)
    {
        this._transitionState = TransitionState.CLOSED;

        this._content.visible = false;
    }

    this._unRegisterEventListeners();

    this._updateBounds(this._updateBoundsInTransition);
    if (this._useMask) this._updateMask();

    if (!this.isInTransition())
    {
        this._updateBoundsInTransition = false;

        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this);
    }
};

/**
 * Update bounds
 * @param {boolean} [updateContent=false]
 * @private
 */
App.ExpandButton.prototype._updateBounds = function _updateBounds(updateContent)
{
    var TransitionState = App.TransitionState;

    if (updateContent)
    {
        this._contentHeight = this._content.boundingBox ? this._content.boundingBox.height : this._content.height;
    }

    if (this._transitionState === TransitionState.OPENING)
    {
        this.boundingBox.height = Math.round(this._buttonHeight + this._contentHeight * this._expandTween.progress);
    }
    else if (this._transitionState === TransitionState.OPEN)
    {
        this.boundingBox.height = this._buttonHeight + this._contentHeight;
    }
    else if (this._transitionState === TransitionState.CLOSING)
    {
        this.boundingBox.height = Math.round(this._buttonHeight + this._contentHeight * (1 - this._expandTween.progress));
    }
    else if (this._transitionState === TransitionState.CLOSED)
    {
        this.boundingBox.height = this._buttonHeight;
    }
};

/**
 * Re-draw mask
 * @private
 */
App.ExpandButton.prototype._updateMask = function _updateMask()
{
    App.GraphicUtils.drawRect(this._mask,0xff0000,1,0,0,this.boundingBox.width,this.boundingBox.height);
};

/**
 * Click handler
 * @param {Point} position
 */
App.ExpandButton.prototype.onClick = function onClick(position)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open();
    else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close();
};

/**
 * Check if its open
 * @returns {boolean}
 */
App.ExpandButton.prototype.isOpen = function isOpen()
{
    return this._transitionState !== App.TransitionState.CLOSED;
};

/**
 * Check if button is in transition
 * @returns {boolean}
 */
App.ExpandButton.prototype.isInTransition = function isInTransition()
{
    return this._transitionState === App.TransitionState.OPENING || this._transitionState === App.TransitionState.CLOSING;
};

/**
 * Open
 * @param {boolean} [updateBounds=false]
 */
App.ExpandButton.prototype.open = function open(updateBounds)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
    {
        this._registerEventListeners();

        this._content.visible = true;

        this._transitionState = TransitionState.OPENING;

        this._updateBoundsInTransition = updateBounds;

        this._expandTween.restart();
    }
};

/**
 * Close
 * @param {boolean} [immediate=false]
 * @param {boolean} [updateBounds=false]
 */
App.ExpandButton.prototype.close = function close(immediate,updateBounds)
{
    var TransitionState = App.TransitionState,
        EventType = App.EventType;

    if (immediate)
    {
        this._transitionState = TransitionState.CLOSING;

        this._updateBoundsInTransition = updateBounds;

        this._expandTween.stop();

        this._onTransitionComplete();
    }
    else
    {
        if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
        {
            this._registerEventListeners();

            this._transitionState = TransitionState.CLOSING;

            this._updateBoundsInTransition = updateBounds;

            this._expandTween.start(true);
        }
        else
        {
            // Already closed - but dispatch event so parent can cancel its processes
            this._eventDispatcher.dispatchEvent(EventType.COMPLETE,this);
        }
    }
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ExpandButton.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ExpandButton.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};
