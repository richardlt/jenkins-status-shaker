var assert = require('assert'),
    sinon = require('sinon'),
    JenkinsApi = require('jenkins-api');

var Shaker = require('../../src/classes/shaker.class.js'),
    ColorConstant = require('../../src/constants/color.constant.js'),
    StatusConstant = require('../../src/constants/status.constant.js');

describe("ShakerClass", function() {

    var _shaker = null;
    var _jenkins = JenkinsApi.init('');

    before(function(done) {
        sinon.stub(_jenkins, 'job_info').yields(null, {
            'name': 'job1',
            'color': ColorConstant.BLUE
        });
        sinon.stub(_jenkins, 'all_jobs_in_view').yields(null, [{
            'name': 'job2',
            'color': ColorConstant.RED
        }, {
            'name': 'job3',
            'color': ColorConstant.YELLOW_ANIME
        }]);
        _shaker = new Shaker(_jenkins).setJobs(['job1']).setViews(['view1']);
        done();
    });

    after(function(done) {
        _jenkins.job_info.restore();
        _jenkins.all_jobs_in_view.restore();
        done();
    });

    it("Shaker should return FAILURE and working true", function() {
        _shaker.onStatusReceived(function(status) {
            assert.equal(status.status, StatusConstant.FAILURE);
            assert.equal(status.working, true);
        }).getStatus();
    });

});
