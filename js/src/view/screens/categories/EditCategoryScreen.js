/**
 * @class EditCategoryScreen
 * @extends Screen
 * @param {Category} model
 * @param {Object} layout
 * @constructor
 */
App.EditCategoryScreen = function EditCategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        r = layout.pixelRatio,
        w = layout.width,
        frequency = .3,
        amplitude = 127,
        center = 128,
        i = 0,
        l = 32,
        colorSamples = new Array(l);

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._input = new App.Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true);
    this._separators = new PIXI.Graphics();

    for (;i<l;i++)
    {
        colorSamples[i] = App.MathUtils.rgbToHex(
            Math.round(Math.sin(frequency * i + 0) * amplitude + center),
            Math.round(Math.sin(frequency * i + 2) * amplitude + center),
            Math.round(Math.sin(frequency * i + 4) * amplitude + center)
        );
    }
    this._colorList = new App.InfiniteList(colorSamples,App.ColorSample,App.Direction.X,w,r);
    /*this._colorList = new App.InfiniteList(
        new App.Collection(colorSamples,App.ColorSample,null,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL)),
        App.ColorSample,
        App.Direction.X,
        w
    );*/

    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._colorStripe);
    this._container.addChild(this._icon);
    this._container.addChild(this._input);
    this._container.addChild(this._separators);
    this._container.addChild(this._colorList);

    this._pane.setContent(this._container);

    this.addChild(this._pane);
};

App.EditCategoryScreen.prototype = Object.create(App.Screen.prototype);
App.EditCategoryScreen.prototype.constructor = App.EditCategoryScreen;

/**
 * Render
 * @private
 */
App.EditCategoryScreen.prototype._render = function _render()
{
    var r = this._layout.pixelRatio,
        w = this._layout.width,
        rounderRatio = Math.round(r),
        inputFragmentHeight = Math.round(60 * r),
        colorListHeight = this._colorList.boundingBox.height,
        iconResizeRatio = Math.round(33 * r) / this._icon.height,
        separatorPadding = Math.round(10 * r),
        separatorWidth = w - separatorPadding * 2;

    this._background.clear();
    this._background.beginFill(0xefefef);
    this._background.drawRect(0,0,w,inputFragmentHeight*2);
    this._background.endFill();

    this._colorStripe.clear();
    this._colorStripe.beginFill(0xff6600);
    this._colorStripe.drawRect(0,0,Math.round(4*r),Math.round(59 * r));
    this._colorStripe.endFill();

    this._icon.scale.x = iconResizeRatio;
    this._icon.scale.y = iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((inputFragmentHeight - this._icon.height) / 2);
    this._icon.tint = 0x394264;// TODO pass color from global setting?

    this._input.x = Math.round(60 * r);
    this._input.y = Math.round((inputFragmentHeight - this._input.height) / 2);

    this._colorList.y = inputFragmentHeight;

    this._separators.clear();
    this._separators.beginFill(0xcccccc);
    this._separators.drawRect(0,0,separatorWidth,rounderRatio);
    this._separators.drawRect(0,colorListHeight,separatorWidth,rounderRatio);
    this._separators.beginFill(0xffffff);
    this._separators.drawRect(0,rounderRatio,separatorWidth,rounderRatio);
    this._separators.drawRect(0,colorListHeight+rounderRatio,separatorWidth,rounderRatio);
    this._separators.endFill();
    this._separators.x = separatorPadding;
    this._separators.y = inputFragmentHeight - rounderRatio;
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
    this._colorList.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.EditCategoryScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
    this._colorList.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.EditCategoryScreen.prototype._registerEventListeners = function _registerEventListener()
{
    App.Screen.prototype._registerEventListeners.call(this);

//    var EventType = App.EventType;
//    this._input.addEventListener(EventType.FOCUS,this,this._onInputFocus);
//    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListener()
{
//    var EventType = App.EventType;
//    this._input.removeEventListener(EventType.FOCUS,this,this._onInputFocus);
//    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);

    App.Screen.prototype._unRegisterEventListeners.call(this);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
//    if (this._inputFocused) this._input.blur();

//    this._calendar.onClick();
};
