# jenkins status shaker

<img src="https://cloud.githubusercontent.com/assets/1819206/12892413/4c4d9c00-ce8c-11e5-95de-a21d7128a60b.PNG" width="150" align="left" />

This awesome tool will mix all status from a given list of Jenkins jobs and views and will give you only one global state.

Work in progress...

TODO :
```
- Get previous status of a job if current build has been aborted
- Publish module on npm repository
- Add test and Travis build
- Add npm dependencies check
- ...
```

Example :

```javascript
var JenkinsStatusShaker = require('jenkins-status-shaker');

var shaker = JenkinsStatusShaker.init('jenkins.mydomain.com', 'username', 'password');

shaker.setJobs(['job1', 'job2', 'job3']).setViews(['view1', 'view2']).onStatusReceived(function(status) {
    console.log(status);
}).getStatus();
```
