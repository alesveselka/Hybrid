/**
 * @class HeaderSegment
 * @extends DisplayObjectContainer
 * @param {number} value
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.HeaderSegment = function HeaderSegment(value,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this._action = value;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._frontElement = null;
    this._backElement = null;
    this._middlePosition = Math.round(15 * pixelRatio);
    this._needsUpdate = true;
    this._mask = new PIXI.Graphics();
    this.mask = this._mask;

    this.addChild(this._mask);
};

App.HeaderSegment.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.HeaderSegment.prototype.constructor = App.HeaderSegment;

/**
 * Render
 * @private
 */
App.HeaderSegment.prototype._render = function _render()
{
    var padding = Math.round(10 * this._pixelRatio);

    App.GraphicUtils.drawRect(this._mask,0xff0000,0.5,0,0,this._width,this._height-padding*2);
    this._mask.y = padding;
};

/**
 * Change
 * @param {number} action
 */
App.HeaderSegment.prototype.change = function change(action)
{
    if (this._action === action)
    {
        this._needsUpdate = false;
    }
    else
    {
        var tempIcon = this._frontElement;
        this._frontElement = this._backElement;
        this._backElement = tempIcon;

        this._needsUpdate = true;
    }

    this._action = action;
};

/**
 * Update
 * @param {number} progress
 */
App.HeaderSegment.prototype.update = function update(progress)
{
    if (this._needsUpdate)
    {
        this._frontElement.y = Math.round((this._middlePosition + this._frontElement.height) * progress - this._frontElement.height);
        this._backElement.y = Math.round(this._middlePosition + (this._height - this._middlePosition) * progress);
    }
};

/**
 * Return action
 * @returns {number}
 */
App.HeaderSegment.prototype.getAction = function getAction()
{
    return this._action;
};
