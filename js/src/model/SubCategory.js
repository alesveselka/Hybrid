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
        this.name = decodeURIComponent(data[1]);
        this.balance = isNaN(data[2]) ? 0.0 : parseFloat(data[2]);
    }
    else
    {
        this.id = String(++App.SubCategory._UID);
        this.name = "SubCategory" + this.id;
        this.balance = 0.0;
    }

    this._state = null;
};

App.SubCategory._UID = 0;

/**
 * Serialize
 * @return {Array}
 */
App.SubCategory.prototype.serialize = function serialize()
{
    if (this.balance) return [this.id,App.StringUtils.encode(this.name),this.balance];
    else return [this.id,App.StringUtils.encode(this.name)];
};

/**
 * Save current state
 */
App.SubCategory.prototype.saveState = function saveState()
{
    if (!this._state) this._state = this.name;
};

/**
 * Revoke last state
 */
App.SubCategory.prototype.revokeState = function revokeState()
{
    if (this._state) this.name = this._state;
};

/**
 * Clear saved state
 */
App.SubCategory.prototype.clearSavedState = function clearSavedState()
{
    this._state = null;
};
