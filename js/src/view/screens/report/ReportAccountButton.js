/**
 * @class ReportAccountButton
 * @extends ExpandButton
 * @param {number} poolIndex
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {{font:string,fill:string}} options.nameStyle
 * @param {{font:string,fill:string}} options.detailStyle
 * @param {{font:string,fill:string}} options.editStyle
 * @param {number} options.openOffset
 * @constructor
 */
App.ReportAccountButton = function ReportAccountButton(poolIndex,options)
{
    App.ExpandButton.call(this,options.width,options.height,true);

    var ReportCategoryButton = App.ReportCategoryButton,
        itemHeight = Math.round(40 * options.pixelRatio),
        accountLabelStyles = options.accountLabelStyles;

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._width = options.width;//TODO do I need this when i have bounds?
    this._height = options.height;
    this._pixelRatio = options.pixelRatio;
    this._buttonPool = new App.ObjectPool(App.ReportCategoryButton,5,options);//TODO pass in from parent

    this._background = new PIXI.Graphics();
    this._nameField = new PIXI.Text("",accountLabelStyles.accountName);
    this._amountField = new PIXI.Text("",accountLabelStyles.accountAmount);
    this._categoryList = new App.List(App.Direction.Y);
//    this._categoryList.add(new ReportCategoryButton("Entertainment",width,itemHeight,pixelRatio,labelStyles),false);
//    this._categoryList.add(new ReportCategoryButton("Food",width,itemHeight,pixelRatio,labelStyles),false);
//    this._categoryList.add(new ReportCategoryButton("Household",width,itemHeight,pixelRatio,labelStyles),false);
//    this._categoryList.add(new ReportCategoryButton("Shopping",width,itemHeight,pixelRatio,labelStyles),true);

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

    //TODO use skin instead
    GraphicUtils.drawRects(this._background,ColorTheme.BLUE,1,[0,0,this._width,this._height],true,false);
    GraphicUtils.drawRects(this._background,ColorTheme.BLUE_DARK,1,[0,this._height-1,this._width,1],false,true);

    this._nameField.x = Math.round(10 * this._pixelRatio);
    this._nameField.y = Math.round((this._height - this._nameField.height) / 2);

    this._amountField.x = Math.round(this._width - this._amountField.width - 10 * this._pixelRatio);
    this._amountField.y = Math.round((this._height - this._amountField.height) / 2);
};

/**
 * Set model
 * @param {App.Account} model
 */
App.ReportAccountButton.prototype.setModel = function setModel(model)
{
    this._model = model;

    this.close(true);
    this._update();
};

/**
 * Update
 * @private
 */
App.ReportAccountButton.prototype._update = function _update()
{
    this._nameField.setText(this._model.name);

    var i = 0,
        l = this._categoryList.length,
        categories = this._model.categories,
        category = null,
        button = null;

    for (;i<l;i++) this._buttonPool.release(this._categoryList.removeItemAt(0));

    for (i=0,l=categories.length;i<l;)
    {
        category = categories[i++];
        button = this._buttonPool.allocate();
        button.setModel(category);
        this._categoryList.add(button);
    }
    this._categoryList.updateLayout();
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
        if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open(true);
        else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close(false,true);
    }
    // Click on category sub-list
    else if (position > this._height)
    {
        interactiveButton = this._categoryList.getItemUnderPoint(pointerData);
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
