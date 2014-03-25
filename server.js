
/**
 * Module dependencies.
 */

var express = require('express');

// Load configuration
var config = require('./config/config')
var http = require('http');

// ==== Connection DB =====//
// Connect to mongodb
var mongoose = require('mongoose');
var connect = function() {
    var options = { server: {socketOptions: { KeepAlive: 1 } } };
    mongoose.connect(config.db, options)
};
connect();

// Error handler
mongoose.connection.on('error', function(err) {
    console.log(err)
});

// Reconnect when closed
mongoose.connection.on('disconnected', function() {
    connect();
});
// ==== End Connection DB=====//

// Express settings
var app = express();
require('./config/express')(app, config);

// All routes here
require('./config/routes')(app, config);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Start Server
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
