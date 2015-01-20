/**
 * @class TransactionButton
 * @extends SwipeButton
 * @param {Category} model
 * @param {Object} layout
 * @param {Object} labelStyles
 * @constructor
 */
App.TransactionButton = function TransactionButton(model,layout,labelStyles)
{
    App.SwipeButton.call(this,layout.width,Math.round(120*layout.pixelRatio));

    var Text = PIXI.Text,
        Graphics = PIXI.Graphics;

    this.boundingBox = new App.Rectangle(0,0,layout.width,Math.round(70*layout.pixelRatio));

    this._model = model;
    this._layout = layout;
    this._isPending = model === 3;

    this._background = new Graphics();
    this._copyLabel = new Text("Copy",labelStyles.edit);
    this._editLabel = new Text("Edit",labelStyles.edit);
    this._swipeSurface = new Graphics();
    this._icon = PIXI.Sprite.fromFrame("transactions");

    if (this._isPending)
    {
        this._accountField = new Text("Personal",labelStyles.accountPending);
        this._categoryField = new Text("Cinema / Entertainment",labelStyles.accountPending);
        this._amountField = new Text("100.00",labelStyles.amountPending);
        this._dateField = new Text("Due by\n10/21/2014",labelStyles.datePending);
    }
    else
    {
        this._accountField = new Text("Personal",labelStyles.account);
        this._categoryField = new Text("Cinema / Entertainment",labelStyles.account);
        this._amountField = new Text("100.00",labelStyles.amount);
        this._dateField = new Text("10/21/2014",labelStyles.date);
    }

    this._pendingFlag = new Graphics();
    this._pendingLabel = new Text("PENDING",labelStyles.pending);

    this._render();

    this._swipeSurface.addChild(this._icon);
    this._swipeSurface.addChild(this._accountField);
    this._swipeSurface.addChild(this._categoryField);
    this._swipeSurface.addChild(this._amountField);
    this._swipeSurface.addChild(this._dateField);
    this._pendingFlag.addChild(this._pendingLabel);
    if (this._isPending) this._swipeSurface.addChild(this._pendingFlag);
    this.addChild(this._background);
    this.addChild(this._copyLabel);
    this.addChild(this._editLabel);
    this.addChild(this._swipeSurface);
};

App.TransactionButton.prototype = Object.create(App.SwipeButton.prototype);
App.TransactionButton.prototype.constructor = App.TransactionButton;

/**
 * Render
 * @private
 */
App.TransactionButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        swipeOptionWidth = Math.round(60 * r),
        colorStripeWidth = Math.round(4 * r),
        padding = Math.round(10 * r),
        iconResizeRatio = Math.round(32 * r) / this._icon.height;

    GraphicUtils.drawRects(this._background,0x33CC33,1,[0,0,w-swipeOptionWidth,h],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.SWIPE_BACKGROUND,1,[w-swipeOptionWidth,0,swipeOptionWidth,h],false,true);

    this._copyLabel.x = w - swipeOptionWidth * 2 + Math.round((swipeOptionWidth - this._copyLabel.width) / 2);
    this._copyLabel.y = Math.round((h - this._copyLabel.height) / 2);
    this._editLabel.x = w - swipeOptionWidth + Math.round((swipeOptionWidth - this._editLabel.width) / 2);
    this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

    if (this._isPending)
    {
        GraphicUtils.drawRects(this._swipeSurface,0xff3366,1,[0,0,colorStripeWidth,h],true,false);
        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.SWIPE_BACKGROUND,1,[colorStripeWidth,0,w-colorStripeWidth,h],false,false);
        GraphicUtils.drawRects(this._swipeSurface,0xFF3300,1,[padding,0,w-padding*2,1],false,false);
        GraphicUtils.drawRects(this._swipeSurface,0x990000,1,[padding,h-1,w-padding*2,1],false,true);
    }
    else
    {
        GraphicUtils.drawRects(this._swipeSurface,0xff3366,1,[0,0,colorStripeWidth,h],true,false);
        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.BACKGROUND,1,[colorStripeWidth,0,w-colorStripeWidth,h],false,false);
        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.LIGHT_SHADE,1,[padding,0,w-padding*2,1],false,false);
        GraphicUtils.drawRects(this._swipeSurface,ColorTheme.DARK_SHADE,1,[padding,h-1,w-padding*2,1],false,true);
    }

    this._icon.scale.x = iconResizeRatio;
    this._icon.scale.y = iconResizeRatio;
    this._icon.x = Math.round(20 * r);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = this._isPending ? 0x990000 : ColorTheme.BLUE;

    this._accountField.x = Math.round(70 * r);
    this._accountField.y = Math.round(7 * r);
    this._amountField.x = Math.round(70 * r);
    this._amountField.y = Math.round(26 * r);
    this._categoryField.x = Math.round(70 * r);
    this._categoryField.y = Math.round(52 * r);

    this._dateField.x = Math.round(w - padding - this._dateField.width);
    this._dateField.y = this._isPending ? Math.round(38 * r) : Math.round(52 * r);

    GraphicUtils.drawRect(this._pendingFlag,0x000000,1,0,0,Math.round(this._pendingLabel.width+10*r),Math.round(this._pendingLabel.height+6*r));
    this._pendingLabel.x = Math.round(5 * r);
    this._pendingLabel.y = Math.round(4 * r);
    this._pendingFlag.x = Math.round(w - padding - this._pendingFlag.width);
    this._pendingFlag.y = Math.round(7 * r);
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.TransactionButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.TransactionButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};
