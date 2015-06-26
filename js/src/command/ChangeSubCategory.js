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

/**
 * Execute the command
 *
 * @method execute
 * @param {{subCategory:App.SubCategory,name:string,category:App.Category,nextCommand:Command,nextCommandData:App.ChangeScreenData}} data
 */
App.ChangeSubCategory.prototype.execute = function execute(data)
{
    var EventType = App.EventType,
        subCategory = data.subCategory,
        type = data.type;

    this._nextCommand = data.nextCommand;
    this._nextCommandData = data.nextCommandData;

    if (type === EventType.CREATE)
    {
        subCategory = new App.SubCategory();
//        subCategory.category = data.category.id;

        this._nextCommandData.updateData = {subCategory:subCategory,category:data.category};
    }
    else if (type === EventType.CHANGE)
    {
        subCategory.name = data.name;

        data.category.addSubCategory(subCategory);
    }
    else if (type === EventType.DELETE)
    {
        data.category.removeSubCategory(subCategory);
    }

    if (this._nextCommand) this._executeNextCommand(this._nextCommandData);
    else this.dispatchEvent(EventType.COMPLETE,this);
};
