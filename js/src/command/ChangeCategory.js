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

        this._nextCommandData.updateData = category;
    }
    else if (type === EventType.CHANGE)
    {
        category.name = data.name || category.name;
        category.icon = data.icon || category.icon;
        category.color = data.color || category.color;
        category.budget = data.budget || category.budget;

        this._registerSubCategories(category);
    }
    else if (type === EventType.CONFIRM)
    {
        category.name = data.name;
        category.icon = data.icon;
        category.color = data.color;
        category.budget = data.budget;

        this._registerCategory(category);
        this._registerSubCategories(category);
    }
    else if (type === EventType.CANCEL)
    {
        this._cancelChanges(category);
    }
    else if (type === EventType.DELETE)
    {
        this._deleteCategory(category);
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};

/**
 * Add category to collection
 * @param category
 * @private
 */
App.ChangeCategory.prototype._registerCategory = function _registerCategory(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        categories = ModelLocator.getProxy(ModelName.CATEGORIES);

    if (categories.indexOf(category) === -1)
    {
        categories.addItem(category);
        ModelLocator.getProxy(ModelName.ACCOUNTS).find("id",category.account).addCategory(category);

        var StorageKey = App.StorageKey,
            Storage = App.ServiceLocator.getService(App.ServiceName.STORAGE);

        Storage.setData(StorageKey.ACCOUNTS,ModelLocator.getProxy(ModelName.ACCOUNTS).serialize());//TODO do I need to serialize every time?
        Storage.setData(StorageKey.CATEGORIES,categories.serialize());//TODO do I need to serialize every time?
    }
};

/**
 * Add subCategories to collection
 * @param category
 * @private
 */
App.ChangeCategory.prototype._registerSubCategories = function _registerSubCategories(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        Storage = App.ServiceLocator.getService(App.ServiceName.STORAGE),
        StorageKey = App.StorageKey,
        subCategoryCollection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES),
        subCategories = category.subCategories,
        subCategory = null,
        i = 0,
        l = subCategories.length;

    for (;i<l;)
    {
        subCategory = subCategories[i++];
        if (subCategoryCollection.indexOf(subCategory) === -1) subCategoryCollection.addItem(subCategory);
    }

    Storage.setData(StorageKey.CATEGORIES,ModelLocator.getProxy(ModelName.CATEGORIES).serialize());//TODO do I need to serialize every time?
    Storage.setData(StorageKey.SUB_CATEGORIES,subCategoryCollection.serialize());//TODO do I need to serialize every time?
};

/**
 * Cancel changes made to the category since last saved state
 * @param {App.Category} category
 * @private
 */
App.ChangeCategory.prototype._cancelChanges = function _cancelChanges(category)
{
    var ModelName = App.ModelName,
        ModelLocator = App.ModelLocator,
        StorageKey = App.StorageKey,
        Storage = App.ServiceLocator.getService(App.ServiceName.STORAGE),
        subCategoryCollection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES),
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

    i = 0;
    l = revokedSubCategories.length;

    for (;i<l;) revokedSubCategories[i++].revokeState();

    //TODO destroy category if it was newly created and eventually cancelled?

    Storage.setData(StorageKey.CATEGORIES,ModelLocator.getProxy(ModelName.CATEGORIES).serialize());//TODO do I need to serialize every time?
    Storage.setData(StorageKey.SUB_CATEGORIES,subCategoryCollection.serialize());//TODO do I need to serialize every time?
};

/**
 * Delete category
 * @param {App.Category} category
 * @private
 */
App.ChangeCategory.prototype._deleteCategory = function _deleteCategory(category)
{
    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        StorageKey = App.StorageKey,
        Storage = App.ServiceLocator.getService(App.ServiceName.STORAGE),
        accounts = ModelLocator.getProxy(ModelName.ACCOUNTS);

    accounts.find("id",category.account).removeCategory(category);

    Storage.setData(StorageKey.ACCOUNTS,accounts.serialize());//TODO do I need to serialize every time?
    Storage.setData(StorageKey.CATEGORIES,ModelLocator.getProxy(ModelName.CATEGORIES).serialize());//TODO do I need to serialize every time?
    Storage.setData(StorageKey.SUB_CATEGORIES,ModelLocator.getProxy(ModelName.SUB_CATEGORIES).serialize());//TODO do I need to serialize every time?

    category.destroy();
};
