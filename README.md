# E2E testing framework comparison for Angular web development
## Setup

Before running the tests, make sure you have all the necessary packages installed. Run the following command to install all dependencies:

```bash
npm install
```

## Running tests
This project uses Cypress, Playwright and Puppeteer for testing. Below are the commands to run the tests and open test reports.
***
### Cypress
To run Cypress tests in headless(in cli) mode, use the following command:
```bash
npm run test:cypress:run
```
This command executes all Cypress tests in the background without opening the Cypress Test Runner UI.


To open the Cypress Test Runner UI, where you can run tests interactively, use the following command:
```bash
npm run test:cypress:open
```
This opens the Cypress UI, allowing you to see the test execution in real-time and interact with the tests.
***
### Playwright
To execute all Playwright tests, use the following command:
```bash
npm run test:playwright
```
This runs the Playwright tests in headless browsers by default, showing the test results in the terminal.

After running Playwright tests, you can generate and view a detailed HTML report with the following command:
```bash
npm run report:playwright
```
This command generates a report of the last test run and opens it in your default web browser.
### Puppeteer

[//]: # (To run Cypress tests in headless&#40;in cli&#41; mode, use the following command:)

[//]: # (```bash)

[//]: # (npm install)

[//]: # (```)