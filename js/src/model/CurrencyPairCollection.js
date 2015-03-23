/**
 * @class CurrencyPairCollection
 * @param {Array} source
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CurrencyPairCollection = function CurrencyPairCollection(source,eventListenerPool)
{
    App.Collection.call(this,source,App.CurrencyPair,null,eventListenerPool);
};

App.CurrencyPairCollection.prototype = Object.create(App.Collection.prototype);
App.CurrencyPairCollection.prototype.constructor = App.CurrencyPairCollection;

/**
 * Find and return rate between base and symbol(spent) currency symbols passed in
 * In case there is no direct rate, EUR is used as cross since all currency have EUR-pair
 * @param {string} base
 * @param {string} symbol
 * @private
 */
App.CurrencyPairCollection.prototype.findRate = function findRate(base,symbol)
{
    var pair = null,
        basePair = null,
        symbolPair = null,
        i = 0,
        l = this._items.length;

    // First, check if both base and spent currency are in one pair ...
    for (;i<l;)
    {
        pair = this._items[i++];
        if ((base === pair.base && symbol === pair.symbol) || (base === pair.symbol && symbol === pair.base))
        {
            if (base === pair.base && symbol === pair.symbol) return pair.rate;
            else if (base === pair.symbol && symbol === pair.base) return 1 / pair.rate;
        }
    }

    // .. if not, use EUR pair as cross
    for (i=0;i<l;)
    {
        pair = this._items[i++];
        if (pair.base === "EUR")
        {
            if (pair.symbol === base) basePair = pair;
            if (pair.symbol === symbol) symbolPair = pair;
        }
    }

    if (basePair && symbolPair) return symbolPair.rate / basePair.rate;

    return 1.0;
};
