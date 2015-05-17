App.Storage = (function Storage()
{
    var Method = {GET:"get",SET:"set"},
        _worker = new Worker("./js/storage-worker.min.js");

    /**
     * On worker message
     * @param {Event} e
     */
    function onWorkerMessage(e)
    {
        console.log("on worker message ",e.data);
    }

    _worker.addEventListener("message",onWorkerMessage);
    _worker.postMessage("init/"+JSON.stringify({StorageKey:App.StorageKey,Method:Method}));

    return {
        /**
         * Request for data under key passed in
         * @param {string} key
         */
        getData:function getData(key)
        {
            _worker.postMessage(Method.GET+"/"+key);
        },
        /**
         * Send data to to worker for save
         * @param {string} key
         * @param {string} data JSON-formatted data to save
         */
        setData:function setData(key,data)
        {
            _worker.postMessage(Method.SET+"/"+key+"/"+data);
        }
    };
})();
