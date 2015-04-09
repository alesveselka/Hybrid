/**
 * StringUtils
 * @type {{encode: Function}}
 */
App.StringUtils = {
    _threeCharPattern:/.{1,3}/g,
    /**
     * Encode URI component
     * @param {string} str
     * @returns {string}
     */
    encode:function encode(str)
    {
        //return encodeURIComponent(str).replace(/[!'()]/g,escape).replace(/\*/g,"%2A");// 'escape' is depreciated
        return encodeURIComponent(str).replace(/[!'()*]/g,function(c) {return '%'+c.charCodeAt(0).toString(16);});
    },

    /**
     * Add leading zero to number passed in
     * @param {number} value
     */
    pad:function pad(value)
    {
        if (value < 10) return '0' + value;
        return value;
    },

    /**
     * Format number passed in
     * @param {number} value
     * @param {number} decimal Fixed number of decimal places
     * @param {string} separator
     */
    formatNumber:function formatNumber(value,decimal,separator)
    {
        var num = String(value.toFixed(decimal)),
            decimals = num.split("."),
            integer = decimals[0],
            reversed = integer.split("").reverse().join(""),
            formatted = reversed.length > 3 ? reversed.match(this._threeCharPattern).join(separator) : reversed;

        return formatted.split("").reverse().join("") + "." + decimals[1];
    }
};
