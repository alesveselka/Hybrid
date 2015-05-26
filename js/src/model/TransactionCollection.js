/**
 * @class TransactionCollection
 * @param {Object} data
 * @param {App.ObjectPool} eventListenerPool
 * @constructor
 */
App.TransactionCollection = function TransactionCollection(data,eventListenerPool)
{
    var StorageKey = App.StorageKey,
        transactions = [],
        transactionIds = [];

    for (var prop in data)
    {
        if (prop !== StorageKey.TRANSACTIONS_META)
        {
            transactionIds.push(parseInt(prop.replace(/\D/g,""),10));
            transactions = transactions.concat(data[prop]);
        }
    }

    App.Collection.call(this,transactions,App.Transaction,null,eventListenerPool);

    this._maxSegmentSize = 45;
    this._meta = [];
    this._initMeta(data[StorageKey.TRANSACTIONS_META],transactionIds);
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
        this._meta[i] = {metaId:item[0],length:item[1],transactionId:item[2],loaded:ids.indexOf(item[0]) > -1};
    }
};

/**
 * Create and return new transaction
 * @returns {App.Transaction}
 */
App.TransactionCollection.prototype.createTransaction = function createTransaction()
{
    var transaction = new App.Transaction(),
        meta = this._meta[this._meta.length-1];

    if (meta.length >= this._maxSegmentSize)
    {
        this._meta[this._meta.length] = {metaId:meta.metaId++,length:0,transactionId:0,loaded:true};
        meta = this._meta[this._meta.length-1];
    }

    transaction.id = meta.metaId + "." + meta.transactionId++;

    return transaction;
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
