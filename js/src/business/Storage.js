/**
 * Storage
 * @param {string} workerUrl
 * @constructor
 */
App.Storage = function Storage(workerUrl)
{
    this._workerUrl = workerUrl;
    this._worker = null;
    this._initialized = false;
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

            this._worker.postMessage("init|"+JSON.stringify(App.StorageKey));
        }
    }
};

/**
 * Register event listeners
 * @private
 */
App.Storage.prototype._registerEventListeners = function _registerEventListeners()
{
    this._worker.addEventListener("message",this._onWorkerMessage);
};

/**
 * On worker message
 * @param {Event} e
 * @private
 */
App.Storage.prototype._onWorkerMessage = function _onWorkerMessage(e)
{
    console.log("on worker message ",e.data);
    var components = e.data.split("|");
    localStorage.setItem(components[0],components[1]);//TODO compress
};

/**
 * Send data to worker to save under key passed in
 * @param {string} key
 * @param {Object} data
 */
App.Storage.prototype.setData = function setData(key,data/*,context? (CONFIRM|DELETE|...)*/)
{
    if (!this._initialized) this._init();

    console.log("send to worker: ",JSON.stringify(data));
    this._worker.postMessage(key+"|"+JSON.stringify(data));
};

/**
 * Query worker for data by key passed in
 * @param {string} key
 */
App.Storage.prototype.getData = function getData(key)
{
    if (!this._initialized) this._init();

    var data = localStorage.getItem(key),
        serialized = data;

    if (data)
    {
        data = JSON.parse(data);
    }
    else
    {
        data = App.DefaultData[key];
        serialized = JSON.stringify(data);
        localStorage.setItem(key,serialized);//TODO save via worker ...
    }

    this._worker.postMessage("save|"+key+"|"+serialized);

    return data;
};
