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
 * Event type
 * @enum {string}
 * @return {{
 *      CHANGE_SCREEN:string,
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
 *      ACCOUNTS:string,
 *      TRANSACTIONS:string,
 *      SETTINGS:string,
 *      FILTERS:string,
 *      CURRENCIES:string,
 *      ICONS:string
 * }}
 */
App.ModelName = {
    TICKER:"TICKER",
    EVENT_LISTENER_POOL:"EVENT_LISTENER_POOL",
    ACCOUNTS:"ACCOUNTS",
    TRANSACTIONS:"TRANSACTIONS",
    SETTINGS:"SETTINGS",
    FILTERS:"FILTERS",
    CURRENCIES:"CURRENCIES",
    ICONS:"ICONS"
};

/**
 * View Segment state
 * @enum {string}
 * @return {{APPLICATION_VIEW:string,LOG:string}}
 */
App.ViewName = {
    APPLICATION_VIEW:"APPLICATION_VIEW",
    LOG:"LOG"
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
 * @return {{ACCOUNT:number,CATEGORY:number,SELECT_TIME:number,EDIT_CATEGORY:number,TRANSACTIONS:number,REPORT:number,ADD_TRANSACTION:number}}
 */
App.ScreenName = {
    ACCOUNT:0,
    CATEGORY:1,
    SELECT_TIME:2,
    EDIT_CATEGORY:3,
    TRANSACTIONS:4,
    REPORT:5,
    ADD_TRANSACTION:6
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
 * @constructor
 */
App.ObjectPool = function ObjectPool(objectClass,size)
{
    this._objectClass = objectClass;
    this._size = size;
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
        this._items[i] = new this._objectClass(i);
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

    this.dispatchEvent(App.EventType.CHANGE,data);
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
 * @method removeItemAt Remove item at index passed in
 * @return {*} item
 */
App.Collection.prototype.removeItemAt = function removeItemAt(index)
{
    var item = this._items.splice(index,1)[0];

    this._updateCurrentIndex();

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
 * @type {{_startOfWeek: number, setStartOfWeek: Function,getStartOfWeek:Function}}
 */
App.Settings = {
    _startOfWeek:0,// 0 = Sun, ..., 6 = Sat

    /**
     * Set start of a week
     * @param {number} value
     */
    setStartOfWeek:function setStartOfWeek(value)
    {
        if (value >= 0 && value <= 6) this._startOfWeek = value;
    },

    /**
     * Return start of a week
     * @returns {number}
     */
    getStartOfWeek:function getStartOfWeek()
    {
        return this._startOfWeek;
    }
};

/**
 * @class Account
 * @param {{name:string,categories:Array.<Category>}} data
 * @param {Collection} collection
 * @param {Object} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Account = function Account(data,collection,parent,eventListenerPool)
{
    this._data = data;
    this._name = null;
    this._categories = null;
    this._eventListenerPool = eventListenerPool;
};

/**
 * Create and return name
 *
 * @method getName
 * @returns {string}
 */
App.Account.prototype.getName = function getName()
{
    if (!this._name) this._name = this._data.name;

    return this._name;
};

App.Account.prototype.getBalance = function getBalance()
{

};

App.Account.prototype.getExpenses = function getExpenses()
{

};

App.Account.prototype.getIncome = function getIncome()
{

};

/**
 * Create and return categories collection
 *
 * @method getCategories
 * @returns {Collection}
 */
App.Account.prototype.getCategories = function getCategories()
{
    if (!this._categories)
    {
        this._categories = new App.Collection(
            this._data.categories,
            App.Category,
            this,
            this._eventListenerPool
        );
    }

    return this._categories;
};

App.Transaction = function Transaction(amount,currency,category,date,type,mode,repeating,pending)
{
    this.amount = amount;
    this.currency = currency;
    this.category = category;
    this.date = date;
    this.type = type;
    this.mode = mode;
    this.repeating = repeating;
    this.pending = pending;
};

App.Category = function Category(data,collection,parent,eventListenerPool)
{
    this._data = data;
    this._account = parent;
    this.name = data.name;
    this.color = data.color;
    this.icon = data.icon;
    this.subCategories = data.subCategories;
    //this.budget = budget;
};

App.Filter = function Filter(startDate,endDate,categories)
{
    this.startDate = startDate;
    this.endDate = endDate;
    this.categories = categories;
};

/**
 * @class ViewLocator
 * @type {{_viewSegments:Object, addViewSegment: Function, hasViewSegment: Function, getViewSegment: Function}}
 */
App.ViewLocator = {
    _viewSegments:{},

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
 * @type {{BLUE: number,BLUE_DARK:number, GREY: number, GREY_DARK: number, GREY_LIGHT: number,RED:number,RED_DARK:number,RED_LIGHT:number,GREEN:number,INPUT_HIGHLIGHT:number}}
 */
App.ColorTheme = {
    BLUE:0x394264,
    BLUE_DARK:0x252B44,
    GREY:0xefefef,
    GREY_DARK:0xcccccc,
    GREY_LIGHT:0xffffff,
    RED:0xE53013,
    RED_DARK:0x990000,
    RED_LIGHT:0xFF3300,
    GREEN:0x33CC33,
    INPUT_HIGHLIGHT:0x0099ff
};

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
    SHADE:"#efefef",
    SHADE_DARK:"#cccccc",
    RED_DARK:"#990000"
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
    this._placeholderStyle = FontStyle.get(fontSize,FontStyle.SHADE);
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

    this._textStyle = FontStyle.get(14,FontStyle.SHADE_DARK);
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
        startOfWeek = App.Settings.getStartOfWeek(),
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

    var month = App.DateUtils.getMonth(this._date,App.Settings.getStartOfWeek()),
        weeksInMonth = month.length,
        selectedMonth = this._selectedDate.getFullYear() === newYear && this._selectedDate.getMonth() === newMonth,
        selectedDate = selectedMonth ? this._selectedDate.getDate() : -1,
        i = 0;

    for (i = 0;i<weeksInMonth;i++) this._weekRows[i].change(month[i],selectedDate);
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
 * Destroy
 */
App.Pane.prototype.destroy = function destroy()
{
    //TODO also destroy PIXI's DisplayObjectContainer object!

    this.disable();

    this._ticker = null;

    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;
    this._mouseData = null;

    this.removeContent();

    if (this.contains(this._xScrollIndicator)) this.removeChild(this._xScrollIndicator);
    this._xScrollIndicator.destroy();
    this._xScrollIndicator = null;

    if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
    this._yScrollIndicator.destroy();
    this._yScrollIndicator = null;

    this._xOriginalScrollPolicy = null;
    this._yOriginalScrollPolicy = null;
    this._xScrollPolicy = null;
    this._yScrollPolicy = null;
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
 * @param {Point} point
 */
App.VirtualList.prototype.getItemUnderPoint = function getItemUnderPoint(point)
{
    var i = 0,
        l = this._items.length,
        property = this._direction === App.Direction.X ? "x" : "y",
        position = point[property],
        itemSize = this._itemSize,
        item = null,
        itemPosition = 0;

    for (;i<l;)
    {
        item = this._items[i++];
        itemPosition = item[property];

        if (itemPosition <= position && itemPosition + itemSize > position) return item;
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
        x = 0,
        item = null;

    this._virtualX = position;

    for (;i<l;)
    {
        item = this._items[i++];
        x = item.x + positionDifference;
        moveToBeginning = x > this._width;
        moveToEnd = x + this._itemSize < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(x / this._width);
            x += itemScreenIndex * l * this._itemSize;
            xIndex = Math.floor(x / this._itemSize);

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
                x = item.x + positionDifference;
            }
        }

        item.x = x;
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
        y = 0,
        item = null;

    this._virtualY = position;

    for (;i<l;)
    {
        item = this._items[i++];
        y = item.y + positionDifference;
        moveToBeginning = y > this._height;
        moveToEnd = y + this._itemSize < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(y / this._height);
            y += itemScreenIndex * l * this._itemSize;
            yIndex = Math.floor(y / this._itemSize);

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
                y = item.y + positionDifference;
            }
        }

        item.y = y;
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
        position = data.getLocalPosition(this).y;

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
 * @param {Array.<Screen>} children
 * @param {boolean} [addToStage=false]
 * @constructor
 */
App.ViewStack = function ViewStack(children,addToStage)
{
    PIXI.DisplayObjectContainer.call(this);

    this._children = [];
    this._selectedChild = null;
    this._selectedIndex = -1;
    this._childrenToHide = [];

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
 * Destroy
 */
App.Screen.prototype.destroy = function destroy()
{
    this.disable();

    this._eventDispatcher.destroy();
    this._eventDispatcher = null;

    this._showHideTween.destroy();
    this._showHideTween = null;

    this._ticker = null;
    this._model = null;
    this._layout = null;
    this._transitionState = null;
    this._mouseDownPosition = null;

    //TODO make sure everything is destroyed
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

App.AddNewButton = function AddNewButton(label,fontStyle,width,height,pixelRatio)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._icon = PIXI.Sprite.fromFrame("plus-app");
    this._iconResizeRatio = Math.round(20 * pixelRatio) / this._icon.height;
    this._labelField = new PIXI.Text(label,fontStyle);

    this._render();

    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.AddNewButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AddNewButton.prototype.constructor = App.AddNewButton;

/**
 * Render
 * @private
 */
App.AddNewButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        w = this._labelField.width,
        gap = Math.round(10 * this._pixelRatio),
        height = this.boundingBox.height,
        padding = Math.round(10 * this._pixelRatio),
        x = 0;

    App.GraphicUtils.drawRect(this,ColorTheme.GREY_LIGHT,1,padding,0,this.boundingBox.width-padding*2,1);

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;

    w += this._icon.width + gap;
    x = Math.round((this.boundingBox.width - w) / 2);

    this._icon.x = x;
    this._icon.y = Math.round((height - this._icon.height) / 2);
    this._icon.tint = ColorTheme.GREY_DARK;

    this._labelField.x = x + this._icon.width + gap;
    this._labelField.y = Math.round((height - this._labelField.height) / 2);
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
 * @constructor
 */
App.ExpandButton = function ExpandButton(width,height)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        eventListenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._content = null;
    this._contentHeight = height;
    this._buttonHeight = height;
    this._mask = new PIXI.Graphics();

    this._eventsRegistered = false;
    this._transitionState = App.TransitionState.CLOSED;
    this._expandTween = new App.TweenProxy(0.4,App.Easing.outExpo,0,eventListenerPool);
    this._eventDispatcher = new App.EventDispatcher(eventListenerPool);
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);

    this._updateMask();

    this.mask = this._mask;
    this.addChild(this._mask);
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
    this._updateMask();

    this._eventDispatcher.dispatchEvent(App.EventType.LAYOUT_UPDATE);
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
    this._updateMask();

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

        this._eventDispatcher.dispatchEvent(App.EventType.START,this);
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
        this._transitionState = TransitionState.CLOSED;

        this._expandTween.stop();

        this._eventDispatcher.dispatchEvent(EventType.COMPLETE,this);
    }
    else
    {
        if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
        {
            this._registerEventListeners();

            this._transitionState = TransitionState.CLOSING;

            this._expandTween.start(true);

            this._eventDispatcher.dispatchEvent(EventType.START,this);
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
 * @class TransactionToggleButton
 * @extends Graphics
 * @param {string} iconName
 * @param {string} label
 * @param {{width:number,height:number,pixelRatio:number,style:Object,toggleStyle:Object}} options
 * @param {{icon:string,label:string,toggleColor:boolean}} toggleOptions
 * @constructor
 */
App.TransactionToggleButton = function TransactionToggleButton(iconName,label,options,toggleOptions)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._pixelRatio = options.pixelRatio;
    this._iconName = iconName;
    this._label = label;
    this._style = options.style;
    this._toggleStyle = options.toggleStyle;
    this._toggleOptions = toggleOptions;
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._labelField = new PIXI.Text(label,this._style);
    this._toggle = false;
    this._iconResizeRatio = Math.round(20 * this._pixelRatio) / this._icon.height;

    this._render(true);

    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.TransactionToggleButton.prototype = Object.create(PIXI.Graphics.prototype);
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
 * Is button toggled?
 * @returns {boolean}
 */
App.TransactionToggleButton.prototype.isToggled = function isToggled()
{
    return this._toggle;
};

/**
 * @class TransactionOptionButton
 * @extends Graphics
 * @param {string} iconName
 * @param {string} name
 * @param {string} value
 * @param {{width:number,height:number,pixelRatio:number,nameStyle:Object,valueStyle:Object,valueDetailStyle:Object}} options
 * @constructor
 */
App.TransactionOptionButton = function TransactionOptionButton(iconName,name,value,options)
{
    PIXI.Graphics.call(this);

    var Text = PIXI.Text,
        Sprite = PIXI.Sprite;

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._pixelRatio = options.pixelRatio;
    this._icon = new Sprite.fromFrame(iconName);
    this._nameField = new Text(name,options.nameStyle);
    this._valueField = new Text(value,options.valueStyle);
    this._valueDetailField = null;
    this._arrow = new Sprite.fromFrame("arrow-app");
    this._iconResizeRatio = Math.round(20 * this._pixelRatio) / this._icon.height;
    this._arrowResizeRatio = Math.round(12 * this._pixelRatio) / this._arrow.height;

    if (value.indexOf("\n") > -1)
    {
        this._valueField.setText(value.substring(0,value.indexOf("\n")));
        this._valueDetailField = new Text(value.substring(value.indexOf("\n"),value.length),options.valueDetailStyle);
    }

    this._render();

    this.addChild(this._icon);
    this.addChild(this._nameField);
    this.addChild(this._valueField);
    if (this._valueDetailField) this.addChild(this._valueDetailField);
    this.addChild(this._arrow);
};

App.TransactionOptionButton.prototype = Object.create(PIXI.Graphics.prototype);
App.TransactionOptionButton.prototype.constructor = App.TransactionOptionButton;

/**
 * Render
 * @private
 */
App.TransactionOptionButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        padding = Math.round(10 * r);

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round(15 * r);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = ColorTheme.GREY_DARK;

    this._nameField.x = Math.round(50 * r);
    this._nameField.y = Math.round((h - this._nameField.height) / 2);

    this._valueField.x = Math.round(w - 35 * r - this._valueField.width);
    if (this._valueDetailField)
    {
        this._valueField.y = Math.round(9 * r);
        this._valueDetailField.y = Math.round(17 * r);
        this._valueDetailField.x = Math.round(w - 35 * r - this._valueDetailField.width);
    }
    else
    {
        this._valueField.y = Math.round((h - this._valueField.height) / 2);
    }

    this._arrow.scale.x = this._arrowResizeRatio;
    this._arrow.scale.y = this._arrowResizeRatio;
    this._arrow.x = Math.round(w - 15 * r - this._arrow.width);
    this._arrow.y = Math.round((h - this._arrow.height) / 2);
    this._arrow.tint = ColorTheme.GREY_DARK;

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);
};

/**
 * @class AddTransactionScreen
 * @extends Screen
 * @param {Transaction} model
 * @param {Object} layout
 * @constructor
 */
App.AddTransactionScreen = function AddTransactionScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var TransactionOptionButton = App.TransactionOptionButton,
        TransactionToggleButton = App.TransactionToggleButton,
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(10 * r) * 2,
        inputHeight = Math.round(40 * r),
        FontStyle = App.FontStyle,
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
            nameStyle:FontStyle.get(18,"#999999"),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.height,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._transactionInpup = new App.Input("00.00",24,inputWidth,inputHeight,r,true);
    this._noteInput = new App.Input("Add Note",20,inputWidth,inputHeight,r,true);
    this._notePosition = 0;
    this._scrollTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._scrollState = App.TransitionState.HIDDEN;

    this._toggleButtonList = new App.List(App.Direction.X);
    this._toggleButtonList.add(new TransactionToggleButton("expense","Expense",toggleOptions,{icon:"income",label:"Income",toggleColor:false}),false);
    this._toggleButtonList.add(new TransactionToggleButton("pending-app","Pending",toggleOptions,{toggleColor:true}),false);
    this._toggleButtonList.add(new TransactionToggleButton("repeat-app","Repeat",toggleOptions,{toggleColor:true}),true);

    this._optionList = new App.List(App.Direction.Y);
    this._optionList.add(new TransactionOptionButton("account","Account","Personal",options),false);
    this._optionList.add(new TransactionOptionButton("folder-app","Category","Cinema\nin Entertainment",options),false);
    this._optionList.add(new TransactionOptionButton("credit-card","Mode","Cash",options),false);
    this._optionList.add(new TransactionOptionButton("calendar","Time","14:56\nJan 29th, 2014",options),false);
    this._optionList.add(new TransactionOptionButton("currencies","Currency","CZK",options),true);

    //TODO add overlay for bluring inputs?
    //TODO autmatically focus input when this screen is shown?

    this._transactionInpup.restrict(/\D/);
    this._render();

    this._container.addChild(this._background);
    this._container.addChild(this._transactionInpup);
    this._container.addChild(this._toggleButtonList);
    this._container.addChild(this._optionList);
    this._container.addChild(this._noteInput);
    this._pane.setContent(this._container);
    this.addChild(this._pane);

    this._clickThreshold = 10 * r;
};

App.AddTransactionScreen.prototype = Object.create(App.Screen.prototype);
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
        separatorWidth = w - padding * 2;

    this._transactionInpup.x = padding;
    this._transactionInpup.y = padding;

    this._toggleButtonList.y = inputHeight;

    this._optionList.y = this._toggleButtonList.y + toggleHeight;

    this._notePosition = this._optionList.y + this._optionList.boundingBox.height;

    this._noteInput.x = padding;
    this._noteInput.y = this._notePosition + padding;

    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w,this._notePosition+inputHeight],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[
        padding,inputHeight-1,separatorWidth,1,
        toggleWidth-1,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2-1,inputHeight+padding,1,toggleHeight-padding*2,
        padding,inputHeight+toggleHeight-1,separatorWidth,1
    ],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[
        padding,inputHeight,separatorWidth,1,
        toggleWidth,inputHeight+padding,1,toggleHeight-padding*2,
        toggleWidth*2,inputHeight+padding,1,toggleHeight-padding*2,
        padding,this._notePosition,separatorWidth,1
    ],false,true);
};

/**
 * Enable
 */
App.AddTransactionScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._transactionInpup.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.AddTransactionScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._transactionInpup.disable();
    this._noteInput.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.AddTransactionScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.Screen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._noteInput.addEventListener(EventType.BLUR,this,this._onNoteBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.AddTransactionScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.Screen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onNoteBlur);
};

/**
 * Click handler
 * @private
 */
App.AddTransactionScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var pointerData = this.stage.getTouchData(),
        y = pointerData.getLocalPosition(this._container).y;

    if (y >= this._toggleButtonList.y && y < this._toggleButtonList.y + this._toggleButtonList.boundingBox.height)
    {
        this._toggleButtonList.getItemUnderPoint(pointerData).toggle();
    }
    else if (y >= this._optionList.y && y < this._optionList.y + this._optionList.boundingBox.height)
    {
        //console.log(this._optionList.getItemUnderPoint(pointerData));
    }
    else if (y >= this._noteInput.y && y < this._noteInput.y + this._noteInput.boundingBox.height)
    {
        this._focusNote();
    }
};

/**
 * On tick
 * @private
 */
App.AddTransactionScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._scrollTween.isRunning()) this._onScrollTweenUpdate();
};

/**
 * On scroll tween update
 * @private
 */
App.AddTransactionScreen.prototype._onScrollTweenUpdate = function _onScrollTweenUpdate()
{
    //TODO the scroll position can be wrong if the container si scrolled ...
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWING)
    {
        this._pane.y = -Math.round((this._notePosition + this._container.y) * this._scrollTween.progress);
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._pane.y = -Math.round((this._notePosition + this._container.y) * (1 - this._scrollTween.progress));
    }
};

/**
 * On scroll tween complete
 * @private
 */
App.AddTransactionScreen.prototype._onScrollTweenComplete = function _onScrollTweenComplete()
{
    var TransitionState = App.TransitionState;

    this._onScrollTweenUpdate();

    if (this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.SHOWN;

        this._noteInput.enable();
        this._noteInput.focus();
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.HIDDEN;

        this._pane.enable();
    }
};

/**
 * Focus budget
 * @private
 */
App.AddTransactionScreen.prototype._focusNote = function _focusNote()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.HIDDEN || this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.SHOWING;

        this._pane.disable();

        this._scrollTween.start();
    }
};

/**
 * On budget field blur
 * @private
 */
App.AddTransactionScreen.prototype._onNoteBlur = function _onNoteBlur()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWN || this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.HIDING;

        this._noteInput.disable();

        this._scrollTween.restart();
    }
};

/**
 * @class SelectTimeScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.SelectTimeScreen = function SelectTimeScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var r = layout.pixelRatio,
        w = layout.width,
        ScrollPolicy = App.ScrollPolicy;

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._inputBackground = new PIXI.Graphics();//TODO do I need BG? I can use BG below whole screen ...
    this._inputOverlay = new PIXI.Graphics();
    this._input = new App.TimeInput("00:00",30,w - Math.round(20 * r),Math.round(40 * r),r);
    this._header = new App.ListHeader("Select Date",w,r);
    this._calendar = new App.Calendar(new Date(),w,r);
    this._inputFocused = false;
    //TODO enable 'swiping' for interactively changing calendar's months
    this._render();

    this._container.addChild(this._inputBackground);
    this._container.addChild(this._header);
    this._container.addChild(this._calendar);
    this._container.addChild(this._input);

    this._pane.setContent(this._container);

    this.addChild(this._pane);
};

App.SelectTimeScreen.prototype = Object.create(App.Screen.prototype);
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

    GraphicUtils.drawRect(this._inputOverlay,0x000000,0.2,0,0,w,this._calendar.y+this._calendar.boundingBox.height);
};

/**
 * Enable
 */
App.SelectTimeScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
    this._pane.enable();
};

/**
 * Disable
 */
App.SelectTimeScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
    this._pane.disable();
};

/**
 * Register event listeners
 * @private
 */
App.SelectTimeScreen.prototype._registerEventListeners = function _registerEventListener()
{
    App.Screen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;
    this._input.addEventListener(EventType.FOCUS,this,this._onInputFocus);
    this._input.addEventListener(EventType.BLUR,this,this._onInputBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.SelectTimeScreen.prototype._unRegisterEventListeners = function _unRegisterEventListener()
{
    var EventType = App.EventType;
    this._input.removeEventListener(EventType.FOCUS,this,this._onInputFocus);
    this._input.removeEventListener(EventType.BLUR,this,this._onInputBlur);

    App.Screen.prototype._unRegisterEventListeners.call(this);
};

/**
 * On input focus
 * @private
 */
App.SelectTimeScreen.prototype._onInputFocus = function _onInputFocus()
{
    this._inputFocused = true;

    if (!this._container.contains(this._inputOverlay)) this._container.addChildAt(this._inputOverlay,this._container.getChildIndex(this._input));
};

/**
 * On input blur
 * @private
 */
App.SelectTimeScreen.prototype._onInputBlur = function _onInputBlur()
{
    if (this._container.contains(this._inputOverlay)) this._container.removeChild(this._inputOverlay);

    this._inputFocused = false;
};

/**
 * Click handler
 * @private
 */
App.SelectTimeScreen.prototype._onClick = function _onClick()
{
    if (this._inputFocused) this._input.blur();

    this._calendar.onClick();
};

/**
 * @class AccountButton
 * @extends Graphics
 * @param {Account} model
 * @param {Object} layout
 * @constructor
 */
App.AccountButton = function AccountButton(model,layout,index)
{
    PIXI.Graphics.call(this);

    this._model = model;
    this._layout = layout;

    var FontStyle = App.FontStyle,
        pixelRatio = this._layout.pixelRatio,
        height = Math.round(70 * pixelRatio);

    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,height);

    //TODO move texts and their settings objects into pools?
    this._nameLabel = new PIXI.Text(this._model.name+" "+index,FontStyle.get(24,FontStyle.BLUE));
    this._nameLabel.x = Math.round(15 * pixelRatio);
    this._nameLabel.y = Math.round(15 * pixelRatio);

    this._detailsLabel = new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",{font:Math.round(12 * pixelRatio)+"px Arial",fill:"#999999"});
    this._detailsLabel.x = Math.round(15 * pixelRatio);
    this._detailsLabel.y = Math.round(45 * pixelRatio);

    //this._icon =

    this.addChild(this._nameLabel);
    this.addChild(this._detailsLabel);

    this.interactive = true;

    this._render();
};

App.AccountButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method _resize
 * @param {number} width
 */
App.AccountButton.prototype.resize = function resize(width)
{
    this.boundingBox.width = width;

    this._render();
};

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        padding = Math.round(10 * this._layout.pixelRatio);

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,this.boundingBox.width,this.boundingBox.height],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,this.boundingBox.width-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,this.boundingBox.height-1,this.boundingBox.width-padding*2,1],false,true);
};

/**
 * Destroy
 */
App.AccountButton.prototype.destroy = function destroy()
{
    this.clear();

    this.interactive = false;

    this._layout = null;
    this._model = null;

    this.boundingBox = null;

    this.removeChild(this._nameLabel);
    this._nameLabel = null;

    this.removeChild(this._detailsLabel);
    this._detailsLabel = null;
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

    var i = 0, l = this._model.length(), AccountButton = App.AccountButton, button = null;

    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,layout.height);

    for (;i<30;i++)
    {
        button = new AccountButton(this._model.getItemAt(0),this._layout,i);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._pane = new App.TilePane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio,false);
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
    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.CATEGORY);
};

/**
 * Destroy
 */
App.AccountScreen.prototype.destroy = function destroy()
{
    App.Screen.prototype.destroy.call(this);

    this.disable();

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    /*var i = 0, l = this._buttons.length, button = null;
    for (;i<l;)
    {
        button = this._buttons[i++];
        if (this._buttonList.contains(button)) this._buttonList.removeChild(button);
        button.destroy();
    }
    this._buttonList.destroy();
    this._buttonList = null;*/

    this._buttons.length = 0;
    this._buttons = null;
};

/**
 * @class SubCategoryButton
 * @param {string} label
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.SubCategoryButton = function SubCategoryButton(label,width,pixelRatio)
{
    App.SwipeButton.call(this,width,Math.round(80*pixelRatio));

    var FontStyle = App.FontStyle;

    this.boundingBox = new App.Rectangle(0,0,width,Math.round(40*pixelRatio));

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._swipeSurface = new PIXI.Graphics();
    this._labelField = new PIXI.Text(label,FontStyle.get(14,FontStyle.BLUE));
    this._background = new PIXI.Graphics();
    this._deleteLabel = new PIXI.Text("Delete",FontStyle.get(14,FontStyle.WHITE));

    this._render();

    this.addChild(this._background);
    this.addChild(this._deleteLabel);
    this._swipeSurface.addChild(this._labelField);
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
    var ColorTheme = App.ColorTheme,
        GraphicUtils = App.GraphicUtils,
        r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        padding = Math.round(10 * r);

    GraphicUtils.drawRect(this._background,ColorTheme.RED,1,0,0,w,h);

    this._deleteLabel.x = Math.round(w - 50 * r);
    this._deleteLabel.y = Math.round((h - this._deleteLabel.height) / 2);

    GraphicUtils.drawRects(this._swipeSurface,ColorTheme.GREY,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this._swipeSurface,ColorTheme.GREY_LIGHT,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this._swipeSurface,ColorTheme.GREY_DARK,1,[padding,h-1,w-padding*2,1],false,true);

    this._labelField.x = Math.round(20 * r);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);
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
 * @param {Category} category
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.SubCategoryList = function SubCategoryList(category,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var subs = ["Cinema","Theatre","Gallery"],
        SubCategoryButton = App.SubCategoryButton,
        i = 0,
        l = subs.length;

    this.boundingBox = new App.Rectangle(0,0,width,0);

    this._category = category;
    this._width = width;
    this._pixelRatio = pixelRatio;
    this._header = new App.ListHeader("Sub-Categories",width,pixelRatio);
    this._interactiveButton = null;
    this._subButtons = new Array(l);
    this._addNewButton = new App.AddNewButton(
        "ADD SUB-CATEGORY",
        App.FontStyle.get(14,App.FontStyle.SHADE_DARK),
        width,
        Math.round(40 * pixelRatio),
        pixelRatio
    );

    for (;i<l;i++) this._subButtons[i] = new SubCategoryButton(subs[i],width,pixelRatio);

    this._render();

    this.addChild(this._header);
    for (i=0;i<l;) this.addChild(this._subButtons[i++]);
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
    var lastButton = this._subButtons[this._subButtons.length-1];

    App.LayoutUtils.update(this._subButtons,App.Direction.Y,this._header.height);

    this._addNewButton.y = lastButton.y + lastButton.boundingBox.height;

    this.boundingBox.height = this._addNewButton.y + this._addNewButton.boundingBox.height;
};

/**
 * Called when swipe starts
 * @param {string} direction
 * @private
 */
App.SubCategoryList.prototype.swipeStart = function swipeStart(direction)
{
    this._interactiveButton = this._getButtonUnderPosition(this.stage.getTouchData().getLocalPosition(this).y);
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
        l = this._subButtons.length,
        button = null;

    for (;i<l;)
    {
        button = this._subButtons[i++];
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Find button under position passed in
 * @param {number} position
 * @private
 */
App.SubCategoryList.prototype._getButtonUnderPosition = function _getButtonUnderPosition(position)
{
    var i = 0,
        l = this._subButtons.length,
        height = 0,
        buttonY = 0,
        button = null;

    for (;i<l;)
    {
        button = this._subButtons[i++];
        buttonY = button.y;
        height = button.boundingBox.height;
        if (buttonY <= position && buttonY + height >= position)
        {
            return button;
        }
    }

    return null;
};

/**
 * @class CategoryButtonSurface
 * @extends Graphics
 * @param {string} iconName
 * @param {string} label
 * @param {{font:string,fill:string}} labelStyle
 * @constructor
 */
App.CategoryButtonSurface = function CategoryButtonSurface(iconName,label,labelStyle)
{
    PIXI.Graphics.call(this);

    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._nameLabel = new PIXI.Text(label,labelStyle);

    this.addChild(this._colorStripe);
    this.addChild(this._icon);
    this.addChild(this._nameLabel);
};

App.CategoryButtonSurface.prototype = Object.create(PIXI.Graphics.prototype);
App.CategoryButtonSurface.prototype.constructor = App.CategoryButtonSurface;

/**
 * Render
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 */
App.CategoryButtonSurface.prototype.render = function render(width,height,pixelRatio)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        padding = Math.round(10 * pixelRatio);

    GraphicUtils.drawRects(this,ColorTheme.GREY,1,[0,0,width,height],true,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_LIGHT,1,[padding,0,width-padding*2,1],false,false);
    GraphicUtils.drawRects(this,ColorTheme.GREY_DARK,1,[padding,height-1,width-padding*2,1],false,true);

    GraphicUtils.drawRect(this._colorStripe,0xffcc00,1,0,0,Math.round(4 * pixelRatio),height);

    this._icon.width = Math.round(20 * pixelRatio);
    this._icon.height = Math.round(20 * pixelRatio);
    this._icon.x = Math.round(25 * pixelRatio);
    this._icon.y = Math.round((height - this._icon.height) / 2);
    this._icon.tint = ColorTheme.BLUE;

    this._nameLabel.x = Math.round(64 * pixelRatio);
    this._nameLabel.y = Math.round(18 * pixelRatio);
};

/**
 * @class CategoryButtonEdit
 * @extends SwipeButton
 * @param {Category} model
 * @param {Object} layout
 * @param {{font:string,fill:string}} nameLabelStyle
 * @param {{font:string,fill:string}} editLabelStyle
 * @constructor
 */
App.CategoryButtonEdit = function CategoryButtonEdit(model,layout,nameLabelStyle,editLabelStyle)
{
    App.SwipeButton.call(this,layout.width,Math.round(80*layout.pixelRatio));

    this.boundingBox = new App.Rectangle(0,0,layout.width,Math.round(50*layout.pixelRatio));

    this._model = model;
    this._layout = layout;
    this._swipeSurface = new App.CategoryButtonSurface(model.icon,model.name,nameLabelStyle);
    this._background = new PIXI.Graphics();
    this._editLabel = new PIXI.Text("Edit",editLabelStyle);

    this._render();

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
    var pixelRatio = this._layout.pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    this._swipeSurface.render(w,h,pixelRatio);

    App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

    this._editLabel.x = Math.round(w - 50 * pixelRatio);
    this._editLabel.y = Math.round(18 * pixelRatio);
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
 * @param {Category} model
 * @param {Object} layout
 * @param {{font:string,fill:string}} nameLabelStyle
 * @constructor
 */
App.CategoryButtonExpand = function CategoryButtonExpand(model,layout,nameLabelStyle)
{
    App.ExpandButton.call(this,layout.width,Math.round(50 * layout.pixelRatio));

    this._model = model;
    this._layout = layout;
    this._surface = new App.CategoryButtonSurface(model.icon,model.name,nameLabelStyle);
    this._subCategoryList = new PIXI.Graphics();

    this._render();

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
    var w = this.boundingBox.width;

    this._surface.render(w,this.boundingBox.height,this._layout.pixelRatio);

    App.GraphicUtils.drawRect(this._subCategoryList,App.ColorTheme.GREY_LIGHT,1,0,0,w,300);
};

/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var CategoryButton = App.CategoryButtonExpand,
        ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        nameLabelStyle = FontStyle.get(18,FontStyle.BLUE),
        editLabelStyle = FontStyle.get(18,FontStyle.WHITE),
        i = 0,
        l = this._model.length(),
        button = null;

    this._interactiveButton = null;
    this._buttons = new Array(l);
    this._buttonList = new App.TileList(App.Direction.Y,layout.height);

    for (;i<l;i++)
    {
//        button = new CategoryButton(this._model.getItemAt(i),layout,nameLabelStyle,editLabelStyle);
        button = new CategoryButton(this._model.getItemAt(i),layout,nameLabelStyle);
        this._buttons[i] = button;
        this._buttonList.add(button);
    }
    this._buttonList.updateLayout();

    this._buttonsInTransition = [];
    this._layoutDirty = false;

    this._pane = new App.TilePane(ScrollPolicy.OFF,ScrollPolicy.AUTO,layout.width,layout.height,layout.pixelRatio,false);
    this._pane.setContent(this._buttonList);

    this.addChild(this._pane);

//    this._swipeEnabled = true;
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

    //TODO also disable buttons
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
        l = this._buttons.length,
        button = null,
        EventType = App.EventType;

    for (;i<l;)
    {
        button = this._buttons[i++];
        //if (button !== this._interactiveButton) button.close(immediate);
        if (button !== this._interactiveButton && button.isOpen()) // For ~Expand button ...
        {
            if (this._buttonsInTransition.indexOf(button) === -1)
            {
                this._buttonsInTransition.push(button);

                button.addEventListener(EventType.LAYOUT_UPDATE,this,this._onButtonLayoutUpdate);
                button.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
            }

            button.close(immediate);
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
        EventType = App.EventType;

    this._interactiveButton = this._buttonList.getItemUnderPoint(data);

    if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
    {
        this._buttonsInTransition.push(this._interactiveButton);

        this._interactiveButton.addEventListener(EventType.LAYOUT_UPDATE,this,this._onButtonLayoutUpdate);
        this._interactiveButton.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
    }

    this._interactiveButton.onClick(data.getLocalPosition(this));
    this._pane.cancelScroll();

    //this._closeButtons();

    //App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ACCOUNT);
};

/**
 * On button layout update
 * @private
 */
App.CategoryScreen.prototype._onButtonLayoutUpdate = function _onButtonLayoutUpdate()
{
    this._layoutDirty = true;
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

    button.removeEventListener(EventType.LAYOUT_UPDATE,this,this._onButtonLayoutUpdate);
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
    this._label = new PIXI.Text(modelIndex,App.FontStyle.get(18,"#000000"));
    this._selected = false;

    this._render();

    this.addChild(this._label);
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

    this._label.setText(this._modelIndex);
    this._label.x = Math.round((w - this._label.width) / 2);
    this._label.y = Math.round((h - this._label.height) / 2);
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
 * @extends Screen
 * @param {Category} model
 * @param {Object} layout
 * @constructor
 */
App.EditCategoryScreen = function EditCategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        InfiniteList = App.InfiniteList,
        Direction = App.Direction,
        IconSample = App.IconSample,
        Input = App.Input,
        r = layout.pixelRatio,
        w = layout.width,
        icons = App.ModelLocator.getProxy(App.ModelName.ICONS),
        iconsHeight = Math.round(64 * r);

    this._pane = new App.Pane(ScrollPolicy.OFF,ScrollPolicy.AUTO,w,layout.height,r,false);
    this._container = new PIXI.DisplayObjectContainer();
    this._background = new PIXI.Graphics();
    this._colorStripe = new PIXI.Graphics();
    this._icon = PIXI.Sprite.fromFrame("currencies");
    this._input = new Input("Enter Category Name",20,w - Math.round(70 * r),Math.round(40 * r),r,true);
    this._separators = new PIXI.Graphics();
    this._colorList = new InfiniteList(this._getColorSamples(),App.ColorSample,Direction.X,w,Math.round(50 * r),r);
    this._topIconList = new InfiniteList(icons.slice(0,Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._bottomIconList = new InfiniteList(icons.slice(Math.floor(icons.length/2)),IconSample,Direction.X,w,iconsHeight,r);
    this._subCategoryList = new App.SubCategoryList(null,w,r);
    this._budgetHeader = new App.ListHeader("Budget",w,r);
    this._budget = new Input("Enter Budget",20,w - Math.round(20 * r),Math.round(40 * r),r,true);
    this._scrollTween = new App.TweenProxy(0.5,App.Easing.outExpo,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._scrollState = App.TransitionState.HIDDEN;

    //TODO add overlay for bluring inputs?
    //TODO add modal window to confirm deleting sub-category

    this._budget.restrict(/\D/);
    this._render();

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
    this._pane.setContent(this._container);
    this.addChild(this._pane);

    this._swipeEnabled = true;
};

App.EditCategoryScreen.prototype = Object.create(App.Screen.prototype);
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
        padding = Math.round(10 * r),
        separatorWidth = w - padding * 2;

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

    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_DARK,1,[0,0,separatorWidth,1,0,colorListHeight,separatorWidth,1],true,false);
    GraphicUtils.drawRects(this._separators,ColorTheme.GREY_LIGHT,1,[0,1,separatorWidth,1,0,colorListHeight+1,separatorWidth,1],false,true);
    this._separators.x = padding;
    this._separators.y = inputFragmentHeight - 1;

    this._subCategoryList.y = this._bottomIconList.y + this._bottomIconList.boundingBox.height;
    this._budgetHeader.y = this._subCategoryList.y + this._subCategoryList.boundingBox.height;
    this._budget.x = padding;
    this._budget.y = this._budgetHeader.y + this._budgetHeader.height + Math.round(10 * r);

    GraphicUtils.drawRect(this._background,ColorTheme.GREY,1,0,0,w,this._budget.y+this._budget.boundingBox.height+padding);
};

/**
 * Enable
 */
App.EditCategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
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
 * @private
 */
App.EditCategoryScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    App.Screen.prototype._registerEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.addEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.addEventListener(EventType.BLUR,this,this._onBudgetBlur);
};

/**
 * UnRegister event listeners
 * @private
 */
App.EditCategoryScreen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    App.Screen.prototype._unRegisterEventListeners.call(this);

    var EventType = App.EventType;

    this._scrollTween.removeEventListener(EventType.COMPLETE,this,this._onScrollTweenComplete);

    this._budget.removeEventListener(EventType.BLUR,this,this._onBudgetBlur);
};

/**
 * Click handler
 * @private
 */
App.EditCategoryScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var position = this.stage.getTouchData().getLocalPosition(this._container),
        y = position.y,
        list = null;

    if (y >= this._colorList.y && y < this._colorList.y + this._colorList.boundingBox.height)
    {
        list = this._colorList;
        list.selectItemByPosition(position.x);
    }
    else if (y >= this._topIconList.y && y < this._topIconList.y + this._topIconList.boundingBox.height)
    {
        list = this._topIconList;
        list.selectItemByPosition(position.x);
        this._bottomIconList.selectItemByPosition(-1000);
    }
    else if (y >= this._bottomIconList.y && y < this._bottomIconList.y + this._bottomIconList.boundingBox.height)
    {
        list = this._bottomIconList;
        list.selectItemByPosition(position.x);
        this._topIconList.selectItemByPosition(-1000);
    }
    else if (y >= this._budget.y && y < this._budget.y + this._budget.boundingBox.height)
    {
        this._focusBudget();
    }
};

/**
 * On tick
 * @private
 */
App.EditCategoryScreen.prototype._onTick = function _onTick()
{
    App.Screen.prototype._onTick.call(this);

    if (this._scrollTween.isRunning()) this._onScrollTweenUpdate();
};

/**
 * On scroll tween update
 * @private
 */
App.EditCategoryScreen.prototype._onScrollTweenUpdate = function _onScrollTweenUpdate()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWING)
    {
        this._pane.y = -Math.round((this._budgetHeader.y + this._container.y) * this._scrollTween.progress);
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._pane.y = -Math.round((this._budgetHeader.y + this._container.y) * (1 - this._scrollTween.progress));
    }
};

/**
 * On scroll tween complete
 * @private
 */
App.EditCategoryScreen.prototype._onScrollTweenComplete = function _onScrollTweenComplete()
{
    var TransitionState = App.TransitionState;

    this._onScrollTweenUpdate();

    if (this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.SHOWN;

        this._subCategoryList.closeButtons(true);

        this._budget.enable();
        this._budget.focus();
    }
    else if (this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.HIDDEN;

        this._pane.enable();
    }
};

/**
 * Focus budget
 * @private
 */
App.EditCategoryScreen.prototype._focusBudget = function _focusBudget()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.HIDDEN || this._scrollState === TransitionState.HIDING)
    {
        this._scrollState = TransitionState.SHOWING;

        this._pane.disable();

        this._scrollTween.start();
    }
};

/**
 * On budget field blur
 * @private
 */
App.EditCategoryScreen.prototype._onBudgetBlur = function _onBudgetBlur()
{
    var TransitionState = App.TransitionState;
    if (this._scrollState === TransitionState.SHOWN || this._scrollState === TransitionState.SHOWING)
    {
        this._scrollState = TransitionState.HIDING;

        this._budget.disable();

        this._scrollTween.restart();
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
 * @param {Object} model
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
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.TransactionScreen = function TransactionScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width,
        h = layout.height,
        buttonOptions = {
            labelStyles:{
                edit:FontStyle.get(18,FontStyle.WHITE),
                account:FontStyle.get(14,FontStyle.BLUE_LIGHT),
                amount:FontStyle.get(26,FontStyle.BLUE_DARK),
                date:FontStyle.get(14,FontStyle.SHADE_DARK),
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
    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchPosition());
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
    App.ExpandButton.call(this,width,height);

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
    App.ExpandButton.call(this,width,height);

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
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.ReportScreen = function ReportScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var ReportAccountButton = App.ReportAccountButton,
        ScrollPolicy = App.ScrollPolicy,
        FontStyle = App.FontStyle,
        h = layout.height,
        r = layout.pixelRatio,
        chartSize = Math.round(h * 0.3 - 20 * r),
        listWidth = Math.round(layout.width - 20 * r),// 10pts padding on both sides
        listHeight = Math.round(h * 0.7),
        itemHeight = Math.round(40 * r),
        labelStyles = {
            accountName:FontStyle.get(22,FontStyle.WHITE),
            accountAmount:FontStyle.get(16,FontStyle.WHITE),
            categoryName:FontStyle.get(18,FontStyle.BLUE),
            categoryPercent:FontStyle.get(16,FontStyle.SHADE_DARK),
            categoryPrice:FontStyle.get(16,FontStyle.BLUE),
            subName:FontStyle.get(14,FontStyle.BLUE),
            subPercent:FontStyle.get(14,FontStyle.SHADE_DARK),
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
    this._pane.y = Math.round(this._layout.height * 0.3);
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
        categories = ModelLocator.getProxy(ModelName.ACCOUNTS).getItemAt(0).getCategories();

    this._renderer = renderer;
    this._stage = stage;

    this._layout = {
        originalWidth:width,
        originalHeight:height,
        width:Math.round(width * pixelRatio),
        height:Math.round(height * pixelRatio),
        headerHeight:Math.round(50 * pixelRatio),
        bodyHeight:Math.round((height - 50) - pixelRatio),
        pixelRatio:pixelRatio
    };

    this._background = new PIXI.Graphics();
    App.GraphicUtils.drawRect(this._background,0xbada55,1,0,0,this._layout.width,this._layout.height);

    //TODO use ScreenFactory for the screens?
    //TODO deffer initiation and/or rendering of most of the screens?
    this._screenStack = new App.ViewStack([
        new App.AccountScreen(categories,this._layout),
        new App.CategoryScreen(categories,this._layout),
        new App.SelectTimeScreen(null,this._layout),
        new App.EditCategoryScreen(null,this._layout),
        new App.TransactionScreen(null,this._layout),
        new App.ReportScreen(null,this._layout),
        new App.AddTransactionScreen(null,this._layout)
    ]);
    this._screenStack.selectChildByIndex(App.ScreenName.ADD_TRANSACTION);//TODO move this into separate command?
    this._screenStack.show();

    this.addChild(this._background);
    this.addChild(this._screenStack);

    this._registerEventListeners();
};

App.ApplicationView.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ApplicationView.prototype.constructor = App.ApplicationView;

/**
 * Register event listeners
 *
 * @method _registerEventListeners
 * @private
 */
App.ApplicationView.prototype._registerEventListeners = function _registerEventListeners()
{
    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * Change screen by the name passed in
 * @param {number} screenName
 */
App.ApplicationView.prototype.changeScreen = function changeScreen(screenName)
{
    this._screenStack.selectChildByIndex(screenName);
    this._screenStack.show();
    this._screenStack.hide();
};

/**
 * On Ticker's  Tick event
 *
 * @method _onTick
 * @private
 */
App.ApplicationView.prototype._onTick = function _onTick()
{
    //TODO do not render if nothing happens (prop 'dirty'?)
    this._renderer.render(this._stage);
};

App.ApplicationView.prototype._onResize = function _onResize()
{

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
     * @param {Array.<{eventType:string,command:Function}>} eventMap
     */
    init:function init(eventListenerPool,eventMap)
    {
        this._eventListenerPool = eventListenerPool;

        var i = 0, l = eventMap.length, obj = null;
        for (;i<l;)
        {
            obj = eventMap[i++];
            this._eventCommandMap[obj.eventType] = {constructor:obj.command};
        }
        obj = null;
        eventMap = null;

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
    request.open('GET','./data/accounts.json',true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400)
        {
            this.dispatchEvent(App.EventType.COMPLETE,{accounts:request.responseText,icons:this._icons});
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
    this._initCommands();
    this._initView();

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {{accounts:string,icons:Object}} data
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Collection = App.Collection;

    //TODO initiate all proxies in once 'init' method? Same as Controller ...
    ModelLocator.addProxy(ModelName.EVENT_LISTENER_POOL,this._eventListenerPool);
    ModelLocator.addProxy(ModelName.TICKER,new App.Ticker(this._eventListenerPool));
    ModelLocator.addProxy(ModelName.ICONS,Object.keys(data.icons).filter(function(element) {return element.indexOf("-app") === -1}));
    ModelLocator.addProxy(ModelName.ACCOUNTS,new Collection(
        JSON.parse(data.accounts).accounts,//TODO parse JSON on data from localStorage
        App.Account,
        null,
        this._eventListenerPool
    ));
    /*ModelLocator.addProxy(ModelName.TRANSACTIONS,new Collection(
        localStorage.getItem(ModelName.TRANSACTIONS),
        App.Transaction,
        null,
        this._eventListenerPool
    ));
    ModelLocator.addProxy(ModelName.FILTERS,new Collection(
        localStorage.getItem(ModelName.FILTERS),
        App.Filter,
        null,
        this._eventListenerPool
    ));*/

    App.Settings.setStartOfWeek(1);
};

/**
 * Initialize commands
 *
 * @method _initCommands
 * @private
 */
App.Initialize.prototype._initCommands = function _initCommands()
{
    App.Controller.init(this._eventListenerPool,[
        {eventType:App.EventType.CHANGE_SCREEN,command:App.ChangeScreen}
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
    //TODO initialize textures, icons, patterns?

    var canvas = document.getElementsByTagName("canvas")[0],
        context = canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1,
        pixelRatio = dpr / bsr,
        w = window.innerWidth,
        h = window.innerHeight,
        stage = new PIXI.Stage(0xffffff),
        renderer = new PIXI.CanvasRenderer(w,h,{
            view:canvas,
            resolution:1,
            transparent:false,
            autoResize:false,
            clearBeforeRender:false
        });

    if (pixelRatio > 1)
    {
        if (pixelRatio > 2) pixelRatio = 2;

        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        context.scale(pixelRatio,pixelRatio);

        stage.interactionManager.setPixelRatio(pixelRatio);
    }

    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.tintWithOverlay;

    //context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
    context.lineCap = "square";

    App.FontStyle.init(pixelRatio);

    App.ViewLocator.addViewSegment(
        App.ViewName.APPLICATION_VIEW,
        stage.addChild(new App.ApplicationView(stage,renderer,w,h,pixelRatio))
    );

    renderer.render(stage);
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
 * @param {ObjectPool} pool
 * @constructor
 */
App.ChangeScreen = function ChangeScreen(pool)
{
    App.Command.call(this,false,pool);
};

App.ChangeScreen.prototype = Object.create(App.Command.prototype);
App.ChangeScreen.prototype.constructor = App.ChangeScreen;

/**
 * Execute the command
 *
 * @method execute
 */
App.ChangeScreen.prototype.execute = function execute(screenName)
{
    App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).changeScreen(screenName);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.ChangeScreen.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);
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
