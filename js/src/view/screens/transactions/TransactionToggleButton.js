App.TransactionToggleButton = function TransactionToggleButton(iconName,label,options,toggleStyle)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,options.height);

    this._pixelRatio = options.pixelRatio;
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._label = new PIXI.Text(label,options.style);
    this._toggleStyle = toggleStyle;
    this._toggle = false;
    this._iconResizeRatio = Math.round(20 * this._pixelRatio) / this._icon.height;

    this._render();

    this.addChild(this._icon);
    this.addChild(this._label);
};

App.TransactionToggleButton.prototype = Object.create(PIXI.Graphics.prototype);
App.TransactionToggleButton.prototype.constructor = App.TransactionToggleButton;

/**
 * Render
 * @private
 */
App.TransactionToggleButton.prototype._render = function _render()
{
    var r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        gap = Math.round(10 * r);

    if (this._toggle)
    {

    }
    else
    {
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.x = Math.round((w - this._icon.width - gap - this._label.width) / 2);
        this._icon.y = Math.round((h - this._icon.height) / 2);
        this._icon.tint = App.ColorTheme.BLUE;

        this._label.x = Math.round(this._icon.x + this._icon.width + gap);
        this._label.y = Math.round((h - this._label.height) / 2);
    }
};

/**
 * Toggle
 */
App.TransactionToggleButton.prototype.toggle = function toggle()
{
    this._toggle = !this._toggle;

    this._render();
};
