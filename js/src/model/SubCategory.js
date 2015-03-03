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
    if (data)
    {
        if (parseInt(data[0],10) >= App.SubCategory._UID) App.SubCategory._UID = parseInt(data[0],10);

        this.id = data[0];
        this.name = data[1];
        this.category = data[2];
    }
    else
    {
        this.id = String(++App.SubCategory._UID);
        this.name = "SubCategory" + this.id;
        this.category = null;
    }
};

App.SubCategory._UID = 0;
