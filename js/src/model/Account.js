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
        this.name = decodeURIComponent(this._data[1]);
        this.lifeCycleState = parseInt(this._data[2],10) ? App.LifeCycleState.ACTIVE : App.LifeCycleState.DELETED;
        this._categories = null;
    }
    else
    {
        this._data = null;

        this.id = String(++App.Account._UID);
        this.name = "Account" + this.id;
        this.lifeCycleState = App.LifeCycleState.CREATED;
        this._categories = null;
    }

    this.balance = 0.0;
};

App.Account._UID = 0;

/**
 * Serialize
 * @return {Array}
 */
App.Account.prototype.serialize = function serialize()
{
    var categoryCollection = this.categories,
        encodedName = App.StringUtils.encode(this.name),
        lifeCycle = this.lifeCycleState === App.LifeCycleState.DELETED ? 0 : 1;

    if (categoryCollection.length)
    {
        var i = 0,
            l = categoryCollection.length,
            ids = [];

        for (;i<l;) ids.push(categoryCollection[i++].id);

        return [this.id,encodedName,lifeCycle,ids.join(",")];
    }
    else
    {
        return [this.id,encodedName,lifeCycle];
    }
};

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
 * Calculate balance
 * @returns {number}
 */
App.Account.prototype.calculateBalance = function calculateBalance()
{
    var collection = this.categories, // Inflate categories
        i = 0,
        l = this._categories.length;

    this.balance = 0.0;

    for (;i<l;) this.balance += this._categories[i++].calculateBalance();

    return this.balance;
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
            if (this._data && this._data[3]) this._categories = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).filter(this._data[3].split(","),"id");
            else this._categories = [];
        }
        return this._categories;
    }
});
