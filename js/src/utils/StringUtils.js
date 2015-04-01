/**
 * StringUtils
 * @type {{encode: Function}}
 */
App.StringUtils = {
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
    }
};
