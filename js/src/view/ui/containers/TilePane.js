/**
 * @class TilePane
 * @extends {Pane}
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
 * Update content's x position
 * @param {number} position
 * @private
 */
App.Pane.prototype._updateX = function _updateX(position)
{
    this._content.update(position);
};

/**
 * Update content's y position
 * @param {number} position
 * @private
 */
App.Pane.prototype._updateY = function _updateY(position)
{
    this._content.update(position);
};
