/**
 * @class ChangeCategory
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeCategory = function ChangeCategory(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool || App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
};

App.ChangeCategory.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeCategory.prototype.constructor = App.ChangeCategory;

/**
 * Execute the command
 *
 * @method execute
 * @param {Object} data
 * @param {string} data.type
 * @param {App.Category} data.category
 * @param {string} data.name
 * @param {string} data.color
 * @param {string} data.icon
 * @param {string} data.budget
 * @param {App.Account} data.account
 * @param {Command} data.nextCommand
 * @param {Object} data.nextCommandData
 */
App.ChangeCategory.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        category = data.category,
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        category = new App.Category();
        category.account = data.account.id;

        data.nextCommandData.updateData = category;

        this._complete();
    }
    else if (type === EventType.CHANGE)
    {
        category.name = data.name || category.name;
        category.icon = data.icon || category.icon;
        category.color = data.color || category.color;
        category.budget = data.budget || category.budget;

        this._addToCollection(category);
    }
    else if (type === EventType.CANCEL)
    {
        this._cancelChanges(category);
    }
};

/**
 * Add to collection
 * @param category
 * @private
 */
App.ChangeCategory.prototype._addToCollection = function _addToCollection(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        categories = ModelLocator.getProxy(ModelName.CATEGORIES),
        subCategoryCollection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES),
        subCategories = category.subCategories,
        subCategory = null,
        i = 0,
        l = subCategories.length;

    if (categories.indexOf(category) === -1)
    {
        categories.addItem(category);
        ModelLocator.getProxy(ModelName.ACCOUNTS).find("id",category.account).addCategory(category);
    }

    for (;i<l;)
    {
        subCategory = subCategories[i++];
        if (subCategoryCollection.indexOf(subCategory) === -1) subCategoryCollection.addItem(subCategory);
    }

    this._complete();
};

/**
 * Cancel changes made to the category since last saved state
 * @param {App.Category} category
 * @private
 */
App.ChangeCategory.prototype._cancelChanges = function _cancelChanges(category)
{
    var subCategoryCollection = App.ModelLocator.getProxy(App.ModelName.SUB_CATEGORIES),
        allSubCategories = category.subCategories,
        i = 0,
        l = allSubCategories.length;

    category.revokeState();

    var revokedSubCategories = category.subCategories;

    for (;i<l;i++)
    {
        if (revokedSubCategories.indexOf(allSubCategories[i]) === -1 && subCategoryCollection.indexOf(allSubCategories[i]) > -1)
        {
            subCategoryCollection.removeItem(allSubCategories[i]);
        }
    }

    this._complete();
};

/**
 * Complete
 * @private
 */
App.ChangeCategory.prototype._complete = function _complete()
{
    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
