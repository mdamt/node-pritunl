var should = require('should');
var Pritunl = require('../');
var nock = require('nock');

var opts = {
  server: 'https://server:9700',
  apiToken: '12345678765456787654323456654561',
  apiSecret: '23456787654345676543456765456765'
};

describe('Pritunl', function() {
  it('should generate auth headers', function(done) {
    var p = new Pritunl(opts);
    var req = {
      path: '/path',
      method: 'GET'
    }
    var h = p.getHeaders(req);
    h.should.have.property('Auth-Token');
    h.should.have.property('Auth-Timestamp');
    h.should.have.property('Auth-Nonce');
    h.should.have.property('Auth-Signature');
    done();
  });

  it('should generate auth headers with additional headers', function(done) {
    var p = new Pritunl(opts);
    var req = {
      path: '/path',
      method: 'GET'
    }
    var h = p.getHeaders(req, { abc: 'def' });
    h.should.have.property('Auth-Token');
    h.should.have.property('Auth-Timestamp');
    h.should.have.property('Auth-Nonce');
    h.should.have.property('Auth-Signature');
    h.should.have.property('abc');
    done();
  });

  it('should return organizations', function(done) {
    var obj = [{"user_count": 2, "id": "55c62fb4e26f311efcc2da9e", "name": "ABC"}];
    var scope = nock(opts.server)
      .get('/organization')
      .reply(function(uri, body) {
        return(200, JSON.stringify(obj));
      });
    var p = new Pritunl(opts);
    p.getOrganizations().then(function(r) {
      r.length.should.be.exactly(obj.length);
      r[0].id.should.be.exactly(obj[0].id);
      r[0].name.should.be.exactly(obj[0].name);
      r[0].user_count.should.be.exactly(obj[0].user_count);
      done();
    }).catch(function(err) {
      (err !== null).should.be.true();
      done(err);
    });
  });

  it('should return users within an organization', function(done) {
    var org = '55c62fb4e26f311efcc2da9e';
    var obj = [{"status":false,"otp_secret":"QRB4HQ2KIK43OL5G","servers":[{"status":false,"platform":null,"virt_address":"172.16.0.5","name":"server0","client_id":null,"real_address":null,"connected_since":null,"type":null,"id":"55dc904ee26f3102ea2c9dd0","device_name":null}],"disabled":false,"id":"55c62fb9e26f311efcc2dab9","name":"Administrator","organization_name":"ABC","otp_auth":false,"organization":"55c62fb4e26f311efcc2da9e","type":"client","email":null},{"status":false,"otp_secret":"EWHYKRZLXDXCHBUW","servers":[{"status":false,"platform":null,"virt_address":"172.16.0.3","name":"server0","client_id":null,"real_address":null,"connected_since":null,"type":null,"id":"55dc904ee26f3102ea2c9dd0","device_name":null}],"disabled":false,"id":"55c62fb9e26f311efcc2dab2","name":"Test1","organization_name":"ABC","otp_auth":false,"organization":"55c62fb4e26f311efcc2da9e","type":"client","email":null},{"status":false,"otp_secret":"JT6X5AF2HWGXSJMB","servers":[{"status":false,"platform":null,"virt_address":"172.16.0.2","name":"server0","client_id":null,"real_address":null,"connected_since":null,"type":null,"id":"55dc904ee26f3102ea2c9dd0","device_name":null}],"disabled":false,"id":"55c62fb9e26f311efcc2dab6","name":"server_55dc904ee26f3102ea2c9dd0","organization_name":"ABC","otp_auth":false,"organization":"55c62fb4e26f311efcc2da9e","type":"server","email":null}];

    var scope = nock(opts.server)
      .get('/user/' + org)
      .reply(function(uri, body) {
        return(200, JSON.stringify(obj));
      });
    var p = new Pritunl(opts);
    p.getUsers(org).then(function(r) {
      r.length.should.be.exactly(obj.length);
      r[0].id.should.be.exactly(obj[0].id);
      r[0].name.should.be.exactly(obj[0].name);
      done();
    }).catch(function(err) {
      (err !== null).should.be.true();
      done(err);
    });
  });

});
