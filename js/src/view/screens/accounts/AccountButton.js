/**
 * @class AccountButton
 * @extends Graphics
 * @param {Account} model
 * @param {Object} layout
 * @constructor
 */
App.AccountButton = function AccountButton(model,layout,index)
{
    PIXI.Graphics.call(this);

    this._model = model;
    this._layout = layout;

    var pixelRatio = this._layout.pixelRatio,
        height = Math.round(70 * pixelRatio);

    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,height);

    //TODO move texts and their settings objects into pools?
    this._nameLabel = new PIXI.Text(this._model.getName()+" "+index,{font:Math.round(24 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});
    this._nameLabel.x = Math.round(15 * pixelRatio);
    this._nameLabel.y = Math.round(15 * pixelRatio);

    this._detailsLabel = new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",{font:Math.round(12 * pixelRatio)+"px Arial",fill:"#999999"});
    this._detailsLabel.x = Math.round(15 * pixelRatio);
    this._detailsLabel.y = Math.round(45 * pixelRatio);

    this.addChild(this._nameLabel);
    this.addChild(this._detailsLabel);

    this.interactive = true;

    this._render();
};

App.AccountButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method _resize
 * @param {number} width
 */
App.AccountButton.prototype.resize = function resize(width)
{
    this.boundingBox.width = width;

    this._render();
};

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    //TODO cache this as texture?

    var padding = Math.round(10 * this._layout.pixelRatio);

    this.clear();
    this.beginFill(0xefefef);
    this.drawRect(0,0,this.boundingBox.width,this.boundingBox.height);
    this.beginFill(0xffffff);
    this.drawRect(padding,0,this.boundingBox.width-padding*2,1);
    this.beginFill(0xcccccc);
    this.drawRect(padding,this.boundingBox.height-1,this.boundingBox.width-padding*2,1);
    this.endFill();
};

/**
 * Destroy
 */
App.AccountButton.prototype.destroy = function destroy()
{
    this.clear();

    this.interactive = false;

    this._layout = null;
    this._model = null;

    this.boundingBox = null;

    this.removeChild(this._nameLabel);
    this._nameLabel = null;

    this.removeChild(this._detailsLabel);
    this._detailsLabel = null;
};
