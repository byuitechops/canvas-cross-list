# canvas-cross-list

## Description 

The main idea behind this is to automate the process behind cross listing courses in Canvas. Cross listing a course is pretty much taking one or more courses and then making it seem as one course for the instructor. You can have multiple sections for one course as long as the requirements are met. This way, the instructor will not have to navigate between all of the sections for grading, announcements, etc. 

This program will prompt the user for two options: CLI (command line interface) or CSV. If you are wanting to do a cross list for one course, go with CLI. If you want to do mass cross listing, go with the CSV.

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

```sh
# Canvas requires a Canvas API token and we grab (will throw error if not there) it from the environment variables.

# Powershell
$ $env:CANVAS_API_TOKEN="${INSERT YOUR CANVAS API TOKEN HERE}"

# cmd
$ set CANVAS_API_TOKEN=${INSERT YOUR CANVAS API TOKEN HERE}

# Linux and Mac
$ export CANVAS_API_TOKEN="${INSERT YOUR CANVAS API TOKEN HERE}"
```

## How to Use
If you want to update the course data pulled from Canvas, execute:
```sh
$ npm start

# use the arrow keys to select either CLI or CSV. Press enter when you are finished making your decision.
$ ? CLI or CSV? (use arrow keys)
$ > CLI
$   CSV
```

If you are going to use the CSV, the following format must be followed or it will throw an error.

| sourceOU | destinationOU |
|----------|---------------|
|Enter source OU here | Enter destination OU here |

In the CSV question, you are more than welcome to provide an absolute or relative path to the CSV file. If it cannot find it, it will throw an error.