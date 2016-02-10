# jenkins status shaker

[![Build Status](https://travis-ci.org/richardlt/jenkins-status-shaker.svg?branch=master)](https://travis-ci.org/richardlt/jenkins-status-shaker)

<img src="https://cloud.githubusercontent.com/assets/1819206/12892413/4c4d9c00-ce8c-11e5-95de-a21d7128a60b.PNG" width="130" align="left" />

This awesome tool mix all status from a given list of Jenkins jobs and views and give you only one global state. More it will give you the global working status of your jobs which can be true or false depending if one or more jobs are currently building.

<br/>

Install :
```javascript
npm install jenkins-status-shaker
```

Example :
```javascript
var JenkinsStatusShaker = require('jenkins-status-shaker');

var shaker = JenkinsStatusShaker.init('jenkins.mydomain.com', 'username', 'password'); // username and password are optional

shaker.setJobs(['job1', 'job2', 'job3']);

shaker.setViews(['view1', 'view2']);

shaker.onStatusReceived(function(status) {
    // status look like { status: 'SUCCESS', working: true }
});

shaker.getStatus();
```
