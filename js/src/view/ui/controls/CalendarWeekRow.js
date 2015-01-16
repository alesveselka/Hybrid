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

    var fontStyle = Math.round(14 * pixelRatio)+"px HelveticaNeueCond",
        daysInWeek = week.length / 2,
        Text = PIXI.Text,
        index = 0,
        i = 0;

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    this.boundingBox.width = this._width;
    this.boundingBox.height = Math.round(40 * pixelRatio);

    this._week = week;
    this._width = width;
    this._pixelRatio = pixelRatio;

    this._textStyle = {font:fontStyle,fill:"#cccccc"};
    this._selectedStyle = {font:fontStyle,fill:"#ffffff"};
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
    var rounderRatio = Math.round(this._pixelRatio),
        daysInWeek = this._week.length / 2,
        cellWidth = Math.round(this._width / daysInWeek),
        cellHeight = this.boundingBox.height,
        textField = null,
        otherBGStart = -1,
        otherBGEnd = -1,
        index = 0,
        i = 0;

    this.clear();
    this.beginFill(0xffffff);
    this.drawRect(0,0,this._width,cellHeight);
    this.beginFill(0xefefef);

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
            if (i) this.drawRect(Math.round(i * cellWidth),0,rounderRatio,cellHeight);
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

    App.GraphicUtils.drawRect(this._highlightBackground,0x394264,1,0,0,cellWidth-rounderRatio,cellHeight);
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
