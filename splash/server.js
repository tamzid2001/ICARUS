const express = require("express");
const app = express();
const path = require('path');
var nodemailer = require('nodemailer');
var admin = require("firebase-admin");
const e = require("express");

var serviceAccount = require("./gurugains-fac88-firebase-adminsdk-9p958-ff71d51ac0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Copy the .env.example in the root into a .env file in this folder
const envFilePath = path.resolve(__dirname, './.env');
const env = require("dotenv").config({ path: envFilePath });
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function randomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
  return result;
}

app.use(express.static(process.env.STATIC_DIR));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get("/", (req, res) => {
  const filePath = path.resolve(process.env.STATIC_DIR + "/gurugains.html");
  res.sendFile(filePath);
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post("/create-checkout-session", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const { priceId } = req.body;
  var key = randomString(8, 'aA#')
  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the form
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}&key=${key}`,
      cancel_url: `${domainURL}/gurugains.html`,
    });

    res.send({
      sessionId: session.id,
    });
  } catch (e) {
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
});

app.get("/setup", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    basicPrice: process.env.BASIC_PRICE_ID,
    
  });
});

app.post('/customer-portal', async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID. 
  // Typically this is stored alongside the authenticated user in your database.
  const { sessionId } = req.body;
  const checkoutsession = await stripe.checkout.sessions.retrieve(sessionId);

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = process.env.DOMAIN;

  const portalsession = await stripe.billingPortal.sessions.create({
    customer: checkoutsession.customer,
    return_url: returnUrl,
  });

  res.send({
    url: portalsession.url,
  });
});

// Webhook handler for asynchronous events.
app.post("/webhook", async (req, res) => {
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

async function addDocument(db, cID, k, e, tID) {
  // [START add_document]
  // [START firestore_data_set_id_random_collection]
  // Add a new document with a generated id.
  const res = await db.collection('ggmembers').add({
    customerId: cID,
    key: k,
    email: e,
    telegramId: tID
  });

  console.log('Added document with ID: ', res.id);
  // [END firestore_data_set_id_random_collection]
  // [END add_document]

  console.log('Add: ', res);
}

async function s2(z,k, e){
  console.log('running s2')
  return await stripe.customers.retrieve(
    z
  ).then((c) => {
    addDocument(db, custID, k, e, '');
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tamzid257@gmail.com',
        pass: 'hacker99667'
      }
    });
    
    var mailOptions = {
      from: 'tamzid257@gmail.com',
      to: e,
      subject: 'GuruGains Membership Key',
      text: k
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });

}

async function success(s,k){
  console.log('running sucess')
  custID = '';
  return await stripe.checkout.sessions.retrieve(
    s
  ).then((cust) => {
    console.log(cust)
    custID = cust.customer;
    email = cust.customer_details.email
    console.log(custID)
    s2(custID,k, email);
    
  });
}

app.get('/success/:ses/key/:t', async(req, res) => {
  var sess = req.params.ses;
  console.log(sess)
  var k = req.params.t
  console.log(k)
  success(sess, k)

  
  //res.send(randomString(8, 'aA#!'));

})

app.listen(4242, () => console.log(`Node server listening at http://localhost:${4242}/`));