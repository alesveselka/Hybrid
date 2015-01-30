App.Header = function Header(layout)
{
    PIXI.Graphics.call(this);

    this._layout = layout;

    this._render();
};

App.Header.prototype = Object.create(PIXI.Graphics.prototype);
App.Header.prototype.constructor = App.Header;

/**
 * Render
 * @private
 */
App.Header.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme,
        w = this._layout.width,
        h = this._layout.headerHeight;

    GraphicUtils.drawRects(this,ColorTheme.BLUE,1,[0,0,w,h],true,false);
    GraphicUtils.drawRects(this,ColorTheme.BLUE_DARK,1,[0,h-1,w,1],false,true);
};
