/** @type {{rgbToHex:Function,hexToRgb:Function}} */
App.MathUtils = {
    /**
     * Convert RGB values to HEX value
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {string}
     */
    rgbToHex:function rgbToHex(red,green,blue)
    {
        return ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    },

    /**
     * Convert HEX value to r, g, and b color component values
     * @param {string} hex
     * @param {Object|null} container
     * @returns {{r:number,g:number,b:number}|null}
     */
    hexToRgb:function hexToRgb(hex,container)
    {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result)
        {
            if (container)
            {
                container.r = parseInt(result[1],16);
                container.g = parseInt(result[2],16);
                container.b = parseInt(result[3],16);
                return container;
            }
            else
            {
                return {r:parseInt(result[1],16),g:parseInt(result[2],16),b:parseInt(result[3],16)};
            }
        }

        return null;
    },
    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param {number} r The red color value
     * @param {number} g The green color value
     * @param {number} b The blue color value
     * @param {Object|null} container
     * @return  {{h:number,s:number,l:number}} The HSL representation
     */
    rgbToHsl:function rgbToHsl(r,g,b,container)
    {
        r /= 255;
        g /= 255;
        b /= 255;

        var max = Math.max(r,g,b),
            min = Math.min(r,g,b),
            h,
            s,
            l = (max + min) / 2;

        if(max == min)
        {
            h = s = 0; // achromatic
        }
        else
        {
            var d = max - min;

            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch(max)
            {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        if (container)
        {
            container.h = h;
            container.s = s;
            container.l = l;

            return container;
        }

        return {h:h,s:s,l:l};
    },

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param {number} h The hue
     * @param {number} s The saturation
     * @param {number} l The lightness
     * @param {Object|null} container
     * @return  {{r:number,g:number,b:number}} The RGB representation
     */
    hslToRgb:function hslToRgb(h,s,l,container)
    {
        var r = l,
            g = l,
            b = l;

        if (s !== 0)
        {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                p = 2 * l - q;

            r = this._hueToRgb(p,q,h+1/3);
            g = this._hueToRgb(p,q,h);
            b = this._hueToRgb(p,q,h-1/3);
        }

        if (container)
        {
            container.r = r * 255;
            container.g = g * 255;
            container.b = b * 255;

            return container;
        }

        return {r:r*255,g:g*255,b:b*255};
    },

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     *
     * @param {number} r The red color value
     * @param {number} g The green color value
     * @param {number} b The blue color value
     * @param {Object|null} container
     * @return  {{h:number,s:number,v:number}} The HSV representation
     */
    rgbToHsv:function rgbToHsv(r,g,b,container)
    {
        r = r / 255;
        g = g / 255;
        b = b / 255;

        var max = Math.max(r,g,b),
            min = Math.min(r,g,b),
            d = max - min,
            s = max === 0 ? 0 : d / max,
            h = 0;

        if(max !== min)
        {
            switch(max)
            {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        if (container)
        {
            container.h = h;
            container.s = s;
            container.v = max;

            return container;
        }

        return {h:h,s:s,v:max};
    },

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param {number} h The hue
     * @param {number} s The saturation
     * @param {number} v The value
     * @param {Object|null} container
     * @return {{r:number,g:number,b:number}} The RGB representation
     */
    hsvToRgb:function hsvToRgb(h,s,v,container)
    {
        var i = Math.floor(h * 6),
            f = h * 6 - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            r = 0,
            g = 0,
            b = 0;

        switch(i % 6)
        {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }

        if (container)
        {
            container.r = r * 255;
            container.g = g * 255;
            container.b = b * 255;

            return container;
        }

        return {r:r*255,g:g*255,b:b*255};
    },

    /**
     * Converts Hue to RGB
     * @param {number} p
     * @param {number} q
     * @param {number} t
     * @return {number}
     */
    _hueToRgb:function _hueToRgb(p,q,t)
    {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }
};
