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
