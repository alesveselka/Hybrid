/**
 * FontStyle
 * @type {{init: Function, get: Function}}
 */
App.FontStyle = {
    /**
     * @private
     */
    _pixelRatio:1,
    /**
     * Init
     * @param {number} pixelRatio
     */
    init:function init(pixelRatio)
    {
        this._pixelRatio = pixelRatio;
    },

    /**
     * Construct and return font style object
     * @param {number} fontSize
     * @param {string} color
     * @param {string} [align=null]
     * @returns {{font: string, fill: string}}
     */
    get:function get(fontSize,color,align)
    {
        //TODO cache object into directory
        return {font:Math.round(fontSize * this._pixelRatio)+"px HelveticaNeueCond",fill:color,align:align ? align : "left"};
    },

    WHITE:"#ffffff"
};
