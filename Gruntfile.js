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

    // Configuration
    grunt.initConfig({
        pkg:grunt.file.readJSON("package.json"),
        concat:{
            dist:{
                src:require(require("path").resolve("source.json")).source,
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
                    '<%= pkg.destinationFolder %><%= pkg.destinationName %>.min.js':['<%= concat.dist.dest %>'],
                    '<%= pkg.destinationFolder %>storage-worker.min.js':['js/src/business/StorageWorker.js']
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