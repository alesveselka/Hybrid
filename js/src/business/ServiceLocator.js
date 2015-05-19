/**
 * @class ServiceLocator
 * @type {{_services:Object,addService:Function,hasService:Function,getService:Function}}
 */
App.ServiceLocator = {
    _services:{},

    /**
     * Initialize with array of services passed in
     * @param {Array.<>} services
     */
    init:function init(services)
    {
        var i = 0,
            l = services.length;

        for (;i<l;) this._services[services[i++]] = services[i++];
    },

    /**
     * @method addPoxy Add proxy to the locator
     * @param {string} serviceName
     * @param {*} proxy
     */
    addService:function addService(serviceName,proxy)
    {
        if (this._services[serviceName]) throw Error("Service "+serviceName+" already exist");

        this._services[serviceName] = proxy;
    },

    /**
     * @method hasProxy Check if proxy already exist
     * @param {string} serviceName
     * @return {boolean}
     */
    hasService:function hasService(serviceName)
    {
        return this._services[serviceName];
    },

    /**
     * @method getProxy Returns proxy by name passed in
     * @param {string} serviceName
     * @return {*}
     */
    getService:function getService(serviceName)
    {
        return this._services[serviceName];
    }
};
