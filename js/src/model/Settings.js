/**
 * @class Settings
 * @param {Array} data
 * @constructor
 */
App.Settings = function Settings(data)
{
    this._data = data;

    this._startOfWeek = data[0];
    this._baseCurrency = null;
    this._defaultPaymentMethod = null;
    this.defaultAccount = null;
    this.defaultCategory = null;
    this.defaultSubCategory = null;
};

/**
 * @property startOfWeek
 * @type number
 */
Object.defineProperty(App.Settings.prototype,'startOfWeek',{
    get:function()
    {
        return this._startOfWeek;
    },
    set:function(value)
    {
        if (value >= 0 && value <= 6) this.startOfWeek = value;
    }
});

/**
 * @property baseCurrency
 * @type Currency
 */
Object.defineProperty(App.Settings.prototype,'baseCurrency',{
    get:function()
    {
        if (!this._baseCurrency) this._baseCurrency = App.ModelLocator.getProxy(App.ModelName.CURRENCIES).filter([this._data[1]],"id")[0];
        return this._baseCurrency;
    },
    set:function(value)
    {
        this._baseCurrency = value;
    }
});

/**
 * @property defaultPaymentMethod
 * @type PaymentMethod
 */
Object.defineProperty(App.Settings.prototype,'defaultPaymentMethod',{
    get:function()
    {
        if (!this._defaultPaymentMethod) this._defaultPaymentMethod = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).filter([this._data[2]],"id")[0];
        return this._defaultPaymentMethod;
    },
    set:function(value)
    {
        this._defaultPaymentMethod = value;
    }
});
