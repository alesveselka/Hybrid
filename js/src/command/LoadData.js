/**
 * @class LoadData
 * @extends {Command}
 * @param {ObjectPool} pool
 * @param {Storage} storage
 * @constructor
 */
App.LoadData = function LoadData(pool,storage)
{
    App.Command.call(this,false,pool);

    this._storage = storage;
    this._jsonLoader = null;
    this._fontLoadingInterval = -1;
    this._fontInfoElement = null;
    this._icons = null;
};

App.LoadData.prototype = Object.create(App.Command.prototype);

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

    var FontStyle = App.FontStyle,
        fontInfoWidth = this._fontInfoElement.offsetWidth,
        fontName = "QW@HhsXJ",
        fontsLoaded = 0;

    this._fontLoadingInterval = setInterval(function()
    {
        if (this._fontInfoElement.offsetWidth !== fontInfoWidth && this._fontInfoElement.style.fontFamily === fontName)
        {
            fontsLoaded++;

            if (fontsLoaded === 1)
            {
                fontInfoWidth = this._fontInfoElement.offsetWidth;

                fontName = FontStyle.CONDENSED;
                this._fontInfoElement.style.fontFamily = FontStyle.CONDENSED;
            }
            else if (fontsLoaded >= 2)
            {
                clearInterval(this._fontLoadingInterval);

                document.body.removeChild(this._fontInfoElement);

                this._loadData();
            }
        }
    }.bind(this),100);

    fontName = FontStyle.LIGHT_CONDENSED;
    this._fontInfoElement.style.fontFamily = FontStyle.LIGHT_CONDENSED;
};

/**
 * Load locally stored app data
 *
 * @method _loadData
 * @private
 */
App.LoadData.prototype._loadData = function _loadData()
{
    var StorageKey  = App.StorageKey,
        userData = Object.create(null),
        timeStamp = window.performance && window.performance.now ? window.performance : Date,
        start = timeStamp.now(),
        transactions = Object.create(null),
        transactionIds = null,
        transactionKey = null,
        i = 0,
        l = 0;
//    localStorage.clear();
    userData[StorageKey.SETTINGS] = this._storage.getData(StorageKey.SETTINGS);
    userData[StorageKey.CURRENCY_PAIRS] = this._storage.getData(StorageKey.CURRENCY_PAIRS);
    userData[StorageKey.SUB_CATEGORIES] = this._storage.getData(StorageKey.SUB_CATEGORIES);
    userData[StorageKey.CATEGORIES] = this._storage.getData(StorageKey.CATEGORIES);
    userData[StorageKey.ACCOUNTS] = this._storage.getData(StorageKey.ACCOUNTS);
    transactions[StorageKey.TRANSACTIONS_META] = this._storage.getData(StorageKey.TRANSACTIONS_META);

    // Find and load two last segments of transactions
    transactionIds = this._getMetaIds(transactions[StorageKey.TRANSACTIONS_META],2);
    for (l=transactionIds.length;i<l;)
    {
        transactionKey = StorageKey.TRANSACTIONS+transactionIds[i++];
        transactions[transactionKey] = this._storage.getData(transactionKey);
    }
    transactions.ids = transactionIds;
    userData[StorageKey.TRANSACTIONS] = transactions;

    console.log("userData: ",timeStamp.now()-start,userData);

    this.dispatchEvent(App.EventType.COMPLETE,{userData:userData,icons:this._icons});
};

/**
 * Find and return IDs of transaction segments to load
 * @param {Array.<Array>} metas
 * @param {number} lookBack
 * @private
 */
App.LoadData.prototype._getMetaIds = function _getMetaIds(metas,lookBack)
{
    var i = metas.length > lookBack ? lookBack : metas.length - 1,
        meta = null,
        ids = [];

    for (;i>-1;)
    {
        meta = metas[i--];
        // Only return IDs of meta, that have more than zero transactions
        if (meta[1]) ids.push(meta[0]);
    }

    return ids;
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

    this._storage = null;

    this._fontInfoElement = null;
    this._icons = null;
};
