/**
 * @class ChangeSubCategory
 * @extends SequenceCommand
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.ChangeSubCategory = function ChangeSubCategory(eventListenerPool)
{
    App.SequenceCommand.call(this,false,eventListenerPool);//App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL)
};

App.ChangeSubCategory.prototype = Object.create(App.SequenceCommand.prototype);
App.ChangeSubCategory.prototype.constructor = App.ChangeSubCategory;

/**
 * Execute the command
 *
 * @method execute
 * @param {{subCategory:App.SubCategory,name:string,category:App.Category,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeSubCategory.prototype.execute = function execute(data)
{
    this._nextCommand = data.nextCommand;

    var subCategory = data.subCategory;

    if (subCategory)  //If subCategory already exist, update it
    {
        subCategory.name = data.name;

        data.category.addSubCategory(subCategory);
    }
    else //If no subCategory is passed in, create one
    {
        subCategory = new App.SubCategory();
        subCategory.category = data.category.id;

        var nextCommandData = data.nextCommandData;
        if (nextCommandData)
        {
            nextCommandData.updateBackScreen = true;
            nextCommandData.updateData = {subCategory:subCategory,category:data.category};
        }
    }

    if (this._nextCommand) this._executeNextCommand(data.nextCommandData);
    else this.dispatchEvent(App.EventType.COMPLETE,this);
};
