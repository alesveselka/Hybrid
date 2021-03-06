/**
 * @class EditCurrencyPairScreen
 * @param {Object} layout
 * @constructor
 */
App.EditCurrencyPairScreen = function EditCurrencyPairScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        w = layout.width;

    this._background = this.addChild(new PIXI.Graphics());
    this._pairLabel = this.addChild(new PIXI.Text("EUR / USD",App.FontStyle.get(24,App.FontStyle.BLUE)));
    this._input = this.addChild(new App.Input("",20,Math.round(layout.width - this._pairLabel.width - Math.round(50 * r)),Math.round(40 * r),r));
    this._downloadButton = this.addChild(new App.Button("Update rate from internet",{
        width:Math.round(w - 20 * r),
        height:Math.round(40 * r),
        pixelRatio:r,
        style:FontStyle.get(18,FontStyle.BLACK_LIGHT,null,FontStyle.LIGHT_CONDENSED),
        backgroundColor:App.ColorTheme.GREY_DARK
    }));

    this._input.restrict(/\d{1,}(\.\d*){0,1}/g);

    this._render();
};

App.EditCurrencyPairScreen.prototype = Object.create(App.Screen.prototype);

/**
 * Render
 * @private
 */
App.EditCurrencyPairScreen.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        r = this._layout.pixelRatio,
        w = this._layout.width,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r);

    this._pairLabel.x = padding * 2;
    this._pairLabel.y = Math.round(22 * r);

    this._input.x = Math.round(w - padding - this._input.width);
    this._input.y = padding;

    this._downloadButton.x = padding;
    this._downloadButton.y = inputHeight + padding;

    GraphicUtils.drawRects(this._background,ColorTheme.GREY,1,[0,0,w,inputHeight*2],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_DARK,1,[padding,inputHeight-1,w-padding*2,1],false,false);
    GraphicUtils.drawRects(this._background,ColorTheme.GREY_LIGHT,1,[padding,inputHeight,w-padding*2,1],false,true);
};

/**
 * Enable
 */
App.EditCurrencyPairScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
};

/**
 * Disable
 */
App.EditCurrencyPairScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
};

/**
 * Update
 * @param {App.CurrencyPair} model
 * @param {string} mode
 */
App.EditCurrencyPairScreen.prototype.update = function update(model,mode)
{
    this._model = model;

    this._pairLabel.setText(this._model.base+" / "+this._model.symbol);
    this._input.setValue(this._model.rate);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditCurrencyPairScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);
    changeScreenData.updateBackScreen = true;

    this._input.blur();

    //TODO check first if value is set

    if (action === App.HeaderAction.CONFIRM)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_CURRENCY_PAIR,{
            currencyPair:this._model,
            rate:this._input.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
};
