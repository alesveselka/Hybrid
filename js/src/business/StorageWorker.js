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
    }
    else
    {
        var key = components[1];
        data = components[2];

        if (method === Method.GET)
        {

        }
        else if (method === Method.SET)
        {
            if (key === StorageKey.TRANSACTION)
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
