/**
 * @class SubCategoryList
 * @extends Graphics
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Texture} options.skin
 * @param {{font:string,fill:string}} options.nameLabelStyle
 * @param {{font:string,fill:string}} options.deleteLabelStyle
 * @param {{font:string,fill:string}} options.addLabelStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.SubCategoryList = function SubCategoryList(options)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,options.width,0);

    this._model = null;
    this._mode = null;
    this._width = options.width;
    this._pixelRatio = options.pixelRatio;
    this._header = new App.ListHeader("Sub-Categories",options.width,options.pixelRatio);
    this._interactiveButton = null;
    this._buttonList = new App.List(App.Direction.Y);
    this._addNewButton = new App.AddNewButton("ADD SUB-CATEGORY",options.addLabelStyle,App.ViewLocator.getViewSegment(App.ViewName.SKIN).WHITE_40,this._pixelRatio);

    this.addChild(this._header);
    this.addChild(this._buttonList);
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
    this._buttonList.y = this._header.height;

    this._addNewButton.y = this._buttonList.y + this._buttonList.boundingBox.height;

    this.boundingBox.height = this._addNewButton.y + this._addNewButton.boundingBox.height;
};

/**
 * @method update
 * @param {App.Category} model
 * @param {string} mode
 */
App.SubCategoryList.prototype.update = function update(model,mode)
{
    this._model = model;

    var subCategories = model.subCategories,
        buttonPool = App.ViewLocator.getViewSegment(App.ViewName.SUB_CATEGORY_BUTTON_POOL),
        i = 0,
        l = this._buttonList.length,
        modelLength = subCategories.length,
        button = null;

    if (l >= modelLength)
    {
        for (;i<l;i++)
        {
            if (i < modelLength) this._buttonList.getItemAt(i).update(subCategories[i],mode);
            else buttonPool.release(this._buttonList.removeItemAt(i));
        }
    }
    else
    {
        for (;i<modelLength;)
        {
            button = buttonPool.allocate();
            button.update(subCategories[i++],mode);
            this._buttonList.add(button,false);
        }
    }
    this._buttonList.updateLayout();

    this._render();

    this._mode = mode;
};

/**
 * Called when swipe starts
 * @param {string} direction
 * @private
 */
App.SubCategoryList.prototype.swipeStart = function swipeStart(direction)
{
    this._interactiveButton = this._buttonList.getItemUnderPoint(this.stage.getTouchData());
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this.closeButtons(false);
};

/**
 * Called when swipe ends
 * @private
 */
App.SubCategoryList.prototype.swipeEnd = function swipeEnd()
{
    if (this._interactiveButton)
    {
        this._interactiveButton.swipeEnd();
        this._interactiveButton = null;
    }
};

/**
 * Close opened buttons
 * @private
 */
App.SubCategoryList.prototype.closeButtons = function closeButtons(immediate)
{
    var i = 0,
        l = this._buttonList.length,
        button = null;

    for (;i<l;)
    {
        button = this._buttonList.getItemAt(i++);
        if (button !== this._interactiveButton) button.close(immediate);
    }
};
