/**
 * @class TransactionCollection
 * @param {Object} data
 * @param {App.ObjectPool} eventListenerPool
 * @constructor
 */
App.TransactionCollection = function TransactionCollection(data,eventListenerPool)
{
    var StorageKey = App.StorageKey,
        ids = data.ids.sort(function(a,b){return a-b;}),
        transactions = [],
        i = 0,
        l = ids.length;

    for (;i<l;) transactions = transactions.concat(data[StorageKey.TRANSACTIONS+ids[i++]]);

    App.Collection.call(this,transactions,App.Transaction,null,eventListenerPool);

    this._maxSegmentSize = 3;
    this._meta = [];
    this._initMeta(data[StorageKey.TRANSACTIONS_META],ids);
};

App.TransactionCollection.prototype = Object.create(App.Collection.prototype);

/**
 * Initialize meta information object
 * @param {Array.<number>} meta
 * @param {Array.<number>} ids
 * @private
 */
App.TransactionCollection.prototype._initMeta = function _initMeta(meta,ids)
{
    var i = 0,
        l = meta.length,
        item = null;

    for (;i<l;i++)
    {
        item = meta[i];
        // Initialize only meta objects with one or more transactions
        if (item[1]) this._meta[i] = {metaId:item[0],length:item[1],transactionId:item[2],loaded:ids.indexOf(item[0]) > -1};
    }
};

/**
 * Serialize and return meta information
 * @returns {Array}
 */
App.TransactionCollection.prototype.serializeMeta = function serializeMeta()
{
    var i = 0,
        l = this._meta.length,
        data = [],
        meta = null;

    for (;i<l;)
    {
        meta = this._meta[i++];
        data.push([meta.metaId,meta.length,meta.transactionId]);
    }

    return data;
};

/**
 * Create and return new transaction ID
 * @returns {string}
 */
App.TransactionCollection.prototype.getTransactionId = function getTransactionId()
{
    var meta = this._meta[this._meta.length-1];

    if (meta)
    {
        if (meta.length >= this._maxSegmentSize)
        {
            this._meta[this._meta.length] = {metaId:meta.metaId+1,length:0,transactionId:0,loaded:true};
            meta = this._meta[this._meta.length-1];
        }
    }
    else
    {
        meta = {metaId:0,length:0,transactionId:0,loaded:true};
        this._meta[this._meta.length] = meta;
    }

    return meta.metaId + "." + meta.transactionId++;
};

/**
 * Find and return meta object bu id passed in
 * @param {number} id
 * @returns {{metaId:number,length:number,transactionId:number,loaded:boolean}}
 * @private
 */
App.TransactionCollection.prototype._getMetaById = function _getMetaById(id)
{
    for (var i= 0,l=this._meta.length;i<l;i++)
    {
        if (this._meta[i].metaId === id) return this._meta[i];
    }

    return this._meta[this._meta.length-1];
};

/**
 * @method addItem Add item into collection
 * @param {*} item
 */
App.TransactionCollection.prototype.addItem = function addItem(item)
{
    // Bump up length of meta object
    this._getMetaById(parseInt(item.id.split(".")[0],10)).length++;

    this._items[this._items.length] = item;

    this.dispatchEvent(App.EventType.ADDED,item);
};

/**
 * @method removeItem Remove item passed in
 * @param {*} item
 * @return {*} item
 */
App.TransactionCollection.prototype.removeItem = function removeItem(item)
{
    // Decrease length of meta object
    var meta = this._getMetaById(parseInt(item.id.split(".")[0],10));
    if (meta.length > 0) meta.length--;

    return this.removeItemAt(this.indexOf(item));
};

/**
 * Serialize and return transaction data for segment specified by ID passed in
 * @param {string} metaId
 * @param {boolean} serializeData
 * @returns {Array}
 */
App.TransactionCollection.prototype.serialize = function serialize(metaId,serializeData)
{
    var transaction = null,
        data = [],
        i = 0,
        l = this._items.length;

    for (;i<l;)
    {
        transaction = this._items[i++];
        if (metaId === transaction.id.split(".")[0]) data.push(transaction.getData(serializeData));
    }

    return data;
};
