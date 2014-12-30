App.CalendarWeekRow = function CalendarWeekRow(date,week,firstDay)
{
    PIXI.Graphics.call(this);

    var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31],
        firstDayInWeek = firstDay,
        days = new Array(7);

    if (firstDay > 1)
    {
        var previousMonthDays = date.getMonth() ? daysInMonth[date.getMonth()-1] : daysInMonth[daysInMonth.length-1];

        firstDayInWeek = (previousMonthDays - firstDay + 2);//TODO hard-code '8'?
    }

    if (firstDayInWeek > daysInMonth[date.getMonth()-1]) firstDayInWeek -= daysInMonth[date.getMonth()-1];

    firstDayInWeek += week * 7;

    if (week > 0 && firstDayInWeek > daysInMonth[date.getMonth()-1]) firstDayInWeek = week * 7 - firstDay + 2;//TODO hard-code '8'?

    console.log("firstDayInWeek ",firstDayInWeek);

    for (var i = 0;i<7;i++)
    {
        if (firstDayInWeek > daysInMonth[date.getMonth()-1] && week === 0)
        {
            console.log("first week exceeded");
            firstDayInWeek = week * 7 + 1;
        }
        if (firstDayInWeek > daysInMonth[date.getMonth()] && week > 0)
        {
            console.log("last week exceeded");
            firstDayInWeek = 1;
        }

        days[i] = firstDayInWeek++;
    }

    //console.log("#of days: ",daysInMonth[date.getMonth()],", first day: ",firstDay);
    console.log("Week ",week,": ",days[0],days[1],days[2],days[3],days[4],days[5],days[6]);
};

App.CalendarWeekRow.prototype = Object.create(PIXI.Graphics.prototype);
App.CalendarWeekRow.prototype.constructor = App.CalendarWeekRow;
