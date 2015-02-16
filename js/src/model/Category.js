/**
 * @class Category
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Category = function Category(data,collection,parent,eventListenerPool)
{
    this._data = data;

    this.id = data[0];
    this.name = data[1];
    this.color = data[2];
    this.icon = data[3];
    this.budget = data[5];
    this._subCategories = null;
};

/**
 * @property subCategories
 * @type Array.<SubCategory>
 */
Object.defineProperty(App.Category.prototype,'subCategories',{
    get:function()
    {
        if (!this._subCategories) this._subCategories = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).filter(this._data[4],"id");
        return this._subCategories;
    }
});
