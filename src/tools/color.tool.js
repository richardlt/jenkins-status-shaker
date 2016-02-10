var ColorConstant = require('../constants/color.constant.js'),
    StatusConstant = require('../constants/status.constant.js');

module.exports = {

    getCleanColorsAndWorkingStatus: function(colors) {
        var status = {
            colors: [],
            working: false
        };
        if (colors) {
            status.colors = colors.map(function(color) {
                if (color === ColorConstant.RED_ANIME) {
                    status.working = true;
                    return ColorConstant.RED;
                } else if (color === ColorConstant.YELLOW_ANIME) {
                    status.working = true;
                    return ColorConstant.YELLOW;
                } else if (color === ColorConstant.BLUE_ANIME) {
                    status.working = true;
                    return ColorConstant.BLUE;
                } else {
                    return color;
                }
            });
        }
        return status;
    },

    computeStatusFromCleanColors: function(colors) {
        if(colors) {
            if (colors.indexOf(ColorConstant.RED) > -1) {
                return StatusConstant.FAILURE;
            } else if (colors.indexOf(ColorConstant.YELLOW) > -1) {
                return StatusConstant.UNSTABLE;
            } else if (colors.indexOf(ColorConstant.BLUE) > -1) {
                return StatusConstant.SUCCESS;
            } else {
                return StatusConstant.UNKNOWN;
            }
        }
        return StatusConstant.UNKNOWN;
    },

    getLastNotAbortedBuildColor: function(job) {
        if(job) {
            var maxBuildNumber = -1;
            var lastNotAbortedBuildColor = ColorConstant.NOT_BUILD;
            var lastFailedBuild = job.lastFailedBuild; // FAILURE
            if (lastFailedBuild && lastFailedBuild.number > maxBuildNumber) {
                maxBuildNumber = lastFailedBuild.number;
                lastNotAbortedBuildColor = ColorConstant.RED;
            }
            var lastUnstableBuild = job.lastUnstableBuild; // UNSTABLE
            if (lastUnstableBuild && lastUnstableBuild.number > maxBuildNumber) {
                maxBuildNumber = lastUnstableBuild.number;
                lastNotAbortedBuildColor = ColorConstant.YELLOW;
            }
            var lastStableBuild = job.lastStableBuild; // SUCCESS
            if (lastStableBuild && lastStableBuild.number > maxBuildNumber) {
                maxBuildNumber = lastStableBuild.number;
                lastNotAbortedBuildColor = ColorConstant.BLUE;
            }
            return lastNotAbortedBuildColor;
        }
        return ColorConstant.NOT_BUILD;
    }

};
