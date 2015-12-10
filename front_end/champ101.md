# Champ 101 - Basic League of Legends Knowledge

Entry for the [NVIDIA App Challenge by overwolf](http://www.overwolf.com/nvidia-app-challenge/) 2015

## Requirements:

- node & npm installed
- grunt installed

## installing
Run:

	> npm install

## Testing
[see tests/readme.md](tests/readme.md)

## Building
**Building is only neccessary for release.**
To run the local app with overwolf refer to the developer [getting-started guide](http://developers.overwolf.com/documentation/#odk-2-0-introduction).
You can either choose the folder ```front_end``` (the one in which this file lives) or you can choose one of the release-folders as your unpacked extension. Both will work.
It is recommended to use the front_end folder while developing to save the building-step when testing the apps GUI.

Run:

    > grunt build

This will create following folders in the parent-directory:
* ``` releases/champ101_vX.X.X ```
* ``` champ101_latest/app ```

The Version of the app will be taken from manifest.json.
Names of the folders are created from variable ```appName``` within Gruntfile.js