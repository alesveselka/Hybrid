App.Transaction = function Transaction(data,collection,parent,eventListenerPool)
{
    this._data = data;
    this.amount = data[0] || "";
    this.type = data[1] || App.TransactionType.EXPENSE;
    this.pending = data[2] || 0;
    this.repeat = data[3] || 0;
    this.account = data[4] || null;
    this.method = data[5] || 1;
    this.date = data[6] ? new Date(data[6]) : new Date();
    this.currency = data[7] || "CZK";//TODO base currency from Settings
    this.note = data[8] ? decodeURI(data[8]) : null;
};

/**
 * @property amount
 * @type string
 *//*
Object.defineProperty(App.Transaction.prototype,'amount',{
    get:function()
    {
        if (!this.amount) this.amount = this._data[0] || "";
        return  this.amount;
    }
});*/
