/**
 * Model Proxy state
 * @enum {number}
 * @return {{
 *      TICKER:number,
 *      EVENT_LISTENER_POOL:number,
 *      PAYMENT_METHODS:number,
 *      CURRENCY_PAIRS:number,
 *      SUB_CATEGORIES:number,
 *      CATEGORIES:number,
 *      ACCOUNTS:number,
 *      TRANSACTIONS:number,
 *      SETTINGS:number,
 *      ICONS:number,
 *      CHANGE_SCREEN_DATA_POOL:number,
 *      SCREEN_HISTORY:number
 * }}
 */
App.ModelName = {
    TICKER:0,
    EVENT_LISTENER_POOL:1,
    PAYMENT_METHODS:2,
    CURRENCY_PAIRS:3,//TODO also add 'CURRENCIES' that will be extracted from the pairs?
    SUB_CATEGORIES:4,
    CATEGORIES:5,
    ACCOUNTS:6,
    TRANSACTIONS:7,
    SETTINGS:8,
    ICONS:9,
    CHANGE_SCREEN_DATA_POOL:10,
    SCREEN_HISTORY:11
};
