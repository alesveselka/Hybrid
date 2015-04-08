/**
 * @class ReportChart
 * @extends Graphics
 * @param {App.Collection} model
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ReportChart = function ReportChart(model,width,height,pixelRatio)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName;

    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._model = model;
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._tween = new App.TweenProxy(1,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._transitionState = App.TransitionState.HIDDEN;
    this._eventsRegistered = false;
    this._segmentPool = new App.ObjectPool(App.ReportChartSegment,5);
    this._segments = null;
    this._center = new PIXI.Point(Math.round(width/2),Math.round(height/2));
    this._thickness = Math.round(width * 0.07 * pixelRatio);
    this._chartSize = width - Math.round(5 * pixelRatio * 2);// 5px margin on sides for highlight line
    this._highlight = this.addChild(new App.ReportChartHighlight(this._center,width,height,Math.round(3 * pixelRatio)));
    this._updateHighlight = false;
    this._highlightSegment = void 0;
};

App.ReportChart.prototype = Object.create(PIXI.Graphics.prototype);

/**
 * Generate chart segments
 * @private
 */
App.ReportChart.prototype._generateSegments = function _generateSegments()
{
    var i = 1,
        l = this._model.length(),
        j = 0,
        k = 0,
        totalBalance = 0.0,
        previousBalance = 0.0,
        deletedState = App.LifeCycleState.DELETED,
        segment = null,
        account = null,
        category = null,
        categories = null;

    // Release segments back to pool
    if (this._segments)
    {
        while (this._segments.length)
        {
            segment = this._segments.pop();
            this.removeChild(segment);
            this._segmentPool.release(segment);
        }
    }
    else
    {
        this._segments = [];
    }

    // Calculate total balance
    /*for (l=this._model.length();i<l;)
    {
        account = this._model.getItemAt(i++);
        if (account.lifeCycleState !== deletedState) totalBalance += account.balance;
    }*/

    // Populate segments again
    for (i=0;i<l;)
    {
        account = this._model.getItemAt(i++);
        if (account.lifeCycleState !== deletedState)
        {
            previousBalance = 0.0;
            totalBalance = account.balance;
            categories = account.categories;
            for (j=0,k=categories.length;j<k;)
            {
                if (category) previousBalance += category.balance;
                category = categories[j++];
                segment = this._segmentPool.allocate();
                segment.setModel(category,totalBalance,previousBalance);
                this._segments.push(segment);
                this.addChild(segment);
            }
        }
    }
};

/**
 * Show
 */
App.ReportChart.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN)
    {
        this._registerEventListeners();

        this._generateSegments();

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
    /*if (segment === this._highlightSegment) return;

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
    }*/
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
        progressAngle = progress * 360,
        i = 0,
        l = this._segments.length,
        steps = 20,//hiRes ? 20 : 10,
        start = 0,
        end = 0,
        segment = null;

    /*if (this._transitionState === TransitionState.HIDING || this._transitionState === TransitionState.HIDDEN)
    {
        progress = 1 - progress;
    }*/

    for (;i<l;i++)
    {
        segment = this._segments[i];
        start = segment.startAngle;
        if (progressAngle >= start && !segment.fullyRendered)
        {
            end = progressAngle;
            if (end >= segment.endAngle)
            {
                end = segment.endAngle;
                segment.fullyRendered = true;
            }

            GraphicUtils.drawArc(segment,this._center,this._chartSize,this._chartSize,this._thickness,start,end,steps,0,0,0,"0x"+segment.color,1);
        }
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
