App.CalendarWeekRow = function CalendarWeekRow(week)
{
    PIXI.Graphics.call(this);

    /*var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31],
        firstDayInWeek = 1,
        days = new Array(7),
        START_OF_WEEK = 3;

    if (date.getYear() % 4 === 0) daysInMonth[1] = 29;

    // if first day of week is not Monday, calculate the previous days in week from previous month end
    if (firstDay !== START_OF_WEEK && week === 0)
    {
        var previousMonthDays = date.getMonth() ? daysInMonth[date.getMonth()-1] : daysInMonth[daysInMonth.length-1];

        firstDayInWeek = (previousMonthDays - firstDay + 1 + START_OF_WEEK);
    }
    else
    {
        firstDayInWeek = week * 7 - (firstDay - 1 - START_OF_WEEK);

        if (firstDayInWeek > daysInMonth[date.getMonth()]) firstDayInWeek = firstDayInWeek - daysInMonth[date.getMonth()];
    }

    console.log("firstDayInWeek ",firstDayInWeek);

    for (var i = 0;i<7;i++)
    {
        if (firstDayInWeek > daysInMonth[date.getMonth()-1] && week === 0)
        {
//            console.log("first week exceeded");
            firstDayInWeek = 1;
        }
        if (firstDayInWeek > daysInMonth[date.getMonth()] && week > 0)
        {
//            console.log("last week exceeded");
            firstDayInWeek = 1;
        }

        days[i] = firstDayInWeek++;
    }*/

    //console.log("#of days: ",daysInMonth[date.getMonth()],", first day: ",firstDay);
    console.log(week[0],week[1],week[2],week[3],week[4],week[5],week[6]);
};

App.CalendarWeekRow.prototype = Object.create(PIXI.Graphics.prototype);
App.CalendarWeekRow.prototype.constructor = App.CalendarWeekRow;
