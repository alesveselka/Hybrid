/**
 * @class Account
 * @param {{name:string,categories:Array.<Category>}} data
 * @param {Collection} collection
 * @param {Object} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Account = function Account(data,collection,parent,eventListenerPool)
{
    this._data = data;
    this._name = null;
    this._categories = null;
    this._eventListenerPool = eventListenerPool;
};

/**
 * Create and return name
 *
 * @method getName
 * @returns {string}
 */
App.Account.prototype.getName = function getName()
{
    if (!this._name) this._name = this._data.name;

    return this._name;
};

App.Account.prototype.getBalance = function getBalance()
{

};

App.Account.prototype.getExpenses = function getExpenses()
{

};

App.Account.prototype.getIncome = function getIncome()
{

};

/**
 * Create and return categories collection
 *
 * @method getCategories
 * @returns {Collection}
 */
App.Account.prototype.getCategories = function getCategories()
{
    if (!this._categories)
    {
        this._categories = new App.Collection(
            this._data.categories,
            App.Category,
            this,
            this._eventListenerPool
        );
    }

    return this._categories;
};
