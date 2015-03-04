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
 * @param {{subCategory:App.SubCategory,name:string,category:App.Category,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.CreateSubCategory.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var subCategory = data.subCategory;

    if (subCategory)  //If subCategory already exist, update it
    {
        var ModelLocator = App.ModelLocator,
            ModelName = App.ModelName,
            collection = ModelLocator.getProxy(ModelName.SUB_CATEGORIES);

        subCategory.name = data.name;

        if (collection.indexOf(subCategory) === -1)
        {
            collection.addItem(subCategory);//TODO should I add this only at Category creation level?
            data.category.addSubCategory(subCategory);//TODO not working if in process of creating Category in the same time
        }
    }
    else //If no subCategory is passed in, create one
    {
        subCategory = new App.SubCategory();
        subCategory.category = data.category.id;

        data.nextCommandData.updateBackScreen = true;
        data.nextCommandData.updateData = {subCategory:subCategory,category:data.category};
    }

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
