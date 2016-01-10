# Champ 101
Basic League of Legends Champion Knowledge [get it on overwolf](http://store.overwolf.com/app/Colorfulstan)

> Entry for the overwolf Nvidia Challenge 2015

**IMPORTANT NOTE: When running the app locally for testing, don't use the build created within ```champ101_latest/app``` 
so that google-analytics data stays seperated for development / production versions.**
If you're interested in access to the analytics reports send a message to github@krispin.it

## Requirements:

- node & npm installed
- grunt installed

optional:

- some form of .scss compiling set up if you want to work with the styling (compiled .css for convenience included)

## installing
Run:

	> cd front_end
	> npm install

## Testing
[see tests/README.md](front_end/tests/README.md)

## Building
**Building is only neccessary for release / testing release-candidates.**
To run the local app with overwolf refer to the developer [getting-started guide](http://developers.overwolf.com/documentation/#odk-2-0-introduction).
You can either choose the folder ```front_end``` (the one in which this file lives) or you can choose a build from within 
```release-candidates/``` for your unpacked extension. Both will work.
It is recommended to use the front_end folder while developing to save the building-step when testing the apps GUI.

Run:

    > cd front_end
    > grunt build

This will create following directories:
* ``` release-candidates/champ101_vM.m.p.b ```
* ``` champ101_latest/app ```

The Version of the app will be taken from manifest.json.
Names of the folders are created from variable ```appName``` within Gruntfile.js

## App-Versioning

The Version-number represents following:
major.minor.patch.release-candidate

**release-candidate has to be used in Development / testing to distingish between live-versions and development versions within google analytics.**
It will be removed for the production manifest within ```champ101_latest/app``` when using ```grunt build```.

The folder "release-candidates" will contain the 4 numbers Versioning, and Folder ```Champ101_latest/app``` will contain the 3 numbers Versioning for production.

## Contributing

If you want to contribute:

* create your contribution within its own Branch, forking from **Development** unless it's a hotfix, then you have to fork from **master** (trying to adopt [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) )
* try to adopt the commit-msg conventions described [here](http://karma-runner.github.io/latest/dev/git-commit-msg.html) 
* make sure you provide unit-tests with your contribution if appropriate
