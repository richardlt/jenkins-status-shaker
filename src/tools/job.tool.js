var ColorConstant = require('../constants/color.constant.js'),
    ColorTool = require('./color.tool.js');

module.exports = {

    getColorsFromJobList: function(jobs) {
        var colors = [];
        if (jobs !== null) {
            jobs.forEach(function(job) {
                colors.push(job.color === ColorConstant.ABORTED ? ColorTool.getLastNotAbortedBuildColor(job) : job.color);
            });
        }
        return colors;
    }

};
