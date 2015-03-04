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
 * Add subCategory
 * @param {App.SubCategory} subCategory
 * @private
 */
App.Category.prototype.addSubCategory = function addSubCategory(subCategory)
{
    if (this._subCategories) this._subCategories.push(subCategory);
    else this._subCategories = [subCategory];
};

/**
 * Remove subCategory
 * @param {App.SubCategory} subCategory
 * @private
 */
App.Category.prototype.removeSubCategory = function removeSubCategory(subCategory)
{
    var i = 0,
        l = this._subCategories.length;

    for (;i<l;i++)
    {
        if (this._subCategories[i] === subCategory)
        {
            this._subCategories.splice(i,1);
            break;
        }
    }
};

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

                this.addSubCategory(subCategory);
            }
        }
        return this._subCategories;
    }
});
