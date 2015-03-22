"use strict";

/**
 * Function prototype bind polyfill
 * ! @source http://code.famo.us/lib/functionPrototypeBind.js
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

/**
 * Object.create() polyfill
 * ! @source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 */
if (typeof Object.create != 'function') {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (o === null) {
                throw Error('Cannot set a null [[Prototype]]');
            }
            if (typeof o != 'object') {
                throw TypeError('Argument must be an object');
            }
            F.prototype = o;
            return new F();
        };
    })();
}

/**
 * requestAnimationFrame polyfill
 */
window.requestAnimationFrame || (window.requestAnimationFrame =
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback)
    {
        return window.setTimeout(function() {
            callback();
        }, 1000 / 60);
    });

/**
 * @module App
 */
var App = App || {};

/** @type {{
*   rgbToHex:Function,
*   hexToRgb:Function,
*   rgbToHsl:Function,
*   hslToRgb:Function,
*   rgbToHsv:Function,
*   hsvToRgb:Function
*   }} */
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

/** @type {{
*   _daysInMonth:Array.<number>,
*   _monthLabels:Array.<string>,
*   _dayLabels:Array.<string>,
*   getMonthLabel:Function,
*   getDayLabels:Function,
*   getMonth:Function,
*   getDaysInMonth:Function
*   }} */
App.DateUtils = {
    _daysInMonth:[31,28,31,30,31,30,31,31,30,31,30,31],
    _monthLabels:["January","February","March","April","May","June","July","August","September","October","November","December"],
    _dayLabels:["S","M","T","W","T","F","S"],

    /**
     * Return month label according to month index passed in
     * @param {number} month
     * @returns {string}
     */
    getMonthLabel:function getMonthLabel(month)
    {
        return this._monthLabels[month];
    },

    /**
     * Return array of day labels in order from start of week passed in
     * @param {number} startOfWeek
     * @return {Array.<string>}
     */
    getDayLabels:function getDayLabels(startOfWeek)
    {
        var i = startOfWeek;
        while (i)
        {
            this._dayLabels.push(this._dayLabels.shift());
            i--;
        }
        return this._dayLabels;
    },

    /**
     * Calculate and generate all days in a month, based on starting day of a week passed in
     * Returns 2-dimensional array, where rows are weeks, and columns particular days in a week
     * @param {Date} date
     * @param {number} startOfWeek 0 = Sunday, 1 = Monday, ... , 6 = Saturday
     * @return {Array.<Array.<number>>} Days in Week array is twice as long, as the second offsetting number indicate if the day belongs to other month(1) or not(0)
     */
    getMonth:function getMonth(date,startOfWeek)
    {
        //TODO allocate arrays from pool?
        var year = date.getFullYear(),
            currentMonth = date.getMonth(),
            previousMonth = currentMonth ? currentMonth - 1 : 11,
            daysInCurrentMonth = this.getDaysInMonth(year,currentMonth),
            daysInPreviousMonth = this.getDaysInMonth(year,previousMonth),
            firstDayOfMonth = new Date(year,currentMonth,1).getDay(),
            dayOffset = firstDayOfMonth >= startOfWeek ? firstDayOfMonth - startOfWeek : 7 + firstDayOfMonth - startOfWeek,
            firstDateOfWeek = 7 + 1 - dayOffset,
            weeks = [],
            days = null,
            otherMonth = 0,
            l = 6 * 7,// 6 weeks of 7 days
            i = 0,
            j = 0;

        if (firstDateOfWeek !== 1)
        {
            firstDateOfWeek = daysInPreviousMonth + 1 - dayOffset;
            otherMonth = 1;
        }

        for (;i<l;i++)
        {
            if (firstDateOfWeek > daysInPreviousMonth && otherMonth === 1)
            {
                firstDateOfWeek = 1;
                otherMonth = 0;
            }

            if (firstDateOfWeek > daysInCurrentMonth && otherMonth === 0)
            {
                firstDateOfWeek = 1;
                otherMonth = 1;
            }

            if (i % 7 === 0)
            {
                days = new Array(7*2);
                weeks[weeks.length] = days;
                j = 0;
            }

            days[j++] = firstDateOfWeek++;
            days[j++] = otherMonth;
        }

        return weeks;
    },

    /**
     * Return number of days in particular month passed in
     * Also check for Leap year
     * @param {number} year
     * @param {number} month zero-based
     * @return {number}
     */
    getDaysInMonth:function getDaysInMonth(year,month)
    {
        return (month === 1 && (year % 400 === 0 || year % 4 === 0)) ? 29 : this._daysInMonth[month];
    },

    /**
     * Format and return military time
     * @param {Date} time
     * @returns {string}
     */
    getMilitaryTime:function getMilitaryTime(time)
    {
        var padFunction = App.StringUtils.pad;

        return padFunction(time.getHours()) + ":" + padFunction(time.getMinutes());
    }
};

/**
 * Device
 * @type {{TOUCH_SUPPORTED:boolean}}
 */
App.Device = {
    TOUCH_SUPPORTED:('ontouchstart' in window) // iOS
        || (window.navigator['msPointerEnabled'] && window.navigator['msMaxTouchPoints'] > 0) // IE10
        || (window.navigator['pointerEnabled'] && window.navigator['maxTouchPoints'] > 0) // IE11+
};

/**
 * GraphicUtils
 * @type {{drawRect: Function,drawRects:Function}}
 */
App.GraphicUtils = {
    /**
     * Draw rectangle into graphics passed in
     * @param {PIXI.Graphics} graphics
     * @param {number} color
     * @param {number} alpha
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    drawRect:function drawRect(graphics,color,alpha,x,y,width,height)
    {
        graphics.clear();
        graphics.beginFill(color,alpha);
        graphics.drawRect(x,y,width,height);
        graphics.endFill();
    },

    /**
     * Draw multiple rectangles
     * @param {PIXI.Graphics} graphics
     * @param {number} color
     * @param {number} alpha
     * @param {Array.<number>} data
     * @param {boolean} clear
     * @param {boolean} end
     */
    drawRects:function drawRects(graphics,color,alpha,data,clear,end)
    {
        if (clear) graphics.clear();
        graphics.beginFill(color,alpha);

        var i = 0,
            l = data.length;

        for (;i<l;) graphics.drawRect(data[i++],data[i++],data[i++],data[i++]);

        if (end) graphics.endFill();
    },

    /**
     * Draw rounded rectangle into graphics passed in
     * @param {PIXI.Graphics} graphics
     * @param {number} color
     * @param {number} alpha
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} radius
     */
    drawRoundedRect:function drawRect(graphics,color,alpha,x,y,width,height,radius)
    {
        graphics.clear();
        graphics.beginFill(color,alpha);
        graphics.drawRoundedRect(x,y,width,height,radius);
        graphics.endFill();
    },

    /**
     * Draw arc
     * @param {PIXI.Graphics} graphics
     * @param {PIXI.Point} center
     * @param {number} width
     * @param {number} height
     * @param {number} thickness
     * @param {number} startAngle
     * @param {number} endAngle
     * @param {number} smoothSteps
     * @param {number} lineColor
     * @param {number} lineAlpha
     * @param {number} lineThickness
     * @param {number} fillColor
     * @param {number} fillAlpha
     */
    drawArc:function drawArc(graphics,center,width,height,thickness,startAngle,endAngle,smoothSteps,lineColor,lineAlpha,lineThickness,fillColor,fillAlpha)
    {
        startAngle -= 90;
        endAngle -= 90;

        var angle = startAngle,
            angleStep = (endAngle - startAngle) / smoothSteps,
            degToRad = Math.PI / 180,
            radians = angle * degToRad,
            radiusX = width / 2,
            radiusY = height / 2,
            centerX = center.x,
            centerY = center.y,
            i = 0;

        graphics.clear();
        graphics.lineStyle(lineThickness,lineColor,lineAlpha);
        graphics.beginFill(fillColor,fillAlpha);
        graphics.moveTo(centerX+Math.cos(radians)*radiusX,centerY+Math.sin(radians)*radiusY);

        for (;i<smoothSteps;)
        {
            angle = startAngle + angleStep * i++;
            radians = angle * degToRad;
            graphics.lineTo(centerX+Math.cos(radians)*radiusX,centerY+Math.sin(radians)*radiusY);
        }

        radians = endAngle * degToRad;
        graphics.lineTo(centerX+Math.cos(radians)*radiusX,centerY+Math.sin(radians)*radiusY);

        for (i=smoothSteps;i>=0;)
        {
            angle = startAngle + angleStep * i--;
            radians = angle * degToRad;
            graphics.lineTo(centerX+Math.cos(radians)*(radiusX-thickness),centerY+Math.sin(radians)*(radiusY-thickness));
        }

        graphics.endFill();
    }
};

/**
 * LayoutUtils
 * @type {{update: Function}}
 */
App.LayoutUtils = {
    /**
     * Update layout
     * @param {Array.<{x:number,y:number,boundingBox:Rectangle}>} items
     * @param {string} direction
     * @param {number} originalPosition
     */
    update:function update(items,direction,originalPosition)
    {
        var i = 0,
            l = items.length,
            item = null,
            position = originalPosition || 0,
            Direction = App.Direction;

        if (direction === Direction.X)
        {
            for (;i<l;)
            {
                item = items[i++];
                item.x = position;
                position = Math.round(position + item.boundingBox.width);
            }
        }
        else if (direction === Direction.Y)
        {
            for (;i<l;)
            {
                item = items[i++];
                item.y = position;
                position = Math.round(position + item.boundingBox.height);
            }
        }
    }
};

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

/**
 * Event type
 * @enum {string}
 * @return {{
 *      CHANGE_SCREEN:string,
 *      CHANGE_TRANSACTION:string,
 *      CHANGE_ACCOUNT:string,
 *      CHANGE_CATEGORY:string,
 *      CHANGE_SUB_CATEGORY:string,
 *      CHANGE_CURRENCY_PAIR:string,
 *      CREATE:string,
 *      CANCEL:string,
 *      CONFIRM:string,
 *      COPY:string,
 *      DELETE:string,
 *      START:string,
 *      COMPLETE:string,
 *      UPDATE:string,
 *      PROGRESS:string,
 *      ERROR:string,
 *      CHANGE:string,
 *      LAYOUT_UPDATE:string,
 *      TICK:string,
 *      ADDED:string,
 *      REMOVED:string,
 *      RESIZE:string,
 *      MOUSE_ENTER:string,
 *      MOUSE_LEAVE:string,
 *      MOUSE_DOWN:string,
 *      MOUSE_UP:string,
 *      MOUSE_MOVE:string,
 *      CLICK:string,
 *      FOCUS:string,
 *      BLUR:string,
 *      KEY_PRESS:string,
 *      PASTE:string,
 *      TEXT_INPUT:string,
 *      INPUT:string}}
 */
App.EventType = {
    // Commands
    CHANGE_SCREEN:"CHANGE_SCREEN",
    CHANGE_TRANSACTION:"CHANGE_TRANSACTION",
    CHANGE_ACCOUNT:"CHANGE_ACCOUNT",
    CHANGE_CATEGORY:"CHANGE_CATEGORY",
    CHANGE_SUB_CATEGORY:"CHANGE_SUB_CATEGORY",
    CHANGE_CURRENCY_PAIR:"CHANGE_CURRENCY_PAIR",

    // App
    CREATE:"CREATE",
    CANCEL:"CANCEL",
    CONFIRM:"CONFIRM",
    COPY:"COPY",
    DELETE:"DELETE",
    START:"START",
    COMPLETE:"COMPLETE",
    UPDATE:"UPDATE",
    PROGRESS:"PROGRESS",
    ERROR:"ERROR",
    CHANGE:"change",
    LAYOUT_UPDATE:"LAYOUT_UPDATE",
    TICK:"TICK",

    // Collection
    ADDED:"ADDED",
    REMOVED:"REMOVED",

    // DOM
    RESIZE:"resize",
    MOUSE_ENTER:"mouseenter",
    MOUSE_LEAVE:"mouseleave",
    MOUSE_DOWN:"mousedown",
    MOUSE_UP:"mouseup",
    MOUSE_MOVE:"mousemove",
    CLICK:"click",
    FOCUS:"focus",
    BLUR:"blur",
    KEY_PRESS:"keypress",
    PASTE:"paste",
    TEXT_INPUT:"textInput",
    INPUT:"input"
};

/**
 * Model Proxy state
 * @enum {number}
 * @return {{
 *      TICKER:number,
 *      EVENT_LISTENER_POOL:number,
 *      PAYMENT_METHODS:number,
 *      CURRENCY_PAIRS:number,
 *      CURRENCY_SYMBOLS:number,
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
    CURRENCY_PAIRS:3,
    CURRENCY_SYMBOLS:4,
    SUB_CATEGORIES:5,
    CATEGORIES:6,
    ACCOUNTS:7,
    TRANSACTIONS:8,
    SETTINGS:9,
    ICONS:10,
    CHANGE_SCREEN_DATA_POOL:11,
    SCREEN_HISTORY:12
};

/**
 * View Segment state
 * @enum {number}
 * @return {{
 *      APPLICATION_VIEW:number,
 *      HEADER:number,
 *      SCREEN_STACK:number,
 *      ACCOUNT_BUTTON_POOL:number,
 *      CATEGORY_BUTTON_EXPAND_POOL:number,
 *      CATEGORY_BUTTON_EDIT_POOL:number,
 *      SUB_CATEGORY_BUTTON_POOL:number,
 *      TRANSACTION_BUTTON_POOL:number,
 *      SKIN:number}}
 */
App.ViewName = {
    APPLICATION_VIEW:0,
    HEADER:1,
    SCREEN_STACK:2,
    ACCOUNT_BUTTON_POOL:3,
    CATEGORY_BUTTON_EXPAND_POOL:4,
    CATEGORY_BUTTON_EDIT_POOL:5,
    SUB_CATEGORY_BUTTON_POOL:6,
    TRANSACTION_BUTTON_POOL:7,
    SKIN:8
};

/**
 * Interactive state
 * @enum {string}
 * @return {{OVER:string,OUT:string,DRAGGING:string,SCROLLING:string,SNAPPING:string,SWIPING:string}}
 */
App.InteractiveState = {
    OVER:"OVER",
    OUT:"OUT",
    DRAGGING:"DRAGGING",
    SCROLLING:"SCROLLING",
    SNAPPING:"SNAPPING",
    SWIPING:"SWIPING"
};

/**
 * Transition state
 * @enum {string}
 * @return {{SHOWING:string,SHOWN:string,HIDING:string,HIDDEN:string,OPEN:string,OPENING:string,CLOSED:string,CLOSING:string}}
 */
App.TransitionState = {
    SHOWING:"SHOWING",
    SHOWN:"SHOWN",
    HIDING:"HIDING",
    HIDDEN:"HIDDEN",

    OPEN:"OPEN",
    OPENING:"OPENING",
    CLOSED:"CLOSED",
    CLOSING:"CLOSING"
};

/**
 * Scroll Policy
 * @enum {string}
 * @return {{ON:string,OFF:string,AUTO:string}}
 */
App.ScrollPolicy = {
    ON:"ON",
    OFF:"OFF",
    AUTO:"AUTO"
};


/**
 * Direction
 * @enum {string}
 * @return {{X:string,Y:string,LEFT:string,RIGHT:string}}
 */
App.Direction = {
    X:"x",
    Y:"y",
    LEFT:"LEFT",
    RIGHT:"RIGHT"
};

/**
 * Screen Name
 * @enum {number}
 * @return {{
 *      BACK:number,
 *      ACCOUNT:number,
 *      CATEGORY:number,
 *      SELECT_TIME:number,
 *      EDIT_CATEGORY:number,
 *      TRANSACTIONS:number,
 *      REPORT:number,
 *      ADD_TRANSACTION:number,
 *      EDIT:number,
 *      CURRENCY_PAIRS:number,
 *      EDIT_CURRENCY_RATE:number,
 *      CURRENCIES:number,
 *      MENU:number
 * }}
 */
App.ScreenName = {
    BACK:-1,
    ACCOUNT:0,
    CATEGORY:1,
    SELECT_TIME:2,
    EDIT_CATEGORY:3,
    TRANSACTIONS:4,
    REPORT:5,
    ADD_TRANSACTION:6,
    EDIT:7,
    CURRENCY_PAIRS:8,
    EDIT_CURRENCY_RATE:9,
    CURRENCIES:10,
    MENU:11
};

/**
 * HeaderAction
 * @enum {number}
 * @return {{NONE:number,MENU:number,CANCEL:number,CONFIRM:number,ADD_TRANSACTION:number}}
 */
App.HeaderAction = {
    NONE:-1,
    MENU:1,
    CANCEL:2,
    CONFIRM:3,
    ADD_TRANSACTION:4
};

/**
 * TransactionType
 * @type {{EXPENSE: number, INCOME: number, toString: Function}}
 */
App.TransactionType = {
    EXPENSE:1,
    INCOME:2,
    toString:function toString(type)
    {
        return type === App.TransactionType.INCOME ? "Income" : "Expense";
    }
};

/**
 * ScreenMode
 * @type {{DEFAULT: number, ADD: number, EDIT: number, SELECT: number}}
 */
App.ScreenMode = {
    DEFAULT:1,
    ADD:2,
    EDIT:3,
    SELECT:4
};

/**
 * ScreenTitle
 * @type {{
 *      MENU: string,
 *      ACCOUNTS:string,
 *      EDIT_ACCOUNT:string,
 *      ADD_ACCOUNT:string,
 *      CATEGORIES:string,
 *      SELECT_ACCOUNT: string,
 *      SELECT_CATEGORY: string,
 *      ADD_CATEGORY: string,
 *      EDIT_CATEGORY: string,
 *      EDIT_SUB_CATEGORY:string,
 *      ADD_SUB_CATEGORY:string,
 *      SELECT_TIME: string,
 *      TRANSACTIONS:string,
 *      ADD_TRANSACTION: string,
 *      EDIT_TRANSACTION: string,
 *      REPORT:string,
 *      CURRENCY_PAIRS:string,
 *      SELECT_CURRENCY:string,
 *      EDIT_CURRENCY_RATE:string
 * }}
 */
App.ScreenTitle = {
    MENU:"Menu",
    ACCOUNTS:"Accounts",
    EDIT_ACCOUNT:"Edit Account",
    ADD_ACCOUNT:"Add Account",
    SELECT_ACCOUNT:"Select Account",
    CATEGORIES:"Categories",
    SELECT_CATEGORY:"Select Category",
    ADD_CATEGORY:"Add Category",
    EDIT_CATEGORY:"Edit Category",
    EDIT_SUB_CATEGORY:"Edit SubCategory",
    ADD_SUB_CATEGORY:"Add SubCategory",
    SELECT_TIME:"Select Time & Date",
    TRANSACTIONS:"Transactions",
    ADD_TRANSACTION:"Add Transaction",
    EDIT_TRANSACTION:"Edit Transaction",
    REPORT:"Report",
    CURRENCY_PAIRS:"Currency Pairs",
    SELECT_CURRENCY:"Select Currency",
    EDIT_CURRENCY_RATE:"Edit Currency Rate"
};

/**
 * EventLevel
 * @type {{NONE: number, LEVEL_1: number,LEVEL_2: number}}
 */
App.EventLevel = {
    NONE:0,
    LEVEL_1:1,
    LEVEL_2:2
};

/**
 * LifeCycle state
 * @enum {number}
 * @return {{CREATED:number,ACTIVE:number,DELETED:number}}
 */
App.LifeCycleState = {
    CREATED:1,
    ACTIVE:2,
    DELETED:3
};

/**
 * @class EventListener
 * @param {number} index
 * @constructor
 */
App.EventListener = function EventListener(index)
{
    this.allocated = false;
    this.poolIndex = index;
    this.type = null;
    this.scope = null;
    this.handler = null;
};

/**
 * @method reset Reset item returning to pool
 */
App.EventListener.prototype.reset = function reset()
{
    this.allocated = false;
    this.type = null;
    this.scope = null;
    this.handler = null;
};

/**
 * @class EventDispatcher
 * @constructor
 */
App.EventDispatcher = function EventDispatcher(listenerPool)
{
    this._listeners = [];
    this._listenersPool = listenerPool;
};

/**
 * Add event listener
 * @param	{string} eventType
 * @param	{Object} scope
 * @param	{Function} listener
 */
App.EventDispatcher.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    if (!this.hasEventListener(eventType,scope,listener))
    {
        var eventListener = this._listenersPool.allocate();
        eventListener.type = eventType;
        eventListener.scope = scope;
        eventListener.handler = listener;

        this._listeners[this._listeners.length] = eventListener;
    }
};

/**
 * @method hasEventListener
 * @param	{string} eventType
 * @param	{Object} scope
 * @param	{Function} handler
 * @return  {boolean}
 */
App.EventDispatcher.prototype.hasEventListener = function hasEventListener(eventType,scope,handler)
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;)
    {
        listener = this._listeners[i++];
        if (listener.type === eventType && listener.scope === scope && listener.handler === handler)
        {
            listener = null;

            return true;
        }
    }
    listener = null;

    return false;
};

/**
 * Remove event listener
 * @param	{String} eventType
 * @param	{Object} scope
 * @param	{Function} handler
 */
App.EventDispatcher.prototype.removeEventListener = function removeEventListener(eventType,scope,handler)
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;i++)
    {
        listener = this._listeners[i];
        if (listener.type === eventType && listener.scope === scope && listener.handler === handler)
        {
            this._listenersPool.release(listener);
            listener.reset();

            this._listeners.splice(i,1);

            break;
        }
    }
    listener = null;
};

/**
 * Remove all listeners
 */
App.EventDispatcher.prototype.removeAllListeners = function removeAllListeners()
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;i++)
    {
        listener = this._listeners[i];

        this._listenersPool.release(listener);
        listener.reset();

        this._listeners.splice(i,1);
    }
    listener = null;
    this._listeners.length = 0;
};

/**
 * Dispatch event
 * @param {string} eventType
 * @param {Object|null} data
 */
App.EventDispatcher.prototype.dispatchEvent = function dispatchEvent(eventType,data)
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;)
    {
        listener = this._listeners[i++];
        if (listener && listener.type === eventType)
        {
            listener.handler.call(listener.scope,data,eventType);
        }
    }
    listener = null;
};

/**
 * @method pipe Link incoming and outcoming events; dispatch incoming events further
 * @param {Object} target
 * @param {string} eventType
 */
App.EventDispatcher.prototype.pipe = function pipe(target,eventType)
{
    target.addEventListener(eventType,this,this._pipeListener);
};

/**
 * @method unpipe Remove event target from pipe
 * @param {Object} target
 * @param {string} eventType
 */
App.EventDispatcher.prototype.unPipe = function unPipe(target,eventType)
{
    target.removeEventListener(eventType,this,this._pipeListener);
};

/**
 * @method pipeListener Listens for events piped in, and dispatch them further
 * @param {string} eventType
 * @param {Object|null} data
 * @private
 */
App.EventDispatcher.prototype._pipeListener = function _pipeListener(data,eventType)
{
    this.dispatchEvent(eventType,data);
};

/**
 * Destroy
 */
App.EventDispatcher.prototype.destroy = function destroy()
{
    this.removeAllListeners();

    this._listeners.length = 0;
    this._listeners = null;
    this._listenersPool = null;
};

/**
 * @class Rectangle
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @constructor
 */
App.Rectangle = function Rectangle(x,y,width,height)
{
    //this.allocated = false;
    //this.poolIndex = poolIndex;
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
};

/**
 * @method reset Reset item returning to pool
 */
/*App.EventListener.prototype.reset = function reset()
{
    this.allocated = false;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
};*/
/**
 * @class Stack
 * @constructor
 */
App.Stack = function Stack()
{
    this._source = [];
    this._top = 0;
};

/**
 * Push item into stack
 * @param {*} item
 */
App.Stack.prototype.push = function push(item)
{
    this._source[this._top++] = item;
};

/**
 * Remove item from top of the stack
 * @returns {*}
 */
App.Stack.prototype.pop = function pop()
{
    var item = this._source[this._top-1];

    if (item) this._source[--this._top] = null;

    return item;
};

/**
 * Peek what on top of the stack
 * @returns {*}
 */
App.Stack.prototype.peek = function peek(index)
{
    if (!index) index = 1;

    return this._source[this._top-index];
};

/**
 * Return size of the stack
 * @returns {number}
 */
App.Stack.prototype.length = function length()
{
    return this._top;
};

/**
 * Clear stack
 */
App.Stack.prototype.clear = function clear()
{
    this._top = 0;
};

/**
 * ChangeScreenData
 * @param {number} index
 * @constructor
 */
App.ChangeScreenData = function ChangeScreenData(index)
{
    this.allocated = false;
    this.poolIndex = index;

    this.screenName = App.ScreenName.ADD_TRANSACTION;
    this.screenMode = App.ScreenMode.ADD;
    this.updateData = null;
    this.headerLeftAction = App.HeaderAction.CANCEL;
    this.headerRightAction = App.HeaderAction.CONFIRM;
    this.headerName = App.ScreenTitle.ADD_TRANSACTION;
    this.backSteps = 1;
    this.updateBackScreen = false;
};

/**
 * Update
 * @param {number} screenName
 * @param {number} screenMode
 * @param {Object} updateData
 * @param {number} headerLeftAction
 * @param {number} headerRightAction
 * @param {string} headerName
 * @param {number} [backSteps=1]
 * @param {boolean} [updateBackScreen=false]
 * @returns {App.ChangeScreenData}
 */
App.ChangeScreenData.prototype.update = function update(screenName,screenMode,updateData,headerLeftAction,headerRightAction,headerName,backSteps,updateBackScreen)
{
    this.screenName = isNaN(screenName) ? App.ScreenName.ADD_TRANSACTION : screenName;
    this.screenMode = screenMode || App.ScreenMode.ADD;
    this.updateData = updateData;
    this.headerLeftAction = headerLeftAction || App.HeaderAction.CANCEL;
    this.headerRightAction = headerRightAction || App.HeaderAction.CONFIRM;
    this.headerName = headerName || App.ScreenTitle.ADD_TRANSACTION;
    this.backSteps = backSteps || 1;
    this.updateBackScreen = updateBackScreen;

    return this;
};

/**
 * @class ModelLocator
 * @type {{_proxies:Object,addProxy:Function,hasProxy:Function,getProxy:Function}}
 */
App.ModelLocator = {
    _proxies:{},

    /**
     * Initialize with array of proxies passed in
     * @param {Array.<>} proxies
     */
    init:function init(proxies)
    {
        var i = 0,
            l = proxies.length;

        for (;i<l;) this._proxies[proxies[i++]] = proxies[i++];
    },

    /**
     * @method addPoxy Add proxy to the locator
     * @param {string} proxyName
     * @param {*} proxy
     */
    addProxy:function addProxy(proxyName,proxy)
    {
        if (this._proxies[proxyName]) throw Error("Proxy "+proxyName+" already exist");

        this._proxies[proxyName] = proxy;
    },

    /**
     * @method hasProxy Check if proxy already exist
     * @param {string} proxyName
     * @return {boolean}
     */
    hasProxy:function hasProxy(proxyName)
    {
        return this._proxies[proxyName];
    },

    /**
     * @method getProxy Returns proxy by name passed in
     * @param {string} proxyName
     * @return {*}
     */
    getProxy:function getProxy(proxyName)
    {
        return this._proxies[proxyName];
    }
};
/**
 * @class ObjectPool
 * @param {Function} objectClass
 * @param {number} size
 * @param {Object} constructorData
 * @constructor
 */
App.ObjectPool = function ObjectPool(objectClass,size,constructorData)
{
    this._objectClass = objectClass;
    this._size = size;
    this._constructorData = constructorData;
    this._items = [];
    this._freeItems = [];
};

/**
 * Pre-allocate objectClass instances
 */
App.ObjectPool.prototype.preAllocate = function preAllocate()
{
    var oldSize = this._items.length,
        newSize = oldSize + this._size,
        i = oldSize;

    this._items.length = newSize;

    for (;i < newSize;i++)
    {
        this._items[i] = new this._objectClass(i,this._constructorData);
        this._freeItems.push(i);
    }
};

/**
 * @method allocate Allocate object instance
 * @returns {{poolIndex:number,allocated:boolean}}
 */
App.ObjectPool.prototype.allocate = function allocate()
{
    if (this._freeItems.length === 0) this.preAllocate();

    var index = this._freeItems.shift();
    var item = this._items[index];

    item.allocated = true;

    return item;
};

/**
 * @method release Release item into pool
 * @param {{poolIndex:number,allocated:boolean}} item
 */
App.ObjectPool.prototype.release = function release(item)
{
    item.allocated = false;

    this._freeItems.push(item.poolIndex);
};

/**
 * @class Collection
 * @param {Array} source
 * @param {Function} itemConstructor
 * @param {Object} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Collection = function Collection(source,itemConstructor,parent,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    if (source)
    {
        var i = 0, l = source.length;

        this._items = new Array(l);

        for (;i<l;i++) this._items[i] = new itemConstructor(source[i],this,parent,eventListenerPool);
    }

    if (!this._items) this._items = [];
    this._currentItem = null;
    this._currentIndex = -1;
};

App.Collection.prototype = Object.create(App.EventDispatcher.prototype);
App.Collection.prototype.constructor = App.Collection;

/**
 * @method addItem Add item into collection
 * @param {*} item
 */
App.Collection.prototype.addItem = function addItem(item)
{
    this._items[this._items.length] = item;

    this.dispatchEvent(App.EventType.ADDED,item);
};

/**
 * @method setCurrent Set current item of collection
 * @param {*} value	item to set as current
 * @param {?boolean} [force=null]	force to execute the method, even if the value is same as current item
 */
App.Collection.prototype.setCurrent = function setCurrent(value,force)
{
    if (value === this._currentItem && !force) return;

    //var data = {oldItem:this._currentItem};

    this._currentItem = value;
    this._updateCurrentIndex();

    //data.currentItem = this._currentItem;

    this.dispatchEvent(App.EventType.CHANGE/*,data*/);
};

/**
 * @method getCurrent Returns current item
 * @returns {null|*}
 */
App.Collection.prototype.getCurrent = function getCurrent()
{
    return this._currentItem;
};

/**
 * @method getItemAt Return item at index passed in
 * @param {number} index
 * @return {*} item
 */
App.Collection.prototype.getItemAt = function getItemAt(index)
{
    return this._items[index];
};

/**
 * Return copy of underlying array
 * @returns {Array}
 */
App.Collection.prototype.copySource = function copySource()
{
    return this._items.concat();
};

/**
 * Filter collection against value passed in
 * @param {string|Array} value
 * @param {string} [property=null]
 * @returns {Array}
 */
App.Collection.prototype.filter = function filter(value,property)
{
    if (value)
    {
        var i = 0,
            l = this._items.length,
            result = [];

        if (property)
        {
            for (;i<l;i++)
            {
                if (value.indexOf(this._items[i][property]) > -1) result.push(this._items[i]);
            }
        }
        else
        {
            for (;i<l;i++)
            {
                if (value.indexOf(this._items[i]) > -1) result.push(this._items[i]);
            }
        }
        return result;
    }

    return this._items;
};

/**
 * Find and return item by key and value passed in
 * @param {string} key
 * @param {*} value
 */
App.Collection.prototype.find = function find(key,value)
{
    var i = 0,
        l = this._items.length;

    for (;i<l;i++)
    {
        if (this._items[i][key] === value) return this._items[i];
    }

    return null;
};

/**
 * @method previous Return previous item
 * @returns {*}
 */
App.Collection.prototype.previous = function previous()
{
    var index = this._currentIndex;
    if (index === -1) index = 0;

    if (index <= 0) index = this._items.length - 1;
    else index -= 1;

    return this._items[index];
};

/**
 * @method next Return next item
 * @returns {*}
 */
App.Collection.prototype.next = function next()
{
    var index = this._currentIndex;

    if (index === -1 || index >= this._items.length-1) index = 0;
    else index += 1;

    return this._items[index];
};

/**
 * @method other Go to either prev or next item, based on delta passed in
 * @param {number} delta
 */
App.Collection.prototype.other = function other(delta)
{
    var l = this._items.length;

    return this._items[this._currentIndex + l + delta] % l;
};

/**
 * @method hasItem Check if the item is already in collection
 * @param {*} item
 * @return {boolean}
 */
App.Collection.prototype.hasItem = function hasItem(item)
{
    return this.indexOf(item) > -1;
};

/**
 * @method removeItem Remove item passed in
 * @param {*} item
 * @return {*} item
 */
App.Collection.prototype.removeItem = function removeItem(item)
{
    return this.removeItemAt(this.indexOf(item));
};

/**
 * @method removeItemAt Remove item at index passed in
 * @return {*} item
 */
App.Collection.prototype.removeItemAt = function removeItemAt(index)
{
    var item = this._items.splice(index,1)[0];

    this._updateCurrentIndex();
    if (this._currentIndex === -1) this._currentItem = null;

    this.dispatchEvent(App.EventType.REMOVED,item);

    return item;
};

/**
 * @method updateCurrentIndex Return currentItem's index
 * @private
 */
App.Collection.prototype._updateCurrentIndex = function _updateCurrentIndex()
{
    this._currentIndex = this.indexOf(this._currentItem);
};

/**
 * @method indexOf Return currentItem's index
 * @param {Object} item
 * @return {number}
 */
App.Collection.prototype.indexOf = function indexOf(item)
{
    var multiplier = 8, i = 0, l = Math.floor(this._items.length / multiplier) * multiplier;
    for (;i<l;)
    {
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
    }

    l = this._items.length;
    for (;i<l;)
    {
        if (this._items[i++] === item) return i-1;
    }

    return -1;
};

/**
 * Return current item's index
 * @method index
 * @returns {number}
 */
App.Collection.prototype.index = function index()
{
    return this._currentIndex;
};

/**
 * @method length Return length of the collection
 * @return {number}
 */
App.Collection.prototype.length = function length()
{
    return this._items.length;
};

/**
 * @class Settings
 * @param {Array} data
 * @constructor
 */
App.Settings = function Settings(data)
{
    this._data = data;

    this._startOfWeek = data[0];
    this._baseCurrency = null;
    this._defaultPaymentMethod = null;
    this.defaultAccount = null;
    this.defaultCategory = null;
    this.defaultSubCategory = null;
};

/**
 * @property startOfWeek
 * @type number
 */
Object.defineProperty(App.Settings.prototype,'startOfWeek',{
    get:function()
    {
        return this._startOfWeek;
    },
    set:function(value)
    {
        if (value >= 0 && value <= 6) this.startOfWeek = value;
    }
});

/**
 * @property baseCurrency
 * @type Currency
 */
Object.defineProperty(App.Settings.prototype,'baseCurrency',{
    get:function()
    {
        if (!this._baseCurrency) this._baseCurrency = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).filter([this._data[1]],"id")[0];
        return this._baseCurrency;
    },
    set:function(value)
    {
        this._baseCurrency = value;
    }
});

/**
 * @property defaultPaymentMethod
 * @type PaymentMethod
 */
Object.defineProperty(App.Settings.prototype,'defaultPaymentMethod',{
    get:function()
    {
        if (!this._defaultPaymentMethod) this._defaultPaymentMethod = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).filter([this._data[2]],"id")[0];
        return this._defaultPaymentMethod;
    },
    set:function(value)
    {
        this._defaultPaymentMethod = value;
    }
});

/**
 * @class PaymentMethod
 * @param {string} name
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.PaymentMethod = function PaymentMethod(name,collection,parent,eventListenerPool)
{
    this.id = App.PaymentMethod._ID++;
    this.name = name;
};

App.PaymentMethod._ID = 1;
App.PaymentMethod.CASH = "Cash";
App.PaymentMethod.CREDIT_CARD = "Credit-Card";

/**
 * @class CurrencyPair
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CurrencyPair = function CurrencyPair(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.base = data[1];
    this.symbol = data[2];//quote symbol
    this.rate = data[3];

    //CZK/CZK@1.0
    //USD/CZK@25.7
};

/**
 * @class CurrencySymbol
 * @param {string} symbol
 * @constructor
 */
App.CurrencySymbol = function CurrencySymbol(symbol)
{
    this.symbol = symbol;
};

/**
 * @class Transaction
 * @param {Array} [data=null]
 * @param {Collection} [collection=null]
 * @param {*} [parent=null]
 * @param {ObjectPool} [eventListenerPool=null]
 * @constructor
 */
App.Transaction = function Transaction(data,collection,parent,eventListenerPool)
{
    if (data)
    {
        this._data = data;

        this.amount = data[0];
        this.type = data[1];
        this.pending = data[2] === 1;
        this.repeat = data[3] === 1;
        this._account = null;
        this._category = null;
        this._subCategory = null;
        this._method = null;
        this._date = null;
        this._currency = null;
        this.note = data[8] ? decodeURI(data[8]) : "";
    }
    else
    {
        this._data = null;

        this.amount = "";
        this.type = App.TransactionType.EXPENSE;
        this.pending = false;
        this.repeat = false;
        this._account = null;
        this._category = null;
        this._subCategory = null;
        this._method = null;
        this._date = null;
        this._currency = null;
        this.note = "";
    }
};

/**
 * Destroy
 */
App.Transaction.prototype.destroy = function destroy()
{
    this._account = null;
    this._category = null;
    this._subCategory = null;
    this._method = null;
    this._date = null;
    this._currency = null;
};

/**
 * Check if the transaction is saved, i.e. has data
 * @returns {Array|null}
 */
App.Transaction.prototype.isSaved = function isSaved()
{
    return this._data;
};

/**
 * Save
 */
App.Transaction.prototype.save = function save()
{
    this._data = this.serialize();
};

/**
 * Serialize
 * @returns {Array}
 */
App.Transaction.prototype.serialize = function serialize()
{
    return [
        parseInt(this.amount,10),
        this.type,
        this.pending ? 1 : 0,
        this.repeat ? 1 : 0,
        this.account.id + "." + this.category.id + "." + this.subCategory.id,
        this.method.id,
        this.date.getTime(),
        this.currency.id,//USD/CZK@25.7//base_currency/spent_currency@rate
        App.StringUtils.encode(this.note)//TODO check if note is set before even adding it
    ];
};

/**
 * Create and return copy of itself
 * @returns {App.Transaction}
 */
App.Transaction.prototype.copy = function copy()
{
    var copy = new App.Transaction();
    copy.amount = this.amount;
    copy.type = this.type;
    copy.pending = this.pending;
    copy.repeat = this.repeat;
    copy.account = this.account;
    copy.category = this.category;
    copy.subCategory = this.subCategory;
    copy.method = this.method;
    copy.date = this.date;
    copy.currency = this.currency;
    copy.note = this.note;

    return copy;
};

/**
 * @property account
 * @type Account
 */
Object.defineProperty(App.Transaction.prototype,'account',{
    get:function()
    {
        if (!this._account)
        {
            //TODO keep just IDs instead of reference?
            if (this._data) this._account = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).filter([this._data[4].split(".")[0]],"id")[0];
            else this._account = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultAccount;
        }
        return this._account;//TODO save last used account as 'default' on save
    },
    set:function(value)
    {
        this._account = value;
    }
});

/**
 * @property category
 * @type Category
 */
Object.defineProperty(App.Transaction.prototype,'category',{
    get:function()
    {
        if (!this._category)
        {
            //TODO keep just IDs instead of reference?
            if (this._data)
            {
                var ModelLocator = App.ModelLocator,
                    ModelName = App.ModelName,
                    ids = this._data[4].split(".");

                this._category = ModelLocator.getProxy(ModelName.CATEGORIES).filter([ids[1]],"id")[0];
                this._subCategory = ModelLocator.getProxy(ModelName.SUB_CATEGORIES).filter([ids[2]],"id")[0];
            }
            else
            {
                this._category = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultCategory;
                this._subCategory = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultSubCategory;
            }
        }
        return this._category;//TODO save last used account as 'default' on save
    },
    set:function(value)
    {
        this._category = value;
    }
});

/**
 * @property subCategory
 * @type SubCategory
 */
Object.defineProperty(App.Transaction.prototype,'subCategory',{
    get:function()
    {
        //TODO keep just IDs instead of reference?
        if (!this._subCategory)
        {
            if (this._data) this._subCategory = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).filter([this._data[4].split(".")[2]],"id")[0];
            else this._subCategory = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultSubCategory;
        }
        return this._subCategory;
    },
    set:function(value)
    {
        this._subCategory = value;
    }
});

/**
 * @property method
 * @type PaymentMethod
 */
Object.defineProperty(App.Transaction.prototype,'method',{
    get:function()
    {
        //TODO keep just IDs instead of reference?
        if (!this._method)
        {
            if (this._data) this._method = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).filter([this._data[5]],"id")[0];
            else this._method = App.ModelLocator.getProxy(App.ModelName.SETTINGS).defaultPaymentMethod;
        }
        return this._method;
    },
    set:function(value)
    {
        this._method = value;
    }
});

/**
 * @property date
 * @type Date
 */
Object.defineProperty(App.Transaction.prototype,'date',{
    get:function()
    {
        if (!this._date)
        {
            if (this._data) this._date = new Date(this._data[6]);
            else this._date = new Date();
        }
        return this._date;
    },
    set:function(value)
    {
        this._date = value;
    }
});

/**
 * @property currency
 * @type Currency
 */
Object.defineProperty(App.Transaction.prototype,'currency',{
    get:function()
    {
        //TODO keep just IDs instead of reference?

        //TODO currency will be just three-letter symbol of currency spent at the transaction. When saved (at CONFIRM), it will look up pair and its current rate and serialize in form ...
        // TODO ... 'base_currency/spent_currency@rate', where rate will be the listed pair rate, not necessarily the ratio expressed
        if (!this._currency)
        {
            //if (this._data) this._currency = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).filter([this._data[7]],"id")[0];
            if (this._data) this._currency = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS).getItemAt(0);
            else this._currency = App.ModelLocator.getProxy(App.ModelName.SETTINGS).baseCurrency;
        }
        return this._currency;
    },
    set:function(value)
    {
        this._currency = value; //USD/CZK@25.7//base_currency/spent_currency@rate
    }
});

/**
 * @class SubCategory
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.SubCategory = function SubCategory(data,collection,parent,eventListenerPool)
{
    if (data)
    {
        if (parseInt(data[0],10) >= App.SubCategory._UID) App.SubCategory._UID = parseInt(data[0],10);

        this.id = data[0];
        this.name = data[1];
        this.category = data[2];
    }
    else
    {
        this.id = String(++App.SubCategory._UID);
        this.name = "SubCategory" + this.id;
        this.category = null;
    }

    this._state = null;
};

App.SubCategory._UID = 0;

/**
 * Save current state
 */
App.SubCategory.prototype.saveState = function saveState()
{
    if (!this._state) this._state = this.name;
};

/**
 * Revoke last state
 */
App.SubCategory.prototype.revokeState = function revokeState()
{
    if (this._state) this.name = this._state;
};

/**
 * Clear saved state
 */
App.SubCategory.prototype.clearSavedState = function clearSavedState()
{
    this._state = null;
};

/**
 * @class Category
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Category = function Category(data,collection,parent,eventListenerPool)
{
    if (data)
    {
        this._data = data;

        if (parseInt(data[0],10) >= App.Category._UID) App.Category._UID = parseInt(data[0],10);

        this.id = data[0];
        this.name = data[1];
        this.color = data[2];
        this.icon = data[3];
        this.account = data[4];
        this.budget = data[6];
        this._subCategories = null;
    }
    else
    {
        this._data = null;

        this.id = String(++App.Category._UID);
        this.name = "Category" + this.id;
        this.color = null;
        this.icon = null;
        this.account = null;
        this.budget = null;
        this._subCategories = null;
    }

//    this._lifeCycleState = App.LifeCycleState.CREATED;
    this._states = null;
};

App.Category._UID = 0;

/**
 * Destroy
 */
App.Category.prototype.destroy = function destroy()
{
    var i = 0,
        l = this._subCategories.length;

    for (;i<l;) this._subCategories[i++] = null;
    this._subCategories.length = 0;
    this._subCategories = null;

    if (this._states && this._states.length)
    {
        for (i=0,l=this._states.length;i<l;) this._states[i++] = null;
        this._states.length = 0;
        this._states = null;
    }

    this._data = null;
};

/**
 * Add subCategory
 * @param {App.SubCategory} subCategory
 */
App.Category.prototype.addSubCategory = function addSubCategory(subCategory)
{
    if (this._subCategories)
    {
        var i = 0,
            l = this._subCategories.length;

        for (;i<l;)
        {
            if (this._subCategories[i++] === subCategory) return;
        }

        this._subCategories.push(subCategory);
    }
    else
    {
        this._subCategories = [subCategory];
    }
};

/**
 * Remove subCategory
 * @param {App.SubCategory} subCategory
 */
App.Category.prototype.removeSubCategory = function removeSubCategory(subCategory)
{
    var i = 0,
        l = this._subCategories.length;

    for (;i<l;i++)
    {
        if (this._subCategories[i] === subCategory)
        {
            this._subCategories.splice(i,1);
            break;
        }
    }
};

/**
 * Serialize
 * @returns {Array}
 */
App.Category.prototype.serialize = function serialize()
{
    var collection = this.subCategories,
        subCategoryIds = "",
        i = 0,
        l = this._subCategories.length;

    for (;i<l;) subCategoryIds += this._subCategories[i++].id + ",";

    subCategoryIds = subCategoryIds.substring(0,subCategoryIds.length-1);

    return [this.id,this.name,this.color,this.icon,this.account,subCategoryIds,this.budget]
};

/**
 * Save current state
 */
App.Category.prototype.saveState = function saveState()
{
    if (!this._states) this._states = [];

    this._states[this._states.length] = this.serialize();
};

/**
 * Revoke last state
 */
App.Category.prototype.revokeState = function revokeState()
{
    if (this._states && this._states.length)
    {
        var state = this._states.pop();

        this.name = state[1];
        this.color = state[2];
        this.icon = state[3];
        this.account = state[4];
        this.budget = state[6];

        this._inflateSubCategories(state[5]);
    }
};

/**
 * Clear saved states
 */
App.Category.prototype.clearSavedStates = function clearSavedStates()
{
    if (this._states) this._states.length = 0;

    var i = 0,
        l = this._subCategories.length;

    for (;i<l;) this._subCategories[i++].clearSavedState();
};

/**
 * Populate array of SubCategory object from their respective IDs
 * @param {string} ids
 * @private
 */
App.Category.prototype._inflateSubCategories = function _inflateSubCategories(ids)
{
    this._subCategories = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).filter(ids.split(","),"id");
};

/**
 * @property subCategories
 * @type Array.<App.SubCategory>
 */
Object.defineProperty(App.Category.prototype,'subCategories',{
    get:function()
    {
        if (!this._subCategories)
        {
            if (this._data)
            {
                this._inflateSubCategories(this._data[5]);
            }
            else
            {
                var subCategory = new App.SubCategory();
                subCategory.category = this.id;
                this._subCategories = [subCategory];
            }
        }
        return this._subCategories;
    }
});

/**
 * @class Account
 * @param {Array} data
 * @param {Collection} collection
 * @param {Object} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Account = function Account(data,collection,parent,eventListenerPool)
{
    if (data)
    {
        this._data = data;

        if (parseInt(data[0],10) >= App.Account._UID) App.Account._UID = parseInt(data[0],10);

        this.id = this._data[0];
        this.name = this._data[1];
        this._categories = null;
    }
    else
    {
        this._data = null;

        this.id = String(++App.Account._UID);
        this.name = "Account" + this.id;
        this._categories = null;
    }

    this.lifeCycleState = App.LifeCycleState.CREATED;
};

App.Account._UID = 0;

/**
 * Add category
 * @param {App.Category} category
 * @private
 */
App.Account.prototype.addCategory = function addCategory(category)
{
    if (this._categories) this._categories.push(category);
    else this._categories = [category];
};

/**
 * Remove category
 * @param {App.Category} category
 * @private
 */
App.Account.prototype.removeCategory = function removeCategory(category)
{
    var i = 0,
        l = this._categories.length;

    for (;i<l;i++)
    {
        if (this._categories[i] === category)
        {
            this._categories.splice(i,1);
            break;
        }
    }
};

/**
 * @property categories
 * @type Array.<Category>
 */
Object.defineProperty(App.Account.prototype,'categories',{
    get:function()
    {
        if (!this._categories)
        {
            if (this._data) this._categories = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).filter(this._data[2].split(","),"id");
            else this._categories = [];
        }
        return this._categories;
    }
});

App.Filter = function Filter(startDate,endDate,categories)
{
    this.startDate = startDate;
    this.endDate = endDate;
    this.categories = categories;
};

/**
 * @class ViewLocator
 * @type {{_viewSegments:Object,init:Function, addViewSegment: Function, hasViewSegment: Function, getViewSegment: Function}}
 */
App.ViewLocator = {
    _viewSegments:{},

    /**
     * Initialize with array of segments passed in
     * @param {Array.<>} segments
     */
    init:function init(segments)
    {
        var i = 0,
            l = segments.length;

        for (;i<l;) this._viewSegments[segments[i++]] = segments[i++];
    },

    /**
     * Add view segment
     * @param {string} segmentName
     * @param {*} segment
     */
    addViewSegment:function addViewSegment(segmentName,segment)
    {
        if (this._viewSegments[segmentName]) throw Error("View segment "+segmentName+" already exist");

        this._viewSegments[segmentName] = segment;

        return segment;
    },

    /**
     * Check if view segment already exist
     * @param {string} segmentName
     * @return {boolean}
     */
    hasViewSegment:function hasViewSegment(segmentName)
    {
        return this._viewSegments[segmentName];
    },

    /**
     * Return view segment by name passed in
     * @param {string} segmentName
     * @return {*}
     */
    getViewSegment:function getViewSegment(segmentName)
    {
        return this._viewSegments[segmentName];
    }
};

/**
 * ColorTheme
 * @enum {number}
 * @type {{
 *      WHITE:number,
 *      BLUE: number,
 *      BLUE_DARK:number,
 *      BLUE_LIGHT:number,
 *      GREY: number,
 *      GREY_DARK: number,
 *      GREY_DARKER: number,
 *      GREY_LIGHT: number,
 *      RED:number,
 *      RED_DARK:number,
 *      RED_LIGHT:number,
 *      GREEN:number,
 *      INPUT_HIGHLIGHT:number,
 *      BLACK:number
 * }}
 */
App.ColorTheme = {
    WHITE:0xfffffe,
    BLUE:0x394264,
    BLUE_DARK:0x252B44,
    BLUE_LIGHT:0x50597B,
    GREY:0xefefef,
    GREY_DARK:0xcccccc,
    GREY_DARKER:0x999999,
    GREY_LIGHT:0xffffff,
    RED:0xE53013,
    RED_DARK:0x990000,
    RED_LIGHT:0xFF3300,
    GREEN:0x33CC33,
    INPUT_HIGHLIGHT:0x0099ff,
    BLACK:0x000000
};

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

/**
 * @class Skin
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.Skin = function Skin(width,pixelRatio)
{
    var ColorTheme = App.ColorTheme,
        defaultScaleMode = PIXI.scaleModes.DEFAULT,
        padding = Math.round(10 * pixelRatio),
        graphics = new PIXI.Graphics(),
        w = width - padding * 2,
        h = Math.round(40 * pixelRatio),
        draw = App.GraphicUtils.drawRects,
        color = ColorTheme.GREY,
        lightColor = ColorTheme.GREY_LIGHT,
        darkColor = ColorTheme.GREY_DARK;

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_40 = graphics.generateTexture(1,defaultScaleMode);

    draw(graphics,ColorTheme.WHITE,1,[0,0,width,h],true,false);
    draw(graphics,color,1,[padding,h-1,w,1],false,true);

    this.WHITE_40 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(50 * pixelRatio);

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_50 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(60 * pixelRatio);

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_60 = graphics.generateTexture(1,defaultScaleMode);

    h = Math.round(70 * pixelRatio);

    draw(graphics,color,1,[0,0,width,h],true,false);
    draw(graphics,lightColor,1,[padding,0,w,1],false,false);
    draw(graphics,darkColor,1,[padding,h-1,w,1],false,true);

    this.GREY_70 = graphics.generateTexture(1,defaultScaleMode);

    draw(graphics,ColorTheme.RED,1,[0,0,width,h],true,false);
    draw(graphics,ColorTheme.RED_LIGHT,1,[padding,0,w,1],false,false);
    draw(graphics,ColorTheme.RED_DARK,1,[padding,h-1,w,1],false,true);

    this.RED_70 = graphics.generateTexture(1,defaultScaleMode);
};

/**
 * @class HeaderSegment
 * @extends DisplayObjectContainer
 * @param {number} value
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.HeaderSegment = function HeaderSegment(value,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this._action = value;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._frontElement = null;
    this._backElement = null;
    this._middlePosition = Math.round(15 * pixelRatio);
    this._needsUpdate = true;
    this._mask = new PIXI.Graphics();
    this.mask = this._mask;

    this.addChild(this._mask);
};

App.HeaderSegment.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.HeaderSegment.prototype.constructor = App.HeaderSegment;

/**
 * Render
 * @private
 */
App.HeaderSegment.prototype._render = function _render()
{
    var padding = Math.round(10 * this._pixelRatio);

    App.GraphicUtils.drawRect(this._mask,0xff0000,0.5,0,0,this._width,this._height-padding*2);
    this._mask.y = padding;
};

/**
 * Change
 * @param {number} action
 */
App.HeaderSegment.prototype.change = function change(action)
{
    if (this._action === action)
    {
        this._needsUpdate = false;
    }
    else
    {
        var tempIcon = this._frontElement;
        this._frontElement = this._backElement;
        this._backElement = tempIcon;

        this._needsUpdate = true;
    }

    this._action = action;
};

/**
 * Update
 * @param {number} progress
 */
App.HeaderSegment.prototype.update = function update(progress)
{
    if (this._needsUpdate)
    {
        this._frontElement.y = Math.round((this._middlePosition + this._frontElement.height) * progress - this._frontElement.height);
        this._backElement.y = Math.round(this._middlePosition + (this._height - this._middlePosition) * progress);
    }
};

/**
 * Return action
 * @returns {number}
 */
App.HeaderSegment.prototype.getAction = function getAction()
{
    return this._action;
};

/**
 * @class HeaderIcon
 * @extends HeaderSegment
 * @param {number} value
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.HeaderIcon = function HeaderIcon(value,width,height,pixelRatio)
{
    App.HeaderSegment.call(this,value,width,height,pixelRatio);

    this._frontElement = PIXI.Sprite.fromFrame(this._getIconByAction(value));
    this._backElement = PIXI.Sprite.fromFrame(this._getIconByAction(value));
    this._iconResizeRatio = Math.round(20 * pixelRatio) / this._frontElement.height;

    this._render();

    this.addChild(this._frontElement);
    this.addChild(this._backElement);
};

App.HeaderIcon.prototype = Object.create(App.HeaderSegment.prototype);
App.HeaderIcon.prototype.constructor = App.HeaderIcon;

/**
 * Render
 * @private
 */
App.HeaderIcon.prototype._render = function _render()
{
    App.HeaderSegment.prototype._render.call(this);

    var ColorTheme = App.ColorTheme;

    this._frontElement.scale.x = this._iconResizeRatio;
    this._frontElement.scale.y = this._iconResizeRatio;
    this._frontElement.x = this._middlePosition;
    this._frontElement.y = this._height;
    this._frontElement.tint = ColorTheme.WHITE;
    this._frontElement.alpha = 0.0;

    this._backElement.scale.x = this._iconResizeRatio;
    this._backElement.scale.y = this._iconResizeRatio;
    this._backElement.x = this._middlePosition;
    this._backElement.y = this._height;
    this._backElement.tint = ColorTheme.WHITE;
    this._backElement.alpha = 0.0;
};

/**
 * Return icon name by action passed in
 * @param {number} action
 * @returns {string}
 * @private
 */
App.HeaderIcon.prototype._getIconByAction = function _getIconByAction(action)
{
    var HeaderAction = App.HeaderAction,
        iconName = null;

    if (action === HeaderAction.MENU) iconName = "menu-app";
    else if (action === HeaderAction.CANCEL) iconName = "close-app";
    else if (action === HeaderAction.CONFIRM) iconName = "apply-app";
    else if (action === HeaderAction.ADD_TRANSACTION) iconName = "plus-app";

    return iconName;
};

/**
 * Change
 * @param {number} action
 */
App.HeaderIcon.prototype.change = function change(action)
{
    App.HeaderSegment.prototype.change.call(this,action);

    var iconName = this._getIconByAction(action);

    if (iconName === null)
    {
        this._frontElement.alpha = 0.0;
    }
    else
    {
        this._frontElement.setTexture(PIXI.TextureCache[iconName]);
        this._frontElement.alpha = 1.0;
    }
};

/**
 * @class HeaderTitle
 * @extends HeaderSegment
 * @param {string} value
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {{font:string,fill:string}} fontStyle
 * @constructor
 */
App.HeaderTitle = function HeaderTitle(value,width,height,pixelRatio,fontStyle)
{
    App.HeaderSegment.call(this,value,width,height,pixelRatio);

    this._frontElement = new PIXI.Text(value,fontStyle);
    this._backElement = new PIXI.Text(value,fontStyle);

    this._render();

    this.addChild(this._frontElement);
    this.addChild(this._backElement);
};

App.HeaderTitle.prototype = Object.create(App.HeaderSegment.prototype);
App.HeaderTitle.prototype.constructor = App.HeaderTitle;

/**
 * Render
 * @private
 */
App.HeaderTitle.prototype._render = function _render()
{
    App.HeaderSegment.prototype._render.call(this);

    this._middlePosition = Math.round(18 * this._pixelRatio);

    this._frontElement.x = Math.round((this._width - this._frontElement.width) / 2);
    this._frontElement.y = this._height;
    this._frontElement.alpha = 0.0;

    this._backElement.x = Math.round((this._width - this._backElement.width) / 2);
    this._backElement.y = this._height;
    this._backElement.alpha = 0.0;
};

/**
 * Change
 * @param {string} name
 */
App.HeaderTitle.prototype.change = function change(name)
{
    App.HeaderSegment.prototype.change.call(this,name);

    this._frontElement.setText(name);
    this._frontElement.x = Math.round((this._width - this._frontElement.width) / 2);
    this._frontElement.alpha = 1.0;
};

/**
 * @class Header
 * @extends Graphics
 * @param {Object} layout
 * @constructor
 */
App.Header = function Header(layout)
{
    PIXI.Graphics.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        HeaderIcon = App.HeaderIcon,
        HeaderAction = App.HeaderAction,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        listenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this._layout = layout;
    this._iconSize = Math.round(50 * r);
    this._leftIcon = new HeaderIcon(HeaderAction.ADD_TRANSACTION,this._iconSize,this._iconSize,r);
    this._rightIcon = new HeaderIcon(HeaderAction.MENU,this._iconSize,this._iconSize,r);
    this._title = new App.HeaderTitle("Cashius",this._layout.width-this._iconSize*2,this._iconSize,r,FontStyle.get(20,FontStyle.WHITE));
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._tween = new App.TweenProxy(0.7,App.Easing.outExpo,0,listenerPool);
    this._eventDispatcher = new App.EventDispatcher(listenerPool);
    this._actionEnabled = true;

    this._render();

    this.addChild(this._leftIcon);
    this.addChild(this._title);
    this.addChild(this._rightIcon);

    this._registerEventListeners();
};

App.Header.prototype = Object.create(PIXI.Graphics.prototype);
App.Header.prototype.constructor = App.Header;

/**
 * Render
 * @private
 */
App.Header.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this._layout.width,
        h = this._layout.headerHeight,
        offset = h - this._iconSize,
        padding = Math.round(10 * r);

    this._title.x = this._iconSize;
    this._rightIcon.x = w - this._iconSize;

    GraphicUtils.drawRects(this,ColorTheme.BLUE,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_LIGHT,1,[
        this._iconSize+1,offset+padding,1,this._iconSize-padding*2,
        w-this._iconSize,offset+padding,1,this._iconSize-padding*2
    ],false,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_DARK,1,[
        0,h-1,w,1,
        this._iconSize,offset+padding,1,this._iconSize-padding*2,
        w-this._iconSize-1,offset+padding,1,this._iconSize-padding*2
    ],false,true);
};

/**
 * Register event listeners
 * @private
 */
App.Header.prototype._registerEventListeners = function _registerEventListeners()
{
    var EventType = App.EventType;

    App.ViewLocator.getViewSegment(App.ViewName.SCREEN_STACK).addEventListener(EventType.CHANGE,this,this._onScreenChange);

    if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
    else this.click = this._onClick;

    this._tween.addEventListener(EventType.COMPLETE,this,this._onTweenComplete);

    this.interactive = true;
};

/**
 * Enable actions
 */
App.Header.prototype.enableActions = function enableActions()
{
    this._actionEnabled = true;
};

/**
 * Disable actions
 */
App.Header.prototype.disableActions = function disableActions()
{
    this._actionEnabled = false;
};

/**
 * On screen change
 * @private
 */
App.Header.prototype._onScreenChange = function _onScreenChange()
{
    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

    this._tween.restart();
};

/**
 * Change
 * @param {number} leftAction
 * @param {number} rightAction
 * @param {string} name
 * @private
 */
App.Header.prototype.change = function change(leftAction,rightAction,name)
{
    this._leftIcon.change(leftAction);
    this._title.change(name);
    this._rightIcon.change(rightAction);
};

/**
 * On RAF Tick
 * @private
 */
App.Header.prototype._onTick = function _onTick()
{
    this._onTweenUpdate();
};

/**
 * On tween update
 * @private
 */
App.Header.prototype._onTweenUpdate = function _onTweenUpdate()
{
    var progress = this._tween.progress;
    //TODO offset each segment for effect
    this._leftIcon.update(progress);
    this._title.update(progress);
    this._rightIcon.update(progress);
};

/**
 * On tween complete
 * @private
 */
App.Header.prototype._onTweenComplete = function _onTweenComplete()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._onTweenUpdate();
};

/**
 * On click
 * @param {InteractionData} data
 * @private
 */
App.Header.prototype._onClick = function _onClick(data)
{
    if (this._actionEnabled)
    {
        var position = data.getLocalPosition(this).x,
            HeaderAction = App.HeaderAction,
            action = HeaderAction.NONE;

        if (position <= this._iconSize) action = this._leftIcon.getAction();
        else if (position >= this._layout.width - this._iconSize) action = this._rightIcon.getAction();

        if (action !== HeaderAction.NONE) this._eventDispatcher.dispatchEvent(App.EventType.CLICK,action);
    }
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Header.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Header.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * @class ScrollIndicator
 * @extends Graphics
 * @param {string} direction
 * @param {number} pixelRatio
 * @constructor
 */
App.ScrollIndicator = function ScrollIndicator(direction,pixelRatio)
{
    PIXI.Graphics.call(this);

    this.visible = false;
    this.boundingBox = new PIXI.Rectangle(0,0,0,0);

    this._direction = direction;
    this._pixelRatio = pixelRatio;
    this._minIndicatorSize = Math.round(50 * pixelRatio);
    this._padding = Math.round(4 * pixelRatio);
    this._size = 0;
    this._indicatorSize = 0;
    this._indicatorThickness = 0;
    this._contentPosition = 0;
    this._positionStep = 0;

    this._showHideTween = new App.TweenProxy(0.2,App.Easing.linear,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._state = App.TransitionState.HIDDEN;
};

App.ScrollIndicator.prototype = Object.create(PIXI.Graphics.prototype);
App.ScrollIndicator.prototype.constructor = App.ScrollIndicator;

/**
 * Show
 */
App.ScrollIndicator.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._state === TransitionState.HIDING || this._state === TransitionState.HIDDEN)
    {
        this._state = TransitionState.SHOWING;
        this.visible = true;

        this._showHideTween.start(true);
    }
};

/**
 * Hide
 *
 * @param {boolean} [immediate=false]
 */
App.ScrollIndicator.prototype.hide = function hide(immediate)
{
    var TransitionState = App.TransitionState;

    if (immediate)
    {
        this._state = TransitionState.HIDDEN;

        this.alpha = 0.0;
        this.visible = false;
    }
    else
    {
        if (this._state === TransitionState.SHOWING || this._state === TransitionState.SHOWN)
        {
            this._state = TransitionState.HIDING;

            this._showHideTween.start(true);
        }
    }
};

/**
 * Update indicator according to position passed in
 * @param {number} contentPosition
 */
App.ScrollIndicator.prototype.update = function update(contentPosition)
{
    this._contentPosition = contentPosition;

    var TransitionState = App.TransitionState;
    if (this._state === TransitionState.SHOWING || this._state === TransitionState.HIDING)
    {
        this._updateVisibility(TransitionState);
    }

    this._render();
};

/**
 * Update visibility
 * @param {App.TransitionState} TransitionState
 * @private
 */
App.ScrollIndicator.prototype._updateVisibility = function _updateVisibility(TransitionState)
{
    var progress = this._showHideTween.progress;

    if (this._state === TransitionState.SHOWING)
    {
        this.alpha = progress;

        if (progress === 1.0) this._state = TransitionState.SHOWN;
    }
    else if (this._state === TransitionState.HIDING)
    {
        this.alpha = 1.0 - progress;

        if (progress === 1.0)
        {
            this._state = TransitionState.HIDDEN;
            this.visible = false;
        }
    }
};

/**
 * Resize
 * @param {number} size
 * @param {number} contentSize
 */
App.ScrollIndicator.prototype.resize = function resize(size,contentSize)
{
    this._size = size;

    if (this._direction === App.Direction.X)
    {
        this.boundingBox.width = this._size;
        this.boundingBox.height = Math.round(7 * this._pixelRatio);

        this._indicatorThickness = this.boundingBox.height - this._padding;
        this._indicatorSize = Math.round(this._size * (this._size / contentSize));
        if (this._indicatorSize < this._minIndicatorSize) this._indicatorSize = this._minIndicatorSize;

        this._positionStep = (this._size - this._indicatorSize) / (contentSize - this._size);
    }
    else if (this._direction === App.Direction.Y)
    {
        this.boundingBox.width = Math.round(7 * this._pixelRatio);
        this.boundingBox.height = this._size;

        this._indicatorThickness = this.boundingBox.width - this._padding;
        this._indicatorSize = Math.round(this._size * (this._size / contentSize));
        if (this._indicatorSize < this._minIndicatorSize) this._indicatorSize = this._minIndicatorSize;

        this._positionStep = (this._size - this._indicatorSize) / (contentSize - this._size);
    }

    this._render();
};

/**
 * Render indicator
 * @private
 */
App.ScrollIndicator.prototype._render = function _render()
{
    var indicatorSize = this._indicatorSize,
        position = -Math.round(this._contentPosition * this._positionStep);

    if (position + indicatorSize > this._size)
    {
        indicatorSize = this._size - position;
    }
    else if (position < 0)
    {
        indicatorSize = indicatorSize + position;
        position = 0;
    }

    this.clear();
    this.beginFill(0x000000,0.3);

    if (this._direction === App.Direction.X)
    {
        this.drawRoundedRect(
            position + this._padding,
            Math.round(this._padding * 0.5),
            indicatorSize - this._padding * 2,
            this._indicatorThickness,
            this._indicatorThickness * 0.5
        );
    }
    else if (this._direction === App.Direction.Y)
    {
        this.drawRoundedRect(
            Math.round(this._padding * 0.5),
            position + this._padding,
            this._indicatorThickness,
            indicatorSize - this._padding * 2,
            this._indicatorThickness * 0.5
        );
    }

    this.endFill();
};

/**
 * Destroy
 */
App.ScrollIndicator.prototype.destroy = function destroy()
{
    //TODO also destroy PIXI's Graphics object!

    this._showHideTween.destroy();
    this._showHideTween = null;

    this.boundingBox = null;
    this._direction = null;
    this._state = null;

    this.clear();
};

/**
 * @class Input
 * @extends Graphics
 * @param {string} placeholder
 * @param {number} fontSize
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} displayIcon
 * @constructor
 */
App.Input = function Input(placeholder,fontSize,width,height,pixelRatio,displayIcon)
{
    PIXI.Graphics.call(this);

    var FontStyle = App.FontStyle;

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._fontSize = fontSize;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._enabled = false;
    this._focused = false;

    this._eventDispatcher = new App.EventDispatcher(App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._placeholder = placeholder;
    this._placeholderStyle = FontStyle.get(fontSize,FontStyle.GREY);
    this._currentStyle = this._placeholderStyle;
    this._textStyle = FontStyle.get(fontSize,FontStyle.BLUE);
    this._restrictPattern = null;

    this._text = "";
    this._textField = new PIXI.Text(this._placeholder,this._currentStyle);
    this._inputProxy = document.getElementById("textInputProxy");
    this._inputProxyListeners = {
        focus:this._onFocus.bind(this),
        blur:this._onBlur.bind(this),
        change:this._onChange.bind(this)
    };
    if (displayIcon) this._icon = PIXI.Sprite.fromFrame("clear-app");
    this._iconHitThreshold = Math.round(this._width - 40 * this._pixelRatio);

    this._render();

    this.addChild(this._textField);
    if (this._icon) this.addChild(this._icon);
};

App.Input.prototype = Object.create(PIXI.Graphics.prototype);
App.Input.prototype.constructor = App.Input;

/**
 * Render
 * @private
 */
App.Input.prototype._render = function _render()
{
    var r = this._pixelRatio;

    this._renderBackground(false,r);

    this._textField.x = Math.round(10 * r);
    this._textField.y = Math.round((this._height - this._textField.height) / 2 + r);

    if (this._icon)
    {
        this._icon.width = Math.round(20 * r);
        this._icon.height = Math.round(20 * r);
        this._icon.x = Math.round(this._width - this._icon.width - 10 * r);
        this._icon.y = Math.round((this._height - this._icon.height) / 2);
        this._icon.tint = 0xdddddd;
    }
};

/**
 * Highlight focused input
 * @param {boolean} highlight
 * @param {number} r pixelRatio
 * @private
 */
App.Input.prototype._renderBackground = function _renderBackground(highlight,r)
{
    var ColorTheme = App.ColorTheme;

    this.clear();
    this.beginFill(highlight ? ColorTheme.INPUT_HIGHLIGHT : ColorTheme.GREY_DARK);
    this.drawRoundedRect(0,0,this._width,this._height,Math.round(5 * r));
    this.beginFill(0xffffff);
    this.drawRoundedRect(Math.round(r),Math.round(r),this._width-Math.round(2 * r),this._height-Math.round(2 * r),Math.round(4 * r));
    this.endFill();
};

/**
 * Enable
 */
App.Input.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._enabled = true;

        this._registerEventListeners();

        this.interactive = true;
    }
};

/**
 * Disable
 */
App.Input.prototype.disable = function disable()
{
    this._unRegisterEventListeners();
    this._unRegisterProxyEventListeners();

    this.interactive = false;

    this._enabled = false;
};

/**
 * Set restriction pattern
 * @param {RegExp} pattern
 */
App.Input.prototype.restrict = function restrict(pattern)
{
    this._restrictPattern = pattern;
};

/**
 * Is input focused?
 * @returns {boolean}
 */
App.Input.prototype.isFocused = function isFocused()
{
    return this._focused;
};

/**
 * Focus
 */
App.Input.prototype.focus = function focus()
{
    if (!this._focused)
    {
        this._renderBackground(true,this._pixelRatio);

        this._registerProxyEventListeners();

        this._inputProxy.focus();// requires Cordova preference: <preference name="KeyboardDisplayRequiresUserAction" value="false"/>

        this._focused = true;
    }
};

/**
 * Remove focus
 */
App.Input.prototype.blur = function blur()
{
    this._inputProxy.blur();

    this._unRegisterProxyEventListeners();

    this._focused = false;
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Input.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Input.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Register event listeners
 * @private
 */
App.Input.prototype._registerEventListeners = function _registerEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
    else this.click = this._onClick;
};

/**
 * UnRegister event listeners
 * @private
 */
App.Input.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED) this.tap = null;
    else this.click = null;
};

/**
 * Register input proxy event listeners
 * @private
 */
App.Input.prototype._registerProxyEventListeners = function _registerProxyEventListeners()
{
    var EventType = App.EventType;
    this._inputProxy.addEventListener(EventType.FOCUS,this._inputProxyListeners.focus,false);
    this._inputProxy.addEventListener(EventType.BLUR,this._inputProxyListeners.blur,false);
    this._inputProxy.addEventListener(EventType.CHANGE,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.KEY_PRESS,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.PASTE,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.TEXT_INPUT,this._inputProxyListeners.change,false);
    this._inputProxy.addEventListener(EventType.INPUT,this._inputProxyListeners.change,false);
};

/**
 * Register input proxy event listeners
 * @private
 */
App.Input.prototype._unRegisterProxyEventListeners = function _unRegisterProxyEventListeners()
{
    var EventType = App.EventType;
    this._inputProxy.removeEventListener(EventType.FOCUS,this._inputProxyListeners.focus,false);
    this._inputProxy.removeEventListener(EventType.BLUR,this._inputProxyListeners.blur,false);
    this._inputProxy.removeEventListener(EventType.CHANGE,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.KEY_PRESS,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.PASTE,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.TEXT_INPUT,this._inputProxyListeners.change,false);
    this._inputProxy.removeEventListener(EventType.INPUT,this._inputProxyListeners.change,false);
};

/**
 * On click
 * @param {InteractionData} data
 * @private
 */
App.Input.prototype._onClick = function _onClick(data)
{
    if (this._inputProxy !== document.activeElement) this.focus();

    if (this._icon)
    {
        // If user click/tap at 'close' icon, erase actual text
        if (data.getLocalPosition(this).x >= this._iconHitThreshold)
        {
            this._inputProxy.value = "";
            this._onChange();
        }
    }
};

/**
 * On input proxy focus
 * @private
 */
App.Input.prototype._onFocus = function _onFocus()
{
    var r = this._pixelRatio,
        localPoint = this.toLocal(new PIXI.Point(this.x,this.y),this.stage);

    this._focused = true;

    this._inputProxy.style.display = "none";
    this._inputProxy.style.left = Math.round((this.x - localPoint.x) / r) +"px";
    this._inputProxy.style.top = Math.round((this.y - localPoint.y) / r) + "px";
    this._inputProxy.style.width = this._icon ? Math.round(this._iconHitThreshold / r) + "px" : Math.round(this._width / r) + "px";
    this._inputProxy.style.height = Math.round(this._height / r) + "px";
    this._inputProxy.style.fontSize = this._fontSize + "px";
    this._inputProxy.style.lineHeight = this._fontSize + "px";
    this._inputProxy.value = this._text;
    this._inputProxy.style.display = "block";

    this._eventDispatcher.dispatchEvent(App.EventType.FOCUS);
};

/**
 * On input proxy blur
 * @private
 */
App.Input.prototype._onBlur = function _onBlur()
{
    this._focused = false;

    this._updateText(true);

    this._inputProxy.style.top = "-1000px";
    this._inputProxy.value = "";

    this._renderBackground(false,this._pixelRatio);

    this._unRegisterProxyEventListeners();

    this._eventDispatcher.dispatchEvent(App.EventType.BLUR);
};

/**
 * Input change handler
 * @param {Event} [e=null]
 * @private
 */
App.Input.prototype._onChange = function _onChange(e)
{
    this._updateText(false);

    // If RETURN is hit, remove focus
    if (e && e.keyCode === 13) this._inputProxy.blur();
};

/**
 * Update text
 * @param {boolean} [finish=false]
 * @private
 */
App.Input.prototype._updateText = function _updateText(finish)
{
    this._text = this._format(finish);

    if (this._text === this._placeholder || this._text.length === 0)
    {
        if (this._currentStyle === this._textStyle)
        {
            this._currentStyle = this._placeholderStyle;
            this._textField.setStyle(this._currentStyle);
        }

        this._textField.setText(this._placeholder);
    }
    else
    {
        if (this._currentStyle === this._placeholderStyle)
        {
            this._currentStyle = this._textStyle;
            this._textField.setStyle(this._currentStyle);
        }

        this._textField.setText(this._text);
    }
};

/**
 * Format the text input
 * @param {boolean} [finish=false]
 * @private
 */
App.Input.prototype._format = function _format(finish)
{
    if (this._restrictPattern)
    {
        var result = this._inputProxy.value.match(this._restrictPattern);
        if (result && result.length > 0) this._inputProxy.value = result[0];
        else this._inputProxy.value = "";
    }

    return this._inputProxy.value;
};

/**
 * Set value
 * @param {string} value
 */
App.Input.prototype.setValue = function setValue(value)
{
    this._inputProxy.value = value;
    this._updateText(false);
};

/**
 * Set value
 * @returns {string}
 */
App.Input.prototype.getValue = function getValue()
{
    return this._text;
};

/**
 * Set value
 * @param {string} value
 */
App.Input.prototype.setPlaceholder = function setPlaceholder(value)
{
    //TODO is this used?
    this._placeholder = value;
    this._updateText(false);
};

/**
 * Test if position passed in falls within this input boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.Input.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};

/**
 * @class TimeInput
 * @extends Input
 * @param {string} placeholder
 * @param {number} fontSize
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} displayIcon
 * @constructor
 */
App.TimeInput = function TimeInput(placeholder,fontSize,width,height,pixelRatio,displayIcon)
{
    App.Input.call(this,placeholder,fontSize,width,height,pixelRatio,displayIcon);

    this._inputProxy = document.getElementById("timeInputProxy");
};

App.TimeInput.prototype = Object.create(App.Input.prototype);
App.TimeInput.prototype.constructor = App.TimeInput;

/**
 * Render
 * @private
 */
App.TimeInput.prototype._render = function _render()
{
    var r = this._pixelRatio;

    this._renderBackground(false,r);

    this._updateAlignment();

    this._textField.y = Math.round(9 * r);
};

/**
 * Update text
 * @param {boolean} [finish=false]
 * @private
 */
App.TimeInput.prototype._updateText = function _updateText(finish)
{
    App.Input.prototype._updateText.call(this,finish);

    this._updateAlignment();
};

/**
 * Format the text input
 * @param {boolean} [finish=false]
 * @private
 */
App.TimeInput.prototype._format = function _format(finish)
{
    if (this._inputProxy.value.length === 0) return "";

    var value = this._inputProxy.value.replace(/\D/g,""),
        hours = value.substr(0,2),
        minutes = value.substr(2,2);

    if (hours.length === 2 && parseInt(hours,10) > 24) hours = "24";
    else if (minutes.length === 1 && parseInt(minutes,10) > 5) minutes = "5";
    else if (minutes.length >= 2 && parseInt(minutes,10) > 59) minutes = "59";

    if (finish)
    {
        if (hours.length === 1) hours = "0" + hours;

        if (minutes.length === 0) minutes += "00";
        else if (minutes.length === 1) minutes += "0";
    }

    if (minutes.length > 0) value = hours + ":" + minutes;
    else value = hours;

    this._inputProxy.value = value;

    return value;
};

/**
 * Update text's alignment
 * @private
 */
App.TimeInput.prototype._updateAlignment = function _updateAlignment()
{
    this._textField.x = Math.round((this._width - this._textField.width) / 2);
};

/**
 * @class Button
 * @extend Graphics
 * @param {string} label
 * @param {{width:number,height:number,pixelRatio:number,style:Object,backgroundColor:number}} options
 * @constructor
 */
App.Button = function Button(label,options)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._pixelRatio = options.pixelRatio;
    this._label = label;
    this._style = options.style;
    this._backgroundColor = options.backgroundColor;
    this._labelField = new PIXI.Text(label,this._style);

    this._render();

    this.addChild(this._labelField);
};

App.Button.prototype = Object.create(PIXI.Graphics.prototype);
App.Button.prototype.constructor = App.Button;

/**
 * Render
 * @private
 */
App.Button.prototype._render = function _render()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height;

    App.GraphicUtils.drawRoundedRect(this,this._backgroundColor,1,0,0,w,h,Math.round(5 * this._pixelRatio));

    this._labelField.x = Math.round((w - this._labelField.width) / 2);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
};

/**
 * Resize
 * @param {number} width
 * @param {number} height
 */
App.Button.prototype.resize = function resize(width,height)
{
    this.boundingBox.width = width || this.boundingBox.width;
    this.boundingBox.height = height || this.boundingBox.height;

    this._render();
};

/**
 * Test if position passed in falls within this button bounds
 * @param {Point} position
 * @returns {boolean}
 */
App.Button.prototype.hitTest = function hitTest(position)
{
    return position.x >= this.x && position.x < this.x + this.boundingBox.width && position.y >= this.y && position.y < this.y + this.boundingBox.height;
};

/**
 * @class CalendarWeekRow
 * @extend Graphics
 * @param {{font:string,fill:string}} weekTextStyle
 * @param {{font:string,fill:string}} weekSelectedStyle
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.CalendarWeekRow = function CalendarWeekRow(weekTextStyle,weekSelectedStyle,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var FontStyle = App.FontStyle,
        daysInWeek = 7,
        Text = PIXI.Text,
        index = 0,
        i = 0;

    this.boundingBox = new App.Rectangle(0,0,width,Math.round(40*pixelRatio));

    this._week = null;
    this._width = width;
    this._pixelRatio = pixelRatio;

    this._textStyle = weekTextStyle;
    this._selectedStyle = weekSelectedStyle;
    this._dateFields = new Array(7);
    this._selectedDayIndex = -1;
    this._highlightBackground = new PIXI.Graphics();

    for (;i<daysInWeek;i++,index+=2) this._dateFields[i] = new Text("",this._textStyle);

    this.addChild(this._highlightBackground);
    for (i = 0;i<daysInWeek;) this.addChild(this._dateFields[i++]);
};

App.CalendarWeekRow.prototype = Object.create(PIXI.Graphics.prototype);
App.CalendarWeekRow.prototype.constructor = App.CalendarWeekRow;

/**
 * Render
 * @private
 */
App.CalendarWeekRow.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        daysInWeek = this._week.length / 2,
        cellWidth = Math.round(this._width / daysInWeek),
        cellHeight = this.boundingBox.height,
        textField = null,
        otherBGStart = -1,
        otherBGEnd = -1,
        index = 0,
        i = 0;

    this.clear();
    this.beginFill(ColorTheme.GREY_LIGHT);
    this.drawRect(0,0,this._width,cellHeight);
    this.beginFill(ColorTheme.GREY);

    for (;i<daysInWeek;i++,index+=2)
    {
        textField = this._dateFields[i];
        textField.x = Math.round((i * cellWidth) + (cellWidth - textField.width) / 2 + 1);
        textField.y = Math.round((cellHeight - textField.height) / 2 + 1);

        if (this._week[index+1])
        {
            if (otherBGStart === -1) otherBGStart = i;
        }
        else
        {
            if (otherBGEnd === -1 && otherBGStart > -1) otherBGEnd = i;
            if (i) this.drawRect(Math.round(i * cellWidth),0,1,cellHeight);
        }
    }

    // Highlight days from other months
    if (otherBGStart > -1)
    {
        this.drawRect(
            otherBGStart ? otherBGStart * cellWidth : 0,
            0,
            otherBGEnd === -1 ? this._width : otherBGEnd * cellWidth,
            cellHeight);
    }

    this.endFill();

    App.GraphicUtils.drawRect(this._highlightBackground,ColorTheme.BLUE,1,0,0,cellWidth-1,cellHeight);
    this._highlightBackground.alpha = 0.0;
};

/**
 * Find and return day by date passed in
 * @param {number} day
 * @returns {{day:number,otherMonth:number,index:number}} position
 */
App.CalendarWeekRow.prototype._getDayByDate = function _getDayByDate(day)
{
    var index = 0,
        i = 0,
        l = this._week.length / 2,
        dayInWeek = -1;

    for (;i<l;i++,index+=2)
    {
        dayInWeek = this._week[index];
        if (dayInWeek === day) return {day:dayInWeek,otherMonth:this._week[index+1],index:i};
    }
    return null;
};

/**
 * Find and return day by position passed in
 * @param {number} position
 * @returns {{day:number,otherMonth:number,index:number}} position
 */
App.CalendarWeekRow.prototype.getDayByPosition = function getDayByPosition(position)
{
    var index = 0,
        i = 0,
        l = this._week.length / 2,
        cellWidth = Math.round(this._width / l);

    for (;i<l;i++,index+=2)
    {
        if (position >= i * cellWidth && position <= i * cellWidth + cellWidth)
        {
            return {day:this._week[index],otherMonth:this._week[index+1],index:i};
        }
    }
    return null;
};

/**
 * Select day
 * @param {{day:number,otherMonth:number,index:number}} day
 * @private
 */
App.CalendarWeekRow.prototype._selectDay = function _selectDay(day)
{
    //TODO fade-in?
    this._highlightBackground.x = day.index * Math.round(this._width / (this._week.length / 2)) + Math.round(this._pixelRatio);
    this._highlightBackground.alpha = 1.0;

    if (this._selectedDayIndex > -1) this._dateFields[this._selectedDayIndex].setStyle(this._textStyle);

    this._selectedDayIndex = day.index;
    this._dateFields[this._selectedDayIndex].setStyle(this._selectedStyle);
};

/**
 * Deselect day
 * @private
 */
App.CalendarWeekRow.prototype._deselectDay = function _deselectDay()
{
    if (this._selectedDayIndex > -1)
    {
        this._dateFields[this._selectedDayIndex].setStyle(this._textStyle);

        this._selectedDayIndex = -1;
    }

    //TODO fade-out?
    this._highlightBackground.alpha = 0.0;
};

/**
 * Update selection
 * @param {number} date Day of a month to select
 */
App.CalendarWeekRow.prototype.updateSelection = function updateSelection(date)
{
    var day = this._getDayByDate(date);

    if (day && day.otherMonth === 0) this._selectDay(day);
    else this._deselectDay();
};

/**
 * Change week
 * @param {Array.<Number>} week
 * @param {number} currentDay
 */
App.CalendarWeekRow.prototype.change = function change(week,currentDay)
{
    this._week = week;

    var daysInWeek = week.length / 2,
        dayField = null,
        index = 0,
        i = 0;

    for (;i<daysInWeek;i++,index+=2)
    {
        dayField = this._dateFields[i];
        dayField.setText(week[index]);
        dayField.setStyle(this._textStyle);
    }

    this._render();

    if (currentDay > -1) this.updateSelection(currentDay);
};

/**
 * @class Calendar
 * @extend Graphic
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.Calendar = function Calendar(width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var dayLabelStyle = {font:"bold " + Math.round(12 * pixelRatio)+"px Arial",fill:"#999999"},
        CalendarWeekRow = App.CalendarWeekRow,
        Text = PIXI.Text,
        DateUtils = App.DateUtils,
        FontStyle = App.FontStyle,
        startOfWeek = App.ModelLocator.getProxy(App.ModelName.SETTINGS).startOfWeek,
        weekTextStyle = FontStyle.get(14,FontStyle.GREY_DARK),
        weekSelectedStyle = FontStyle.get(14,FontStyle.WHITE),
        dayLabels = DateUtils.getDayLabels(startOfWeek),
        daysInWeek = dayLabels.length,
        weeksInMonth = 6,
        i = 0;

    this.boundingBox = new App.Rectangle(0,0,width);

    this._date = null;
    this._selectedDate = null;
    this._width = width;
    this._pixelRatio = pixelRatio;
    this._weekRowPosition = Math.round(81 * pixelRatio);

    this._monthField = new PIXI.Text("",FontStyle.get(18,FontStyle.BLUE));
    this._prevButton = PIXI.Sprite.fromFrame("arrow-app");
    this._nextButton = PIXI.Sprite.fromFrame("arrow-app");
    this._dayLabelFields = new Array(daysInWeek);
    this._weekRows = new Array(weeksInMonth);
    this._separatorContainer = new PIXI.Graphics();

    for (;i<daysInWeek;i++) this._dayLabelFields[i] = new Text(dayLabels[i],dayLabelStyle);
    for (i = 0;i<weeksInMonth;i++) this._weekRows[i] = new CalendarWeekRow(weekTextStyle,weekSelectedStyle,width,pixelRatio);

    this._render();

    this.addChild(this._monthField);
    this.addChild(this._prevButton);
    this.addChild(this._nextButton);
    for (i = 0;i<daysInWeek;) this.addChild(this._dayLabelFields[i++]);
    for (i = 0;i<weeksInMonth;) this.addChild(this._weekRows[i++]);
    this.addChild(this._separatorContainer);
};

App.Calendar.prototype = Object.create(PIXI.Graphics.prototype);
App.Calendar.prototype.constructor = App.Calendar;

/**
 * Render
 *
 * @private
 */
App.Calendar.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        w = this._width,
        h = this.boundingBox.height,
        arrowResizeRatio = Math.round(12 * r) / this._prevButton.height,
        separatorPadding = Math.round(15 * r),
        separatorWidth = w - separatorPadding * 2,
        dayLabel = null,
        dayLabelWidth = Math.round(w / this._dayLabelFields.length),
        dayLabelOffset = Math.round(40 * r),
        weekRow = this._weekRows[0],
        weekRowHeight = weekRow.boundingBox.height,
        l = this._dayLabelFields.length,
        i = 0;

    this._monthField.y = Math.round((dayLabelOffset - this._monthField.height) / 2);

    this._prevButton.scale.x = arrowResizeRatio;
    this._prevButton.scale.y = arrowResizeRatio;
    this._prevButton.x = Math.round(20 * r + this._prevButton.width);
    this._prevButton.y = Math.round((dayLabelOffset - this._prevButton.height) / 2 + this._prevButton.height);
    this._prevButton.rotation = Math.PI;
    this._prevButton.tint = ColorTheme.BLUE;

    this._nextButton.scale.x = arrowResizeRatio;
    this._nextButton.scale.y = arrowResizeRatio;
    this._nextButton.x = Math.round(w - 20 * r - this._nextButton.width);
    this._nextButton.y = Math.round((dayLabelOffset - this._prevButton.height) / 2);
    this._nextButton.tint = ColorTheme.BLUE;

    for (;i<l;i++)
    {
        dayLabel = this._dayLabelFields[i];
        dayLabel.x = Math.round((i * dayLabelWidth) + (dayLabelWidth - dayLabel.width) / 2);
        dayLabel.y = Math.round(dayLabelOffset + r + (dayLabelOffset - dayLabel.height) / 2);
    }

    i = 0;
    l = this._weekRows.length;

    this._separatorContainer.clear();
    this._separatorContainer.beginFill(ColorTheme.GREY,1.0);

    for (;i<l;i++)
    {
        weekRow = this._weekRows[i];
        weekRow.y = this._weekRowPosition + i * weekRowHeight;

        this._separatorContainer.drawRect(0,weekRow.y + weekRowHeight,w,1);
    }

    this._separatorContainer.endFill();

    this.boundingBox.height = weekRow.y + weekRowHeight;

    //TODO I dont need this (can use screen's bg) ... and can extend from DOContainer instead
    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,this.boundingBox.height],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[0,Math.round(80 * r),w,1,separatorPadding,dayLabelOffset,separatorWidth,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[separatorPadding,dayLabelOffset+1,separatorWidth,1],false,true);
};

/**
 * Update
 * @param {Date} date
 */
App.Calendar.prototype.update = function update(date)
{
    this._date = date;
    if (this._selectedDate) this._selectedDate.setTime(this._date.valueOf());
    else this._selectedDate = new Date(this._date.valueOf());

    var month = App.DateUtils.getMonth(this._date,App.ModelLocator.getProxy(App.ModelName.SETTINGS).startOfWeek),
        selectedDate = this._selectedDate.getDate(),
        weeksInMonth = month.length,
        i = 0;

    for (i = 0;i<weeksInMonth;i++) this._weekRows[i].change(month[i],selectedDate);

    this._updateMonthLabel();
};

/**
 * Return selected date
 * @returns {Date}
 */
App.Calendar.prototype.getSelectedDate = function getSelectedDate()
{
    return this._selectedDate;
};

/**
 * Update month label
 * @private
 */
App.Calendar.prototype._updateMonthLabel = function _updateMonthLabel()
{
    this._monthField.setText(App.DateUtils.getMonthLabel(this._date.getMonth()) + " " + this._date.getFullYear());
    this._monthField.x = Math.round((this._width - this._monthField.width) / 2);
};

/**
 * On click
 */
App.Calendar.prototype.onClick = function onClick()
{
    var position = this.stage.getTouchData().getLocalPosition(this),
        x = position.x,
        y = position.y;

    // Click into the actual calendar
    if (y >= this._weekRowPosition)
    {
        this._selectDay(x,y);
    }
    // Click at one of the prev-, next-buttons
    else
    {
        var prevDX = this._prevButton.x - this._prevButton.width / 2 - x,
            nextDX = this._nextButton.x + this._nextButton.width / 2 - x,
            dy = this._nextButton.y + this._nextButton.height / 2 - y,
            prevDist = prevDX * prevDX - dy * dy,
            nextDist = nextDX * nextDX - dy * dy,
            threshold = 20 * this._pixelRatio;

        if (Math.sqrt(Math.abs(prevDist)) < threshold) this._changeDate(App.Direction.LEFT,-1);
        else if (Math.sqrt(Math.abs(nextDist)) < threshold) this._changeDate(App.Direction.RIGHT,-1);
    }
};

/**
 * Find and return week row by position passed in
 * @param {number} position
 * @private
 */
App.Calendar.prototype._getWeekByPosition = function _getWeekByPosition(position)
{
    var weekRowHeight = this._weekRows[0].boundingBox.height,
        weekRow = null,
        l = this._weekRows.length,
        i = 0;

    for (;i<l;)
    {
        weekRow = this._weekRows[i++];
        if (weekRow.y <= position && weekRow.y + weekRowHeight > position)
        {
            return weekRow;
        }
    }
    return null;
};

/**
 * Select day by position passed in
 * @param {number} x
 * @param {number} y
 * @private
 */
App.Calendar.prototype._selectDay = function _selectDay(x,y)
{
    var week = this._getWeekByPosition(y),
        day = week.getDayByPosition(x),
        date = day.day,
        l = this._weekRows.length,
        i = 0;

    if (day.otherMonth)
    {
        if (date > 20) this._changeDate(App.Direction.LEFT,date);
        else this._changeDate(App.Direction.RIGHT,date);
    }
    else
    {
        for (;i<l;)this._weekRows[i++].updateSelection(date);

        this._selectedDate.setFullYear(this._date.getFullYear(),this._date.getMonth(),date);
    }
};

/**
 * Change date
 * @param {string} direction
 * @param {number} selectDate
 * @private
 */
App.Calendar.prototype._changeDate = function _changeDate(direction,selectDate)
{
    var currentMonth = this._date.getMonth(),
        currentYear = this._date.getFullYear(),
        newMonth = currentMonth < 11 ? currentMonth + 1 : 0,
        newYear = newMonth ? currentYear : currentYear + 1;

    if (direction === App.Direction.LEFT)
    {
        newMonth = currentMonth ? currentMonth - 1 : 11;
        newYear = currentMonth ? currentYear : currentYear - 1;
    }

    this._date.setFullYear(newYear,newMonth);
    if (selectDate > -1) this._selectedDate.setFullYear(newYear,newMonth,selectDate);

    this._updateMonthLabel();

    var month = App.DateUtils.getMonth(this._date,App.ModelLocator.getProxy(App.ModelName.SETTINGS).startOfWeek),
        weeksInMonth = month.length,
        selectedMonth = this._selectedDate.getFullYear() === newYear && this._selectedDate.getMonth() === newMonth,
        selectedDate = selectedMonth ? this._selectedDate.getDate() : -1,
        i = 0;

    for (i = 0;i<weeksInMonth;i++) this._weekRows[i].change(month[i],selectedDate);
};

/**
 * @class Radio
 * @param {number} pixelRatio
 * @param {boolean} selected
 * @constructor
 */
App.Radio = function Radio(pixelRatio,selected)
{
    PIXI.Graphics.call(this);

    this._selected = selected;
    this._size = Math.round(20 * pixelRatio);
    this._pixelRatio = pixelRatio;
    this._check = new PIXI.Graphics();

    this.boundingBox = new App.Rectangle(0,0,this._size,this._size);

    this._render();

    this._check.alpha = selected ? 1.0 : 0.0;

    this.addChild(this._check);
};

App.Radio.prototype = Object.create(PIXI.Graphics.prototype);
App.Radio.prototype.constructor = App.Radio;

/**
 * Render
 * @private
 */
App.Radio.prototype._render = function _render()
{
    var drawArc = App.GraphicUtils.drawArc,
        ColorTheme = App.ColorTheme,
        size = this._size,
        center = new PIXI.Point(Math.round(size/2),Math.round(size/2));

    drawArc(this,center,size,size,Math.round(2*this._pixelRatio),0,360,20,0,0,0,ColorTheme.GREY,1);

    size -= Math.round(8*this._pixelRatio);

    drawArc(this._check,center,size,size,Math.round(6*this._pixelRatio),0,360,20,0,0,0,ColorTheme.BLUE,1);
};

/**
 * Select
 */
App.Radio.prototype.select = function select()
{
    this._selected = true;

    this._check.alpha = 1.0;
};

/**
 * Select
 */
App.Radio.prototype.deselect = function deselect()
{
    this._selected = false;

    this._check.alpha = 0.0;
};

/**
 * @class Pane
 * @extends {DisplayObjectContainer}
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} useMask
 * @constructor
 */
App.Pane = function Pane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio,useMask)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._content = null;
    this._contentHeight = 0;
    this._contentWidth = 0;
    this._contentBoundingBox = new App.Rectangle();
    this._useMask = useMask;
    this.hitArea = this.boundingBox;

    this._enabled = false;
    this._eventsRegistered = false;
    this._state = null;
    this._xOriginalScrollPolicy = xScrollPolicy;
    this._yOriginalScrollPolicy = yScrollPolicy;
    this._xScrollPolicy = xScrollPolicy;
    this._yScrollPolicy = yScrollPolicy;
    this._xScrollIndicator = new App.ScrollIndicator(App.Direction.X,pixelRatio);
    this._yScrollIndicator = new App.ScrollIndicator(App.Direction.Y,pixelRatio);

    this._mouseData = null;
    this._oldMouseX = 0.0;
    this._oldMouseY = 0.0;
    this._xSpeed = 0.0;//TODO Average speed to avoid 'jumps'?
    this._ySpeed = 0.0;
    this._xOffset = 0.0;
    this._yOffset = 0.0;
    this._friction = 0.9;
    this._dumpForce = 0.5;
    this._snapForce = 0.2;//TODO allow to disable snapping?

    if (this._useMask)
    {
        this._mask = new PIXI.Graphics();
        this.mask = this._mask;
        this.addChild(this._mask);
    }
};

App.Pane.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Pane.prototype.constructor = App.Pane;

/**
 * Set content of the pane
 *
 * @method setContent
 * @param {PIXI.DisplayObjectContainer} content
 */
App.Pane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = Math.round(this._content.height);
    this._contentWidth = Math.round(this._content.width);
    this._contentBoundingBox.width = this._contentWidth;
    this._contentBoundingBox.height = this._contentHeight;

    this.addChildAt(this._content,0);

    this._updateScrollers();
    if (this._useMask) this._updateMask();
};

/**
 * Remove content
 *
 * @method removeContent
 */
App.Pane.prototype.removeContent = function removeContent()
{
    if (this._content && this.contains(this._content))
    {
        this.removeChild(this._content);

        this._content = null;
    }
};

/**
 * Resize
 *
 * @param {number} width
 * @param {number} height
 */
App.Pane.prototype.resize = function resize(width,height)
{
    this.boundingBox.width = width || this.boundingBox.width;
    this.boundingBox.height = height || this.boundingBox.height;

    if (this._content)
    {
        this._contentHeight = Math.round(this._content.height);
        this._contentWidth = Math.round(this._content.width);
        this._contentBoundingBox.width = this._contentWidth;
        this._contentBoundingBox.height = this._contentHeight;

        this._checkPosition();

        this._updateScrollers();
        if (this._useMask) this._updateMask();
    }
};

/**
 * Return content bounding box
 * @returns {Rectangle|*}
 */
App.Pane.prototype.getContentBounds = function getContentBounds()
{
    return this._contentBoundingBox;
};

/**
 * Re-draw mask
 * @private
 */
App.Pane.prototype._updateMask = function _updateMask()
{
    App.GraphicUtils.drawRect(this._mask,0xff0000,1,0,0,this.boundingBox.width,this.boundingBox.height);
};

/**
 * Update content's x position
 * @param {number} position
 * @private
 */
App.Pane.prototype._updateX = function _updateX(position)
{
    this._content.x = Math.round(position);
};

/**
 * Update content's y position
 * @param {number} position
 * @private
 */
App.Pane.prototype._updateY = function _updateY(position)
{
    this._content.y = Math.round(position);
};

/**
 * Enable
 */
App.Pane.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        var ScrollPolicy = App.ScrollPolicy;
        if (this._xScrollPolicy !== ScrollPolicy.OFF || this._yScrollPolicy !== ScrollPolicy.OFF) this._registerEventListeners();

        this.interactive = true;

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Pane.prototype.disable = function disable()
{
    this._unRegisterEventListeners();

    this.cancelScroll();

    this._checkPosition();

    this.interactive = false;

    this._enabled = false;
};

/**
 * Reset content scroll
 */
App.Pane.prototype.resetScroll = function resetScroll()
{
    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    if (this._content)
    {
        this._updateX(0);
        this._updateY(0);

        this._xScrollIndicator.hide(true);
        this._yScrollIndicator.hide(true);
    }
};

/**
 * Cancel scroll
 */
App.Pane.prototype.cancelScroll = function cancelScroll()
{
    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._xScrollIndicator.hide(true);
    this._yScrollIndicator.hide(true);
};

/**
 * Register event listeners
 * @private
 */
App.Pane.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        if (App.Device.TOUCH_SUPPORTED)
        {
            this.touchstart = this._onPointerDown;
            this.touchend = this._onPointerUp;
            this.touchendoutside = this._onPointerUp;
            this.touchmove = this._onPointerMove;
        }
        else
        {
            this.mousedown = this._onPointerDown;
            this.mouseup = this._onPointerUp;
            this.mouseupoutside = this._onPointerUp;
            this.mousemove = this._onPointerMove;
        }

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
    }
};

/**
 * UnRegister event listeners
 * @private
 */
App.Pane.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = null;
        this.touchend = null;
        this.touchendoutside = null;
        this.touchmove = null;
    }
    else
    {
        this.mousedown = null;
        this.mouseup = null;
        this.mouseupoutside = null;
        this.mousemove = null;
    }

    this._eventsRegistered = false;
};

/**
 * Pointer Down handler
 *
 * @method _onPointerDown
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerDown = function _onPointerDown(data)
{
    //TODO make sure just one input is registered (multiple inputs on touch screens) ...

    this._mouseData = data;

    var mp = this._mouseData.getLocalPosition(this.stage);
    this._xOffset = mp.x - this._content.x;
    this._yOffset = mp.y - this._content.y;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._state = App.InteractiveState.DRAGGING;

    if (this._xScrollPolicy === App.ScrollPolicy.ON) this._xScrollIndicator.show();
    if (this._yScrollPolicy === App.ScrollPolicy.ON) this._yScrollIndicator.show();
};

/**
 * On pointer up
 *
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerUp = function _onPointerUp(data)
{
    if (this._isContentPulled())
    {
        this._state = App.InteractiveState.SNAPPING;
        this._xSpeed = 0.0;
        this._ySpeed = 0.0;
    }
    else
    {
        this._state = App.InteractiveState.SCROLLING;
    }

    this._mouseData = null;
};

/**
 * On pointer move
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerMove = function _onPointerMove(data)
{
    this._mouseData = data;
};

/**
 * Tick handler
 *
 * @private
 */
App.Pane.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;

    if (this._state === InteractiveState.DRAGGING) this._drag(App.ScrollPolicy);
    else if (this._state === InteractiveState.SCROLLING) this._scroll(App.ScrollPolicy,InteractiveState);
    else if (this._state === InteractiveState.SNAPPING) this._snap(App.ScrollPolicy,InteractiveState);

    if (this._xScrollIndicator.visible) this._xScrollIndicator.update(this._content.x);
    if (this._yScrollIndicator.visible) this._yScrollIndicator.update(this._content.y);
};

/**
 * Perform drag operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @private
 */
App.Pane.prototype._drag = function _drag(ScrollPolicy)
{
    var pullDistance = 0;

    if (this.stage)
    {
        if (this._xScrollPolicy === ScrollPolicy.ON)
        {
            var w = this.boundingBox.width,
                mouseX = this._mouseData.getLocalPosition(this.stage).x,
                contentX = this._content.x,
                contentRight = contentX + this._contentWidth,
                contentLeft = contentX - this._contentWidth;

            if (mouseX <= -10000) return;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentX > 0)
            {
                pullDistance = (1 - contentX / w) * this._dumpForce;
                this._updateX(mouseX * pullDistance - this._xOffset * pullDistance);
            }
            else if (contentRight < w)
            {
                pullDistance = (contentRight / w) * this._dumpForce;
                this._updateX(contentLeft - (w - mouseX) * pullDistance + (this._contentWidth - this._xOffset) * pullDistance);
            }
            else
            {
                this._updateX(mouseX - this._xOffset);
            }

            this._xSpeed = mouseX - this._oldMouseX;
            this._oldMouseX = mouseX;
        }

        if (this._yScrollPolicy === ScrollPolicy.ON)
        {
            var h = this.boundingBox.height,
                mouseY = this._mouseData.getLocalPosition(this.stage).y,
                contentY = this._content.y,
                contentBottom = contentY + this._contentHeight,
                contentTop = h - this._contentHeight;

            if (mouseY <= -10000) return;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentY > 0)
            {
                pullDistance = (1 - contentY / h) * this._dumpForce;
                this._updateY(mouseY * pullDistance - this._yOffset * pullDistance);
            }
            else if (contentBottom < h)
            {
                pullDistance = (contentBottom / h) * this._dumpForce;
                this._updateY(contentTop - (h - mouseY) * pullDistance + (this._contentHeight - this._yOffset) * pullDistance);
            }
            else
            {
                this._updateY(mouseY - this._yOffset);
            }

            this._ySpeed = mouseY - this._oldMouseY;
            this._oldMouseY = mouseY;
        }
    }
};

/**
 * Perform scroll operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @param {App.InteractiveState} InteractiveState
 * @private
 */
App.Pane.prototype._scroll = function _scroll(ScrollPolicy,InteractiveState)
{
    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        this._updateX(this._content.x + this._xSpeed);

        var w = this.boundingBox.width,
            contentX = this._content.x,
            contentRight = contentX + this._contentWidth;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentX > 0)
        {
            this._xSpeed *= (1 - contentX / w) * this._dumpForce;
        }
        else if (contentRight < w)
        {
            this._xSpeed *= (contentRight / w) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._xSpeed) < .1)
        {
            this._xSpeed = 0.0;
            this._state = null;
            this._xScrollIndicator.hide();

            if (contentX > 0 || contentRight < w) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._xSpeed *= this._friction;
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        this._updateY(this._content.y + this._ySpeed);

        var h = this.boundingBox.height,
            contentY = this._content.y,
            contentBottom = contentY + this._contentHeight;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentY > 0)
        {
            this._ySpeed *= (1 - contentY / h) * this._dumpForce;
        }
        else if (contentBottom < h)
        {
            this._ySpeed *= (contentBottom / h) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._ySpeed) < .1)
        {
            this._ySpeed = 0.0;
            this._state = null;
            this._yScrollIndicator.hide();

            if (contentY > 0 || contentBottom < h) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._ySpeed *= this._friction;
        }
    }
};

/**
 * Perform snap operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @private
 */
App.Pane.prototype._snap = function _snap(ScrollPolicy)
{
    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        var w = this.boundingBox.width,
            contentX = this._content.x,
            contentRight = contentX + this._contentWidth,
            contentLeft = contentX - this._contentWidth,
            result = contentX * this._snapForce;

        if (contentX > 0)
        {
            if (result < 5)
            {
                this._state = null;
                this._updateX(0);
                this._xScrollIndicator.hide();
            }
            else
            {
                this._updateX(result);
            }
        }
        else if (contentRight < w)
        {
            result = contentLeft + (contentX - contentLeft) * this._snapForce;
            if (result >= w - 5)
            {
                this._state = null;
                this._updateX(contentLeft);
                this._xScrollIndicator.hide();
            }
            else
            {
                this._updateX(result);
            }
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        var h = this.boundingBox.height,
            contentY = this._content.y,
            contentBottom = contentY + this._contentHeight,
            contentTop = h - this._contentHeight;

        if (contentY > 0)
        {
            result = contentY * this._snapForce;
            if (result < 5)
            {
                this._state = null;
                this._updateY(0);
                this._yScrollIndicator.hide();
            }
            else
            {
                this._updateY(result);
            }
        }
        else if (contentBottom < h)
        {
            result = contentTop + (contentY - contentTop) * this._snapForce;
            if (result >= contentTop - 5)
            {
                this._state = null;
                this._updateY(contentTop);
                this._yScrollIndicator.hide();
            }
            else
            {
                this._updateY(result);
            }
        }
    }
};

/**
 * Is content pulled
 * @returns {boolean}
 * @private
 */
App.Pane.prototype._isContentPulled = function _isContentPulled()
{
    if (this._contentHeight > this.boundingBox.height)
    {
        if (this._content.y > 0) return true;
        else if (this._content.y + this._contentHeight < this.boundingBox.height) return true;
    }

    if (this._contentWidth > this.boundingBox.width)
    {
        if (this._content.x > 0) return true;
        else if (this._content.x + this._contentWidth < this.boundingBox.width) return true;
    }

    return false;
};

/**
 * Update scroll indicators
 * @private
 */
App.Pane.prototype._updateScrollers = function _updateScrollers()
{
    var ScrollPolicy = App.ScrollPolicy,
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    if (this._xOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentWidth >= w)
        {
            this._xScrollPolicy = ScrollPolicy.ON;

            this._xScrollIndicator.resize(w,this._contentWidth);
            this._xScrollIndicator.x = h - this._xScrollIndicator.boundingBox.height;
            if (!this.contains(this._xScrollIndicator)) this.addChild(this._xScrollIndicator);
        }
        else
        {
            this._xScrollPolicy = ScrollPolicy.OFF;

            this._xScrollIndicator.hide();
            if (this.contains(this._xScrollIndicator)) this.removeChild(this._xScrollIndicator);
        }
    }

    if (this._yOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentHeight >= h)
        {
            this._yScrollPolicy = ScrollPolicy.ON;

            this._yScrollIndicator.resize(h,this._contentHeight);
            this._yScrollIndicator.x = w - this._yScrollIndicator.boundingBox.width;
            if (!this.contains(this._yScrollIndicator)) this.addChild(this._yScrollIndicator);
        }
        else
        {
            this._yScrollPolicy = ScrollPolicy.OFF;

            this._yScrollIndicator.hide();
            if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
        }
    }

    if (this._xScrollPolicy === ScrollPolicy.OFF && this._yScrollPolicy === ScrollPolicy.OFF) this._unRegisterEventListeners();
    else this._registerEventListeners();
};

/**
 * Check position
 * @private
 */
App.Pane.prototype._checkPosition = function _checkPosition()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height;

    if (this._contentWidth > w)
    {
        if (this._content.x > 0) this._updateX(0);
        else if (this._content.x + this._contentWidth < w) this._updateX(w - this._contentWidth);
    }
    else if (this._contentWidth <= w)
    {
        if (this._content.x !== 0) this._updateX(0);
    }

    if (this._contentHeight > h)
    {
        if (this._content.y > 0) this._updateY(0);
        else if (this._content.y + this._contentHeight < h) this._updateY(h - this._contentHeight);
    }
    else if (this._contentHeight <= h)
    {
        if (this._content.y !== 0) this._updateY(0);
    }
};

/**
 * @class InfiniteList
 * @extends DisplayObjectContainer
 * @param {Array} model
 * @param {Function} itemClass
 * @param {string} direction
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.InfiniteList = function InfiniteList(model,itemClass,direction,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var Direction = App.Direction,
        item = new itemClass(0,model[0],pixelRatio),
        itemSize = direction === Direction.X ? item.boundingBox.width : item.boundingBox.height,
        itemCount = direction === Direction.X ? Math.ceil(width / itemSize) + 1 : Math.ceil(height / itemSize) + 1,
        modelLength = model.length - 1,
        index = 0,
        i = 0;

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);
    this.hitArea = this.boundingBox;

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._model = model;
    this._itemClass = itemClass;//TODO use pool instead of classes?
    this._direction = direction;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._items = new Array(itemCount);
    this._itemSize = itemSize;
    this._selectedModelIndex = -1;

    this._enabled = false;
    this._state = null;
    this._mouseData = null;
    this._virtualPosition = 0;
    this._oldMousePosition = 0.0;
    this._speed = 0.0;
    this._offset = 0.0;
    this._friction = 0.9;

    for (;i<itemCount;i++,index++)
    {
        if(index > modelLength) index = 0;
        if (i > 0) item = new itemClass(index,model[index],pixelRatio);

        this._items[i] = item;
        this.addChild(item);
    }

    this._updateLayout(false);
};

App.InfiniteList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.InfiniteList.prototype.constructor = App.InfiniteList;

/**
 * Enable
 */
App.InfiniteList.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._enabled = true;

        this._registerEventListeners();

        this.interactive = true;
    }
};

/**
 * Disable
 */
App.InfiniteList.prototype.disable = function disable()
{
    this.interactive = false;

    this._unRegisterEventListeners();

    this._enabled = false;
};

/**
 * Find and select item under position passed in
 * @param {number} position
 * @returns {*}
 */
App.InfiniteList.prototype.selectItemByPosition = function selectItemByPosition(position)
{
    var i = 0,
        l = this._items.length,
        itemSize = this._itemSize,
        itemProperty = this._direction === App.Direction.X ? "x" : "y",
        item = null,
        itemPosition = 0;

    this._selectedModelIndex = -1;

    for (;i<l;)
    {
        item = this._items[i++];
        itemPosition = item[itemProperty];

        if (itemPosition <= position && itemPosition + itemSize > position)
        {
            this._selectedModelIndex = item.getModelIndex();
            break;
        }
    }

    for (i=0;i<l;) this._items[i++].select(this._selectedModelIndex);

    return item;
};

/**
 * Find and select item under position passed in
 * @param {string} value
 */
App.InfiniteList.prototype.selectItemByValue = function selectItemByValue(value)
{
    var i = 0,
        l = this._model.length;

    this._selectedModelIndex = -1;

    for (;i<l;i++)
    {
        if (this._model[i] === value)
        {
            this._selectedModelIndex = i;
            break;
        }
    }

    l = this._items.length;
    for (i=0;i<l;) this._items[i++].select(this._selectedModelIndex);
};

/**
 * Return selected model
 * @returns {*}
 */
App.InfiniteList.prototype.getSelectedValue = function getSelectedValue()
{
    return this._model[this._selectedModelIndex];
};

/**
 * Cancel scroll
 */
App.InfiniteList.prototype.cancelScroll = function cancelScroll()
{
    this._speed = 0.0;
    this._state = null;
};

/**
 * Register event listeners
 * @private
 */
App.InfiniteList.prototype._registerEventListeners = function _registerEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = this._onPointerDown;
        this.touchend = this._onPointerUp;
        this.touchendoutside = this._onPointerUp;
    }
    else
    {
        this.mousedown = this._onPointerDown;
        this.mouseup = this._onPointerUp;
        this.mouseupoutside = this._onPointerUp;
    }

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * UnRegister event listeners
 * @private
 */
App.InfiniteList.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = null;
        this.touchend = null;
        this.touchendoutside = null;
    }
    else
    {
        this.mousedown = null;
        this.mouseup = null;
        this.mouseupoutside = null;
    }
};

/**
 * REF Tick handler
 * @private
 */
App.InfiniteList.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;

    if (this._state === InteractiveState.DRAGGING) this._drag(App.Direction);
    else if (this._state === InteractiveState.SCROLLING) this._scroll(App.Direction);
};

/**
 * On pointer down
 * @param {InteractionData} data
 * @private
 */
App.InfiniteList.prototype._onPointerDown = function _onPointerDown(data)
{
    this._mouseData = data;

    var mousePosition = this._mouseData.getLocalPosition(this.stage).x;
    if (this._direction === App.Direction.Y) mousePosition = this._mouseData.getLocalPosition(this.stage).y;

    this._offset = mousePosition - this._virtualPosition;
    this._speed = 0.0;

    this._state = App.InteractiveState.DRAGGING;
};

/**
 * On pointer up
 * @param {InteractionData} data
 * @private
 */
App.InfiniteList.prototype._onPointerUp = function _onPointerUp(data)
{
    this._state = App.InteractiveState.SCROLLING;

    this._mouseData = null;
};

/**
 * Perform drag operation
 * @param {{X:string,Y:string}} Direction
 * @private
 */
App.InfiniteList.prototype._drag = function _drag(Direction)
{
    if (this.stage)
    {
        if (this._direction === Direction.X)
        {
            var mousePosition = this._mouseData.getLocalPosition(this.stage).x;

            if (mousePosition <= -10000) return;

            this._updateX(mousePosition - this._offset);
        }
        else if (this._direction === Direction.Y)
        {
            mousePosition = this._mouseData.getLocalPosition(this.stage).y;

            if (mousePosition <= -10000) return;

            this._updateY(mousePosition - this._offset);
        }

        this._speed = mousePosition - this._oldMousePosition;
        this._oldMousePosition = mousePosition;
    }
};

/**
 * Perform scroll operation
 *
 * @param {{X:string,Y:string}} Direction
 * @private
 */
App.InfiniteList.prototype._scroll = function _scroll(Direction)
{
    if (this._direction === Direction.X) this._updateX(this._virtualPosition + this._speed);
    else if (this._direction === Direction.Y) this._updateY(this._virtualPosition + this._speed);

    // If the speed is very low, stop it.
    if (Math.abs(this._speed) < 0.1)
    {
        this._speed = 0.0;
        this._state = null;
    }
    else
    {
        this._speed *= this._friction;
    }
};

/**
 * Update X position
 * @param {number} position
 * @private
 */
App.InfiniteList.prototype._updateX = function _updateX(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        itemSize = this._itemSize,
        width = this._width,
        positionDifference = position - this._virtualPosition,
        itemScreenIndex = 0,
        virtualIndex = Math.floor(position / itemSize),
        xIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        x = 0,
        item = null;

    this._virtualPosition = position;

    for (;i<l;)
    {
        item = this._items[i++];
        x = item.x + positionDifference;

        if (x + itemSize < 0 || x > width)
        {
            itemScreenIndex = -Math.floor(x / width);
            x += itemScreenIndex * l * itemSize;
            xIndex = Math.floor(x / itemSize);

            if (virtualIndex >= 0) modelIndex = (xIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (xIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;
            //TODO check that I don't set the model way too many times!
            item.setModel(modelIndex,this._model[modelIndex],this._selectedModelIndex);
        }

        item.x = x;
    }
};

/**
 * Update Y position
 * @param {number} position
 * @private
 */
App.InfiniteList.prototype._updateY = function _updateY(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        itemSize = this._itemSize,
        height = this._height,
        positionDifference = position - this._virtualPosition,
        itemScreenIndex = 0,
        virtualIndex = Math.floor(position / itemSize),
        yIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        y = 0,
        item = null;

    this._virtualPosition = position;

    for (;i<l;)
    {
        item = this._items[i++];
        y = item.y + positionDifference;

        if (y + itemSize < 0 || y > height)
        {
            itemScreenIndex = -Math.floor(y / height);
            y += itemScreenIndex * l * itemSize;
            yIndex = Math.floor(y / itemSize);

            if (virtualIndex >= 0) modelIndex = (yIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (yIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            item.setModel(modelIndex,this._model[modelIndex],this._selectedModelIndex);
        }

        item.y = y;
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 * @private
 */
App.InfiniteList.prototype._updateLayout = function _updateLayout(updatePosition)
{
    var i = 0,
        l = this._items.length,
        child = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            child = this._items[i++];
            child.x = position;
            position = Math.round(position + child.boundingBox.width);
        }

        if (updatePosition) this._updateX(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            child = this._items[i++];
            child.y = position;
            position = Math.round(position + child.boundingBox.height);
        }

        if (updatePosition) this._updateY(this.y);
    }
};

/**
 * Test if position passed in falls within this list boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.InfiniteList.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};

/**
 * Difference between VirtualList and InfiniteList is, that VirtualList doesn't repeat its items infinitely; it just scroll from first model to last.
 * Also, if there are less models than items items would fill, then VirtualList will not fill whole size and will not scroll
 *
 * @class VirtualList
 * @extends DisplayObjectContainer
 * @param {App.ObjectPool} itemPool
 * @param {string} direction
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.VirtualList = function VirtualList(itemPool,direction,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var item = itemPool.allocate(),
        itemSize = direction === App.Direction.X ? item.boundingBox.width : item.boundingBox.height;

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);

    this._model = null;
    this._itemPool = itemPool;
    this._direction = direction;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._items = [];
    this._itemSize = itemSize;
    this._virtualX = 0;
    this._virtualY = 0;

    itemPool.release(item);
};

App.VirtualList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.VirtualList.prototype.constructor = App.VirtualList;

/**
 * Find and select item under point passed in
 * @param {InteractionData} pointerData
 */
App.VirtualList.prototype.getItemUnderPoint = function getItemUnderPoint(pointerData)
{
    var position = pointerData.getLocalPosition(this).x,
        Direction = App.Direction,
        i = 0,
        l = this._items.length,
        size = 0,
        itemPosition = 0,
        item = null;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            itemPosition = item.x;
            size = item.boundingBox.width;
            if (itemPosition <= position && itemPosition + size >= position)
            {
                return item;
            }
        }
    }
    else if (this._direction === Direction.Y)
    {
        position = pointerData.getLocalPosition(this).y;

        for (;i<l;)
        {
            item = this._items[i++];
            itemPosition = item.y;
            size = item.boundingBox.height;
            if (itemPosition <= position && itemPosition + size >= position)
            {
                return item;
            }
        }
    }

    return null;
};

/**
 * Update X position
 * @param {number} position
 * @private
 */
App.VirtualList.prototype.updateX = function updateX(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        positionDifference = position - this._virtualX,
        virtualIndex = Math.floor(position / this._itemSize),
        itemScreenIndex = 0,
        xIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        maxEnd = l - 2,
        maxBeginning = modelLength - l,
        moveToEnd = false,
        moveToBeginning = false,
        itemX = 0,
        item = null;

    this._virtualX = position;

    for (;i<l;)
    {
        item = this._items[i++];
        itemX = item.x + positionDifference;
        moveToBeginning = itemX > this._width && positionDifference > 0;
        moveToEnd = itemX + this._itemSize < 0 && positionDifference < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(itemX / this._width);
            itemX += itemScreenIndex * l * this._itemSize;
            xIndex = Math.floor(itemX / this._itemSize);

            if (virtualIndex >= 0) modelIndex = (xIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (xIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            if ((moveToEnd && modelIndex > maxEnd) || (moveToBeginning && modelIndex < maxBeginning))
            {
                item.setModel(this._model[modelIndex]);
            }
            else
            {
                itemX = item.x + positionDifference;
            }
        }

        item.x = itemX;
    }
};

/**
 * Update Y position
 * @param {number} position
 * @private
 */
App.VirtualList.prototype.updateY = function updateY(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        positionDifference = position - this._virtualY,
        virtualIndex = Math.floor(position / this._itemSize),
        itemScreenIndex = 0,
        yIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        maxEnd = l - 2,
        maxBeginning = modelLength - l,
        moveToEnd = false,
        moveToBeginning = false,
        itemY = 0,
        item = null;

    this._virtualY = position;

    for (;i<l;)
    {
        item = this._items[i++];
        itemY = item.y + positionDifference;
        moveToBeginning = itemY > this._height && positionDifference > 0;
        moveToEnd = itemY + this._itemSize < 0 && positionDifference < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(itemY / this._height);
            itemY += itemScreenIndex * l * this._itemSize;
            yIndex = Math.floor(itemY / this._itemSize);

            if (virtualIndex >= 0) modelIndex = (yIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (yIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            if ((moveToEnd && modelIndex > maxEnd) || (moveToBeginning && modelIndex < maxBeginning))
            {
                item.setModel(this._model[modelIndex]);
            }
            else
            {
                itemY = item.y + positionDifference;
            }
        }

        item.y = itemY;
    }
};

/**
 * Reset scroll position
 */
App.VirtualList.prototype.reset = function reset()
{
    var Direction = App.Direction,
        position = 0,
        item = null,
        i = 0,
        l = this._items.length;

    if (this._direction === Direction.X)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.x = position;
            item.setModel(this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.y = position;
            item.setModel(this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
};

/**
 * Update
 * @param {Array.<App.transaction>} model
 */
App.VirtualList.prototype.update = function update(model)
{
    this._model = model;

    var Direction = App.Direction,
        itemCount = Math.ceil(this._width / this._itemSize) + 1,
        listSize = this._model.length * this._itemSize,
        item = null,
        position = 0,
        l = this._items.length,
        i = 0;

    this.boundingBox.width = listSize;
    this.boundingBox.height = this._height;

    // Reset scroll
    this._virtualX = 0;
    this._virtualY = 0;

    // Remove items
    for (;i<l;i++)
    {
        this._itemPool.release(this.removeChild(this._items[i]));
        this._items[i] = null;
    }
    this._items.length = 0;

    // And add items again, according to model
    if (this._direction === Direction.X)
    {
        if (itemCount > this._model.length) itemCount = this._model.length;

        for (i=0,l=itemCount;i<l;i++)
        {
            item = this._itemPool.allocate();
            item.x = position;
            item.setModel(this._model[i]);
            this._items.push(item);
            this.addChild(item);
            position = Math.round(position + this._itemSize);
        }
    }
    else if (this._direction === Direction.Y)
    {
        itemCount = Math.ceil(this._height / this._itemSize) + 1;
        this.boundingBox.width = this._width;
        this.boundingBox.height = listSize;

        if (itemCount > this._model.length) itemCount = this._model.length;

        for (i=0,l=itemCount;i<l;i++)
        {
            item = this._itemPool.allocate();
            item.y = position;
            item.setModel(this._model[i]);
            this._items.push(item);
            this.addChild(item);
            position = Math.round(position + this._itemSize);
        }
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 * @private
 */
App.VirtualList.prototype._updateLayout = function _updateLayout(updatePosition)
{
    var i = 0,
        l = this._items.length,
        item = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.x = position;
            position = Math.round(position + this._itemSize);
        }

        if (updatePosition) this.updateX(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.y = position;
            position = Math.round(position + this._itemSize);
        }

        if (updatePosition) this.updateY(this.y);
    }
};

/**
 * Return virtual property instead of real one
 *
 * @property x
 * @type Number
 */
Object.defineProperty(App.VirtualList.prototype,'x',{
    get: function() {
        return  this._virtualX;
    }
});

/**
 * Return virtual property instead of real one
 *
 * @property y
 * @type Number
 */
Object.defineProperty(App.VirtualList.prototype,'y',{
    get: function() {
        return  this._virtualY;
    }
});

/**
 * @class List
 * @extends DisplayObjectContainer
 * @param {string} direction
 * @constructor
 */
App.List = function List(direction)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new App.Rectangle();

    this._direction = direction;
    this._items = [];
};

App.List.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.List.prototype.constructor = App.List;

/**
 * Add item
 * @param {DisplayObject} item
 * @param {boolean} [updateLayout=false]
 * @returns {DisplayObject} returns item added
 */
App.List.prototype.add = function add(item,updateLayout)
{
    this._items[this._items.length] = item;

    this.addChild(item);

    if (updateLayout) this.updateLayout();

    return item;
};

/**
 * Remove item passed in
 * @param {DisplayObject} item
 */
App.List.prototype.remove = function remove(item)
{
    this.removeItemAt(this._items.indexOf(item));
};

/**
 * Remove item at index passed in
 * @param {number} index
 */
App.List.prototype.removeItemAt = function removeItemAt(index)
{
    var item = this._items.splice(index,1)[0];

    this.removeChild(item);

    return item;
};

/**
 * Return
 * @param {number} index
 */
App.List.prototype.getItemAt = function getItemAt(index)
{
    return this._items[index];
};

/**
 * Update layout
 */
App.List.prototype.updateLayout = function updateLayout()
{
    var i = 0,
        l = this._items.length,
        item = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.x = position;
            position = Math.round(position + item.boundingBox.width);
        }

        this.boundingBox.width = position;
        this.boundingBox.height = item.boundingBox.height;
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.y = position;
            position = Math.round(position + item.boundingBox.height);
        }

        this.boundingBox.height = position;
        this.boundingBox.width = item.boundingBox.width;
    }
};

/**
 * Find and return item under point passed in
 * @param {InteractionData} data PointerData to get the position from
 */
App.List.prototype.getItemUnderPoint = function getItemUnderPoint(data)
{
    var position = data.getLocalPosition(this).x,
        boundsProperty = "width",
        itemPosition = 0,
        itemProperty = "x",
        item = null,
        i = 0,
        l = this._items.length;

    if (this._direction === App.Direction.Y)
    {
        position = data.getLocalPosition(this).y;
        itemProperty = "y";
        boundsProperty = "height";
    }

    for (;i<l;)
    {
        item = this._items[i++];
        itemPosition = item[itemProperty];
        if (itemPosition <= position && itemPosition + item.boundingBox[boundsProperty] >= position)
        {
            return item;
        }
    }

    return null;
};

/**
 * Test if position passed in falls within this list boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.List.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};

/**
 * @property length
 * @type number
 */
Object.defineProperty(App.List.prototype,'length',{
    get:function()
    {
        return this._items.length;
    }
});

/**
 * @class TileList
 * @extends List
 * @param {string} direction
 * @param {number} windowSize
 * @constructor
 */
App.TileList = function TileList(direction,windowSize)
{
    App.List.call(this,direction);

    this._windowSize = windowSize;
};

App.TileList.prototype = Object.create(App.List.prototype);
App.TileList.prototype.constructor = App.TileList;

/**
 * Update X position
 * @param {number} position
 */
App.TileList.prototype.updateX = function updateX(position)
{
    this.x = Math.round(position);

    var i = 0,
        l = this._items.length,
        width = 0,
        childX = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        width = child.boundingBox.width;
        childX = this.x + child.x;

        child.visible = childX + width > 0 && childX < this._windowSize;
    }
};

/**
 * Update Y position
 * @param {number} position
 */
App.TileList.prototype.updateY = function updateY(position)
{
    this.y = Math.round(position);

    var i = 0,
        l = this._items.length,
        height = 0,
        childY = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        height = child.boundingBox.height;
        childY = this.y + child.y;

        child.visible = childY + height > 0 && childY < this._windowSize;
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 */
App.TileList.prototype.updateLayout = function updateLayout(updatePosition)
{
    App.List.prototype.updateLayout.call(this);

    if (updatePosition)
    {
        if (this._direction === App.Direction.X) this.updateX(this.x);
        else if (this._direction === App.Direction.Y) this.updateY(this.y);
    }
};

/**
 * @class TilePane
 * @extends Pane
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} useMask
 * @constructor
 */
App.TilePane = function TilePane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio,useMask)
{
    App.Pane.call(this,xScrollPolicy,yScrollPolicy,width,height,pixelRatio,useMask);
};

App.TilePane.prototype = Object.create(App.Pane.prototype);
App.TilePane.prototype.constructor = App.TilePane;

/**
 * Set content of the pane
 *
 * @method setContent
 * @param {TileList} content
 */
App.TilePane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = Math.round(this._content.boundingBox.height);
    this._contentWidth = Math.round(this._content.boundingBox.width);
    this._contentBoundingBox.width = this._contentWidth;
    this._contentBoundingBox.height = this._contentHeight;

    this.addChildAt(this._content,0);

    this._updateScrollers();
    if (this._useMask) this._updateMask();
};

/**
 * Resize
 *
 * @param {number} width
 * @param {number} height
 */
App.TilePane.prototype.resize = function resize(width,height)
{
    this.boundingBox.width = width || this.boundingBox.width;
    this.boundingBox.height = height || this.boundingBox.height;

    if (this._content)
    {
        this._contentHeight = Math.round(this._content.boundingBox.height);
        this._contentWidth = Math.round(this._content.boundingBox.width);
        this._contentBoundingBox.width = this._contentWidth;
        this._contentBoundingBox.height = this._contentHeight;

        this._checkPosition();

        this._updateScrollers();
        if (this._useMask) this._updateMask();
    }
};

/**
 * Update content's x position
 * @param {number} position
 * @private
 */
App.TilePane.prototype._updateX = function _updateX(position)
{
    this._content.updateX(position);
};

/**
 * Update content's y position
 * @param {number} position
 * @private
 */
App.TilePane.prototype._updateY = function _updateY(position)
{
    this._content.updateY(position);
};

/**
 * @class ViewStack
 * @extends DisplayObjectContainer
 * @param {Array} children
 * @param {boolean} [addToStage=false]
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ViewStack = function ViewStack(children,addToStage,eventListenerPool)
{
    PIXI.DisplayObjectContainer.call(this);

    this._children = [];
    this._selectedChild = null;
    this._selectedIndex = -1;
    this._childrenToHide = [];
    this._eventDispatcher = new App.EventDispatcher(eventListenerPool);

    if (children)
    {
        var i = 0, l = children.length;
        for (;i<l;) this.add(children[i++],addToStage);
    }
};

App.ViewStack.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ViewStack.prototype.constructor = App.ViewStack;

/**
 * Add child to stack
 *
 * @param {Screen} child
 * @param {boolean} [addToStage=false]
 */
App.ViewStack.prototype.add = function add(child,addToStage)
{
    this._children[this._children.length] = child;

    if (addToStage) this.addChild(child);
};

/**
 * Select child
 *
 * @param {Screen} child
 */
App.ViewStack.prototype.selectChild = function selectChild(child)
{
    if (this._selectedChild)
    {
        if (!child || this._selectedChild === child) return;

        this._childrenToHide[this._childrenToHide.length] = this._selectedChild;
    }

    var i = 0, l = this._children.length;
    for (;i<l;)
    {
        if (child === this._children[i++])
        {
            this._selectedChild = child;
            this._selectedIndex = i - 1;
            break;
        }
    }

    this._eventDispatcher.dispatchEvent(App.EventType.CHANGE);
};

/**
 * Select child by index passed in
 *
 * @param {number} index
 */
App.ViewStack.prototype.selectChildByIndex = function selectChildByIndex(index)
{
    if (index < 0 || index >= this._children.length) return;

    if (this._selectedChild)
    {
        if (this._selectedChild === this._children[index]) return;

        this._childrenToHide[this._childrenToHide.length] = this._selectedChild;
    }

    this._selectedChild = this._children[index];
    this._selectedIndex = index;

    this._eventDispatcher.dispatchEvent(App.EventType.CHANGE);
};

/**
 * Return selected child
 * @returns {Screen}
 */
App.ViewStack.prototype.getSelectedChild = function getSelectedChild()
{
    return this._selectedChild;
};

/**
 * Return index of selected child
 * @returns {number}
 */
App.ViewStack.prototype.getSelectedIndex = function getSelectedIndex()
{
    return this._selectedIndex;
};

/**
 * Return child by index passed in
 * @param {number} index
 * @returns {Screen|null}
 */
App.ViewStack.prototype.getChildByIndex = function getChildByIndex(index)
{
    if (index < 0 || index >= this._children.length) return null;

    return this._children[index];
};

/**
 * Show
 */
App.ViewStack.prototype.show = function show()
{
    if (this._selectedChild)
    {
        // First check if the child to show is not actually hiding
        var i = 0, l = this._childrenToHide.length;
        for (;i<l;i++)
        {
            if (this._selectedChild === this._childrenToHide[i])
            {
                this._selectedChild.removeEventListener(App.EventType.COMPLETE,this,this._onHideComplete);
                this._childrenToHide.splice(i,1);
                break;
            }
        }

        if (!this.contains(this._selectedChild)) this.addChild(this._selectedChild);

        this._selectedChild.show();
    }
};

/**
 * Hide
 */
App.ViewStack.prototype.hide = function hide()
{
    var i = 0, l = this._childrenToHide.length, child = null, EventType = App.EventType;
    for (;i<l;)
    {
        child = this._childrenToHide[i++];

        child.addEventListener(EventType.COMPLETE,this,this._onHideComplete);
        child.hide();
    }
};

/**
 * On hide complete
 * @param {{target:Screen,state:string}} data
 * @private
 */
App.ViewStack.prototype._onHideComplete = function _onHideComplete(data)
{
    if (data.state === App.TransitionState.HIDDEN)
    {
        /**@type Screen */
        var screen = data.target;

        screen.removeEventListener(App.EventType.COMPLETE,this,this._onHideComplete);

        if (this.contains(screen)) this.removeChild(screen);

        var i = 0, l = this._childrenToHide.length;
        for (;i<l;i++)
        {
            if (screen === this._childrenToHide[i])
            {
                this._childrenToHide.splice(i,1);
                break;
            }
        }
    }
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ViewStack.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ViewStack.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * @class ListHeader
 * @param {string} label
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.ListHeader = function ListHeader(label,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    this._width = width;
    this._pixelRatio = pixelRatio;
    this._textField = new PIXI.Text(label,App.FontStyle.get(12,App.FontStyle.GREY_DARKER));

    this._render();

    this.addChild(this._textField);
};

App.ListHeader.prototype = Object.create(PIXI.Graphics.prototype);
App.ListHeader.prototype.constructor = App.ListHeader;

/**
 * Render
 * @private
 */
App.ListHeader.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        h = Math.round(30 * this._pixelRatio);

    GraphicUtils.drawRect(this,ColorTheme.GREY_DARK,1,0,0,this._width,h);

    this._textField.x = Math.round((this._width - this._textField.width) / 2);
    this._textField.y = Math.round((h - this._textField.height) / 2);
};

/**
 * @class AddNewButton
 * @extends DisplayObjectContainer
 * @param {string} label
 * @param {{font:string,fill:string}} fontStyle
 * @param {Texture} skin
 * @param {number} pixelRatio
 * @constructor
 */
App.AddNewButton = function AddNewButton(label,fontStyle,skin,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new App.Rectangle(0,0,skin.width,skin.height);

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._skin = new PIXI.Sprite(skin);
    this._icon = PIXI.Sprite.fromFrame("plus-app");
    this._iconResizeRatio = Math.round(20 * pixelRatio) / this._icon.height;
    this._labelField = new PIXI.Text(label,fontStyle);

    this._render();

    this.addChild(this._skin);
    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.AddNewButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.AddNewButton.prototype.constructor = App.AddNewButton;

/**
 * Render
 * @private
 */
App.AddNewButton.prototype._render = function _render()
{
    var gap = Math.round(10 * this._pixelRatio),
        h = this.boundingBox.height,
        position = 0;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;

    position = Math.round((this.boundingBox.width - (this._labelField.width + gap + this._icon.width)) / 2);

    this._icon.x = position;
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = App.ColorTheme.GREY_DARK;

    this._labelField.x = position + this._icon.width + gap;
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
};

/**
 * @class SwipeButton
 * @extends DisplayObjectContainer
 * @param {number} width
 * @param {number} openOffset
 * @constructor
 */
App.SwipeButton = function SwipeButton(width,openOffset)
{
    PIXI.DisplayObjectContainer.call(this);

    this._width = width;
    this._interactionEnabled = false;
    this._interactiveState = null;
    this._dragFriction = 0.5;
    this._snapForce = 0.5;
    this._openOffset = openOffset;
    this._isOpen = false;
    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
};

App.SwipeButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.SwipeButton.prototype.constructor = App.SwipeButton;

/**
 * Disable
 */
App.SwipeButton.prototype.disable = function disable()
{
    this._disableInteraction();
    this.close(true);
};

/**
 * Enable interaction
 * @private
 */
App.SwipeButton.prototype._enableInteraction = function _enableInteraction()
{
    if (!this._interactionEnabled)
    {
        this._interactionEnabled = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this.interactive = true;
    }
};

/**
 * Disable interaction
 * @private
 */
App.SwipeButton.prototype._disableInteraction = function _disableInteraction()
{
    this.interactive = false;

    this._interactiveState = null;

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._interactionEnabled = false;
};

/**
 * Tick handler
 * @private
 */
App.SwipeButton.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;
    if (this._interactiveState === InteractiveState.SWIPING) this._swipe();
    else if (this._interactiveState === InteractiveState.SNAPPING) this._snap();
};

/**
 * @method swipeStart
 * @param {string} direction
 */
App.SwipeButton.prototype.swipeStart = function swipeStart(direction)
{
    var Direction = App.Direction,
        InteractiveState = App.InteractiveState;

    if (!this._interactiveState)
    {
        if (!this._isOpen && direction === Direction.LEFT)
        {
            this._interactiveState = InteractiveState.SWIPING;
            this._enableInteraction();
        }
        else if (this._isOpen && direction === Direction.RIGHT)
        {
            this._interactiveState = InteractiveState.SNAPPING;
            this._enableInteraction();
        }
    }
};

/**
 * @method swipeEnd
 */
App.SwipeButton.prototype.swipeEnd = function swipeEnd()
{
    if (this._interactiveState === App.InteractiveState.SWIPING) this._interactiveState = App.InteractiveState.SNAPPING;
};

/**
 * @method _swipe
 * @private
 */
App.SwipeButton.prototype._swipe = function _swipe()
{
    if (this.stage && !this._isOpen)
    {
        var x = this.stage.getTouchPosition().x;

        if (x <= -10000) return;

        this._updateSwipePosition(-Math.round(this._width * (1 - (x / this._width)) * this._dragFriction));
    }
};

/**
 * @method _snap
 * @private
 */
App.SwipeButton.prototype._snap = function _snap()
{
    var swipePosition = this._getSwipePosition(),
        result = Math.round(swipePosition * this._snapForce);

    // Snap to open
    if (swipePosition < -this._openOffset)
    {
        if (result >= -this._openOffset)
        {
            this._isOpen = true;
            this._disableInteraction();

            this._updateSwipePosition(-this._openOffset);
        }
        else
        {
            this._updateSwipePosition(result);
        }
    }
    // Snap to close
    else
    {
        if (result >= -1)
        {
            this._isOpen = false;
            this._disableInteraction();

            this._updateSwipePosition(0);
        }
        else
        {
            this._updateSwipePosition(result);
        }
    }
};

/**
 * Close Edit button
 * @param {boolean} [immediate=false]
 */
App.SwipeButton.prototype.close = function close(immediate)
{
    if (this._isOpen)
    {
        if (immediate)
        {
            this._updateSwipePosition(0);
            this._isOpen = false;
        }
        else
        {
            this._interactiveState = App.InteractiveState.SNAPPING;
            this._enableInteraction();
        }
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.SwipeButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    // Abstract
};

/**
 * Return swipe position
 * @private
 */
App.SwipeButton.prototype._getSwipePosition = function _getSwipePosition()
{
    // Abstract
};

/**
 * @class ExpandButton
 * @extends DisplayObjectContainer
 * @param {number} width
 * @param {number} height
 * @param {boolean} useMask
 * @constructor
 */
App.ExpandButton = function ExpandButton(width,height,useMask)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        eventListenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._content = null;
    this._contentHeight = height;
    this._buttonHeight = height;
    this._useMask = useMask;

    this._eventsRegistered = false;
    this._transitionState = App.TransitionState.CLOSED;
    this._expandTween = new App.TweenProxy(0.4,App.Easing.outExpo,0,eventListenerPool);
    this._eventDispatcher = new App.EventDispatcher(eventListenerPool);
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);

    if (this._useMask)
    {
        this._mask = new PIXI.Graphics();
        this.mask = this._mask;
        this._updateMask();
        this.addChild(this._mask);
    }
};

App.ExpandButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ExpandButton.prototype.constructor = App.ExpandButton;

/**
 * Set content
 * @param {Object} content
 * @private
 */
App.ExpandButton.prototype._setContent = function _setContent(content)
{
    this._content = content;
    this._contentHeight = this._content.boundingBox ? this._content.boundingBox.height : this._content.height;

    this._content.visible = false;
    this._content.y = this._buttonHeight;
};

/**
 * Enable interaction
 * @private
 */
App.ExpandButton.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._expandTween.addEventListener(App.EventType.COMPLETE,this,this._onTransitionComplete);
    }
};

/**
 * Disable interaction
 * @private
 */
App.ExpandButton.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._expandTween.removeEventListener(App.EventType.COMPLETE,this,this._onTransitionComplete);

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._eventsRegistered = false;
};

/**
 * Tick handler
 * @private
 */
App.ExpandButton.prototype._onTick = function _onTick()
{
    if (this._expandTween.isRunning()) this._updateTransition();
};

/**
 * Update transition
 * @private
 */
App.ExpandButton.prototype._updateTransition = function _updateTransition()
{
    this._updateBounds(false);
    if (this._useMask) this._updateMask();

//    this._eventDispatcher.dispatchEvent(App.EventType.LAYOUT_UPDATE);
};

/**
 * On transition complete
 * @private
 */
App.ExpandButton.prototype._onTransitionComplete = function _onTransitionComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.OPENING)
    {
        this._transitionState = TransitionState.OPEN;
    }
    else if (this._transitionState === TransitionState.CLOSING)
    {
        this._transitionState = TransitionState.CLOSED;

        this._content.visible = false;
    }

    this._unRegisterEventListeners();

    this._updateBounds(false);
    if (this._useMask) this._updateMask();

    if (!this.isInTransition()) this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Update bounds
 * @param {boolean} [updateContent=false]
 * @private
 */
App.ExpandButton.prototype._updateBounds = function _updateBounds(updateContent)
{
    var TransitionState = App.TransitionState;

    if (updateContent)
    {
        this._contentHeight = this._content.boundingBox ? this._content.boundingBox.height : this._content.height;
    }

    if (this._transitionState === TransitionState.OPENING)
    {
        this.boundingBox.height = Math.round(this._buttonHeight + this._contentHeight * this._expandTween.progress);
    }
    else if (this._transitionState === TransitionState.OPEN)
    {
        this.boundingBox.height = this._buttonHeight + this._contentHeight;
    }
    else if (this._transitionState === TransitionState.CLOSING)
    {
        this.boundingBox.height = Math.round(this._buttonHeight + this._contentHeight * (1 - this._expandTween.progress));
    }
    else if (this._transitionState === TransitionState.CLOSED)
    {
        this.boundingBox.height = this._buttonHeight;
    }
};

/**
 * Re-draw mask
 * @private
 */
App.ExpandButton.prototype._updateMask = function _updateMask()
{
    App.GraphicUtils.drawRect(this._mask,0xff0000,1,0,0,this.boundingBox.width,this.boundingBox.height);
};

/**
 * Click handler
 * @param {Point} position
 */
App.ExpandButton.prototype.onClick = function onClick(position)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open();
    else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close();
};

/**
 * Check if its open
 * @returns {boolean}
 */
App.ExpandButton.prototype.isOpen = function isOpen()
{
    return this._transitionState !== App.TransitionState.CLOSED;
};

/**
 * Check if button is in transition
 * @returns {boolean}
 */
App.ExpandButton.prototype.isInTransition = function isInTransition()
{
    return this._transitionState === App.TransitionState.OPENING || this._transitionState === App.TransitionState.CLOSING;
};

/**
 * Open
 */
App.ExpandButton.prototype.open = function open()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
    {
        this._registerEventListeners();

        this._content.visible = true;

        this._transitionState = TransitionState.OPENING;

        this._expandTween.restart();

        //this._eventDispatcher.dispatchEvent(App.EventType.START,this);
    }
};

/**
 * Close
 * @param {boolean} [immediate=false]
 */
App.ExpandButton.prototype.close = function close(immediate)
{
    var TransitionState = App.TransitionState,
        EventType = App.EventType;

    if (immediate)
    {
        this._transitionState = TransitionState.CLOSING;

        this._expandTween.stop();

        this._onTransitionComplete();
    }
    else
    {
        if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
        {
            this._registerEventListeners();

            this._transitionState = TransitionState.CLOSING;

            this._expandTween.start(true);

            //this._eventDispatcher.dispatchEvent(EventType.START,this);
        }
        else
        {
            // Already closed - but dispatch event so parent can cancel its processes
            this._eventDispatcher.dispatchEvent(EventType.COMPLETE,this);
        }
    }
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ExpandButton.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ExpandButton.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * @class PopUpButton
 * @extend Graphics
 * @param {string} label
 * @param {string} message
 * @param {{width:number,height:number,pixelRatio:number,popUpLayout:{x:number,y:number,width:number,height:number,overlayWidth:number,overlayHeight:number}}} options
 * @constructor
 */
App.PopUpButton = function PopUpButton(label,message,options)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Button = App.Button,
        Graphics = PIXI.Graphics,
        FontStyle = App.FontStyle,
        ColorTheme = App.ColorTheme,
        r = options.pixelRatio,
        w = options.width;

    this.boundingBox = new App.Rectangle(0,0,w,options.height);

    this._pixelRatio = r;
    this._popUpLayout = options.popUpLayout;
    this._backgroundColor = ColorTheme.RED;
    this._transitionState = App.TransitionState.HIDDEN;
    this._eventsRegistered = App.EventLevel.NONE;

    this._overlay = this.addChild(new Graphics());
    this._container = this.addChild(new Graphics());
    this._popUpBackground = this._container.addChild(new Graphics());
    this._labelField = this._container.addChild(new PIXI.Text(label,FontStyle.get(18,FontStyle.WHITE)));
    this._messageField = this._container.addChild(new PIXI.Text(message,FontStyle.get(18,FontStyle.BLUE,"center",FontStyle.LIGHT_CONDENSED)));
    this._cancelButton = this._container.addChild(new Button("Cancel",{
        width:w,
        height:Math.round(50*r),
        pixelRatio:r,
        style:FontStyle.get(18,FontStyle.BLACK_LIGHT,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:ColorTheme.GREY_DARK
    }));
    this._confirmButton = this._container.addChild(new Button("Delete",{
        width:w,
        height:Math.round(30*r),
        pixelRatio:r,
        style:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:ColorTheme.RED
    }));
    this._containerMask = this._container.addChild(new Graphics());
    this._container.mask = this._containerMask;

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._tween = new App.TweenProxy(0.3,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this._updateLayout(0);
};

App.PopUpButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.PopUpButton.prototype.constructor = App.PopUpButton;

/**
 * Set position
 * @param {number} x
 * @param {number} y
 */
App.PopUpButton.prototype.setPosition = function setPosition(x,y)
{
    this.boundingBox.x = x;
    this.boundingBox.y = y;

    this.x = x;
    this.y = y;

    this._overlay.x = -x;
    this._overlay.y = -y;
};

/**
 * Set message
 * @param {string} message
 */
App.PopUpButton.prototype.setMessage = function setMessage(message)
{
    this._messageField.setText(message);
};

/**
 * Set popUp layout
 * @param {number} x
 * @param {number} y
 * @param {number} overlayWidth
 * @param {number} overlayHeight
 * @param {number} width
 * @param {number} height
 */
App.PopUpButton.prototype.setPopUpLayout = function setPopUpLayout(x,y,overlayWidth,overlayHeight,width,height)
{
    this._popUpLayout.overlayWidth = overlayWidth || this._popUpLayout.overlayWidth;
    this._popUpLayout.overlayHeight = overlayHeight || this._popUpLayout.overlayHeight;
    this._popUpLayout.width = width || this._popUpLayout.width;
    this._popUpLayout.height = height || this._popUpLayout.height;
    this._popUpLayout.x = x || this._popUpLayout.x;
    this._popUpLayout.y = this._popUpLayout.height / 2 - this.boundingBox.y - y;
};

/**
 * Show popUp
 */
App.PopUpButton.prototype.showPopUp = function showPopUp()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN || this._transitionState === TransitionState.HIDING)
    {
        this._registerEventListeners(App.EventLevel.LEVEL_1);

        this._onShowStart();

        this._transitionState = TransitionState.SHOWING;

        this._tween.restart();
    }
};

/**
 * Hide popUp
 * @param {boolean} immediate
 */
App.PopUpButton.prototype.hidePopUp = function hidePopUp(immediate)
{
    var TransitionState = App.TransitionState;

    if (immediate)
    {
        this._unRegisterEventListeners(App.EventLevel.LEVEL_2);

        this._transitionState = TransitionState.HIDDEN;

        this._tween.stop();

        this._updateLayout(0);
        this._onHideComplete();
    }
    else
    {
        if (this._transitionState === TransitionState.SHOWN || this._transitionState === TransitionState.SHOWING)
        {
            this._unRegisterEventListeners(App.EventLevel.LEVEL_2);

            this._transitionState = TransitionState.HIDING;

            this._tween.start(true);
        }
    }
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.PopUpButton.prototype._registerEventListeners = function _registerEventListeners(level)
{
    var EventLevel = App.EventLevel;

    if (level === EventLevel.LEVEL_1 && this._eventsRegistered !== EventLevel.LEVEL_1)
    {
        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._tween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
    }

    if (level === EventLevel.LEVEL_2 && this._eventsRegistered !== EventLevel.LEVEL_2)
    {
        if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
        else this.click = this._onClick;

        this.interactive = true;
    }

    this._eventsRegistered = level;
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.PopUpButton.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    var EventLevel = App.EventLevel;

    if (level === EventLevel.LEVEL_1)
    {
        this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

        this._tween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

        this._eventsRegistered = EventLevel.NONE;
    }

    if (level === EventLevel.LEVEL_2)
    {
        this.interactive = false;

        if (App.Device.TOUCH_SUPPORTED) this.tap = null;
        else this.click = null;

        this._eventsRegistered = EventLevel.LEVEL_1;
    }
};

/**
 * Click handler
 * @param {PIXI.InteractionData} data
 * @private
 */
App.PopUpButton.prototype._onClick = function _onClick(data)
{
    var position = this.stage.getTouchData().getLocalPosition(this._container);

    if (this._cancelButton.hitTest(position)) this._eventDispatcher.dispatchEvent(App.EventType.CANCEL);
    else if (this._confirmButton.hitTest(position)) this._eventDispatcher.dispatchEvent(App.EventType.CONFIRM);
};

/**
 * On tick
 * @private
 */
App.PopUpButton.prototype._onTick = function _onTick()
{
    if (this._tween.isRunning())
    {
        var TransitionState = App.TransitionState;

        if (this._transitionState === TransitionState.SHOWING) this._updateLayout(this._tween.progress);
        else if (this._transitionState === TransitionState.HIDING) this._updateLayout(1.0 - this._tween.progress);
    }
};

/**
 * On show start
 * @private
 */
App.PopUpButton.prototype._onShowStart = function _onShowStart()
{
    var padding = Math.round(10 * this._pixelRatio);

    this._cancelButton.x = padding;
    this._confirmButton.x = padding;

    App.GraphicUtils.drawRect(this._overlay,App.ColorTheme.BLUE,1,0,0,this._popUpLayout.overlayWidth,this._popUpLayout.overlayHeight);
    this._overlay.alpha = 0.0;
    this._overlay.visible = true;

    this._popUpBackground.alpha = 0.0;
    this._popUpBackground.visible = true;

    this._messageField.alpha = 0.0;
    this._messageField.visible = true;

    this._cancelButton.alpha = 0.0;
    this._cancelButton.visible = true;

    this._confirmButton.alpha = 0.0;
    this._confirmButton.visible = true;
};

/**
 * Update layout
 * @param {number} progress
 * @private
 */
App.PopUpButton.prototype._updateLayout = function _updateLayout(progress)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        bw = this.boundingBox.width,
        bh = this.boundingBox.height,
        w = Math.round(bw + (this._popUpLayout.width - bw) * progress),
        h = Math.round(bh + (this._popUpLayout.height - bh) * progress),
        padding = Math.round(10 * r),
        radius = Math.round(5 * r),
        buttonWidth = Math.round(w - padding * 2),
        buttonsHeight = this._cancelButton.boundingBox.height + this._confirmButton.boundingBox.height + padding;

    GraphicUtils.drawRect(this._containerMask,ColorTheme.BLACK,1,0,0,w,h);
    GraphicUtils.drawRoundedRect(this._container,ColorTheme.RED,1,0,0,w,h,radius);
    GraphicUtils.drawRoundedRect(this._popUpBackground,ColorTheme.GREY,1,0,0,w,h,radius);

    this._container.x = Math.round(this._popUpLayout.x * progress);
    this._container.y = Math.round(this._popUpLayout.y * progress);

    this._cancelButton.resize(buttonWidth);
    this._cancelButton.y = h - buttonsHeight - padding;
    this._confirmButton.resize(buttonWidth);
    this._confirmButton.y = this._cancelButton.y + this._cancelButton.boundingBox.height + padding;

    this._labelField.x = Math.round((w - this._labelField.width) / 2);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
    this._messageField.x = Math.round((w - this._messageField.width) / 2);
    this._messageField.y = Math.round((h - buttonsHeight - padding - this._messageField.height) / 2);

    this._overlay.alpha = 0.8 * progress;
    this._popUpBackground.alpha = progress;
    this._messageField.alpha = progress;
    this._cancelButton.alpha = progress;
    this._confirmButton.alpha = progress;
    this._labelField.alpha = 1.0 - progress;
};

/**
 * On tween complete
 * @private
 */
App.PopUpButton.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.SHOWN;

        this._registerEventListeners(App.EventLevel.LEVEL_2);

        this._updateLayout(1);
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.HIDDEN;

        this._updateLayout(0);

        this._onHideComplete();
    }
};

/**
 * On hide complete
 * @private
 */
App.PopUpButton.prototype._onHideComplete = function _onHideComplete()
{
    this._unRegisterEventListeners(App.EventLevel.LEVEL_1);

    this._overlay.visible = false;
    this._popUpBackground.visible = false;
    this._messageField.visible = false;
    this._cancelButton.visible = false;
    this._confirmButton.visible = false;

    this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,{target:this,state:this._transitionState});
};

/**
 * Test if position passed in falls within this input boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.PopUpButton.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.PopUpButton.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.PopUpButton.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Abstract Screen
 *
 * @class Screen
 * @extends DisplayObjectContainer
 * @param {Object} layout
 * @param {number} tweenDuration
 * @constructor
 */
App.Screen = function Screen(layout,tweenDuration)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        pixelRatio = layout.pixelRatio;

    this._model = null;
    this._layout = layout;
    this._enabled = false;
    this._eventsRegistered = App.EventLevel.NONE;

    this._transitionState = App.TransitionState.HIDDEN;
    this._interactiveState = null;
    this._mouseDownPosition = null;
    this._mouseX = 0.0;
    this._mouseY = 0.0;
    this._leftSwipeThreshold = 15 * pixelRatio;
    this._rightSwipeThreshold = 5 * pixelRatio;
    this._clickThreshold = 5 * pixelRatio;
    this._swipeEnabled = false;
    this._preferScroll = true;
    this._mode = App.ScreenMode.DEFAULT;

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._showHideTween = new App.TweenProxy(tweenDuration,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this.alpha = 0.0;
};

App.Screen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Screen.prototype.constructor = App.Screen;

/**
 * Show
 */
App.Screen.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN || this._transitionState === TransitionState.HIDING)
    {
        this.enable();

        this._transitionState = TransitionState.SHOWING;

        this._showHideTween.restart();

        this.visible = true;
    }
};

/**
 * Hide
 */
App.Screen.prototype.hide = function hide()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWN || this._transitionState === TransitionState.SHOWING)
    {
        this.disable();

        this._transitionState = TransitionState.HIDING;

        this._showHideTween.start(true);
    }
};

/**
 * Enable
 */
App.Screen.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._registerEventListeners(App.EventLevel.LEVEL_1);

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Screen.prototype.disable = function disable()
{
    this._unRegisterEventListeners(App.EventLevel.LEVEL_2);

    this._enabled = false;

    this._interactiveState = null;
};

/**
 * Update
 * @private
 */
App.Screen.prototype.update = function update(data,mode)
{
    this._mode = mode;
    //TODO mark layout/UI as 'dirty' and update/render on Tick event
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Screen.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Screen.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.Screen.prototype._registerEventListeners = function _registerEventListeners(level)
{
    var EventLevel = App.EventLevel;

    if (level === EventLevel.LEVEL_1 && this._eventsRegistered !== EventLevel.LEVEL_1)
    {
        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._showHideTween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
    }

    if (level === EventLevel.LEVEL_2 && this._eventsRegistered !== EventLevel.LEVEL_2)
    {
        if (App.Device.TOUCH_SUPPORTED)
        {
            this.touchstart = this._onPointerDown;
            this.touchend = this._onPointerUp;
            this.touchendoutside = this._onPointerUp;
        }
        else
        {
            this.mousedown = this._onPointerDown;
            this.mouseup = this._onPointerUp;
            this.mouseupoutside = this._onPointerUp;
        }

        App.ViewLocator.getViewSegment(App.ViewName.HEADER).addEventListener(App.EventType.CLICK,this,this._onHeaderClick);

        this.interactive = true;
    }

    this._eventsRegistered = level;
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.Screen.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    var EventLevel = App.EventLevel;

    if (level === EventLevel.LEVEL_1)
    {
        this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

        this._showHideTween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

        this._eventsRegistered = EventLevel.NONE;
    }

    if (level === EventLevel.LEVEL_2)
    {
        this.interactive = false;

        App.ViewLocator.getViewSegment(App.ViewName.HEADER).removeEventListener(App.EventType.CLICK,this,this._onHeaderClick);

        if (App.Device.TOUCH_SUPPORTED)
        {
            this.touchstart = null;
            this.touchend = null;
            this.touchendoutside = null;
        }
        else
        {
            this.mousedown = null;
            this.mouseup = null;
            this.mouseupoutside = null;
        }

        this._eventsRegistered = EventLevel.LEVEL_1;
    }
};

/**
 * On tick
 * @private
 */
App.Screen.prototype._onTick = function _onTick()
{
    if (this._showHideTween.isRunning())
    {
        var TransitionState = App.TransitionState;

        if (this._transitionState === TransitionState.SHOWING) this.alpha = this._showHideTween.progress;
        else if (this._transitionState === TransitionState.HIDING) this.alpha = 1.0 - this._showHideTween.progress;
    }

    if (this._swipeEnabled && this._interactiveState === App.InteractiveState.DRAGGING) this._drag();
};

/**
 * On tween complete
 * @private
 */
App.Screen.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.SHOWN;

        this.alpha = 1.0;

        this._registerEventListeners(App.EventLevel.LEVEL_2);
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.HIDDEN;

        this._unRegisterEventListeners(App.EventLevel.LEVEL_1);

        this.alpha = 0.0;

        this.visible = false;

        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,{target:this,state:this._transitionState});
    }
};

/**
 * On pointer down
 *
 * @param {Object} data
 * @private
 */
App.Screen.prototype._onPointerDown = function _onPointerDown(data)
{
    if (this.stage)
    {
        this._mouseDownPosition = data.getLocalPosition(this.stage);
        this._mouseX = this._mouseDownPosition.x;
        this._mouseY = this._mouseDownPosition.y;
    }

    if (this._swipeEnabled) this._interactiveState = App.InteractiveState.DRAGGING;
};

/**
 * On pointer up
 * @param {Object} data
 * @private
 */
App.Screen.prototype._onPointerUp = function _onPointerUp(data)
{
    if (this._swipeEnabled)
    {
        if (this._interactiveState === App.InteractiveState.SWIPING) this._swipeEnd();
        this._interactiveState = null;
    }

    if (this.stage && this._mouseDownPosition && this._enabled)
    {
        var oldX = this._mouseDownPosition.x,
            oldY = this._mouseDownPosition.y;

        this._mouseDownPosition = data.getLocalPosition(this.stage,this._mouseDownPosition);

        var dx = oldX - this._mouseDownPosition.x,
            dy = oldY - this._mouseDownPosition.y,
            dist = dx * dx - dy * dy,
            TransitionState = App.TransitionState;

        if (Math.abs(dist) < this._clickThreshold && (this._transitionState === TransitionState.SHOWING || this._transitionState === TransitionState.SHOWN)) this._onClick();

        this._mouseDownPosition = null;
    }
};

/**
 * Drag
 * @private
 */
App.Screen.prototype._drag = function _drag()
{
    var InteractiveState = App.InteractiveState;

    if (this._interactiveState === InteractiveState.DRAGGING)
    {
        if (this.stage && this._mouseX)
        {
            var position = this.stage.getTouchPosition(),
                newX = position.x,
                newY = position.y;

            if (this._mouseX - newX > this._leftSwipeThreshold)
            {
                this._interactiveState = InteractiveState.SWIPING;
                this._swipeStart(Math.abs(this._mouseY-newY) > Math.abs(this._mouseX-newX) && this._preferScroll,App.Direction.LEFT);
            }
            else if (newX - this._mouseX > this._rightSwipeThreshold)
            {
                this._interactiveState = InteractiveState.SWIPING;
                this._swipeStart(Math.abs(this._mouseY-newY) > Math.abs(this._mouseX-newX) && this._preferScroll,App.Direction.RIGHT);
            }

            this._mouseX = newX;
            this._mouseY = newY;
        }
    }
};

/**
 * Click handler
 * @private
 */
App.Screen.prototype._onClick = function _onClick()
{
    this._eventDispatcher.dispatchEvent(App.EventType.CLICK);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.Screen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    // Abstract
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @private
 */
App.Screen.prototype._swipeStart = function _swipeStart(preferScroll)
{
    // Abstract
};

/**
 * Called when swipe ends
 * @param {string} direction
 * @private
 */
App.Screen.prototype._swipeEnd = function _swipeEnd(direction)
{
    // Abstract
};

/**
 * @class EditScreen
 * @param {Object} layout
 * @constructor
 */
App.EditScreen = function EditScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var r = layout.pixelRatio,
        inputWidth = layout.width - Math.round(20 * r),
        inputHeight = Math.round(40 * r);

    this._target = null;

    this._background = this.addChild(new PIXI.Graphics());
    this._input = this.addChild(new App.Input("",20,inputWidth,inputHeight,r,true));
    this._deleteButton = new App.PopUpButton("Delete","",{
        width:inputWidth,
        height:inputHeight,
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:layout.width,overlayHeight:0}
    });
    this._renderAll = true;
};

App.EditScreen.prototype = Object.create(App.Screen.prototype);
App.EditScreen.prototype.constructor = App.EditScreen;

/**
 * Render
 * @private
 */
App.EditScreen.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        ScreenMode = App.ScreenMode,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r),
        w = this._layout.width - padding * 2;

    if (this._renderAll)
    {
        this._renderAll = false;

        this._input.x = padding;
        this._input.y = padding;

        this._deleteButton.setPosition(padding,inputHeight+padding);
    }

    if (this._mode === ScreenMode.EDIT)
    {
        if (!this.contains(this._deleteButton)) this.addChild(this._deleteButton);

        //TODO use skin
        GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w+padding*2,inputHeight*2],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,inputHeight-1,w,1],false,false);
        GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,inputHeight,w,1],false,true);
    }
    else if (this._mode === ScreenMode.ADD)
    {
        if (this.contains(this._deleteButton)) this.removeChild(this._deleteButton);

        GraphicUtils.drawRect(this._background,ColorTheme.GREY,1,0,0,w+padding*2,inputHeight);
    }
};

/**
 * Hide
 */
App.EditScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Enable
 */
App.EditScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
};

/**
 * Disable
 */
App.EditScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
};

/**
 * Update
 * @param {{category:App.Category,subCategory:App.SubCategory}} model
 * @param {string} mode
 */
App.EditScreen.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;
    this._target = this._model instanceof App.Account ? App.Account : App.SubCategory;

    this._deleteButton.hidePopUp(true);

    if (this._target === App.Account)
    {
        this._input.setValue(this._model.name);
        this._deleteButton.setMessage("Are you sure you want to\ndelete this account with all its\ndata and categories?");
    }
    else if (this._target === App.SubCategory && this._model.subCategory)
    {
        this._input.setValue(this._model.subCategory.name);
        this._deleteButton.setMessage("Are you sure you want to\ndelete this sub-category?");
    }

    this._render();
};

/**
 * Register delete button event listeners
 * @private
 */
App.EditScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.addEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.addEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.addEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * UnRegister delete button event listeners
 * @private
 */
App.EditScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.removeEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.removeEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.removeEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * On delete cancel
 * @private
 */
App.EditScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.EditScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._onHidePopUpComplete();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();

    changeScreenData.updateBackScreen = true;

    if (this._target === App.Account)
    {
        App.Controller.dispatchEvent(EventType.CHANGE_ACCOUNT,{
            type:EventType.DELETE,
            account:this._model,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
    else if (this._target === App.SubCategory)
    {
        App.Controller.dispatchEvent(EventType.CHANGE_SUB_CATEGORY,{
            type:EventType.DELETE,
            subCategory:this._model.subCategory,
            category:this._model.category,
            nextCommand:new App.ChangeCategory(),
            nextCommandData:{
                type:EventType.CHANGE,
                category:this._model.category,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            }
        });
    }
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.EditScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.EditScreen.prototype._onClick = function _onClick()
{
    if (this._deleteButton.hitTest(this.stage.getTouchData().getLocalPosition(this).y))
    {
        if (this._input.isFocused())
        {
            this._input.blur();
        }
        else
        {
            this.disable();
            this._unRegisterEventListeners(App.EventLevel.LEVEL_1);
            App.ViewLocator.getViewSegment(App.ViewName.HEADER).disableActions();
            this._registerDeleteButtonListeners();
            this._deleteButton.setPopUpLayout(0,this._layout.headerHeight,0,this._layout.contentHeight > this._background.height ? this._layout.contentHeight : this._background.height);
            this._deleteButton.showPopUp();
        }
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._input.blur();

    //TODO check first if value is set

    if (action === App.HeaderAction.CONFIRM)
    {
        changeScreenData.updateBackScreen = true;

        if (this._target === App.Account)
        {
            App.Controller.dispatchEvent(EventType.CHANGE_ACCOUNT,{
                type:EventType.CHANGE,
                account:this._model,
                name:this._input.getValue(),
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
        else if (this._target === App.SubCategory)
        {
            App.Controller.dispatchEvent(EventType.CHANGE_SUB_CATEGORY,{
                type:EventType.CHANGE,
                subCategory:this._model.subCategory,
                category:this._model.category,
                name:this._input.getValue(),
                nextCommand:new App.ChangeCategory(),
                nextCommandData:{
                    type:EventType.CHANGE,
                    category:this._model.category,
                    nextCommand:new App.ChangeScreen(),
                    nextCommandData:changeScreenData
                }
            });
        }
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(EventType.CHANGE_SCREEN,changeScreenData);
    }
};

/**
 * @class InputScrollScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.InputScrollScreen = function InputScrollScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    //TODO also disable header actions if input is focused and soft keyboard shown

    //TODO add other 'scroll-' properties into TweenProxy?
    this._scrollTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._scrollState = App.TransitionState.HIDDEN;
    this._scrollInput = null;
    this._scrollPosition = 0;
    this._inputPadding = Math.round(10 * layout.pixelRatio);
};

App.InputScrollScreen.prototype = Object.create(App.Screen.prototype);
App.InputScrollScreen.prototype.constructor = App.InputScrollScreen;

/**
 * On tick
 * @private
 */
App.InputScrollScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._scrollTween.isRunning()) this._onScrollTweenUpdate();
};

/**
 * On scroll tween update
 * @private
 */
App.InputScrollScreen.prototype._onScrollTweenUpdate = function _onScrollTweenUpdate()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWING)
    {
        this._pane.y = -Math.round((this._scrollPosition + this._container.y) * this._scrollTween.progress);
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._pane.y = -Math.round((this._scrollPosition + this._container.y) * (1 - this._scrollTween.progress));
    }
};

/**
 * On scroll tween complete
 * @private
 */
App.InputScrollScreen.prototype._onScrollTweenComplete = function _onScrollTweenComplete()
{
    var TransitionState = App.TransitionState;

    this._onScrollTweenUpdate();

    if (this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.SHOWN;

        this._scrollInput.enable();
        this._scrollInput.focus();
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.HIDDEN;

        this._pane.enable();

        App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).scrollTo(0);
    }
};

/**
 * Focus budget
 * @param {boolean} [immediate=false] Flag if input should be focused immediately without tweening
 * @private
 */
App.InputScrollScreen.prototype._focusInput = function _focusInput(immediate)
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.HIDDEN || this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.SHOWING;

        this._pane.disable();

        if (immediate)
        {
            this._scrollPosition = 0;

            this._onScrollTweenComplete();
        }
        else
        {
            this._scrollPosition = this._scrollInput.y - this._inputPadding;

            this._scrollTween.start();
        }
    }
};

/**
 * On budget field blur
 * @private
 */
App.InputScrollScreen.prototype._onInputBlur = function _onInputBlur()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWN || this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.HIDING;

        this._scrollInput.disable();

        if (this._scrollPosition  > 0)
        {
            this._scrollTween.restart();
        }
        else
        {
            this._pane.resetScroll();
            this._onScrollTweenComplete();
        }
    }
};

/**
 * Reset screen scroll
 */
App.InputScrollScreen.prototype.resetScroll = function resetScroll()
{
    if (this._scrollInput) this._scrollInput.blur();

    this._scrollTween.stop();

    this._pane.y = 0;
    this._pane.resetScroll();

    App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).scrollTo(0);
};

/**
 * @class TransactionToggleButton
 * @extends Button
 * @param {string} iconName
 * @param {string} label
 * @param {{width:number,height:number,pixelRatio:number,style:Object,toggleStyle:Object}} options
 * @param {{icon:string,label:string,toggleColor:boolean}} toggleOptions
 * @constructor
 */
App.TransactionToggleButton = function TransactionToggleButton(iconName,label,options,toggleOptions)
{
    this._iconName = iconName;
    this._toggleStyle = options.toggleStyle;
    this._toggleOptions = toggleOptions;
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._selected = false;
    this._iconResizeRatio = Math.round(20 * options.pixelRatio) / this._icon.height;

    App.Button.call(this,label,options);

    this._render(true);

    this.addChild(this._icon);
};

App.TransactionToggleButton.prototype = Object.create(App.Button.prototype);
App.TransactionToggleButton.prototype.constructor = App.TransactionToggleButton;

/**
 * Render
 * @param {boolean} [updateAll=false]
 * @private
 */
App.TransactionToggleButton.prototype._render = function _render(updateAll)
{
    var r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        gap = Math.round(10 * r),
        padding = Math.round(5 * r);

    if (this._selected)
    {
        if (this._toggleOptions.icon) this._icon.setTexture(PIXI.TextureCache[this._toggleOptions.icon]);
        if (this._toggleOptions.label) this._labelField.setText(this._toggleOptions.label);
        if (this._toggleOptions.toggleColor)
        {
            this._icon.tint = 0xFFFFFE;
            this._labelField.setStyle(this._toggleStyle);

            this.clear();
            this.beginFill(App.ColorTheme.BLUE);
            this.drawRoundedRect(padding,padding,w-padding*2,h-padding*2,padding);
            this.endFill();
        }
    }
    else
    {
        if (this._toggleOptions.icon) this._icon.setTexture(PIXI.TextureCache[this._iconName]);
        if (this._toggleOptions.label) this._labelField.setText(this._label);
        if (this._toggleOptions.toggleColor)
        {
            this._icon.tint = App.ColorTheme.BLUE;
            this._labelField.setStyle(this._style);

            this.clear();
        }
    }

    if (updateAll)
    {
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.y = Math.round((h - this._icon.height) / 2);
        this._icon.tint = App.ColorTheme.BLUE;

        this._labelField.y = Math.round((h - this._labelField.height) / 2);
    }

    this._icon.x = Math.round((w - this._icon.width - gap - this._labelField.width) / 2);
    this._labelField.x = Math.round(this._icon.x + this._icon.width + gap);
};

/**
 * Toggle
 */
App.TransactionToggleButton.prototype.toggle = function toggle()
{
    this._selected = !this._selected;

    this._render(false);
};

/**
 * Set selection state
 * @param {boolean} value
 */
App.TransactionToggleButton.prototype.setState = function setState(value)
{
    this._selected = value;

    this._render(false);
};

/**
 * Is button selected?
 * @returns {boolean}
 */
App.TransactionToggleButton.prototype.isSelected = function isSelected()
{
    return this._selected;
};

/**
 * @class TransactionOptionButton
 * @extends Graphics
 * @param {string} iconName
 * @param {string} name
 * @param {number} targetScreenName
 * @param {{width:number,height:number,pixelRatio:number,nameStyle:Object,valueStyle:Object,valueDetailStyle:Object}} options
 * @constructor
 */
App.TransactionOptionButton = function TransactionOptionButton(iconName,name,targetScreenName,options)
{
    PIXI.DisplayObjectContainer.call(this);

    var Text = PIXI.Text,
        Sprite = PIXI.Sprite;

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._options = options;
    this._pixelRatio = options.pixelRatio;
    this._skin = new Sprite(options.skin);
    this._icon = new Sprite.fromFrame(iconName);
    this._nameField = new Text(name,options.nameStyle);
    this._valueField = new Text("",options.valueStyle);
    this._valueDetailField = null;
    this._targetScreenName = targetScreenName;
    this._arrow = new Sprite.fromFrame("arrow-app");
    this._iconResizeRatio = Math.round(20 * this._pixelRatio) / this._icon.height;
    this._arrowResizeRatio = Math.round(12 * this._pixelRatio) / this._arrow.height;

    this._render();
    this._update();

    this.addChild(this._skin);
    this.addChild(this._icon);
    this.addChild(this._nameField);
    this.addChild(this._valueField);
    this.addChild(this._arrow);
};

App.TransactionOptionButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.TransactionOptionButton.prototype.constructor = App.TransactionOptionButton;

/**
 * Render
 * @private
 */
App.TransactionOptionButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        h = this.boundingBox.height;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = ColorTheme.GREY_DARK;

    this._nameField.x = Math.round(50 * r);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);

    this._arrow.scale.x = this._arrowResizeRatio;
    this._arrow.scale.y = this._arrowResizeRatio;
    this._arrow.x = Math.round(this.boundingBox.width - 15 * r - this._arrow.width);
    this._arrow.y = Math.round((h - this._arrow.height) / 2);
    this._arrow.tint = ColorTheme.GREY_DARK;
};

/**
 * Update
 * @private
 */
App.TransactionOptionButton.prototype._update = function _update()
{
    var r = this._pixelRatio,
        offset = this.boundingBox.width - 35 * r;

    this._valueField.x = Math.round(offset - this._valueField.width);
    if (this._valueDetailField && this.contains(this._valueDetailField))
    {
        this._valueField.y = Math.round(9 * r);
        this._valueDetailField.y = Math.round(30 * r);
        this._valueDetailField.x = Math.round(offset - this._valueDetailField.width);
    }
    else
    {
        this._valueField.y = Math.round((this.boundingBox.height - this._valueField.height) / 2);
    }
};

/**
 * Set value
 * @param {string} value
 * @param {string} [details=null]
 */
App.TransactionOptionButton.prototype.setValue = function setValue(value,details)
{
    this._valueField.setText(value);

    if (details)
    {
        if (this._valueDetailField) this._valueDetailField.setText(details);
        else this._valueDetailField = new PIXI.Text(details,this._options.valueDetailStyle);

        if (!this.contains(this._valueDetailField)) this.addChild(this._valueDetailField);
    }
    else
    {
        if (this._valueDetailField && this.contains(this._valueDetailField)) this.removeChild(this._valueDetailField);
    }

    this._update();
};

/**
 * @class AddTransactionScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.AddTransactionScreen = function AddTransactionScreen(layout)
{
    App.InputScrollScreen.call(this,layout);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        FontStyle = App.FontStyle,
        ScreenName = App.ScreenName,
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(10 * r) * 2,
        inputHeight = Math.round(40 * r),
        toggleOptions = {
            width:Math.round(w / 3),
            height:Math.round(40 * r),
            pixelRatio:r,
            style:FontStyle.get(14,FontStyle.BLUE),
            toggleStyle:FontStyle.get(14,FontStyle.WHITE)
        },
        options = {
            pixelRatio:r,
            width:w,
            height:Math.round(50*r),
            skin:skin.GREY_50,
            nameStyle:FontStyle.get(18,FontStyle.GREY_DARKER),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInput = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._separators = new PIXI.Graphics();
    this._deleteBackground = new PIXI.Sprite(skin.GREY_60);
    this._deleteButton = new App.PopUpButton("Delete","Are you sure you want to\ndelete this transaction?",{
        width:inputWidth,
        height:inputHeight,
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:w,overlayHeight:0}
    });

    this._optionList = new App.List(App.Direction.Y);
    this._accountOption = this._optionList.add(new TransactionOptionButton("account","Account",ScreenName.ACCOUNT,options));
    this._categoryOption = this._optionList.add(new TransactionOptionButton("folder-app","Category",ScreenName.CATEGORY,options));
    this._timeOption = this._optionList.add(new TransactionOptionButton("calendar","Time",ScreenName.SELECT_TIME,options));
    this._methodOption = this._optionList.add(new TransactionOptionButton("credit-card","Method",ScreenName.CATEGORY,options));
    this._currencyOption = this._optionList.add(new TransactionOptionButton("currencies","Currency",ScreenName.ACCOUNT,options),true);

    this._toggleButtonList = new App.List(App.Direction.X);
    this._typeToggle = this._toggleButtonList.add(new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income",toggleColor:false}));
    this._pendingToggle = this._toggleButtonList.add(new TransactionToggleButton("pending-app","Pending",toggleOptions,{toggleColor:true}));
    this._repeatToggle = this._toggleButtonList.add(new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{toggleColor:true}),true);
    this._renderAll = true;

    //TODO automatically focus input when this screen is shown?
    //TODO add repeat frequency when 'repeat' is on?

    this._transactionInput.restrict(/\d{1,}(\.\d*){0,1}/g);

    this._container.addChild(this._background);
    this._container.addChild(this._transactionInput);
    this._container.addChild(this._toggleButtonList);
    this._container.addChild(this._optionList);
    this._container.addChild(this._noteInput);
    this._container.addChild(this._separators);
    this._pane.setContent(this._container);
    this.addChild(this._pane);

    this._clickThreshold = 10 * r;
};

App.AddTransactionScreen.prototype = Object.create(App.InputScrollScreen.prototype);
App.AddTransactionScreen.prototype.constructor = App.AddTransactionScreen;

/**
 * Render
 * @private
 */
App.AddTransactionScreen.prototype._render = function _render()
{
    var w = this._layout.width,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r);

    if (this._renderAll)
    {
        var ColorTheme = App.ColorTheme,
            GraphicUtils = App.GraphicUtils,
            inputHeight = Math.round(60 * r),
            toggleHeight = this._toggleButtonList.boundingBox.height,
            toggleWidth = Math.round(w / 3),
            separatorWidth = w - padding * 2,
            bottom = 0;

        this._renderAll = false;

        this._transactionInput.x = padding;
        this._transactionInput.y = padding;

        this._toggleButtonList.y = inputHeight;

        this._optionList.y = this._toggleButtonList.y + toggleHeight;

        bottom = this._optionList.y + this._optionList.boundingBox.height;

        this._noteInput.x = padding;
        this._noteInput.y = bottom + padding;

        GraphicUtils.drawRects(this._separators,ColorTheme.GREY_LIGHT,1,[
            padding,inputHeight,separatorWidth,1,
            toggleWidth,inputHeight+padding,1,toggleHeight-padding*2,
            toggleWidth*2,inputHeight+padding,1,toggleHeight-padding*2,
            padding,bottom,separatorWidth,1
        ],true,false);

        bottom = this._noteInput.y + this._noteInput.boundingBox.height + padding;

        this._deleteBackground.y = bottom;
        this._deleteButton.setPosition(padding,this._deleteBackground.y + padding);

        GraphicUtils.drawRects(this._separators,ColorTheme.GREY_DARK,1,[
            padding,inputHeight-1,separatorWidth,1,
            toggleWidth-1,inputHeight+padding,1,toggleHeight-padding*2,
            toggleWidth*2-1,inputHeight+padding,1,toggleHeight-padding*2,
            padding,inputHeight+toggleHeight-1,separatorWidth,1,
            padding,bottom-1,separatorWidth,1
        ],false,true);
    }

    if (this._mode === App.ScreenMode.EDIT)
    {
        App.GraphicUtils.drawRect(this._background,App.ColorTheme.GREY,1,0,0,w,this._deleteButton.y+this._deleteButton.boundingBox.height+padding);

        if (!this._container.contains(this._deleteBackground)) this._container.addChild(this._deleteBackground);
        if (!this._container.contains(this._deleteButton)) this._container.addChild(this._deleteButton);
    }
    else
    {
        App.GraphicUtils.drawRect(this._background,App.ColorTheme.GREY,1,0,0,w,this._noteInput.y+this._noteInput.boundingBox.height+padding);

        if (this._container.contains(this._deleteBackground)) this._container.removeChild(this._deleteBackground);
        if (this._container.contains(this._deleteButton)) this._container.removeChild(this._deleteButton);
    }
};

/**
 * Update
 * @param {App.Transaction} data
 * @param {number} mode
 * @private
 */
App.AddTransactionScreen.prototype.update = function update(data,mode)
{
    this._model = data || this._model;
    this._mode = mode || this._mode;

    this._transactionInput.setValue(this._model.amount);

    this._typeToggle.setState(this._model.type === App.TransactionType.INCOME);
    this._pendingToggle.setState(this._model.pending);
    this._repeatToggle.setState(this._model.repeat);

    this._accountOption.setValue(this._model.account ? this._model.account.name : "?");
    this._categoryOption.setValue(this._model.subCategory ? this._model.subCategory.name : "?",this._model.category ? this._model.category.name : null);
    this._timeOption.setValue(App.DateUtils.getMilitaryTime(this._model.date),this._model.date.toDateString());
    this._methodOption.setValue(this._model.method.name);
    this._currencyOption.setValue(this._model.currency.symbol);

    this._deleteButton.hidePopUp(true);

    this._noteInput.setValue(this._model.note);

    this._render();
    this._pane.resize();
    this.resetScroll();
};

/**
 * Hide
 */
App.AddTransactionScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Enable
 */
App.AddTransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.AddTransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._transactionInput.disable();
    this._noteInput.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.AddTransactionScreen.prototype._registerEventListeners = function _registerEventListeners(level)
{
    App.Screen.prototype._registerEventListeners.call(this,level);

    if (level === App.EventLevel.LEVEL_2)
    {
        var EventType = App.EventType;

        this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

        this._transactionInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
        this._noteInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
    }
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    App.Screen.prototype._unRegisterEventListeners.call(this,level);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._transactionInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._noteInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Register delete button event listeners
 * @private
 */
App.AddTransactionScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.addEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.addEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.addEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * UnRegister delete button event listeners
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.removeEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.removeEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.removeEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * On delete cancel
 * @private
 */
App.AddTransactionScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.AddTransactionScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    var HeaderAction = App.HeaderAction,
        ModelLocator = App.ModelLocator,
        ModelName = App.ModelName;

    this._onHidePopUpComplete();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();

    ModelLocator.getProxy(ModelName.TRANSACTIONS).setCurrent(this._model);

    App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
        type:App.EventType.DELETE,
        nextCommand:new App.ChangeScreen(),
        nextCommandData:ModelLocator.getProxy(ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            App.ScreenName.TRANSACTIONS,
            0,
            null,
            HeaderAction.MENU,
            HeaderAction.ADD_TRANSACTION,
            App.ScreenTitle.TRANSACTIONS
        )
    });
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.AddTransactionScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.AddTransactionScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        pointerData = this.stage.getTouchData(),
        position = pointerData.getLocalPosition(this._container).y;

    if (this._transactionInput.hitTest(position))
    {
        this._scrollInput = this._transactionInput;
        this._focusInput(this._scrollInput.y + this._container.y > 0);
    }
    else if (this._toggleButtonList.hitTest(position))
    {
        if (inputFocused) this._scrollInput.blur();
        else this._toggleButtonList.getItemUnderPoint(pointerData).toggle();
    }
    else if (this._optionList.hitTest(position))
    {
        if (inputFocused) this._scrollInput.blur();

        var HeaderAction = App.HeaderAction,
            ScreenTitle = App.ScreenTitle,
            ScreenName = App.ScreenName,
            button = this._optionList.getItemUnderPoint(pointerData),
            changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                ScreenName.ACCOUNT,
                App.ScreenMode.SELECT,
                null,
                null,
                HeaderAction.NONE,
                ScreenTitle.SELECT_ACCOUNT
            );

        if (button === this._categoryOption)
        {
            if (this._model.account)
            {
                changeScreenData.screenName = ScreenName.CATEGORY;
                changeScreenData.updateData = this._model.account;
                changeScreenData.headerName = ScreenTitle.SELECT_CATEGORY;
            }
        }
        else if (button === this._timeOption)
        {
            changeScreenData.screenName = ScreenName.SELECT_TIME;
            changeScreenData.updateData = this._model.date;
            changeScreenData.headerName = ScreenTitle.SELECT_TIME;
            changeScreenData.headerRightAction = HeaderAction.CONFIRM;
        }
        else if (button === this._currencyOption)
        {
            changeScreenData.screenName = ScreenName.CURRENCIES;
            changeScreenData.headerName = ScreenTitle.SELECT_CURRENCY;
        }
        //TODO disable before changing screen?
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else if (this._noteInput.hitTest(position))
    {
        this._scrollInput = this._noteInput;
        this._focusInput(false);
    }
    else if (this._deleteButton.hitTest(position))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            this.disable();
            this._unRegisterEventListeners(App.EventLevel.LEVEL_1);
            App.ViewLocator.getViewSegment(App.ViewName.HEADER).disableActions();
            this._registerDeleteButtonListeners();
            this._deleteButton.setPopUpLayout(0,this._container.y + this._layout.headerHeight,0,this._layout.contentHeight > this._container.height ? this._layout.contentHeight : this._container.height);
            this._deleteButton.showPopUp();
        }
    }
    else
    {
        if (inputFocused) this._scrollInput.blur();
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AddTransactionScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        changeScreenData = ModelLocator.getProxy(ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            App.ScreenName.TRANSACTIONS,
            0,
            ModelLocator.getProxy(ModelName.TRANSACTIONS).copySource().reverse(),
            HeaderAction.MENU,
            HeaderAction.ADD_TRANSACTION,
            App.ScreenTitle.TRANSACTIONS
        );

    if (this._scrollState === App.TransitionState.SHOWN && this._scrollInput) this._scrollInput.blur();

    if (action === HeaderAction.CONFIRM)
    {
        //TODO first check if all values are set!

        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CONFIRM,
            amount:this._transactionInput.getValue(),
            transactionType:this._typeToggle.isSelected() ? App.TransactionType.INCOME : App.TransactionType.EXPENSE,
            pending:this._pendingToggle.isSelected(),
            repeat:this._repeatToggle.isSelected(),
            note:this._noteInput.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
    else
    {
        changeScreenData.screenName = App.ScreenName.BACK;
        changeScreenData.updateBackScreen = true;

        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CANCEL,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
};

/**
 * On budget field blur
 * @private
 */
App.AddTransactionScreen.prototype._onInputBlur = function _onInputBlur()
{
    App.InputScrollScreen.prototype._onInputBlur.call(this);

    var EventType = App.EventType;

    App.Controller.dispatchEvent(EventType.CHANGE_TRANSACTION,{
        type:EventType.CHANGE,
        amount:this._transactionInput.getValue(),
        note:this._noteInput.getValue()
    });
};

/**
 * @class SelectTimeScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.SelectTimeScreen = function SelectTimeScreen(layout)
{
    App.InputScrollScreen.call(this,layout);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();//TODO do I need BG? I can use BG below whole screen ...
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(w,r);

    //TODO enable 'swiping' for interactively changing calendar's months

    this._render();

    this._container.addChild(this._inputBackground);
    this._container.addChild(this._header);
    this._container.addChild(this._calendar);
    this._container.addChild(this._input);
    this._pane.setContent(this._container);
    this.addChild(this._pane);
};

App.SelectTimeScreen.prototype = Object.create(App.InputScrollScreen.prototype);
App.SelectTimeScreen.prototype.constructor = App.SelectTimeScreen;

/**
 * Render
 * @private
 */
App.SelectTimeScreen.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        r = this._layout.pixelRatio,
        inputBgHeight = Math.round(60 * r),
        w = this._layout.width;

    GraphicUtils.drawRects(this._inputBackground,ColorTheme.GREY,1,[0,0,w,inputBgHeight],true,false);
    GraphicUtils.drawRects(this._inputBackground,ColorTheme.GREY_DARK,1,[0,inputBgHeight-1,w,1],false,true);

    this._input.x = Math.round(10 * r);
    this._input.y = Math.round((inputBgHeight - this._input.height) / 2);

    this._header.y = inputBgHeight;

    this._calendar.y = Math.round(this._header.y + this._header.height);
};

/**
 * Enable
 */
App.SelectTimeScreen.prototype.enable = function enable()
{
    App.InputScrollScreen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    this.resetScroll();

    App.InputScrollScreen.prototype.disable.call(this);

    this._input.disable();
    this._pane.disable();
};

/**
 * Update
 * @param {Date} date
 * @param {string} mode
 * @private
 */
App.SelectTimeScreen.prototype.update = function update(date,mode)
{
    this._input.setValue(App.DateUtils.getMilitaryTime(date));

    this._calendar.update(date);
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.SelectTimeScreen.prototype._registerEventListeners = function _registerEventListener(level)
{
    App.Screen.prototype._registerEventListeners.call(this,level);

    if (level === App.EventLevel.LEVEL_2)
    {
        var EventType = App.EventType;

        this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

        this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
    }
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.SelectTimeScreen.prototype._unRegisterEventListeners = function _unRegisterEventListener(level)
{
    App.Screen.prototype._unRegisterEventListeners.call(this,level);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Click handler
 * @private
 */
App.SelectTimeScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        pointerData = this.stage.getTouchData(),
        position = pointerData.getLocalPosition(this._container).y;

    if (this._input.hitTest(position))
    {
        this._scrollInput = this._input;
        this._focusInput(this._input.y + this._container.y > 0);
    }
    else
    {
        if (inputFocused) this._scrollInput.blur();
        else this._calendar.onClick();
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.SelectTimeScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    if (this._scrollState === App.TransitionState.SHOWN && this._scrollInput) this._scrollInput.blur();

    if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else if (action === HeaderAction.CONFIRM)
    {
        changeScreenData.updateBackScreen = true;

        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CHANGE,
            date:this._calendar.getSelectedDate(),
            time:this._input.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
};

/**
 * @class AccountButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {PIXI.Texture} options.skin
 * @param {{font:string,fill:string}} options.nameStyle
 * @param {{font:string,fill:string}} options.detailStyle
 * @param {{font:string,fill:string}} options.editStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.AccountButton = function AccountButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new PIXI.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._mode = App.ScreenMode.SELECT;
    this._pixelRatio = options.pixelRatio;
    this._background = this.addChild(new PIXI.Graphics());
    this._editLabel = this.addChild(new PIXI.Text("Edit",options.editStyle));
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._skin = this._swipeSurface.addChild(new PIXI.Sprite(options.skin));
    this._nameLabel = this._swipeSurface.addChild(new PIXI.Text("",options.nameStyle));
    this._detailsLabel = this._swipeSurface.addChild(new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",options.detailStyle));//TODO remove hard-coded data
    this._renderAll = true;
};

App.AccountButton.prototype = Object.create(App.SwipeButton.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    if (this._renderAll)
    {
        var w = this.boundingBox.width,
            h = this.boundingBox.height,
            r = this._pixelRatio,
            offset = Math.round(15 * r);

        this._renderAll = false;

        App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

        this._editLabel.x = Math.round(w - 50 * this._pixelRatio);
        this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

        this._nameLabel.x = offset;
        this._nameLabel.y = offset;

        this._detailsLabel.x = offset;
        this._detailsLabel.y = Math.round(45 * r);
    }
};

/**
 * Set model
 * @param {App.Account} model
 * @param {string} mode
 */
App.AccountButton.prototype.setModel = function getModel(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._nameLabel.setText(this._model.name);

    this._render();
};

/**
 * Return model
 * @returns {Account}
 */
App.AccountButton.prototype.getModel = function getModel()
{
    return this._model;
};

/**
 * Click handler
 * @param {InteractionData} data
 * @returns {number}
 */
App.AccountButton.prototype.getClickMode = function getClickMode(data)
{
    if (this._isOpen && data.getLocalPosition(this).x >= this._width - this._openOffset) return App.ScreenMode.EDIT;
    else return App.ScreenMode.SELECT;
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.AccountButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.AccountButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};

/**
 * @class AccountScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        h = layout.contentHeight;

    this._model = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS);

    this._interactiveButton = null;
    this._buttonList = new App.TileList(App.Direction.Y,h);
    this._addNewButton = new App.AddNewButton("ADD ACCOUNT",FontStyle.get(16,FontStyle.GREY_DARK),App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_60,r);
    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,h,r,false);

    this._pane.setContent(this._buttonList);
    this.addChild(this._pane);
};

App.AccountScreen.prototype = Object.create(App.Screen.prototype);
App.AccountScreen.prototype.constructor = App.AccountScreen;

/**
 * Enable
 */
App.AccountScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.AccountScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Update
 * @param {App.Collection} data
 * @param {string} mode
 * @private
 */
App.AccountScreen.prototype.update = function update(data,mode)
{
    this._buttonList.remove(this._addNewButton);

    var buttonPool = App.ViewLocator.getViewSegment(App.ViewName.ACCOUNT_BUTTON_POOL),
        i = 0,
        l = this._buttonList.length,
        deletedState = App.LifeCycleState.DELETED,
        account = null,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    for (i=0,l=this._model.length();i<l;)
    {
        account = this._model.getItemAt(i++);
        if (account.lifeCycleState !== deletedState)
        {
            button = buttonPool.allocate();
            button.setModel(account,mode);
            this._buttonList.add(button);
        }
    }

    this._buttonList.add(this._addNewButton);
    this._buttonList.updateLayout(true);

    this._pane.resize();

    this._mode = mode;
    this._swipeEnabled = mode === App.ScreenMode.EDIT;
};

/**
 * On tween complete
 * @private
 */
App.AccountScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    if (this._transitionState === App.TransitionState.HIDDEN) this._closeButtons(true);
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.AccountScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button && !(button instanceof App.AddNewButton))
    {
        if (!preferScroll) this._pane.cancelScroll();

        this._interactiveButton = button;
        this._interactiveButton.swipeStart(direction);

        this._closeButtons(false);
    }
};

/**
 * Called when swipe ends
 * @private
 */
App.AccountScreen.prototype._swipeEnd = function _swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.AccountScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    if (this._mode === App.ScreenMode.EDIT)
    {
        var i = 0,
            l = this._buttonList.length - 1,// last button is 'AddNewButton'
            button = null;

        for (;i<l;)
        {
            button = this._buttonList.getItemAt(i++);
            if (button !== this._interactiveButton) button.close(immediate);
        }
    }
};

/**
 * Click handler
 * @private
 */
App.AccountScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button)
    {
        var EventType = App.EventType,
            changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.EDIT);

        if (button instanceof App.AddNewButton)
        {
            changeScreenData.headerName = App.ScreenTitle.ADD_ACCOUNT;

            App.Controller.dispatchEvent(EventType.CHANGE_ACCOUNT,{
                type:EventType.CREATE,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
        else
        {
            var ScreenMode = App.ScreenMode,
                HeaderAction = App.HeaderAction;

            if (this._mode === ScreenMode.EDIT)
            {
                if (button.getClickMode(data) === ScreenMode.EDIT)
                {
                    App.Controller.dispatchEvent(EventType.CHANGE_SCREEN,changeScreenData.update(
                        App.ScreenName.EDIT,
                        App.ScreenMode.EDIT,
                        button.getModel(),
                        0,
                        0,
                        App.ScreenTitle.EDIT_ACCOUNT
                    ));
                }
                else
                {
                    App.Controller.dispatchEvent(EventType.CHANGE_SCREEN,changeScreenData.update(
                        App.ScreenName.CATEGORY,
                        this._mode,
                        button.getModel(),
                        HeaderAction.MENU,
                        HeaderAction.ADD_TRANSACTION,
                        App.ScreenTitle.CATEGORIES
                    ));
                }
            }
            else
            {
                App.Controller.dispatchEvent(EventType.CHANGE_SCREEN,changeScreenData.update(
                    App.ScreenName.CATEGORY,
                    this._mode,
                    button.getModel(),
                    0,
                    HeaderAction.NONE,
                    App.ScreenTitle.SELECT_CATEGORY
                ));
            }
        }
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AccountScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.MENU,0,null,HeaderAction.NONE,HeaderAction.CANCEL,App.ScreenTitle.MENU));
    }
    else if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.BACK));
    }
};

/**
 * @class SubCategoryButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {number} options.openOffset
 * @param {Texture} options.whiteSkin
 * @param {Texture} options.greySkin
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.editLabelStyle
 * @constructor
 */
App.SubCategoryButton = function SubCategoryButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._mode = null;
    this._options = options;
    this._pixelRatio = options.pixelRatio;
    this._background = this.addChild(new PIXI.Graphics());
    this._deleteLabel = this.addChild(new PIXI.Text("Edit",options.editLabelStyle));
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._skin = this._swipeSurface.addChild(new PIXI.Sprite(options.whiteSkin));
    this._icon = PIXI.Sprite.fromFrame("subcategory-app");
    this._nameLabel = this._swipeSurface.addChild(new PIXI.Text("",options.nameLabelStyle));
    this._renderAll = true;
};

App.SubCategoryButton.prototype = Object.create(App.SwipeButton.prototype);
App.SubCategoryButton.prototype.constructor = App.SubCategoryButton;

/**
 * Render
 * @private
 */
App.SubCategoryButton.prototype._render = function _render()
{
    this._nameLabel.setText(this._model.name);

    if (this._renderAll)
    {
        this._renderAll = false;

        var ColorTheme = App.ColorTheme,
            r = this._pixelRatio,
            w = this.boundingBox.width,
            h = this.boundingBox.height,
            offset = Math.round(25 * r),
            iconResizeRatio = Math.round(20 * r) / this._icon.height;

        App.GraphicUtils.drawRect(this._background,ColorTheme.RED,1,0,0,w,h);

        this._deleteLabel.x = Math.round(w - 50 * r);
        this._deleteLabel.y = Math.round((h - this._deleteLabel.height) / 2);

        this._icon.scale.x = iconResizeRatio;
        this._icon.scale.y = iconResizeRatio;
        this._icon.x = offset;
        this._icon.y = Math.round((h - this._icon.height) / 2);
        this._icon.tint = ColorTheme.GREY;

        this._nameLabel.y = Math.round((h - this._nameLabel.height) / 2);
    }

    if (this._mode === App.ScreenMode.SELECT)
    {
        this._skin.setTexture(this._options.whiteSkin);

        this._nameLabel.x = Math.round(64 * this._pixelRatio);

        if (!this._swipeSurface.contains(this._icon)) this._swipeSurface.addChild(this._icon);
    }
    else if (this._mode === App.ScreenMode.EDIT)
    {
        this._skin.setTexture(this._options.greySkin);

        this._nameLabel.x = this._icon.x;

        if (this._swipeSurface.contains(this._icon)) this._swipeSurface.removeChild(this._icon);
    }
};

/**
 * Disable
 */
App.SubCategoryButton.prototype.disable = function disable()
{
    App.SwipeButton.prototype.disable.call(this);
};

/**
 * Update
 * @param {App.SubCategory} model
 * @param {string} mode
 */
App.SubCategoryButton.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._render();

    this.close(true);
};

/**
 * Return model
 * @returns {App.SubCategory}
 */
App.SubCategoryButton.prototype.getModel = function getModel()
{
    return this._model;
};

/**
 * Click handler
 * @param {InteractionData} interactionData
 * @param {App.Category} category
 */
App.SubCategoryButton.prototype.onClick = function onClick(interactionData,category)
{
    if (this._mode === App.ScreenMode.EDIT)
    {
        if (this._isOpen && interactionData.getLocalPosition(this).x >= this._width - this._openOffset)
        {
            this._model.saveState();

            App.Controller.dispatchEvent(
                App.EventType.CHANGE_SCREEN,
                App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                    App.ScreenName.EDIT,
                    App.ScreenMode.EDIT,
                    {subCategory:this._model,category:category},
                    0,
                    0,
                    App.ScreenTitle.EDIT_SUB_CATEGORY
                )
            );
        }
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.SubCategoryButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.SubCategoryButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};

/**
 * @class SubCategoryList
 * @extends Graphics
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {boolean} options.displayHeader
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.deleteLabelStyle
 * @param {{font:string,fill:string}} options.addLabelStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.SubCategoryList = function SubCategoryList(options)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,0);

    this._model = null;
    this._mode = null;
    this._width = options.width;
    this._pixelRatio = options.pixelRatio;
    this._interactiveButton = null;
    if (options.displayHeader) this._header = this.addChild(new App.ListHeader("Sub-Categories",this._width,this._pixelRatio));
    this._buttonList = this.addChild(new App.List(App.Direction.Y));
    this._addNewButton = new App.AddNewButton("ADD SUB-CATEGORY",options.addLabelStyle,options.addButtonSkin,this._pixelRatio);
};

App.SubCategoryList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.SubCategoryList.prototype.constructor = App.SubCategoryList;

/**
 * Update layout
 * @private
 */
App.SubCategoryList.prototype._render = function _render()
{
    if (this._header) this._buttonList.y = this._header.height;

    this.boundingBox.height = this._buttonList.y + this._buttonList.boundingBox.height;
};

/**
 * @method update
 * @param {App.Category} model
 * @param {string} mode
 */
App.SubCategoryList.prototype.update = function update(model,mode)
{
    this._model = model;

    this._buttonList.remove(this._addNewButton);

    var subCategories = model.subCategories,
        buttonPool = App.ViewLocator.getViewSegment(App.ViewName.SUB_CATEGORY_BUTTON_POOL),
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    i = 0;
    l = subCategories.length;

    for (;i<l;)
    {
        button = buttonPool.allocate();
        button.update(subCategories[i++],mode);
        this._buttonList.add(button,false);
    }

    this._buttonList.add(this._addNewButton);

    this._buttonList.updateLayout();

    this._render();

    this._mode = mode;
};

/**
 * Called when swipe starts
 * @param {string} direction
 * @private
 */
App.SubCategoryList.prototype.swipeStart = function swipeStart(direction)
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button && !(button instanceof App.AddNewButton))
    {
        this._interactiveButton = button;
        this._interactiveButton.swipeStart(direction);

        this.closeButtons(false);
    }
};

/**
 * Called when swipe ends
 * @private
 */
App.SubCategoryList.prototype.swipeEnd = function swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.SubCategoryList.prototype.closeButtons = function closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.length - 1,// last button is 'AddNewButton'
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getItemAt(i++);
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Find and return item under point passed in
 * @param {InteractionData} data PointerData to get the position from
 */
App.SubCategoryList.prototype.getItemUnderPoint = function getItemUnderPoint(data)
{
    return this._buttonList.getItemUnderPoint(data);
};

/**
 * Test if position passed in falls within this list boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.SubCategoryList.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};

/**
 * @class CategoryButtonSurface
 * @extends DisplayObjectContainer
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @constructor
 */
App.CategoryButtonSurface = function CategoryButtonSurface(options)
{
    PIXI.DisplayObjectContainer.call(this);

    this._width = options.width;
    this._height = options.height;
    this._pixelRatio = options.pixelRatio;

    this._skin = this.addChild(new PIXI.Sprite(options.skin));
    this._colorStripe = this.addChild(new PIXI.Graphics());
    this._icon = null;
    this._nameLabel = this.addChild(new PIXI.Text("",options.nameLabelStyle));
    this._renderAll = true;
};

App.CategoryButtonSurface.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButtonSurface.prototype.constructor = App.CategoryButtonSurface;

/**
 * Render
 * @param {string} label
 * @param {string} iconName
 * @param {string} color
 */
App.CategoryButtonSurface.prototype.render = function render(label,iconName,color)
{
    this._nameLabel.setText(label);

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[iconName]);

    App.GraphicUtils.drawRect(this._colorStripe,"0x"+color,1,0,0,Math.round(4 * this._pixelRatio),this._height);

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(iconName);
        this.addChild(this._icon);

        this._icon.width = Math.round(20 * this._pixelRatio);
        this._icon.height = Math.round(20 * this._pixelRatio);
        this._icon.x = Math.round(25 * this._pixelRatio);
        this._icon.y = Math.round((this._height - this._icon.height) / 2);

        this._nameLabel.x = Math.round(64 * this._pixelRatio);
        this._nameLabel.y = Math.round(18 * this._pixelRatio);
    }

    this._icon.tint = parseInt(color,16);
};

/**
 * @class CategoryButtonEdit
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {{width:number,height:number,pixelRatio:number,nameLabelStyle:{font:string,fill:string},editLabelStyle:{font:string,fill:string}}} options
 * @constructor
 */
App.CategoryButtonEdit = function CategoryButtonEdit(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,Math.round(80*options.pixelRatio));

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._mode = null;
    this._pixelRatio = options.pixelRatio;
    this._background = this.addChild(new PIXI.Graphics());
    this._editLabel = this.addChild(new PIXI.Text("Edit",options.editLabelStyle));
    this._swipeSurface = this.addChild(new App.CategoryButtonSurface(options));
    this._renderAll = true;
};

App.CategoryButtonEdit.prototype = Object.create(App.SwipeButton.prototype);
App.CategoryButtonEdit.prototype.constructor = App.CategoryButtonEdit;

/**
 * Render
 * @private
 */
App.CategoryButtonEdit.prototype._render = function _render()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._swipeSurface.render(this._model.name,this._model.icon,this._model.color);

    if (this._renderAll)
    {
        this._renderAll = false;

        App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

        this._editLabel.x = Math.round(w - 50 * this._pixelRatio);
        this._editLabel.y = Math.round(18 * this._pixelRatio);
    }
};

/**
 * Disable
 */
App.CategoryButtonEdit.prototype.disable = function disable()
{
    App.SwipeButton.prototype.disable.call(this);
};

/**
 * Update
 * @param {App.Category} model
 * @param {string} mode
 */
App.CategoryButtonEdit.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._render();

    this.close(true);
};

/**
 * Click handler
 * @param {InteractionData} data
 */
App.CategoryButtonEdit.prototype.onClick = function onClick(data)
{
    if (this._isOpen && data.getLocalPosition(this).x >= this._width - this._openOffset)
    {
        this._model.saveState();

        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,
            App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                App.ScreenName.EDIT_CATEGORY,
                App.ScreenMode.EDIT,
                this._model,
                0,
                0,
                App.ScreenTitle.EDIT_CATEGORY
            )
        );
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.CategoryButtonEdit.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.CategoryButtonEdit.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};

/**
 * @class CategoryButtonExpand
 * @extends ExpandButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.deleteLabelStyle
 * @param {{font:string,fill:string}} options.addLabelStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.CategoryButtonExpand = function CategoryButtonExpand(poolIndex,options)
{
    App.ExpandButton.call(this,options.width,options.height,true);

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._mode = null;
    this._pixelRatio = options.pixelRatio;
    this._surface = new App.CategoryButtonSurface(options);
    this._subCategoryList = new App.SubCategoryList(options);
    this._layoutDirty = true;

    this._setContent(this._subCategoryList);
    this.addChild(this._subCategoryList);
    this.addChild(this._surface);
};

App.CategoryButtonExpand.prototype = Object.create(App.ExpandButton.prototype);
App.CategoryButtonExpand.prototype.constructor = App.CategoryButtonExpand;

/**
 * Render
 * @private
 */
App.CategoryButtonExpand.prototype._render = function _render()
{
    this._surface.render(this._model.name,this._model.icon,this._model.color);
};

/**
 * Update
 * @param {App.Category} model
 * @param {string} mode
 */
App.CategoryButtonExpand.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._layoutDirty = true;

    this._render();

    this.close(true);
};

/**
 * Click handler
 * @param {InteractionData} data
 */
App.CategoryButtonExpand.prototype.onClick = function onClick(data)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
    {
        this.open();
    }
    else
    {
        if (data.getLocalPosition(this).y <= this._buttonHeight)
        {
            this.close();
        }
        else
        {
            this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this); // To cancel any parent's processes

            var button = this._subCategoryList.getItemUnderPoint(data);

            if (button)
            {
                var ModelLocator = App.ModelLocator,
                    ModelName = App.ModelName,
                    EventType = App.EventType,
                    changeScreenData = ModelLocator.getProxy(ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

                if (button instanceof App.AddNewButton)
                {
                    changeScreenData.screenName = App.ScreenName.EDIT;
                    changeScreenData.headerName = App.ScreenTitle.ADD_SUB_CATEGORY;

                    App.Controller.dispatchEvent(EventType.CHANGE_SUB_CATEGORY,{
                        type:EventType.CREATE,
                        category:this._model,
                        nextCommand:new App.ChangeScreen(),
                        nextCommandData:changeScreenData
                    });
                }
                else
                {
                    changeScreenData.backSteps = ModelLocator.getProxy(ModelName.SCREEN_HISTORY).peek(2).screenName === App.ScreenName.ACCOUNT ? 2 : 1;
                    changeScreenData.updateBackScreen = true;

                    App.Controller.dispatchEvent(EventType.CHANGE_TRANSACTION,{
                        type:EventType.CHANGE,
                        account:ModelLocator.getProxy(ModelName.ACCOUNTS).filter([this._model.account],"id")[0],
                        category:this._model,
                        subCategory:button.getModel(),
                        nextCommand:new App.ChangeScreen(),
                        nextCommandData:changeScreenData
                    });
                }
            }
        }
    }
};

/**
 * Open
 */
App.CategoryButtonExpand.prototype.open = function open()
{
    if (this._layoutDirty)
    {
        this._subCategoryList.update(this._model,this._mode);

        this._contentHeight = this._subCategoryList.boundingBox.height;

        this._layoutDirty = false;
    }

    App.ExpandButton.prototype.open.call(this);
};

/**
 * Disable
 */
App.CategoryButtonExpand.prototype.disable = function disable()
{
    this.close(true);
};

/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        h = layout.contentHeight;

    this._interactiveButton = null;
    this._buttonsInTransition = [];
    this._layoutDirty = false;

    this._buttonList = new App.TileList(App.Direction.Y,h);
    this._addNewButton = new App.AddNewButton("ADD CATEGORY",FontStyle.get(14,FontStyle.GREY_DARK),App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,r);
    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,h,r,false);

    this._pane.setContent(this._buttonList);
    this.addChild(this._pane);
};

App.CategoryScreen.prototype = Object.create(App.Screen.prototype);
App.CategoryScreen.prototype.constructor = App.CategoryScreen;

/**
 * Enable
 */
App.CategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.CategoryScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._layoutDirty = false;

    this._pane.disable();

    //TODO do I need disable buttons? They'll be updated on show anyway
    /*var i = 0,
        l = this._buttonList.length;

    for (;i<l;) this._buttonList.getItemAt(i++).disable();*/
};

/**
 * Update
 * @param {App.Account} data
 * @param {string} mode
 * @private
 */
App.CategoryScreen.prototype.update = function update(data,mode)
{
    this._model = data;

    this._buttonList.remove(this._addNewButton);

    var ScreenMode = App.ScreenMode,
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        expandButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EXPAND_POOL),
        editButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EDIT_POOL),
        buttonPool = this._mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool,
        categories = this._model.categories,
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    buttonPool = mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool;

    for (i=0,l=categories.length;i<l;)
    {
        button = buttonPool.allocate();
        button.update(categories[i++],mode);
        this._buttonList.add(button,false);
    }

    this._buttonList.add(this._addNewButton);

    this._updateLayout();

    this._mode = mode;
    this._swipeEnabled = mode === ScreenMode.EDIT;
};

/**
 * On tick
 * @private
 */
App.CategoryScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._layoutDirty) this._updateLayout();
};

/**
 * On tween complete
 * @private
 */
App.CategoryScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    if (this._transitionState === App.TransitionState.HIDDEN) this._closeButtons(true);
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.CategoryScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button && !(button instanceof App.AddNewButton))
    {
        if (!preferScroll) this._pane.cancelScroll();

        this._interactiveButton = button;
        this._interactiveButton.swipeStart(direction);

        this._closeButtons(false);
    }
};

/**
 * Called when swipe ends
 * @private
 */
App.CategoryScreen.prototype._swipeEnd = function _swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.CategoryScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.length - 1,// last button is 'AddNewButton'
        button = null,
        ScreenMode = App.ScreenMode,
        EventType = App.EventType;

    if (this._mode === ScreenMode.SELECT)
    {
        for (;i<l;)
        {
            button = this._buttonList.getItemAt(i++);
            if (button !== this._interactiveButton && button.isOpen())
            {
                if (this._buttonsInTransition.indexOf(button) === -1)
                {
                    this._buttonsInTransition.push(button);
                    button.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

                    this._layoutDirty = true;
                }

                button.close(immediate);
            }
        }
    }
    else if (this._mode === ScreenMode.EDIT)
    {
        for (;i<l;)
        {
            button = this._buttonList.getItemAt(i++);
            if (button !== this._interactiveButton) button.close(immediate);
        }
    }
};

/**
 * Click handler
 * @private
 */
App.CategoryScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button)
    {
        if (button instanceof App.AddNewButton)
        {
            var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.EDIT_CATEGORY);
            changeScreenData.headerName = App.ScreenTitle.ADD_CATEGORY;

            App.Controller.dispatchEvent(App.EventType.CHANGE_CATEGORY,{
                type:App.EventType.CREATE,
                account:this._model,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
        else
        {
            if (this._mode === App.ScreenMode.SELECT)
            {
                this._interactiveButton = button;

                if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
                {
                    this._buttonsInTransition.push(this._interactiveButton);
                    this._interactiveButton.addEventListener(App.EventType.COMPLETE,this,this._onButtonTransitionComplete);

                    this._layoutDirty = true;
                }

                this._interactiveButton.onClick(data);
                this._pane.cancelScroll();
            }
            else if (this._mode === App.ScreenMode.EDIT)
            {
                button.onClick(data);
            }
        }
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            App.ScreenName.MENU,
            0,
            null,
            HeaderAction.NONE,
            HeaderAction.CANCEL,
            App.ScreenTitle.MENU
        );

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
    else if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.BACK));
    }
};

/**
 * On button transition complete
 * @param {App.ExpandButton} button
 * @private
 */
App.CategoryScreen.prototype._onButtonTransitionComplete = function _onButtonTransitionComplete(button)
{
    var i = 0,
        l = this._buttonsInTransition.length,
        EventType = App.EventType;

    button.removeEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

    for (;i<l;i++)
    {
        if (button === this._buttonsInTransition[i])
        {
            this._buttonsInTransition.splice(i,1);
            break;
        }
    }

    if (this._buttonsInTransition.length === 0)
    {
        this._interactiveButton = null;

        this._layoutDirty = false;
        this._updateLayout();
    }
};

/**
 * Update layout
 * @private
 */
App.CategoryScreen.prototype._updateLayout = function _updateLayout()
{
    this._buttonList.updateLayout(true);

    this._pane.resize();
};

/**
 * @class ColorSample
 * @extends Graphics
 * @param {number} modelIndex
 * @param {number} color
 * @param {number} pixelRatio
 * @constructor
 */
App.ColorSample = function ColorSample(modelIndex,color,pixelRatio)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,Math.round(40*pixelRatio),Math.round(50*pixelRatio));

    this._modelIndex = modelIndex;
    this._pixelRatio = pixelRatio;
    this._color = color.toString();
    this._selected = false;

    this._render();
};

App.ColorSample.prototype = Object.create(PIXI.Graphics.prototype);
App.ColorSample.prototype.constructor = App.ColorSample;

/**
 * Render
 * @private
 */
App.ColorSample.prototype._render = function _render()
{
    var xPadding = Math.round((this._selected ? 0 : 5) * this._pixelRatio),
        yPadding = Math.round((this._selected ? 5 : 10) * this._pixelRatio),
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this.clear();
    this.beginFill("0x"+this._color);
    this.drawRoundedRect(xPadding,yPadding,w-xPadding*2,h-yPadding*2,Math.round(5*this._pixelRatio));
    this.endFill();
};

/**
 * Set color
 * @param {number} index
 * @param {number} color
 * @param {number} selectedIndex
 */
App.ColorSample.prototype.setModel = function setModel(index,color,selectedIndex)
{
    this._modelIndex = index;
    this._color = color;

    this._selected = selectedIndex === this._modelIndex;

    this._render();
};

/**
 * Return model index
 * @return {number}
 */
App.ColorSample.prototype.getModelIndex = function getModelIndex()
{
    return this._modelIndex;
};

/**
 * Return value
 * @returns {string}
 */
App.ColorSample.prototype.getValue = function getValue()
{
    return this._color;
};

/**
 * Select
 * @param {number} selectedIndex Index of selected item in the collection
 */
App.ColorSample.prototype.select = function select(selectedIndex)
{
    var selected = this._modelIndex === selectedIndex;

    if (this._selected === selected) return;

    this._selected = selected;

    this._render();
};

/**
 * @class IconSample
 * @extends DisplayObjectContainer
 * @param {number} modelIndex
 * @param {string} model
 * @param {number} pixelRatio
 * @constructor
 */
App.IconSample = function IconSample(modelIndex,model,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var size = Math.round(64 * pixelRatio);

    this.boundingBox = new App.Rectangle(0,0,size,size);

    this._modelIndex = modelIndex;
    this._model = model;
    this._pixelRatio = pixelRatio;
    this._icon = PIXI.Sprite.fromFrame(model);
    this._iconResizeRatio = Math.round(32 * pixelRatio) / this._icon.height;
    this._selected = false;

    this._render();

    this.addChild(this._icon);
};

App.IconSample.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.IconSample.prototype.constructor = App.IconSample;

/**
 * Render
 * @private
 */
App.IconSample.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        size = this.boundingBox.width;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round((size - this._icon.width) / 2);
    this._icon.y = Math.round((size - this._icon.height) / 2);
    this._icon.tint = this._selected ? ColorTheme.BLUE : ColorTheme.GREY_DARK;
};

/**
 * Set color
 * @param {number} index
 * @param {string} model
 * @param {number} selectedIndex
 */
App.IconSample.prototype.setModel = function setModel(index,model,selectedIndex)
{
    this._modelIndex = index;
    this._model = model;

    this._icon.setTexture(PIXI.TextureCache[model]);

    this._selected = selectedIndex === this._modelIndex;

    this._render();
};

/**
 * Return model index
 * @return {number}
 */
App.IconSample.prototype.getModelIndex = function getModelIndex()
{
    return this._modelIndex;
};

/**
 * Return value
 * @returns {string}
 */
App.IconSample.prototype.getValue = function getValue()
{
    return this._model;
};

/**
 * Select
 * @param {number} selectedIndex Index of selected item in the collection
 */
App.IconSample.prototype.select = function select(selectedIndex)
{
    var selected = this._modelIndex === selectedIndex;

    if (this._selected === selected) return;

    this._selected = selected;

    this._render();
};

/**
 * @class EditCategoryScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.EditCategoryScreen = function EditCategoryScreen(layout)
{
    App.InputScrollScreen.call(this,layout);

    var ScrollPolicy = App.ScrollPolicy,
        InfiniteList = App.InfiniteList,
        Direction = App.Direction,
        IconSample = App.IconSample,
        FontStyle = App.FontStyle,
        Input = App.Input,
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(20 * r),
        inputHeight = Math.round(40 * r),
        icons = App.ModelLocator.getProxy(App.ModelName.ICONS),
        iconsHeight = Math.round(64 * r),
        subCategoryButtonOptions = {
            width:w,
            height:inputHeight,
            pixelRatio:r,
            addButtonSkin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_40,
            addLabelStyle:FontStyle.get(14,FontStyle.GREY_DARK),
            displayHeader:true
        };

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = this._container.addChild(new PIXI.Graphics());
    this._colorStripe = this._container.addChild(new PIXI.Graphics());
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._iconResizeRatio = Math.round(32 * r) / this._icon.height;
    this._input = this._container.addChild(new Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true));
    this._separators = this._container.addChild(new PIXI.Graphics());
    this._colorList = this._container.addChild(new InfiniteList(this._getColorSamples(),App.ColorSample,Direction.X,w,Math.round(50 * r),r));
    this._topIconList = this._container.addChild(new InfiniteList(icons.slice(0,Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r));
    this._bottomIconList = this._container.addChild(new InfiniteList(icons.slice(Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r));
    this._subCategoryList = this._container.addChild(new App.SubCategoryList(subCategoryButtonOptions));
    this._budgetHeader = this._container.addChild(new App.ListHeader("Budget",w,r));
    this._budget = this._container.addChild(new Input("Enter Budget",20,inputWidth,inputHeight,r,true));
    this._deleteButton = new App.PopUpButton("Delete","Are you sure you want to\ndelete this category with all its\ndata and sub-categories?",{
        width:inputWidth,
        height:inputHeight,
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:w,overlayHeight:0}
    });
    this._renderAll = true;

    //TODO center selected color/icon when shown

    this._budget.restrict(/\d{1,}(\.\d{0,2}){0,1}/g);

    this._pane.setContent(this._container);
    this.addChild(this._pane);

    this._swipeEnabled = true;
};

App.EditCategoryScreen.prototype = Object.create(App.InputScrollScreen.prototype);
App.EditCategoryScreen.prototype.constructor = App.EditCategoryScreen;

/**
 * Render
 * @private
 */
App.EditCategoryScreen.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this._layout.width,
        inputFragmentHeight = Math.round(60 * r),
        colorListHeight = this._colorList.boundingBox.height,
        separatorWidth = w - this._inputPadding * 2,
        icon = this._getSelectedIcon(),
        color = this._colorList.getSelectedValue(),
        bottom = 0;

    GraphicUtils.drawRect(this._colorStripe,"0x"+color,1,0,0,Math.round(4*r),Math.round(59 * r));

    if (this._icon)
    {
        this._icon.setTexture(PIXI.TextureCache[icon]);
        this._icon.tint = parseInt(color,16);
    }

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(icon);
        this._iconResizeRatio = Math.round(32 * r) / this._icon.height;
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(15 * r);
        this._icon.y = Math.round((inputFragmentHeight - this._icon.height) / 2);
        this._icon.tint = parseInt(color,16);
        this._container.addChild(this._icon);

        this._input.x = Math.round(60 * r);
        this._input.y = Math.round((inputFragmentHeight - this._input.height) / 2);

        this._colorList.y = inputFragmentHeight;
        this._topIconList.y = inputFragmentHeight + this._colorList.boundingBox.height;
        this._bottomIconList.y = this._topIconList.y + this._topIconList.boundingBox.height;
        this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;

        this._budget.x = this._inputPadding;
        this._separators.x = this._inputPadding;
    }

    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;

    bottom = this._budgetHeader.y + this._budgetHeader.height;

    this._budget.y = bottom + this._inputPadding;

    if (this._mode === App.ScreenMode.EDIT)
    {
        bottom = bottom + inputFragmentHeight;

        this._deleteButton.setPosition(this._inputPadding,bottom+this._inputPadding);

        if (!this._container.contains(this._deleteButton)) this._container.addChild(this._deleteButton);
    }
    else
    {
        if (this._container.contains(this._deleteButton)) this._container.removeChild(this._deleteButton);
    }

    GraphicUtils.drawRect(this._background,ColorTheme.GREY,1,0,0,w,bottom+inputFragmentHeight);
    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_DARK,1,[
        0,inputFragmentHeight-1,separatorWidth,1,
        0,inputFragmentHeight+colorListHeight,separatorWidth,1,
        0,bottom-1,separatorWidth,1
    ],true,false);
    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_LIGHT,1,[
        0,inputFragmentHeight,separatorWidth,1,
        0,inputFragmentHeight+colorListHeight+1,separatorWidth,1,
        0,bottom,separatorWidth,1
    ],false,true);
};

/**
 * Hide
 */
App.EditCategoryScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Update
 * @param {App.Category} model
 * @param {string} mode
 */
App.EditCategoryScreen.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._input.setValue(this._model.name);

    if (this._model.color) this._colorList.selectItemByValue(this._model.color);
    else this._colorList.selectItemByPosition(0);

    if (this._model.icon)
    {
        this._topIconList.selectItemByValue(this._model.icon);
        this._bottomIconList.selectItemByValue(this._model.icon);
    }
    else
    {
        this._topIconList.selectItemByPosition(0);
        this._bottomIconList.selectItemByValue(-10000);
    }

    this._subCategoryList.update(this._model,App.ScreenMode.EDIT);
    this._budget.setValue(this._model.budget);

    this._deleteButton.hidePopUp(true);

    this._render();

    this._pane.resize();
    this.resetScroll();
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._colorList.enable();
    this._topIconList.enable();
    this._bottomIconList.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.EditCategoryScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
    this._colorList.disable();
    this._topIconList.disable();
    this._bottomIconList.disable();
    this._budget.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @param {number} level
 * @private
 */
App.EditCategoryScreen.prototype._registerEventListeners = function _registerEventListeners(level)
{
    App.Screen.prototype._registerEventListeners.call(this,level);

    if (level === App.EventLevel.LEVEL_2)
    {
        var EventType = App.EventType;

        this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

        this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
        this._budget.addEventListener(EventType.BLUR,this,this._onInputBlur);
    }
};

/**
 * UnRegister event listeners
 * @param {number} level
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners(level)
{
    App.Screen.prototype._unRegisterEventListeners.call(this,level);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Register delete button event listeners
 * @private
 */
App.EditCategoryScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.addEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.addEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.addEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * UnRegister delete button event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.removeEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.removeEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.removeEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * On delete cancel
 * @private
 */
App.EditCategoryScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.EditCategoryScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._onHidePopUpComplete();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();

    changeScreenData.updateBackScreen = true;

    App.Controller.dispatchEvent(EventType.CHANGE_CATEGORY,{
        type:EventType.DELETE,
        category:this._model,
        nextCommand:new App.ChangeScreen(),
        nextCommandData:changeScreenData
    });
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.EditCategoryScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        touchData = this.stage.getTouchData(),
        position = touchData.getLocalPosition(this._container),
        y = position.y;

    if (this._input.hitTest(y))
    {
        this._scrollInput = this._input;
        this._focusInput(this._scrollInput.y + this._container.y > 0);

        this._subCategoryList.closeButtons();
    }
    else if (this._colorList.hitTest(y))
    {
        this._onSampleClick(this._colorList,position.x,inputFocused);
    }
    else if (this._topIconList.hitTest(y))
    {
        this._onSampleClick(this._topIconList,position.x,inputFocused);
    }
    else if (this._bottomIconList.hitTest(y))
    {
        this._onSampleClick(this._bottomIconList,position.x,inputFocused);
    }
    else if (this._subCategoryList.hitTest(y))
    {
        var button = this._subCategoryList.getItemUnderPoint(touchData);

        if (button)
        {
            if (inputFocused) this._scrollInput.blur();

            if (button instanceof App.AddNewButton)
            {
                App.Controller.dispatchEvent(App.EventType.CHANGE_SUB_CATEGORY,{
                    type:App.EventType.CREATE,
                    category:this._model,
                    nextCommand:new App.ChangeScreen(),
                    nextCommandData:App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                        App.ScreenName.EDIT,
                        App.ScreenMode.ADD,
                        null,
                        0,
                        0,
                        App.ScreenTitle.ADD_SUB_CATEGORY
                    )
                });
            }
            else
            {
                //TODO check how many sub-categories the category have and allow to delete sub-category only if there is more than one
                button.onClick(touchData,this._model);
            }
        }

        this._subCategoryList.closeButtons();
    }
    else if (this._budget.hitTest(y))
    {
        this._scrollInput = this._budget;
        this._focusInput(false);

        this._subCategoryList.closeButtons();
    }
    else if (this._deleteButton.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            this.disable();
            this._unRegisterEventListeners(App.EventLevel.LEVEL_1);
            App.ViewLocator.getViewSegment(App.ViewName.HEADER).disableActions();
            this._registerDeleteButtonListeners();
            this._deleteButton.setPopUpLayout(0,this._container.y + this._layout.headerHeight,0,this._layout.contentHeight > this._container.height ? this._layout.contentHeight : this._container.height);
            this._deleteButton.showPopUp();
        }
    }
    else
    {
        if (inputFocused) this._scrollInput.blur();
    }
};

/**
 * On sample click
 * @param {App.InfiniteList} list
 * @param {number} position
 * @param {boolean} inputFocused
 * @private
 */
App.EditCategoryScreen.prototype._onSampleClick = function _onSampleClick(list,position,inputFocused)
{
    if (inputFocused) this._scrollInput.blur();

    list.cancelScroll();
    var sample = list.selectItemByPosition(position);

    if (sample instanceof App.ColorSample)
    {
        App.GraphicUtils.drawRect(this._colorStripe,"0x"+sample.getValue(),1,0,0,this._colorStripe.width,this._colorStripe.height);

        this._icon.tint = parseInt(sample.getValue(),16);
    }
    else if (sample instanceof App.IconSample)
    {
        this._icon.setTexture(PIXI.TextureCache[sample.getValue()]);

        (list === this._topIconList ? this._bottomIconList : this._topIconList).selectItemByPosition(-10000);
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditCategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK),
        changeCategoryData = {
            type:EventType.CONFIRM,
            category:this._model,
            name:this._input.getValue(),
            color:this._colorList.getSelectedValue(),
            icon:this._getSelectedIcon(),
            budget:this._budget.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        };

    if (this._scrollState === App.TransitionState.SHOWN && this._scrollInput) this._scrollInput.blur();

    if (action === App.HeaderAction.CONFIRM)
    {
        this._model.clearSavedStates();

        changeScreenData.updateBackScreen = true;
        //TODO when i create new Category, or edit current one, user can delete all subCategories!!!
        App.Controller.dispatchEvent(EventType.CHANGE_CATEGORY,changeCategoryData);
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        changeCategoryData.type = EventType.CANCEL;

        App.Controller.dispatchEvent(EventType.CHANGE_CATEGORY,changeCategoryData);
    }
};

/**
 * Return selected icon
 * @returns {string}
 * @private
 */
App.EditCategoryScreen.prototype._getSelectedIcon = function _getSelectedIcon()
{
    var selectedIcon = this._topIconList.getSelectedValue();
    if (!selectedIcon) selectedIcon = this._bottomIconList.getSelectedValue();

    return selectedIcon;
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.EditCategoryScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    if (!preferScroll) this._pane.cancelScroll();

    this._subCategoryList.swipeStart(direction);
};

/**
 * Called when swipe ends
 * @private
 */
App.EditCategoryScreen.prototype._swipeEnd = function _swipeEnd()
{
    this._subCategoryList.swipeEnd();
};

/**
 * Generate and return array of color samples
 * @returns {Array.<number>}
 * @private
 */
App.EditCategoryScreen.prototype._getColorSamples = function _getColorSamples()
{
    var convertFn = App.MathUtils.rgbToHex,
        i = 0,
        l = 30,
        frequency = 2 * Math.PI/l,
        amplitude = 127,
        center = 128,
        colorSamples = new Array(l);

    for (;i<l;i++)
    {
        colorSamples[i] = convertFn(
            Math.round(Math.sin(frequency * i + 0) * amplitude + center),
            Math.round(Math.sin(frequency * i + 2) * amplitude + center),
            Math.round(Math.sin(frequency * i + 4) * amplitude + center)
        );
    }
    return colorSamples;
};

/**
 * @class TransactionButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {{width:number,height:number,pixelRatio:number:labelStyles:Object}} options
 * @constructor
 */
App.TransactionButton = function TransactionButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    var Text = PIXI.Text,
        Graphics = PIXI.Graphics,
        editStyle = options.labelStyles.edit;

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._pixelRatio = options.pixelRatio;
    this._labelStyles = options.labelStyles;
    this._isPending = void 0;

    this._background = this.addChild(new Graphics());
    this._copyLabel = this.addChild(new Text("Copy",editStyle));
    this._editLabel = this.addChild(new Text("Edit",editStyle));
    this._icon = null;
    this._iconResizeRatio = -1;
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._redSkin = this._swipeSurface.addChild(new PIXI.Sprite(options.redSkin));
    this._greySkin = this._swipeSurface.addChild(new PIXI.Sprite(options.greySkin));
    this._colorStripe = this._swipeSurface.addChild(new Graphics());
    this._accountField = this._swipeSurface.addChild(new Text("",editStyle));
    this._categoryField = this._swipeSurface.addChild(new Text("",editStyle));
    this._amountField = this._swipeSurface.addChild(new Text("",editStyle));
    this._currencyField = this._swipeSurface.addChild(new Text("",editStyle));
    this._dateField = this._swipeSurface.addChild(new Text("",editStyle));
    this._pendingFlag = this._swipeSurface.addChild(new Graphics());
    this._pendingLabel = this._pendingFlag.addChild(new Text("PENDING",this._labelStyles.pending));
};

App.TransactionButton.prototype = Object.create(App.SwipeButton.prototype);
App.TransactionButton.prototype.constructor = App.TransactionButton;

/**
 * Update
 * @param {boolean} [updateAll=false]
 * @private
 */
App.TransactionButton.prototype._update = function _update(updateAll)
{
    var pending = this._model.pending,
        date = this._model.date,
        dateText = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

    this._accountField.setText(this._model.account.name);
    this._amountField.setText(this._model.amount);
    this._currencyField.setText(" " + this._model.currency.symbol);
    this._categoryField.setText(this._model.subCategory.name+" / "+this._model.category.name);
    this._dateField.setText(pending ? "Due by\n"+dateText : dateText);

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[this._model.category.icon]);
    else this._icon = this._swipeSurface.addChild(PIXI.Sprite.fromFrame(this._model.category.icon));

    if (pending !== this._isPending)
    {
        if (pending)
        {
            this._accountField.setStyle(this._labelStyles.accountPending);
            this._amountField.setStyle(this._labelStyles.amountPending);
            this._currencyField.setStyle(this._labelStyles.currencyPending);
            this._categoryField.setStyle(this._labelStyles.accountPending);
            this._dateField.setStyle(this._labelStyles.datePending);
        }
        else
        {
            this._accountField.setStyle(this._labelStyles.accountIncome);
            this._amountField.setStyle(this._labelStyles.amountIncome);
            this._currencyField.setStyle(this._labelStyles.currencyIncome);
            this._categoryField.setStyle(this._labelStyles.accountIncome);
            this._dateField.setStyle(this._labelStyles.date);
        }
    }

    this._render(updateAll,pending);
    this._updateLayout(updateAll,pending);

    this.close(true);

    this._isPending = pending;
};

/**
 * Render
 * @param {boolean} [renderAll=false]
 * @param {boolean} pending
 * @private
 */
App.TransactionButton.prototype._render = function _render(renderAll,pending)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        swipeOptionWidth = Math.round(this._openOffset / 2);

    if (renderAll)
    {
        GraphicUtils.drawRects(this._background,ColorTheme.GREEN,1,[0,0,w-swipeOptionWidth,h],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.RED,1,[w-swipeOptionWidth,0,swipeOptionWidth,h],false,true);

        GraphicUtils.drawRect(this._pendingFlag,0x000000,1,0,0,Math.round(this._pendingLabel.width+10*r),Math.round(this._pendingLabel.height+6*r));
    }

    GraphicUtils.drawRect(this._colorStripe,"0x"+this._model.category.color,1,0,0,Math.round(4 * r),h);

    if (pending !== this._isPending)
    {
        if (pending)
        {
            this._greySkin.visible = false;
            this._redSkin.visible = true;
            this._pendingFlag.visible = true;
        }
        else
        {
            this._greySkin.visible = true;
            this._redSkin.visible = false;
            this._pendingFlag.visible = false;
        }
    }

    this._icon.tint = pending ? ColorTheme.RED_DARK : parseInt(this._model.category.color,16);
};

/**
 * Update layout
 * @param {boolean} [updateAll=false]
 * @param {boolean} pending
 * @private
 */
App.TransactionButton.prototype._updateLayout = function _updateLayout(updateAll,pending)
{
    var r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        swipeOptionWidth = Math.round(60 * r),
        padding = Math.round(10 * r);

    if (updateAll)
    {
        this._copyLabel.x = w - swipeOptionWidth * 2 + Math.round((swipeOptionWidth - this._copyLabel.width) / 2);
        this._copyLabel.y = Math.round((h - this._copyLabel.height) / 2);
        this._editLabel.x = w - swipeOptionWidth + Math.round((swipeOptionWidth - this._editLabel.width) / 2);
        this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

        if (this._iconResizeRatio === -1) this._iconResizeRatio = Math.round(32 * this._pixelRatio) / this._icon.height;
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(20 * r);
        this._icon.y = Math.round((h - this._icon.height) / 2);

        this._accountField.x = Math.round(70 * r);
        this._accountField.y = Math.round(7 * r);
        this._amountField.x = Math.round(70 * r);
        this._amountField.y = Math.round(26 * r);
        this._currencyField.y = Math.round(33 * r);
        this._categoryField.x = Math.round(70 * r);
        this._categoryField.y = Math.round(52 * r);

        this._pendingLabel.x = Math.round(5 * r);
        this._pendingLabel.y = Math.round(4 * r);
        this._pendingFlag.x = Math.round(w - padding - this._pendingFlag.width);
        this._pendingFlag.y = Math.round(7 * r);
    }

    this._currencyField.x = Math.round(this._amountField.x + this._amountField.width);

    this._dateField.x = Math.round(w - padding - this._dateField.width);
    this._dateField.y = pending ? Math.round(38 * r) : Math.round(52 * r);
};

/**
 * Set model
 * @param {App.Transaction} model
 */
App.TransactionButton.prototype.setModel = function setModel(model)
{
    this._model = model;

    this._update(this._icon === null);
};

/**
 * Click handler
 * @param {PIXI.InteractionData} data
 */
App.TransactionButton.prototype.onClick = function onClick(data)
{
    var position = data.getLocalPosition(this).x;

    if (this._isOpen && position >= this._width - this._openOffset)
    {
        var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update();

        // Edit
        if (position >= this._width - this._openOffset / 2)
        {
            App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).setCurrent(this._model);

            changeScreenData.screenMode = App.ScreenMode.EDIT;
            changeScreenData.updateData = this._model;
            changeScreenData.headerName = App.ScreenTitle.EDIT_TRANSACTION;

            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
        }
        // Copy
        else
        {
            App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
                type:App.EventType.COPY,
                transaction:this._model,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.TransactionButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.TransactionButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};

/**
 * @class TransactionScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.TransactionScreen = function TransactionScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight;

    this._interactiveButton = null;
    this._buttonList = new App.VirtualList(App.ViewLocator.getViewSegment(App.ViewName.TRANSACTION_BUTTON_POOL),App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false));
    this._pane.setContent(this._buttonList);
};

App.TransactionScreen.prototype = Object.create(App.Screen.prototype);
App.TransactionScreen.prototype.constructor = App.TransactionScreen;

/**
 * Enable
 */
App.TransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();

    this._swipeEnabled = true;
};

/**
 * Disable
 */
App.TransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();

    this._swipeEnabled = false;
};

/**
 * Update
 * @private
 */
App.TransactionScreen.prototype.update = function update(model)
{
    this._model = model;

    this._buttonList.update(model);
    this._pane.resize();
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.TransactionScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this._closeButtons(false);
};

/**
 * Called when swipe ends
 * @private
 */
App.TransactionScreen.prototype._swipeEnd = function _swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.TransactionScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.TransactionScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button) button.onClick(data);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.TransactionScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        changeScreenData.update(App.ScreenName.MENU,0,null,HeaderAction.NONE,HeaderAction.CANCEL,App.ScreenTitle.MENU);
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
};

/**
 * @class SubCategoryReportList
 * @extends Graphics
 * @param {Category} model
 * @param {number} width
 * @param {number} pixelRatio
 * @param {Object} labelStyles
 * @constructor
 */
App.SubCategoryReportList = function SubCategoryReportList(model,width,pixelRatio,labelStyles)
{
    PIXI.Graphics.call(this);

    var Text = PIXI.Text,
        i = 0,
        l = 3,//Number of sub-categories
        item = null,
        textField = null;

    this._model = [{name:"Cinema",percent:"24",price:"50.00"},{name:"Theatre",percent:"71",price:"176.50"},{name:"Gallery",percent:"5",price:"87.00"}];
    this._width = width;
    this._itemHeight = Math.round(30 * pixelRatio);
    this._pixelRatio = pixelRatio;
    this._nameFields = new Array(l);
    this._percentFields = new Array(l);
    this._priceFields = new Array(l);

    for (;i<l;i++)
    {
        item = this._model[i];
        textField = new Text(item.name,labelStyles.subName);
        this._nameFields[i] = textField;
        this.addChild(textField);
        textField = new Text(item.percent+" %",labelStyles.subPercent);
        this._percentFields[i] = textField;
        this.addChild(textField);
        textField = new Text(item.price,labelStyles.subPrice);
        this._priceFields[i] = textField;
        this.addChild(textField);
    }

    this.boundingBox = new App.Rectangle(0,0,this._width,this._itemHeight*l);

    this._render();
};

App.SubCategoryReportList.prototype = Object.create(PIXI.Graphics.prototype);
App.SubCategoryReportList.prototype.constructor = App.SubCategoryReportList;

/**
 * Render
 * @private
 */
App.SubCategoryReportList.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * this._pixelRatio),
        w = this._width - padding * 2,
        h = this.boundingBox.height,
        percentOffset = Math.round(this._width * 0.7),
        i = 0,
        l = 3,
        y = 0,
        textField = null;

    GraphicUtils.drawRects(this,0xffffff,1,[0,0,this._width,h],true,false);

    for (;i<l;i++)
    {
        textField = this._nameFields[i];
        y = Math.round(this._itemHeight * i + (this._itemHeight - textField.height) / 2);
        textField.x = padding;
        textField.y = y;
        textField = this._percentFields[i];
        textField.x = Math.round(percentOffset - textField.width);
        textField.y = y;
        textField = this._priceFields[i];
        textField.x = Math.round(this._width - padding - textField.width);
        textField.y = y;

        if (i > 0) GraphicUtils.drawRects(this,ColorTheme.GREY,1,[padding,this._itemHeight*i,w,1],false,false);
    }

    GraphicUtils.drawRects(this,0xff3366,1,[0,0,Math.round(2 * this._pixelRatio),h],false,true);
};

/**
 * @class ReportCategoryButton
 * @extends ExpandButton
 * @param {Category} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {Object} labelStyles
 * @constructor
 */
App.ReportCategoryButton = function ReportCategoryButton(model,width,height,pixelRatio,labelStyles)
{
    App.ExpandButton.call(this,width,height,false);

    this._model = model;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text(model,labelStyles.categoryName);
    this._percentField = new PIXI.Text("24 %",labelStyles.categoryPercent);
    this._priceField = new PIXI.Text("1,560.00",labelStyles.categoryPrice);
    this._subList = new App.SubCategoryReportList(null,width,pixelRatio,labelStyles);

    this._render();

    this._setContent(this._subList);
    this.addChild(this._subList);
    this.addChild(this._background);
    this.addChild(this._nameField);
    this.addChild(this._priceField);
    this.addChild(this._percentField);
};

App.ReportCategoryButton.prototype = Object.create(App.ExpandButton.prototype);
App.ReportCategoryButton.prototype.constructor = App.ReportCategoryButton;

/**
 * Render
 * @private
 */
App.ReportCategoryButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * this._pixelRatio),
        w = this._width - padding * 2,
        h = this.boundingBox.height;

    //TODO use skin instead
    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,this._width,h],true,false);
    GraphicUtils.drawRects(this._background,0xff3300,1,[0,0,Math.round(4 * this._pixelRatio),h],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,0,w,1],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,h-1,w,1],false,true);

    this._nameField.x = Math.round(15 * this._pixelRatio);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);
    this._percentField.x = Math.round(this._width * 0.7 - this._percentField.width);
    this._percentField.y = Math.round((h - this._percentField.height) / 2);
    this._priceField.x = Math.round(this._width - padding - this._priceField.width);
    this._priceField.y = Math.round((h - this._priceField.height) / 2);
};

/**
 * @class ReportAccountButton
 * @extends ExpandButton
 * @param {Account} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {Object} labelStyles
 * @constructor
 */
App.ReportAccountButton = function ReportAccountButton(model,width,height,pixelRatio,labelStyles)
{
    App.ExpandButton.call(this,width,height,true);

    var ReportCategoryButton = App.ReportCategoryButton,
        itemHeight = Math.round(40 * pixelRatio);

    this._model = model;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;

    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text(model,labelStyles.accountName);
    this._amountField = new PIXI.Text("1,560.00",labelStyles.accountAmount);
    this._categoryList = new App.List(App.Direction.Y);
    this._categoryList.add(new ReportCategoryButton("Entertainment",width,itemHeight,pixelRatio,labelStyles),false);
    this._categoryList.add(new ReportCategoryButton("Food",width,itemHeight,pixelRatio,labelStyles),false);
    this._categoryList.add(new ReportCategoryButton("Household",width,itemHeight,pixelRatio,labelStyles),false);
    this._categoryList.add(new ReportCategoryButton("Shopping",width,itemHeight,pixelRatio,labelStyles),true);

    this._render();

    this._setContent(this._categoryList);
    this.addChild(this._categoryList);
    this.addChild(this._background);
    this.addChild(this._nameField);
    this.addChild(this._amountField);
};

App.ReportAccountButton.prototype = Object.create(App.ExpandButton.prototype);
App.ReportAccountButton.prototype.constructor = App.ReportAccountButton;

/**
 * Render
 * @private
 */
App.ReportAccountButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme;

    GraphicUtils.drawRects(this._background,ColorTheme.BLUE,1,[0,0,this._width,this._height],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.BLUE_DARK,1,[0,this._height-1,this._width,1],false,true);

    this._nameField.x = Math.round(10 * this._pixelRatio);
    this._nameField.y = Math.round((this._height - this._nameField.height) / 2);

    this._amountField.x = Math.round(this._width - this._amountField.width - 10 * this._pixelRatio);
    this._amountField.y = Math.round((this._height - this._amountField.height) / 2);
};

/**
 * Click handler
 * @param {PIXI.InteractionData} pointerData
 */
App.ReportAccountButton.prototype.onClick = function onClick(pointerData)
{
    var position = pointerData.getLocalPosition(this).y,
        TransitionState = App.TransitionState,
        interactiveButton = null;

    // Click on button itself
    if (position <= this._height)
    {
        if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open();
        else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close();
    }
    // Click on category sub-list
    else if (position > this._height)
    {
        interactiveButton = this._categoryList.getItemUnderPoint(pointerData);
        if (interactiveButton) interactiveButton.onClick(position);
    }
};

/**
 * Update layout
 * @private
 */
App.ReportAccountButton.prototype.updateLayout = function updateLayout()
{
    this._categoryList.updateLayout();
    this._updateBounds(true);
    this._updateMask();
};

/**
 * Check if button is in transition
 * @returns {boolean}
 */
App.ReportAccountButton.prototype.isInTransition = function isInTransition()
{
    var inTransition = App.ExpandButton.prototype.isInTransition.call(this),
        i = 0,
        l = this._categoryList.children.length;

    if (this.isOpen())
    {
        for (;i<l;)
        {
            if (this._categoryList.getChildAt(i++).isInTransition())
            {
                inTransition = true;
                break;
            }
        }
    }

    return inTransition;
};

/**
 * @class ReportChartHighlight
 * @extends Graphics
 * @param {Point} center
 * @param {number} width
 * @param {number} height
 * @param {number} thickness
 * @constructor
 */
App.ReportChartHighlight = function ReportChartHighlight(center,width,height,thickness)
{
    PIXI.Graphics.call(this);

    this._width = width;
    this._height = height;
    this._center = center;
    this._thickness = thickness;
    this._oldStart = 0;
    this._oldEnd = 0;
    this._start = 0;
    this._end = 0;
    this._color = 0x000000;
};

App.ReportChartHighlight.prototype = Object.create(PIXI.Graphics.prototype);
App.ReportChartHighlight.prototype.constructor = App.ReportChartHighlight;

/**
 * Change
 * @param {number} start
 * @param {number} end
 * @param {number} color
 */
App.ReportChartHighlight.prototype.change = function change(start,end,color)
{
    this._oldStart = this._start;
    this._oldEnd = this._end;

    this._start = start;
    this._end = end;
    this._color = color;
};

/**
 * Update change by progress passed in
 * @param {number} progress
 */
App.ReportChartHighlight.prototype.update = function update(progress)
{
    var start = this._oldStart + (this._start - this._oldStart) * progress,
        end = this._oldEnd + (this._end - this._oldEnd) * progress;

    App.GraphicUtils.drawArc(this,this._center,this._width,this._height,this._thickness,start,end,20,0,0,0,this._color,1);
};

/**
 * @class ReportChart
 * @extends Graphics
 * @param {Collection} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ReportChart = function ReportChart(model,width,height,pixelRatio)
{
    //TODO if there is just 1 account segments should represent categories of that account; otherwise segment will represent accounts
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Graphics = PIXI.Graphics,
        colors = [0xff0000,0xc066cc,0x0000ff],
        i = 0,
        l = 3,//TODO number of segments calculated from accounts
        segment = null;

    Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._tween = new App.TweenProxy(1,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._transitionState = App.TransitionState.HIDDEN;
    this._eventsRegistered = false;
    this._center = new PIXI.Point(Math.round(width/2),Math.round(height/2));
    this._thickness = Math.round(15 * pixelRatio);
    this._chartSize = width - Math.round(5 * pixelRatio * 2);// 5px margin on sides for highlight line
    this._segments = new Array(l);
    this._highlight = new App.ReportChartHighlight(this._center,width,height,Math.round(3 * pixelRatio));
    this._updateHighlight = false;
    this._highlightSegment = void 0;

    for (;i<l;i++)
    {
        segment = new Graphics();
        this._segments[i] = {graphics:segment,progress:0,color:colors[i]};
        this.addChild(segment);
    }

    this.addChild(this._highlight);
};

App.ReportChart.prototype = Object.create(PIXI.Graphics.prototype);
App.ReportChart.prototype.constructor = App.ReportChart;

/**
 * Show
 */
App.ReportChart.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN)
    {
        this._registerEventListeners();

        this._transitionState = TransitionState.SHOWING;

        this._tween.start();
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.SHOWING;

        this._tween.restart();
    }
};

/**
 * Hide
 */
App.ReportChart.prototype.hide = function hide()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWN)
    {
        this._registerEventListeners();

        this._transitionState = TransitionState.HIDING;

        this._tween.start();
    }
    else if (this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.HIDING;

        this._tween.restart();
    }
};

/**
 * Highlight segment
 * @param {number} segment Segment of the chart to highlight
 */
App.ReportChart.prototype.highlightSegment = function highlightSegment(segment)
{
    if (segment === this._highlightSegment) return;

    if (this._transitionState === App.TransitionState.SHOWN)
    {
        this._registerEventListeners();

        this._highlight.change(
            segment === 0 ? 0 : this._segments[segment-1].progress,
            this._segments[segment].progress,
            this._segments[segment].color
        );

        this._highlightSegment = segment;

        this._updateHighlight = true;

        this._tween.restart();
    }
};

/**
 * Register event listeners
 * @private
 */
App.ReportChart.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._tween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
    }
};

/**
 * UnRegister event listeners
 * @private
 */
App.ReportChart.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._tween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

    this._eventsRegistered = false;
};

/**
 * RAF tick handler
 * @private
 */
App.ReportChart.prototype._onTick = function _onTick()
{
    if (this._tween.isRunning())
    {
        if (this._updateHighlight) this._highlight.update(this._tween.progress);
        else this._updateTween(false);
    }
};

/**
 * Update show hide tween
 * @param {boolean} hiRes Indicate render chart in high-resolution
 * @private
 */
App.ReportChart.prototype._updateTween = function _updateTween(hiRes)
{
    var GraphicUtils = App.GraphicUtils,
        TransitionState = App.TransitionState,
        progress = this._tween.progress,
        i = 0,
        l = this._segments.length,
        steps = hiRes ? 20 : 10,
        start = 0,
        fraction = 0,
        segment = null;

    if (this._transitionState === TransitionState.HIDING || this._transitionState === TransitionState.HIDDEN)
    {
        progress = 1 - progress;
    }

    for (;i<l;i++)
    {
        segment = this._segments[i];
        fraction = (i + 1) * (1 / l);
        segment.progress = 360 * (progress < fraction ? progress : fraction);
        start = i === 0 ? 0 : this._segments[i-1].progress;
        GraphicUtils.drawArc(segment.graphics,this._center,this._chartSize,this._chartSize,this._thickness,start,segment.progress,steps,0,0,0,segment.color,1);
    }
};

/**
 * On Show Hide tween complete
 * @private
 */
App.ReportChart.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING) this._transitionState = TransitionState.SHOWN;
    else if (this._transitionState === TransitionState.HIDING) this._transitionState = TransitionState.HIDDEN;

    this._updateTween(true);

    this._unRegisterEventListeners();

    if (this._updateHighlight)
    {
        this._updateHighlight = false;

        this._highlight.update(1);
    }
};

/**
 * @class ReportScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.ReportScreen = function ReportScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ReportAccountButton = App.ReportAccountButton,
        ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        h = layout.contentHeight,
        r = layout.pixelRatio,
        chartSize = Math.round(h * 0.3 - 20 * r),
        listWidth = Math.round(layout.width - 20 * r),// 10pts padding on both sides
        listHeight = Math.round(h * 0.7),
        itemHeight = Math.round(40 * r),
        labelStyles = {
            accountName:FontStyle.get(20,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            accountAmount:FontStyle.get(16,FontStyle.WHITE),
            categoryName:FontStyle.get(18,FontStyle.BLUE),
            categoryPercent:FontStyle.get(16,FontStyle.GREY_DARK),
            categoryPrice:FontStyle.get(16,FontStyle.BLUE),
            subName:FontStyle.get(14,FontStyle.BLUE),
            subPercent:FontStyle.get(14,FontStyle.GREY_DARK),
            subPrice:FontStyle.get(14,FontStyle.BLUE)
        };

    this._percentField = new PIXI.Text("15 %",FontStyle.get(20,FontStyle.BLUE));//TODO set font size proportionally to chart size
    this._chart = new App.ReportChart(null,chartSize,chartSize,r);
    this._buttonList = new App.TileList(App.Direction.Y,listHeight);
    this._buttonList.add(new ReportAccountButton("Private",listWidth,itemHeight,r,labelStyles),false);
    this._buttonList.add(new ReportAccountButton("Travel",listWidth,itemHeight,r,labelStyles),false);
    this._buttonList.add(new ReportAccountButton("Business",listWidth,itemHeight,r,labelStyles),true);

    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,listWidth,listHeight,r,true);
    this._pane.setContent(this._buttonList);

    this._interactiveButton = null;
    this._layoutDirty = false;

    this._updateLayout();

    this.addChild(this._percentField);
    this.addChild(this._chart);
    this.addChild(this._pane);
};

App.ReportScreen.prototype = Object.create(App.Screen.prototype);
App.ReportScreen.prototype.constructor = App.ReportScreen;

/**
 * Enable
 */
App.ReportScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.ReportScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._layoutDirty = false;

    this._pane.disable();
};

/**
 * On screen show/hide tween complete
 * @private
 */
App.ReportScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    this._chart.show();
};

/**
 * Update layout
 * @private
 */
App.ReportScreen.prototype._updateLayout = function _updateLayout()
{
    var w = this._layout.width,
        padding = Math.round(10 * this._layout.pixelRatio),
        chartBounds = this._chart.boundingBox;

    this._percentField.x = Math.round((w - this._percentField.width) / 2);
    this._percentField.y = Math.round(padding + (chartBounds.height - this._percentField.height) / 2);

    this._chart.x = Math.round((w - chartBounds.width) / 2);
    this._chart.y = padding;

    this._pane.x = padding;
    this._pane.y = Math.round(this._layout.contentHeight * 0.3);
};

/**
 * On tick
 * @private
 */
App.ReportScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._layoutDirty)
    {
        this._layoutDirty = this._buttonsInTransition();

        this._updateListLayout(false);
    }
};

/**
 * Close opened buttons
 * @private
 */
App.ReportScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        if (button !== this._interactiveButton && button.isOpen()) button.close(immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.ReportScreen.prototype._onClick = function _onClick()
{
    var pointerData = this.stage.getTouchData();

    this._interactiveButton = this._buttonList.getItemUnderPoint(pointerData);

    if (this._interactiveButton)
    {
        this._interactiveButton.onClick(pointerData);
        this._pane.cancelScroll();
        this._closeButtons();

        this._chart.highlightSegment(this._buttonList.getChildIndex(this._interactiveButton));

        this._layoutDirty = true;
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.ReportScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(
            App.ScreenName.MENU,
            0,
            null,
            HeaderAction.NONE,
            HeaderAction.CANCEL,
            App.ScreenTitle.MENU
        ));
    }
};

/**
 * Update list layout
 * @private
 */
App.ReportScreen.prototype._updateListLayout = function _updateListLayout()
{
    if (this._interactiveButton) this._interactiveButton.updateLayout();
    this._buttonList.updateLayout(true);
    this._pane.resize();
};

/**
 * Check if buttons are in transition
 * @returns {boolean}
 * @private
 */
App.ReportScreen.prototype._buttonsInTransition = function _buttonsInTransition()
{
    var i = 0,
        l = this._buttonList.children.length,
        inTransition = false;

    for (;i<l;)
    {
        if (this._buttonList.getChildAt(i++).isInTransition())
        {
            inTransition = true;
            break;
        }
    }

    return inTransition;
};

/**
 * @class CurrencyButton
 * @extends DisplayObjectContainer
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {PIXI.Texture} options.skin
 * @param {{font:string,fill:string}} options.symbolLabelStyle
 * @constructor
 */
App.CurrencyButton = function CurrencyButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new PIXI.Rectangle(0,0,options.width,options.height);

    this._model = null;

    this._pixelRatio = options.pixelRatio;
    this._skin = this.addChild(new PIXI.Sprite(options.skin));
    this._symbolLabel = this.addChild(new PIXI.Text("",options.symbolLabelStyle));
    this._renderAll = true;

    this._render();
};

App.CurrencyButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CurrencyButton.prototype.constructor = App.CurrencyButton;

/**
 * @method render
 * @private
 */
App.CurrencyButton.prototype._render = function _render()
{
    if (this._renderAll)
    {
        this._renderAll = false;

        this._symbolLabel.x = Math.round(20 * this._pixelRatio);
        this._symbolLabel.y = Math.round((this.boundingBox.height - this._symbolLabel.height) / 2);
    }
};

/**
 * Set model
 * @param {App.CurrencySymbol} model
 */
App.CurrencyButton.prototype.setModel = function getModel(model)
{
    this._model = model;

    this._symbolLabel.setText(this._model.symbol);
};

/**
 * Click handler
 * @param {PIXI.InteractionData} data
 */
App.CurrencyButton.prototype.onClick = function onClick(data)
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    changeScreenData.updateBackScreen = true;

    App.Controller.dispatchEvent(EventType.CHANGE_TRANSACTION,{
        type:EventType.CHANGE,
        currency:this._model,
        nextCommand:new App.ChangeScreen(),
        nextCommandData:changeScreenData
    });
};

/**
 * @class CurrencyScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CurrencyScreen = function CurrencyScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        h = layout.contentHeight,
        w = layout.width,
        r = layout.pixelRatio,
        buttonOptions = {
            width:w,
            height:Math.round(50 * r),
            pixelRatio:r,
            skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,
            symbolLabelStyle:FontStyle.get(18,FontStyle.BLUE)
        };

    this._model = App.ModelLocator.getProxy(App.ModelName.CURRENCY_SYMBOLS);

    this._interactiveButton = null;
    this._buttonPool = new App.ObjectPool(App.CurrencyButton,4,buttonOptions);
    this._buttonList = new App.VirtualList(this._buttonPool,App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false));
    this._pane.setContent(this._buttonList);

    this._initialized = false;
};

App.CurrencyScreen.prototype = Object.create(App.Screen.prototype);
App.CurrencyScreen.prototype.constructor = App.CurrencyScreen;

/**
 * Enable
 */
App.CurrencyScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.CurrencyScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Update
 * @param {App.Collection} data
 * @param {string} mode
 * @private
 */
App.CurrencyScreen.prototype.update = function update(data,mode)
{
    if (this._initialized)
    {
        this._pane.resetScroll();
        this._buttonList.reset();
    }
    else
    {
        this._initialized = true;

        this._buttonList.update(this._model.copySource());
        this._pane.resize();
    }
};

/**
 * Click handler
 * @private
 */
App.CurrencyScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button) button.onClick(data);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CurrencyScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    /*var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.MENU,0,null,HeaderAction.NONE,HeaderAction.CANCEL,App.ScreenTitle.MENU));
    }
    else if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(App.ScreenName.BACK));
    }*/
};

/**
 * @class CurrencyPairButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {PIXI.Texture} options.skin
 * @param {{font:string,fill:string}} options.editLabelStyle
 * @param {{font:string,fill:string}} options.pairLabelStyle
 * @param {{font:string,fill:string}} options.rateLabelStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.CurrencyPairButton = function CurrencyPairButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new PIXI.Rectangle(0,0,options.width,options.height);

    this._model = null;

    this._pixelRatio = options.pixelRatio;
    this._background = this.addChild(new PIXI.Graphics());
    this._editLabel = this.addChild(new PIXI.Text("Edit",options.editLabelStyle));
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._skin = this._swipeSurface.addChild(new PIXI.Sprite(options.skin));
    this._pairLabel = this._swipeSurface.addChild(new PIXI.Text("EUR/USD",options.pairLabelStyle));
    this._rateLabel = this._swipeSurface.addChild(new PIXI.Text("@ 1.0",options.rateLabelStyle));
    this._renderAll = true;

    this._render();
};

App.CurrencyPairButton.prototype = Object.create(App.SwipeButton.prototype);
App.CurrencyPairButton.prototype.constructor = App.CurrencyPairButton;

/**
 * @method render
 * @private
 */
App.CurrencyPairButton.prototype._render = function _render()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height,
        r = this._pixelRatio,
        offset = Math.round(15 * r);

    App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

    this._editLabel.x = Math.round(w - 50 * this._pixelRatio);
    this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

    this._pairLabel.x = offset;
    this._pairLabel.y = Math.round((h - this._pairLabel.height) / 2);

    this._rateLabel.x = Math.round(offset + this._pairLabel.width + 5 * r);
    this._rateLabel.y = Math.round((h - this._rateLabel.height) / 2);
};

/**
 * Set model
 * @param {App.CurrencyPair} model
 */
App.CurrencyPairButton.prototype.setModel = function setModel(model)
{
    this._model = model;

    this._pairLabel.setText(model.base+"/"+model.symbol);
    this._rateLabel.setText("@ "+model.rate);
};

/**
 * Click handler
 * @param {InteractionData} interactionData
 */
App.CurrencyPairButton.prototype.onClick = function onClick(interactionData)
{
    if (this._isOpen && interactionData.getLocalPosition(this).x >= this._width - this._openOffset)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            App.ScreenName.EDIT_CURRENCY_RATE,
            App.ScreenMode.EDIT,
            this._model,
            0,
            0,
            App.ScreenTitle.EDIT_CURRENCY_RATE
        ));
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.CurrencyPairButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.CurrencyPairButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};

/**
 * @class CurrencyPairScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.CurrencyPairScreen = function CurrencyPairScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        h = layout.contentHeight,
        w = layout.width,
        r = layout.pixelRatio,
        buttonOptions = {
            width:w,
            height:Math.round(50 * r),
            pixelRatio:r,
            skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,
            editLabelStyle:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            pairLabelStyle:FontStyle.get(18,FontStyle.BLUE),
            rateLabelStyle:FontStyle.get(18,FontStyle.BLUE,null,FontStyle.LIGHT_CONDENSED),
            openOffset:Math.round(80 * r)
        };

    this._model = App.ModelLocator.getProxy(App.ModelName.CURRENCY_PAIRS);

    this._interactiveButton = null;
    this._buttonPool = new App.ObjectPool(App.CurrencyPairButton,4,buttonOptions);
    this._buttonList = new App.VirtualList(this._buttonPool,App.Direction.Y,w,h,r);
    this._pane = this.addChild(new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false));
    this._pane.setContent(this._buttonList);

    this._swipeEnabled = true;
    this._initialized = false;
};

App.CurrencyPairScreen.prototype = Object.create(App.Screen.prototype);
App.CurrencyPairScreen.prototype.constructor = App.CurrencyPairScreen;

/**
 * Enable
 */
App.CurrencyPairScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Disable
 */
App.CurrencyPairScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Update
 * @param {App.Collection} data
 * @param {string} mode
 * @private
 */
App.CurrencyPairScreen.prototype.update = function update(data,mode)
{
    if (this._initialized)
    {
        this._pane.resetScroll();
        this._buttonList.reset();
    }
    else
    {
        this._initialized = true;

        this._buttonList.update(this._model.copySource());
        this._pane.resize();
    }
};

/**
 * On tween complete
 * @private
 */
App.CurrencyPairScreen.prototype._onTweenComplete = function _onTweenComplete()
{
    App.Screen.prototype._onTweenComplete.call(this);

    if (this._transitionState === App.TransitionState.HIDDEN) this._closeButtons(true);
};

/**
 * Called when swipe starts
 * @param {boolean} [preferScroll=false]
 * @param {string} direction
 * @private
 */
App.CurrencyPairScreen.prototype._swipeStart = function _swipeStart(preferScroll,direction)
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData());

    if (button)
    {
        if (!preferScroll) this._pane.cancelScroll();

        this._interactiveButton = button;
        this._interactiveButton.swipeStart(direction);

        this._closeButtons(false);
    }
};

/**
 * Called when swipe ends
 * @private
 */
App.CurrencyPairScreen.prototype._swipeEnd = function _swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.CurrencyPairScreen.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.children.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getChildAt(i++);
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Click handler
 * @private
 */
App.CurrencyPairScreen.prototype._onClick = function _onClick()
{
    var data = this.stage.getTouchData(),
        button = this._buttonList.getItemUnderPoint(data);

    if (button) button.onClick(data);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CurrencyPairScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(
            App.ScreenName.MENU,
            0,
            null,
            HeaderAction.NONE,
            HeaderAction.CANCEL,
            App.ScreenTitle.MENU
        ));
    }
};

/**
 * @class EditCurrencyPairScreen
 * @param {Object} layout
 * @constructor
 */
App.EditCurrencyPairScreen = function EditCurrencyPairScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var r = layout.pixelRatio;

    this._background = this.addChild(new PIXI.Graphics());
    this._pairLabel = this.addChild(new PIXI.Text("EUR / USD",App.FontStyle.get(24,App.FontStyle.BLUE)));
    this._input = this.addChild(new App.Input("",20,Math.round(layout.width - this._pairLabel.width - Math.round(50 * r)),Math.round(40 * r),r));

    this._input.restrict(/\d{1,}(\.\d*){0,1}/g);

    this._render();
};

App.EditCurrencyPairScreen.prototype = Object.create(App.Screen.prototype);
App.EditCurrencyPairScreen.prototype.constructor = App.EditCurrencyPairScreen;

/**
 * Render
 * @private
 */
App.EditCurrencyPairScreen.prototype._render = function _render()
{
    var r = this._layout.pixelRatio,
        w = this._layout.width,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r);

    this._pairLabel.x = padding * 2;
    this._pairLabel.y = Math.round(22 * r);

    this._input.x = Math.round(w - padding - this._input.width);
    this._input.y = padding;

    App.GraphicUtils.drawRect(this._background,App.ColorTheme.GREY,1,0,0,w,inputHeight);
};

/**
 * Enable
 */
App.EditCurrencyPairScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
};

/**
 * Disable
 */
App.EditCurrencyPairScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
};

/**
 * Update
 * @param {App.CurrencyPair} model
 * @param {string} mode
 */
App.EditCurrencyPairScreen.prototype.update = function update(model,mode)
{
    this._model = model;

    this._pairLabel.setText(this._model.base+" / "+this._model.symbol);
    this._input.setValue(this._model.rate);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditCurrencyPairScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);
    changeScreenData.updateBackScreen = true;

    this._input.blur();

    //TODO check first if value is set

    if (action === App.HeaderAction.CONFIRM)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_CURRENCY_PAIR,{
            currencyPair:this._model,
            rate:this._input.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
};

/**
 * @class MenuItem
 * @extends Graphics
 * @param {string} label
 * @param {string} iconName
 * @param {number} screenName
 * @param {{width:number,height:number,pixelRatio:number,style:Object}} options
 * @constructor
 */
App.MenuItem = function MenuItem(label,iconName,screenName,options)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._screenName = screenName;
    this._pixelRatio = options.pixelRatio;
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._iconResizeRatio = Math.round(22 * options.pixelRatio) / this._icon.height;
    this._labelField = new PIXI.Text(label,options.style);

    this._render();

    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.MenuItem.prototype = Object.create(PIXI.Graphics.prototype);
App.MenuItem.prototype.constructor = App.MenuItem;

/**
 * Render
 * @private
 */
App.MenuItem.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        h = this.boundingBox.height;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round(15 * this._pixelRatio);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = ColorTheme.WHITE;

    this._labelField.x = Math.round(60 * this._pixelRatio);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);

    App.GraphicUtils.drawRect(this,ColorTheme.BLUE,1,0,0,this.boundingBox.width,h);
};

/**
 * Return associated screen name
 * @returns {number}
 */
App.MenuItem.prototype.getScreenName = function getScreenName()
{
    return this._screenName;
};

/**
 * @class Menu
 * @param {Object} layout
 * @constructor
 */
App.Menu = function Menu(layout)
{
    App.Screen.call(this,layout);

    var MenuItem = App.MenuItem,
        ScreenName = App.ScreenName,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        itemLabelStyle = FontStyle.get(20,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
        itemOptions = {
            width:w,
            height:Math.round(40 * r),
            pixelRatio:r,
            style:itemLabelStyle
        };

    this._addTransactionItem = new MenuItem("Add Transaction","transactions",ScreenName.ADD_TRANSACTION,{width:w,height:Math.round(50*r),pixelRatio:r,style:itemLabelStyle});
    this._accountsItem = new MenuItem("Accounts","account",ScreenName.ACCOUNT,itemOptions);
    this._reportItem = new MenuItem("Report","chart",ScreenName.REPORT,itemOptions);
    this._budgetItem = new MenuItem("Budgets","budget",-1,itemOptions);
    this._transactionsItem = new MenuItem("Transactions","transactions",ScreenName.TRANSACTIONS,itemOptions);
    this._currenciesItem = new MenuItem("Currencies","currencies",ScreenName.CURRENCY_PAIRS,itemOptions);
    this._settignsItem = new MenuItem("Settings","settings-app",-1,itemOptions);
    this._container = new PIXI.Graphics();
    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._background = new PIXI.Graphics();
    this._items = [];

    this._render();

    this.addChild(this._background);
    this._items.push(this._container.addChild(this._addTransactionItem));
    this._items.push(this._container.addChild(this._accountsItem));
    this._items.push(this._container.addChild(this._reportItem));
    this._items.push(this._container.addChild(this._budgetItem));
    this._items.push(this._container.addChild(this._transactionsItem));
    this._items.push(this._container.addChild(this._currenciesItem));
    this._items.push(this._container.addChild(this._settignsItem));
    this._pane.setContent(this._container);
    this.addChild(this._pane);
};

App.Menu.prototype = Object.create(App.Screen.prototype);
App.Menu.prototype.constructor = App.Menu;

/**
 * Render
 * @private
 */
App.Menu.prototype._render = function _render()
{
    var r = this._layout.pixelRatio,
        smallGap = Math.round(2 * r),
        bigGap = Math.round(25 * r),
        GraphicUtils = App.GraphicUtils,
        bgColor = App.ColorTheme.BLUE_DARK;

    this._accountsItem.y = this._addTransactionItem.boundingBox.height + bigGap;
    this._reportItem.y = this._accountsItem.y + this._accountsItem.boundingBox.height + smallGap;
    this._budgetItem.y = this._reportItem.y + this._reportItem.boundingBox.height + smallGap;
    this._transactionsItem.y = this._budgetItem.y + this._budgetItem.boundingBox.height + smallGap;
    this._currenciesItem.y = this._transactionsItem.y + this._transactionsItem.boundingBox.height + bigGap;
    this._settignsItem.y = this._currenciesItem.y + this._currenciesItem.boundingBox.height + smallGap;

    GraphicUtils.drawRect(this._container,bgColor,1,0,0,this._layout.width,this._settignsItem.y+this._settignsItem.boundingBox.height);
    GraphicUtils.drawRect(this._background,bgColor,1,0,0,this._layout.width,this._layout.contentHeight);
};

/**
 * Enable
 */
App.Menu.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._registerEventListeners(App.EventLevel.LEVEL_1);
        this._registerEventListeners(App.EventLevel.LEVEL_2);

        this._pane.enable();

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Menu.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Click handler
 * @private
 */
App.Menu.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var ScreenName = App.ScreenName,
        ScreenTitle = App.ScreenTitle,
        HeaderAction = App.HeaderAction,
        item = this._getItemByPosition(this.stage.getTouchData().getLocalPosition(this._container).y),
        screenName = item ? item.getScreenName() : ScreenName.BACK,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(screenName,0,null,HeaderAction.MENU,HeaderAction.ADD_TRANSACTION);

    switch (screenName)
    {
        case ScreenName.ADD_TRANSACTION:
            App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
                type:App.EventType.CREATE,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData.update()
            });
            break;

        case ScreenName.ACCOUNT:
            changeScreenData.screenMode = App.ScreenMode.EDIT;
            changeScreenData.headerName = ScreenTitle.ACCOUNTS;
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;

        case ScreenName.REPORT:
            changeScreenData.headerName = ScreenTitle.REPORT;
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;

        case ScreenName.TRANSACTIONS:
            changeScreenData.headerName = ScreenTitle.TRANSACTIONS;
            changeScreenData.updateData = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).copySource().reverse();
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;

        case ScreenName.CURRENCY_PAIRS:
            changeScreenData.screenMode = App.ScreenMode.EDIT;
            changeScreenData.headerName = ScreenTitle.CURRENCY_PAIRS;
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
            break;
    }
};

/**
 * Return item by position passed in
 * @param {number} position
 * @return {MenuItem}
 * @private
 */
App.Menu.prototype._getItemByPosition = function _getItemByPosition(position)
{
    var i = 0,
        l = this._items.length,
        item = null;

    for (;i<l;)
    {
        item = this._items[i++];
        if (position >= item.y && position < item.y + item.boundingBox.height) return item;
    }

    return null;
};

/**
 * @class ApplicationView
 * @extends DisplayObjectContainer
 * @param {Stage} stage
 * @param {CanvasRenderer} renderer
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ApplicationView = function ApplicationView(stage,renderer,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        listenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this._renderer = renderer;
    this._stage = stage;

    this._layout = {
        originalWidth:width,
        originalHeight:height,
        width:Math.round(width * pixelRatio),
        height:Math.round(height * pixelRatio),
        headerHeight:Math.round(50 * pixelRatio),
        contentHeight:Math.round((height - 50) * pixelRatio),
        pixelRatio:pixelRatio
    };

    //TODO do I need event dispatcher here?
    this._eventDispatcher = new App.EventDispatcher(listenerPool);
    this._background = new PIXI.Graphics();

    //TODO use ScreenFactory for the screens?
    //TODO deffer initiation and/or rendering of most of the screens?
    this._screenStack = ViewLocator.addViewSegment(ViewName.SCREEN_STACK,new App.ViewStack([
        new App.AccountScreen(this._layout),
        new App.CategoryScreen(this._layout),
        new App.SelectTimeScreen(this._layout),
        new App.EditCategoryScreen(this._layout),
        new App.TransactionScreen(this._layout),
        new App.ReportScreen(this._layout),
        new App.AddTransactionScreen(this._layout),
        new App.EditScreen(this._layout),
        new App.CurrencyPairScreen(this._layout),
        new App.EditCurrencyPairScreen(this._layout),
        new App.CurrencyScreen(this._layout),
        new App.Menu(this._layout)
    ],false,listenerPool));

    this._header = ViewLocator.addViewSegment(ViewName.HEADER,new App.Header(this._layout));

    this._init();

    this.addChild(this._background);
    this.addChild(this._screenStack);
    this.addChild(this._header);
};

App.ApplicationView.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ApplicationView.prototype.constructor = App.ApplicationView;

/**
 * Init
 * @private
 */
App.ApplicationView.prototype._init = function _init()
{
    App.GraphicUtils.drawRect(this._background,0xbada55,1,0,0,this._layout.width,this._layout.height);

    this.scrollTo(0);

    this._registerEventListeners();

    this._screenStack.y = this._layout.headerHeight;
};

/**
 * Register event listeners
 *
 * @method _registerEventListeners
 * @private
 */
App.ApplicationView.prototype._registerEventListeners = function _registerEventListeners()
{
    var EventType = App.EventType;

    this._screenStack.addEventListener(EventType.CHANGE,this,this._onScreenChange);

    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(EventType.TICK,this,this._onTick);
};

/**
 * On screen change
 * @private
 */
App.ApplicationView.prototype._onScreenChange = function _onScreenChange()
{
    this._screenStack.show();
    this._screenStack.hide();
};

/**
 * Scroll to value passed in
 * @param {number} value
 */
App.ApplicationView.prototype.scrollTo = function scrollTo(value)
{
    if (document.documentElement && document.documentElement.scrollTop) document.documentElement.scrollTop = value;
    else document.body.scrollTop = value;
};

/**
 * On Ticker's  Tick event
 *
 * @method _onTick
 * @private
 */
App.ApplicationView.prototype._onTick = function _onTick()
{
    //TODO do not render if nothing happens (prop 'dirty'?) - drains battery
    this._renderer.render(this._stage);
};

/**
 * On resize
 * @private
 */
App.ApplicationView.prototype._onResize = function _onResize()
{
    //this.scrollTo(0);
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ApplicationView.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.ApplicationView.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Easing functions
 * @enum {Function}
 * @type {{
 *      linear: Function,
 *      inQuad: Function,
 *      outQuad: Function,
 *      inOutQuad: Function,
 *      inCubic: Function,
 *      outCubic: Function,
 *      inOutCubic: Function,
 *      inExpo: Function,
 *      outExpo: Function,
 *      inOutExpo: Function,
 *      inElastic: Function,
 *      outElastic: Function,
 *      inOutElastic: Function}}
 */
App.Easing = {
    linear: function(t) {
        return t;
    },
    /**
     * @property inQuad
     * @static
     */
    inQuad: function(t) {
        return t*t;
    },

    /**
     * @property outQuad
     * @static
     */
    outQuad: function(t) {
        return -(t-=1)*t+1;
    },

    /**
     * @property inOutQuad
     * @static
     */
    inOutQuad: function(t) {
        if ((t/=.5) < 1) return .5*t*t;
        return -.5*((--t)*(t-2) - 1);
    },

    /**
     * @property inCubic
     * @static
     */
    inCubic: function(t) {
        return t*t*t;
    },

    /**
     * @property outCubic
     * @static
     */
    outCubic: function(t) {
        return ((--t)*t*t + 1);
    },

    /**
     * @property inOutCubic
     * @static
     */
    inOutCubic: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t;
        return .5*((t-=2)*t*t + 2);
    },

    /**
     * @property inExpo
     * @static
     */
    inExpo: function(t) {
        return (t===0) ? 0.0 : Math.pow(2, 10 * (t - 1));
    },

    /**
     * @property outExpo
     * @static
     */
    outExpo: function(t) {
        return (t===1.0) ? 1.0 : (1-Math.pow(2, -10 * t));
    },

    /**
     * @property inOutExpo
     * @static
     */
    inOutExpo: function(t) {
        if (t===0) return 0.0;
        if (t===1.0) return 1.0;
        if ((t/=.5) < 1) return .5 * Math.pow(2, 10 * (t - 1));
        return .5 * (-Math.pow(2, -10 * --t) + 2);
    },

    /**
     * @property inElastic
     * @static
     */
    inElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/ p));
    },

    /**
     * @property outElastic
     * @static
     */
    outElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return a*Math.pow(2,-10*t) * Math.sin((t-s)*(2*Math.PI)/p) + 1.0;
    },

    /**
     * @property inOutElastic
     * @static
     */
    inOutElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if ((t/=.5)===2) return 1.0;  if (!p) p=(.3*1.5);
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p));
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p)*.5 + 1.0;
    }
};

/**
 * @class TweenProxy
 * @param {number} duration
 * @param {Function} ease
 * @param {number} defaultProgress
 * @param {ObjectPool} eventListenerPool
 * @extends {EventDispatcher}
 * @constructor
 */
App.TweenProxy = function TweenProxy(duration,ease,defaultProgress,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this.progress = defaultProgress || 0.0;

    this._interval = -1;
    this._running = false;
    this._reversed = false;

    this._start = -1.0;
    this._end = -1.0;
    this._reversedEnd = -1.0;
    this._now = -1.0;
    this._duration = duration * 1000 || 1000;
    this._ease = ease || App.Easing.linear;
    this._timeStamp = window.performance && window.performance.now ? window.performance : Date;
    this._intervalReference = this._tweenInterval.bind(this);
};

App.TweenProxy.prototype = Object.create(App.EventDispatcher.prototype);
App.TweenProxy.prototype.constructor = App.TweenProxy;

/**
 * Set easing function
 * @method setEase
 * @param {Function} value
 */
App.TweenProxy.prototype.setEase = function setEase(value)
{
    this._ease = value;
};

/**
 * Start
 * @method start
 * @param {boolean} [reverseIfRunning=false] - reverse the tween if the tween is currently running
 * @param {Function} [ease=null] - set new ease
 */
App.TweenProxy.prototype.start = function start(reverseIfRunning,ease)
{
    if (ease) this.setEase(ease);

    if (!this._running)
    {
        this._running = true;
        this._reversed = false;

        this._tween();
    }
    else
    {
        if (reverseIfRunning)
        {
            if (this._reversed)
            {
                this._reversed = false;
            }
            else
            {
                this._reversed = true;
                this._reversedEnd = this._start + (this._now - this._start) * 2;
            }
        }
    }
};

/**
 * Stop
 * @method stop
 */
App.TweenProxy.prototype.stop = function stop()
{
    this._running = false;

    clearInterval(this._interval);
    this._interval = -1;
};

/**
 * Restart
 * @method restart
 */
App.TweenProxy.prototype.restart = function restart()
{
    if (this._running) this.stop();

    this.start();
};

/**
 * Is tween running?
 * @method isRunning
 * @returns {boolean}
 */
App.TweenProxy.prototype.isRunning = function isRunning()
{
    return this._running;
};

/**
 * Tween
 * @method _tween
 * @private
 */
App.TweenProxy.prototype._tween = function _tween()
{
    if (this._interval > 0)
    {
        clearInterval(this._interval);
        this._interval = -1.0;
    }

    this.progress = 0.0;

    this._start = this._timeStamp.now();
    this._end = this._start + this._duration;
    this._interval = setInterval(this._intervalReference,1000/120);
};

/**
 * Tween interval function
 * @method _tweenInterval
 * @private
 */
App.TweenProxy.prototype._tweenInterval = function _tweenInterval()
{
    this._now = this._timeStamp.now();

    var end = this._reversed ? this._reversedEnd : this._end;
    var progress = (this._duration - (end - this._now)) / this._duration;
    if (progress < 0) progress = 0.0;
    else if (progress > 1) progress = 1.0;

    this.progress = this._ease(progress);
    if(this._now >= end)
    {
        this.progress = 1.0;
        this.stop();

        this.dispatchEvent(App.EventType.COMPLETE);
    }
};

/**
 * Destroy
 */
App.TweenProxy.prototype.destroy = function destroy()
{
    App.EventDispatcher.prototype.destroy.call(this);

    this.stop();

    this._intervalReference = null;
    this._timeStamp = null;
    this._ease = null;
};
/**
 * @class Ticker
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Ticker = function Ticker(eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this._rafListener = this._raf.bind(this);
    this._isRunning = false;
};

App.Ticker.prototype = Object.create(App.EventDispatcher.prototype);
App.Ticker.prototype.constructor = App.Ticker;

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Ticker.prototype.addEventListener = function(eventType,scope,listener)
{
    App.EventDispatcher.prototype.addEventListener.call(this,eventType,scope,listener);

    if (!this._isRunning)
    {
        this._isRunning = true;

        window.requestAnimationFrame(this._rafListener);
    }
};

/**
 * Remove event listeners
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Ticker.prototype.removeEventListener = function(eventType,scope,listener)
{
    App.EventDispatcher.prototype.removeEventListener.call(this,eventType,scope,listener);

    if (this._listeners.length === 0) this._isRunning = false;
};

/**
 * Remove all listeners
 */
App.Ticker.prototype.removeAllListeners = function()
{
    App.EventDispatcher.prototype.removeAllListeners.call(this);

    this._isRunning = false;
};

/**
 * Animation function
 * @private
 */
App.Ticker.prototype._raf = function _raf()
{
    if (this._isRunning)
    {
        window.requestAnimationFrame(this._rafListener);

        this.dispatchEvent(App.EventType.TICK);
    }
};

/**
 * @class Controller
 * @type {{_eventListenerPool:ObjectPool,_eventCommandMap: {}, _commands: Array, _init: Function, _onCommandComplete: Function, _destroyCommand: Function, dispatchEvent: Function}}
 */
App.Controller = {
    _eventListenerPool:null,
    _eventCommandMap:{},
    /** @type {Array.<Command>} */
    _commands:[],

    /**
     * Init
     * @param {ObjectPool} eventListenerPool
     * @param {Array.<>} eventMap
     */
    init:function init(eventListenerPool,eventMap)
    {
        this._eventListenerPool = eventListenerPool;

        var i = 0,
            l = eventMap.length;

        for (;i<l;) this._eventCommandMap[eventMap[i++]] = {constructor:eventMap[i++]};
    },

    /**
     * On command complete
     * @param {*} data
     * @private
     */
    _onCommandComplete:function _onCommandComplete(data)
    {
        this._destroyCommand(data);
    },

    /**
     * Destroy command
     * @param {Command} command
     * @private
     */
    _destroyCommand:function _destroyCommand(command)
    {
        var i = 0, l = this._commands.length, cmd = null;
        for (;i<l;)
        {
            cmd = this._commands[i++];
            if (cmd === command)
            {
                cmd.removeEventListener(App.EventType.COMPLETE,this,this._onCommandComplete);
                cmd.destroy();
                this._commands.splice(i,1);
                break;
            }
        }
    },

    /**
     * Dispatch event passed in
     * @param {string} eventType
     * @param {*} [data=null] Defaults to null
     * @param {boolean} [checkRunningInstances=false] Defaults to false
     */
    dispatchEvent:function dispatchEvent(eventType,data,checkRunningInstances)
    {
        /** @type {Function} */var commandConstructor = this._eventCommandMap[eventType].constructor;
        if (commandConstructor)
        {
            /** @type {Command} */var cmd = null;

            // First check, if multiple instances of this Command are allowed
            // If not, destroy running instances, before executing new one
            if (checkRunningInstances)
            {
                var i = 0, l = this._commands.length;
                for (;i<l;)
                {
                    cmd = this._commands[i++];
                    if (cmd instanceof commandConstructor && !cmd.allowMultipleInstances)
                    {
                        this._destroyCommand(cmd);
                    }
                }
            }

            // Execute command
            cmd = /** @type {Command} */new commandConstructor(this._eventListenerPool);

            this._commands.push(cmd);

            cmd.addEventListener(App.EventType.COMPLETE,this,this._onCommandComplete);
            cmd.execute(data);
        }
    }
};

/**
 * The Command
 * @class Command
 * @extends {EventDispatcher}
 * @param allowMultipleInstances {boolean}
 * @param eventListenerPool {ObjectPool}
 */
App.Command = function Command(allowMultipleInstances,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this.allowMultipleInstances = allowMultipleInstances;
};

App.Command.prototype = Object.create(App.EventDispatcher.prototype);
App.Command.prototype.constructor = App.Command;

/**
 * Execute a command
 * @param {*=} data Defaults to null
 */
App.Command.prototype.execute = function execute(data) {};

/**
 * Destroy current instance
 *
 * @method destroy
 */
App.Command.prototype.destroy = function destroy()
{
    App.EventDispatcher.prototype.destroy.call(this);
};

/**
 * @class SequenceCommand
 * @extends Command
 * @param {boolean} allowMultipleInstances
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.SequenceCommand = function SequenceCommand(allowMultipleInstances,eventListenerPool)
{
    App.Command.call(this,allowMultipleInstances,eventListenerPool);

    this._nextCommand = null;
    this._nextCommandData = null;
};

App.SequenceCommand.prototype = Object.create(App.Command.prototype);
App.SequenceCommand.prototype.constructor = App.SequenceCommand;

/**
 * Execute next command
 * @param {*} [data=null]
 * @private
 */
App.SequenceCommand.prototype._executeNextCommand = function _executeNextCommand(data)
{
    this._nextCommand.addEventListener(App.EventType.COMPLETE,this,this._onNextCommandComplete);
    this._nextCommand.execute(data);
};

/**
 * On next command complete
 * @private
 */
App.SequenceCommand.prototype._onNextCommandComplete = function _onNextCommandComplete()
{
    this._nextCommand.removeEventListener(App.EventType.COMPLETE,this,this._onNextCommandComplete);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Destroy current instance
 *
 * @method destroy
 */
App.SequenceCommand.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    if (this._nextCommand)
    {
        this._nextCommand.destroy();
        this._nextCommand = null;
    }

    this._nextCommandData = null;
};

/**
 * @class LoadData
 * @extends {Command}
 * @param {ObjectPool} pool
 * @constructor
 */
App.LoadData = function LoadData(pool)
{
    App.Command.call(this,false,pool);

    this._jsonLoader = null;
    this._fontLoadingInterval = -1;
    this._fontInfoElement = null;
    this._icons = null;
};

App.LoadData.prototype = Object.create(App.Command.prototype);
App.LoadData.prototype.constructor = App.LoadData;

/**
 * Execute the command
 *
 * @method execute
 */
App.LoadData.prototype.execute = function execute()
{
    this._loadAssets();
};

/**
 * Load image assets
 *
 * @method _loadAssets
 * @private
 */
App.LoadData.prototype._loadAssets = function _loadAssets()
{
    this._jsonLoader = new PIXI.JsonLoader("./data/icons-big.json");

    this._jsonLoader.on("loaded",function()
    {
        this._icons = this._jsonLoader.json.frames;
        this._jsonLoader.removeAllListeners("loaded");
        this._jsonLoader = null;

        this._loadFont();
    }.bind(this));

    this._jsonLoader.load();
};

/**
 * Set app font and check if it is loaded
 *
 * @method _loadFont
 * @private
 */
App.LoadData.prototype._loadFont = function _loadFont()
{
    this._fontInfoElement = document.getElementById("fontInfo");

    var FontStyle = App.FontStyle,
        fontInfoWidth = this._fontInfoElement.offsetWidth,
        fontsLoaded = 0;

    this._fontLoadingInterval = setInterval(function()
    {
        if (this._fontInfoElement.offsetWidth !== fontInfoWidth)
        {
            fontsLoaded++;

            if (fontsLoaded === 1)
            {
                fontInfoWidth = this._fontInfoElement.offsetWidth;

                this._fontInfoElement.style.fontFamily = FontStyle.LIGHT_CONDENSED;
            }
            else if (fontsLoaded === 2)
            {
                clearInterval(this._fontLoadingInterval);

                document.body.removeChild(this._fontInfoElement);

                this._loadData();
            }
        }
    }.bind(this),100);

    this._fontInfoElement.style.fontFamily = FontStyle.CONDENSED;
};

/**
 * Load locally stored app data
 *
 * @method _loadData
 * @private
 */
App.LoadData.prototype._loadData = function _loadData()
{
    //TODO Access local storage

    var request = new XMLHttpRequest();
    request.open('GET','./data/data.json',true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400)
        {
            this.dispatchEvent(App.EventType.COMPLETE,{userData:request.responseText,icons:this._icons});
        } else {
            console.log("error");
        }
    }.bind(this);

    request.onerror = function() {
        console.log("on error");
        this.dispatchEvent(App.EventType.COMPLETE);
    };

    request.send();
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.LoadData.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    this._jsonLoader = null;

    clearInterval(this._fontLoadingInterval);

    this._fontInfoElement = null;
};

/**
 * @class Initialize
 * @extends {Command}
 * @constructor
 */
App.Initialize = function Initialize()
{
    this._eventListenerPool = new App.ObjectPool(App.EventListener,10);

    App.Command.call(this,false,this._eventListenerPool);

    this._loadDataCommand = new App.LoadData(this._eventListenerPool);
};

App.Initialize.prototype = Object.create(App.Command.prototype);
App.Initialize.prototype.constructor = App.Initialize;

/**
 * Execute the command
 *
 * @method execute
 */
App.Initialize.prototype.execute = function execute()
{
    this._loadDataCommand.addEventListener(App.EventType.COMPLETE,this,this._onLoadDataComplete);
    this._loadDataCommand.execute();
};

/**
 * Load data complete handler
 *
 * @method _onLoadDataComplete
 * @param {string} data
 * @private
 */
App.Initialize.prototype._onLoadDataComplete = function _onLoadDataComplete(data)
{
    var HeaderAction = App.HeaderAction,
        changeScreenDataPool = new App.ObjectPool(App.ChangeScreenData,5);

    this._loadDataCommand.destroy();
    this._loadDataCommand = null;
    
    this._initModel(data,changeScreenDataPool);
    this._initController();
    this._initView();

    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenDataPool.allocate().update(
        App.ScreenName.MENU,
        0,
        null,
        HeaderAction.NONE,
        HeaderAction.CANCEL,
        App.ScreenTitle.MENU
    ));

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {{userData:string,transactions:string,icons:Object}} data
 * @param {ObjectPool} changeScreenDataPool
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data,changeScreenDataPool)
{
    var ModelName = App.ModelName,
        Collection = App.Collection,
        PaymentMethod = App.PaymentMethod,
        CurrencyPair = App.CurrencyPair,
        userData = JSON.parse(data.userData),
        currencyPairs = new Collection(userData.currencyPairs,CurrencyPair,null,this._eventListenerPool);

    //TODO set default currency
    //currencyPairs.addItem(new CurrencyPair([1,"USD","USD",1.0]));

    App.ModelLocator.init([
        ModelName.EVENT_LISTENER_POOL,this._eventListenerPool,
        ModelName.TICKER,new App.Ticker(this._eventListenerPool),
        ModelName.ICONS,Object.keys(data.icons).filter(function(element) {return element.indexOf("-app") === -1}),
        ModelName.PAYMENT_METHODS,new Collection([PaymentMethod.CASH,PaymentMethod.CREDIT_CARD],PaymentMethod,null,this._eventListenerPool),
        ModelName.CURRENCY_PAIRS,currencyPairs,
        ModelName.CURRENCY_SYMBOLS,new Collection(this._getCurrencySymbols(currencyPairs),App.CurrencySymbol,null,this._eventListenerPool),
        ModelName.SETTINGS,new App.Settings(userData.settings),
        ModelName.SUB_CATEGORIES,new Collection(userData.subCategories,App.SubCategory,null,this._eventListenerPool),
        ModelName.CATEGORIES,new Collection(userData.categories,App.Category,null,this._eventListenerPool),
        ModelName.ACCOUNTS,new Collection(userData.accounts,App.Account,null,this._eventListenerPool),
        ModelName.TRANSACTIONS,new Collection(userData.transactions,App.Transaction,null,this._eventListenerPool),
        ModelName.CHANGE_SCREEN_DATA_POOL,changeScreenDataPool,
        ModelName.SCREEN_HISTORY,new App.Stack()
    ]);
};

/**
 * Goes through currencyPairs passed in and generate array of currency symbols
 * @param {App.Collection} currencyPairs
 * @returns {Array.<string>}
 * @private
 */
App.Initialize.prototype._getCurrencySymbols = function _getCurrencySymbols(currencyPairs)
{
    var symbols = [],
        currencyPair = null,
        i = 0,
        l = currencyPairs.length();

    for (;i<l;)
    {
        currencyPair = currencyPairs.getItemAt(i++);
        if (symbols.indexOf(currencyPair.symbol) === -1) symbols.push(currencyPair.symbol);
        if (symbols.indexOf(currencyPair.base) === -1) symbols.push(currencyPair.base);
    }

    return symbols;
};

/**
 * Initialize commands
 *
 * @method _initController
 * @private
 */
App.Initialize.prototype._initController = function _initController()
{
    var EventType = App.EventType;

    App.Controller.init(this._eventListenerPool,[
        EventType.CHANGE_SCREEN,App.ChangeScreen,
        EventType.CHANGE_TRANSACTION,App.ChangeTransaction,
        EventType.CHANGE_ACCOUNT,App.ChangeAccount,
        EventType.CHANGE_CATEGORY,App.ChangeCategory,
        EventType.CHANGE_SUB_CATEGORY,App.ChangeSubCategory,
        EventType.CHANGE_CURRENCY_PAIR,App.ChangeCurrencyPair
    ]);
};

/**
 * Initialize view
 *
 * @method _initView
 * @private
 */
App.Initialize.prototype._initView = function _initView()
{
    var canvas = document.getElementsByTagName("canvas")[0],
        context = canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1,
        pixelRatio = dpr / bsr > 2 ? 2 : dpr / bsr,
        width = window.innerWidth,
        height = window.innerHeight,
        stage = new PIXI.Stage(0xffffff),
        renderer = new PIXI.CanvasRenderer(width,height,{
            view:canvas,
            resolution:1,
            transparent:false,
            autoResize:false,
            clearBeforeRender:false
        }),
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName;

    if (pixelRatio > 1)
    {
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        context.scale(pixelRatio,pixelRatio);

        stage.interactionManager.setPixelRatio(pixelRatio);
    }

    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.tintWithOverlay;

    //context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
    context.lineCap = "square";

    this._initButtonPools(ViewLocator,ViewName,Math.round(width * pixelRatio),pixelRatio);

    ViewLocator.addViewSegment(ViewName.APPLICATION_VIEW,stage.addChild(new App.ApplicationView(stage,renderer,width,height,pixelRatio)));
};

/**
 * Initialize button pools
 * @param {Object} ViewLocator
 * @param {Object} ViewName
 * @param {number} width
 * @param {number} pixelRatio
 * @private
 */
App.Initialize.prototype._initButtonPools = function _initButtonPools(ViewLocator,ViewName,width,pixelRatio)
{
    var ObjectPool = App.ObjectPool,
        FontStyle = App.FontStyle.init(pixelRatio),
        skin = new App.Skin(width,pixelRatio),
        categoryButtonOptions = {
            width:width,
            height:Math.round(50 * pixelRatio),
            pixelRatio:pixelRatio,
            skin:skin.GREY_50,
            addButtonSkin:skin.WHITE_40,
            nameLabelStyle:FontStyle.get(18,FontStyle.BLUE),
            editLabelStyle:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            addLabelStyle:FontStyle.get(14,FontStyle.GREY_DARK),
            displayHeader:false
        },
        subCategoryButtonOptions = {
            width:width,
            height:Math.round(40 * pixelRatio),
            pixelRatio:pixelRatio,
            whiteSkin:skin.WHITE_40,
            greySkin:skin.GREY_40,
            nameLabelStyle:FontStyle.get(14,FontStyle.BLUE),
            editLabelStyle:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            openOffset:Math.round(80 * pixelRatio)
        },
        accountButtonOptions = {
            width:width,
            height:Math.round(70 * pixelRatio),
            pixelRatio:pixelRatio,
            skin:skin.GREY_70,
            nameStyle:FontStyle.get(24,FontStyle.BLUE),
            detailStyle:FontStyle.get(12,FontStyle.GREY_DARKER,null,FontStyle.LIGHT_CONDENSED),
            editStyle:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
            openOffset:Math.round(80 * pixelRatio)
        },
        transactionButtonOptions = {
            labelStyles:{
                edit:FontStyle.get(18,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                accountIncome:FontStyle.get(14,FontStyle.BLUE_LIGHT,null,FontStyle.LIGHT_CONDENSED),
                amountIncome:FontStyle.get(26,FontStyle.BLUE),
                currencyIncome:FontStyle.get(16,FontStyle.BLUE_DARK,null,FontStyle.LIGHT_CONDENSED),
                date:FontStyle.get(14,FontStyle.GREY_DARK),
                pending:FontStyle.get(12,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                accountPending:FontStyle.get(14,FontStyle.RED_DARK),
                amountPending:FontStyle.get(26,FontStyle.WHITE),
                currencyPending:FontStyle.get(16,FontStyle.WHITE,null,FontStyle.LIGHT_CONDENSED),
                datePending:FontStyle.get(14,FontStyle.WHITE,"right",FontStyle.LIGHT_CONDENSED)
            },
            greySkin:skin.GREY_70,
            redSkin:skin.RED_70,
            width:width,
            height:Math.round(70 * pixelRatio),
            pixelRatio:pixelRatio,
            openOffset:Math.round(120 * pixelRatio)
        };

    //TODO move some pools to the actual screens?; they may not be accessed anywhere else anyway ...
    ViewLocator.init([
        ViewName.SKIN,skin,
        ViewName.ACCOUNT_BUTTON_POOL,new ObjectPool(App.AccountButton,2,accountButtonOptions),
        ViewName.CATEGORY_BUTTON_EXPAND_POOL,new ObjectPool(App.CategoryButtonExpand,5,categoryButtonOptions),
        ViewName.CATEGORY_BUTTON_EDIT_POOL,new ObjectPool(App.CategoryButtonEdit,5,categoryButtonOptions),
        ViewName.SUB_CATEGORY_BUTTON_POOL,new ObjectPool(App.SubCategoryButton,5,subCategoryButtonOptions),
        ViewName.TRANSACTION_BUTTON_POOL,new ObjectPool(App.TransactionButton,4,transactionButtonOptions)
    ]);
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.Initialize.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    if (this._loadDataCommand)
    {
        this._loadDataCommand.destroy();
        this._loadDataCommand = null;
    }

    this._eventListenerPool = null;
};

/**
 * @class ChangeScreen
 * @extends {Command}
 * @constructor
 */
App.ChangeScreen = function ChangeScreen()
{
    App.Command.call(this,false,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
};

App.ChangeScreen.prototype = Object.create(App.Command.prototype);
App.ChangeScreen.prototype.constructor = App.ChangeScreen;

/**
 * Execute the command
 *
 * @method execute
 * @param {App.ChangeScreenData} data
 */
App.ChangeScreen.prototype.execute = function execute(data)
{
    var ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        changeScreenDataPool = ModelLocator.getProxy(ModelName.CHANGE_SCREEN_DATA_POOL),
        screenHistory = ModelLocator.getProxy(ModelName.SCREEN_HISTORY),
        screenStack = ViewLocator.getViewSegment(ViewName.SCREEN_STACK),
        screen = null;

    if (data.screenName === App.ScreenName.BACK)
    {
        var updateBackScreen = data.updateBackScreen,
            i = 0,
            l = data.backSteps;

        for (;i<l;i++) changeScreenDataPool.release(screenHistory.pop());
        changeScreenDataPool.release(data);

        data = screenHistory.peek();

        screen = screenStack.getChildByIndex(data.screenName);
        if (updateBackScreen) screen.update(data.updateData,data.screenMode);
    }
    else
    {
        if (data.headerLeftAction !== App.HeaderAction.CANCEL && data.headerRightAction !== App.HeaderAction.CANCEL && data.screenMode !== App.ScreenMode.SELECT)
        {
            this._clearHistory(screenHistory,changeScreenDataPool);
        }

        screen = screenStack.getChildByIndex(data.screenName);
        screen.update(data.updateData,data.screenMode);

        screenHistory.push(data);
    }
//    console.log("Stack: ",screenHistory._source);
//    console.log("Pool: ",changeScreenDataPool._freeItems);
    ViewLocator.getViewSegment(ViewName.HEADER).change(data.headerLeftAction,data.headerRightAction,data.headerName);

    screenStack.selectChild(screen);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Clear history
 * @param {App.Stack} screenHistory
 * @param {App.ObjectPool} changeScreenDataPool
 * @private
 */
App.ChangeScreen.prototype._clearHistory = function _clearHistory(screenHistory,changeScreenDataPool)
{
//    console.log("Before clear: ------------------");
//    console.log("Stack: ",screenHistory._source);
//    console.log("Pool: ",changeScreenDataPool._freeItems);
    var item = screenHistory.pop();

    while (item)
    {
        changeScreenDataPool.release(item);

        item = screenHistory.pop();
    }
    screenHistory.clear();
//    console.log("After clear: ------------------");
//    console.log("Stack: ",screenHistory._source);
//    console.log("Pool: ",changeScreenDataPool._freeItems);
//    console.log("---------------------------------");
};

/**
 * @class ChangeTransaction
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeTransaction = function ChangeTransaction(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.ChangeTransaction.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeTransaction.prototype.constructor = App.ChangeTransaction;

/**
 * Execute the command
 *
 * @method execute
 * @param {{nextCommand:Command,screenName:number}} data
 */
App.ChangeTransaction.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        transactions = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS),
        transaction = transactions.getCurrent(),
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        transaction = new App.Transaction();
        transactions.addItem(transaction);
        transactions.setCurrent(transaction);

        data.nextCommandData.updateData = transaction;
    }
    else if (type === EventType.COPY)
    {
        transaction = data.transaction.copy();
        transactions.addItem(transaction);
        transactions.setCurrent(transaction);

        data.nextCommandData.updateData = transaction;
    }
    else if (type === EventType.CHANGE)
    {
        var date = data.date,
            time = data.time;

        transaction.amount = data.amount || transaction.amount;
        transaction.account = data.account || transaction.account;
        transaction.category = data.category || transaction.category;
        transaction.subCategory = data.subCategory || transaction.subCategory;
        transaction.method = data.method || transaction.method;
        transaction.currency = data.currency || transaction.currency;
        transaction.note = data.note || transaction.note;

        if (date && time)
        {
            transaction.date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
            if (time.length > 0) transaction.date.setHours(parseInt(time.split(":")[0],10),parseInt(time.split(":")[1],10));
        }
    }
    else if (type === EventType.CONFIRM)
    {
        transaction.amount = data.amount || transaction.amount;
        transaction.type = data.transactionType || transaction.type;
        transaction.pending = data.pending === true;
        transaction.repeat = data.repeat === true;
        transaction.note = data.note || transaction.note;

        transaction.save();
        transactions.setCurrent(null);
    }
    else if (type === EventType.CANCEL)
    {
        if (transaction.isSaved()) transactions.setCurrent(null);
        else transactions.removeItem(transaction).destroy();
    }
    else if (type === EventType.DELETE)
    {
        transactions.removeItem(transaction).destroy();

        data.nextCommandData.updateData = transactions.copySource().reverse();
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * @class ChangeCategory
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeCategory = function ChangeCategory(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool || App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
};

App.ChangeCategory.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeCategory.prototype.constructor = App.ChangeCategory;

/**
 * Execute the command
 *
 * @method execute
 * @param {Object} data
 * @param {string} data.type
 * @param {App.Category} data.category
 * @param {string} data.name
 * @param {string} data.color
 * @param {string} data.icon
 * @param {string} data.budget
 * @param {App.Account} data.account
 * @param {Command} data.nextCommand
 * @param {Object} data.nextCommandData
 */
App.ChangeCategory.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        category = data.category,
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        category = new App.Category();
        category.account = data.account.id;

        this._nextCommandData.updateData = category;
    }
    else if (type === EventType.CHANGE)
    {
        category.name = data.name || category.name;
        category.icon = data.icon || category.icon;
        category.color = data.color || category.color;
        category.budget = data.budget || category.budget;

        this._registerSubCategories(category);
    }
    else if (type === EventType.CONFIRM)
    {
        category.name = data.name;
        category.icon = data.icon;
        category.color = data.color;
        category.budget = data.budget;

        this._registerSubCategories(category);
        this._registerCategory(category);
    }
    else if (type === EventType.CANCEL)
    {
        this._cancelChanges(category);
    }
    else if (type === EventType.DELETE)
    {
        this._deleteCategory(category);
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * Add category to collection
 * @param category
 * @private
 */
App.ChangeCategory.prototype._registerCategory = function _registerCategory(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        categories = ModelLocator.getProxy(ModelName.CATEGORIES);

    if (categories.indexOf(category) === -1)
    {
        categories.addItem(category);
        ModelLocator.getProxy(ModelName.ACCOUNTS).find("id",category.account).addCategory(category);
    }
};

/**
 * Add subCategories to collection
 * @param category
 * @private
 */
App.ChangeCategory.prototype._registerSubCategories = function _registerSubCategories(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        subCategoryCollection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES),
        subCategories = category.subCategories,
        subCategory = null,
        i = 0,
        l = subCategories.length;

    for (;i<l;)
    {
        subCategory = subCategories[i++];
        if (subCategoryCollection.indexOf(subCategory) === -1) subCategoryCollection.addItem(subCategory);
    }
};

/**
 * Cancel changes made to the category since last saved state
 * @param {App.Category} category
 * @private
 */
App.ChangeCategory.prototype._cancelChanges = function _cancelChanges(category)
{
    var subCategoryCollection = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES),
        allSubCategories = category.subCategories,
        i = 0,
        l = allSubCategories.length;

    category.revokeState();

    var revokedSubCategories = category.subCategories;

    for (;i<l;i++)
    {
        if (revokedSubCategories.indexOf(allSubCategories[i]) === -1 && subCategoryCollection.indexOf(allSubCategories[i]) > -1)
        {
            subCategoryCollection.removeItem(allSubCategories[i]);
        }
    }

    i = 0;
    l = revokedSubCategories.length;

    for (;i<l;) revokedSubCategories[i++].revokeState();

    //TODO destroy category if it was newly created and eventually cancelled?
};

/**
 * Delete category
 * @param {App.Category} category
 * @private
 */
App.ChangeCategory.prototype._deleteCategory = function _deleteCategory(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        subCategoryCollection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES),
        subCategories = category.subCategories,
        i = 0,
        l = subCategories.length;

    //TODO may still be referenced in transaction(s)
    //TODO keep the (sub)category in collection, but them completely remove if it's not referenced anywhere?
    //for (;i<l;) subCategoryCollection.removeItem(subCategories[i++]);

    ModelLocator.getProxy(ModelName.ACCOUNTS).find("id",category.account).removeCategory(category);

    //ModelLocator.getProxy(ModelName.CATEGORIES).removeItem(category);

    category.destroy();
};

/**
 * @class ChangeSubCategory
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeSubCategory = function ChangeSubCategory(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);//App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL)
};

App.ChangeSubCategory.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeSubCategory.prototype.constructor = App.ChangeSubCategory;

/**
 * Execute the command
 *
 * @method execute
 * @param {{subCategory:App.SubCategory,name:string,category:App.Category,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeSubCategory.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        subCategory = data.subCategory,
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        subCategory = new App.SubCategory();
        subCategory.category = data.category.id;

        this._nextCommandData.updateData = {subCategory:subCategory,category:data.category};
    }
    else if (type === EventType.CHANGE)
    {
        subCategory.name = data.name;

        data.category.addSubCategory(subCategory);
    }
    else if (type === EventType.DELETE)
    {
        data.category.removeSubCategory(subCategory);

        //TODO keep the sub-category in collection, but them completely remove if it's not referenced anywhere?
        //App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).removeItem(subCategory);
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * @class ChangeAccount
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeAccount = function ChangeAccount(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.ChangeAccount.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeAccount.prototype.constructor = App.ChangeAccount;

/**
 * Execute the command
 *
 * @method execute
 * @param {{account:App.Account,name:string,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeAccount.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        account = data.account,
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        account = new App.Account();

        this._nextCommandData.updateData = account;
    }
    else if (type === EventType.CHANGE)
    {
        account.name = data.name;

        if (account.lifeCycleState === App.LifeCycleState.CREATED)
        {
            var collection = App.ModelLocator.getProxy(App.ModelName.ACCOUNTS);
            if (collection.indexOf(account) === -1) collection.addItem(account);

            account.lifeCycleState = App.LifeCycleState.ACTIVE;
        }
    }
    else if (type === EventType.DELETE)
    {
        account.lifeCycleState = App.LifeCycleState.DELETED;
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * @class ChangeCurrencyPair
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeCurrencyPair = function ChangeCurrencyPair(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.ChangeCurrencyPair.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeCurrencyPair.prototype.constructor = App.ChangeCurrencyPair;

/**
 * Execute the command
 *
 * @method execute
 * @param {{account:App.Account,name:string,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeCurrencyPair.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    data.currencyPair.rate = parseFloat(data.rate);

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};

(function()
{
    //TODO move to index.html and also build simple pre-preloader

    function onInitComplete()
    {
        initCommand.destroy();
        initCommand = null;
    }

    var initCommand = new App.Initialize();
    initCommand.addEventListener(App.EventType.COMPLETE,this,onInitComplete);
    initCommand.execute();
})();
