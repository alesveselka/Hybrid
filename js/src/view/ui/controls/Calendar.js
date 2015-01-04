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
        month = DateUtils.getMonth(date,1),//TODO remove hard-coded value
        dayLabels = DateUtils.getDayLabels(1),//TODO remove hard-coded value
        currentDay = date.getDate(),
        daysInWeek = dayLabels.length,
        weeksInMonth = month.length,
        i = 0;

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    this.boundingBox.width = this._width;
    this.boundingBox.height = Math.round(321 * pixelRatio);

    this._width = width;
    this._pixelRatio = pixelRatio;
    this._enabled = false;
    this._weekRowPosition = Math.round(81 * pixelRatio);

    this._monthField = new PIXI.Text("January 2015",{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});
    this._prevButton = PIXI.Sprite.fromFrame("arrow");
    this._nextButton = PIXI.Sprite.fromFrame("arrow");
    this._dayLabelFields = new Array(daysInWeek);
    this._weekRows = new Array(weeksInMonth);
    this._separatorContainer = new PIXI.Graphics();

    for (;i<daysInWeek;i++) this._dayLabelFields[i] = new Text(dayLabels[i],dayLabelStyle);

    for (i = 0;i<weeksInMonth;i++) this._weekRows[i] = new CalendarWeekRow(month[i],currentDay,width,pixelRatio);

    this._render();

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
    var r = this._pixelRatio,
        roundedRatio = Math.round(r),
        w = this._width,
        h = this.boundingBox.height,
        arrowResizeRatio = Math.round(12 * r) / this._prevButton.height,
        separatorPadding = Math.round(15 * r),
        separatorWidth = w - separatorPadding * 2,
        dayLabel = null,
        daysInWeek = this._dayLabelFields.length,
        dayLabelWidth = Math.round(w / daysInWeek),
        dayLabelOffset = Math.round(40 * r),
        weekRow = this._weekRows[0],
        weekRowHeight = weekRow.boundingBox.height,
        l = this._dayLabelFields.length,
        i = 0;

    this.clear();
    this.beginFill(0xefefef);
    this.drawRect(0,0,w,h);
    this.beginFill(0xcccccc);
    this.drawRect(0,Math.round(80 * r),w,roundedRatio);
    this.drawRect(separatorPadding,dayLabelOffset,separatorWidth,roundedRatio);
    this.beginFill(0xffffff);
    this.drawRect(separatorPadding,dayLabelOffset+roundedRatio,separatorWidth,roundedRatio);
    this.endFill();

    this._monthField.x = Math.round((w - this._monthField.width) / 2);
    this._monthField.y = Math.round((dayLabelOffset - this._monthField.height) / 2);

    //TODO also implement double-arrows for navigating years directly? See TOS
    this._prevButton.scale.x = arrowResizeRatio;
    this._prevButton.scale.y = arrowResizeRatio;
    this._prevButton.x = Math.round(20 * r + this._prevButton.width);
    this._prevButton.y = Math.round((dayLabelOffset - this._prevButton.height) / 2 + this._prevButton.height);
    this._prevButton.rotation = Math.PI;
    this._prevButton.tint = 0x394264;// TODO pass color from global setting?

    this._nextButton.scale.x = arrowResizeRatio;
    this._nextButton.scale.y = arrowResizeRatio;
    this._nextButton.x = Math.round(w - 20 * r - this._nextButton.width);
    this._nextButton.y = Math.round((dayLabelOffset - this._prevButton.height) / 2);
    this._nextButton.tint = 0x394264;// TODO pass color from global setting?

    for (;i<l;i++)
    {
        dayLabel = this._dayLabelFields[i];
        dayLabel.x = Math.round((i * dayLabelWidth) + (dayLabelWidth - dayLabel.width) / 2);
        dayLabel.y = Math.round(dayLabelOffset + r + (dayLabelOffset - dayLabel.height) / 2);
    }

    i = 0;
    l = this._weekRows.length;

    this._separatorContainer.clear();
    this._separatorContainer.beginFill(0xefefef,1.0);

    for (;i<l;i++)
    {
        weekRow = this._weekRows[i];
        weekRow.y = this._weekRowPosition + i * weekRowHeight;

        this._separatorContainer.drawRect(0,weekRow.y + weekRowHeight,w,roundedRatio);
    }

    this._separatorContainer.endFill();
};

/**
 * Enable
 */
App.Calendar.prototype.enable = function enable()
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
App.Calendar.prototype.disable = function disable()
{
    this._unRegisterEventListeners();

    this.interactive = false;

    this._enabled = false;
};

/**
 * Register event listeners
 * @private
 */
App.Calendar.prototype._registerEventListeners = function _registerEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED) this.tap = this._onClick;
    else this.click = this._onClick;
};

/**
 * UnRegister event listeners
 * @private
 */
App.Calendar.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED) this.tap = null;
    else this.click = null;
};

/**
 * On click
 * @param {InteractionData} data
 * @private
 */
App.Calendar.prototype._onClick = function _onClick(data)
{
    var position = data.getLocalPosition(this);

    if (position.y >= this._weekRowPosition) this._selectDay(position);
};

/**
 * Return week row under point passed in
 * @param {Point} position
 * @private
 */
App.Calendar.prototype._selectDay = function _selectDay(position)
{
    var i = 0,
        l = this._weekRows.length,
        y = position.y,
        weekRowHeight = this._weekRows[0].boundingBox.height,
        weekRow = null;

    for (;i<l;i++)
    {
        weekRow = this._weekRows[i];
        weekRow.updateSelection(weekRow.y <= y && weekRow.y + weekRowHeight > y,position.x);
    }
};
