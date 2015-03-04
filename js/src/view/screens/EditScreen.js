/**
 * @class EditScreen
 * @param {Object} layout
 * @constructor
 */
App.EditScreen = function EditScreen(layout)
{
    App.Screen.call(this,null,layout,0.4);

    var FontStyle = App.FontStyle,
        r = layout.pixelRatio,
        inputWidth = layout.width - Math.round(20 * r),
        inputHeight = Math.round(40 * r);

    this._background = new PIXI.Graphics();
    this._input = new App.Input("",20,inputWidth,inputHeight,r,true);
    this._deleteButton = new App.Button("Delete",{width:inputWidth,height:inputHeight,pixelRatio:r,style:FontStyle.get(18,FontStyle.WHITE),backgroundColor:App.ColorTheme.RED});

    this._render();

    this.addChild(this._background);
    this.addChild(this._input);
    this.addChild(this._deleteButton);
};

App.EditScreen.prototype = Object.create(App.Screen.prototype);
App.EditScreen.prototype.constructor = App.EditScreen;

/**
 * Render
 * @private
 */
App.EditScreen.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        draw = App.GraphicUtils.drawRects,
        r = this._layout.pixelRatio,
        padding = Math.round(10 * r),
        inputHeight = Math.round(60 * r),
        w = this._layout.width - padding * 2;

    this._input.x = padding;
    this._input.y = padding;

    this._deleteButton.x = padding;
    this._deleteButton.y = inputHeight + padding;

    draw(this._background,ColorTheme.GREY,1,[0,0,w+padding*2,inputHeight*2],true,false);
    draw(this._background,ColorTheme.GREY_DARK,1,[padding,inputHeight-1,w,1],false,false);
    draw(this._background,ColorTheme.GREY_LIGHT,1,[padding,inputHeight,w,1],false,true);
};

/**
 * Enable
 */
App.EditScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._input.enable();
};

/**
 * Disable
 */
App.EditScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._input.disable();
};

/**
 * Update
 * @param {*} model
 * @param {string} mode
 */
App.EditScreen.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._input.setValue(this._model.name);
    //this._input.setPlaceholder(data.placeholder);
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.EditScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

    this._input.blur();

    if (action === App.HeaderAction.CONFIRM)
    {
        //TODO check first if value is set
        //TODO different action when editing different models

        changeScreenData.updateBackScreen = true;

        App.Controller.dispatchEvent(App.EventType.CREATE_SUB_CATEGORY,{
            model:this._model,
            name:this._input.getValue(),
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData
        });
    }
    else if (action === App.HeaderAction.CANCEL)
    {
        this._model = null;

        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData);
    }
};
