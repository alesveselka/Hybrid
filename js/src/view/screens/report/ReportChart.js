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
        ModelName = App.ModelName,
        eventListenerPool = ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL);

    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,height);

    this._model = model;
    this._eventsRegistered = false;
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._segmentTween = new App.TweenProxy(1,App.Easing.outExpo,0,eventListenerPool);
    this._highlightTween = new App.TweenProxy(1,App.Easing.outExpo,0,eventListenerPool);
    this._segmentPool = new App.ObjectPool(App.ReportChartSegment,5);
    this._segments = null;
    this._showSegments = void 0;
    this._hideSegments = void 0;
    this._highlightSegment = void 0;
    this._center = new PIXI.Point(Math.round(width/2),Math.round(height/2));
    this._thickness = Math.round(width * 0.07 * pixelRatio);
    this._chartSize = width - Math.round(5 * pixelRatio * 2);// 5px margin on sides for highlight line
    this._highlight = this.addChild(new App.ReportChartHighlight(this._center,width,height,Math.round(3 * pixelRatio)));
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

    // Reset segments and highlight
    this._showSegments = null;
    this._hideSegments = null;
    this._highlight.change(null);
    this._highlight.update(1);

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
        totalBalance = account.balance;
        if (account.lifeCycleState !== deletedState && !isNaN(totalBalance) && totalBalance !== 0.0)
        {
            if (!this._segments[account.id]) this._segments[account.id] = [];

            segmentArray = this._segments[account.id];
            previousBalance = 0.0;
            category = null;
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

    this._segmentTween.restart();
};

/**
 * Highlight segment
 * @param {App.Category} category
 */
App.ReportChart.prototype.highlightSegment = function highlightSegment(category)
{
    //TODO add icon of highlighted category in the middle of chart
    if (this._showSegments)
    {
        var segment = this._getSegmentByCategory(category);

        if (segment === this._highlightSegment) return;

        this._highlightSegment = segment;
        this._highlight.change(segment);

        this._registerEventListeners();

        this._highlightTween.restart();
    }
};

/**
 * Find and return segment by category passed in
 * @param {App.Category} category
 * @returns {App.ReportChartSegment}
 * @private
 */
App.ReportChart.prototype._getSegmentByCategory = function _getSegmentByCategory(category)
{
    var i = 0,
        l = this._showSegments.length;

    for (;i<l;i++)
    {
        if (this._showSegments[i].rendersModel(category)) return this._showSegments[i];
    }

    return null;
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

        this._segmentTween.addEventListener(App.EventType.COMPLETE,this,this._onSegmentTweenComplete);
        this._highlightTween.addEventListener(App.EventType.COMPLETE,this,this._onHighlightTweenComplete);
    }
};

/**
 * UnRegister event listeners
 * @private
 */
App.ReportChart.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._segmentTween.removeEventListener(App.EventType.COMPLETE,this,this._onSegmentTweenComplete);
    this._highlightTween.removeEventListener(App.EventType.COMPLETE,this,this._onHighlightTweenComplete);

    this._eventsRegistered = false;
};

/**
 * RAF tick handler
 * @private
 */
App.ReportChart.prototype._onTick = function _onTick()
{
    if (this._segmentTween.isRunning()) this._updateSegmentTween();

    if (this._highlightTween.isRunning()) this._highlight.update(this._highlightTween.progress);
};

/**
 * Update show hide tween
 * @private
 */
App.ReportChart.prototype._updateSegmentTween = function _updateSegmentTween()
{
    var GraphicUtils = App.GraphicUtils,
        progress = this._segmentTween.progress,
        progressAngle = progress * 360,
        size = this._chartSize,
        i = 0,
        l = this._showSegments.length,
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

                GraphicUtils.drawArc(segment,this._center,size,size,this._thickness,segment.startAngle,end,segment.steps,0,0,0,"0x"+segment.color,1);
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
            GraphicUtils.drawArc(segment,this._center,size,size,this._thickness,segment.startAngle,segment.endAngle,20,0,0,0,"0x"+segment.color,progress);
        }
    }
};

/**
 * On segment tweenc omplete
 * @private
 */
App.ReportChart.prototype._onSegmentTweenComplete = function _onSegmentTweenComplete()
{
    if (!this._segmentTween.isRunning() && !this._highlightTween.isRunning()) this._unRegisterEventListeners();

    this._updateSegmentTween();
};

/**
 * On Highlight tween complete
 * @private
 */
App.ReportChart.prototype._onHighlightTweenComplete = function _onHighlightTweenComplete()
{
    if (!this._segmentTween.isRunning() && !this._highlightTween.isRunning()) this._unRegisterEventListeners();

    this._highlight.update(1);
};
