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
    this._showSegments = void 0;
    this._hideSegments = void 0;
};

App.ReportChart.prototype = Object.create(PIXI.Graphics.prototype);

/**
 * Update
 */
App.ReportChart.prototype.update = function update()
{
    var i = 0,
        l = this._model.length(),
        j = 0,
        k = 0,
        totalBalance = 0.0,
        previousBalance = 0.0,
        deletedState = App.LifeCycleState.DELETED,
        segmentArray = null,
        segment = null,
        account = null,
        category = null,
        categories = null;

    this._showSegments = null;
    this._hideSegments = null;

    // Release segments back to pool
    if (this._segments)
    {
        for (var prop in this._segments)
        {
            segmentArray = this._segments[prop];
            while (segmentArray.length)
            {
                segment = segmentArray.pop();
                this.removeChild(segment);
                this._segmentPool.release(segment);
            }
        }
    }
    else
    {
        this._segments = Object.create(null);
    }

    // Populate segments again
    for (i=0;i<l;)
    {
        account = this._model.getItemAt(i++);
        if (account.lifeCycleState !== deletedState)
        {
            if (!this._segments[account.id]) this._segments[account.id] = [];

            segmentArray = this._segments[account.id];
            previousBalance = 0.0;
            totalBalance = account.balance;
            categories = account.categories;
            for (j=0,k=categories.length;j<k;)
            {
                if (category) previousBalance += category.balance;
                category = categories[j++];
                segment = this._segmentPool.allocate();
                segment.setModel(category,totalBalance,previousBalance);
                segmentArray.push(segment);
                this.addChild(segment);
            }
        }
    }
};

/**
 * Show
 */
/*App.ReportChart.prototype.show = function show()
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
};*/

/**
 * Hide
 */
/*App.ReportChart.prototype.hide = function hide()
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
};*/

/**
 * Show segments associated with account passed in
 * @param {App.Account} account
 */
App.ReportChart.prototype.showSegments = function showSegments(account)
{
    if (this._showSegments)
    {
        if (this._showSegments === this._segments[account.id]) return;

        this._hideSegments = this._showSegments;
    }
    else
    {
        this._hideSegments = null;
    }

    this._showSegments = this._segments[account.id];

    for (var i=0,l=this._showSegments.length;i<l;) this._showSegments[i++].fullyRendered = false;

    this._registerEventListeners();

    //this._transitionState = App.TransitionState.SHOWING;

    this._tween.restart();
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
        else this._updateTween();
    }
};

/**
 * Update show hide tween
 * @private
 */
App.ReportChart.prototype._updateTween = function _updateTween()
{
    var GraphicUtils = App.GraphicUtils,
        progress = this._tween.progress,
        progressAngle = progress * 360,
        size = this._chartSize,
        i = 0,
        l = this._showSegments.length,
        steps = 20,//hiRes ? 20 : 10,//TODO adjust steps to chart size
        end = 0,
        segment = null;

    if (this._showSegments)
    {
        for (;i<l;i++)
        {
            segment = this._showSegments[i];
            if (progressAngle >= segment.startAngle && !segment.fullyRendered)
            {
                end = progressAngle;
                if (end >= segment.endAngle)
                {
                    end = segment.endAngle;
                    segment.fullyRendered = true;
                }

                GraphicUtils.drawArc(segment,this._center,size,size,this._thickness,segment.startAngle,end,steps,0,0,0,"0x"+segment.color,1);
            }
        }
    }

    if (this._hideSegments)
    {
        progress = 1 - progress;
        size = this._chartSize * progress;

        for (i=0,l=this._hideSegments.length;i<l;i++)
        {
            segment = this._hideSegments[i];
            GraphicUtils.drawArc(segment,this._center,size,size,this._thickness,segment.startAngle,segment.endAngle,steps,0,0,0,"0x"+segment.color,progress);
        }
    }
};

/**
 * On Show Hide tween complete
 * @private
 */
App.ReportChart.prototype._onTweenComplete = function _onTweenComplete()
{
    /*var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING) this._transitionState = TransitionState.SHOWN;
    else if (this._transitionState === TransitionState.HIDING) this._transitionState = TransitionState.HIDDEN;*/

    this._updateTween();

    this._unRegisterEventListeners();

    if (this._updateHighlight)
    {
        this._updateHighlight = false;

        this._highlight.update(1);
    }
};
