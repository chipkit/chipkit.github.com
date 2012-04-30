#!/usr/bin/env node
var cluster = require('cluster');
var config = require('./lib/config');
var cpus = require('os').cpus().length;
var env = process.env.NODE_ENV || 'development';
var app = require('./application');

if (cluster.isMaster) {
    // Fork workers.
    /**
     * For now lets spawn one worker.
     * In order to spawn more workers we need to switch
     * socket.io to use redis in order to share sessions.
     **/
    switch (env) {
        case 'development':
            cluster.fork();
            break;
        case 'production':
        case 'test':
        case 'stage':
        case 'integration':
            for (var i = 0; i < cpus; i++) {
                cluster.fork();
            }
            break;
    };

    cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
    });
} else {
    app.listen(config.port);
    console.log("[%s] Chipkit server in %s mode has been started on port %s",
    process.pid, app.settings.env, config.port);
}
