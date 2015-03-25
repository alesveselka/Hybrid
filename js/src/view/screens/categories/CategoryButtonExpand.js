/**
 * @class CategoryButtonExpand
 * @extends ExpandButton
 * @param {number} poolIndex
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
App.CategoryButtonExpand = function CategoryButtonExpand(poolIndex,options)
{
    App.ExpandButton.call(this,options.width,options.height,true);

    this.allocated = false;
    this.poolIndex = poolIndex;

    this._model = null;
    this._mode = null;
    this._pixelRatio = options.pixelRatio;
    this._surface = new App.CategoryButtonSurface(options);
    this._subCategoryList = new App.SubCategoryList(options);
    this._layoutDirty = true;

    this._setContent(this._subCategoryList);
    this.addChild(this._subCategoryList);
    this.addChild(this._surface);
};

App.CategoryButtonExpand.prototype = Object.create(App.ExpandButton.prototype);
App.CategoryButtonExpand.prototype.constructor = App.CategoryButtonExpand;

/**
 * Render
 * @private
 */
App.CategoryButtonExpand.prototype._render = function _render()
{
    this._surface.render(this._model.name,this._model.icon,this._model.color);
};

/**
 * Update
 * @param {App.Category} model
 * @param {string} mode
 */
App.CategoryButtonExpand.prototype.update = function update(model,mode)
{
    this._model = model;
    this._mode = mode;

    this._layoutDirty = true;

    this._render();

    this.close(true);
};

/**
 * Click handler
 * @param {InteractionData} data
 */
App.CategoryButtonExpand.prototype.onClick = function onClick(data)
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.CLOSED || this._transitionState === TransitionState.CLOSING)
    {
        this.open();
    }
    else
    {
        if (data.getLocalPosition(this).y <= this._buttonHeight)
        {
            this.close();
        }
        else
        {
            this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,this); // To cancel any parent's processes

            var button = this._subCategoryList.getItemUnderPoint(data);

            if (button)
            {
                var ModelLocator = App.ModelLocator,
                    ModelName = App.ModelName,
                    EventType = App.EventType,
                    changeScreenData = ModelLocator.getProxy(ModelName.CHANGE_SCREEN_DATA_POOL).allocate().update(App.ScreenName.BACK);

                if (button instanceof App.AddNewButton)
                {
                    changeScreenData.screenName = App.ScreenName.EDIT;
                    changeScreenData.headerName = App.ScreenTitle.ADD_SUB_CATEGORY;

                    App.Controller.dispatchEvent(EventType.CHANGE_SUB_CATEGORY,{
                        type:EventType.CREATE,
                        category:this._model,
                        nextCommand:new App.ChangeScreen(),
                        nextCommandData:changeScreenData
                    });
                }
                else
                {
                    changeScreenData.backSteps = ModelLocator.getProxy(ModelName.SCREEN_HISTORY).peek(2).screenName === App.ScreenName.ACCOUNT ? 2 : 1;
                    changeScreenData.updateBackScreen = true;

                    App.Controller.dispatchEvent(EventType.CHANGE_TRANSACTION,{
                        type:EventType.CHANGE,
                        account:ModelLocator.getProxy(ModelName.ACCOUNTS).find("id",this._model.account),
                        category:this._model,
                        subCategory:button.getModel(),
                        nextCommand:new App.ChangeScreen(),
                        nextCommandData:changeScreenData
                    });
                }
            }
        }
    }
};

/**
 * Open
 */
App.CategoryButtonExpand.prototype.open = function open()
{
    if (this._layoutDirty)
    {
        this._subCategoryList.update(this._model,this._mode);

        this._contentHeight = this._subCategoryList.boundingBox.height;

        this._layoutDirty = false;
    }

    App.ExpandButton.prototype.open.call(this);
};

/**
 * Disable
 */
App.CategoryButtonExpand.prototype.disable = function disable()
{
    this.close(true);
};
