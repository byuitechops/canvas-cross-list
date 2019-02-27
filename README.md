# canvas-cross-list

## Description 
// TODO

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
npm start
```