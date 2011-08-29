
/**
 * Module dependencies.
 */

var express = require('express');

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

var UserModel = require('./user-model.js').UserModel
  , AffiliateModel = require('./affiliate-model.js').AffiliateModel
  , CounterModel = require('./counter-model.js').CounterModel;

var affiliateModel = new AffiliateModel('localhost', 27017)
  , counterModel = new CounterModel('localhost', 27017)
  , userModel = new UserModel('localhost', 27017);

// Routes

// create and assign admin user
app.post('/account/create', function(req, res) {
  console.log(req.body);
  var data = req.body;

  userModel.createAccount( data, function (error, userId) {
    if ( error ) {
      console.log("error saving account: "+req.param('acct_name'));
      res.send({ error: "error saving account" });
    }
    else {
      console.log("succesfully saved account : "+req.param('acct_name') + " user: "+userId);
      res.send({user: userId});
    }
  });
});

// login an existing user
app.post('/login', function(req, res){
  console.info(req.body);
  var data = req.body;

  userModel.login(data, function (error, userId) {
    if ( error ) {
      console.log("error logging in");
      res.send({error: "error logging in!"});
    }
    else {
      console.log("successfully logged in! user: "+userId);
      res.send({ userId: userId });
    }
  });
});

// create a new affiliate
app.post('/affiliate/create', function(req, res){
  console.info("saving affiliate: %s",JSON.stringify(req.body));
  affiliateModel.save( req.body, function( error ) {
    if ( error ) {
      console.log("error saving affiliate");
      res.send({ error: "error saving affiliate"});
    }
    res.send({});
  });
});

app.get('/affiliate/:id', function(req, res) {
  if ( req.params.id == 'all' ) {
    console.info("trying to find affiliate: %s",req.params.id);
    affiliateModel.findAll(function(error, affiliates){
      if ( error ) {
        console.error("error getting affiliates");
        res.send({error: "error getting affiliates"});
      }
      res.send(affiliates);
    });
  } else {
    affiliateModel.findById(req.params.id, function(error, affiliates) {
      if ( error ) {
        console.error("error finding affiliate: %s!!",req.params.id);
        res.send({ error: "error finding affiliate"});
      }
      res.send(affiliates);
    });
  }
});

app.post('/affiliate/api/create', function(req, res) {
  console.info(req.body);
  affiliateModel.addApi(req.body._id, {
      url: req.body.url
    , webpage: req.body.webpage
    , created_by: req.body.user
    , updated_by: req.body.user
  } , function( error ) {
    if ( error ) {
      console.error("unable to save api: %s",req.body.url);
      res.send({ error: "unable to add api" });
    }
    res.send({});
  });
});

app.get('/affiliate/webpage/:id', function(req, res) {
  console.info(req.params.id);
  affiliateModel.getAffiliateApi(req.params.id, function(error, urls) {
    if ( error ) {
      console.log("unable to fetch any affiliates for webpage: "+req.params.id);
      urls = [];
    }
    else {
      if ( typeof(urls.length)=="undefined" ) urls = [urls];
      // fire and forget call for tracking
      for (var i=0;i<urls.length;i++) 
        counterModel.save({name: urls[i].url, type: urls[i].webpage, subtype: ""});
    }
    res.send(urls);
  });
});

app.listen(3100);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
