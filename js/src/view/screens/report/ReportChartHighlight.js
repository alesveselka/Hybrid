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
    this._oldSteps = 0;
    this._start = 0;
    this._end = 0;
    this._steps = 10;
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
    this._oldSteps = this._steps;

    if (segment)
    {
        this._start = segment.startAngle;
        this._end = segment.endAngle;
        this._steps = segment.steps;
        this._color = "0x"+segment.color;
    }
    else
    {
        this._start = 0.0;
        this._end = 0.0;
        this._steps = 10;
    }
};

/**
 * Update change by progress passed in
 * @param {number} progress
 */
App.ReportChartHighlight.prototype.update = function update(progress)
{
    var start = this._oldStart + (this._start - this._oldStart) * progress,
        end = this._oldEnd + (this._end - this._oldEnd) * progress,
        alpha = this._end === this._start ? 1 - progress : 1.0,
        steps = Math.round(this._oldSteps + (this._steps - this._oldSteps) * progress);

    App.GraphicUtils.drawArc(this,this._center,this._width,this._height,this._thickness,start,end,steps,0,0,0,this._color,alpha);
};
