App.Calendar = function Calendar(date,firstDay,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    //console.log(date.getHours(),date.getUTCHours(),date.toTimeString());

    var dayLabelStyle = {font:Math.round(12 * pixelRatio)+"px Arial",fill:"#999999"},//TODO use Arial bold
        CalendarWeekRow = App.CalendarWeekRow;

    this._monthField = new PIXI.Text(date,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});
    this._prevButton = PIXI.Sprite.fromFrame("arrow");
    this._nextButton = PIXI.Sprite.fromFrame("arrow");
    this._monLabel = new PIXI.Text("M",dayLabelStyle);
    this._tueLabel = new PIXI.Text("T",dayLabelStyle);
    this._wedLabel = new PIXI.Text("W",dayLabelStyle);
    this._thuLabel = new PIXI.Text("T",dayLabelStyle);
    this._friLabel = new PIXI.Text("F",dayLabelStyle);
    this._satLabel = new PIXI.Text("S",dayLabelStyle);
    this._sunLabel = new PIXI.Text("S",dayLabelStyle);

    this._weekRows = [
        new CalendarWeekRow(date,0,firstDay),
        new CalendarWeekRow(date,1,firstDay),
        new CalendarWeekRow(date,2,firstDay),
        new CalendarWeekRow(date,3,firstDay),
        new CalendarWeekRow(date,4,firstDay)
    ];
};

App.Calendar.prototype = Object.create(PIXI.Graphics.prototype);
App.Calendar.prototype.constructor = App.Calendar;
