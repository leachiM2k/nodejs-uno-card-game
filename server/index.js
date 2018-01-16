'use strict';

var config = require('config');
var Hapi = require('hapi');

var serverOptions = {
    connections: {
        routes: { cors: true },
        router: {
            stripTrailingSlash: true
        }
    }
};

var server = new Hapi.Server(serverOptions);

server.connection({
    port: process.env.PORT || config.server.port
});

server.register([
    {
        register: require('./plugins/uno')
    }
], function (error) {
    if (error) {
        throw error;
    }
    server.start(function () {
        console.log('Server running at:', server.info.uri);
    })
});