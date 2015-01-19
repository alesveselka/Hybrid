/**
 * @class TilePane
 * @extends Pane
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.TilePane = function TilePane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio)
{
    App.Pane.call(this,xScrollPolicy,yScrollPolicy,width,height,pixelRatio);
};

App.TilePane.prototype = Object.create(App.Pane.prototype);
App.TilePane.prototype.constructor = App.TilePane;

/**
 * Set content of the pane
 *
 * @method setContent
 * @param {TileList} content
 */
App.TilePane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = Math.round(this._content.boundingBox.height);
    this._contentWidth = Math.round(this._content.boundingBox.width);

    this.addChildAt(this._content,0);

    this._updateScrollers();
};

/**
 * Resize
 *
 * @param {number} width
 * @param {number} height
 */
App.TilePane.prototype.resize = function resize(width,height)
{
    this._width = width || this._width;
    this._height = height || this._height;

    if (this._content)
    {
        this._contentHeight = Math.round(this._content.boundingBox.height);
        this._contentWidth = Math.round(this._content.boundingBox.width);

        if (this._content.x > 0) this._updateX(0);
        else if (this._content.y > 0) this._updateY(0);
        else if (this._contentWidth > this._width && this._content.x + this._contentWidth < this._width) this._updateX(this._width - this._contentWidth);
        else if (this._contentHeight > this._height && this._content.y + this._contentHeight < this._height) this._updateY(this._height - this._contentHeight);

        this._updateScrollers();
    }
};

/**
 * Update content's x position
 * @param {number} position
 * @private
 */
App.TilePane.prototype._updateX = function _updateX(position)
{
    this._content.updateX(position);
};

/**
 * Update content's y position
 * @param {number} position
 * @private
 */
App.TilePane.prototype._updateY = function _updateY(position)
{
    this._content.updateY(position);
};
