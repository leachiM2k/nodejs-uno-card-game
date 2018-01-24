'use strict';

const config = require('config');
const Hapi = require('hapi');

const serverOptions = {
    port: process.env.PORT || config.server.port,
    routes: { cors: true },
    router: {
        stripTrailingSlash: true
    }
};

const server = new Hapi.Server(serverOptions);

server.register({ plugin: require('./plugins/uno') })
    .then(() => server.start())
    .then(() => { console.log('Server running at:', server.info.uri); })
    .catch(error => {
        if (error) {
            throw error;
        }
    });
