/** @type {{_daysInMonth:Array.<number>,_dayLabels:Array.<string>,getMonth:Function,getDaysInMonth:Function}} */
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
