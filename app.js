
/**
 * Module dependencies.
 */

var express = require('express');
var UserModel = require('./user-model.js').UserModel;
var userModel = new UserModel('localhost', 27017);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index.jade', { title: 'Create Account' });
});

app.post('/account/new', function(req, res) {
  userModel.createAccount({
      acct_name: req.param('acct_name')
    , acct_description: req.param('acct_description')
    , identity: req.param('identity')
    , name: req.param('name')
    , email: req.param('email')
    , passwd: req.param('passwd')
    , owa_url: req.param('owa_url')
  }, function (error, userId) {
    if ( error ) {
      console.log("error saving account: "+req.param('acct_name'));
      res.redirect('/');
    }
    else {
      console.log("succesfully saved account : "+req.param('acct_name') + " user: "+userId);
      res.redirect('/login');
    }
  });
});

app.get('/login', function(req, res){
  res.render('login', { title: 'Express' });
});

app.post('/login', function(req, res){
  res.render('users', { title: 'Express' });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
