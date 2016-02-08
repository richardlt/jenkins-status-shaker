var JenkinsApi = require('jenkins-api'),
    winston = require('winston');

var Shaker = require('./classes/shaker.class.js');

winston.level = 'debug';

module.exports = {

    init: function(url, username, password) {
        var addr = 'http://';
        if (username) {
            addr += username + ':' + password + '@';
        }
        addr += url;
        winston.info('[JenkinsStatusShaker][init] Connecting to jenkins at ' + url);
        return new Shaker(JenkinsApi.init(addr));
    }

};
