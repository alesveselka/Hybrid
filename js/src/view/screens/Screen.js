/**
 * Abstract Screen
 *
 * @class Screen
 * @extends {DisplayObjectContainer}
 * @param {Collection} model
 * @param {Object} layout
 * @param {number} tweenDuration
 * @constructor
 */
App.Screen = function Screen(model,layout,tweenDuration)
{
    PIXI.DisplayObjectContainer.call(this);

    this._model = model;
    this._layout = layout;
    this._enabled = false;
    this._mousePosition = null;
    this._state = App.TransitionState.HIDDEN;

    var ModelLocator = App.ModelLocator;
    var ModelName = App.ModelName;

    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._showHideTween = new App.TweenProxy(tweenDuration,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this.alpha = 0.0;
};

App.Screen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Screen.prototype.constructor = App.Screen;

/**
 * Show
 */
App.Screen.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._state === TransitionState.HIDDEN || this._state === TransitionState.HIDING)
    {
        this.enable();

        this._state = TransitionState.SHOWING;

        this._showHideTween.restart();

        this.visible = true;
    }
};

/**
 * Hide
 */
App.Screen.prototype.hide = function hide()
{
    var TransitionState = App.TransitionState;

    if (this._state === TransitionState.SHOWN || this._state === TransitionState.SHOWING)
    {
        this._state = TransitionState.HIDING;

        this._showHideTween.start(true);
    }
};

/**
 * Enable
 */
App.Screen.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this.interactive = true;

        this._registerEventListeners();

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Screen.prototype.disable = function disable()
{
    this.interactive = false;

    this._unRegisterEventListeners();

    this._enabled = false;
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Screen.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Screen.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * On tick
 * @private
 */
App.Screen.prototype._onTick = function _onTick()
{
    if (this._showHideTween.isRunning())
    {
        var TransitionState = App.TransitionState;

        if (this._state === TransitionState.SHOWING) this.alpha = this._showHideTween.progress;
        else if (this._state === TransitionState.HIDING) this.alpha = 1 - this._showHideTween.progress;
    }
};

/**
 * On tween complete
 * @private
 */
App.Screen.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._state === TransitionState.SHOWING)
    {
        this._state = TransitionState.SHOWN;

        this.alpha = 1.0;
    }
    else if (this._state === TransitionState.HIDING)
    {
        this._state = TransitionState.HIDDEN;

        this.disable();

        this.alpha = 0.0;

        this.visible = false;

        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,{target:this,state:this._state});
    }
};

/**
 * Register event listeners
 * @private
 */
App.Screen.prototype._registerEventListeners = function _registerEventListeners()
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

    this._showHideTween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
};

/**
 * UnRegister event listeners
 * @private
 */
App.Screen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._showHideTween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

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
 * On pointer down
 *
 * @param {Object} data
 * @private
 */
App.Screen.prototype._onPointerDown = function _onPointerDown(data)
{
    if (this.stage) this._mousePosition = data.getLocalPosition(this.stage);
};

/**
 * On pointer up
 * @param {Object} data
 * @private
 */
App.Screen.prototype._onPointerUp = function _onPointerUp(data)
{
    if (this.stage && this._mousePosition && this._enabled)
    {
        var newPosition = data.getLocalPosition(this.stage),
            dx = this._mousePosition.x - newPosition.x,
            dy = this._mousePosition.y - newPosition.y,
            dist = dx * dx - dy * dy,
            TransitionState = App.TransitionState;

        this._mousePosition = null;

        if (Math.abs(dist) < 5 && (this._state === TransitionState.SHOWING || this._state === TransitionState.SHOWN)) this._onClick();
    }
};

/**
 * Click handler
 * @private
 */
App.Screen.prototype._onClick = function _onClick()
{
    this._eventDispatcher.dispatchEvent(App.EventType.CLICK);
};

/**
 * Destroy
 */
App.Screen.prototype.destroy = function destroy()
{
    this.disable();

    this._eventDispatcher.destroy();
    this._eventDispatcher = null;

    this._showHideTween.destroy();
    this._showHideTween = null;

    this._ticker = null;
    this._model = null;
    this._layout = null;
    this._mousePosition = null;
    this._state = null;
};
