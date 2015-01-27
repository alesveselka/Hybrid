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
App.ReportChartHighlight.prototype.constructor = App.ReportChartHighlight;

/**
 * Change
 * @param {number} start
 * @param {number} end
 * @param {number} color
 */
App.ReportChartHighlight.prototype.change = function change(start,end,color)
{
    this._oldStart = this._start;
    this._oldEnd = this._end;

    this._start = start;
    this._end = end;
    this._color = color;
};

/**
 * Update change by progress passed in
 * @param {number} progress
 */
App.ReportChartHighlight.prototype.update = function update(progress)
{
    var start = this._oldStart + (this._start - this._oldStart) * progress,
        end = this._oldEnd + (this._end - this._oldEnd) * progress;

    App.GraphicUtils.drawArc(this,this._center,this._width,this._height,this._thickness,start,end,20,0,0,0,this._color,1);
};
