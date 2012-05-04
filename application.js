var http = require('http');
var express = require('express');
var cookieSession = require('connect-cookie-session');
var config = require('./lib/config');

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('view engine', 'jade');
    /*app.set('view options', {
        layout: false
    });*/

    /*app.use(express.favicon(__dirname + '/public/images/favicon.ico', {
        maxAge: 2592000000
    }));*/

    /**
     * Middleware that sets
     * the view folder automatically given the module
     * being requested.
     **/
    app.use(function(req, res, next) {
        var render = res.render;
        res.render = function(view) {
            var path = this.req.route.path.split('/');
            var widget = req.currentModule ? req.currentModule : path[path.length-1];
            app.set('views', __dirname + '/lib/' + widget);
            return render.apply(this, arguments);
        };
        next();
    });

    app.use(express.methodOverride());
    app.use(express.logger());
    app.use(express.bodyParser({
        keepExtensions: true
    }));

    app.use(express.cookieParser());

    /**
     * Bug Labs Accounts session cookie.
     **/
    var cookie = config.session_cookie;
    app.use(cookieSession({
        key: cookie.key,
        secret : cookie.secret,
        cookie: {
            domain: cookie.domain,
            secure: cookie.secure
        }
    }));

    app.use(app.router);

    app.use(express.static(__dirname + '/public'));
});

app.configure('test', function() {
    //process.setuid('bugswarm');
});

app.configure('production', function() {
    //process.setuid('bugswarm');
});

function requireAuth(req, res, next) {
    if (!req.session.username) {
        res.redirect(config.buglabs_accounts + '/login?redirect=' + config.url);
    } else {
        next();
    }
}

app.get('/', requireAuth, function(req, res) {
    res.render('index', {
        username: req.session.username,
        logout_url: config.buglabs_accounts +
            '/logout?_appid=' + config._appid + '&redirect=' + config.url
    });
});

app.get('/coming_soon', requireAuth, function(req, res) {
    res.render('coming_soon', {
        username: req.session.username,
        logout_url: config.buglabs_accounts +
            '/logout?_appid=' + config._appid + '&redirect=' + config.url,
        layout: '../layout'
    });
});

process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception -> ');
    console.log(e.message);
    console.log(e.stack);
});

module.exports = app;
