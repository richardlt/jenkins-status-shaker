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

    var _getLastNotAbortedBuildColor = function(job, callback) {
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
    };



    this.getStatus = function() {

        var jobsCalls = [];

        _jobs.forEach(function(job) {
            jobsCalls.push(function(callback) {
                _jenkins.job_info(job, function(err, data) {
                    if (err) {
                        callback('Error getting info from job <' + job + '>', null)
                    } else {
                        callback(null, data);
                    }
                });
            });
        });

        var jobsParallel = function(callback) {
            async.parallel(jobsCalls, function(err, results) {
                if (err) {
                    callback(err, null);
                } else {
                    var colors = [];
                    results.forEach(function(job) {
                        if (job.color === ColorConstant.ABORTED) {
                            colors.push(_getLastNotAbortedBuildColor(job));
                        } else {
                            colors.push(job.color);
                        }
                    });
                    callback(null, colors);
                }
            });
        };

        var viewsCalls = [];

        _views.forEach(function(view) {
            viewsCalls.push(function(callback) {
                _jenkins.all_jobs_in_view(view, function(err, data) {
                    if (err) {
                        callback('Error getting info from view <' + view + '>', null)
                    } else {
                        var colors = [];
                        var jobsAbortedCalls = [];
                        data.forEach(function(job) {
                            if (job.color === ColorConstant.ABORTED) {
                                jobsAbortedCalls.push(function(callbackAborted) {
                                    _jenkins.job_info(job.name, function(err, data) {
                                        if (err) {
                                            callbackAborted('Error getting info from job <' + job.name + '>', null)
                                        } else {
                                            callbackAborted(null, data);
                                        }
                                    });
                                });
                            } else {
                                colors.push(job.color);
                            }
                        });

                        if(jobsAbortedCalls.length > 0) {
                            async.parallel(jobsAbortedCalls, function(err, results) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    results.forEach(function(job) {
                                        if (job.color === ColorConstant.ABORTED) {
                                            colors.push(_getLastNotAbortedBuildColor(job));
                                        } else {
                                            colors.push(job.color);
                                        }
                                    });
                                    callback(null, colors);
                                }
                            });
                        } else {
                            callback(null, colors);
                        }
                    }
                });
            });
        });

        var viewsParallel = function(callback) {
            async.parallel(viewsCalls, function(err, results) {
                if (err) {
                    callback(err, null)
                } else {
                    var colors = [];
                    results.forEach(function(viewColors) {
                        colors = colors.concat(viewColors);
                    });
                    callback(null, colors);
                }
            });
        };

        async.parallel([jobsParallel, viewsParallel], function(err, results) {
            if (err) {
                winston.error('[Shaker][getStatus] An error happened when getting status from Jenkins: "' + err + '"');
            } else {
                winston.debug('[Shaker][getStatus] Receive colors : ' + results.join(','));
                var cleanColorsAndWorkingStatus = _getCleanColorsAndWorkingStatus(results[0].concat(results[1]));
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
