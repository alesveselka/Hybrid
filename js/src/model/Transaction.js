/**
 * @class Transaction
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Transaction = function Transaction(data,collection,parent,eventListenerPool)
{
    if (data)
    {
        this._data = data;

        this.amount = data[0];
        this.type = data[1];
        this.pending = data[2] === 1;
        this.repeat = data[3] === 1;
        this._account = null;
        this._category = null;
        this._subCategory = null;
        this._method = null;
        this._date = null;
        this._currency = null;
        this.note = data[8] ? decodeURI(data[8]) : "";
    }
    else
    {
        this._data = null;

        this.amount = "";
        this.type = App.TransactionType.EXPENSE;
        this.pending = false;
        this.repeat = false;
        this._account = null;
        this._category = null;
        this._subCategory = null;
        this._method = null;
        this._date = null;
        this._currency = null;
        this.note = "";
    }
};

/**
 * Destroy
 */
App.Transaction.prototype.destroy = function destroy()
{
    this._account = null;
    this._category = null;
    this._subCategory = null;
    this._method = null;
    this._date = null;
    this._currency = null;
};

/**
 * @property account
 * @type Account
 */
Object.defineProperty(App.Transaction.prototype,'account',{
    get:function()
    {
        if (!this._account)
        {
            if (this._data) this._account = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).filter([this._data[4].split(".")[0]],"id")[0];
            else this._account = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultAccount;
        }
        return this._account;//TODO save last used account as 'default' on save
    },
    set:function(value)
    {
        this._account = value;
    }
});

/**
 * @property category
 * @type Category
 */
Object.defineProperty(App.Transaction.prototype,'category',{
    get:function()
    {
        if (!this._category)
        {
            if (this._data)
            {
                var ModelLocator = App.ModelLocator,
                    ModelName = App.ModelName,
                    ids = this._data[4].split(".");

                this._category = ModelLocator.getProxy(ModelName.CATEGORIES).filter([ids[1]],"id")[0];
                this._subCategory = ModelLocator.getProxy(ModelName.SUB_CATEGORIES).filter([ids[2]],"id")[0];
            }
            else
            {
                this._category = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultCategory;
                this._subCategory = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultSubCategory;
            }
        }
        return this._category;//TODO save last used account as 'default' on save
    },
    set:function(value)
    {
        this._category = value;
    }
});

/**
 * @property subCategory
 * @type SubCategory
 */
Object.defineProperty(App.Transaction.prototype,'subCategory',{
    get:function()
    {
        if (!this._subCategory)
        {
            if (this._data) this._subCategory = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).filter([this._data[4].split(".")[2]],"id")[0];
            else this._subCategory = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultSubCategory;
        }
        return this._subCategory;
    },
    set:function(value)
    {
        this._subCategory = value;
    }
});

/**
 * @property method
 * @type PaymentMethod
 */
Object.defineProperty(App.Transaction.prototype,'method',{
    get:function()
    {
        if (!this._method)
        {
            if (this._data) this._method = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).filter([this._data[4]],"id")[0];
            else this._method = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultPaymentMethod;
        }
        return this._method;
    },
    set:function(value)
    {
        this._method = value;
    }
});

/**
 * @property date
 * @type Date
 */
Object.defineProperty(App.Transaction.prototype,'date',{
    get:function()
    {
        if (!this._date)
        {
            if (this._data) this._date = new Date(this._data[6]);
            else this._date = new Date();
        }
        return this._date;
    }
});

/**
 * @property currency
 * @type Currency
 */
Object.defineProperty(App.Transaction.prototype,'currency',{
    get:function()
    {
        if (!this._currency)
        {
            if (this._data) this._currency = App.ModelLocator.getProxy(App.ModelName.CURRENCIES).filter([this._data[7]],"id")[0];
            else this._currency = App.ModelLocator.getProxy(App.ModelName.SETTINGS).baseCurrency;
        }
        return this._currency;
    },
    set:function(value)
    {
        this._currency = value;
    }
});
