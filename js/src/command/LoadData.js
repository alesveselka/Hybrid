/**
 * @class LoadData
 * @extends {Command}
 * @param {ObjectPool} pool
 * @constructor
 */
App.LoadData = function LoadData(pool)
{
    App.Command.call(this,false,pool);

    this._jsonLoader = null;
    this._fontLoadingInterval = -1;
    this._fontInfoElement = null;
    this._icons = null;
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
};

/**
 * Load image assets
 *
 * @method _loadAssets
 * @private
 */
App.LoadData.prototype._loadAssets = function _loadAssets()
{
    this._jsonLoader = new PIXI.JsonLoader("./data/icons-big.json");

    this._jsonLoader.on("loaded",function()
    {
        this._icons = this._jsonLoader.json.frames;
        this._jsonLoader.removeAllListeners("loaded");
        this._jsonLoader = null;

        this._loadFont();
    }.bind(this));

    this._jsonLoader.load();
};

/**
 * Set app font and check if it is loaded
 *
 * @method _loadFont
 * @private
 */
App.LoadData.prototype._loadFont = function _loadFont()
{
    this._fontInfoElement = document.getElementById("fontInfo");

    var fontInfoWidth = this._fontInfoElement.offsetWidth;

    this._fontLoadingInterval = setInterval(function()
    {
        if (this._fontInfoElement.offsetWidth !== fontInfoWidth)
        {
            clearInterval(this._fontLoadingInterval);

            //TODO remove font info element from DOM?

            this._loadData();
        }
    }.bind(this),100);

    this._fontInfoElement.style.fontFamily = "HelveticaNeueCond";
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

    var request = new XMLHttpRequest();
    request.open('GET','./data/data.json',true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400)
        {
            this.dispatchEvent(App.EventType.COMPLETE,{accounts:request.responseText,icons:this._icons});
        } else {
            console.log("error");
        }
    }.bind(this);

    request.onerror = function() {
        console.log("on error");
        this.dispatchEvent(App.EventType.COMPLETE);
    };

    request.send();
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.LoadData.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    this._jsonLoader = null;

    clearInterval(this._fontLoadingInterval);

    this._fontInfoElement = null;
};
