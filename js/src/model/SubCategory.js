/**
 * @class SubCategory
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.SubCategory = function SubCategory(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.name = data[1];
    this.category = data[2];
};
