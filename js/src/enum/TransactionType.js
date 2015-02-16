/**
 * TransactionType
 * @type {{EXPENSE: number, INCOME: number, toString: Function}}
 */
App.TransactionType = {
    EXPENSE:1,
    INCOME:2,
    toString:function toString(type)
    {
        return type === App.TransactionType.INCOME ? "Income" : "Expense";
    }
};
