App.SubCategoryList = function SubCategoryList(category,width,pixelRatio)
{
    PIXI.Graphics.call(this);

    this._width = width;
    this._pixelRatio = pixelRatio;
    this._header = new App.ListHeader("Sub-Categories",width,pixelRatio);


};

App.SubCategoryList.prototype = Object.create(PIXI.Graphics.prototype);
App.SubCategoryList.prototype.constructor = App.SubCategoryList;
