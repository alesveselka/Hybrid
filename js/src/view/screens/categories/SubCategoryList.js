App.SubCategoryList = function SubCategoryList(category,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    var subs = ["Cinema","Theatre","Gallery"],
        SubCategoryButton = App.SubCategoryButton,
        i = 0,
        l = subs.length;

    this.boundingBox = new App.Rectangle(0,0,width,0);

    this._category = category;
    this._width = width;
    this._pixelRatio = pixelRatio;
    this._header = new App.ListHeader("Sub-Categories",width,pixelRatio);
    this._subButtons = new Array(l);
    this._addNewButton = new App.AddNewButton(
        "ADD SUB-CATEGORY",
        {font:Math.round(14 * pixelRatio)+"px HelveticaNeueCond",fill:"#cccccc"},
        width,
        Math.round(40 * pixelRatio),
        pixelRatio
    );

    for (;i<l;i++) this._subButtons[i] = new SubCategoryButton(subs[i],width,pixelRatio);

    this._render();

    this.addChild(this._header);
    for (i=0;i<l;) this.addChild(this._subButtons[i++]);
    this.addChild(this._addNewButton);
};

App.SubCategoryList.prototype = Object.create(PIXI.Graphics.prototype);
App.SubCategoryList.prototype.constructor = App.SubCategoryList;

/**
 * Update layout
 * @private
 */
App.SubCategoryList.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        lastButton = this._subButtons[this._subButtons.length-1],
        padding = Math.round(10 * this._pixelRatio),
        r = Math.round(this._pixelRatio),
        w = this.boundingBox.width;

    App.LayoutUtils.update(this._subButtons,App.Direction.Y,this._header.height);

    this._addNewButton.y = lastButton.y + lastButton.boundingBox.height;

    this.boundingBox.height = this._addNewButton.y + this._addNewButton.boundingBox.height;
};
