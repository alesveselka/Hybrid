'use strict';

var server,
    dir;

/**
 * Init
 */
function init()
{
    dir = __dirname + "/public";

    server = require('http').createServer();
    server.on('request',onServerRequest);
    server.listen(80);
}

/**
 * On server request
 * @param request
 * @param response
 */
function onServerRequest(request,response)
{
    //console.log(__dirname);
    //console.log(request.url);
    require('fs').readFile(request.url === "/" ? dir+"/index.html" : dir+request.url,function(error,content)
    {
        if (error)
        {
            response.writeHead('500');
            response.end(error.toString());
        }

        response.writeHead('200');
        response.end(content);
    });
}

init();
