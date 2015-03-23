/**
 * @class TransactionButton
 * @extends SwipeButton
 * @param {number} poolIndex
 * @param {{width:number,height:number,pixelRatio:number:labelStyles:Object}} options
 * @constructor
 */
App.TransactionButton = function TransactionButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    var Text = PIXI.Text,
        Graphics = PIXI.Graphics,
        editStyle = options.labelStyles.edit;

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._model = null;
    this._pixelRatio = options.pixelRatio;
    this._labelStyles = options.labelStyles;
    this._isPending = void 0;

    this._background = this.addChild(new Graphics());
    this._copyLabel = this.addChild(new Text("Copy",editStyle));
    this._editLabel = this.addChild(new Text("Edit",editStyle));
    this._icon = null;
    this._iconResizeRatio = -1;
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._redSkin = this._swipeSurface.addChild(new PIXI.Sprite(options.redSkin));
    this._greySkin = this._swipeSurface.addChild(new PIXI.Sprite(options.greySkin));
    this._colorStripe = this._swipeSurface.addChild(new Graphics());
    this._accountField = this._swipeSurface.addChild(new Text("",editStyle));
    this._categoryField = this._swipeSurface.addChild(new Text("",editStyle));
    this._amountField = this._swipeSurface.addChild(new Text("",editStyle));
    this._currencyField = this._swipeSurface.addChild(new Text("",editStyle));
    this._dateField = this._swipeSurface.addChild(new Text("",editStyle));
    this._pendingFlag = this._swipeSurface.addChild(new Graphics());
    this._pendingLabel = this._pendingFlag.addChild(new Text("PENDING",this._labelStyles.pending));
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
    var pending = this._model.pending,
        date = this._model.date,
        dateText = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

    this._accountField.setText(this._model.account.name);
    this._amountField.setText(this._model.amount);
    this._currencyField.setText(" " + this._model.currencyQuote);
    this._categoryField.setText(this._model.subCategory.name+" / "+this._model.category.name);
    this._dateField.setText(pending ? "Due by\n"+dateText : dateText);

    if (this._icon) this._icon.setTexture(PIXI.TextureCache[this._model.category.icon]);
    else this._icon = this._swipeSurface.addChild(PIXI.Sprite.fromFrame(this._model.category.icon));

    if (pending !== this._isPending)
    {
        if (pending)
        {
            this._accountField.setStyle(this._labelStyles.accountPending);
            this._amountField.setStyle(this._labelStyles.amountPending);
            this._currencyField.setStyle(this._labelStyles.currencyPending);
            this._categoryField.setStyle(this._labelStyles.accountPending);
            this._dateField.setStyle(this._labelStyles.datePending);
        }
        else
        {
            this._accountField.setStyle(this._labelStyles.accountIncome);
            this._amountField.setStyle(this._labelStyles.amountIncome);
            this._currencyField.setStyle(this._labelStyles.currencyIncome);
            this._categoryField.setStyle(this._labelStyles.accountIncome);
            this._dateField.setStyle(this._labelStyles.date);
        }
    }

    this._render(updateAll,pending);
    this._updateLayout(updateAll,pending);

    this.close(true);

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
        swipeOptionWidth = Math.round(this._openOffset / 2);

    if (renderAll)
    {
        GraphicUtils.drawRects(this._background,ColorTheme.GREEN,1,[0,0,w-swipeOptionWidth,h],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.RED,1,[w-swipeOptionWidth,0,swipeOptionWidth,h],false,true);

        GraphicUtils.drawRect(this._pendingFlag,0x000000,1,0,0,Math.round(this._pendingLabel.width+10*r),Math.round(this._pendingLabel.height+6*r));
    }

    GraphicUtils.drawRect(this._colorStripe,"0x"+this._model.category.color,1,0,0,Math.round(4 * r),h);

    if (pending !== this._isPending)
    {
        if (pending)
        {
            this._greySkin.visible = false;
            this._redSkin.visible = true;
            this._pendingFlag.visible = true;
        }
        else
        {
            this._greySkin.visible = true;
            this._redSkin.visible = false;
            this._pendingFlag.visible = false;
        }
    }

    this._icon.tint = pending ? ColorTheme.RED_DARK : parseInt(this._model.category.color,16);
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

        if (this._iconResizeRatio === -1) this._iconResizeRatio = Math.round(32 * this._pixelRatio) / this._icon.height;
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round(20 * r);
        this._icon.y = Math.round((h - this._icon.height) / 2);

        this._accountField.x = Math.round(70 * r);
        this._accountField.y = Math.round(7 * r);
        this._amountField.x = Math.round(70 * r);
        this._amountField.y = Math.round(26 * r);
        this._currencyField.y = Math.round(33 * r);
        this._categoryField.x = Math.round(70 * r);
        this._categoryField.y = Math.round(52 * r);

        this._pendingLabel.x = Math.round(5 * r);
        this._pendingLabel.y = Math.round(4 * r);
        this._pendingFlag.x = Math.round(w - padding - this._pendingFlag.width);
        this._pendingFlag.y = Math.round(7 * r);
    }

    this._currencyField.x = Math.round(this._amountField.x + this._amountField.width);

    this._dateField.x = Math.round(w - padding - this._dateField.width);
    this._dateField.y = pending ? Math.round(38 * r) : Math.round(52 * r);
};

/**
 * Set model
 * @param {App.Transaction} model
 */
App.TransactionButton.prototype.setModel = function setModel(model)
{
    this._model = model;

    this._update(this._icon === null);
};

/**
 * Click handler
 * @param {PIXI.InteractionData} data
 */
App.TransactionButton.prototype.onClick = function onClick(data)
{
    var position = data.getLocalPosition(this).x;

    if (this._isOpen && position >= this._width - this._openOffset)
    {
        var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update();

        // Edit
        if (position >= this._width - this._openOffset / 2)
        {
            App.ModelLocator.getProxy(App.ModelName.TRANSACTIONS).setCurrent(this._model);

            changeScreenData.screenMode = App.ScreenMode.EDIT;
            changeScreenData.updateData = this._model;
            changeScreenData.headerName = App.ScreenTitle.EDIT_TRANSACTION;

            App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
        }
        // Copy
        else
        {
            App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
                type:App.EventType.COPY,
                transaction:this._model,
                nextCommand:new App.ChangeScreen(),
                nextCommandData:changeScreenData
            });
        }
    }
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
