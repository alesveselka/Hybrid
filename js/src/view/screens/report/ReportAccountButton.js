App.ReportAccountButton = function ReportAccountButton(model,width,height,pixelRatio)
{
    App.ExpandButton.call(this,width,height);

    var FontStyle = App.FontStyle,
        ReportCategoryButton = App.ReportCategoryButton;

    this._model = model;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;

    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text(model,FontStyle.get(22,FontStyle.WHITE));
    this._amountField = new PIXI.Text("1,560.00",FontStyle.get(16,FontStyle.WHITE));
    this._categoryList = new App.List(App.Direction.Y);
    this._categoryList.add(new ReportCategoryButton("Entertainment",width,Math.round(40 * pixelRatio),pixelRatio),false);
    this._categoryList.add(new ReportCategoryButton("Food",width,Math.round(40 * pixelRatio),pixelRatio),false);
    this._categoryList.add(new ReportCategoryButton("Household",width,Math.round(40 * pixelRatio),pixelRatio),false);
    this._categoryList.add(new ReportCategoryButton("Shopping",width,Math.round(40 * pixelRatio),pixelRatio),true);

    this._render();

    this._setContent(this._categoryList);
    this.addChild(this._categoryList);
    this.addChild(this._background);
    this.addChild(this._nameField);
    this.addChild(this._amountField);
};

App.ReportAccountButton.prototype = Object.create(App.ExpandButton.prototype);
App.ReportAccountButton.prototype.constructor = App.ReportAccountButton;

/**
 * Render
 * @private
 */
App.ReportAccountButton.prototype._render = function _render()
{
    var GraphicUtils = App.GraphicUtils,
        ColorTheme = App.ColorTheme;

    GraphicUtils.drawRects(this._background,ColorTheme.BLUE,1,[0,0,this._width,this._height],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.BLUE_DARK,1,[0,this._height-1,this._width,1],false,true);

    this._nameField.x = Math.round(10 * this._pixelRatio);
    this._nameField.y = Math.round((this._height - this._nameField.height) / 2);

    this._amountField.x = Math.round(this._width - this._amountField.width - 10 * this._pixelRatio);
    this._amountField.y = Math.round((this._height - this._amountField.height) / 2);
};

/**
 * Click handler
 * @param {PIXI.InteractionData} pointerData
 */
App.ReportAccountButton.prototype.onClick = function onClick(pointerData)
{
    var position = pointerData.getLocalPosition(this).y,
        TransitionState = App.TransitionState,
        interactiveButton = null;

    // Click on button itself
    if (position <= this._height)
    {
        if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open();
        else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close();
    }
    // Click on category sub-list
    else if (position > this._height)
    {
        interactiveButton = this._getButtonUnderPosition(position);
        if (interactiveButton) interactiveButton.onClick(position);
    }
};

/**
 * Update layout
 * @private
 */
App.ReportAccountButton.prototype.updateLayout = function updateLayout()
{
    this._categoryList.updateLayout();
    this._updateBounds(true);
    this._updateMask();
};

/**
 * Check if button is in transition
 * @returns {boolean}
 */
App.ReportAccountButton.prototype.isInTransition = function isInTransition()
{
    var inTransition = App.ExpandButton.prototype.isInTransition.call(this),
        i = 0,
        l = this._categoryList.children.length;

    if (this.isOpen())
    {
        for (;i<l;)
        {
            if (this._categoryList.getChildAt(i++).isInTransition())
            {
                inTransition = true;
                break;
            }
        }
    }

    return inTransition;
};

/**
 * Find button under point passed in
 * @param {number} position
 * @private
 */
App.ReportAccountButton.prototype._getButtonUnderPosition = function _getButtonUnderPosition(position)
{
    var i = 0,
        l = this._categoryList.children.length,
        height = 0,
        buttonY = 0,
        containerY = this._categoryList.y,
        button = null;

    for (;i<l;)
    {
        button = this._categoryList.getChildAt(i++);
        buttonY = button.y + containerY;
        height = button.boundingBox.height;
        if (buttonY <= position && buttonY + height > position)
        {
            return button;
        }
    }

    return null;
};
