/**
 * @class CurrencyPairButton
 * @extends SwipeButton
 * @param {App.CurrencyPair} model
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {PIXI.Texture} options.skin
 * @param {{font:string,fill:string}} options.editLabelStyle
 * @param {{font:string,fill:string}} options.pairLabelStyle
 * @param {{font:string,fill:string}} options.rateLabelStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.CurrencyPairButton = function CurrencyPairButton(model,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.boundingBox = new PIXI.Rectangle(0,0,options.width,options.height);

    this._model = model;

    this._pixelRatio = options.pixelRatio;
    this._background = this.addChild(new PIXI.Graphics());
    this._editLabel = this.addChild(new PIXI.Text("Edit",options.editLabelStyle));
    this._swipeSurface = this.addChild(new PIXI.DisplayObjectContainer());
    this._skin = this._swipeSurface.addChild(new PIXI.Sprite(options.skin));
    this._pairLabel = this._swipeSurface.addChild(new PIXI.Text(model.base+"/"+model.symbol,options.pairLabelStyle));
    this._rateLabel = this._swipeSurface.addChild(new PIXI.Text(model.rate,options.rateLabelStyle));
    this._renderAll = true;

    this._render();
};

App.CurrencyPairButton.prototype = Object.create(App.SwipeButton.prototype);
App.CurrencyPairButton.prototype.constructor = App.CurrencyPairButton;

/**
 * @method render
 * @private
 */
App.CurrencyPairButton.prototype._render = function _render()
{
    var w = this.boundingBox.width,
        h = this.boundingBox.height,
        r = this._pixelRatio,
        offset = Math.round(15 * r);

    if (this._renderAll)
    {
        this._renderAll = false;

        App.GraphicUtils.drawRect(this._background,App.ColorTheme.RED,1,0,0,w,h);

        this._editLabel.x = Math.round(w - 50 * this._pixelRatio);
        this._editLabel.y = Math.round((h - this._editLabel.height) / 2);

        this._pairLabel.x = offset;
        this._pairLabel.y = Math.round((h - this._pairLabel.height) / 2);

        this._rateLabel.y = Math.round((h - this._rateLabel.height) / 2);
    }

    this._rateLabel.x = Math.round(w - offset - this._rateLabel.width);
};

/**
 * Update
 */
App.CurrencyPairButton.prototype.update = function update()
{
    //TODO check if model was updated so I don't have to update all items blindly
    this._rateLabel.setText(this._model.rate);

    this._render();
};

/**
 * Click handler
 * @param {InteractionData} interactionData
 */
App.CurrencyPairButton.prototype.onClick = function onClick(interactionData)
{
    if (this._isOpen && interactionData.getLocalPosition(this).x >= this._width - this._openOffset)
    {
        this._model.saveState();

        App.Controller.dispatchEvent(
            App.EventType.CHANGE_SCREEN,
            App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
                App.ScreenName.EDIT,
                App.ScreenMode.EDIT,
                {subCategory:this._model,category:category},
                0,
                0,
                App.ScreenTitle.EDIT_SUB_CATEGORY
            )
        );
    }
};

/**
 * Update swipe position
 * @param {number} position
 * @private
 */
App.CurrencyPairButton.prototype._updateSwipePosition = function _updateSwipePosition(position)
{
    this._swipeSurface.x = position;
};

/**
 * Return swipe position
 * @private
 */
App.CurrencyPairButton.prototype._getSwipePosition = function _getSwipePosition()
{
    return this._swipeSurface.x;
};
