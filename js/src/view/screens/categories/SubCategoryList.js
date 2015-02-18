/**
 * @class SubCategoryList
 * @extends Graphics
 * @param {number} width
 * @param {number} pixelRatio
 * @constructor
 */
App.SubCategoryList = function SubCategoryList(width,pixelRatio)
{
    PIXI.Graphics.call(this);

    this.boundingBox = new App.Rectangle(0,0,width,0);

    this._model = null;
    this._mode = null;
    this._width = width;
    this._pixelRatio = pixelRatio;
    this._header = new App.ListHeader("Sub-Categories",width,pixelRatio);
    this._interactiveButton = null;
    this._buttonList = new App.List(App.Direction.Y);
    this._addNewButton = new App.AddNewButton(
        "ADD SUB-CATEGORY",
        App.FontStyle.get(14,App.FontStyle.SHADE_DARK),
        width,
        Math.round(40 * pixelRatio),
        pixelRatio
    );

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
//    var lastButton = this._subButtons[this._subButtons.length-1];

//    App.LayoutUtils.update(this._subButtons,App.Direction.Y,this._header.height);

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
