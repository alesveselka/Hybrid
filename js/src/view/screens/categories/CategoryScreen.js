/**
 * @class CategoryScreen
 * @extends DisplayObjectContainer
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(model,layout)
{
    PIXI.DisplayObjectContainer.call(this);

    this._model = model;
    this._layout = layout;
    this._enabled = false;

    var i = 0, l = this._model.length(), CategoryButton = App.CategoryButton, button = null;

    this._buttons = new Array(l);
    this._buttonContainer = new PIXI.DisplayObjectContainer();

    for (;i<30;i++)
    {
        //button = new AccountButton(this._model.getItemAt(i),this._layout);
        button = new CategoryButton(this._model.getItemAt(0),this._layout,i);
        this._buttons[i] = button;
        this._buttonContainer.addChild(button);
    }

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio);
    this._pane.setContent(this._buttonContainer);

    this._updateLayout();

    this.addChild(this._pane);

//    this._addButton =
};

App.CategoryScreen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryScreen.prototype.constructor = App.CategoryScreen;

App.CategoryScreen.prototype.show = function show()
{
    this.visible = true;
//    console.log(this," show");
    this.enable();
};

App.CategoryScreen.prototype.hide = function hide()
{
    this.disable();
//    console.log(this," hide");
    this.visible = false;
};

/**
 * Enable
 */
App.CategoryScreen.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this._pane.enable();

        this.interactive = true;

        this._registerEventListeners();

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.CategoryScreen.prototype.disable = function disable()
{
    this.interactive = false;

    this._pane.disable();

    //this._registerEventListeners();

    this._enabled = false;
};

/**
 * Register event listeners
 * @private
 */
App.CategoryScreen.prototype._registerEventListeners = function _registerEventListeners()
{
    /*this.click = function click()
    {
        console.log("Categories clicked");
    }*/
};

/**
 * @method _updateLayout
 * @private
 */
App.CategoryScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0, l = this._buttons.length, height = this._buttons[0].boundingBox.height;
    for (;i<l;i++)
    {
        this._buttons[i].y = i * height;
    }

    this._pane.resize(this._layout.width,this._layout.height);
};

/**
 * Destroy
 */
App.CategoryScreen.prototype.destroy = function destroy()
{
    this.disable();

    var i = 0, button = null;
    for (;i<30;i++)
    {
        this._buttons[i] = button;
        this._buttonContainer.removeChild(button);
        button.destroy();
    }

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    this._buttonContainer = null;

    this._buttons.length = 0;
    this._buttons = null;
};