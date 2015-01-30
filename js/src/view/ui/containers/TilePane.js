/**
 * @class TilePane
 * @extends Pane
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @param {boolean} useMask
 * @constructor
 */
App.TilePane = function TilePane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio,useMask)
{
    App.Pane.call(this,xScrollPolicy,yScrollPolicy,width,height,pixelRatio,useMask);
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
    this._contentBoundingBox.width = this._contentWidth;
    this._contentBoundingBox.height = this._contentHeight;

    this.addChildAt(this._content,0);

    this._updateScrollers();
    if (this._useMask) this._updateMask();
};

/**
 * Resize
 *
 * @param {number} width
 * @param {number} height
 */
App.TilePane.prototype.resize = function resize(width,height)
{
    this.boundingBox.width = width || this.boundingBox.width;
    this.boundingBox.height = height || this.boundingBox.height;

    if (this._content)
    {
        this._contentHeight = Math.round(this._content.boundingBox.height);
        this._contentWidth = Math.round(this._content.boundingBox.width);
        this._contentBoundingBox.width = this._contentWidth;
        this._contentBoundingBox.height = this._contentHeight;

        this._checkPosition();

        this._updateScrollers();
        if (this._useMask) this._updateMask();
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
