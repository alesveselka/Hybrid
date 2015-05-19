/**
 * Storage
 * @param {string} workerUrl
 * @constructor
 */
App.Storage = function Storage(workerUrl)
{
    this._workerUrl = workerUrl;
    this._method = {GET:"get",SET:"set"};
    this._worker = null;
    this._initialized = false;

//    console.log(App.DefaultData.currencyPairs);
//    console.log(JSON.stringify(App.DefaultData.currencyPairs));
};

/**
 * Init
 * @private
 */
App.Storage.prototype._init = function _init()
{
    if (!this._initialized)
    {
        this._initialized = true;

        if (window.Worker)
        {
            this._worker = new Worker(this._workerUrl);

            this._registerEventListeners();

            this._worker.postMessage("init/"+JSON.stringify({StorageKey:App.StorageKey,Method:this._method}));
        }
    }
};

/**
 * Register event listeners
 * @private
 */
App.Storage.prototype._registerEventListeners = function _registerEventListeners()
{
    if (this._worker) this._worker.addEventListener("message",this._onWorkerMessage);
};

/**
 * Send data to worker to save under key passed in
 * @param {string} key
 * @param {Object} data
 */
App.Storage.prototype.setData = function setData(key,data)
{
    if (!this._initialized) this._init();

    if (this._worker) this._worker.postMessage(this._method.SET+"/"+key+"/"+data);
};

/**
 * Query worker for data by key passed in
 * @param {string} key
 */
App.Storage.prototype.getData = function getData(key)
{
    if (!this._initialized) this._init();

    if (this._worker) this._worker.postMessage(this._method.GET+"/"+key);
};

/**
 * On worker message
 * @param {Event} e
 * @private
 */
App.Storage.prototype._onWorkerMessage = function _onWorkerMessage(e)
{
    console.log("on worker message ",e.data);
};
