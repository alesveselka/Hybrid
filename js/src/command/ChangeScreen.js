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
 */
App.ChangeScreen.prototype.execute = function execute(data)
{
    var ViewLocator = App.ViewLocator,
        ViewName = App.ViewName,
        screenStack = ViewLocator.getViewSegment(ViewName.SCREEN_STACK),
        screen = screenStack.getChildByIndex(data.screenName);

    ViewLocator.getViewSegment(ViewName.HEADER).change(data.headerLeftAction,data.headerRightAction,data.headerName);

    screenStack.selectChild(screen);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};
