/**
 * Storage
 * @param {string} workerUrl
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Storage = function Storage(workerUrl,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this._workerUrl = workerUrl;
    this._method = {GET:"get",SET:"set"};
    this._worker = null;
    this._initialized = false;
};

App.Storage.prototype = Object.create(App.EventDispatcher.prototype);

/**
 * Init
 * @private
 */
App.Storage.prototype._init = function _init()
{
    if (!this._initialized)
    {
        this._initialized = true;

        /*if (window.Worker)
        {
            this._worker = new Worker(this._workerUrl);

            this._registerEventListeners();

            this._worker.postMessage("init/"+JSON.stringify({StorageKey:App.StorageKey,Method:this._method}));
        }*/
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
    //if (!this._initialized) this._init();

    //if (this._worker) this._worker.postMessage(this._method.SET+"/"+key+"/"+data);

    //TODO check if all collection items are used and save only the ones that are (delegate to workers?)
    //TODO use this only as 'prediction' amd then fetch data from server (see Meteor)
    localStorage.setItem(key,JSON.stringify(data));//TODO compress
};

/**
 * Query worker for data by key passed in
 * @param {string} key
 * @param {string} query
 */
App.Storage.prototype.getData = function getData(key,query)
{
    //if (!this._initialized) this._init();

    var data = localStorage.getItem(key);
    if (data)
    {
        data = JSON.parse(data);
    }
    else
    {
        data = App.DefaultData[key];
        localStorage.setItem(key,JSON.stringify(data));//TODO compress
    }

    return data;
//    if (this._worker) this._worker.postMessage(this._method.GET+"/"+key+(query ? "?"+query : ""));
};

/**
 * On worker message
 * @param {Event} e
 * @private
 */
App.Storage.prototype._onWorkerMessage = function _onWorkerMessage(e)
{
    console.log("on worker message ",e.data);

    this.dispatchEvent(App.EventType.COMPLETE,e.data);
};
