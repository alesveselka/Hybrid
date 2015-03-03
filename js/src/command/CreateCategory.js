/**
 * @class CreateCategory
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CreateCategory = function CreateCategory(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.CreateCategory.prototype = Object.create(App.SequenceCommand.prototype);
App.CreateCategory.prototype.constructor = App.CreateCategory;

/**
 * Execute the command
 *
 * @method execute
 * @param {{nextCommand:Command,screenName:number}} data
 */
App.CreateCategory.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var categories = App.ModelLocator.getProxy(App.ModelName.CATEGORIES),
        category = data.category;

    if (!category) //If no category is passed in, create one
    {
        category = new App.Category();
        category.account = data.account;

        categories.addItem(category);
        App.ModelLocator.getProxy(App.ModelName.ACCOUNTS).find("id",data.account).addCategory(category);

        data.nextCommandData.updateData = category;
    }
    else //If category already exist, it will just update it
    {
        category.name = data.name;
        category.icon = data.icon;
        category.color = data.color;
        category.budget = data.budget;
    }

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
