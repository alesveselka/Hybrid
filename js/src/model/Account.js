/**
 * @class Account
 * @param {Array} data
 * @param {Collection} collection
 * @param {Object} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Account = function Account(data,collection,parent,eventListenerPool)
{
    if (data)
    {
        this._data = data;

        if (parseInt(data[0],10) >= App.Account._UID) App.Account._UID = parseInt(data[0],10);

        this.id = this._data[0];
        this.name = this._data[1];
        this._categories = null;
    }
    else
    {
        this._data = null;

        this.id = String(++App.Account._UID);
        this.name = "Account" + this.id;
        this._categories = null;
    }
};

App.Account._UID = 0;

/**
 * Add category
 * @param {App.Category} category
 * @private
 */
App.Account.prototype.addCategory = function addCategory(category)
{
    if (this._categories) this._categories.push(category);
    else this._categories = [category];
};

/**
 * Remove category
 * @param {App.Category} category
 * @private
 */
App.Account.prototype.removeCategory = function removeCategory(category)
{
    var i = 0,
        l = this._categories.length;

    for (;i<l;i++)
    {
        if (this._categories[i] === category)
        {
            this._categories.splice(i,1);
            break;
        }
    }
};

/**
 * @property categories
 * @type Array.<Category>
 */
Object.defineProperty(App.Account.prototype,'categories',{
    get:function()
    {
        if (!this._categories)
        {
            if (this._data) this._categories = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).filter(this._data[2].split(","),"id");
            else this._categories = [];
        }
        return this._categories;
    }
});
