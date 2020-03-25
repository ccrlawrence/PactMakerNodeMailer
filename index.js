require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const pdf = require('html-pdf')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const _ = require('lodash')
const moment = require('moment')

// Cache agreement template
const agreement = fs.readFileSync(`${__dirname}/views/agreement.ejs`, 'utf8')

// Cache email subjects and content
const emailContentInternal = ejs.compile(fs.readFileSync(`${__dirname}/emails/internal.ejs`, 'utf8'))
const emailContentSignee = ejs.compile(fs.readFileSync(`${__dirname}/emails/signee.ejs`, 'utf8'))
const signeeSubject = ejs.compile(process.env.SIGNEE_EMAIL_SUBJECT || '')
const internalSubject = ejs.compile(process.env.INTERNAL_EMAIL_SUBJECT || '')
const examples = JSON.parse(fs.readFileSync(`${__dirname}/examples.json`, 'utf8'))

validateConfig()

const postmark = require('postmark')
const client = new postmark.Client(process.env.POSTMARK_SERVER_TOKEN)

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mymail.mcd.com',
  port: 587,
  auth: {
    user: 'chris.lawrence@uk.mcd.com',
    pass: 'Trolls1!'
  }
});

// var mailOptions = {
//   from: 'chris.lawrence@uk.mcd.com',
//   to: 'chris.lawrence@uk.mcd.com',
//   subject: 'Sending your agreement from CJ Room Ltd.',
//   text: 'Please see your agreement attached.'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

const viewData = {
  title: process.env.TITLE || '',
  exampleData: examples
}


/**
 * Index express route
 */
app.get('/', (req, res) => {
  res.render('index', viewData)
})


/**
 * Sign document express route
 */
app.post('/sign', (req, res) => {
  const template = ejs.compile(agreement)
  req.body.date = moment().format('MMMM Do, YYYY')

  createDocument(template(req.body), (pdfAgreement) => {
    req.body.agreement = pdfAgreement
    res.render('success', _.merge(viewData, req.body))

    sendEmails(req.body)
  })
})


/**
 * Generate example agreement
 */
// app.get('/example.pdf', (req, res) => {
//   const template = ejs.compile(agreement)
//   const data = viewData.exampleData
//   data.date = moment().format('MMMM Do, YYYY')

//   createDocument(template(data), (pdf) => {
//     res.contentType("application/pdf");
//     res.end(pdf, 'base64');
//   })
// })


/**
 * Start express server
 */
app.listen(process.env.PORT || 3000, () => console.log('PactMaker is up and running!'))


/**
 * Send emails to the signee and internal team
 * @param  {Object} data Request body data
 */
function sendEmails(data) {
  const attachment = {
    'content': new Buffer(data.agreement, 'base64'),
    'filename': `${data.company}_${data.date}.pdf`,
    'contentType': 'application/pdf'
  }

  // Send email to customer

  transporter.sendMail({
    from: process.env.POSTMARK_FROM_ADDRESS,
    to: data.email,
    subject: signeeSubject(data),
    html: emailContentSignee(data),
    attachments: [attachment]
  }, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    console.log('Email sent:')
    console.log(info)
  });
  

  // Send email notification to internal team
  if (process.env.INTERNAL_EMAIL_RECIPIENTS) {
    const internalRecipients = process.env.INTERNAL_EMAIL_RECIPIENTS.split(',')

    internalRecipients.forEach((email) => {
      transporter.sendMail({
        from: process.env.POSTMARK_FROM_ADDRESS,
        to: email,
        subject: internalSubject(data),
        html: emailContentInternal(data),
        attachments: [attachment]
      }, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
        console.log('Email sent:')
        console.log(info)
      })
    })
  }
}


/**
 * Create PDF document
 * @param  {Object}   content  HTMl content content
 * @param  {Function} callback Callback containing the encoded PDF buffer
 */
function createDocument(content, callback) {

  /* https://www.npmjs.com/package/html-pdf for more PDF options */
  const options = {
    border: '1in'
  }

  pdf.create(content, options).toBuffer((err, buffer) => {
    callback(buffer.toString('base64'))
  })
}


/**
 * Validate heroku config
 */
function validateConfig() {
  if (!process.env.POSTMARK_FROM_ADDRESS) {
    throw Error('No From address specified in config')
  }
  if (!process.env.POSTMARK_SERVER_TOKEN) {
    throw Error('No Postmark server token specified in config')
  }
}
