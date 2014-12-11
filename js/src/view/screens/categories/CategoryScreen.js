/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

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

App.CategoryScreen.prototype = Object.create(App.Screen.prototype);
App.CategoryScreen.prototype.constructor = App.CategoryScreen;

/**
 * Enable
 */
App.CategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Click handler
 * @private
 */
App.CategoryScreen.prototype._onClick = function _onClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ACCOUNT);
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
    App.Screen.prototype.destroy.call(this);

    this.disable();

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    var i = 0, l = this._buttons.length, button = null;
    for (;i<l;)
    {
        button = this._buttons[i++];
        if (this._buttonContainer.contains(button)) this._buttonContainer.removeChild(button);
        button.destroy();
    }
    this._buttonContainer = null;

    this._buttons.length = 0;
    this._buttons = null;
};