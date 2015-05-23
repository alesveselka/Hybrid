var StorageKey = null,
    Method = null,
    _proxies = {}; //This will hold latest snapshots of data; data are updated every time when set and retrieved.

/**
 * Error handler
 * @param e
 */
function onError(e)
{
    //
}

/**
 * Message handler
 * @param {Event} e
 */
function onMessage(e)
{
    var components = e.data.split("/"),
        method = components[0],
        data = null;

    if (method === "init") {
        data = JSON.parse(components[1]);
        StorageKey = data.StorageKey;
        Method = data.Method;
        console.log("init");
    }
    else
    {
        var key = components[1].split("?"),
            query = null;

        if (key.length > 1)
        {
            query = key[1];
            key = key[0];
        }
        data = components[2];

        if (method === Method.GET)
        {
            postMessage(JSON.stringify({key:key,data:this.localStorage.getItem(key)}));
            /*if (key === StorageKey.TRANSACTIONS)
            {
                console.log("GET: ",key,query);
            }*/
        }
        else if (method === Method.SET)
        {
            if (key === StorageKey.TRANSACTIONS)
            {
                saveTransaction(data);
            }
        }
    }
}

function saveTransaction(data)
{

}

/**
 * Register event listeners
 */
function registerEventListeners()
{
    addEventListener("message",onMessage);
    addEventListener("error",onError);
}

/**
 * Initialize worker
 */
(function init()
{
    registerEventListeners();
})();
