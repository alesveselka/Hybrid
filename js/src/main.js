console.log("Hello Cashius!");

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
