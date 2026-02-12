# QA Engineer Assessment - Privilee Website (Automation Focus)

## Overview
This assessment evaluates your QA engineering skills, with a focus on test automation, using the Privilee website as a case study. You'll be asked to develop automated test scenarios and answer key questions about QA practices and automation.

## Instructions
1. Review the following webpage https://staging-website.privilee.ae/map.
2. Develop a set of automated test scenarios for the main features visible in the page.
3. Submit your assessment in another git repository, where the tests can be run and the result artifacts are generated.

## Tasks

### 1. Automated Test Scenario Development
Create at least 5 automated test scenarios covering different aspects of the website, including but not limited to:
- Functionality
- User Interface
- Performance
- Data Accuracy

For each scenario, briefly describe:
- The feature being tested
- Expected outcome
- Any setup or teardown procedures necessary for automation
- Why you think this test is important

### 2. API
Giving an API, create automated tests to validate the different endpoints available at https://gorest.co.in/
- /public/v2/users
- /public/v2/posts
- /public/v2/users/7373665/posts
- /public/v2/todos
  
You can use newman to create the collection and update the file located in `./collections`. In case you prefer to use another tools, please update the github workflow.

## Evaluation Criteria
Your submission will be evaluated based on:
- Thoroughness and relevance of automated test scenarios
- Understanding of QA principles and test automation best practices
- Clarity and conciseness of explanations
- Ability to identify potential issues and edge cases suitable for automation
- Creative problem-solving approaches in an automated testing context
- Knowledge of automation tools and frameworks

## Submission
Please submit your completed assessment within 2 days. If you have any questions, contact aas@privilee.ae.

Good luck!
