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
};

/**
 * Revoke all changes to the last saved ones
 */
App.Transaction.prototype.revokeState = function revokeState()
{
    if (this._data)
    {
        this.amount = this._data[0];
        this.type = this._data[1];
        this.pending = this._data[2] === 1;
        this.repeat = this._data[3] === 1;
        this._account = null;
        this._category = null;
        this._subCategory = null;
        this._method = null;
        this._date = null;
        this._currencyBase = null;
        this._currencyQuote = null;
        // this._currencyRate = 1.0;
        this.note = this._data[8] ? decodeURI(data[8]) : "";
    }
};

/**
 * Serialize
 * @returns {Array}
 */
App.Transaction.prototype.serialize = function serialize()
{
    // If base and quote currency are same, I don't need to save whole 'base/quote@rate' format - it's redundant; save just one quote.
    var base = this.currencyBase,
        quote = this.currencyQuote,
        currency = base === quote ? quote : base + "/" + quote + "@" + App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).findRate(base,quote),
        data = [
            parseFloat(this.amount),
            this.type,
            this.pending ? 1 : 0,
            this.repeat ? 1 : 0,
            this.account.id + "." + this.category.id + "." + this.subCategory.id,
            this.method.id,
            this.date.getTime(),
            currency
        ];

    if (this.note && this.note.length) data.push(App.StringUtils.encode(this.note));

    return data;
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
    copy.currencyBase = this.currencyBase;
    copy.currencyQuote = this.currencyQuote;
    copy.note = this.note;

    return copy;
};

/**
 * @property savedAmount
 * @type number
 */
Object.defineProperty(App.Transaction.prototype,'savedAmount',{
    get:function()
    {
        if (this._data) return this._data[0];
        else return 0.0;
    }
});

/**
 * @property savedType
 * @type number
 */
Object.defineProperty(App.Transaction.prototype,'savedType',{
    get:function()
    {
        if (this._data) return this._data[1];
        else return 1;
    }
});

/**
 * @property savedPending
 * @type boolean
 */
Object.defineProperty(App.Transaction.prototype,'savedPending',{
    get:function()
    {
        if (this._data) return this._data[2] === 1;
        else return false;
    }
});

/**
 * @property savedPending
 * @type boolean
 */
Object.defineProperty(App.Transaction.prototype,'savedSubCategory',{
    get:function()
    {
        return App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).find("id",this._data[4].split(".")[2]);
    }
});

/**
 * @property savedPending
 * @type boolean
 */
Object.defineProperty(App.Transaction.prototype,'savedCurrencyBase',{
    get:function()
    {
        if (this._data[7].indexOf("@") === -1) return this._data[7];
        else return this._data[7].split("@")[0].split("/")[0];
    }
});

/**
 * @property savedPending
 * @type boolean
 */
Object.defineProperty(App.Transaction.prototype,'savedCurrencyQuote',{
    get:function()
    {
        if (this._data[7].indexOf("@") === -1) return this._data[7];
        else return this._data[7].split("@")[0].split("/")[1];
    }
});

/**
 * @property account
 * @type Account
 */
Object.defineProperty(App.Transaction.prototype,'account',{
    get:function()
    {
        if (!this._account)
        {
            if (this._data) this._account = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).find("id",this._data[4].split(".")[0]);
            else this._account = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultAccount;
        }
        return this._account;
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

                this._category = ModelLocator.getProxy(ModelName.CATEGORIES).find("id",ids[1]);
                this._subCategory = ModelLocator.getProxy(ModelName.SUB_CATEGORIES).find("id",ids[2]);
            }
            else
            {
                this._category = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultCategory;
                this._subCategory = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultSubCategory;
            }
        }
        return this._category;
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
            if (this._data) this._subCategory = this.savedSubCategory;
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
            if (this._data) this._method = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).find("id",this._data[5]);
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
            if (this._data) this._currencyBase = this.savedCurrencyBase;
            else this._currencyBase = App.ModelLocator.getProxy(App.ModelName.SETTINGS).baseCurrency;
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
            if (this._data) this._currencyQuote = this.savedCurrencyQuote;
            else this._currencyQuote = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultCurrencyQuote;
        }
        return this._currencyQuote;
    },
    set:function(value)
    {
        this._currencyQuote = value;
    }
});
