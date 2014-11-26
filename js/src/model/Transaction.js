App.Transaction = function Transaction(amount,currency,category,date,type,mode,repeating,pending)
{
    this.amount = amount;
    this.currency = currency;
    this.category = category;
    this.date = date;
    this.type = type;
    this.mode = mode;
    this.repeating = repeating;
    this.pending = pending;
};
