/**
 * @class TransactionButton
 * @extends SwipeButton
 * @param {number} modelIndex
 * @param {Object} model
 * @param {{width:number,height:number,pixelRatio:number:labelStyles:Object}} options
 * @constructor
 */
App.TransactionButton = function TransactionButton(modelIndex,model,options)
{
    App.SwipeButton.call(this,options.width,Math.round(120*options.pixelRatio));

    var Text = PIXI.Text,
        Graphics = PIXI.Graphics,
        editStyle = options.labelStyles.edit,
        placeholder = "";

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = model;
    this._modelIndex = modelIndex;
    this._pixelRatio = options.pixelRatio;
    this._labelStyles = options.labelStyles;
    this._isPending = void 0;

    this._background = new Graphics();
    this._copyLabel = new Text("Copy",editStyle);
    this._editLabel = new Text("Edit",editStyle);
    this._swipeSurface = new Graphics();
    this._icon = PIXI.Sprite.fromFrame(model.iconName);
    this._iconResizeRatio = Math.round(32 * this._pixelRatio) / this._icon.height;
    this._accountField = new Text(placeholder,editStyle);
    this._categoryField = new Text(placeholder,editStyle);
    this._amountField = new Text(placeholder,editStyle);
    this._dateField = new Text(placeholder,editStyle);
    this._pendingFlag = new Graphics();
    this._pendingLabel = new Text("PENDING",this._labelStyles.pending);

    this._update(true);

    this._swipeSurface.addChild(this._icon);
    this._swipeSurface.addChild(this._accountField);
    this._swipeSurface.addChild(this._categoryField);
    this._swipeSurface.addChild(this._amountField);
    this._swipeSurface.addChild(this._dateField);
    this._pendingFlag.addChild(this._pendingLabel);
    this.addChild(this._background);
    this.addChild(this._copyLabel);
    this.addChild(this._editLabel);
    this.addChild(this._swipeSurface);
};

App.TransactionButton.prototype = Object.create(App.SwipeButton.prototype);
App.TransactionButton.prototype.constructor = App.TransactionButton;

/**
 * Update
 * @param {boolean} [updateAll=false]
 * @private
 */
App.TransactionButton.prototype._update = function _update(updateAll)
{
    var pending = this._model.pending;

    this._accountField.setText(this._model.account);
    this._amountField.setText(this._model.amount);
    this._categoryField.setText(this._model.category);
    this._dateField.setText(pending ? "Due by\n"+this._model.date : this._model.date);
    this._icon.setTexture(PIXI.TextureCache[this._model.iconName]);

    if (pending !== this._isPending)
    {
        if (pending)
        {
            this._accountField.setStyle(this._labelStyles.accountPending);
            this._amountField.setStyle(this._labelStyles.amountPending);
            this._categoryField.setStyle(this._labelStyles.accountPending);
            this._dateField.setStyle(this._labelStyles.datePending);
        }
        else
        {
            this._accountField.setStyle(this._labelStyles.account);
            this._amountField.setStyle(this._labelStyles.amount);
            this._categoryField.setStyle(this._labelStyles.account);
            this._dateField.setStyle(this._labelStyles.date);
        }

        this._render(updateAll,pending);
        this._updateLayout(updateAll,pending);
    }

    this._isPending = pending;
};

/**
 * Render
 * @param {boolean} [renderAll=false]
 * @param {boolean} pending
 * @private
 */
App.TransactionButton.prototype._render = function _render(renderAll,pending)
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        swipeOptionWidth = Math.round(60 * r),
        colorStripeWidth = Math.round(4 * r),
        padding = Math.round(10 * r),
        bgColor = ColorTheme.GREY,
        lightColor = ColorTheme.GREY_LIGHT,
        darkColor = ColorTheme.GREY_DARK;

    if (renderAll)
    {
        GraphicUtils.drawRects(this._background,ColorTheme.GREEN,1,[0,0,w-swipeOptionWidth,h],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.RED,1,[w-swipeOptionWidth,0,swipeOptionWidth,h],false,true);

        GraphicUtils.drawRect(this._pendingFlag,0x000000,1,0,0,Math.round(this._pendingLabel.width+10*r),Math.round(this._pendingLabel.height+6*r));
    }

    if (pending)
    {
        bgColor = ColorTheme.RED;
        lightColor = ColorTheme.RED_LIGHT;
        darkColor = ColorTheme.RED_DARK;

        this._icon.tint = ColorTheme.RED_DARK;

        if (!this._swipeSurface.contains(this._pendingFlag)) this._swipeSurface.addChild(this._pendingFlag);
    }
    else
    {
        this._icon.tint = ColorTheme.BLUE;

        if (this._swipeSurface.contains(this._pendingFlag)) this._swipeSurface.removeChild(this._pendingFlag);
    }

    GraphicUtils.drawRects(this._swipeSurface,0xff3366,1,[0,0,colorStripeWidth,h],true,false);
    GraphicUtils.drawRects(this._swipeSurface,bgColor,1,[colorStripeWidth,0,w-colorStripeWidth,h],false,false);
    GraphicUtils.drawRects(this._swipeSurface,lightColor,1,[padding,0,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this._swipeSurface,darkColor,1,[padding,h-1,w-padding*2,1],false,true);
};

/**
 * Update layout
 * @param {boolean} [updateAll=false]
 * @param {boolean} pending
 * @private
 */
App.TransactionButton.prototype._updateLayout = function _updateLayout(updateAll,pending)
{
    var r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        swipeOptionWidth = Math.round(60 * r),
        padding = Math.round(10 * r);

    if (updateAll)
    {
        this._copyLabel.x = w - swipeOptionWidth * 2 + Math.round((swipeOptionWidth - this._copyLabel.width) / 2);
        this._copyLabel.y = Math.round((h - this._copyLabel.height) / 2);
        this._editLabel.x = w - swipeOptionWidth + Math.round((swipeOptionWidth - this._editLabel.width) / 2);
        this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(20 * r);
        this._icon.y = Math.round((h - this._icon.height) / 2);

        this._accountField.x = Math.round(70 * r);
        this._accountField.y = Math.round(7 * r);
        this._amountField.x = Math.round(70 * r);
        this._amountField.y = Math.round(26 * r);
        this._categoryField.x = Math.round(70 * r);
        this._categoryField.y = Math.round(52 * r);

        this._pendingLabel.x = Math.round(5 * r);
        this._pendingLabel.y = Math.round(4 * r);
        this._pendingFlag.x = Math.round(w - padding - this._pendingFlag.width);
        this._pendingFlag.y = Math.round(7 * r);
    }

    this._dateField.x = Math.round(w - padding - this._dateField.width);
    this._dateField.y = pending ? Math.round(38 * r) : Math.round(52 * r);
};

/**
 * Set model
 * @param {number} modelIndex
 * @param {Object} model
 */
App.TransactionButton.prototype.setModel = function setModel(modelIndex,model)
{
    this._modelIndex = modelIndex;
    this._model = model;

    this._update(false);
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
