var express = require('express');
const cors = require('cors');
const uuid = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const {
  enrollStudent,
  listStudent,
  findStudent,
  addImageToDB,
  listEvents,
  addAttendance,
  getAllCourse,
  getAllLevel,
  addTimeOutAttendance,
  checkIfAlreadyHaveAttendance
} = require('./controller/studentControllers');
var formatDate = require('date-fns/format');
var isAfter = require('date-fns/isAfter');
var app = express();
app.use(express.static(__dirname + '/uploads'));
app.use(cors());

const bodyParser = require('body-parser');
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static('public'));

const { ImageAnnotatorClient } = require('@google-cloud/vision').v1;
const sgMail = require('@sendgrid/mail');

let SENDGRID_API_KEY =
  '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';

let credentials = JSON.parse(
  JSON.stringify({
    type: 'service_account',
    project_id: 'attendance-management-sy-c6521',
    private_key_id: '5615b9783a65ee2ade5b8360984c06a1a8d36df3',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQClD9qh2jTLND+B\n50NpgiFOGwD/rby5rVgg2jOt6weGNcQTrYSMMXstEBICNa53oETz0pN2/07yGq28\nEoAQlGFUReqbBaxhjmCwfWZnPdkIy9KNRzPB1lU3PH+mP8lQSe4o7hyfdEVn47ze\nxOAshwUNuXMrOE+1aV8Ft01PiGWg1p/+/aOU3yYr3ig7dt/75xjdSRZLRP3lCjEJ\nGbuSoM1kRf6okWBHmH7fRM1DYyD2WTV4+aXbSkpqWCTM1jTYF30WjoXCjdYLW1LF\n+CZmY+TaHkvSz/tyQlxvt3THJJbcOgnzR8NzxjpFvDmKQbOiD49cJKMWEYHRIV8J\ngLI6O8f1AgMBAAECgf9cvQuZjtUaq8BYEWykBaOwvntRK8wH29zSmHDGG8bzy5be\nzMmBUEu52yLtxZDApXYYMmJSpB8253EKugTkoSQOCo+a3xUluq5DJYbjerGgv45i\nJ3Rs89SXtDtZV31EHvAwZEKwqXhVZnQ3YBCTnp4Nl/mdJDD55rn8ptWeWdlqWO8N\nKEUk0qRJnLu0NyrLY6xy2AylRxwVEHP8B/xHREb6JuvtQJAKx6GrMUtLd9XE3vrR\nveLBZfZ8vO480GVtOqqDT5j5EhRIJYDEYvafNCDHO4SEJ4DFgl6ai9eXFPwDfTGr\nqarwwwZWkeIh5Pe+KVlG1Q4NxhM0a4iR1SJdNQECgYEA25xQX8/2dmLzJ9X0dMc3\nTx39ICCwu0db5M7KYo+lLFdjflGD7wXzVjHa8jFWqMJDXomICf3QCf7PCWQFqkrF\nSgAHNwr22n3yxIgH8BQE508h5IwD7IRmE/bXorUR/K0xVanRCRISisgx2oR3Ew7i\n0Vzcc5iWXxvwOYVQyoEXq3UCgYEAwGmiT2U5wRcTTr1n81h6vw9br+Gd5DyqrNhy\nZ5bammMJPqR2eL3rvypQtR+GKEgvzDbWGfEkuj76kc/oCMnoujiu3E1j3iaqfvhs\nr+3PRMTIQvDDH/g4lWW+GZ1U6rMV+uZYKlPinc+Kkfs2IRJ/71lvWFUleV1lOkyo\nRkxCmoECgYAstiuLBk04lzbIUoA90l2JZyKlCuLQjlvAPvXnkTVgzL399ty0qnJ7\nhxT7oF3zZ/HNapTe6+USU+WVFN8uZ6C5Sz4sz7eojmIB72wmTf0dlvfgjz0xR1d9\nExGeF918o0pbFYLwpNRPmyjDQ5r2r14woAZmJpfe71I+c80aHaRTDQKBgQCafTZB\nITl5+5kZA6LPFB+aAC7RzQkFFGDFXxScb9cdVp85mLs2vubmGoeqpaEF/s/B29WU\nBrZChAaTxKa9R8CApLphUBH7cHg8ciJyLzLYOFfCx6Ujqh1kdshnsJdZymi/husL\nMUcnBlhwVY9khoIKH3jzJ4prI73/TUVfDCP+AQKBgF5+QV7ouXXJ2tpH5oSEKmpG\nLYpQptDcNMiieofob47hK0SRY7RkzT4QYGRDRQ3a/xVvy4YeoMTjI7lP6yUIbOL3\nOkrwkmumHDATaSksf6AaLGAWejYi9Gn7zTwRfjNvqcLEBJxVMWYpIc+auzyA+1Oh\n0bLd2cFPQqlzHBLWaCoZ\n-----END PRIVATE KEY-----\n',
    client_email:
      'service-image-process@attendance-management-sy-c6521.iam.gserviceaccount.com',
    client_id: '113954549981442896304',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/service-image-process%40attendance-management-sy-c6521.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com'
  })
);

const CONFIG = {
  credentials: {
    private_key: credentials.private_key,
    client_email: credentials.client_email
  }
};

const visionClient = new ImageAnnotatorClient(CONFIG);

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dextermiranda441@gmail.com',
    pass: 'lluf yifw tgqd vvsb'
  }
});

app.get('/', (req, res) => {
  res.json('Server is running. Please proceed.');
});

let labelFromGoogle = [
  'Gesture',
  'Sleeve',
  'Service',
  'Event',
  'Health care',
  'Health care provider',
  'Medical assistant',
  'Safety glove',
  'Job',
  'Science'
];

let b = [
  'Fire',
  'Earthquake',
  'Flood',
  'Health Emergencies',
  'Traffic Accidents',
  'Criminal Activities',
  'Environmental Incidents'
];

let compareText = `Health care provider`;

var myString = 'Health Emergencies';

// let dex = b.map(name => {
//   var multiple_Word = myString.split(' ').join('|');
//   var testIfValid = new RegExp('\\b' + multiple_Word + '\\b');
//   labelFromGoogle.map(label => {
//     return;
//   });

//   return { compareText, name, isValid: testIfValid.test(name) };
// });

app.post('/approveIncidentReport', async (req, res) => {
  let { email } = req.body;

  try {
    const msg = {
      to: email,
      from: 'dextermiranda441@gmail.com', // Use the email address or domain you verified above
      subject: 'Incident report status',
      text: `We would like to inform you that your submitted incident report has been completed`,
      html: `<strong>
         We would like to inform you that your submitted incident report has been completed
         <strong>
        `
    };

    await transporter.sendMail(msg, (error, info) => {
      if (error) {
        res.status(500).send('Error sending email');
      }
    });

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).send('Error');
  }
});

app.post('/validateIncidentPhoto', async (req, res) => {
  let { incidentPhoto, email } = req.body;

  let allPossibleAccident = [
    'Fire',
    'Earthquake',
    'Flood',
    'Health Emergencies',
    'Traffic Accidents',
    'Criminal Activities',
    'Environmental Incidents',
    'Natural environment',
    'Geological phenomenon'
  ];
  try {
    let id = uuid.v4();
    let imageDownloadPath = await addImageToDB({
      imageBase64: incidentPhoto,
      id,
      uri: 'pic.jpg'
    });

    let result = await visionClient
      .labelDetection(imageDownloadPath)
      .then(results => {
        const labels = results[0].labelAnnotations;

        console.log('Possible Incident:');
        let inci = labels.map(l => {
          return l.description;
        });

        let test = allPossibleAccident.map(name => {
          let dex = inci.reduce((acc, current) => {
            var multiple_Word = current.split(' ').join('|');
            var testIfValid = new RegExp('\\b' + multiple_Word + '\\b');

            return [...acc, { current, found: testIfValid.test(name) }];
          }, []);
          return { name, test: dex.filter(t => t.found) };
        });

        return {
          arrayOfPassedValues: test.filter(t => t.test.length > 0),
          labelFromGoogle: inci
        };
      })
      .catch(err => {
        console.error('ERROR:', err);
      });

    let { arrayOfPassedValues, labelFromGoogle } = result;
    let isPassed = arrayOfPassedValues.length > 0;

    sgMail.setApiKey(SENDGRID_API_KEY);

    if (isPassed) {
      const msg = {
        to: email,
        from: 'dextermiranda441@gmail.com', // Use the email address or domain you verified above
        subject: 'Incident photo validation Result',
        text: `Good day. We wish to inform you that your submitted incident report has been accepted.`,
        html: '<strong>Good day. We wish to inform you that your submitted incident report has been accepted. Please wait while we take action.</strong>'
      };

      await transporter.sendMail(msg, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error sending email');
        }
      });
    } else {
      const msg = {
        to: email,
        from: 'dextermiranda441@gmail.com', // Use the email address or domain you verified above
        subject: 'Incident photo validation Result',
        text: `Good day. We wish to inform you that your submitted incident report has been rejected.`,
        html: `<strong>Good day. We wish to inform you that your submitted incident report has been rejected. 
        Please check upload photo if one of these incident meets.
        
          <ul>
  ${allPossibleAccident.map(label => {
    return `<li>${label}</li>`;
  })}

          </ul>

<p>
Image submitted: Our system detected that this image is one of the following = ${labelFromGoogle.join(
          ','
        )}
</p>

<img src="${imageDownloadPath}"/>



        
        .</strong>`
      };
      await transporter.sendMail(msg, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error sending email');
        }
      });
    }
    res.json({
      success: true,

      isPassed,
      arrayOfPassedValues,
      labelFromGoogle: labelFromGoogle
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

app.get('/playSound', async (req, res) => {});

const port = 8080;
app.listen(8080, () => {
  console.log(`Server Running at port ${port}`);
});
