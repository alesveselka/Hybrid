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

    this._states = null;
};

App.Category._UID = 0;

/**
 * Add subCategory
 * @param {App.SubCategory} subCategory
 */
App.Category.prototype.addSubCategory = function addSubCategory(subCategory)
{
    if (this._subCategories)
    {
        var i = 0,
            l = this._subCategories.length;

        for (;i<l;)
        {
            if (this._subCategories[i++] === subCategory) return;
        }

        this._subCategories.push(subCategory);
    }
    else
    {
        this._subCategories = [subCategory];
    }
};

/**
 * Remove subCategory
 * @param {App.SubCategory} subCategory
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
 * Serialize
 * @returns {Array}
 */
App.Category.prototype.serialize = function serialize()
{
    var collection = this.subCategories,
        subCategoryIds = "",
        i = 0,
        l = this._subCategories.length;

    for (;i<l;) subCategoryIds += this._subCategories[i++].id + ",";

    subCategoryIds = subCategoryIds.substring(0,subCategoryIds.length-1);

    return [this.id,this.name,this.color,this.icon,this.account,subCategoryIds,this.budget]
};

/**
 * Save current state
 */
App.Category.prototype.saveState = function saveState()
{
    if (!this._states) this._states = [];

    this._states[this._states.length] = this.serialize();
};

/**
 * Revoke last state
 */
App.Category.prototype.revokeState = function revokeState()
{
    if (this._states && this._states.length)
    {
        var state = this._states.pop();

        this.name = state[1];
        this.color = state[2];
        this.icon = state[3];
        this.account = state[4];
        this.budget = state[6];

        this._inflateSubCategories(state[5]);
    }
};

/**
 * Clear saved states
 */
App.Category.prototype.clearSavedStates = function clearSavedStates()
{
    if (this._states) this._states.length = 0;

    var i = 0,
        l = this._subCategories.length;

    for (;i<l;) this._subCategories[i++].clearSavedState();
};

/**
 * Populate array of SubCategory object from their respective IDs
 * @param {string} ids
 * @private
 */
App.Category.prototype._inflateSubCategories = function _inflateSubCategories(ids)
{
    this._subCategories = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).filter(ids.split(","),"id");
};

/**
 * @property subCategories
 * @type Array.<App.SubCategory>
 */
Object.defineProperty(App.Category.prototype,'subCategories',{
    get:function()
    {
        if (!this._subCategories)
        {
            if (this._data)
            {
                this._inflateSubCategories(this._data[5]);
            }
            else
            {
                var subCategory = new App.SubCategory();
                subCategory.category = this.id;
                this._subCategories = [subCategory];
            }
        }
        return this._subCategories;
    }
});
