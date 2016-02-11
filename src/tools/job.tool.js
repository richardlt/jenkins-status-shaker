var ColorConstant = require('../constants/color.constant.js'),
    ColorTool = require('./color.tool.js');

module.exports = {

    getColorsFromJobList: function(jobs) {
        var colors = [];
        if (jobs !== null) {
            jobs.forEach(function(job) {
                if (job.color === ColorConstant.ABORTED) {
                    colors.push(ColorTool.getLastNotAbortedBuildColor(job));
                } else if (job.color === ColorConstant.ABORTED_ANIME) {
                    colors.push(ColorTool.getLastNotAbortedBuildColor(job) + '_anime');
                } else {
                    colors.push(job.color);
                }
            });
        }
        return colors;
    }

};
