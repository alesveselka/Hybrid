App.Transaction = function Transaction(data,collection,parent,eventListenerPool)
{
    this.amount = data.amount || "";
    this.type = data.type || "expense";//TODO remove hard-coded value
    this.category = data.category || null;
    this.time = data.time ? new Date(data.time) : new Date();
    this.mode = data.mode || "cash";//TODO remove hard-coded value
    this.currency = data.currency || "CZK";//TODO base currency from Settings
    this.repeat = data.repeat || 0;
    this.pending = data.pending || 0;
    this.note = data.note ? decodeURI(data.note) : null;
};
