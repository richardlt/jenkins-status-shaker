var winston = require('winston'),
    async = require('async');

var StatusConstant = require('../constants/status.constant.js'),
    ColorConstant = require('../constants/color.constant.js');

module.exports = function Shaker(jenkins) {

    var _jenkins = jenkins;

    var _views = [];
    var _jobs = [];

    var _statusReceivedCallback = null;

    var _status = {
        status: StatusConstant.UNKNOWN,
        working: false
    };

    var _notifyStatusReceived = function() {
        if (_statusReceivedCallback) {
            _statusReceivedCallback(_status);
        }
    };

    var _getCleanColorsAndWorkingStatus = function(colors) {
        var working = false;
        var cleanColors = colors.map(function(color) {
            if (color === ColorConstant.RED_ANIME) {
                working = true;
                return ColorConstant.RED;
            } else if (color === ColorConstant.YELLOW_ANIME) {
                working = true;
                return ColorConstant.YELLOW;
            } else if (color === ColorConstant.BLUE_ANIME) {
                working = true;
                return ColorConstant.BLUE;
            } else {
                return color;
            }
        });
        return {
            colors: cleanColors,
            working: working
        };
    };

    var _computeStatusFromCleanColors = function(colors) {
        if (colors.indexOf(ColorConstant.RED) > -1) {
            return StatusConstant.FAILURE;
        } else if (colors.indexOf(ColorConstant.YELLOW) > -1) {
            return StatusConstant.UNSTABLE;
        } else if (colors.indexOf(ColorConstant.BLUE) > -1) {
            return StatusConstant.SUCCESS;
        } else {
            return StatusConstant.UNKNOWN;
        }
    };

    this.getStatus = function() {

        var jobsCalls = [];

        _jobs.forEach(function(job) {
            jobsCalls.push(function(callback) {
                _jenkins.job_info(job, function(err, data) {
                    callback(err, data);
                });
            });
        });

        async.parallel(jobsCalls, function(err, results) {
            if (err) {
                winston.error('[Shaker][getStatus] An error happened when getting status from Jenkins');
            } else {
                var colors = [];
                results.forEach(function(result) {
                    if (!result.hasOwnProperty('color')) {
                        winston.error('[Shaker][getStatus] No color found for the job ' + result.name);
                    } else {
                        colors.push(result.color);
                    }
                });
                winston.debug('[Shaker][getStatus] Receive colors : ' + colors.join(','));
                var cleanColorsAndWorkingStatus = _getCleanColorsAndWorkingStatus(colors);
                var status = _computeStatusFromCleanColors(cleanColorsAndWorkingStatus.colors);
                _status = {
                    status: status,
                    working: cleanColorsAndWorkingStatus.working
                };
                _notifyStatusReceived();
            }
        });

        var viewsCalls = [];

        _views.forEach(function(view) {
            viewsCalls.push(function(callback) {
                _jenkins.all_jobs_in_view(view, function(err, data) {
                    callback(err, data);
                });
            });
        });

        async.parallel(viewsCalls, function(err, results) {
            if (err) {
                winston.error('[Shaker][getStatus] An error happened when getting status from Jenkins ' + err);
            } else {
                var colors = [];
                results.forEach(function(result) {
                    result.forEach(function(job) {
                        if (!job.hasOwnProperty('color')) {
                            winston.error('[Shaker][getStatus] No color found for the job ' + job.name);
                        } else {
                            colors.push(job.color);
                        }
                    });
                });
                winston.debug('[Shaker][getStatus] Receive colors : ' + colors.join(','));
                var cleanColorsAndWorkingStatus = _getCleanColorsAndWorkingStatus(colors);
                var status = _computeStatusFromCleanColors(cleanColorsAndWorkingStatus.colors);
                _status = {
                    status: status,
                    working: cleanColorsAndWorkingStatus.working
                };
                _notifyStatusReceived();
            }
        });

    };

    this.setJobs = function(jobs) {
        if (jobs && jobs.length > 0) {
            _jobs = jobs;
        } else {
            winston.error('[Shaker][setJobs] You should give a list with at least one job');
        }
        return this;
    };

    this.setViews = function(views) {
        if (views && views.length > 0) {
            _views = views;
        } else {
            winston.error('[Shaker][setViews] You should give a list with at least one view');
        }
        return this;
    };

    this.onStatusReceived = function(callback) {
        _statusReceivedCallback = callback;
        return this;
    };

};
