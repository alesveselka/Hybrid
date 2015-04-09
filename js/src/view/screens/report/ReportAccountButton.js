/**
 * @class ReportAccountButton
 * @extends ExpandButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {Object} options.labelStyles
 * @param {App.ObjectPool} options.categoryButtonPool
 * @constructor
 */
App.ReportAccountButton = function ReportAccountButton(poolIndex,options)
{
    App.ExpandButton.call(this,options.width,options.height,true);

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._height = options.height;
    this._pixelRatio = options.pixelRatio;
    this._buttonPool = options.categoryButtonPool;

    this._background = this.addChild(new PIXI.Graphics());
    this._nameField = this.addChild(new PIXI.Text("",options.labelStyles.name));
    this._amountField = this.addChild(new PIXI.Text("",options.labelStyles.amount));
    this._categoryList = new App.List(App.Direction.Y);
    this._interactiveButton = null;
    this._renderAll = true;
    this._updated = false;

    this._setContent(this._categoryList);
    this.addChild(this._categoryList);
};

App.ReportAccountButton.prototype = Object.create(App.ExpandButton.prototype);

/**
 * Render
 * @private
 */
App.ReportAccountButton.prototype._render = function _render()
{
    var w = this.boundingBox.width;

    if (this._renderAll)
    {
        this._renderAll = false;

        var GraphicUtils = App.GraphicUtils,
            ColorTheme = App.ColorTheme,
            h = this.boundingBox.height;

        GraphicUtils.drawRects(this._background,ColorTheme.BLUE,1,[0,0,w,h],true,false);
        GraphicUtils.drawRects(this._background,ColorTheme.BLUE_DARK,1,[0,h-1,w,1],false,true);

        this._nameField.x = Math.round(10 * this._pixelRatio);
        this._nameField.y = Math.round((h - this._nameField.height) / 2);

        this._amountField.y = Math.round((h - this._amountField.height) / 2);
    }

    this._amountField.x = Math.round(w - this._amountField.width - 10 * this._pixelRatio);
};

/**
 * Set model
 * @param {App.Account} model
 */
App.ReportAccountButton.prototype.setModel = function setModel(model)
{
    this._updated = false;

    this._model = model;

    this.close(true);

    this._nameField.setText(this._model.name);
    this._amountField.setText(App.StringUtils.formatNumber(Math.abs(this._model.balance),2,","));

    this._render();
};

/**
 * Return button's model
 * @returns {App.Account}
 */
App.ReportAccountButton.prototype.getModel = function getModel()
{
    return this._model;
};

/**
 * Update
 */
App.ReportAccountButton.prototype._update = function _update()
{
    this._updated = true;

    var i = 0,
        l = this._categoryList.length,
        accountBalance = this._model.balance,
        categories = this._model.categories,
        category = null,
        button = null;

    for (;i<l;i++) this._buttonPool.release(this._categoryList.removeItemAt(0));

    for (i=0,l=categories.length;i<l;)
    {
        category = categories[i++];
        button = this._buttonPool.allocate();
        button.setModel(category,accountBalance);
        this._categoryList.add(button);
    }
    this._categoryList.updateLayout();
};

/**
 * Close opened buttons
 * @private
 */
App.ReportAccountButton.prototype._closeButtons = function _closeButtons(immediate)
{
    var i = 0,
        l = this._categoryList.children.length,
        button = null;

    for (;i<l;)
    {
        button = this._categoryList.getChildAt(i++);
        if (button !== this._interactiveButton && button.isOpen()) button.close(immediate);
    }
};

/**
 * Click handler
 * @param {PIXI.InteractionData} pointerData
 */
App.ReportAccountButton.prototype.onClick = function onClick(pointerData)
{
    var position = pointerData.getLocalPosition(this).y,
        TransitionState = App.TransitionState;

    // Click on button itself
    if (position <= this._height)
    {
        if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
        {
            this.open();
        }
        else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING)
        {
            this.close(false,true);
        }

        return null;
    }
    // Click on category sub-list
    else if (position > this._height)
    {
        this._interactiveButton = this._categoryList.getItemUnderPoint(pointerData);
        if (this._interactiveButton)
        {
            this._interactiveButton.onClick(position);
            this._closeButtons();

            return this._interactiveButton;
        }
    }

    return null;
};

/**
 * Open
 */
App.ReportAccountButton.prototype.open = function open()
{
    if (!this._updated) this._update();

    this._interactiveButton = null;
    this._closeButtons(true);

    App.ExpandButton.prototype.open.call(this,true);
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
