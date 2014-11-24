/**
 * @class LoadData
 * @extends {Command}
 * @param {ObjectPool} pool
 * @param {{assetsUrl:string,fontName:string}} settings
 * @constructor
 */
App.LoadData = function LoadData(pool,settings)
{
    App.Command.call(this,false,pool);

    this._settings = settings;
    this._assetLoader = new PIXI.AssetLoader([this._settings.assetsUrl]);

    this._fontLoadingInterval = -1;
    this._fontInfoElement = null;
};

App.LoadData.prototype = Object.create(App.Command.prototype);
App.LoadData.prototype.constructor = App.LoadData;

/**
 * Execute the command
 *
 * @method execute
 */
App.LoadData.prototype.execute = function execute()
{
    this._loadAssets();
    // images
    // font
    // localStorage

    //TODO dispatch Complete when all loading is done!
    //this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Load image assets
 *
 * @method _loadAssets
 * @private
 */
App.LoadData.prototype._loadAssets = function _loadAssets()
{
    console.log("_loadAssets");
    this._assetLoader.onComplete = function()
    {
        console.log("_onAssetsLoadComplete");
        this._assetLoader.onComplete = null; //TODO destroy?

        this._loadFont();
    }.bind(this);
    this._assetLoader.load();
};

/**
 * Set app font and check if it is loaded
 *
 * @method _loadFont
 * @private
 */
App.LoadData.prototype._loadFont = function _loadFont()
{
    console.log("_loadFont");
    //this._fontInfoElement = document.getElementById("fontInfo");

    var fontInfoWidth = this._fontInfoElement.offsetWidth;

    this._fontLoadingInterval = setInterval(function()
    {
        console.log("_fontLoadingInterval",this._fontInfoElement.offsetWidth ,fontInfoWidth);
        if (this._fontInfoElement.offsetWidth !== fontInfoWidth)
        {
            clearInterval(this._fontLoadingInterval);
            console.log("loadFontComplete");
            //TODO remove font info element from DOM?
            // Complete!
            this._loadData();
        }
    }.bind(this),100);

    this._fontInfoElement.style.fontFamily = this._settings.fontName;
};

/**
 * Load locally stored app data
 *
 * @method _loadData
 * @private
 */
App.LoadData.prototype._loadData = function _loadData()
{
    //TODO Access local storage
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.LoadData.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    console.log("LoadData.destroy() called");
};
