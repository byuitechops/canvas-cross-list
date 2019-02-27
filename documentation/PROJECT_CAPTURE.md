# Project Capture Document for canvas-cross-list
#### *Author: Sam McGrath*
#### *Stakeholder(s): Josh McKinney, Corey Moore*
#### *Date: February 26, 2019*


## Background
Paragraph describing context of the needs of the stakeholder. It should focus on the **why** of the project.

This program exists solely to automate the process of cross-listing courses. Previously, Corey Moore cross listed courses in Canvas by hand and it can become tedious. This process is to help automate all of that.

-----

## Objectives
Bullet list sentences of **what** the tool should accomplish for them.

- Parse CSV or through CLI, get all of the source OUs and destination OU
- Cross List the Source source OU into destination OU
- Display success or error message to the user.

-----

# Requirements

### Input Requirements

#### Source of Inputs

The input will come from the user at runtime.

#### Definition of Inputs

There are two ways for the user to provide the input:

1. CLI
    - This is just two prompts:
        - Source OU (can be one or more)
        - Destination OU
2. CSV
    - Columns
        - Source OU
        - Destination

---

### Output Requirements
#### Destination

The output will be a `console.log` of the success or error of the process.

If the user provides a CSV with multiple source and destination OUs, then the output
will be a CSV file with the success.

#### Definition of Outputs

There are no output - just a `console.log` the success or error message.

As for the CSV portion (only will happen if a CSV with multiple source and destination OUs is provided), the columns will be provided as the following:
    - Source OU
    - Destination OU
    - Success/Fail

---

### Interface

#### Type: 

There will be two types for the interface.
    - CLI with prompts
    - CSV

The interface will be completed through command line. If the user provides the CSV through command line, it'll assume for the CSV. Otherwise, it'll prompt the user.

#### 

There are no specific UI nor any major questions.

-----

## Expectations

### Timeline

- CSV/CLI prompts completed by Feb. 27, 2019
- POC completed by March 1, 2019
- Final Project TBA - it depends on the success of the POC.

### Best Mode of Contact

- Email/Slack

### Next Meeting

- None at the moment.

### Action Items
#### TechOps

- Provide POC by March 1, 2019

#### Stakeholder

- N/A

-----

#### *Approved By:* 
#### *Approval Date:*
