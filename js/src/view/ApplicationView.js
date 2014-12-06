/**
 * @class ApplicationView
 * @extends DisplayObjectContainer
 * @param {Stage} stage
 * @param {CanvasRenderer} renderer
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ApplicationView = function ApplicationView(stage,renderer,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this._renderer = renderer;
    this._stage = stage;

    this._layout = {
        originalWidth:width,
        originalHeight:height,
        width:Math.round(width * pixelRatio),
        height:Math.round(height * pixelRatio),
        headerHeight:Math.round(50 * pixelRatio),
        bodyHeight:Math.round((height - 50) - pixelRatio),
        pixelRatio:pixelRatio
    };

    this._background = new PIXI.Graphics();
    this._background.beginFill(0xbada55,1);
    this._background.drawRect(0,0,this._layout.width,this._layout.height);
    this._background.endFill();

    this._accountScreen = new App.AccountScreen(App.ModelLocator.getProxy(App.ModelName.ACCOUNTS),this._layout);
    this._categoryScreen = new App.CategoryScreen(App.ModelLocator.getProxy(App.ModelName.ACCOUNTS),this._layout);

    this._accountScreen.hide();
    this._categoryScreen.show();

    this.addChild(this._background);
    this.addChild(this._accountScreen);
    this.addChild(this._categoryScreen);

    this._registerEventListeners();
};

App.ApplicationView.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ApplicationView.prototype.constructor = App.ApplicationView;

/**
 * Register event listeners
 *
 * @method _registerEventListeners
 * @private
 */
App.ApplicationView.prototype._registerEventListeners = function _registerEventListeners()
{
    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(App.EventType.TICK,this,this._onTick);

    this._accountScreen.enable();
    this._accountScreen.addEventListener(App.EventType.CLICK,this,this._onAccountScreenClick);
    /*this._accountScreen.click = function(data)
    {
        if (!this.contains(this._categoryScreen)) this.addChild(this._categoryScreen);
        this._categoryScreen.show();

        this._accountScreen.hide();
        if (this.contains(this._accountScreen)) this.removeChild(this._accountScreen);
    }.bind(this);*/
    this._accountScreen.tap = function()
    {
        if (!this.contains(this._categoryScreen)) this.addChild(this._categoryScreen);
        this._categoryScreen.show();

        this._accountScreen.hide();
        if (this.contains(this._accountScreen)) this.removeChild(this._accountScreen);
    }.bind(this);

    this._categoryScreen.enable();
    this._categoryScreen.click = function()
    {
        if (!this.contains(this._accountScreen)) this.addChild(this._accountScreen);
        this._accountScreen.show();
        this._categoryScreen.hide();
        if (this.contains(this._categoryScreen)) this.removeChild(this._categoryScreen);
    }.bind(this);
    this._categoryScreen.tap = function()
    {
        if (!this.contains(this._accountScreen)) this.addChild(this._accountScreen);
        this._accountScreen.show();
        this._categoryScreen.hide();
        if (this.contains(this._categoryScreen)) this.removeChild(this._categoryScreen);
    }.bind(this);
};

App.ApplicationView.prototype._onAccountScreenClick = function _onAccountScreenClick()
{
    if (!this.contains(this._categoryScreen)) this.addChild(this._categoryScreen);
    this._categoryScreen.show();

    this._accountScreen.hide();
    if (this.contains(this._accountScreen)) this.removeChild(this._accountScreen);
};

/**
 * On Ticker's  Tick event
 *
 * @method _onTick
 * @private
 */
App.ApplicationView.prototype._onTick = function _onTick()
{
    this._renderer.render(this._stage);
};

App.ApplicationView.prototype._onResize = function _onResize()
{

};
