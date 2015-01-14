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
        InfiniteList = App.InfiniteList,
        Direction = App.Direction,
        MathUtils = App.MathUtils,
        IconSample = App.IconSample,
        r = layout.pixelRatio,
        w = layout.width,
        i = 0,
        l = 30,
        frequency = 2 * Math.PI/l,
        amplitude = 127,
        center = 128,
        colorSamples = new Array(l),
        icons = App.ModelLocator.getProxy(App.ModelName.ICONS),
        iconsHeight = Math.round(64 * r);

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._input = new App.Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true);
    this._separators = new PIXI.Graphics();

    for (;i<l;i++)
    {
        colorSamples[i] = MathUtils.rgbToHex(
            Math.round(Math.sin(frequency * i + 0) * amplitude + center),
            Math.round(Math.sin(frequency * i + 2) * amplitude + center),
            Math.round(Math.sin(frequency * i + 4) * amplitude + center)
        );
    }
    this._colorList = new InfiniteList(colorSamples,App.ColorSample,Direction.X,w,Math.round(50 * r),r);

    //i = 0;
    //l = iconSamples.length;
    //for (;i<l;i++) iconSamples[i] = {top:icons[i],bottom:icons[l+i]};
    //this._iconList = new App.IconList(icons,w,r);

    this._topIconList = new InfiniteList(icons.slice(0,Math.floor(l/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._bottomIconList = new InfiniteList(icons.slice(Math.floor(l/2)),IconSample,Direction.X,w,iconsHeight,r);

    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._colorStripe);
    this._container.addChild(this._icon);
    this._container.addChild(this._input);
    this._container.addChild(this._separators);
    this._container.addChild(this._colorList);
    this._container.addChild(this._topIconList);
    this._container.addChild(this._bottomIconList);

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
        iconResizeRatio = Math.round(32 * r) / this._icon.height,
        separatorPadding = Math.round(10 * r),
        separatorWidth = w - separatorPadding * 2;

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

    this._topIconList.y = inputFragmentHeight + this._colorList.boundingBox.height;
    this._bottomIconList.y = this._topIconList.y + this._topIconList.boundingBox.height;

    this._background.clear();
    this._background.beginFill(0xefefef);
    this._background.drawRect(0,0,w,this._bottomIconList.y+this._bottomIconList.boundingBox.height);
    this._background.endFill();

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
    this._topIconList.enable();
    this._bottomIconList.enable();
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
    this._topIconList.disable();
    this._bottomIconList.disable();
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
