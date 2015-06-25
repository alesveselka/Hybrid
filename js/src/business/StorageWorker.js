var StorageKey = null,
    _queue = [],
    _proxies = Object.create(null), //This will hold latest snapshots of data; data are updated every time when set and retrieved.
    _processing = false;

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
    var components = e.data.split("|"),
        key = components[0];

    if (key === "init") StorageKey = JSON.parse(components[1]);
    else if (key === "save") _proxies[components[1]] = components[2];
    else pushToQueue(key,JSON.parse(components[1]));
}

/**
 * Push data to queue
 * @param {string} key
 * @param {Object} data
 */
function pushToQueue(key,data)
{
    _queue.push({key:key,data:data});

    if (!_processing) processQueue();
}

/**
 * Process queue
 */
function processQueue()
{
    _processing = true;

    if (_queue.length)
    {
        var item = _queue.shift(),
            data = item.data,
            dependencies = getDependencies(item.key);

        if (dependencies.length)
        {
            var i = 0,
                lookupItem = data[i++],
                dependency = null,
                id = -1,
                j = 0,
                l = dependencies.length,
                used = false;

            idLoop:
            while(lookupItem)
            {
                id = lookupItem[0];

                console.log("while ",item.key,i,id,lookupItem);
                for (;j<l;)
                {
                    dependency = dependencies[j++];
                    if (dependency.indexOf(id) > -1)
                    {
                        used = true;
                        break idLoop;
                    }
                }

                lookupItem = data[i++];
            }
            console.log(item.key," used ",used,i-1);
            if (!used) data.splice(i-1,1);
        }

        _proxies[item.key] = JSON.stringify(data);
        postMessage(item.key+"|"+_proxies[item.key]);
        processQueue();
    }
    else
    {
        _processing = false;
    }
}

/**
 * Find and return dependencies for key passed in
 * @param {string} key
 * @returns {Array}
 */
function getDependencies(key)
{
    var dependencies = [],
        transactionsMeta = JSON.parse(_proxies[StorageKey.TRANSACTIONS_META]),
        transactionSegmentKey = null,
        i = 0,
        l = transactionsMeta.length;

    if (key === StorageKey.SUB_CATEGORIES)
    {
        for (;i<l;)
        {
            transactionSegmentKey = StorageKey.TRANSACTIONS + transactionsMeta[i++][0];
            if (_proxies[transactionSegmentKey]) dependencies.push(JSON.parse(_proxies[transactionSegmentKey]).map(function(item){
                return item[5].split(".")[2];
            }));
        }

        // If there are no transactions, there is no need for other dependencies either
        if (dependencies.length)
        {
            dependencies.push(JSON.parse(_proxies[StorageKey.CATEGORIES]).map(function(item){
                return item[5];
            }).join(",").split(","));
        }
    }
    else if (key === StorageKey.CATEGORIES)
    {
        for (;i<l;)
        {
            transactionSegmentKey = StorageKey.TRANSACTIONS + transactionsMeta[i++][0];
            if (_proxies[transactionSegmentKey]) dependencies.push(JSON.parse(_proxies[transactionSegmentKey]).map(function(item){
                return item[5].split(".")[1];
            }));
        }

        // If there are no transactions, there is no need for other dependencies either
        if (dependencies.length)
        {
            dependencies.push(JSON.parse(_proxies[StorageKey.ACCOUNTS]).map(function(item){
                return item[3];
            }).join(",").split(","));
            console.log("Category dependencies, accounts: ",dependencies[dependencies.length-1]);

            dependencies.push(JSON.parse(_proxies[StorageKey.SUB_CATEGORIES]).map(function(item){
                return item[2];
            }));
            console.log("Category dependencies, sub-categories: ",dependencies[dependencies.length-1]);
        }
    }
    else if (key === StorageKey.ACCOUNTS)
    {
        for (;i<l;)
        {
            transactionSegmentKey = StorageKey.TRANSACTIONS + transactionsMeta[i++][0];
            if (_proxies[transactionSegmentKey]) dependencies.push(JSON.parse(_proxies[transactionSegmentKey]).map(function(item){
                return item[5].split(".")[0];
            }));
        }

        // If there are no transactions, there is no need for other dependencies either
        if (dependencies.length)
        {
            dependencies.push(JSON.parse(_proxies[StorageKey.CATEGORIES]).map(function(item){
                return item[4];
            }));
        }
    }

    return dependencies;
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
