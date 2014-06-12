// config.js

var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
    root: rootPath,
    db: 'mongodb://saphir.utt.fr:27017/nompweb',
    app: {
        name: 'Nodejs Express Mongoose Demo'
    },
    facebook: {
        clientID: "APP_ID",
        clientSecret: "APP_SECRET",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    twitter: {
        clientID: "CONSUMER_KEY",
        clientSecret: "CONSUMER_SECRET",
        callbackURL: "http://localhost:3000/auth/twitter/callback"
    },
    github: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/github/callback'
    },
};