App.SubCategoryButton = function SubCategoryButton(label,width,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,Math.round(40*pixelRatio));

    this._label = label;
    this._pixelRatio = pixelRatio;
    this._labelField = new PIXI.Text(label,{font:Math.round(14 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});

    this._render();

    this.addChild(this._labelField);
};

App.SubCategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.SubCategoryButton.prototype.constructor = App.SubCategoryButton;

/**
 * Render
 * @private
 */
App.SubCategoryButton.prototype._render = function _render()
{
    this._labelField.x = Math.round(20 * this._pixelRatio);
    this._labelField.y = Math.round((this.boundingBox.height - this._labelField.height) / 2);
};
