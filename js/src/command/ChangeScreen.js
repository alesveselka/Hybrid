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
    //TODO if current screen is edited, cancel the changes
    App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).changeScreen(screenName);

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
