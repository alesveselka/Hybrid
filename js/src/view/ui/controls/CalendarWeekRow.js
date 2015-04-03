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

    var daysInWeek = 7,
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
