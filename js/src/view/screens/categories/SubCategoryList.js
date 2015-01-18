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
    this._interactiveButton = null;
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

/**
 * Called when swipe starts
 * @param {string} direction
 * @private
 */
App.SubCategoryList.prototype.swipeStart = function swipeStart(direction)
{
    this._interactiveButton = this._getButtonUnderPosition(this.stage.getTouchData().getLocalPosition(this).y);
    if (this._interactiveButton) this._interactiveButton.swipeStart(direction);

    this._closeButtons(false);
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
App.SubCategoryList.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._subButtons.length,
        button = null;

    for (;i<l;)
    {
        button = this._subButtons[i++];
        if (button !== this._interactiveButton) button.close(immediate);
    }
};

/**
 * Find button under position passed in
 * @param {number} position
 * @private
 */
App.SubCategoryList.prototype._getButtonUnderPosition = function _getButtonUnderPosition(position)
{
    var i = 0,
        l = this._subButtons.length,
        height = 0,
        buttonY = 0,
        button = null;

    for (;i<l;)
    {
        button = this._subButtons[i++];
        buttonY = button.y;
        height = button.boundingBox.height;
        if (buttonY <= position && buttonY + height >= position)
        {
            return button;
        }
    }

    return null;
};
