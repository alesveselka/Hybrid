/**
 * @class CategoryButtonExpand
 * @extends DisplayObjectContainer
 * @param {Category} model
 * @param {Object} layout
 * @param {{font:string,fill:string}} nameLabelStyle
 * @constructor
 */
App.CategoryButtonExpand = function CategoryButtonExpand(model,layout,nameLabelStyle)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        eventListenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this.boundingBox = new App.Rectangle(0,0,layout.width,Math.round(50*layout.pixelRatio));

    this._model = model;
    this._layout = layout;
    this._eventsRegistered = false;
    this._transitionState = App.TransitionState.CLOSED;
    this._buttonHeight = this.boundingBox.height;
    this._subCategoryListHeight = Math.round(150 * layout.pixelRatio);//TODO temporary

    this._openCloseTween = new App.TweenProxy(0.4,App.Easing.outExpo,0,eventListenerPool);
    this._eventDispatcher = new App.EventDispatcher(eventListenerPool);
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);

    this._surface = new App.CategoryButtonSurface(model.icon,model.name,nameLabelStyle);
    this._subCategoryList = new PIXI.Graphics();
    this._subCategoryList.visible = false;

    this._render();

    this.addChild(this._subCategoryList);
    this.addChild(this._surface);
};

App.CategoryButtonExpand.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButtonExpand.prototype.constructor = App.CategoryButtonExpand;

/**
 * Render
 * @private
 */
App.CategoryButtonExpand.prototype._render = function _render()
{
    var w = this.boundingBox.width;

    this._surface.render(w,this.boundingBox.height,this._layout.pixelRatio);

    App.GraphicUtils.drawRect(this._subCategoryList,0xffffff,1,0,0,w,this._subCategoryListHeight);
    this._subCategoryList.y = this._buttonHeight;
};

/**
 * Enable interaction
 * @private
 */
App.CategoryButtonExpand.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._openCloseTween.addEventListener(App.EventType.COMPLETE,this,this._onTransitionComplete);
    }
};

/**
 * Disable interaction
 * @private
 */
App.CategoryButtonExpand.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._openCloseTween.removeEventListener(App.EventType.COMPLETE,this,this._onTransitionComplete);

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._eventsRegistered = false;
};

/**
 * Tick handler
 * @private
 */
App.CategoryButtonExpand.prototype._onTick = function _onTick()
{
    if (this._openCloseTween.isRunning()) this._updateTransition();
};

/**
 * Update transition
 * @private
 */
App.CategoryButtonExpand.prototype._updateTransition = function _updateTransition()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.OPENING)
    {
        this.boundingBox.height = Math.round(this._buttonHeight + this._subCategoryListHeight * this._openCloseTween.progress);
    }
    else if (this._transitionState === TransitionState.CLOSING)
    {
        this.boundingBox.height = Math.round(this._buttonHeight + this._subCategoryListHeight * (1 - this._openCloseTween.progress));
    }

    this._eventDispatcher.dispatchEvent(App.EventType.LAYOUT_UPDATE);
};

/**
 * On transition complete
 * @private
 */
App.CategoryButtonExpand.prototype._onTransitionComplete = function _onTransitionComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.OPENING)
    {
        this._transitionState = TransitionState.OPEN;

        this.boundingBox.height = this._buttonHeight + this._subCategoryListHeight;
    }
    else if (this._transitionState === TransitionState.CLOSING)
    {
        this._transitionState = TransitionState.CLOSED;

        this.boundingBox.height = this._buttonHeight;

        this._subCategoryList.visible = false;
    }

    this._unRegisterEventListeners();

    this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Click handler
 * @param {Point} position
 */
App.CategoryButtonExpand.prototype.onClick = function onClick(position)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open();
    else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close();

    //TODO pass in click point and determine action accordingly, dispatch 'COMPLETE' if there is no action
};

/**
 * Check if its open
 * @returns {boolean}
 */
App.CategoryButtonExpand.prototype.isOpen = function isOpen()
{
    return this._transitionState !== App.TransitionState.CLOSED;
};

/**
 * Open
 */
App.CategoryButtonExpand.prototype.open = function open()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
    {
        this._registerEventListeners();

        this._subCategoryList.visible = true;

        this._transitionState = TransitionState.OPENING;

        this._openCloseTween.restart();
    }
};

/**
 * Close
 * @param {boolean} [immediate=false]
 */
App.CategoryButtonExpand.prototype.close = function close(immediate)
{
    //TODO implement 'immediate' close

    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
    {
        this._registerEventListeners();

        this._transitionState = TransitionState.CLOSING;

        this._openCloseTween.start(true);
    }
    else
    {
        // Already closed - but dispatch event so parent can cancel its processes
        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this);
    }
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.CategoryButtonExpand.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.CategoryButtonExpand.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};
