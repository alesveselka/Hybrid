/** @type {{rgbToHex:Function,hexToRgb:Function}} */
com.pond5.lib.utils.MathUtils = {
    /**
     * Convert RGB values to HEX value
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {string}
     */
    rgbToHex:function(red,green,blue)
    {
        return ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    },

    /**
     * Convert HEX value to r, g, and b color component values
     * @param {string} hex
     * @returns {{r:Number,g:Number,b:Number}|null}
     */
    hexToRgb:function(hex)
    {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {r:parseInt(result[1],16),g:parseInt(result[2],16),b:parseInt(result[3],16)} : null;
    }
}
