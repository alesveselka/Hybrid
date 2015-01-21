/**
 * FontStyle
 * @type {{init: Function, get: Function}}
 */
App.FontStyle = {
    /**
     * @private
     */
    _pixelRatio:1,
    _styles:[],
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
        var i = 0,
            l = this._styles.length,
            style = null;

        for (;i<l;)
        {
            style = this._styles[i++];
            if (style.fontSize === fontSize && style.fill === color)
            {
                if (align)
                {
                    if (style.align === align)
                    {
                        return style;
                    }
                }
                else
                {
                    return style;
                }
            }
        }

        style = {fontSize:fontSize,font:Math.round(fontSize * this._pixelRatio)+"px HelveticaNeueCond",fill:color,align:align ? align : "left"};
        this._styles.push(style);

        return style;
    },

    WHITE:"#ffffff",
    BLUE:"#394264",
    BLUE_LIGHT:"#50597B",
    BLUE_DARK:"#252B44",
    SHADE_DARK:"#cccccc",
    RED_DARK:"#900000",
    SHADE:"#efefef"
};
