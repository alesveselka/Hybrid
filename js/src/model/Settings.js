/**
 * @class Settings
 * @param {Array} data
 * @constructor
 */
App.Settings = function Settings(data)
{
    this._data = data;

    this._startOfWeek = data[0];
    this.baseCurrency = data[1] || "USD";
    this.defaultCurrencyQuote = data[2] || "USD";
    this._defaultAccount = null;
    this._defaultCategory = null;
    this._defaultSubCategory = null;
    this._defaultPaymentMethod = null;
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
 * @property defaultAccount
 * @type App.Account
 */
Object.defineProperty(App.Settings.prototype,'defaultAccount',{
    get:function()
    {
        if (!this._defaultAccount)
        {
            if (this._data) this._defaultAccount = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).find("id",this._data[3]);
            else this._defaultAccount = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).getItemAt(0);
        }
        return this._defaultAccount;
    },
    set:function(value)
    {
        this._defaultAccount = value;
    }
});

/**
 * @property defaultCategory
 * @type App.Category
 */
Object.defineProperty(App.Settings.prototype,'defaultCategory',{
    get:function()
    {
        if (!this._defaultCategory)
        {
            if (this._data) this._defaultCategory = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).find("id",this._data[4]);
            else this._defaultCategory = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).getItemAt(0);
        }
        return this._defaultCategory;
    },
    set:function(value)
    {
        this._defaultCategory = value;
    }
});

/**
 * @property defaultSubCategory
 * @type App.SubCategory
 */
Object.defineProperty(App.Settings.prototype,'defaultSubCategory',{
    get:function()
    {
        if (!this._defaultSubCategory)
        {
            if (this._data) this._defaultSubCategory = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).find("id",this._data[5]);
            else this._defaultSubCategory = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).getItemAt(0);
        }
        return this._defaultSubCategory;
    },
    set:function(value)
    {
        this._defaultSubCategory = value;
    }
});

/**
 * @property defaultPaymentMethod
 * @type App.PaymentMethod
 */
Object.defineProperty(App.Settings.prototype,'defaultPaymentMethod',{
    get:function()
    {
        if (!this._defaultPaymentMethod)
        {
            if (this._data) this._defaultPaymentMethod = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).find("id",this._data[6]);
            else this._defaultPaymentMethod = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).getItemAt(0);
        }
        return this._defaultPaymentMethod;
    },
    set:function(value)
    {
        this._defaultPaymentMethod = value;
    }
});
