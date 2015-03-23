/**
 * @class Transaction
 * @param {Array} [data=null]
 * @param {Collection} [collection=null]
 * @param {*} [parent=null]
 * @param {ObjectPool} [eventListenerPool=null]
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
        this._currencyBase = null;
        this._currencyQuote = null;
//        this._currencyRate = 1.0;
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
        this._currencyBase = null;
        this._currencyQuote = null;
//        this._currencyRate = 1.0;
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
};

/**
 * Check if the transaction is saved, i.e. has data
 * @returns {Array|null}
 */
App.Transaction.prototype.isSaved = function isSaved()
{
    return this._data;
};

/**
 * Save
 */
App.Transaction.prototype.save = function save()
{
    this._data = this.serialize();

    var base = "CZK",
        spent = "USD",
        rate = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).findRate(base,spent);
    console.log("Result rate: ",rate,"(",rate.toFixed(6),"), 100 "+spent+" = "+(100/rate)+" "+base);//100CHF = 2895.8956 CZK
};

/**
 * Serialize
 * @returns {Array}
 */
App.Transaction.prototype.serialize = function serialize()
{
    var base = this.currencyBase,
        quote = this.currencyQuote;

    return [
        parseInt(this.amount,10),
        this.type,
        this.pending ? 1 : 0,
        this.repeat ? 1 : 0,
        this.account.id + "." + this.category.id + "." + this.subCategory.id,
        this.method.id,
        this.date.getTime(),
        base + "/" + quote + "@" + App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).findRate(base,quote),
        App.StringUtils.encode(this.note)//TODO check if note is set before even adding it
    ];
};

/**
 * Create and return copy of itself
 * @returns {App.Transaction}
 */
App.Transaction.prototype.copy = function copy()
{
    var copy = new App.Transaction();
    copy.amount = this.amount;
    copy.type = this.type;
    copy.pending = this.pending;
    copy.repeat = this.repeat;
    copy.account = this.account;
    copy.category = this.category;
    copy.subCategory = this.subCategory;
    copy.method = this.method;
    copy.date = this.date;
    copy.currency = this.currency;
    copy.note = this.note;

    return copy;
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
            //TODO keep just IDs instead of reference?
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
            //TODO keep just IDs instead of reference?
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
        //TODO keep just IDs instead of reference?
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
        //TODO keep just IDs instead of reference?
        if (!this._method)
        {
            if (this._data) this._method = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).filter([this._data[5]],"id")[0];
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
    },
    set:function(value)
    {
        this._date = value;
    }
});

/**
 * @property currency
 * @type string
 */
Object.defineProperty(App.Transaction.prototype,'currencyBase',{
    get:function()
    {
        if (!this._currencyBase)
        {
            if (this._data) this._currencyBase = this._data[7].split("@")[0].split("/")[0];
            else this._currencyBase = App.ModelLocator.getProxy(App.ModelName.SETTINGS).baseCurrency;//TODO implement
        }
        return this._currencyBase;
    },
    set:function(value)
    {
        this._currencyBase = value;
    }
});

/**
 * @property currency
 * @type string
 */
Object.defineProperty(App.Transaction.prototype,'currencyQuote',{
    get:function()
    {
        if (!this._currencyQuote)
        {
            if (this._data) this._currencyQuote = this._data[7].split("@")[0].split("/")[1];
            else this._currencyQuote = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultQuote;//TODO implement
        }
        return this._currencyQuote;
    },
    set:function(value)
    {
        this._currencyQuote = value;
    }
});

/**
 * @property currency
 * @type number
 */
//TODO i may not need this and use something like 'getBaseValue' function that will automatically convert it
/*Object.defineProperty(App.Transaction.prototype,'currencyRate',{
    get:function()
    {
        if (!this._currencyRate)
        {
            if (this._data) this._currencyRate = parseFloat(this._data[7].split("@")[1]);
            else this._currencyRate = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).findRate(this.currencyBase,this.currencyQuote);
        }
        return this._currencyRate;
    },
    set:function(value)
    {
        this._currencyRate = value;
    }
});*/
