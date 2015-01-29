/**
 * @class ReportChart
 * @extends Graphics
 * @param {Collection} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ReportChart = function ReportChart(model,width,height,pixelRatio)
{
    //TODO if there is just 1 account segments should represent categories of that account; otherwise segment will represent accounts
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Graphics = PIXI.Graphics,
        colors = [0xff0000,0xc0ffee,0x0000ff],
        i = 0,
        l = 3,//TODO number of segments calculated from accounts
        segment = null;

    Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._tween = new App.TweenProxy(1,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._transitionState = App.TransitionState.HIDDEN;
    this._eventsRegistered = false;
    this._center = new PIXI.Point(Math.round(width/2),Math.round(height/2));
    this._thickness = Math.round(15 * pixelRatio);
    this._chartSize = width - Math.round(5 * pixelRatio * 2);// 5px margin on sides for highlight line
    this._segments = new Array(l);
    this._highlight = new App.ReportChartHighlight(this._center,width,height,Math.round(3 * pixelRatio));
    this._updateHighlight = false;
    this._highlightSegment = void 0;

    for (;i<l;i++)
    {
        segment = new Graphics();
        this._segments[i] = {graphics:segment,progress:0,color:colors[i]};
        this.addChild(segment);
    }

    this.addChild(this._highlight);
};

App.ReportChart.prototype = Object.create(PIXI.Graphics.prototype);
App.ReportChart.prototype.constructor = App.ReportChart;

/**
 * Show
 */
App.ReportChart.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN)
    {
        this._registerEventListeners();

        this._transitionState = TransitionState.SHOWING;

        this._tween.start();
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.SHOWING;

        this._tween.restart();
    }
};

/**
 * Hide
 */
App.ReportChart.prototype.hide = function hide()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWN)
    {
        this._registerEventListeners();

        this._transitionState = TransitionState.HIDING;

        this._tween.start();
    }
    else if (this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.HIDING;

        this._tween.restart();
    }
};

/**
 * Highlight segment
 * @param {number} segment Segment of the chart to highlight
 */
App.ReportChart.prototype.highlightSegment = function highlightSegment(segment)
{
    if (segment === this._highlightSegment) return;

    if (this._transitionState === App.TransitionState.SHOWN)
    {
        this._registerEventListeners();

        this._highlight.change(
            segment === 0 ? 0 : this._segments[segment-1].progress,
            this._segments[segment].progress,
            this._segments[segment].color
        );

        this._highlightSegment = segment;

        this._updateHighlight = true;

        this._tween.restart();
    }
};

/**
 * Register event listeners
 * @private
 */
App.ReportChart.prototype._registerEventListeners = function _registerEventListeners()
{
    if (!this._eventsRegistered)
    {
        this._eventsRegistered = true;

        this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);

        this._tween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
    }
};

/**
 * UnRegister event listeners
 * @private
 */
App.ReportChart.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._tween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

    this._eventsRegistered = false;
};

/**
 * RAF tick handler
 * @private
 */
App.ReportChart.prototype._onTick = function _onTick()
{
    if (this._tween.isRunning())
    {
        if (this._updateHighlight) this._highlight.update(this._tween.progress);
        else this._updateTween(false);
    }
};

/**
 * Update show hide tween
 * @param {boolean} hiRes Indicate render chart in high-resolution
 * @private
 */
App.ReportChart.prototype._updateTween = function _updateTween(hiRes)
{
    var GraphicUtils = App.GraphicUtils,
        TransitionState = App.TransitionState,
        progress = this._tween.progress,
        i = 0,
        l = this._segments.length,
        steps = hiRes ? 20 : 10,
        start = 0,
        fraction = 0,
        segment = null;

    if (this._transitionState === TransitionState.HIDING || this._transitionState === TransitionState.HIDDEN)
    {
        progress = 1 - progress;
    }

    for (;i<l;i++)
    {
        segment = this._segments[i];
        fraction = (i + 1) * (1 / l);
        segment.progress = 360 * (progress < fraction ? progress : fraction);
        start = i === 0 ? 0 : this._segments[i-1].progress;
        GraphicUtils.drawArc(segment.graphics,this._center,this._chartSize,this._chartSize,this._thickness,start,segment.progress,steps,0,0,0,segment.color,1);
    }
};

/**
 * On Show Hide tween complete
 * @private
 */
App.ReportChart.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING) this._transitionState = TransitionState.SHOWN;
    else if (this._transitionState === TransitionState.HIDING) this._transitionState = TransitionState.HIDDEN;

    this._updateTween(true);

    this._unRegisterEventListeners();

    if (this._updateHighlight)
    {
        this._updateHighlight = false;

        this._highlight.update(1);
    }
};
