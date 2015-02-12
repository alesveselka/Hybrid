App.Transaction = function Transaction(data,collection,parent,eventListenerPool)
{
    this.amount = data.amount || 0;
    this.type = data.type || "expense";//TODO remove hard-coded value
    this.category = data.category || null;
    this.time = data.time || -1;
    this.mode = data.mode || "cash";//TODO remove hard-coded value
    this.currency = data.currency || "CZK";//TODO remove hard-coded value
    this.repeat = data.repeat || 0;
    this.pending = data.pending || 0;
    this.note = data.note || null;//TODO decode
};
