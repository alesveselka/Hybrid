module.exports = function(grunt)
{
    /**
     * Construct and return banner
     * @returns {string}
     */
    function getBanner()
    {
        return "//<%= pkg.name %>, <%= grunt.template.today('dd-mm-yyyy, HH:MM:ss') %>\n";
    }

    var source = [
        "js/src/intro.js",
        "js/src/utils/MathUtils.js",
        "js/src/enum/EventType.js",
        "js/src/enum/ModelName.js",
        "js/src/enum/ViewName.js",
        "js/src/enum/InteractiveState.js",
        "js/src/enum/TransitionState.js",
        "js/src/enum/ScrollPolicy.js",
        "js/src/enum/Direction.js",
        "js/src/event/EventListener.js",
        "js/src/event/EventDispatcher.js",
        "js/src/model/ModelLocator.js",
        "js/src/model/ObjectPool.js",
        "js/src/model/Collection.js",
        "js/src/model/Account.js",
        "js/src/model/Transaction.js",
        "js/src/model/Category.js",
        "js/src/model/Filter.js",
        "js/src/view/ViewLocator.js",
        "js/src/view/ui/controls/ScrollIndicator.js",
        "js/src/view/ui/containers/Pane.js",
        "js/src/view/screens/accounts/AccountButton.js",
        "js/src/view/screens/accounts/AccountScreen.js",
        "js/src/view/screens/categories/CategoryButton.js",
        "js/src/view/screens/categories/CategoryScreen.js",
        "js/src/view/ApplicationView.js",
        "js/src/tween/Easing.js",
        "js/src/tween/TweenProxy.js",
        "js/src/core/Ticker.js",
        "js/src/control/Controller.js",
        "js/src/command/Command.js",
        "js/src/command/LoadData.js",
        "js/src/command/Initialize.js",
        "js/src/main.js"
    ];

    // Configuration
    grunt.initConfig({
        pkg:grunt.file.readJSON("package.json"),
        concat:{
            dist:{
                src:source,
                dest:"<%= pkg.destinationFolder %><%=pkg.destinationName%>.js"
            }
        },
        uglify:{
            options:{
                banner:getBanner()
            },
            dist:{
                files:{
                    '<%= pkg.destinationFolder %><%= pkg.destinationName %>.min.js':['<%= concat.dist.dest %>']
                }
            }
        }
    });

    // Plugins
    grunt.loadNpmTasks('grunt-contrib-concat'); //npm install grunt-contrib-concat --save-dev
    grunt.loadNpmTasks('grunt-contrib-uglify'); //npm install grunt-contrib-uglify --save-dev

    // Tasks
    grunt.registerTask('default',['concat','uglify']); // this default task can be run just by typing "grunt" on the command line
};
