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
    if (data)
    {
        this._data = data;

        if (parseInt(data[0],10) >= App.Category._UID) App.Category._UID = parseInt(data[0],10);

        this.id = data[0];
        this.name = data[1];
        this.color = data[2];
        this.icon = data[3];
        this.account = data[4];
        this.budget = data[6];
        this._subCategories = null;
    }
    else
    {
        this._data = null;

        this.id = String(++App.Category._UID);
        this.name = "Category" + this.id;
        this.color = null;
        this.icon = null;
        this.account = null;
        this.budget = null;
        this._subCategories = null;
    }
};

App.Category._UID = 0;

/**
 * @property subCategories
 * @type Array.<SubCategory>
 */
Object.defineProperty(App.Category.prototype,'subCategories',{
    get:function()
    {
        if (!this._subCategories)
        {
            var collection = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES);

            if (this._data)
            {
                this._subCategories = collection.filter(this._data[5],"id");
            }
            else
            {
                var subCategory = new App.SubCategory();
                subCategory.category = this.id;
                collection.addItem(subCategory);

                this._subCategories = [subCategory];
            }
        }
        return this._subCategories;
    }
});
