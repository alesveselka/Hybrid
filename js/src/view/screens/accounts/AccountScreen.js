/**
 * @class AccountScreen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(model,layout)
{
    PIXI.DisplayObjectContainer.call(this);

    this._model = model;
    this._layout = layout;

    var i = 0, l = this._model.length(), AccountButton = App.AccountButton, button = null;

    this._accountButtons = new Array(l);

    for (;i<l;i++)
    {
        button = new AccountButton(this._model.getItemAt(i),this._layout);
        this._accountButtons[i] = button;
        this.addChild(button);
    }

    this._updateLayout();

//    this._addButton =
};

App.AccountScreen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.AccountScreen.prototype.constructor = App.AccountScreen;

/**
 * @method _resize
 * @param {number} width
 */
App.AccountScreen.prototype.resize = function resize(width)
{
    //

    this._render();
};

/**
 * @method _updateLayout
 * @private
 */
App.AccountScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0, l = this._accountButtons.length, height = this._accountButtons[0].boundingBox.height;
    for (;i<l;i++)
    {
        this._accountButtons[i].y = i * height;
    }
};
