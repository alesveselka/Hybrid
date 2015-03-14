/**
 * @class TransactionToggleButton
 * @extends Button
 * @param {string} iconName
 * @param {string} label
 * @param {{width:number,height:number,pixelRatio:number,style:Object,toggleStyle:Object}} options
 * @param {{icon:string,label:string,toggleColor:boolean}} toggleOptions
 * @constructor
 */
App.TransactionToggleButton = function TransactionToggleButton(iconName,label,options,toggleOptions)
{
    this._iconName = iconName;
    this._toggleStyle = options.toggleStyle;
    this._toggleOptions = toggleOptions;
    this._icon = PIXI.Sprite.fromFrame(iconName);
    this._selected = false;
    this._iconResizeRatio = Math.round(20 * options.pixelRatio) / this._icon.height;

    App.Button.call(this,label,options);

    this._render(true);

    this.addChild(this._icon);
};

App.TransactionToggleButton.prototype = Object.create(App.Button.prototype);
App.TransactionToggleButton.prototype.constructor = App.TransactionToggleButton;

/**
 * Render
 * @param {boolean} [updateAll=false]
 * @private
 */
App.TransactionToggleButton.prototype._render = function _render(updateAll)
{
    var r = this._pixelRatio,
        w = this.boundingBox.width,
        h = this.boundingBox.height,
        gap = Math.round(10 * r),
        padding = Math.round(5 * r);

    if (this._selected)
    {
        if (this._toggleOptions.icon) this._icon.setTexture(PIXI.TextureCache[this._toggleOptions.icon]);
        if (this._toggleOptions.label) this._labelField.setText(this._toggleOptions.label);
        if (this._toggleOptions.toggleColor)
        {
            this._icon.tint = 0xFFFFFE;
            this._labelField.setStyle(this._toggleStyle);

            this.clear();
            this.beginFill(App.ColorTheme.BLUE);
            this.drawRoundedRect(padding,padding,w-padding*2,h-padding*2,padding);
            this.endFill();
        }
    }
    else
    {
        if (this._toggleOptions.icon) this._icon.setTexture(PIXI.TextureCache[this._iconName]);
        if (this._toggleOptions.label) this._labelField.setText(this._label);
        if (this._toggleOptions.toggleColor)
        {
            this._icon.tint = App.ColorTheme.BLUE;
            this._labelField.setStyle(this._style);

            this.clear();
        }
    }

    if (updateAll)
    {
        this._icon.scale.x = this._iconResizeRatio;
        this._icon.scale.y = this._iconResizeRatio;
        this._icon.y = Math.round((h - this._icon.height) / 2);
        this._icon.tint = App.ColorTheme.BLUE;

        this._labelField.y = Math.round((h - this._labelField.height) / 2);
    }

    this._icon.x = Math.round((w - this._icon.width - gap - this._labelField.width) / 2);
    this._labelField.x = Math.round(this._icon.x + this._icon.width + gap);
};

/**
 * Toggle
 */
App.TransactionToggleButton.prototype.toggle = function toggle()
{
    this._selected = !this._selected;

    this._render(false);
};

/**
 * Set selection state
 * @param {boolean} value
 */
App.TransactionToggleButton.prototype.setState = function setState(value)
{
    this._selected = value;

    this._render(false);
};

/**
 * Is button selected?
 * @returns {boolean}
 */
App.TransactionToggleButton.prototype.isSelected = function isSelected()
{
    return this._selected;
};
