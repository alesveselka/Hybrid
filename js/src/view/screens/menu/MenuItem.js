/**
 * @class MenuItem
 * @extends Graphics
 * @param {string} label
 * @param {string} iconName
 * @param {number} screenName
 * @param {{width:number,height:number,pixelRatio:number,style:Object}} options
 * @constructor
 */
App.MenuItem = function MenuItem(label,iconName,screenName,options)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._screenName = screenName;
    this._pixelRatio = options.pixelRatio;
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._iconResizeRatio = Math.round(22 * options.pixelRatio) / this._icon.height;
    this._labelField = new PIXI.Text(label,options.style);

    this._render();

    this.addChild(this._icon);
    this.addChild(this._labelField);
};

App.MenuItem.prototype = Object.create(PIXI.Graphics.prototype);
App.MenuItem.prototype.constructor = App.MenuItem;

/**
 * Render
 * @private
 */
App.MenuItem.prototype._render = function _render()
{
    var ColorTheme = App.ColorTheme,
        h = this.boundingBox.height;

    this._icon.scale.x = this._iconResizeRatio;
    this._icon.scale.y = this._iconResizeRatio;
    this._icon.x = Math.round(15 * this._pixelRatio);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = ColorTheme.WHITE;

    this._labelField.x = Math.round(60 * this._pixelRatio);
    this._labelField.y = Math.round((h - this._labelField.height) / 2);

    App.GraphicUtils.drawRect(this,ColorTheme.BLUE,1.0,0,0,this.boundingBox.width,h);
};

/**
 * Return associated screen name
 * @returns {number}
 */
App.MenuItem.prototype.getScreenName = function getScreenName()
{
    return this._screenName;
};
