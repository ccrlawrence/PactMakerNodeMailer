<h1 align="center">
  <img width="250" src="media/logo.png" alt="PactMaker">
  <br>
  <br>
</h1>

>Starter workflow for creating self-signed PDF agreements and sending them via Nodemailer. 

Inspired by [PactMaker](https://github.com/wildbit/PactMaker) by [Wildbit](https://github.com/wildbit).

## Configuration
Create an environment variable file(`.env`) in the project root with the following variables:

```
NODEMAILER_HOST=''
NODEMAILER_PORT=587
NODEMAILER_USER=''
NODEMAILER_PASS=''
FROM_ADDRESS=''
INTERNAL_EMAIL_RECIPIENTS=''
INTERNAL_EMAIL_SUBJECT=''
SIGNEE_EMAIL_SUBJECT=''
TITLE=''
```

#### `NODEMAILER_HOST`
Host used for Nodemailer - this is your email server.

#### `NODEMAILER_PORT`
Port for your email provider - typically 587.

#### `NODEMAILER_USER`
Username for your email provider.

#### `NODEMAILER_PASS`
Password for your email provider.

#### `FROM_ADDRESS`
The from address for your emails - normally your email address.

#### `INTERNAL_EMAIL_RECIPIENTS`
Comma-separated list of email address you want to send the PDF agreement to.

#### `INTERNAL_EMAIL_SUBJECT`
The subject line of the email that gets sent to your team. Available variables: `<%= company %>`, `<%= name %>`, `<%= role %>`, and `<%= email %>`.

#### `SIGNEE_EMAIL_SUBJECT`
The subject line of the email that gets sent to the person who just signed the agreement. Available variables: `<%= company %>`, `<%= name %>`, `<%= role %>`, and `<%= email %>`.

#### `TITLE`
The name of your company or app. This will appear on the page header and footer.

## Get started
Before you get started, make sure you have an environment variable file(see above) and that [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/get-npm) is installed.

* In terminal, run `npm install`
* Run `npm start` or `heroku local` to run the project locally
* By default, `npm start` uses [port 3000](http://localhost:3000) and `heroku local` uses [port 5000](http://localhost:5000).

## Email templates
The email content for the signee and internal email can be found under [`/emails`](emails). Templates are rendered using [EJS](http://www.embeddedjs.com/). Available variables: `<%= company %>`, `<%= name %>`, `<%= role %>`, and `<%= email %>`.

## Agreement template
The agreement PDF template can be found at [`/views/agreement.ejs`](views/agreement.ejs). PactMaker comes with basic styles for presenting different signatures.

