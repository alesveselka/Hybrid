App.SelectTimeScreen = function SelectTimeScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(new Date(),w,r);

    //TODO also add overlay to receive click to blur input's focus

    this._render();

    this._container.addChild(this._inputBackground);
    this._container.addChild(this._input);
    this._container.addChild(this._header);
    this._container.addChild(this._calendar);

    this._pane.setContent(this._container);

    this.addChild(this._pane);
};

App.SelectTimeScreen.prototype = Object.create(App.Screen.prototype);
App.SelectTimeScreen.prototype.constructor = App.SelectTimeScreen;

/**
 * Render
 * @private
 */
App.SelectTimeScreen.prototype._render = function _render()
{
    var r = this._layout.pixelRatio,
        inputBgHeight = Math.round(60 * r),
        w = this._layout.width;

    this._inputBackground.clear();
    this._inputBackground.beginFill(0xefefef);
    this._inputBackground.drawRect(0,0,w,inputBgHeight);
    this._inputBackground.beginFill(0xcccccc);
    this._inputBackground.drawRect(0,inputBgHeight-r,w,r);
    this._inputBackground.endFill();

    this._input.x = Math.round(10 * r);
    this._input.y = Math.round((inputBgHeight - this._input.height) / 2);

    this._header.y = inputBgHeight;

    this._calendar.y = Math.round(this._header.y + this._header.height);
};

/**
 * Enable
 */
App.SelectTimeScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
//    this._calendar.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
//    this._calendar.disable();
    this._pane.disable();
};

/**
 * Click handler
 * @private
 */
App.SelectTimeScreen.prototype._onClick = function _onClick()
{
    this._calendar.onClick();
};