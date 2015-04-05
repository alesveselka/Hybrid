/**
 * @class CurrencyButton
 * @extends DisplayObjectContainer
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {PIXI.Texture} options.skin
 * @param {{font:string,fill:string}} options.symbolLabelStyle
 * @constructor
 */
App.CurrencyButton = function CurrencyButton(poolIndex,options)
{
    App.SwipeButton.call(this,options.width,options.openOffset);

    this.allocated = false;
    this.poolIndex = poolIndex;
    this.boundingBox = new PIXI.Rectangle(0,0,options.width,options.height);

    this._model = null;

    this._pixelRatio = options.pixelRatio;
    this._skin = this.addChild(new PIXI.Sprite(options.skin));
    this._symbolLabel = this.addChild(new PIXI.Text("",options.symbolLabelStyle));
    this._renderAll = true;

    this._render();
};

App.CurrencyButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * @method render
 * @private
 */
App.CurrencyButton.prototype._render = function _render()
{
    if (this._renderAll)
    {
        this._renderAll = false;

        this._symbolLabel.x = Math.round(20 * this._pixelRatio);
        this._symbolLabel.y = Math.round((this.boundingBox.height - this._symbolLabel.height) / 2);
    }
};

/**
 * Set model
 * @param {App.CurrencySymbol} model
 */
App.CurrencyButton.prototype.setModel = function getModel(model)
{
    this._model = model;

    this._symbolLabel.setText(this._model.symbol);
};

/**
 * Click handler
 */
App.CurrencyButton.prototype.onClick = function onClick()
{
    var EventType = App.EventType,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    changeScreenData.updateBackScreen = true;

    App.Controller.dispatchEvent(EventType.CHANGE_TRANSACTION,{
        type:EventType.CHANGE,
        currencyQuote:this._model.symbol,
        nextCommand:new App.ChangeScreen(),
        nextCommandData:changeScreenData
    });
};
