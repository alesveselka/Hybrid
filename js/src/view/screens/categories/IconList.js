App.IconList = function IconList(model,width,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        icons = ModelLocator.getProxy(ModelName.ICONS),
        InfiniteList = App.InfiniteList,
        IconSample = App.IconSample,
        Direction = App.Direction,
        height = Math.round(64 * pixelRatio),
//        i = 0,
        l = icons.length,
        topIcons = icons.slice(0,Math.floor(l/2)),
        bottomIcons = icons.slice(Math.ceil(l/2));

    console.log(topIcons,topIcons.length);
    console.log(bottomIcons,bottomIcons.length);

    this.boundingBox = new App.Rectangle(0,0,width,height*2);

    this._topList = new InfiniteList(topIcons,IconSample,Direction.X,width,height,pixelRatio);
    this._bottomList = new InfiniteList(bottomIcons,IconSample,Direction.X,width,height,pixelRatio);

    this._updateLayout();

    this.addChild(this._topList);
    this.addChild(this._bottomList);
};

App.IconList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.IconList.prototype.constructor = App.IconList;

/**
 * Update layout
 * @private
 */
App.IconList.prototype._updateLayout = function _updateLayout()
{
    this._bottomList.y = this._topList.boundingBox.height;
};

/**
 * Enable
 */
App.IconList.prototype.enable = function enable()
{
    this._topList.enable();
    this._bottomList.enable();
};

/**
 * Disable
 */
App.IconList.prototype.disable = function disable()
{
    this._topList.disable();
    this._bottomList.disable();
};
