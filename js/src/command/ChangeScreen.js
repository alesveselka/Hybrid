/**
 * @class ChangeScreen
 * @extends {Command}
 * @constructor
 */
App.ChangeScreen = function ChangeScreen()
{
    App.Command.call(this,false,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
};

App.ChangeScreen.prototype = Object.create(App.Command.prototype);
App.ChangeScreen.prototype.constructor = App.ChangeScreen;

/**
 * Execute the command
 *
 * @method execute
 * @param {App.ChangeScreenData} data
 */
App.ChangeScreen.prototype.execute = function execute(data)
{
    var ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        ModelLocator = App.ModelLocator,
        ModelName = App.ModelName,
        changeScreenDataPool = ModelLocator.getProxy(ModelName.CHANGE_SCREEN_DATA_POOL),
        screenHistory = ModelLocator.getProxy(ModelName.SCREEN_HISTORY),
        screenStack = ViewLocator.getViewSegment(ViewName.SCREEN_STACK),
        screen = null;

    if (data.screenName === App.ScreenName.BACK)
    {
        var updateBackScreen = data.updateBackScreen,
            i = 0,
            l = data.backSteps;

        for (;i<l;i++) changeScreenDataPool.release(screenHistory.pop());
        changeScreenDataPool.release(data);

        data = screenHistory.peek();

        screen = screenStack.getChildByIndex(data.screenName);
        if (updateBackScreen) screen.update(data.updateData,data.screenMode);
    }
    else
    {
        if (data.headerLeftAction !== App.HeaderAction.CANCEL && data.headerRightAction !== App.HeaderAction.CANCEL && data.screenMode !== App.ScreenMode.SELECT)
        {
            this._clearHistory(screenHistory,changeScreenDataPool);
        }

        screen = screenStack.getChildByIndex(data.screenName);
        screen.update(data.updateData,data.screenMode);

        screenHistory.push(data);
    }
//    console.log("Stack: ",screenHistory._source);
//    console.log("Pool: ",changeScreenDataPool._freeItems);
    ViewLocator.getViewSegment(ViewName.HEADER).change(data.headerLeftAction,data.headerRightAction,data.headerName);

    screenStack.selectChild(screen);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Clear history
 * @param {App.Stack} screenHistory
 * @param {App.ObjectPool} changeScreenDataPool
 * @private
 */
App.ChangeScreen.prototype._clearHistory = function _clearHistory(screenHistory,changeScreenDataPool)
{
//    console.log("Before clear: ------------------");
//    console.log("Stack: ",screenHistory._source);
//    console.log("Pool: ",changeScreenDataPool._freeItems);
    var item = screenHistory.pop();

    while (item)
    {
        changeScreenDataPool.release(item);

        item = screenHistory.pop();
    }
    screenHistory.clear();
//    console.log("After clear: ------------------");
//    console.log("Stack: ",screenHistory._source);
//    console.log("Pool: ",changeScreenDataPool._freeItems);
//    console.log("---------------------------------");
};
