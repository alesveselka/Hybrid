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
        var firstDateOfWeek = 1,
            year = date.getYear(),
            currentMonth = date.getMonth(),
            previousMonth = currentMonth ? currentMonth - 1 : 11,
            daysInCurrentMonth = this.getDaysInMonth(year,currentMonth),
            daysInPreviousMonth = this.getDaysInMonth(year,previousMonth),
            firstDayOfMonth = new Date(1900+year,currentMonth,1).getDay(),
            weeks = new Array(6),
            days = null,
            otherMonth = 1;

        // Loop through 6 weeks
        for (var i = 0;i<6;i++)
        {
            otherMonth = i ? 0 : 1;

            // if first day of week is not start of a week, calculate the previous days in week from previous month end
            if (i === 0 && firstDayOfMonth !== startOfWeek)
            {
                firstDateOfWeek = (daysInPreviousMonth - firstDayOfMonth + 1 + startOfWeek);
            }
            else
            {
                firstDateOfWeek = i * 7 - (firstDayOfMonth - 1 - startOfWeek);

                if (firstDateOfWeek > daysInCurrentMonth)
                {
                    firstDateOfWeek = firstDateOfWeek - daysInCurrentMonth;
                    otherMonth = 1;
                }
            }

            if (firstDateOfWeek === 1 && i === 0) otherMonth = 0;

            days = new Array(7*2);

            // Loop through 7 days of a week
            for (var j = 0;j<7*2;j++)
            {
                if (firstDateOfWeek > daysInPreviousMonth && i === 0)
                {
                    firstDateOfWeek = 1;
                    otherMonth = 0;
                }

                if (firstDateOfWeek > daysInCurrentMonth && i > 0)
                {
                    firstDateOfWeek = 1;
                    otherMonth = 1;
                }

                days[j++] = firstDateOfWeek++;
                days[j] = otherMonth;
            }

            weeks[i] = days;
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
        return (month === 1 && year % 4 === 0) ? 29 : this._daysInMonth[month];
    }
};
