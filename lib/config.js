var config = {
    development: {
        port: 8008,
        url: 'http://comcast.dev.buglabs.net',
        debug: true,
        buglabs_accounts: 'https://accounts.dev.buglabs.net/accounts',
        session_cookie: {
            key: 'bid_dev',
            secret: '01d397fecd90bfa49eb8d7bd30ae8ae1790214d9a5f6e399b2f66d9e9b06e225',
            domain: '.buglabs.net',
            secure: false
        },
        //Needed for buglabs-accounts
        _appid: 'comcast.dev.buglabs.net'
    },

    production: {
        port: 8008,
        url: 'http://comcast.buglabs.net',
        debug: true,
        buglabs_accounts: 'https://accounts.buglabs.net/accounts',
        session_cookie: {
            key: 'bid',
            secret: '01d397fecd90bfa49eb8d7bd30ae8ae1790214d9a5f6e399b2f66d9e9b06e225',
            domain: '.buglabs.net',
            secure: false
        },
        //Needed for buglabs-accounts
        _appid: 'comcast.buglabs.net'
    }
};

var env = process.env.NODE_ENV || 'development';
module.exports = config[env];


