/**
 * @class HeaderIcon
 * @extends HeaderSegment
 * @param {number} value
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.HeaderIcon = function HeaderIcon(value,width,height,pixelRatio)
{
    App.HeaderSegment.call(this,value,width,height,pixelRatio);

    this._frontElement = PIXI.Sprite.fromFrame(this._getIconByAction(value));
    this._backElement = PIXI.Sprite.fromFrame(this._getIconByAction(value));
    this._iconResizeRatio = Math.round(20 * pixelRatio) / this._frontElement.height;

    this._render();

    this.addChild(this._frontElement);
    this.addChild(this._backElement);
};

App.HeaderIcon.prototype = Object.create(App.HeaderSegment.prototype);

/**
 * Render
 * @private
 */
App.HeaderIcon.prototype._render = function _render()
{
    App.HeaderSegment.prototype._render.call(this);

    var ColorTheme = App.ColorTheme;

    this._frontElement.scale.x = this._iconResizeRatio;
    this._frontElement.scale.y = this._iconResizeRatio;
    this._frontElement.x = this._middlePosition;
    this._frontElement.y = this._height;
    this._frontElement.tint = ColorTheme.WHITE;
    this._frontElement.alpha = 0.0;

    this._backElement.scale.x = this._iconResizeRatio;
    this._backElement.scale.y = this._iconResizeRatio;
    this._backElement.x = this._middlePosition;
    this._backElement.y = this._height;
    this._backElement.tint = ColorTheme.WHITE;
    this._backElement.alpha = 0.0;
};

/**
 * Return icon name by action passed in
 * @param {number} action
 * @returns {string}
 * @private
 */
App.HeaderIcon.prototype._getIconByAction = function _getIconByAction(action)
{
    var HeaderAction = App.HeaderAction,
        iconName = null;

    if (action === HeaderAction.MENU) iconName = "menu-app";
    else if (action === HeaderAction.CANCEL) iconName = "close-app";
    else if (action === HeaderAction.CONFIRM) iconName = "apply-app";
    else if (action === HeaderAction.ADD_TRANSACTION) iconName = "plus-app";

    return iconName;
};

/**
 * Change
 * @param {number} action
 */
App.HeaderIcon.prototype.change = function change(action)
{
    App.HeaderSegment.prototype.change.call(this,action);

    var iconName = this._getIconByAction(action);

    if (iconName === null)
    {
        this._frontElement.alpha = 0.0;
    }
    else
    {
        this._frontElement.setTexture(PIXI.TextureCache[iconName]);
        this._frontElement.alpha = 1.0;
    }
};
