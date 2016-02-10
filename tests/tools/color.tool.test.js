var assert = require('assert');

var ColorTool = require('../../src/tools/color.tool.js'),
    ColorConstant = require('../../src/constants/color.constant.js'),
    StatusConstant = require('../../src/constants/status.constant.js');

describe('ColorTool', function() {

    describe('getCleanColorsAndWorkingStatus', function() {

        it('Test with null', function() {
            var cleanColorsAndWorkingStatus = ColorTool.getCleanColorsAndWorkingStatus(null);
            assert.equal(0, cleanColorsAndWorkingStatus.colors.length);
            assert.equal(false, cleanColorsAndWorkingStatus.working);
        });

        it('Test with not anime colors', function() {
            var colors = [ColorConstant.RED, ColorConstant.YELLOW, ColorConstant.BLUE];
            var cleanColorsAndWorkingStatus = ColorTool.getCleanColorsAndWorkingStatus(colors);
            assert.equal(3, cleanColorsAndWorkingStatus.colors.length);
            assert.equal(ColorConstant.RED, cleanColorsAndWorkingStatus.colors[0]);
            assert.equal(ColorConstant.YELLOW, cleanColorsAndWorkingStatus.colors[1]);
            assert.equal(ColorConstant.BLUE, cleanColorsAndWorkingStatus.colors[2]);
            assert.equal(false, cleanColorsAndWorkingStatus.working);
        });

        it('Test with anime colors', function() {
            var colors = [ColorConstant.NOT_BUILD, ColorConstant.YELLOW_ANIME, ColorConstant.BLUE_ANIME];
            var cleanColorsAndWorkingStatus = ColorTool.getCleanColorsAndWorkingStatus(colors);
            assert.equal(3, cleanColorsAndWorkingStatus.colors.length);
            assert.equal(ColorConstant.NOT_BUILD, cleanColorsAndWorkingStatus.colors[0]);
            assert.equal(ColorConstant.YELLOW, cleanColorsAndWorkingStatus.colors[1]);
            assert.equal(ColorConstant.BLUE, cleanColorsAndWorkingStatus.colors[2]);
            assert.equal(true, cleanColorsAndWorkingStatus.working);
        });

    });

    describe('computeStatusFromCleanColors', function() {

        it('Test with null', function() {
            assert.equal(StatusConstant.UNKNOWN, ColorTool.computeStatusFromCleanColors(null));
        });

        it('Failure priority should be higher than unstable or success', function() {
            var colors = [ColorConstant.YELLOW, ColorConstant.BLUE, ColorConstant.RED];
            assert.equal(StatusConstant.FAILURE, ColorTool.computeStatusFromCleanColors(colors));
        });

        it('Unstable priority should be higher than success', function() {
            var colors = [ColorConstant.YELLOW, ColorConstant.BLUE, ColorConstant.UNKNOWN];
            assert.equal(StatusConstant.UNSTABLE, ColorTool.computeStatusFromCleanColors(colors));
        });

        it('Success priority should be higher than unknown', function() {
            var colors = [ColorConstant.BLUE, ColorConstant.BLUE, ColorConstant.UNKNOWN];
            assert.equal(StatusConstant.SUCCESS, ColorTool.computeStatusFromCleanColors(colors));
        });

        it('Anime colors should be ignored', function() {
            var colors = [ColorConstant.BLUE_ANIME, ColorConstant.RED_ANIME, ColorConstant.YELLOW_ANIME];
            assert.equal(StatusConstant.UNKNOWN, ColorTool.computeStatusFromCleanColors(colors));
        });

    });

    describe('getLastNotAbortedBuildColor', function() {

        it('Test with null', function() {
            assert.equal(ColorConstant.NOT_BUILD, ColorTool.getLastNotAbortedBuildColor(null));
        });

        it('Test job without build', function() {
            var job = {
                lastFailedBuild: null,
                lastStableBuild: null,
                lastUnstableBuild: null
            };
            assert.equal(ColorConstant.NOT_BUILD, ColorTool.getLastNotAbortedBuildColor(job));
        });

        it('Build with higher number should be used', function() {
            var job = {
                lastFailedBuild: {
                    number: 1
                },
                lastStableBuild: {
                    number: 0
                },
                lastUnstableBuild: {
                    number: 3
                }
            };
            assert.equal(ColorConstant.YELLOW, ColorTool.getLastNotAbortedBuildColor(job));
        });

    });

});
