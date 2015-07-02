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

    /*if (!_processing) */processQueue(key,data);
}

/**
 * Process queue
 */
function processQueue(key,data)
{
    _processing = true;

//    if (_queue.length)
//    {
        var /*item = _queue.shift(),
            data = item.data,
            key = item.key,*/
            dependencies = getDependencies(key,data);
        console.log("processQueue ",key,JSON.stringify(data),dependencies.length);
        if (dependencies.length)
        {
            var i = 0,
                lookupItem = data[i++],
                dependency = null,
                id = null,
                j = 0,
                l = dependencies.length,
                used = false;

            while(lookupItem)
            {
                id = lookupItem[0];
                used = false;

                if (key === StorageKey.ACCOUNTS && lookupItem[2])
                {
                    // Account's lifeCycle is 'active', no need to check for dependencies
                    lookupItem = data[i++];
                }
                else
                {
                    for (j=0;j<l;)
                    {
                        dependency = dependencies[j++];
                        console.log("Dependencies ",key,dependency,", id: ",id);
                        if (indexOf(dependency,id) > -1)
                        {
                            used = true;
                            break;
                        }
                    }
                    console.log(key," Used ",used);
                    if (used)
                    {
                        lookupItem = data[i++];
                    }
                    else
                    {
                        data.splice(i-1,1);
                        lookupItem = data[i];
                    }
                }
            }
        }

//        console.log("about to send back ",key,data.length);
        _proxies[key] = JSON.stringify(data);
        postMessage(key+"|"+_proxies[key]);
        /*processQueue();
    }
    else
    {
        _processing = false;
    }*/
}

/**
 * Find and return dependencies for key passed in
 * @param {string} key
 * @param {Array} data
 * @returns {Array}
 */
function getDependencies(key,data)
{
    var dependencies = [];

    if (key === StorageKey.SUB_CATEGORIES)
    {
        dependencies = getTransactionDependencies(key,dependencies);
        if (dependencies.length)
        {
            dependencies.push(JSON.parse(_proxies[StorageKey.CATEGORIES]).map(function(item){
                return item[5];
            }).join(",").split(","));
        }
    }
    else if (key === StorageKey.CATEGORIES)
    {
        dependencies = getTransactionDependencies(key,dependencies);
        if (dependencies.length)
        {
            dependencies.push(JSON.parse(_proxies[StorageKey.ACCOUNTS]).map(function(item){
                return item[2] ? item[3] : "";
            }).join(",").split(","));
        }
    }
    else if (key === StorageKey.ACCOUNTS)
    {
        dependencies = getTransactionDependencies(key,dependencies);
        if (dependencies.length)
        {
            dependencies.push(JSON.parse(_proxies[StorageKey.CATEGORIES]).map(function(item){
                return item[4];
            }));
        }
    }
    else if (key === StorageKey.TRANSACTIONS_META)
    {
        var transactions = null,
            i = 0,
            l = data.length;

        for (;i<l;)
        {
            transactions = JSON.parse(_proxies[StorageKey.TRANSACTIONS + data[i++][0]]);
            if (transactions && transactions.length) dependencies.push([parseInt(transactions[0][0].split(".")[0],10)]);
        }
    }

    return dependencies;
}

/**
 * Find and return transactions dependencies
 * @param {string} key
 * @param {Array} dependencies
 */
function getTransactionDependencies(key,dependencies)
{
    var transactionsMeta = JSON.parse(_proxies[StorageKey.TRANSACTIONS_META]),
        transactionSegmentKey = null,
        i = 0,
        l = transactionsMeta.length,
        index = 0; // Position of segment to return (in array after split: account.category.subCategory); default is 0 = Accounts

    if (key === StorageKey.CATEGORIES) index = 1;
    else if (key === StorageKey.SUB_CATEGORIES) index = 2;

    for (;i<l;)
    {
        transactionSegmentKey = StorageKey.TRANSACTIONS + transactionsMeta[i++][0];
        if (_proxies[transactionSegmentKey]) dependencies.push(JSON.parse(_proxies[transactionSegmentKey]).map(function(item){
            return item[5].split(".")[index];
        }));
    }

    return dependencies;
}

/**
 * @method indexOf Return currentItem's index
 * @param {Array} collection
 * @param {string} item
 * @return {number}
 */
function indexOf(collection,item)
{
    var multiplier = 12, i = 0, l = Math.floor(collection.length / multiplier) * multiplier;
    for (;i<l;)
    {
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
        if (collection[i++] === item) return i-1;
    }

    l = collection.length;
    for (;i<l;)
    {
        if (collection[i++] === item) return i-1;
    }

    return -1;
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
