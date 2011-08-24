var mongoose = require("mongoose")
  , crypto = require("crypto");

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var IdentityData = new Schema({
    identity: String
  , passwd: String
  , owa_url: String
  , auth_url: String
  , openid_url: String
  , oauth_url: String
});

var myAccount = new Schema({
    name: String
  , description: String
  , allowed_identities: [String]
  , super_users: [ObjectId]
  , created_by: String
  , created_at: {type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var myUser = new Schema({
    name: String
  , accountId: ObjectId
  , email: String
  , identities: [IdentityData]
  , created_by: String
  , created_at: {type: Date, default: Date.now }
  , updated_by: String
  , updated_at: { type: Date, default: Date.now }
});

var User = mongoose.model('User',myUser);
var Account = mongoose.model('Account',myAccount);

UserModel = function(host, port) {
  mongoose.connect('mongodb://'+host+':'+port+'/user');
};

UserModel.prototype.save = function(doc, callback) {
  var user = new User();
  user.name = doc.name;
  user.accountId = doc.account;
  user.email = doc.email;
  if ( typeof(doc.identities.length)=="undefined" ) doc.identities = [doc.identities];
  for (var i=0;i<doc.identities.length;i++) {
    var idata = doc.identities[i];
    if ( idata.identity == 'plain' ) {
      var shasum = crypto.createHash('sha1');
      shasum.update(idata.passwd);
      idata.passwd = shasum.digest('hex');
    }
  }
  user.identities = doc.identities;
  user.created_by = doc.created_by;
  user.save(function (error, callback) { 
    if ( error ) {
      console.log("unable to save user:"+JSON.stringify(doc));  
      callback(error);
    }
    else {
      console.log("saved user:"+JSON.stringify(user));
      callback(null,user._id);
    }
  });
};

exports.UserModel = UserModel;
