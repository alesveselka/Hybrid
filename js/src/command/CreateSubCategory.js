/**
 * @class CreateSubCategory
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.CreateSubCategory = function CreateSubCategory(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);
};

App.CreateSubCategory.prototype = Object.create(App.SequenceCommand.prototype);
App.CreateSubCategory.prototype.constructor = App.CreateSubCategory;

/**
 * Execute the command
 *
 * @method execute
 * @param {{model:App.SubCategory,name:string,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.CreateSubCategory.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var subCategory = data.model;

    if (subCategory)  //If subCategory already exist, update it
    {
        var ModelLocator = App.ModelLocator,
            ModelName = App.ModelName,
            collection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES);

        subCategory.name = data.name;

        if (collection.indexOf(subCategory) === -1)
        {
            collection.addItem(subCategory);
            ModelLocator.getProxy(ModelName.CATEGORIES).find("id",subCategory.category).addSubCategory(subCategory);
        }
    }
    /*else //If no subCategory is passed in, create one
    {
        subCategory = new App.Category();
        subCategory.account = data.account.id;

        data.nextCommandData.updateData = subCategory;
    }*/

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
