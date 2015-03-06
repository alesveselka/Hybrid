/**
 * @class SequenceCommand
 * @extends Command
 * @param {boolean} allowMultipleInstances
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.SequenceCommand = function SequenceCommand(allowMultipleInstances,eventListenerPool)
{
    App.Command.call(this,allowMultipleInstances,eventListenerPool);

    this._nextCommand = null;
    this._nextCommandData = null;
};

App.SequenceCommand.prototype = Object.create(App.Command.prototype);
App.SequenceCommand.prototype.constructor = App.SequenceCommand;

/**
 * Execute next command
 * @param {*} [data=null]
 * @private
 */
App.SequenceCommand.prototype._executeNextCommand = function _executeNextCommand(data)
{
    this._nextCommand.addEventListener(App.EventType.COMPLETE,this,this._onNextCommandComplete);
    this._nextCommand.execute(data);
};

/**
 * On next command complete
 * @private
 */
App.SequenceCommand.prototype._onNextCommandComplete = function _onNextCommandComplete()
{
    this._nextCommand.removeEventListener(App.EventType.COMPLETE,this,this._onNextCommandComplete);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Destroy current instance
 *
 * @method destroy
 */
App.SequenceCommand.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    if (this._nextCommand)
    {
        this._nextCommand.destroy();
        this._nextCommand = null;
    }

    this._nextCommandData = null;
};
