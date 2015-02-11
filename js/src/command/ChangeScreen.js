/**
 * @class ChangeScreen
 * @extends {Command}
 * @param {ObjectPool} pool
 * @constructor
 */
App.ChangeScreen = function ChangeScreen(pool)
{
    App.Command.call(this,false,pool);
};

App.ChangeScreen.prototype = Object.create(App.Command.prototype);
App.ChangeScreen.prototype.constructor = App.ChangeScreen;

/**
 * Execute the command
 *
 * @method execute
 */
App.ChangeScreen.prototype.execute = function execute(screenName)
{
    App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).changeScreen(screenName);

    //TODO flush previous screens if they'll not be needed anymore
//    App.ModelLocator.getProxy(App.ModelName.SCREEN_CHAIN).push(screenName);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.ChangeScreen.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);
};
