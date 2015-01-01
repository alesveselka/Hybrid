App.CalendarWeekRow = function CalendarWeekRow(week,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var textStyle = {font:Math.round(14 * pixelRatio)+"px HelveticaNeueCond",fill:"#cccccc"},
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
    this._dateFields = new Array(7);

    for (;i<daysInWeek;i++,index+=2) this._dateFields[i] = new Text(week[index],textStyle);

    this._render();

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

    if (otherBGStart > -1)
    {
        this.drawRect(
            otherBGStart ? otherBGStart * cellWidth : 0,
            0,
            otherBGEnd === -1 ? this._width : otherBGEnd * cellWidth,
            cellHeight);
    }

    this.endFill();
};
