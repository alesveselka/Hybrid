App.ReportAccountButton = function ReportAccountButton(model,width,height,pixelRatio)
{
    App.ExpandButton.call(this,width,height);

    var FontStyle = App.FontStyle,
        ReportCategoryButton = App.ReportCategoryButton;

    this._model = model;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._buttonsInTransition = [];
    this._interactiveButton = null;

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
 * Disable interaction
 * @private
 */
App.ReportAccountButton.prototype.disable = function disable()
{
    App.ExpandButton.prototype._unRegisterEventListeners.call(this);

    var i = 0,
        l = this._categoryList.children.length,
        EventType = App.EventType,
        button = null;

    for (;i<l;)
    {
        button = this._categoryList.getChildAt(i++);
        button.removeEventListener(EventType.START,this,this._onButtonTransitionStart);
        button.removeEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
    }
};

/**
 * Click handler
 * @param {PIXI.InteractionData} pointerData
 */
App.ReportAccountButton.prototype.onClick = function onClick(pointerData)
{
    var position = pointerData.getLocalPosition(this).y;

    var TransitionState = App.TransitionState,
        EventType = App.EventType;

    // Click on button itself
    if (position <= this._height)
    {
        if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING) this.open();
        else if (this._transitionState === TransitionState.OPEN || this._transitionState === TransitionState.OPENING) this.close();
    }
    // Click on category sub-list
    else if (position > this._height)
    {
        this._interactiveButton = this._getButtonUnderPosition(position);

        if (this._buttonsInTransition.indexOf(this._interactiveButton) === -1)
        {
            this._buttonsInTransition.push(this._interactiveButton);

            this._interactiveButton.addEventListener(EventType.START,this,this._onButtonTransitionStart);
            this._interactiveButton.addEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);
        }

        this._interactiveButton.onClick(position);
    }
};

/**
 * On button layout update
 * @private
 */
App.ReportAccountButton.prototype._onButtonTransitionStart = function _onButtonTransitionStart()
{
    this._eventDispatcher.dispatchEvent(App.EventType.START);
};

/**
 * On button transition complete
 * @param {App.ExpandButton} button
 * @private
 */
App.ReportAccountButton.prototype._onButtonTransitionComplete = function _onButtonTransitionComplete(button)
{
    var i = 0,
        l = this._buttonsInTransition.length,
        EventType = App.EventType;

    button.removeEventListener(EventType.START,this,this._onButtonTransitionStart);
    button.removeEventListener(EventType.COMPLETE,this,this._onButtonTransitionComplete);

    for (;i<l;i++)
    {
        if (button === this._buttonsInTransition[i])
        {
            this._buttonsInTransition.splice(i,1);
            break;
        }
    }

    if (this._buttonsInTransition.length === 0)
    {
        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this);

        this._interactiveButton = null;
    }
};

/**
 * Update layout
 * @param {boolean} [complete=false]
 * @private
 */
App.ReportAccountButton.prototype.updateLayout = function updateLayout(complete)
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

    for (;i<l;)
    {
        if (this._categoryList.getChildAt(i++).isInTransition())
        {
            inTransition = true;
            break;
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
        if (buttonY <= position && buttonY + height >= position)
        {
            return button;
        }
    }

    return null;
};
