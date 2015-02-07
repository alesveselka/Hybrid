/**
 * @class HeaderTitle
 * @extends HeaderSegment
 * @param {string} value
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {{font:string,fill:string}} fontStyle
 * @constructor
 */
App.HeaderTitle = function HeaderTitle(value,width,height,pixelRatio,fontStyle)
{
    App.HeaderSegment.call(this,value,width,height,pixelRatio);

    this._frontElement = new PIXI.Text(value,fontStyle);
    this._backElement = new PIXI.Text(value,fontStyle);

    this._render();

    this.addChild(this._frontElement);
    this.addChild(this._backElement);
};

App.HeaderTitle.prototype = Object.create(App.HeaderSegment.prototype);
App.HeaderTitle.prototype.constructor = App.HeaderTitle;

/**
 * Render
 * @private
 */
App.HeaderTitle.prototype._render = function _render()
{
    App.HeaderSegment.prototype._render.call(this);

    this._middlePosition = Math.round(18 * this._pixelRatio);

    this._frontElement.x = Math.round((this._width - this._frontElement.width) / 2);
    this._frontElement.y = this._height;
    this._frontElement.alpha = 0.0;

    this._backElement.x = Math.round((this._width - this._backElement.width) / 2);
    this._backElement.y = this._height;
    this._backElement.alpha = 0.0;
};

/**
 * Change
 * @param {string} name
 */
App.HeaderTitle.prototype.change = function change(name)
{
    App.HeaderSegment.prototype.change.call(this,name);

    this._frontElement.setText(name);
    this._frontElement.x = Math.round((this._width - this._frontElement.width) / 2);
    this._frontElement.alpha = 1.0;
};
