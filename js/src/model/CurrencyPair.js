/**
 * @class CurrencyPair
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CurrencyPair = function CurrencyPair(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.base = data[1];
    this.symbol = data[2];//quote symbol
    this.rate = data[3];

    //CZK/CZK@1.0
    //USD/CZK@25.7
};
