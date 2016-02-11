var assert = require('assert');

var JobTool = require('../../src/tools/job.tool.js'),
    ColorConstant = require('../../src/constants/color.constant.js');

describe('JobTool', function() {

    describe('getColorsFromJobList', function() {

        it('Test with null', function() {
            assert.equal(0, JobTool.getColorsFromJobList(null).length);
        });

        it('Test with an empty list of jobs', function() {
            assert.equal(0, JobTool.getColorsFromJobList([]).length);
        });

        it('Test with two jobs', function() {
            var jobs = [{
                color: ColorConstant.NOT_BUILD
            }, {
                color: ColorConstant.BLUE
            }];
            var colors = JobTool.getColorsFromJobList(jobs);
            assert.equal(2, colors.length);
            assert.equal(ColorConstant.NOT_BUILD, colors[0]);
            assert.equal(ColorConstant.BLUE, colors[1]);
        });

        it('Test with an aborted job', function() {
            var jobs = [{
                color: ColorConstant.ABORTED,
                lastStableBuild: { number: 1 }
            }];
            var colors = JobTool.getColorsFromJobList(jobs);
            assert.equal(1, colors.length);
            assert.equal(ColorConstant.BLUE, colors[0]);
        });

        it('Test with an aborted anime job', function() {
            var jobs = [{
                color: ColorConstant.ABORTED_ANIME,
                lastStableBuild: { number: 1 }
            }];
            var colors = JobTool.getColorsFromJobList(jobs);
            assert.equal(1, colors.length);
            assert.equal(ColorConstant.BLUE_ANIME, colors[0]);
        });

    });

});
