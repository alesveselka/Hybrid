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

    if (!category)
    {
        category = new App.Category();//TODO create ID;
        categories.addItem(category);
    }

    //TODO also add Account
    category.name = data.name;
    category.icon = data.icon;
    category.color = data.color;
    category.budget = data.budget;

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
