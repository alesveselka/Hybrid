/**
 * @class Currency
 * @param {{id:number,name:string}} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Currency = function Currency(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.name = data[1];
};
