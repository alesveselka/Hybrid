/**
 * @class AccountScreen
 * @extends DisplayObjectContainer
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(model,layout)
{
    PIXI.DisplayObjectContainer.call(this);
    //App.EventDispatcher.call(this,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));

    this._eventDispatcher = new App.EventDispatcher(App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._model = model;
    this._layout = layout;
    this._enabled = false;

    var i = 0, l = this._model.length(), AccountButton = App.AccountButton, button = null;

    this._buttons = new Array(l);
    this._buttonContainer = new PIXI.DisplayObjectContainer();

    for (;i<30;i++)
    {
        //button = new AccountButton(this._model.getItemAt(i),this._layout);
        button = new AccountButton(this._model.getItemAt(0),this._layout,i);
        this._buttons[i] = button;
        this._buttonContainer.addChild(button);
    }

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio);
    this._pane.setContent(this._buttonContainer);

    this._updateLayout();

    this.addChild(this._pane);

//    this._addButton =
};

App.AccountScreen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.AccountScreen.prototype.constructor = App.AccountScreen;

App.AccountScreen.prototype.show = function show()
{
    this.visible = true;

    this.enable();
};

App.AccountScreen.prototype.hide = function hide()
{
    this.disable();

    this.visible = false;
};

/**
 * Enable
 */
App.AccountScreen.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._pane.enable();

        this.interactive = true;

        this._registerEventListeners();

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.AccountScreen.prototype.disable = function disable()
{
    this.interactive = false;

    this._pane.disable();

    //this._registerEventListeners();

    this._enabled = false;
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.AccountScreen.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.AccountScreen.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Register event listeners
 * @private
 */
App.AccountScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    //TODO check distance between Down and Up events and recognize either "drag" or click/tap
    this.mousedown = this._onPointerDown;
    this.mouseup = this._onPointerUp;
    this.mouseupoutside = this._onPointerUp;
    this.touchstart = this._onPointerDown;
    this.touchend = this._onPointerUp;
    this.touchendoutside = this._onPointerUp;
};

App.AccountScreen.prototype._onPointerDown = function _onPointerDown(data)
{

};

App.AccountScreen.prototype._onPointerUp = function _onPointerUp(data)
{
    //console.log("_onPointerUp");
    this._eventDispatcher.dispatchEvent(App.EventType.CLICK);
};

/**
 * @method _updateLayout
 * @private
 */
App.AccountScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0, l = this._buttons.length, height = this._buttons[0].boundingBox.height;
    for (;i<l;i++)
    {
        this._buttons[i].y = i * height;
    }

    this._pane.resize(this._layout.width,this._layout.height);
};

/**
 * Destroy
 */
App.AccountScreen.prototype.destroy = function destroy()
{
    this.disable();

    this._eventDispatcher.destroy();
    this._eventDispatcher = null;

    var i = 0, button = null;
    for (;i<30;i++)
    {
        this._buttons[i] = button;
        this._buttonContainer.removeChild(button);
        button.destroy();
    }

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    this._buttonContainer = null;

    this._buttons.length = 0;
    this._buttons = null;
};
