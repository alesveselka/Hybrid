/**
 * @class ReportChartHighlight
 * @extends Graphics
 * @param {Point} center
 * @param {number} width
 * @param {number} height
 * @param {number} thickness
 * @constructor
 */
App.ReportChartHighlight = function ReportChartHighlight(center,width,height,thickness)
{
    PIXI.Graphics.call(this);

    this._width = width;
    this._height = height;
    this._center = center;
    this._thickness = thickness;
    this._oldStart = 0;
    this._oldEnd = 0;
    this._start = 0;
    this._end = 0;
    this._color = 0x000000;
};

App.ReportChartHighlight.prototype = Object.create(PIXI.Graphics.prototype);

/**
 * Change
 * @param {App.ReportChartSegment} segment
 */
App.ReportChartHighlight.prototype.change = function change(segment)
{
    this._oldStart = this._start;
    this._oldEnd = this._end;

    this._start = segment.startAngle;
    this._end = segment.endAngle;
    this._color = segment.color;
};

/**
 * Hide - Set hide properties
 */
App.ReportChartHighlight.prototype.hide = function hide()
{
    this._oldStart = this._start;
    this._oldEnd = this._end;

    this._start = 0.0;
    this._end = 0.0;
};

/**
 * Update change by progress passed in
 * @param {number} progress
 * @param {boolean} [hide=false]
 */
App.ReportChartHighlight.prototype.update = function update(progress,hide)
{
    var start = this._oldStart + (this._start - this._oldStart) * progress,
        end = this._oldEnd + (this._end - this._oldEnd) * progress,
        alpha = hide ? 1 - progress : 1;

    App.GraphicUtils.drawArc(this,this._center,this._width,this._height,this._thickness,start,end,30,0,0,0,"0x"+this._color,alpha);
};
