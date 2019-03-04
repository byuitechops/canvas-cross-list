# Project Capture Document for canvas-cross-list
#### *Author: Sam McGrath*
#### *Stakeholder(s): Josh McKinney, Corey Moore*
#### *Date: February 26, 2019*


## Background
### Explain the Problem
Cross listing in Canvas is basically helping the instructors be more efficient in their workflow. When an instructor have multiple sections for the same course, they can opt to have their course cross listed, which means that all of the sections will be "merged" into one. All of the sections are still active and the students see no difference pre and post cross listing. It allows the instructor to not have to maintain multiple gradebooks for multiple sections of the same class.



-----

## Objectives
### Explain the Solution
This process was done by hand by Br. Moore in the past and this project aims to automate that process when provided a CSV or answer CLI questions.
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
