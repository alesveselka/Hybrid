/**
 * @class ObjectPool
 * @param {Function} objectClass
 * @param {number} size
 * @param {Object} constructorData
 * @constructor
 */
App.ObjectPool = function ObjectPool(objectClass,size,constructorData)
{
    this._objectClass = objectClass;
    this._size = size;
    this._constructorData = constructorData;
    this._items = [];
    this._freeItems = [];
};

/**
 * Pre-allocate objectClass instances
 */
App.ObjectPool.prototype.preAllocate = function preAllocate()
{
    var oldSize = this._items.length,
        newSize = oldSize + this._size,
        i = oldSize;

    this._items.length = newSize;

    for (;i < newSize;i++)
    {
        this._items[i] = new this._objectClass(i,this._constructorData);
        this._freeItems.push(i);
    }
};

/**
 * @method allocate Allocate object instance
 * @returns {{poolIndex:number,allocated:boolean}}
 */
App.ObjectPool.prototype.allocate = function allocate()
{
    if (this._freeItems.length === 0) this.preAllocate();

    var index = this._freeItems.shift();
    var item = this._items[index];

    item.allocated = true;

    return item;
};

/**
 * @method release Release item into pool
 * @param {{poolIndex:number,allocated:boolean}} item
 */
App.ObjectPool.prototype.release = function release(item)
{
    item.allocated = false;

    this._freeItems.push(item.poolIndex);
};
