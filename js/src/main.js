(function()
{
    //TODO move to index.html and also build simply pre-preloader

    function onInitComplete()
    {
        initCommand.destroy();
        initCommand = null;
    }

    var initCommand = new App.Initialize();
    initCommand.addEventListener(App.EventType.COMPLETE,this,onInitComplete);
    initCommand.execute();
})();
