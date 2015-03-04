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
 * @param {{category:App.Category,name:string,color:string,icon:string,budget:string,account:App.Account,nextCommand:Command,screenName:number}} data
 */
App.CreateCategory.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var category = data.category;

    if (category)  //If category already exist, update it
    {
        var ModelLocator = App.ModelLocator,
            ModelName = App.ModelName,
            categories = ModelLocator.getProxy(ModelName.CATEGORIES);

        category.name = data.name;
        category.icon = data.icon;
        category.color = data.color;
        category.budget = data.budget;

        if (categories.indexOf(category) === -1)
        {
            categories.addItem(category);
            ModelLocator.getProxy(ModelName.ACCOUNTS).find("id",category.account).addCategory(category);
        }
    }
    else //If no category is passed in, create one
    {
        category = new App.Category();
        category.account = data.account.id;

        data.nextCommandData.updateData = category;
    }

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
