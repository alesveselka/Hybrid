'use strict';

var port = process.argv[2] && parseInt(process.argv[2],10) || 80,
    server,
    dir;

/**
 * Init
 */
function init()
{
    dir = __dirname + "/public";

    server = require('http').createServer();
    server.on('request',onServerRequest);
    server.listen(port);

    console.log(getAddresses());
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

/**
 * Find and return local addresses
 * @returns {Array}
 */
function getAddresses()
{
    var os = require('os'),
        interfaces = os.networkInterfaces(),
        addresses = [],
        address = null;

    for (var k in interfaces)
    {
        for (var k2 in interfaces[k])
        {
            address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal)
            {
                addresses.push(address.address);
            }
        }
    }

    return addresses;
}

init();

