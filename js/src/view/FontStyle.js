/**
 * @class FontStyle
 * @type {{init: Function, get: Function, WHITE: string, BLUE: string, BLUE_LIGHT: string, BLUE_DARK: string, GREY: string, GREY_DARK: string, GREY_DARKER: string,BLACK_LIGHT:string, RED_DARK: string}}
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

        return this;
    },

    /**
     * Construct and return font style object
     * @param {number} fontSize
     * @param {string} color
     * @param {string} [align=null]
     * @param {string} [font=null]
     * @returns {{font: string, fill: string}}
     */
    get:function get(fontSize,color,align,font)
    {
        var i = 0,
            l = this._styles.length,
            style = null;

        font = font || this.CONDENSED;

        for (;i<l;)
        {
            style = this._styles[i++];
            if (style.fontSize === fontSize && style.fill === color && style.fontName === font)
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

        style = {fontSize:fontSize,font:Math.round(fontSize * this._pixelRatio)+"px "+font,fill:color,align:align ? align : "left",fontName:font};
        this._styles.push(style);

        return style;
    },

    CONDENSED:"HelveticaNeueCond",
    LIGHT_CONDENSED:"HelveticaNeueLightCond",

    WHITE:"#ffffff",
    BLUE:"#394264",
    BLUE_LIGHT:"#50597B",
    BLUE_DARK:"#252B44",
    GREY:"#efefef",
    GREY_DARK:"#cccccc",
    GREY_DARKER:"#999999",
    BLACK_LIGHT:"#333333",
    RED_DARK:"#990000"
};
