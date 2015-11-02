var jwt = require('jsonwebtoken');

var tokenSecret = process.env.TOKEN_SECRET || 'defaultSecret';

module.exports.issueToken = function(payload, callback) {
    console.log("Issue token for: " + JSON.stringify(payload));

    var options = { 
        expiredInMinutes : 1
    };

    return jwt.sign(payload, tokenSecret, options, callback);
};

module.exports.verifyToken = function(token, callback) {
    return jwt.verify(token, tokenSecret, {}, callback);
};

