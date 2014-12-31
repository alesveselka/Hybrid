/** @type {{daysInMonth:Array.<number>,getMonth:Function,getDaysInMonth:Function}} */
App.DateUtils = {
    daysInMonth:[31,28,31,30,31,30,31,31,30,31,30,31],

    /**
     * Calculate and generate all days in a month, based on starting day of a week passed in
     * Returns 2-dimensional array, where rows are weeks, and columns particular days in a week
     * @param {Date} date
     * @param {number} startOfWeek 0 = Sunday, 1 = Monday, ... , 6 = Saturday
     * @return {Array.<Array.<number>>}
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
            days = null;

        // Loop through 6 weeks
        for (var i = 0;i<6;i++)
        {
            // if first day of week is not start of a week, calculate the previous days in week from previous month end
            if (i === 0 && firstDayOfMonth !== startOfWeek)
            {
                firstDateOfWeek = (daysInPreviousMonth - firstDayOfMonth + 1 + startOfWeek);
            }
            else
            {
                firstDateOfWeek = i * 7 - (firstDayOfMonth - 1 - startOfWeek);

                if (firstDateOfWeek > daysInCurrentMonth) firstDateOfWeek = firstDateOfWeek - daysInCurrentMonth;
            }

            days = new Array(7);

            // Loop through 7 days of a week
            for (var j = 0;j<7;j++)
            {
                if (firstDateOfWeek > daysInPreviousMonth && i === 0) firstDateOfWeek = 1;
                else if (firstDateOfWeek > daysInCurrentMonth && i > 0) firstDateOfWeek = 1;

                days[j] = firstDateOfWeek++;
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
        return (month === 1 && year % 4 === 0) ? 29 : this.daysInMonth[month];
    }
};
