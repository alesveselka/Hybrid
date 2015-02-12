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
        //encodeURIComponent(str).replace(/[!'()]/g,escape).replace(/\*/g,"%2A").replace(/%(?:7C|60|5E)/g,unescape);
        return encodeURIComponent(str).replace(/[!'()]/g,escape).replace(/\*/g,"%2A");
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
