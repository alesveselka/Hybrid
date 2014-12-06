App.ViewStack = function ViewStack()
{
    PIXI.DisplayObjectContainer.call(this);
};

App.ViewStack.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ViewStack.prototype.constructor = App.ViewStack;
