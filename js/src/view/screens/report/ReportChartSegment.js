/**
 * @class ReportChartSegment
 * @param {number} poolIndex
 * @constructor
 */
App.ReportChartSegment = function ReportChartSegment(poolIndex)
{
    PIXI.Graphics.call(this);

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;

    this.color = 0;
    this.fraction = 0.0;
    this.startAngle = 0.0;
    this.endAngle = 0.0;
    this.fullyRendered = false;
};

App.ReportChartSegment.prototype = Object.create(PIXI.Graphics.prototype);

/**
 * Set model
 * @param {App.Category} model
 * @param {number} totalBalance
 * @param {number} previousBalance
 */
App.ReportChartSegment.prototype.setModel = function setModel(model,totalBalance,previousBalance)
{
    this._model = model;

    this.color = this._model.color;
    this.fraction = (this._model.balance / totalBalance) ;
    this.startAngle = Math.abs(previousBalance / totalBalance) * 360;
    this.endAngle = this.startAngle + this.fraction * 360;
    this.fullyRendered = false;

    this.clear();
};

/**
 * Check if this segment renders model passed in
 * @param {App.Category} model
 * @returns {boolean}
 */
App.ReportChartSegment.prototype.rendersModel = function rendersModel(model)
{
    return this._model === model;
};
