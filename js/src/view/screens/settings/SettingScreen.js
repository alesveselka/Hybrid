/**
 * @class SettingScreen
 * @extends Screen
 * @param {Object} layout
 * @constructor
 */
App.SettingScreen = function SettingScreen(layout)
{
    App.Screen.call(this,layout,0.4);

    var TransactionOptionButton = App.TransactionOptionButton,//TODO refactor to 'OptionButton'?
        FontStyle = App.FontStyle,
        skin = App.ViewLocator.getViewSegment(App.ViewName.SKIN),
        r = layout.pixelRatio,
        w = layout.width,
        inputWidth = w - Math.round(10 * r) * 2,
        options = {
            pixelRatio:r,
            width:w,
            height:Math.round(50 * r),
            skin:skin.GREY_50,
            nameStyle:FontStyle.get(18,FontStyle.GREY_DARKER,null,FontStyle.LIGHT_CONDENSED),
            valueStyle:FontStyle.get(18,FontStyle.BLUE,"right"),
            valueDetailStyle:FontStyle.get(14,FontStyle.BLUE)
        };

    this._model = App.ModelLocator.getProxy(App.ModelName.SETTINGS);

    this._container = new PIXI.DisplayObjectContainer();
    this._list = this._container.addChild(new App.List(App.Direction.Y));
    this._weekDayOption = this._list.add(new TransactionOptionButton("calendar","Start Of Week",options));
    this._baseCurrencyOption = this._list.add(new TransactionOptionButton("currencies","Base Currency",options));
    this._defaultCurrencyOption = this._list.add(new TransactionOptionButton("currencies","Default Currency",options));
    this._defaultAccountOption = this._list.add(new TransactionOptionButton("account","Default Account",options));
    this._defaultCategoryOption = this._list.add(new TransactionOptionButton("folder-app","Default Category",options));
    this._defaultSubCategoryOption = this._list.add(new TransactionOptionButton("subcategory-app","Default SubCategory",options));
    this._defaultMethodOption = this._list.add(new TransactionOptionButton("credit-card","Default Payment",options),true);
    this._deleteBackground = this._container.addChild(new PIXI.Sprite(skin.GREY_60));
    this._deleteButton = this._container.addChild(new App.PopUpButton("Delete All Transactions","Are you sure you want to\ndelete all transactions?",{
        width:inputWidth,
        height:Math.round(40 * r),
        pixelRatio:r,
        popUpLayout:{x:Math.round(10*r),y:0,width:Math.round(inputWidth-20*r),height:Math.round(layout.height/2),overlayWidth:w,overlayHeight:0}
    }));
    this._pane = this.addChild(new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,w,layout.contentHeight,r,true));
    this._pane.setContent(this._container);

    this._updateLayout();

    this._clickThreshold = 10 * r;
};

App.SettingScreen.prototype = Object.create(App.Screen.prototype);

/**
 * Render
 * @private
 */
App.SettingScreen.prototype._updateLayout = function _updateLayout()
{
    var padding = Math.round(10 * this._layout.pixelRatio);

    this._deleteBackground.y = this._list.y + this._list.boundingBox.height;
    this._deleteButton.setPosition(padding,this._deleteBackground.y + padding);

    this._pane.resize();
};

/**
 * Update
 * @private
 */
App.SettingScreen.prototype.update = function update()
{
    this._weekDayOption.setValue(/*this._model.startOfWeek*/"Monday");
    this._baseCurrencyOption.setValue(this._model.baseCurrency);
    this._defaultCurrencyOption.setValue(this._model.defaultCurrencyQuote);
    this._defaultAccountOption.setValue(this._model.defaultAccount.name);
    this._defaultCategoryOption.setValue(this._model.defaultCategory.name);
    this._defaultSubCategoryOption.setValue(this._model.defaultSubCategory.name);
    this._defaultMethodOption.setValue(this._model.defaultPaymentMethod.name);

    this._deleteButton.hidePopUp(true);

    this._pane.resetScroll();
};

/**
 * Hide
 */
App.SettingScreen.prototype.hide = function hide()
{
    this._unRegisterDeleteButtonListeners();

    App.Screen.prototype.hide.call(this);
};

/**
 * Enable
 */
App.SettingScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.enable();
};

/**
 * Disable
 */
App.SettingScreen.prototype.disable = function disable()
{
    App.Screen.prototype.disable.call(this);

    this._pane.disable();
};

/**
 * Register delete button event listeners
 * @private
 */
App.SettingScreen.prototype._registerDeleteButtonListeners = function _registerDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.addEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.addEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.addEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * UnRegister delete button event listeners
 * @private
 */
App.SettingScreen.prototype._unRegisterDeleteButtonListeners = function _unRegisterDeleteButtonListeners()
{
    var EventType = App.EventType;

    this._deleteButton.removeEventListener(EventType.CANCEL,this,this._onDeleteCancel);
    this._deleteButton.removeEventListener(EventType.CONFIRM,this,this._onDeleteConfirm);
    this._deleteButton.removeEventListener(EventType.COMPLETE,this,this._onHidePopUpComplete);
};

/**
 * On delete cancel
 * @private
 */
App.SettingScreen.prototype._onDeleteCancel = function _onDeleteCancel()
{
    this._deleteButton.hidePopUp();

    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On delete confirm
 * @private
 */
App.SettingScreen.prototype._onDeleteConfirm = function _onDeleteConfirm()
{
    // Just temporary for testing
    localStorage.clear();

    this._deleteButton.hidePopUp();
    App.ViewLocator.getViewSegment(App.ViewName.HEADER).enableActions();
};

/**
 * On Delete PopUp hide complete
 * @private
 */
App.SettingScreen.prototype._onHidePopUpComplete = function _onHidePopUpComplete()
{
    this._unRegisterDeleteButtonListeners();

    this.enable();
    this._registerEventListeners(App.EventLevel.LEVEL_2);
};

/**
 * Click handler
 * @private
 */
App.SettingScreen.prototype._onClick = function _onClick()
{
    this._pane.cancelScroll();

    var pointerData = this.stage.getTouchData(),
        position = pointerData.getLocalPosition(this._container).y;

    if (this._list.hitTest(position))
    {
        var button = this._list.getItemUnderPoint(pointerData);
        if (button === this._weekDayOption) this._onAccountOptionClick();
        else if (button === this._baseCurrencyOption) this._onCategoryOptionClick();
        else if (button === this._defaultCurrencyOption) this._onTimeOptionClick();
        else if (button === this._defaultAccountOption) this._onMethodOptionClick();
        else if (button === this._defaultCategoryOption) this._onCurrencyOptionClick();
        else if (button === this._defaultSubCategoryOption) this._onCurrencyOptionClick();
        else if (button === this._defaultMethodOption) this._onCurrencyOptionClick();
    }
    else if (this._deleteButton.hitTest(position))
    {
        this.disable();
        this._unRegisterEventListeners(App.EventLevel.LEVEL_1);
        App.ViewLocator.getViewSegment(App.ViewName.HEADER).disableActions();
        this._registerDeleteButtonListeners();
        this._deleteButton.setPopUpLayout(0,this._container.y + this._layout.headerHeight,0,this._layout.contentHeight > this._container.height ? this._layout.contentHeight : this._container.height);
        this._deleteButton.showPopUp();
    }
};

/**
 * On account option button click
 * @private
 */
App.SettingScreen.prototype._onAccountOptionClick = function _onAccountOptionClick()
{
    /*App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
        App.ScreenName.ACCOUNT,
        App.ScreenMode.SELECT,
        null,
        0,
        App.HeaderAction.NONE,
        App.ScreenTitle.SELECT_ACCOUNT
    ));*/
};

/**
 * On category option button click
 * @private
 */
App.SettingScreen.prototype._onCategoryOptionClick = function _onCategoryOptionClick()
{
    /*var account = this._model.account;
    if (account && account.lifeCycleState !== App.LifeCycleState.DELETED)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
            App.ScreenName.CATEGORY,
            App.ScreenMode.SELECT,
            account,
            0,
            App.HeaderAction.NONE,
            App.ScreenTitle.SELECT_CATEGORY
        ));
    }
    else
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
            App.ScreenName.ACCOUNT,
            App.ScreenMode.SELECT,
            null,
            0,
            App.HeaderAction.NONE,
            App.ScreenTitle.SELECT_ACCOUNT
        ));
    }*/
};

/**
 * On time option button click
 * @private
 */
App.SettingScreen.prototype._onTimeOptionClick = function _onTimeOptionClick()
{
    /*App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
        App.ScreenName.SELECT_TIME,
        App.ScreenMode.SELECT,
        this._model.date,
        0,
        0,
        App.ScreenTitle.SELECT_TIME
    ));*/
};

/**
 * On payment method option button click
 * @private
 */
App.SettingScreen.prototype._onMethodOptionClick = function _onMethodOptionClick()
{
    //this._methodOption.setValue(this._methodOption.getValue() === App.PaymentMethod.CASH ? App.PaymentMethod.CREDIT_CARD : App.PaymentMethod.CASH);
};

/**
 * On currency option button click
 * @private
 */
App.SettingScreen.prototype._onCurrencyOptionClick = function _onCurrencyOptionClick()
{
    /*App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,this._getChangeTransactionData(
        App.ScreenName.CURRENCIES,
        App.ScreenMode.SELECT,
        null,
        0,
        App.HeaderAction.NONE,
        App.ScreenTitle.SELECT_CURRENCY
    ));*/
};

/**
 * On Header click
 * @param {number} action
 * @private
 */
App.SettingScreen.prototype._onHeaderClick = function _onHeaderClick(action)
{
    var HeaderAction = App.HeaderAction,
        changeScreenData = App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate();

    if (action === HeaderAction.ADD_TRANSACTION)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_TRANSACTION,{
            type:App.EventType.CREATE,
            nextCommand:new App.ChangeScreen(),
            nextCommandData:changeScreenData.update()
        });
    }
    else if (action === HeaderAction.MENU)
    {
        App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,changeScreenData.update(
            App.ScreenName.MENU,
            0,
            null,
            HeaderAction.NONE,
            HeaderAction.CANCEL,
            App.ScreenTitle.MENU
        ));
    }
};

/**
 * Construct and return change transaction data object
 * @param {number} screenName
 * @param {number} screenMode
 * @param {*} updateData
 * @param {number} headerLeftAction
 * @param {number} headerRightAction
 * @param {string} headerName
 * @returns {{type:string,amount:string,transactionType:string,pending:boolean,repeat:boolean,method:string,note:string,nextCommand:App.ChangeScreen,nextCommandData:Object}}
 * @private
 */
App.SettingScreen.prototype._getChangeTransactionData = function _getChangeTransactionData(screenName,screenMode,updateData,headerLeftAction,headerRightAction,headerName)
{
    return {
        type:App.EventType.CHANGE,
        amount:this._transactionInput.getValue(),
        transactionType:this._typeToggle.isSelected() ? App.TransactionType.INCOME : App.TransactionType.EXPENSE,
        pending:this._pendingToggle.isSelected(),
        repeat:this._repeatToggle.isSelected(),
        method:this._methodOption.getValue(),
        note:this._noteInput.getValue(),
        nextCommand:new App.ChangeScreen(),
        nextCommandData:App.ModelLocator.getProxy(App.ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(
            screenName,
            screenMode,
            updateData,
            headerLeftAction,
            headerRightAction,
            headerName
        )
    };
};
