/**
 * @class PaymentMethod
 * @param {string} name
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.PaymentMethod = function PaymentMethod(name,collection,parent,eventListenerPool)
{
    this.id = App.PaymentMethod._ID++;
    this.name = name;
};

App.PaymentMethod._ID = 1;
App.PaymentMethod.CASH = "Cash";
App.PaymentMethod.CREDIT_CARD = "Credit-Card";
