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
 *      CREATE_TRANSACTION:string,
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
    CREATE_TRANSACTION:"CREATE_TRANSACTION",

    // App
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
 * @enum {string}
 * @return {{
 *      TICKER:string,
 *      EVENT_LISTENER_POOL:string,
 *      PAYMENT_METHODS:string,
 *      CURRENCIES:string,
 *      SUB_CATEGORIES:string,
 *      CATEGORIES:string,
 *      ACCOUNTS:string,
 *      TRANSACTIONS:string,
 *      SETTINGS:string,
 *      ICONS:string
 * }}
 */
App.ModelName = {
    TICKER:"TICKER",
    EVENT_LISTENER_POOL:"EVENT_LISTENER_POOL",
    PAYMENT_METHODS:"PAYMENT_METHODS",
    CURRENCIES:"CURRENCIES",
    SUB_CATEGORIES:"SUB_CATEGORIES",
    CATEGORIES:"CATEGORIES",
    ACCOUNTS:"ACCOUNTS",
    TRANSACTIONS:"TRANSACTIONS",
    SETTINGS:"SETTINGS",
    ICONS:"ICONS"
};

/**
 * View Segment state
 * @enum {number}
 * @return {{APPLICATION_VIEW:number,HEADER:number,SCREEN_STACK:number,CATEGORY_BUTTON_EXPAND_POOL:number,CATEGORY_BUTTON_EDIT_POOL:number,SUB_CATEGORY_BUTTON_POOL:number,SKIN:number}}
 */
App.ViewName = {
    APPLICATION_VIEW:0,
    HEADER:1,
    SCREEN_STACK:2,
    CATEGORY_BUTTON_EXPAND_POOL:3,
    CATEGORY_BUTTON_EDIT_POOL:4,
    SUB_CATEGORY_BUTTON_POOL:5,
    SKIN:6
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
 * @return {{BACK:number,ACCOUNT:number,CATEGORY:number,SELECT_TIME:number,EDIT_CATEGORY:number,TRANSACTIONS:number,REPORT:number,ADD_TRANSACTION:number,MENU:number}}
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
    MENU:7
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
 * Filter collection against value passed in
 * @param {string|Array} value
 * @param {string} [property=null]
 * @returns {Array}
 */
App.Collection.prototype.filter = function filter(value,property)
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
        if (!this._baseCurrency) this._baseCurrency = App.ModelLocator.getProxy(App.ModelName.CURRENCIES).filter([this._data[1]],"id")[0];
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
 * @class Currency
 * @param {{symbol:string,rate:number,pair:Currency}} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Currency = function Currency(data,collection,parent,eventListenerPool)
{
    this.id = data[0];
    this.symbol = data[1];//quote symbol
    this.base = data[2];
    this.rate = data[3];
    this.default = this.id === 1;
};

/**
 * @class Transaction
 * @param {Array} data
 * @param {Collection} collection
 * @param {*} parent
 * @param {ObjectPool} eventListenerPool
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
        this.note = data[8] ? decodeURI(data[8]) : null;
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
    //TODO implement
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
        if (!this._method)
        {
            if (this._data) this._method = App.ModelLocator.getProxy(App.ModelName.PAYMENT_METHODS).filter([this._data[4]],"id")[0];
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
    }//TODO set new date object, or modify the original?
});

/**
 * @property currency
 * @type Currency
 */
Object.defineProperty(App.Transaction.prototype,'currency',{
    get:function()
    {
        if (!this._currency)
        {
            if (this._data) this._currency = App.ModelLocator.getProxy(App.ModelName.CURRENCIES).filter([this._data[7]],"id")[0];
            else this._currency = App.ModelLocator.getProxy(App.ModelName.SETTINGS).baseCurrency;
        }
        return this._currency;
    },
    set:function(value)
    {
        this._currency = value;
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
    this.id = data[0];
    this.name = data[1];
    this.category = data[2];
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
    this._data = data;

    this.id = data[0];
    this.name = data[1];
    this.color = data[2];
    this.icon = data[3];
    this.account = data[4];
    this.budget = data[6];
    this._subCategories = null;
};

/**
 * @property subCategories
 * @type Array.<SubCategory>
 */
Object.defineProperty(App.Category.prototype,'subCategories',{
    get:function()
    {
        if (!this._subCategories) this._subCategories = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES).filter(this._data[5],"id");
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
    this._data = data;

    this.id = this._data[0];
    this.name = this._data[1];
    this._categories = null;
};

/**
 * @property categories
 * @type Array.<Category>
 */
Object.defineProperty(App.Account.prototype,'categories',{
    get:function()
    {
        if (!this._categories) this._categories = App.ModelLocator.getProxy(App.ModelName.CATEGORIES).filter(this._data[2].split(","),"id");
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
 * @type {{init: Function, get: Function, WHITE: string, BLUE: string, BLUE_LIGHT: string, BLUE_DARK: string, GREY: string, GREY_DARK: string, GREY_DARKER: string, RED_DARK: string}}
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

        font = font || "HelveticaNeueCond";

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

        style = {fontSize:fontSize,font:Math.round(fontSize * this._pixelRatio)+"px "+font,fill:color,align:align ? align : "left"};
        this._styles.push(style);

        return style;
    },

    WHITE:"#ffffff",
    BLUE:"#394264",
    BLUE_LIGHT:"#50597B",
    BLUE_DARK:"#252B44",
    GREY:"#efefef",
    GREY_DARK:"#cccccc",
    GREY_DARKER:"#999999",
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
    var position = data.getLocalPosition(this).x,
        HeaderAction = App.HeaderAction,
        action = HeaderAction.NONE;

    if (position <= this._iconSize) action = this._leftIcon.getAction();
    else if (position >= this._layout.width - this._iconSize) action = this._rightIcon.getAction();

    if (action !== HeaderAction.NONE) this._eventDispatcher.dispatchEvent(App.EventType.CLICK,action);
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
        this.boundingBox.height = Math.round(8 * this._pixelRatio);

        this._indicatorThickness = this.boundingBox.height - this._padding;
        this._indicatorSize = Math.round(this._size * (this._size / contentSize));
        if (this._indicatorSize < this._minIndicatorSize) this._indicatorSize = this._minIndicatorSize;

        this._positionStep = (this._size - this._indicatorSize) / (contentSize - this._size);
    }
    else if (this._direction === App.Direction.Y)
    {
        this.boundingBox.width = Math.round(8 * this._pixelRatio);
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
    if (this._restrictPattern) this._inputProxy.value = this._inputProxy.value.replace(this._restrictPattern,"");

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

    this.clear();
    this.beginFill(this._backgroundColor);
    this.drawRoundedRect(0,0,w,h,Math.round(5 * this._pixelRatio));
    this.endFill();

    this._labelField.x = Math.round((w - this._labelField.width) / 2);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
};

/**
 * @class CalendarWeekRow
 * @extend Graphics
 * @param {Array.<number>} week
 * @param {number} currentDay
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.CalendarWeekRow = function CalendarWeekRow(week,currentDay,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var FontStyle = App.FontStyle,
        daysInWeek = week.length / 2,
        Text = PIXI.Text,
        index = 0,
        i = 0;

    this.boundingBox = new App.Rectangle(0,0,width,Math.round(40*pixelRatio));

    this._week = week;
    this._width = width;
    this._pixelRatio = pixelRatio;

    this._textStyle = FontStyle.get(14,FontStyle.GREY_DARK);
    this._selectedStyle = FontStyle.get(14,FontStyle.WHITE);
    this._dateFields = new Array(7);
    this._selectedDayIndex = -1;
    this._highlightBackground = new PIXI.Graphics();

    for (;i<daysInWeek;i++,index+=2) this._dateFields[i] = new Text(week[index],this._textStyle);

    this._render();

    var dayToHighlight = this._getDayByDate(currentDay);
    if (dayToHighlight && !dayToHighlight.otherMonth) this._selectDay(dayToHighlight);

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
 * @param {Date} date
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.Calendar = function Calendar(date,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var dayLabelStyle = {font:"bold " + Math.round(12 * pixelRatio)+"px Arial",fill:"#999999"},
        CalendarWeekRow = App.CalendarWeekRow,
        Text = PIXI.Text,
        DateUtils = App.DateUtils,
        FontStyle = App.FontStyle,
        startOfWeek = App.ModelLocator.getProxy(App.ModelName.SETTINGS).startOfWeek,
        month = DateUtils.getMonth(date,startOfWeek),
        dayLabels = DateUtils.getDayLabels(startOfWeek),
        daysInWeek = dayLabels.length,
        weeksInMonth = month.length,
        i = 0;

    this.boundingBox = new App.Rectangle(0,0,width,Math.round(321*pixelRatio));

    this._date = date;
    this._selectedDate = date;//TODO use just one date?
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

    for (i = 0;i<weeksInMonth;i++) this._weekRows[i] = new CalendarWeekRow(month[i],this._selectedDate.getDate(),width,pixelRatio);

    this._render();
    this._updateMonthLabel();

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

    //TODO I dont need this (can use screen's bg) ... and can extend from DOContainer instead
    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[0,Math.round(80 * r),w,1,separatorPadding,dayLabelOffset,separatorWidth,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[separatorPadding,dayLabelOffset+1,separatorWidth,1],false,true);

    this._monthField.y = Math.round((dayLabelOffset - this._monthField.height) / 2);

    //TODO also implement double-arrows for navigating years directly? See TOS
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

        //TODO modify current object instead of setting new one?
        this._selectedDate = new Date(this._date.getFullYear(),this._date.getMonth(),date);
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

    //TODO modify current object instead of setting new one?
    this._date = new Date(newYear,newMonth);
    if (selectDate > -1) this._selectedDate = new Date(newYear,newMonth,selectDate);

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

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._content = null;
    this._contentHeight = 0;
    this._contentWidth = 0;
    this._contentBoundingBox = new App.Rectangle();
    this._useMask = useMask;

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
 * @param {Array} model
 * @param {Function} itemClass
 * @param {Object} itemOptions
 * @param {string} direction
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.VirtualList = function VirtualList(model,itemClass,itemOptions,direction,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var Direction = App.Direction,
        itemSize = direction === Direction.X ? itemOptions.width : itemOptions.height,
        itemCount = Math.ceil(width / itemSize) + 1,
        listSize = model.length * itemSize,
        modelLength = model.length - 1,
        item = null,
        index = 0,
        i = 0;

    this.boundingBox = new PIXI.Rectangle(0,0,listSize,height);

    if (direction === Direction.Y)
    {
        itemCount = Math.ceil(height / itemSize) + 1;
        this.boundingBox.width = width;
        this.boundingBox.height = listSize;
    }

    if (itemCount > model.length) itemCount = model.length;

    this._model = model;
    this._itemClass = itemClass;
    this._direction = direction;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._items = new Array(itemCount);
    this._itemSize = itemSize;
    this._virtualX = 0;
    this._virtualY = 0;

    for (;i<itemCount;i++,index++)
    {
        if(index > modelLength) index = 0;
        item = new itemClass(index,model[index],itemOptions);

        this._items[i] = item;
        this.addChild(item);
    }

    this._updateLayout(false);
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
                item.setModel(modelIndex,this._model[modelIndex]);
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
                item.setModel(modelIndex,this._model[modelIndex]);
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
    var i = 0,
        l = this._items.length,
        item = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.x = position;
            item.setModel(i,this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.y = position;
            item.setModel(i,this._model[i]);
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

        if (updatePosition) this._updateX(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.y = position;
            position = Math.round(position + this._itemSize);
        }

        if (updatePosition) this._updateY(this.y);
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
 */
App.List.prototype.add = function add(item,updateLayout)
{
    this._items[this._items.length] = item;

    this.addChild(item);

    if (updateLayout) this.updateLayout();
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
        x = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        width = child.boundingBox.width;
        x = this.x + child.x;

        child.visible = x + width > 0 && x < this._windowSize;
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
        y = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        height = child.boundingBox.height;
        y = this.y + child.y;

        child.visible = y + height > 0 && y < this._windowSize;
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
    this._textField = new PIXI.Text(label,App.FontStyle.get(12,App.FontStyle.WHITE));

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

    GraphicUtils.drawRects(this,ColorTheme.BLUE,1,[0,0,this._width,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_DARK,1,[0,h-1,this._width,1],false,true);

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
 * Abstract Screen
 *
 * @class Screen
 * @extends DisplayObjectContainer
 * @param {Collection} model
 * @param {Object} layout
 * @param {number} tweenDuration
 * @constructor
 */
App.Screen = function Screen(model,layout,tweenDuration)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        pixelRatio = layout.pixelRatio;

    this._model = model;
    this._layout = layout;
    this._enabled = false;
    this._eventsRegistered = false;

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
        this.interactive = true;

        this._registerEventListeners();

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Screen.prototype.disable = function disable()
{
    this.interactive = false;

    this._unRegisterEventListeners();

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
 * @private
 */
App.Screen.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

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

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._showHideTween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
    }
};

/**
 * UnRegister event listeners
 * @private
 */
App.Screen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._showHideTween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

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

    this._eventsRegistered = false;
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
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.HIDDEN;

        this.disable();

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
 * @class InputScrollScreen
 * @extends Screen
 * @param {Transaction} model
 * @param {Object} layout
 * @constructor
 */
App.InputScrollScreen = function InputScrollScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

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
    this._toggle = false;
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

    if (this._toggle)
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
    this._toggle = !this._toggle;

    this._render(false);
};

/**
 * Is button selected?
 * @returns {boolean}
 */
App.TransactionToggleButton.prototype.isSelected = function isSelected()
{
    return this._toggle;
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
    if (this._valueDetailField)
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
        if (this._valueDetailField)
        {
            this._valueDetailField.setText(details);
        }
        else
        {
            this._valueDetailField = new PIXI.Text(details,this._options.valueDetailStyle);
            this.addChild(this._valueDetailField);
        }
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
    App.InputScrollScreen.call(this,null,layout);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        FontStyle = App.FontStyle,
        ScreenName = App.ScreenName,
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
            skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_50,
            nameStyle:FontStyle.get(18,FontStyle.GREY_DARKER),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInput = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._deleteButton = new App.Button("Delete",{width:inputWidth,height:inputHeight,pixelRatio:r,style:FontStyle.get(18,FontStyle.WHITE),backgroundColor:App.ColorTheme.RED});

    this._optionList = new App.List(App.Direction.Y);
    this._accountOption = new TransactionOptionButton("account","Account",ScreenName.ACCOUNT,options);
    this._categoryOption = new TransactionOptionButton("folder-app","Category",ScreenName.CATEGORY,options);
    this._timeOption = new TransactionOptionButton("calendar","Time",ScreenName.SELECT_TIME,options);
    this._methodOption = new TransactionOptionButton("credit-card","Method",ScreenName.CATEGORY,options);
    this._currencyOption = new TransactionOptionButton("currencies","Currency",ScreenName.ACCOUNT,options);

    this._toggleButtonList = new App.List(App.Direction.X);
    this._typeToggle = new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income",toggleColor:false});
    this._pendingToggle = new TransactionToggleButton("pending-app","Pending",toggleOptions,{toggleColor:true});
    this._repeatToggle = new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{toggleColor:true});

    //TODO automatically focus input when this screen is shown?

    this._toggleButtonList.add(this._typeToggle,false);
    this._toggleButtonList.add(this._pendingToggle,false);
    this._toggleButtonList.add(this._repeatToggle,true);
    this._optionList.add(this._accountOption,false);
    this._optionList.add(this._categoryOption,false);
    this._optionList.add(this._timeOption,false);
    this._optionList.add(this._methodOption,false);
    this._optionList.add(this._currencyOption,true);

    this._transactionInput.restrict(/\D/g);
    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._transactionInput);
    this._container.addChild(this._toggleButtonList);
    this._container.addChild(this._optionList);
    this._container.addChild(this._noteInput);
    this._container.addChild(this._deleteButton);
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
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        w = this._layout.width,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r),
        toggleHeight = this._toggleButtonList.boundingBox.height,
        toggleWidth = Math.round(w / 3),
        separatorWidth = w - padding * 2,
        bottom = 0;

    this._transactionInput.x = padding;
    this._transactionInput.y = padding;

    this._toggleButtonList.y = inputHeight;

    this._optionList.y = this._toggleButtonList.y + toggleHeight;

    bottom = this._optionList.y + this._optionList.boundingBox.height;

    this._noteInput.x = padding;
    this._noteInput.y = bottom + padding;

    if (this._mode === App.ScreenMode.EDIT)
    {
        bottom = bottom + inputHeight;

        this._deleteButton.x = padding;
        this._deleteButton.y = bottom + padding;
    }

    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w,bottom+inputHeight],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[
        padding,inputHeight-1,separatorWidth,1,
        toggleWidth-1,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2-1,inputHeight+padding,1,toggleHeight-padding*2,
        padding,inputHeight+toggleHeight-1,separatorWidth,1,
        padding,bottom-1,separatorWidth,1
    ],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[
        padding,inputHeight,separatorWidth,1,
        toggleWidth,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2,inputHeight+padding,1,toggleHeight-padding*2,
        padding,bottom-inputHeight,separatorWidth,1,
        padding,bottom,separatorWidth,1
    ],false,true);
};

/**
 * Update
 * @private
 */
App.AddTransactionScreen.prototype.update = function update(data,mode)
{
    this._model = data || this._model;
    this._mode = mode || this._mode;

    var date = this._model.date;

    this._transactionInput.setValue(this._model.amount);

    if (this._model.type === App.TransactionType.INCOME && !this._typeToggle.isSelected()) this._typeToggle.toggle();
    if (this._model.pending && !this._pendingToggle.isSelected()) this._pendingToggle.toggle();
    if (this._model.repeat && !this._repeatToggle.isSelected()) this._repeatToggle.toggle();

    this._accountOption.setValue(this._model.account ? this._model.account.name : "?");
    this._categoryOption.setValue(this._model.subCategory ? this._model.subCategory.name : "?",this._model.category ? this._model.category.name : null);
    this._timeOption.setValue(App.DateUtils.getMilitaryTime(date),date.toDateString());
    this._methodOption.setValue(this._model.method.name);
    this._currencyOption.setValue(this._model.currency.symbol);

    this._noteInput.setValue(this._model.note);

    if (this._mode === App.ScreenMode.EDIT)
    {
        if (!this._container.contains(this._deleteButton)) this._container.addChild(this._deleteButton);
    }
    else
    {
        if (this._container.contains(this._deleteButton)) this._container.removeChild(this._deleteButton);
    }
};

/**
 * Enable
 */
App.AddTransactionScreen.prototype.enable = function enable()
{
    App.InputScrollScreen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.AddTransactionScreen.prototype.disable = function disable()
{
    this.resetScroll();

    App.InputScrollScreen.prototype.disable.call(this);

    this._transactionInput.disable();
    this._noteInput.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.AddTransactionScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.InputScrollScreen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._transactionInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
    this._noteInput.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.InputScrollScreen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._transactionInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._noteInput.removeEventListener(EventType.BLUR,this,this._onInputBlur);
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
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            var HeaderAction = App.HeaderAction;
            var button = this._optionList.getItemUnderPoint(pointerData);

            if (button === this._accountOption)
            {
                //TODO use pool for ChangeScreen data?
                App.Controller.dispatchEvent(
                    App.EventType.CHANGE_SCREEN,{
                        screenName:App.ScreenName.ACCOUNT,
                        screenMode:App.ScreenMode.SELECT,
                        headerLeftAction:HeaderAction.CANCEL,
                        headerRightAction:HeaderAction.NONE,
                        headerName:"Select Account"//TODO remove hard-coded value
                    }
                );
            }
            else if (button === this._categoryOption)
            {
                if (this._model.account)
                {
                    App.Controller.dispatchEvent(
                        App.EventType.CHANGE_SCREEN,{
                            screenName:App.ScreenName.CATEGORY,
                            screenMode:App.ScreenMode.SELECT,
                            updateData:this._model.account.categories,
                            headerLeftAction:HeaderAction.CANCEL,
                            headerRightAction:HeaderAction.NONE,
                            headerName:"Select Category"//TODO remove hard-coded value
                        }
                    );
                }
                else
                {
                    App.Controller.dispatchEvent(
                        App.EventType.CHANGE_SCREEN,{
                            screenName:App.ScreenName.ACCOUNT,
                            screenMode:App.ScreenMode.SELECT,
                            headerLeftAction:HeaderAction.CANCEL,
                            headerRightAction:HeaderAction.NONE,
                            headerName:"Select Account"//TODO remove hard-coded value
                        }
                    );
                }
            }
        }
    }
    else if (this._noteInput.hitTest(position))
    {
        this._scrollInput = this._noteInput;
        this._focusInput(false);
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
    if (action === App.HeaderAction.CONFIRM)
    {
        // confirm
    }
    else
    {
        //cancel
    }
};

/**
 * @class SelectTimeScreen
 * @extends InputScrollScreen
 * @param {Object} layout
 * @constructor
 */
App.SelectTimeScreen = function SelectTimeScreen(layout)
{
    App.InputScrollScreen.call(this,null,layout);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();//TODO do I need BG? I can use BG below whole screen ...
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(new Date(),w,r);

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
 * Register event listeners
 * @private
 */
App.SelectTimeScreen.prototype._registerEventListeners = function _registerEventListener()
{
    App.InputScrollScreen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.SelectTimeScreen.prototype._unRegisterEventListeners = function _unRegisterEventListener()
{
    App.InputScrollScreen.prototype._unRegisterEventListeners.call(this);

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
 * @class AccountButton
 * @extends Graphics
 * @param {Account} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {{font:string,fill:string}} nameStyle
 * @param {{font:string,fill:string}} detailStyle
 * @constructor
 */
App.AccountButton = function AccountButton(model,width,height,pixelRatio,nameStyle,detailStyle)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);

    this._model = model;
    this._pixelRatio = pixelRatio;
    this._nameLabel = new PIXI.Text(this._model.name,nameStyle);
    this._detailsLabel = new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",detailStyle);//TODO remove hard-coded data

    this._render();

    this.addChild(this._nameLabel);
    this.addChild(this._detailsLabel);
};

App.AccountButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        r = this._pixelRatio,
        offset = Math.round(15 * r),
        padding = Math.round(10 * r);

    this._nameLabel.x = offset;
    this._nameLabel.y = offset;

    this._detailsLabel.x = offset;
    this._detailsLabel.y = Math.round(45 * r);

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);
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
 * @class AccountScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var AccountButton = App.AccountButton,
        FontStyle = App.FontStyle,
        nameStyle = FontStyle.get(24,FontStyle.BLUE),
        detailStyle = FontStyle.get(12,FontStyle.GREY_DARKER),
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight,
        i = 0,
        l = this._model.length(),
        itemHeight = Math.round(70 * r),
        button = null;

    //TODO when there is nothing set up at beginning yet, add messages to guide user how to set things up

    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,h);

    //TODO move this to 'update' method
    for (;i<l;i++)
    {
        button = new AccountButton(this._model.getItemAt(i),w,itemHeight,r,nameStyle,detailStyle);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,h,r,false);
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
 * Click handler
 * @private
 */
App.AccountScreen.prototype._onClick = function _onClick()
{
    var button = this._buttonList.getItemUnderPoint(this.stage.getTouchData()),
        HeaderAction = App.HeaderAction;

    if (button)
    {
        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,{
                screenName:App.ScreenName.CATEGORY,
                screenMode:App.ScreenMode.SELECT,
                updateData:button.getModel().categories,
                headerLeftAction:HeaderAction.CANCEL,
                headerRightAction:HeaderAction.NONE,//TODO add back(arrow) button?
                headerName:"Select Category"//TODO remove hard-coded value
            }
        );
    }
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.AccountScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction;

    if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,{
                screenName:App.ScreenName.ADD_TRANSACTION,
                screenMode:App.ScreenMode.ADD,
                updateData:App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).getCurrent(),
                headerLeftAction:HeaderAction.CANCEL,
                headerRightAction:HeaderAction.CONFIRM,
                headerName:"Add Transaction"//TODO remove hard-coded value
            }
        );
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
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.deleteLabelStyle
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
    this._pixelRatio = options.pixelRatio;
    this._swipeSurface = new PIXI.DisplayObjectContainer();
    this._skin = new PIXI.Sprite(options.skin);
    this._icon = PIXI.Sprite.fromFrame("subcategory-app");
    this._nameLabel = new PIXI.Text("",options.nameLabelStyle);
    this._radioCheck = new App.Radio(this._pixelRatio,false);//TODO do I need the Radio in Category select list?
    this._background = new PIXI.Graphics();
    this._deleteLabel = new PIXI.Text("Delete",options.deleteLabelStyle);
    this._renderAll = true;

    this.addChild(this._background);
    this.addChild(this._deleteLabel);
    this._swipeSurface.addChild(this._skin);
    this._swipeSurface.addChild(this._icon);
    this._swipeSurface.addChild(this._nameLabel);
    this._swipeSurface.addChild(this._radioCheck);
    this.addChild(this._swipeSurface);
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

        this._nameLabel.x = Math.round(64 * r);
        this._nameLabel.y = Math.round((h - this._nameLabel.height) / 2);

        this._radioCheck.x = w - offset - this._radioCheck.boundingBox.width;
        this._radioCheck.y = Math.round((h - this._radioCheck.height) / 2);
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
 * @param {Category} model
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
 * @returns {SubCategory}
 */
App.SubCategoryButton.prototype.getModel = function getModel()
{
    return this._model;
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
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.deleteLabelStyle
 * @param {{font:string,fill:string}} options.addLabelStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.SubCategoryList = function SubCategoryList(options)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,0);

    this._model = null;
    this._mode = null;
    this._width = options.width;
    this._pixelRatio = options.pixelRatio;
    this._interactiveButton = null;
    this._buttonList = new App.List(App.Direction.Y);
    this._addNewButton = new App.AddNewButton("ADD SUB-CATEGORY",options.addLabelStyle,App.ViewLocator.getViewSegment(App.ViewName.SKIN).WHITE_40,this._pixelRatio);

    this.addChild(this._buttonList);
    this.addChild(this._addNewButton);
};

App.SubCategoryList.prototype = Object.create(PIXI.Graphics.prototype);
App.SubCategoryList.prototype.constructor = App.SubCategoryList;

/**
 * Update layout
 * @private
 */
App.SubCategoryList.prototype._render = function _render()
{
    this._addNewButton.y = this._buttonList.boundingBox.height;

    this.boundingBox.height = this._addNewButton.y + this._addNewButton.boundingBox.height;
};

/**
 * @method update
 * @param {App.Category} model
 * @param {string} mode
 */
App.SubCategoryList.prototype.update = function update(model,mode)
{
    this._model = model;

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
    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this.closeButtons(false);
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
        l = this._buttonList.length,
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

    this._skin = new PIXI.Sprite(options.skin);
    this._colorStripe = new PIXI.Graphics();
    this._icon = null;
    this._nameLabel = new PIXI.Text("",options.nameLabelStyle);
    this._renderAll = true;

    this.addChild(this._skin);
    this.addChild(this._colorStripe);
    this.addChild(this._nameLabel);
};

App.CategoryButtonSurface.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButtonSurface.prototype.constructor = App.CategoryButtonSurface;

/**
 * Render
 * @param {string} label
 * @param {string} iconName
 */
App.CategoryButtonSurface.prototype.render = function render(label,iconName)
{
    this._nameLabel.setText(label);

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[iconName]);

    App.GraphicUtils.drawRect(this._colorStripe,0xffcc00,1,0,0,Math.round(4 * this._pixelRatio),this._height);

    if (this._renderAll)
    {
        this._renderAll = false;

        this._icon = PIXI.Sprite.fromFrame(iconName);
        this.addChild(this._icon);

        this._icon.width = Math.round(20 * this._pixelRatio);
        this._icon.height = Math.round(20 * this._pixelRatio);
        this._icon.x = Math.round(25 * this._pixelRatio);
        this._icon.y = Math.round((this._height - this._icon.height) / 2);
        this._icon.tint = App.ColorTheme.BLUE;

        this._nameLabel.x = Math.round(64 * this._pixelRatio);
        this._nameLabel.y = Math.round(18 * this._pixelRatio);
    }
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
    this._swipeSurface = new App.CategoryButtonSurface(options);
    this._background = new PIXI.Graphics();
    this._editLabel = new PIXI.Text("Edit",options.editLabelStyle);
    this._renderAll = true;

    this.addChild(this._background);
    this.addChild(this._editLabel);
    this.addChild(this._swipeSurface);
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

    this._swipeSurface.render(this._model.name,this._model.icon,w,h,this._pixelRatio);

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
 * @param {Category} model
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
    this._surface.render(this._model.name,this._model.icon);
};

/**
 * Update
 * @param {Category} model
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
            var button = this._subCategoryList.getItemUnderPoint(data);

            if (button)
            {
                var ModelLocator = App.ModelLocator,
                    ModelName = App.ModelName,
                    HeaderAction = App.HeaderAction,
                    transaction = ModelLocator.getProxy(App.ModelName.TRANSACTIONS).getCurrent();

                transaction.account = ModelLocator.getProxy(ModelName.ACCOUNTS).filter([this._model.account],"id")[0];
                transaction.category = this._model;
                transaction.subCategory = button.getModel();

                App.Controller.dispatchEvent(
                    App.EventType.CHANGE_SCREEN,{
                        screenName:App.ScreenName.ADD_TRANSACTION,
                        headerLeftAction:HeaderAction.CANCEL,
                        headerRightAction:HeaderAction.CONFIRM,
                        headerName:"Add Transaction"//TODO remove hard-coded value
                    }
                );
            }
            else
            {
                //TODO add new SubCategory
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
    App.Screen.call(this,null,layout,0.4);

    this._interactiveButton = null;
    this._buttonsInTransition = [];
    this._layoutDirty = false;

    this._buttonList = new App.TileList(App.Direction.Y,layout.contentHeight);
    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,layout.width,layout.contentHeight,layout.pixelRatio,false);
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

    this._pane.disable();

    //TODO do I need disable buttons? They'll be updated on show anyway
    /*var i = 0,
        l = this._buttonList.length;

    for (;i<l;) this._buttonList.getItemAt(i++).disable();*/
};

/**
 * Update
 * @private
 */
App.CategoryScreen.prototype.update = function update(data,mode)
{
    this._model = data;

    var ScreenMode = App.ScreenMode,
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        expandButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EXPAND_POOL),
        editButtonPool = ViewLocator.getViewSegment(ViewName.CATEGORY_BUTTON_EDIT_POOL),
        buttonPool = this._mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool,
        i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;i++) buttonPool.release(this._buttonList.removeItemAt(0));

    i = 0;
    l = this._model.length;

    buttonPool = mode === ScreenMode.SELECT ? expandButtonPool : editButtonPool;

    for (;i<l;)
    {
        button = buttonPool.allocate();
        button.update(this._model[i++],mode);
        this._buttonList.add(button,false);
    }

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
    if (!preferScroll) this._pane.cancelScroll();

    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this._closeButtons(false);
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
        l = this._buttonList.length,
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
    if (this._mode === App.ScreenMode.SELECT)
    {
        var data = this.stage.getTouchData(),
            EventType = App.EventType;

        this._interactiveButton = this._buttonList.getItemUnderPoint(data);

        if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
        {
            this._buttonsInTransition.push(this._interactiveButton);
            this._interactiveButton.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

            this._layoutDirty = true;
        }

        this._interactiveButton.onClick(data);
        this._pane.cancelScroll();
    }

//    if (!this._swipeEnabled) this._closeButtons(false);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.CategoryScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction;

    if (action === HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,{
                screenName:App.ScreenName.ADD_TRANSACTION,
                screenMode:App.ScreenMode.ADD,
                updateData:App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).getCurrent(),
                headerLeftAction:HeaderAction.CANCEL,
                headerRightAction:HeaderAction.CONFIRM,
                headerName:"Add Transaction"//TODO remove hard-coded value
            }
        );
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
    this._color = color;
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
    App.InputScrollScreen.call(this,null,layout);

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
            skin:App.ViewLocator.getViewSegment(App.ViewName.SKIN).GREY_40,
            addLabelStyle:FontStyle.get(14,FontStyle.GREY_DARK)
        };

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.contentHeight,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._input = new Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true);
    this._separators = new PIXI.Graphics();
    this._colorList = new InfiniteList(this._getColorSamples(),App.ColorSample,Direction.X,w,Math.round(50 * r),r);
    this._topIconList = new InfiniteList(icons.slice(0,Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._bottomIconList = new InfiniteList(icons.slice(Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._subCategoryList = new App.SubCategoryList(subCategoryButtonOptions);
    this._budgetHeader = new App.ListHeader("Budget",w,r);
    this._budget = new Input("Enter Budget",20,inputWidth,inputHeight,r,true);
    this._deleteButton = new App.Button("Delete",{width:inputWidth,height:inputHeight,pixelRatio:r,style:FontStyle.get(18,FontStyle.WHITE),backgroundColor:App.ColorTheme.RED});

    //TODO add modal window to confirm deleting sub-category. Also offer option 'Edit'?
    //TODO center selected color/icon when shown

    this._budget.restrict(/\D/g);
    this._render();

    //TODO use list instead of DisplayObjectContainer for container?
    this._container.addChild(this._background);
    this._container.addChild(this._colorStripe);
    this._container.addChild(this._icon);
    this._container.addChild(this._input);
    this._container.addChild(this._separators);
    this._container.addChild(this._colorList);
    this._container.addChild(this._topIconList);
    this._container.addChild(this._bottomIconList);
    this._container.addChild(this._subCategoryList);
    this._container.addChild(this._budgetHeader);
    this._container.addChild(this._budget);
    this._container.addChild(this._deleteButton);
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
        iconResizeRatio = Math.round(32 * r) / this._icon.height,
        separatorWidth = w - this._inputPadding * 2,
        bottom = 0;

    GraphicUtils.drawRect(this._colorStripe,0xff6600,1,0,0,Math.round(4*r),Math.round(59 * r));

    this._icon.scale.x = iconResizeRatio;
    this._icon.scale.y = iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((inputFragmentHeight - this._icon.height) / 2);
    this._icon.tint = ColorTheme.BLUE;

    this._input.x = Math.round(60 * r);
    this._input.y = Math.round((inputFragmentHeight - this._input.height) / 2);

    this._colorList.y = inputFragmentHeight;
    this._topIconList.y = inputFragmentHeight + this._colorList.boundingBox.height;
    this._bottomIconList.y = this._topIconList.y + this._topIconList.boundingBox.height;

    this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;

    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;

    bottom = this._budgetHeader.y + this._budgetHeader.height;

    this._budget.x = this._inputPadding;
    this._budget.y = bottom + this._inputPadding;

    bottom = bottom + inputFragmentHeight;

    this._deleteButton.x = this._inputPadding;
    this._deleteButton.y = bottom + this._inputPadding;

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
    this._separators.x = this._inputPadding;
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.InputScrollScreen.prototype.enable.call(this);

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
    this.resetScroll();//TODO reset before the screen start hiding

    App.InputScrollScreen.prototype.disable.call(this);

    this._input.disable();
    this._colorList.disable();
    this._topIconList.disable();
    this._bottomIconList.disable();
    this._budget.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.EditCategoryScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.InputScrollScreen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
    this._budget.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.InputScrollScreen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onInputBlur);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var inputFocused = this._scrollState === App.TransitionState.SHOWN && this._scrollInput,
        position = this.stage.getTouchData().getLocalPosition(this._container),
        y = position.y,
        list = null;

    if (this._input.hitTest(y))
    {
        this._scrollInput = this._input;
        this._focusInput(this._scrollInput.y + this._container.y > 0);

        this._subCategoryList.closeButtons();
    }
    else if (this._colorList.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            list = this._colorList;
            list.cancelScroll();
            list.selectItemByPosition(position.x);
        }
    }
    else if (this._topIconList.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            list = this._topIconList;
            list.selectItemByPosition(position.x);
            list.cancelScroll();
            this._bottomIconList.selectItemByPosition(-1000);
        }
    }
    else if (this._bottomIconList.hitTest(y))
    {
        if (inputFocused)
        {
            this._scrollInput.blur();
        }
        else
        {
            list = this._bottomIconList;
            list.cancelScroll();
            list.selectItemByPosition(position.x);
            this._topIconList.selectItemByPosition(-1000);
        }
    }
    else if (this._budget.hitTest(y))
    {
        this._scrollInput = this._budget;
        this._focusInput(false);

        this._subCategoryList.closeButtons();
    }
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
    var MathUtils = App.MathUtils,
        i = 0,
        l = 30,
        frequency = 2 * Math.PI/l,
        amplitude = 127,
        center = 128,
        colorSamples = new Array(l);

    for (;i<l;i++)
    {
        colorSamples[i] = MathUtils.rgbToHex(
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
 * @param {number} modelIndex
 * @param {Transaction} model
 * @param {{width:number,height:number,pixelRatio:number:labelStyles:Object}} options
 * @constructor
 */
App.TransactionButton = function TransactionButton(modelIndex,model,options)
{
    App.SwipeButton.call(this,options.width,Math.round(120*options.pixelRatio));

    var Text = PIXI.Text,
        Graphics = PIXI.Graphics,
        editStyle = options.labelStyles.edit,
        placeholder = "";

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = model;
    this._modelIndex = modelIndex;
    this._pixelRatio = options.pixelRatio;
    this._labelStyles = options.labelStyles;
    this._isPending = void 0;

    this._background = new Graphics();
    this._copyLabel = new Text("Copy",editStyle);
    this._editLabel = new Text("Edit",editStyle);
    this._swipeSurface = new Graphics();
    this._icon = PIXI.Sprite.fromFrame(model.iconName);
    this._iconResizeRatio = Math.round(32 * this._pixelRatio) / this._icon.height;
    this._accountField = new Text(placeholder,editStyle);
    this._categoryField = new Text(placeholder,editStyle);
    this._amountField = new Text(placeholder,editStyle);
    this._dateField = new Text(placeholder,editStyle);
    this._pendingFlag = new Graphics();
    this._pendingLabel = new Text("PENDING",this._labelStyles.pending);

    this._update(true);

    this._swipeSurface.addChild(this._icon);
    this._swipeSurface.addChild(this._accountField);
    this._swipeSurface.addChild(this._categoryField);
    this._swipeSurface.addChild(this._amountField);
    this._swipeSurface.addChild(this._dateField);
    this._pendingFlag.addChild(this._pendingLabel);
    this.addChild(this._background);
    this.addChild(this._copyLabel);
    this.addChild(this._editLabel);
    this.addChild(this._swipeSurface);
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
    var pending = this._model.pending;

    this._accountField.setText(this._model.account);
    this._amountField.setText(this._model.amount);
    this._categoryField.setText(this._model.category);
    this._dateField.setText(pending ? "Due by\n"+this._model.date : this._model.date);
    this._icon.setTexture(PIXI.TextureCache[this._model.iconName]);

    if (pending !== this._isPending)
    {
        if (pending)
        {
            this._accountField.setStyle(this._labelStyles.accountPending);
            this._amountField.setStyle(this._labelStyles.amountPending);
            this._categoryField.setStyle(this._labelStyles.accountPending);
            this._dateField.setStyle(this._labelStyles.datePending);
        }
        else
        {
            this._accountField.setStyle(this._labelStyles.account);
            this._amountField.setStyle(this._labelStyles.amount);
            this._categoryField.setStyle(this._labelStyles.account);
            this._dateField.setStyle(this._labelStyles.date);
        }

        this._render(updateAll,pending);
        this._updateLayout(updateAll,pending);
    }

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
        swipeOptionWidth = Math.round(60 * r),
        colorStripeWidth = Math.round(4 * r),
        padding = Math.round(10 * r),
        bgColor = ColorTheme.GREY,
        lightColor = ColorTheme.GREY_LIGHT,
        darkColor = ColorTheme.GREY_DARK;

    if (renderAll)
    {
        GraphicUtils.drawRects(this._background,ColorTheme.GREEN,1,[0,0,w-swipeOptionWidth,h],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.RED,1,[w-swipeOptionWidth,0,swipeOptionWidth,h],false,true);

        GraphicUtils.drawRect(this._pendingFlag,0x000000,1,0,0,Math.round(this._pendingLabel.width+10*r),Math.round(this._pendingLabel.height+6*r));
    }

    if (pending)
    {
        bgColor = ColorTheme.RED;
        lightColor = ColorTheme.RED_LIGHT;
        darkColor = ColorTheme.RED_DARK;

        this._icon.tint = ColorTheme.RED_DARK;

        if (!this._swipeSurface.contains(this._pendingFlag)) this._swipeSurface.addChild(this._pendingFlag);
    }
    else
    {
        this._icon.tint = ColorTheme.BLUE;

        if (this._swipeSurface.contains(this._pendingFlag)) this._swipeSurface.removeChild(this._pendingFlag);
    }
    //TODO use skin instead
    GraphicUtils.drawRects(this._swipeSurface,0xff3366,1,[0,0,colorStripeWidth,h],true,false);
    GraphicUtils.drawRects(this._swipeSurface,bgColor,1,[colorStripeWidth,0,w-colorStripeWidth,h],false,false);
    GraphicUtils.drawRects(this._swipeSurface,lightColor,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this._swipeSurface,darkColor,1,[padding,h-1,w-padding*2,1],false,true);
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

        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(20 * r);
        this._icon.y = Math.round((h - this._icon.height) / 2);

        this._accountField.x = Math.round(70 * r);
        this._accountField.y = Math.round(7 * r);
        this._amountField.x = Math.round(70 * r);
        this._amountField.y = Math.round(26 * r);
        this._categoryField.x = Math.round(70 * r);
        this._categoryField.y = Math.round(52 * r);

        this._pendingLabel.x = Math.round(5 * r);
        this._pendingLabel.y = Math.round(4 * r);
        this._pendingFlag.x = Math.round(w - padding - this._pendingFlag.width);
        this._pendingFlag.y = Math.round(7 * r);
    }

    this._dateField.x = Math.round(w - padding - this._dateField.width);
    this._dateField.y = pending ? Math.round(38 * r) : Math.round(52 * r);
};

/**
 * Set model
 * @param {number} modelIndex
 * @param {Object} model
 */
App.TransactionButton.prototype.setModel = function setModel(modelIndex,model)
{
    this._modelIndex = modelIndex;
    this._model = model;

    this._update(false);
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
    App.Screen.call(this,null,layout,0.4);

    //TODO bottom items are not rendered when the screen is re-shown (due to scrolled position)

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.contentHeight,
        buttonOptions = {
            labelStyles:{
                edit:FontStyle.get(18,FontStyle.WHITE),
                account:FontStyle.get(14,FontStyle.BLUE_LIGHT),
                amount:FontStyle.get(26,FontStyle.BLUE_DARK),
                date:FontStyle.get(14,FontStyle.GREY_DARK),
                pending:FontStyle.get(12,FontStyle.WHITE),
                accountPending:FontStyle.get(14,FontStyle.RED_DARK),
                amountPending:FontStyle.get(26,FontStyle.WHITE),
                datePending:FontStyle.get(14,FontStyle.WHITE,"right")
            },
            width:w,
            height:Math.round(70*r),
            pixelRatio:r
        },
        i = 0,
        l = 50,
        transactions = new Array(l);

    this._interactiveButton = null;

    for (;i<l;i++) transactions[i] = {amount:100+i,account:"Personal",category:"Cinema / Entertainment",date:"10/21/2013",iconName:"transactions",pending:(i % 23) === 0};

    this._buttonList = new App.VirtualList(transactions,App.TransactionButton,buttonOptions,App.Direction.Y,w,h,r);
    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,h,r,false);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);
};

App.TransactionScreen.prototype = Object.create(App.Screen.prototype);
App.TransactionScreen.prototype.constructor = App.TransactionScreen;

/**
 * Enable
 */
App.TransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._buttonList.reset();
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
        colors = [0xff0000,0xc0ffee,0x0000ff],
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
    App.Screen.call(this,null,layout,0.4);

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
            accountName:FontStyle.get(22,FontStyle.WHITE),
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

App.Menu = function Menu(layout)
{
    App.Screen.call(this,null,layout);

    var MenuItem = App.MenuItem,
        ScreenName = App.ScreenName,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        itemLabelStyle = FontStyle.get(20,FontStyle.WHITE),
        itemOptions = {
            width:w,
            height:Math.round(40 * r),
            pixelRatio:r,
            style:itemLabelStyle
        };

    this._addTransactionItem = new MenuItem("Add Transaction","transactions",ScreenName.ADD_TRANSACTION,{width:w,height:Math.round(50*r),pixelRatio:r,style:itemLabelStyle});
    this._accountsItem = new MenuItem("Accounts","account",ScreenName.ACCOUNT,itemOptions);
    this._reportItem = new MenuItem("Report","chart",ScreenName.REPORT,itemOptions);
    this._budgetItem = new MenuItem("Budgets","budget",ScreenName.EDIT_CATEGORY,itemOptions);
    this._transactionsItem = new MenuItem("Transactions","transactions",ScreenName.TRANSACTIONS,itemOptions);
    this._currenciesItem = new MenuItem("Currencies","currencies",-1,itemOptions);
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
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
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
        HeaderAction = App.HeaderAction,
        item = this._getItemByPosition(this.stage.getTouchData().getLocalPosition(this._container).y),
        screenName = item ? item.getScreenName() : -1;

    switch (screenName)
    {
        case ScreenName.ADD_TRANSACTION:
            App.Controller.dispatchEvent(App.EventType.CREATE_TRANSACTION,{
                nextCommand:new App.ChangeScreen(),
                nextCommandData:{
                    screenName:ScreenName.ADD_TRANSACTION,
                    screenMode:App.ScreenMode.ADD,
                    headerLeftAction:HeaderAction.CANCEL,
                    headerRightAction:HeaderAction.CONFIRM,
                    headerName:"Add Transaction"//TODO remove hard-coded value
                }
            });
            break;

        default:
            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,{screenName:ScreenName.TRANSACTIONS});
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
        account = ModelLocator.getProxy(ModelName.ACCOUNTS),
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

    this._eventDispatcher = new App.EventDispatcher(listenerPool);
    this._background = new PIXI.Graphics();

    //TODO use ScreenFactory for the screens?
    //TODO deffer initiation and/or rendering of most of the screens?
    this._screenStack = ViewLocator.addViewSegment(ViewName.SCREEN_STACK,new App.ViewStack([
        new App.AccountScreen(account,this._layout),
        new App.CategoryScreen(this._layout),
        new App.SelectTimeScreen(this._layout),
        new App.EditCategoryScreen(this._layout),
        new App.TransactionScreen(this._layout),
        new App.ReportScreen(this._layout),
        new App.AddTransactionScreen(this._layout),
        new App.Menu(this._layout)//TODO is Menu part of stack? And if it is, it should be at bottom
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

    var fontInfoWidth = this._fontInfoElement.offsetWidth;

    this._fontLoadingInterval = setInterval(function()
    {
        if (this._fontInfoElement.offsetWidth !== fontInfoWidth)
        {
            clearInterval(this._fontLoadingInterval);

            //TODO remove font info element from DOM?

            this._loadData();
        }
    }.bind(this),100);

    this._fontInfoElement.style.fontFamily = "HelveticaNeueCond";
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
    this._loadDataCommand.destroy();
    this._loadDataCommand = null;
    
    this._initModel(data);
    this._initController();
    this._initView();

    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,{
        screenName:App.ScreenName.MENU,
        headerLeftAction:App.HeaderAction.CANCEL,
        headerRightAction:App.HeaderAction.NONE,
        headerName:"Menu"//TODO remove hard-coded value
    });

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {{userData:string,transactions:string,icons:Object}} data
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data)
{
    var ModelName = App.ModelName,
        Collection = App.Collection,
        PaymentMethod = App.PaymentMethod,
        Currency = App.Currency,
        userData = JSON.parse(data.userData),
        currencies = new Collection(userData.currencies,Currency,null,this._eventListenerPool);

    currencies.addItem(new Currency([1,"USD"]));

    App.ModelLocator.init([
        ModelName.EVENT_LISTENER_POOL,this._eventListenerPool,
        ModelName.TICKER,new App.Ticker(this._eventListenerPool),
        ModelName.ICONS,Object.keys(data.icons).filter(function(element) {return element.indexOf("-app") === -1}),
        ModelName.PAYMENT_METHODS,new Collection([PaymentMethod.CASH,PaymentMethod.CREDIT_CARD],PaymentMethod,null,this._eventListenerPool),
        ModelName.CURRENCIES,currencies,
        ModelName.SETTINGS,new App.Settings(userData.settings),
        ModelName.SUB_CATEGORIES,new Collection(userData.subCategories,App.SubCategory,null,this._eventListenerPool),
        ModelName.CATEGORIES,new Collection(userData.categories,App.Category,null,this._eventListenerPool),
        ModelName.ACCOUNTS,new Collection(userData.accounts,App.Account,null,this._eventListenerPool),
        ModelName.TRANSACTIONS,new Collection(userData.transactions,App.Transaction,null,this._eventListenerPool)
    ]);
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
        EventType.CREATE_TRANSACTION,App.CreateTransaction
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
        w = Math.round(width * pixelRatio),
        stage = new PIXI.Stage(0xffffff),
        renderer = new PIXI.CanvasRenderer(width,height,{
            view:canvas,
            resolution:1,
            transparent:false,
            autoResize:false,
            clearBeforeRender:false
        }),
        ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        ObjectPool = App.ObjectPool,
        FontStyle = App.FontStyle.init(pixelRatio),
        skin = new App.Skin(w,pixelRatio),
        categoryButtonOptions = {
            width:w,
            height:Math.round(50 * pixelRatio),
            pixelRatio:pixelRatio,
            skin:skin.GREY_50,
            nameLabelStyle:FontStyle.get(18,FontStyle.BLUE),
            editLabelStyle:FontStyle.get(18,FontStyle.WHITE),
            addLabelStyle:FontStyle.get(14,FontStyle.GREY_DARK)
        },
        subCategoryButtonOptions = {
            width:w,
            height:Math.round(40 * pixelRatio),
            pixelRatio:pixelRatio,
            skin:skin.WHITE_40,
            nameLabelStyle:FontStyle.get(14,FontStyle.BLUE),
            deleteLabelStyle:FontStyle.get(14,FontStyle.WHITE),
            openOffset:Math.round(80 * pixelRatio)
        };

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

    ViewLocator.init([
        ViewName.SKIN,skin,
        ViewName.CATEGORY_BUTTON_EXPAND_POOL,new ObjectPool(App.CategoryButtonExpand,5,categoryButtonOptions),
        ViewName.CATEGORY_BUTTON_EDIT_POOL,new ObjectPool(App.CategoryButtonEdit,5,categoryButtonOptions),
        ViewName.SUB_CATEGORY_BUTTON_POOL,new ObjectPool(App.SubCategoryButton,5,subCategoryButtonOptions)
    ]);
    ViewLocator.addViewSegment(ViewName.APPLICATION_VIEW,stage.addChild(new App.ApplicationView(stage,renderer,width,height,pixelRatio)));
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
 */
App.ChangeScreen.prototype.execute = function execute(data)
{
    var ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        screenStack = ViewLocator.getViewSegment(ViewName.SCREEN_STACK),
        screen = screenStack.getChildByIndex(data.screenName);

    screen.update(data.updateData,data.screenMode);

    ViewLocator.getViewSegment(ViewName.HEADER).change(data.headerLeftAction,data.headerRightAction,data.headerName);

    screenStack.selectChild(screen);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * @class CreateTransaction
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CreateTransaction = function CreateTransaction(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.CreateTransaction.prototype = Object.create(App.SequenceCommand.prototype);
App.CreateTransaction.prototype.constructor = App.CreateTransaction;

/**
 * Execute the command
 *
 * @method execute
 * @param {{nextCommand:Command,screenName:number}} data
 */
App.CreateTransaction.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var transactions = App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS),
        transaction = new App.Transaction();

    transactions.addItem(transaction);
    transactions.setCurrent(transaction);

    data.nextCommandData.updateData = transaction;

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};

(function()
{
    //TODO move to index.html and also build simply pre-preloader

    function onInitComplete()
    {
        initCommand.destroy();
        initCommand = null;
    }

    var initCommand = new App.Initialize();
    initCommand.addEventListener(App.EventType.COMPLETE,this,onInitComplete);
    initCommand.execute();
})();
