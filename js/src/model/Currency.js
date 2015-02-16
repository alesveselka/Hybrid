/**
 * @class Currency
 * @param {{symbol:string,rate:number,pair:Currency}} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Currency = function Currency(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.symbol = data[1];//quote symbol
    this.base = data[2];
    this.rate = data[3];
    this.default = this.id === 1;
};
