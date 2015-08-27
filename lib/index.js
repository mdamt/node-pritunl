var crypto = require('crypto');
var request = require('request');
var Promise = require('promise');
var merge = require('merge');
var uuid = require('uuid');

var Pritunl = function(options) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var self = this;
  self.options = options || {};
}

Pritunl.prototype.getHeaders = function(req, headers, data) {
  var self = this;
  var timestamp = '' + parseInt(new Date().valueOf()/1000);
  var nonce = uuid.v4().replace(/-/g, '');
  var auth = [
    self.options.apiToken,
    timestamp,
    nonce,
    req.method.toUpperCase(),
    req.path
  ];
  if (data) {
    auth.push(JSON.stringify(data));
  }
  var authString = auth.join('&');
  var signature = crypto.createHmac('sha256', self.options.apiSecret);
  signature.update(authString);
  var digest = signature.digest('base64');
  var authHeaders = {
    'Auth-Token': self.options.apiToken,
    'Auth-Timestamp': timestamp,
    'Auth-Nonce': nonce,
    'Auth-Signature': digest
  };

  if (headers) {
    authHeaders = merge(headers, authHeaders);
  }
  return authHeaders;
}

Pritunl.prototype.request = function(req, headers, data) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var headers = self.getHeaders(req, headers, data);
    var options = {
      headers: headers,
      url: self.options.server + req.path
    };
    request(options, function(err, res, body) {
      if (err) {
        reject(err);
        return;
      }
      if (res.statusCode !== 200) {
        reject(res);
      } else {
        try {
          var obj = JSON.parse(body);
          resolve(obj);
        } catch(e) {
          reject(e);
        }
      }
    });
  });
}

Pritunl.prototype.getOrganizations = function() {
  var self = this;

  var req = {
    path: '/organization',
    method: 'GET'
  }

  return self.request(req);
}

Pritunl.prototype.getUsers = function(org) {
  var self = this;

  var req = {
    path: '/user/' + org,
    method: 'GET'
  }

  return self.request(req);
}

module.exports = Pritunl;
