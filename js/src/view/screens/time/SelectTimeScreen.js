App.SelectTimeScreen = function SelectTimeScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var pixelRatio = layout.pixelRatio,
        w = layout.width;

    this._inputBackground = new PIXI.Graphics();
    //TODO also make sure only numeric keyboard shows up
    this._input = new App.Input(
        "00:00",
        App.InputType.NUMBER,//TODO add 'TIME' type?
        App.Align.CENTER,
        30,
        w - Math.round(20 * pixelRatio),
        Math.round(40 * pixelRatio),
        pixelRatio
    );
    this._header = new App.ListHeader("Select Date",w,pixelRatio);
    this._calendar = new App.Calendar(new Date(),w,pixelRatio);

    //TODO also add overlay to receive click to blur input's focus

    this._render();

    this.addChild(this._inputBackground);
    this.addChild(this._input);
    this.addChild(this._header);
    this.addChild(this._calendar);
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
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
};
