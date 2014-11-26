console.log("Hello Cashius!");
/*
var pool = new App.ObjectPool(App.EventListener,10);
var eventDispatcher = new App.EventDispatcher(pool);

eventDispatcher.addEventListener(App.EventType.CHANGE,this,onChange);
eventDispatcher.addEventListener(App.EventType.CHANGE,this,onSecondChange);
eventDispatcher.dispatchEvent(App.EventType.CHANGE);

eventDispatcher.removeEventListener(App.EventType.CHANGE,this,onSecondChange);

eventDispatcher.dispatchEvent(App.EventType.CHANGE);
eventDispatcher.dispatchEvent(App.EventType.CHANGE);
eventDispatcher.dispatchEvent(App.EventType.CHANGE);

function onChange()
{
    console.log("onChange");
}

function onSecondChange()
{
    console.log("onSecondChange");
}

// Load data command *********************
var LoadData = function LoadData(pool)
{
    App.Command.call(this,false,pool);
    console.log("LoadData instantiated");
};

LoadData.prototype = Object.create(App.Command.prototype);
LoadData.prototype.constructor = LoadData;

LoadData.prototype.execute = function execute()
{
    console.log("Executing 'LoadData'");

    this.dispatchEvent(App.EventType.COMPLETE);
};

LoadData.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    console.log("LoadData.destroy() called");
};
*/
(function()
{
    function onInitComplete()
    {
        initCommand.destroy();
        initCommand = null;

        console.log("onInitComplete");
    }

    var initCommand = new App.Initialize();
    initCommand.addEventListener(App.EventType.COMPLETE,this,onInitComplete);
    initCommand.execute();
})();
