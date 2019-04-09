# canvas-cross-list

## Description 

The main idea behind this is to automate the process behind cross listing courses in Canvas. Cross listing a course is pretty much taking one or more courses and then making it seem as one course for the instructor. You can have multiple sections for one course as long as the requirements are met. This way, the instructor will not have to navigate between all of the sections for grading, announcements, etc.

## How to Install

To install the `canvas-cross-list` program, simply execute:

```sh
# Clone the repository
$ git clone https://github.com/byuitechops/canvas-cross-list.git

# Step into the folder that was just created as a result of the clone
$ cd ./canvas-cross-list

# Install needed dependencies.
$ npm i
```

**NOTE:** Normal Canvas API Token through student software developers will **NOT** be able to execute the API module. You must talk to Josh and receive permission (and get a token from him that will expire the day after usage).

```sh
# Canvas requires a Canvas API token and we grab (will throw error if not there) it from the environment variables.

# Powershell
$ $env:CANVAS_API_TOKEN="${INSERT YOUR CANVAS API TOKEN HERE}"

# cmd
$ set CANVAS_API_TOKEN=${INSERT YOUR CANVAS API TOKEN HERE}

# Linux and Mac
$ export CANVAS_API_TOKEN="${INSERT YOUR CANVAS API TOKEN HERE}"
```

## Files

At this point, the file that connects between all of the different files are in WIP status. All of the files needed have been created.

The files are the following:

`/src/IO`
1. apiIO 
    - Short module for `api` file in `/src`
1. completeIO
1. cxIO
    - Short module for Cx portion
        - You will need two files from Josh (they are not on Github because they contain sensitive information). They are called `compareCXWithLMS` and `lmsDataWrapper`.
        - This also includes the `cxAdapter` file found in `/src`.
1. generateIO
    - Short module that generates a CSV from the LMS.
1. handmadeCsvIO
    - Handles a custom made CSV

    If you are going to use the CSV, the following format must be followed or it will throw an error.

| sourceOU | destinationOU |
|----------|---------------|
|Enter source OU here | Enter destination OU here |
6. singularIO
    - Handles a single Canvas Crosslist API call.

`/src`
1. api
    - Requirements:
        - `crossListBuilder.js` must have been executed first.
    - This goes through the array that `crossListBuilder.js` produces and checks each item against the requirements*.
1. crossListBuilder
    - Requirements:
        - Either `singularIO.js`, `handmadeCsvIO.js`, or `generate.js` has been executed.
1. cxAdapter
    - Requirements:
        - `compareCXWithLMS.js`** must have been executed.
    - This file implements the adapter design pattern and transforms the data found from `compareCXWithLMS.js` file into an array that works with the `crossListBuilder.js` module.
1. generate
    - Requirements:
        - None.
    - This file reaches out to Canvas through their own API and executes an API call to retrieve all of courses. The results is then filtered down to what exactly is needed.
1. handCsv
    - Requirements:
        - None.
    - This reads in the CSV that is provided. This needs some additional work because this was one of the first files that was written before many of the requirements were received.
1. helpers
    - Requirements:
        - None.
    - This holds a couple functions that isn't really being used. However, the array for blocklisted courses are found here.
1. questions
    - Requirements:
        - None.
    - This holds all of the questions for either `singularCrossList.js` or `handCsv.js` files.
1. singularCrossList
    - Requirements:
        - None.
    - This prompts the user for the source(s) and destination section numbers and then returns an array of those values.This needs some additional work because this was one of the first files that was written before many of the requirements were received.

\*
BYU-Idaho has a few requirements for a course to be crosslisted. They can be found in the description of the project.

\** 
Please talk to Josh McKinney if you do not have access to this file. Since `compareCXWithLMS` comes with sensitive information that should **NOT** be made public, you will need to obtain it from Josh. Please make sure that your `.gitignore` file is up to date with the file so it will not be pushed to Github.

