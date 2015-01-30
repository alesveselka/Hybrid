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
        "js/src/utils/DateUtils.js",
        "js/src/utils/Device.js",
        "js/src/utils/GraphicUtils.js",
        "js/src/utils/LayoutUtils.js",
        "js/src/enum/EventType.js",
        "js/src/enum/ModelName.js",
        "js/src/enum/ViewName.js",
        "js/src/enum/InteractiveState.js",
        "js/src/enum/TransitionState.js",
        "js/src/enum/ScrollPolicy.js",
        "js/src/enum/Direction.js",
        "js/src/enum/ScreenName.js",
        "js/src/event/EventListener.js",
        "js/src/event/EventDispatcher.js",
        "js/src/geom/Rectangle.js",
        "js/src/model/ModelLocator.js",
        "js/src/model/ObjectPool.js",
        "js/src/model/Collection.js",
        "js/src/model/Settings.js",
        "js/src/model/Account.js",
        "js/src/model/Transaction.js",
        "js/src/model/Category.js",
        "js/src/model/Filter.js",
        "js/src/view/ViewLocator.js",
        "js/src/view/ColorTheme.js",
        "js/src/view/FontStyle.js",
        "js/src/view/Header.js",
        "js/src/view/ui/controls/ScrollIndicator.js",
        "js/src/view/ui/controls/Input.js",
        "js/src/view/ui/controls/TimeInput.js",
        "js/src/view/ui/controls/CalendarWeekRow.js",
        "js/src/view/ui/controls/Calendar.js",
        "js/src/view/ui/containers/Pane.js",
        "js/src/view/ui/containers/InfiniteList.js",
        "js/src/view/ui/containers/VirtualList.js",
        "js/src/view/ui/containers/List.js",
        "js/src/view/ui/containers/TileList.js",
        "js/src/view/ui/containers/TilePane.js",
        "js/src/view/ui/containers/ViewStack.js",
        "js/src/view/screens/Screen.js",
        "js/src/view/screens/ListHeader.js",
        "js/src/view/screens/AddNewButton.js",
        "js/src/view/screens/SwipeButton.js",
        "js/src/view/screens/ExpandButton.js",
        "js/src/view/screens/transactions/TransactionToggleButton.js",
        "js/src/view/screens/transactions/TransactionOptionButton.js",
        "js/src/view/screens/transactions/AddTransactionScreen.js",
        "js/src/view/screens/time/SelectTimeScreen.js",
        "js/src/view/screens/accounts/AccountButton.js",
        "js/src/view/screens/accounts/AccountScreen.js",
        "js/src/view/screens/categories/SubCategoryButton.js",
        "js/src/view/screens/categories/SubCategoryList.js",
        "js/src/view/screens/categories/CategoryButtonSurface.js",
        "js/src/view/screens/categories/CategoryButtonEdit.js",
        "js/src/view/screens/categories/CategoryButtonExpand.js",
        "js/src/view/screens/categories/CategoryScreen.js",
        "js/src/view/screens/categories/ColorSample.js",
        "js/src/view/screens/categories/IconSample.js",
        "js/src/view/screens/categories/EditCategoryScreen.js",
        "js/src/view/screens/transactions/TransactionButton.js",
        "js/src/view/screens/transactions/TransactionScreen.js",
        "js/src/view/screens/report/SubCategoryReportList.js",
        "js/src/view/screens/report/ReportCategoryButton.js",
        "js/src/view/screens/report/ReportAccountButton.js",
        "js/src/view/screens/report/ReportChartHighlight.js",
        "js/src/view/screens/report/ReportChart.js",
        "js/src/view/screens/report/ReportScreen.js",
        "js/src/view/ApplicationView.js",
        "js/src/tween/Easing.js",
        "js/src/tween/TweenProxy.js",
        "js/src/core/Ticker.js",
        "js/src/control/Controller.js",
        "js/src/command/Command.js",
        "js/src/command/LoadData.js",
        "js/src/command/Initialize.js",
        "js/src/command/ChangeScreen.js",
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
                banner:getBanner()/*,
                mangle:{toplevel:true}*/
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
