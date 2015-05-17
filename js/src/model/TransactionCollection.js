/**
 * @class TransactionCollection
 * @param {Array.<number>} meta
 * @param {Array} transactions
 * @param {App.ObjectPool} eventListenerPool
 * @constructor
 */
App.TransactionCollection = function TransactionCollection(meta,transactions,eventListenerPool)
{
    App.Collection.call(this,transactions,App.Transaction,null,eventListenerPool);

    this._meta = new Array(meta.length);
    this._initMeta(meta);

    //console.log(this._meta);
};

App.TransactionCollection.prototype = Object.create(App.Collection.prototype);

/**
 * Initialize meta information object
 * @param {Array.<number>} meta
 * @private
 */
App.TransactionCollection.prototype._initMeta = function _initMeta(meta)
{
    var l = meta.length - 1,
        i = l;
    //TODO I will also have to know from what segment is particular transaction when I change it and save again - save in ID (meta.transaction)
    for (;i>-1;i--) this._meta[i] = {length:meta[i],loaded:i===l};
};
