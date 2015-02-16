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
    this._data = data;

    this._id = this._data[0];
    this.name = this._data[1];
    this._categories = null;
};

/**
 * @property categories
 * @type Array.<Category>
 */
Object.defineProperty(App.Account.prototype,'categories',{
    get:function()
    {
        if (!this._categories) this._categories = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).filter(this._data[2].split(","),"id");
        return this._categories;
    }
});
