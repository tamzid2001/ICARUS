const functions = require("firebase-functions");
const express = require("express");
const app = express();
const path = require("path");
var admin = require("firebase-admin");
var nodemailer = require('nodemailer');
const mjml = require('mjml');
const bodyParser = require('body-parser');
let MetaApi = require('metaapi.cloud-sdk').default;
//import MetaApi from 'metaapi.cloud-sdk';
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const url = require('url');
const envFilePath = path.resolve(__dirname, './.env');
const env = require("dotenv").config({ path: envFilePath });
const generateApiKey = require('generate-api-key');
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
}
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken);
const emailValidator = require('deep-email-validator');
 
async function isEmailValid(email) {
 return emailValidator.validate(email)
}
// twilio.messages
//   .create({
//      body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//      from: '+15017122661',
//      to: '+15558675310'
//    })
//   .then(message => console.log(message.sid));

var serviceAccount = require("./icarus-b84d3-firebase-adminsdk-5k6n2-dbbdad5740.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

var token = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4YWYxZGI3ZDBjYzA1NmFkNzVkNmYwY2IzYmQ5ZTVlNiIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjE4NDM3NDI5LCJyZWFsVXNlcklkIjoiOGFmMWRiN2QwY2MwNTZhZDc1ZDZmMGNiM2JkOWU1ZTYifQ.ZjVdaIPtTsbpBmzI45Ka4SzSPmjsdNy9O0VsSHrL7r8DPNwT3dtps5fsp_RZjcTJIiSt9NfUyD0hWfaS9PsVrxyu21LFmzPaJmfkIlB-EnU7xdnZ3l5WqR-7W72B6yVJRlDl7-fum07vzZeIHHsrtzB-a1njUxKGe10ySjJ2bSiWiM1Du3kC0CzCe9JieIVAyegKmr7whTbMtXATAt6VoX73NRmo2yGDOqw5OfgR6l425ADoAW8AXw2NnSqgVJ4qIF84T0JEEnzc7bYliS4bxJgLSTdwtLxZv9mlaPvsOjFsPaF3Pt7GxBHHkWVhFqOGwB4Xtm5qd2RgzYk_i0YDbLOCs97B9Y174OxuriKMJMU7nHGdYXEz0GqCF3hL27uLiBtH42b-G-GltCYBEjmEH04lTF4amqm_zN9uJuZZJKEO4VW_vpAghCMQ5JH5eq6190zQWwcjUyAHGw2wTF-T3sxNWGTcdau1mtY-iiW1P6lkuZ6V5KiozykBER8alpUg5V8VyJMstwTE0bnnt-yCDaoa_yjQJsoPjuz9J7R4dMoaQOje2QmqzkinRZwBiBydozBbiL8lUfeHw-Y3p-lFgDQJMSGD-KE3YOyfZXbSxYv1HTj6L5o7aCS8Up9CdH70NHzoAS4zINtxBE7OdZTGn758c4XrjNnbuQiAOBdvJb0"
const api = new MetaApi(token);

async function removeAccount(id) {
  const m = db.collection('clients');
  const s = await m.doc(id).get();

  s.forEach(async (doc) => {
    const account = await api.metatraderAccountApi.getAccount(doc.accountId);
    account.remove();
    await m.doc(id).update({accountId:"", status:"sgnup"})
  })

  return true;
}

async function disableCustomer(k){
  const members = db.collection('clients');
  const snapshot = await members.where('customerId', '==', k).get();
  var id;
  var accid;
  var sub;
  var paymentIntent;
  if (snapshot.empty) {
    return res.status(400).send()
  }  

  snapshot.forEach(doc => {
    id = doc.id
    accid = doc.accountId;
    sub = doc.subscriptionId;
    paymentIntent = doc.payintent;
  });

  await removeAccount(accid).then((x)=>{
    return true;
  }).catch((err)=>{return err;})

  const subscription = await stripe.subscriptions.retrieve(
    sub
  );

  if(subscription.status === "canceled"){
    if(new Date(subscription.canceled_at) - new Date(subscription.started_at) <= 30) {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntent
      });
    }
  }

  await members.doc(id).update({status: "sgnup"}).then(res.status(200).send()).catch((res.status(400).send()))

  return true;

}



async function handleCustomer(k,p) {
  const members = db.collection('clients');
  const snapshot = await members.where('customerId', '==', k).get();
  var id;
  //var sub;
  //var paymentIntent;
  var fingerprint;

  if (snapshot.empty) {
    return res.status(400).send();
  } 

  snapshot.forEach(doc => {
    id = doc.id;
    //sub = doc.subscriptionId;
    //paymentIntent = doc.paymentIntent;
  });

  await stripe.paymentMethods.retrieve(
    paymeth
  ).then((card) => {
    fingerprint = card.card.fingerprint
    return true
  })

  await members.doc(id).update({paymethod: p, fingerprint: fingerprint}).then(res.status(200).send()).catch(res.status(400).send());


}

async function getUser(id){
  const account = await api.metatraderAccountApi.getAccount(id);
  const connection = await account.connect();
   var d = []; 
   var da = {
       "accInfo": {
          "name": "",
          "server": "",
          "broker": "",
          "equity": ""
       },
       "eqd1": [],
       "eqw1": [],
       "eqm1": [],
       "eqm3": [],
       "eqy1": [],
       "eqy5": [],
       "d1wr": [],
       "w1wr": [],
       "m1wr": [],
       "m3wr": [],
       "y1wr": [],
       "y5wr": [],
       "d1lr": [],
       "w1lr": [],
       "m1lr": [],
       "m3lr": [],
       "y1lr": [],
       "y5lr": [],
       "d1tr": [],
       "w1tr": [],
       "m1tr": [],
       "m3tr": [],
       "y1tr": [],
       "y5tr": [],
       "md": []

   }
 
await connection.waitSynchronized();
historyStorage = connection.historyStorage;

// both orderSynchronizationFinished and dealSynchronizationFinished
// should be true once history synchronization have finished

// retrieve balance and equity
const ac = await connection.getAccountInformation();
da.accInfo.name = ac.name;
da.accInfo.server = ac.server;
da.accInfo.broker = ac.broker;
da.accInfo.equity = ac.equity;

const deals = await connection.getDealsByTimeRange(new Date(1970, 0, 1), new Date());
const deal = deals.deals;
var counter = 0;
for(i = 0;i<deal.length;i++) {
  if(deal[i].type == "DEAL_TYPE_SELL" || deal[i].type == "DEAL_TYPE_BUY"){
      if(deal[i].magic == 2){
          var g = deal[i].profit + deal[i].commission + deal[i].swap;

          if(new Date(deal[i].brokerTime) <= new Date()){
      
              da.d1lr.push(g);
          }
          if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
              da.w1lr.push(g);
          }
          if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
              da.m1lr.push(g); 
          }
          if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
              da.m3lr.push(g); 
               
          }
          if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
              da.y1lr.push(g);  
          } 
          if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
              da.y5lr.push(g);
          }  

      }


  }
  if(deal[i].type == "DEAL_TYPE_SELL" || deal[i].type == "DEAL_TYPE_BUY"){
    //winrate
    var g = deal[i].profit + deal[i].commission + deal[i].swap;
    if(new Date(deal[i].brokerTime) <= new Date()){
      
      da.d1wr.push(g);
  }
  if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
      da.w1wr.push(g);
  }
  if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
      da.m1wr.push(g); 
  }
  if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
      da.m3wr.push(g); 
       
  }
  if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
      da.y1wr.push(g);  
  } 
  if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
      da.y5wr.push(g);
  }  
  }
if(deal[i].type == "DEAL_TYPE_BALANCE" || deal[i].type == "DEAL_TYPE_SELL" || deal[i].type == "DEAL_TYPE_BUY"){
  counter++;
  if(counter > 1){
  var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      d.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100});
      if(new Date(deal[i].brokerTime) <= new Date()){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqd1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100});
      } 
      if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqw1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
      if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqm1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
      if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqm3.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
      if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqy1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      } 
      if(new Date(deal[i].brokerTime) <= new Date() && new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqy5.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
  } else {
  var balance = deal[i].profit + deal[i].commission + deal[i].swap;
  d.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100});
}
}
}
var d1wr = 0;
var w1wr = 0;
var m1wr = 0;
var m3wr = 0;
var y1wr = 0;
var y5wr = 0;

var d1lr = 0;
var w1lr = 0;
var m1lr = 0;
var m3lr = 0;
var y1lr = 0;
var y5lr = 0;

for(i = 0;i<da.d1wr.length;i++) {
  if(da.d1wr[i] > 0){
      d1wr++;
  }
}
for(i = 0;i<da.w1wr.length;i++) {
  if(da.w1wr[i] > 0){
      w1wr++;
  }
}
for(i = 0;i<da.m1wr.length;i++) {
  if(da.m1wr[i] > 0){
      m1wr++;
  }
}
for(i = 0;i<da.m3wr.length;i++) {
  if(da.m3wr[i] > 0){
      m3wr++;
  }
}
for(i = 0;i<da.y1wr.length;i++) {
  if(da.y1wr[i] > 0){
      y1wr++;
  }
}
for(i = 0;i<da.y5wr.length;i++) {
  if(da.y5wr[i] > 0){
      y5wr++;
  }
}

for(i = 0;i<da.d1lr.length;i++) {
  if(da.d1lr[i] > 0){
      d1lr++;
  }
}
for(i = 0;i<da.w1lr.length;i++) {
  if(da.w1lr[i] > 0){
      w1lr++;
  }
}
for(i = 0;i<da.m1lr.length;i++) {
  if(da.m1lr[i] > 0){
      m1lr++;
  }
}
for(i = 0;i<da.m3lr.length;i++) {
  if(da.m3lr[i] > 0){
      m3lr++;
  }
}
for(i = 0;i<da.y1lr.length;i++) {
  if(da.y1lr[i] > 0){
      y1lr++;
  }
}
for(i = 0;i<da.y5lr.length;i++) {
  if(da.y5lr[i] > 0){
      y5lr++;
  }
}

da.d1wr.push(Math.round((d1wr/da.d1wr.length) * 100));
da.w1wr.push(Math.round((w1wr/da.w1wr.length) * 100));
da.m1wr.push(Math.round((m1wr/da.m1wr.length) * 100));
da.m3wr.push(Math.round((m3wr/da.m3wr.length) * 100));
da.y1wr.push(Math.round((y1wr/da.y1wr.length) * 100));
da.y5wr.push(Math.round((y5wr/da.y5wr.length) * 100));

da.d1lr.push(Math.round((d1lr/da.d1lr.length) * 100));
da.w1lr.push(Math.round((w1lr/da.w1lr.length) * 100));
da.m1lr.push(Math.round((m1lr/da.m1lr.length) * 100));
da.m3lr.push(Math.round((m3lr/da.m3lr.length) * 100));
da.y1lr.push(Math.round((y1lr/da.y1lr.length) * 100));
da.y5lr.push(Math.round((y5lr/da.y5lr.length) * 100));

if(da.eqd1.length != 0){
  da.d1tr.push(Math.round(((da.eqd1[da.eqd1.length - 1].y - da.eqd1[0].y) / da.eqd1[da.eqd1.length - 1].y) * 100));

}
if(da.eqw1.length != 0){
  da.w1tr.push(Math.round(((da.eqw1[da.eqw1.length - 1].y - da.eqw1[0].y) / da.eqw1[da.eqw1.length - 1].y) * 100));

}
if(da.eqm1.length != 0){
  da.m1tr.push(Math.round(((da.eqm1[da.eqm1.length - 1].y - da.eqm1[0].y) / da.eqm1[da.eqm1.length - 1].y) * 100));

}
if(da.eqm3.length != 0){
  da.m3tr.push(Math.round(((da.eqm3[da.eqm3.length - 1].y - da.eqm3[0].y) / da.eqm3[da.eqm3.length - 1].y) * 100));

}
if(da.eqy1.length != 0){
  da.y1tr.push(Math.round(((da.eqy1[da.eqy1.length - 1].y - da.eqy1[0].y) / da.eqy1[da.eqy1.length - 1].y) * 100));

}
if(da.eqy5.length != 0){
  da.y5tr.push(Math.round(((da.eqy5[da.eqy5.length - 1].y - da.eqy5[0].y) / da.eqy5[da.eqy5.length - 1].y) * 100));

}
// da.d1tr.push(Math.round(((da.eqd1[da.eqd1.length - 1].y - da.eqd1[0].y) / da.eqd1[da.eqd1.length - 1].y) * 100));
// da.w1tr.push(Math.round(((da.eqw1[da.eqw1.length - 1].y - da.eqw1[0].y) / da.eqw1[da.eqw1.length - 1].y) * 100));
// da.m1tr.push(Math.round(((da.eqm1[da.eqm1.length - 1].y - da.eqm1[0].y) / da.eqm1[da.eqm1.length - 1].y) * 100));
// da.m3tr.push(Math.round(((da.eqm3[da.eqm3.length - 1].y - da.eqm3[0].y) / da.eqm3[da.eqm3.length - 1].y) * 100));
// da.y1tr.push(Math.round(((da.eqy1[da.eqy1.length - 1].y - da.eqy1[0].y) / da.eqy1[da.eqy1.length - 1].y) * 100));
// da.y5tr.push(Math.round(((da.eqy5[da.eqy5.length - 1].y - da.eqy5[0].y) / da.eqy5[da.eqy5.length - 1].y) * 100));

return da;

}

//app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + "/functions"));

async function addDocument(db, cID, sID, fing, k, e, tID) {
  // [START add_document]
  // [START firestore_data_set_id_random_collection]
  // Add a new document with a generated id.
  members.push({
    customerId: cID,
    subscription: sID,
    fingerprint: fing,
    key: k,
    email: e,
    telegramId: tID,
    active: 'true'
  })
  const res = await db.collection('ggmembers').add({
    customerId: cID,
    subscription: sID,
    fingerprint: fing,
    key: k,
    email: e,
    telegramId: tID,
    active: 'true'
  });

}

app.get("/", (req, res) => {
    const filePath = path.resolve("./index.html");
    res.sendFile(filePath);
});

app.get("/fund", (req, res) => {
  const filePath = path.resolve("./fund.html");
  res.sendFile(filePath);
});

app.get("/choosefund", (req, res) => {
  const filePath = path.resolve("./choosefund.html");
  res.sendFile(filePath);
});

app.get("/app/login", function (req, res) {
    const filePath = path.resolve("./mainlogin.html");
    res.sendFile(filePath);
});

app.get("/app/subscribe", function (req, res) {
    const filePath = path.resolve("./mainsubscription.html");
    res.sendFile(filePath);
});

app.get("/app/trade", function (req, res) {
    const filePath = path.resolve("./createaccount.html");
    res.sendFile(filePath);
});

app.get("/app/main", function (req, res) {
  const filePath = path.resolve("./main.html");
  res.sendFile(filePath);
});

app.get("/app/signup", function (req, res) {
  const filePath = path.resolve("./signup.html");
  res.sendFile(filePath);
});

app.get("/backtest", function (req, res) {
  const filePath = path.resolve("./backtest.html");
  res.sendFile(filePath);
})

app.get("/admin", function (req, res) {
  const filePath = path.resolve("./admin.html");
  res.sendFile(filePath);
})

app.get("/thankyou", function (req, res) {
  const filePath = path.resolve("./thankyou.html");
  res.sendFile(filePath);
});

var emdb = [];

app.get("/newsletter", (req, res) => {
  var e = req.query.email;

  //var valid;
  //isEmailValid(e).then((r)=>{console.log(r); valid = r.valid}).catch((err)=>{console.log(err)});

    return db.collection("emaildb").doc().create({email: e, sent: 1,subscribed: 1}).then(()=>{
      return res.status(200).send();
    }).catch((err)=>{
      console.log(err)
      return res.status(400).send();
    });
});

// app.get("/auth", function (req,res) {
//   const k = req.query.key;
//   if(k == "1234"){
//     res.status(200).send();
//   } else {
//     res.status(400).send();
//   }
// });

// app.get("/userInfo", function (req,res) {
//   const broker = req.query.key;
//   if(k == "1234"){
//     res.status(200).send();
//   } else {
//     res.status(400).send();
//   }
// })

app.get("/app/create", (req, res) => {
  const sessionCookie = req.cookies.__session || "";
  var n = req.query.n;
  return admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((x) => {
      return db.collection("clients").doc(x.uid).create({email: x.email, number: n, status: "sgnup", customer: "na", accountId: "na", sub: "na", fingerprint: "na", paymethod: "na", payintent: "na"}).then(()=>{return res.status(200).send();}).catch((err)=>{return res.status(400).send();});
    }).catch((err)=>{
      return res.status(400).send({err: err})
    })
  // await createUser().then(()=>{
  //   return res.status(200).send({status: "success"});
  // }).catch((err)=>{
  //   return res.status(400).send({status: err});
  // })
})

app.get("/app/verify", async function (req, res) {
  var q = url.parse(req.url,true).query;
  if(q.session_id != undefined){

  var paymeth;
  var custID;
  var fingerprint;
  var sub;
  var payintent;

  await stripe.checkout.sessions.retrieve(
    sess
  ).then((cust) => {
    custID = cust.customer;
    email = cust.customer_details.email;
    sub = cust.subscription;
    payintent = cust.payment_intent;
    return true
    
  }).catch(()=>{return false})

  await stripe.subscriptions.retrieve(
    sub
  ).then((p) => {
    paymeth = p.default_payment_method
    return true
  })

  await stripe.paymentMethods.retrieve(
    paymeth
  ).then((card) => {
    fingerprint = card.card.fingerprint
    return true
  })

  admin
  .auth()
  .verifySessionCookie(sessionCookie, true /** checkRevoked */)
  .then(async (x) => {
    await db.collection("clients").doc(x.uid).update({customer: custID, fingerprint: fingerprint, subscription: sub, status: "paid", payintent: payintent, paymethod: paymeth})


  });

  }
  const filePath = path.resolve("./verify.html");
  res.sendFile(filePath);
})


app.get("/app", async function(req, res) {
//   var sess = req.params.ses;
//   var paymeth;
//   var custID;
//   var fingerprint;
//   var sub;

//   if(sess != "" || sess != undefined){
//   await stripe.checkout.sessions.retrieve(
//     sess
//   ).then((cust) => {
//     custID = cust.customer;
//     email = cust.customer_details.email;
//     sub = cust.subscription;
//     return true
    
//   }).catch(()=>{return false})

//   await stripe.subscriptions.retrieve(
//     sub
//   ).then((p) => {
//     paymeth = p.default_payment_method
//     return true
//   })

//   await stripe.paymentMethods.retrieve(
//     paymeth
//   ).then((card) => {
//     fingerprint = card.card.fingerprint
//     return true
//   })

//   admin
//   .auth()
//   .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//   .then(async (x) => {
//     await db.collection("clients").doc(x.uid).update({customer: custID, fingerprint: fingerprint, subscription: sub, status: "paid"})


//   });
// }


  const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      const user = await db.collection("clients").doc(x.uid).get();
      const u = user.data();
      if(user.id === x.uid){
        if(u.status === "sgnup"){
          res.redirect("/app/main");
        } else if(u.status === "paid"){
          res.redirect("/app/trade")
        } else if(u.status === "active"){
          var s = "/app/main"
          res.redirect(s);
        }
      }
    })
    .catch((error) => {
      res.redirect("/app/login");
    });

});

//+-------------------------------------------------------------------------------------------------

app.get('/init', (req, res) => {
  var s = req.query.server;
  var k = req.query.key;
  var a = req.query.account;
  var snapshot = db.collection("clients").where("key", "==", k).get();

  if (snapshot.empty) {
    return res.status(400);
  }  

  snapshot.forEach(async (doc) => {
    if(a == doc.account){
    return await db.collection("clients").doc(doc.id).update({activations: doc.activations + 1}).then((r) => {
      return res.status(200);
    }).catch((err)=>{
      return res.status(400);
    })
  }
  });

});

app.get('/deinit', (req, res) => {
  var s = req.query.server;
  var k = req.query.key;
  var a = req.query.account;
  var snapshot = db.collection("clients").where("key", "==", k).get();

  if (snapshot.empty) {
    return res.status(400);
  }  

  snapshot.forEach(async (doc) => {
    if(a == doc.account){
    return await db.collection("clients").doc(doc.id).update({activations: doc.activations - 1}).then((r) => {
      return res.status(200);
    }).catch((err)=>{
      return res.status(400);
    })
  }
  });

});

app.get('/d', (req, res) => {
  var g = req.query.gain;
  var k = req.query.key;
  var a = req.query.account;
  var snapshot = db.collection("clients").where("key", "==", k).get();

  if (snapshot.empty) {
    return res.status(404);
  }  

  snapshot.forEach(async (doc) => {
    if(a == doc.account){
    return await db.collection("clients").doc(doc.id).update({gain: doc.gain + g}).then((r) => {
      return res.status(200);
    }).catch((err)=>{
      return res.status(404);
    })
  }
  });

});
//+-------------------------------------------------------------------------------------------------
app.get("/data", (req, res) => {
  var d = req.query.date;
  var e = req.query.equity;
  var key = req.query.key;

  if(d == "" || e == "" || key == ""){
    return res.status(400).send();
  }

  if(key = "access") {
    var sp = db.collection("data").get();

    if(sp.empty) {
      return res.status(404);
    }

    snapshot.forEach(async (doc) => {
      var g = JSON.parse(doc.data);
      var da = g.push(`{date: ${d}, equity: ${e}}`)
      var dat = JSON.stringify(da);
      return await db.collection("data").doc(doc.id).update({data: dat}).then((r) => {
        return res.status(200);
      }).catch((err)=>{
        return res.status(404);
      });
    });
  }
});

app.get("/gettrade", (req, res) => {
  var b = req.query.balance;
  var d = req.query.date;
  var a = req.query.account;
  var k = req.query.key;
  var snapshot = db.collection("clients").where("key", "==", k).get();

  if (snapshot.empty) {
    return res.status(404);
  }  

  snapshot.forEach(async (doc) => {
    var g = `{date: ${d}, balance: ${b}}`;
    var c = JSON.parse(doc.data);
    var daa = c.push(g);
    var da = JSON.stringify(daa);
    return await db.collection("clients").doc(doc.id).update({data: da}).then((r) => {
      return res.status(200);
    }).catch((err)=>{
      return res.status(404);
    })
  });



})

app.get("/getdata", (req, res)=>{
  const sessionCookie = req.cookies.__session || "";
  var uid = "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((id) => {
      uid = id.uid;
      var sn = db.collection.doc(uid).get();
      if (snapshot.empty) {
        return res.status(404);
      }

      return res.status(200).send(JSON.parse(sn.data));
    })
})

app.get('/verify', async(req, res) => {
  // const sessionCookie = req.cookies.__session || "";
  // var uid = "";
  // admin
  //   .auth()
  //   .verifySessionCookie(sessionCookie, true /** checkRevoked */)
  //   .then((id) => {
  //     uid = id.uid;
  //   }).then(async ()=>{

  var api_key = generateApiKey({method: 'base32'});
    
    //const urlParams = new URLSearchParams(window.location.search);
  const sess = req.query.session_id
  var paymeth = "";
  var custID = "";
  var email = "";
  var fingerprint = "";
  var sub = "";

  await stripe.checkout.sessions.retrieve(
    sess
  ).then((cust) => {
    custID = cust.customer;
    email = cust.customer_details.email;
    sub = cust.subscription;
    return true
    
  })

  await stripe.subscriptions.retrieve(
    sub
  ).then((p) => {
    paymeth = p.default_payment_method
    return true
  })

  await stripe.paymentMethods.retrieve(
    paymeth
  ).then((card) => {
    fingerprint = card.card.fingerprint
    return true
  })

  await db.collection("clients").doc().update({status: "paid", customer_email: email, key: api_key,customer: custID, fingerprint: fingerprint, subscriptionId: sub, paymethod: paymeth}).then(()=>{
    sendEmail(email, api_key, "Thank You!")
    res.redirect('/thankyou')
  }).catch(()=> {
      res.redirect('/')
    })


    function wbe(s,k){
      const htmlOutput = mjml2html(`
      <mjml>
      <mj-body background-color="#ffffff">
        <mj-section background-color="#ffffff" padding-bottom="0px" padding-top="0">
          <mj-column vertical-align="top" width="100%">
            <mj-image src="http://gurugains.com/gglogo.png" alt="" align="center" border="none" width="200px" padding-left="0px" padding-right="0px" padding-bottom="0px" padding-top="0"></mj-image>
            <mj-text align="center" font-size="35px">GuruGains, Inc</mj-text>
          </mj-column>
        </mj-section>
        <mj-section background-color="#009FE3" padding-bottom="0px" padding-top="0">
          <mj-column border-bottom="2px solid #ffffff"vertical-align="top" width="100%">
            <mj-text align="left" color="#ffffff" font-size="25px" font-weight="bold" font-family="open Sans Helvetica, Arial, sans-serif" padding-bottom="30px" padding-top="50px">${s}</mj-text>
          </mj-column>
        </mj-section>
        <mj-section background-color="#009fe3" padding-bottom="20px" padding-top="20px">
          <mj-column vertical-align="middle" width="100%">
            <mj-text align="left" color="#ffffff" font-size="18px" font-family="open Sans Helvetica, Arial, sans-serif">Welcome to GuruGains: Premium Stocks and Options Signals</mj-text>
            <mj-text align="left" color="#ffffff" font-size="18px" font-family="open Sans Helvetica, Arial, sans-serif">Your membership key is <strong>key-${k}</strong></mj-text>
            <mj-text align="left" color="#ffffff" font-size="17px" font-family="open Sans Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px">Send GuruGainsBot your membership key on Telegram to start recieving premium stocks and options signals! You can find him here!</mj-text>
            
            <mj-button background-color="#FFFFFF" color="#000000" padding-bottom="35px" href="https://telegram.me/gurugainsbot">@GuruGainsBot</mj-button>
           <mj-text align="center" color="#ffffff" font-size="22px" font-family="open Sans Helvetica, Arial, sans-serif">Want some market wisdom? <br /><br />Follow us on Facebook or Twitter!</mj-text>
            <mj-section>
              <mj-column vertical-align="middle">
                <mj-social icon-size="50%" padding="10%">
            <mj-social-element name="facebook" align="center" font-size="22px" font-weight="bold" background-color="#009fe3" border-radius="10px" color="#FFFFFF" font-family="open Sans Helvetica, Arial, sans-serif" href="https://www.facebook.com/GuruGains-103730428385356">Facbook</mj-social-element>
                </mj-social>
              </mj-column>
                <mj-column>
                  <mj-social icon-size="50%" padding="10%">
            <mj-social-element name="twitter" align="center" font-size="22px" font-weight="bold" background-color="#009fe3" border-radius="10px" color="#FFFFFF" font-family="open Sans Helvetica, Arial, sans-serif" href="https://twitter.com/GuruGainsBot">Twitter</mj-social-element>
                  </mj-social>
                </mj-column>
            </mj-section>
            <mj-text align="left" color="#ffffff" font-size="15px" font-family="open Sans Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px">We&apos;re really excited you&apos;ve decided to give us a try. In case you have any questions, feel free to reach out to us at gurugainsbot@gmail.com.</mj-text>
            <mj-text align="left" color="#ffffff" font-size="15px" font-family="open Sans Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px">Thanks, <br /><br/> GuruGains, Inc</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
    `)
      return htmlOutput.html
    }
    function sendEmail(e,k,s){
    
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'support@icarusinvestments.cloud',
          pass: 'hacker99667'
        }
      });
      
      var mailOptions = {
        from: 'support@icarusinvestments.cloud',
        to: e,
        subject: `ICARUS X ACCESS KEY ${k}`,
        html: wbe(s, k)
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    
    }

  // if(validateUser(email, fingerprint)){
  //   addDocument(db, custID, sub, fingerprint, k, email, 'none');
  //   sendEmail(email,k,'The Last Step')
  //   res.send('success')
  // } else {
  //   addDocument(db, custID, sub, fingerprint, k, email, 'none');
  //   sendEmail(email,k,'Welcome Back!')
  //   await stripe.subscriptions.update(
  //     sub,
  //     {trial_end:'now'}
  //   );
  //   res.send('welcomeback')
  // }
      
  
})

function getPP(x){
  switch(x){

    case "TradersWay-Live2":
      return "0f0293b4-92e1-41b0-a0f2-bfd327884169"
    break;

    case "TradersWay-Demo":
      return "6af45d2a-58f5-486e-9c08-f1adc7bb881c"
    break;

    case "TradersWay-Live":
      return "de57eb6d-cd89-4fa1-b283-80d0c14f2143"
    break;

    case "ICMarkets-Demo01":
      return "58ce59fb-2920-4a17-9627-f33b32c6c116"
    break;

    case "ICMarkets-Demo02":
      return "170d2f23-ea55-40dd-b529-375d334ffba3"
    break;

    case "ICMarkets-Demo03":
      return "b3c9f606-7203-4aaf-94a8-c4c556bef537"
    break;

    case "ICMarkets-Demo04":
      return "b4c35eb0-0a42-45e1-a9d9-365726c3c94b"
    break;

    case "ICMarketsEU-Demo01":
      return "f1a45d58-5ea4-41b5-9d35-0d6e82821d1c"
    break;

    case "ICMarketsEU-Demo02":
      return "9a0c27cb-8602-416c-b508-2d285bcc9d0f"
    break;

    case "ICMarketsEU-Demo03":
      return "eceee430-66f9-4384-b5f6-431cb6af5111"
    break;

    case "ICMarketsEU-Live17":
      return "2546584a-bbfd-4343-9505-a51f986dfda6"
    break;

    case "ICMarketsEU-Live18":
      return "a53b892e-94fb-4925-8c33-f1c02b766aa0"
    break;

    case "ICMarketsGRP-Demo01":
      return "b784e562-733e-4876-8147-045f1238d02c"
    break;

    case "ICMarketsInternational-Demo05":
      return "38f5d5ef-dcdf-4fe6-a768-1fc740096d8a"
    break;

    case "ICMarketsInternational-Live29":
      return "ce581cc6-0c4f-484a-b38c-649ffbadc21b"
    break;

    case "ICMarketsInternational-Live30":
      return "50fb7464-54eb-4f6a-8b71-3cafad7a1054"
    break;

    case "ICMarkets-Live01":
      return "0f028ac3-6d07-45ff-8540-5281ff9a5253"
    break;

    case "ICMarkets-Live02":
      return "c8f14967-ccce-4e38-8d20-19d4b835484e"
    break;

    case "ICMarkets-Live03":
      return "ae4dfd07-ad86-4c62-af92-7d0083f43179"
    break;

    case "ICMarkets-Live04":
      return "308d1ccb-1c0a-436b-ad62-57ca64b1cca2"
    break;

    case "ICMarkets-Live05":
      return "11f5dd6e-0026-4f94-ba14-40372ce894f4"
    break;

    case "ICMarkets-Live06":
      return "cd89ca68-cf68-400e-b290-b83066c10ae2"
    break;

    case "ICMarkets-Live07":
      return "77f69137-1c07-445e-bb2a-cbf67da75771"
    break;

    case "ICMarkets-Live08":
      return "49c879bd-75fc-4c8a-bfe0-3f14fac72811"
    break;

    case "ICMarkets-Live09":
      return "50346f55-426c-45ca-9be6-226ccd31d819"
    break;

    case "ICMarkets-Live10":
      return "ccf1d51e-2d26-4715-a825-472a7bc1cd3d"
    break;

    case "ICMarkets-Live11":
      return "b6a5ceaf-e7be-44c6-bb8e-f9fc7f58fdad"
    break;

    case "ICMarkets-Live12":
      return "9980eb59-fab2-40ad-a624-e9902ba945c7"
    break;

    case "ICMarkets-Live14":
      return "4cdf14f0-5f54-45fc-ae6e-d5e376ebaaa3"
    break;

    case "ICMarkets-Live15":
      return "31e96b29-54e6-4fe1-a274-cdd76e164b92"
    break;

    case "ICMarkets-Live16":
      return "b055dad6-c218-47b1-9891-9729b1950591"
    break;

    case "ICMarkets-Live17":
      return "f3a4c722-6fad-4810-bd4b-2cda3a856cdc"
    break;

    case "ICMarkets-Live18":
      return "f81e3b16-1c8a-4112-bea2-12f4a5070d40"
    break;

    case "ICMarkets-Live19":
      return "666dcfad-ad9b-475a-aaf7-1cec1775414f"
    break;

    case "ICMarkets-Live20":
      return "fb79e262-8a7c-4da7-b2a8-f5469f07c700"
    break;

    case "ICMarkets-Live22":
      return "00f95c33-2582-4a63-a115-110d8183ca3f"
    break;

    case "ICMarkets-Live23":
      return "5323d3f8-4f36-4de3-9e7a-fdb219fa3813"
    break;

    case "ICMarkets-Live24":
      return "b7aa602f-077e-46c4-8b30-7330004ed1f6"
    break;

    case "ICMarketsSC-Demo01":
      return "bd9a6802-5e40-4a12-8242-5ac4e5b03653"
    break;

    case "ICMarketsSC-Demo02":
      return "b7522284-e93e-4d93-a093-6f95e27c6cf1"
    break;

    case "ICMarketsSC-Demo03":
      return "ad0a8b6e-6e55-4d96-b0d4-0432b0546c82"
    break;

    case "ICMarketsSC-Demo04":
      return "69824676-1384-497f-8a97-9fa4772e55b8"
    break;

    case "ICMarketsSC-Live01":
      return "72479143-2926-469a-91fb-6a350a0dd3bb"
    break;

    case "ICMarketsSC-Live02":
      return "60a16cfb-5ecb-436e-a897-d829b0d0e169"
    break;

    case "ICMarketsSC-Live03":
      return "ffaa7e9d-eb85-4046-a1d1-8c398c24ce0c"
    break;

    case "ICMarketsSC-Live04":
      return "bd02559a-0923-4b50-a5b6-42c26b29ac70"
    break;

    case "ICMarketsSC-Live05":
      return "b9def72f-da61-4d08-acd6-7c6b340b9ee9"
    break;

    case "ICMarketsSC-Live06":
      return "1f46d5e3-838e-4155-be91-fe3effdfa7da"
    break;

    case "ICMarketsSC-Live07":
      return "bb90e580-3abd-4775-9af6-39ff53c866ba"
    break;

    case "ICMarketsSC-Live08":
      return "a1f1ecc2-6112-4a1c-98b8-31fc97889b82"
    break;

    case "ICMarketsSC-Live09":
      return "1239a7e4-6d10-4272-9fbe-621038d35bc5"
    break;

    case "ICMarketsSC-Live10":
      return "7a40a832-ce82-477f-b256-e9bd040624a1"
    break;

    case "ICMarketsSC-Live11":
      return "549081d4-00ed-4202-b34c-50707af92e25"
    break;

    case "ICMarketsSC-Live12":
      return "1ec72d40-5aa7-4d3c-8d0f-f297cabfa8e9"
    break;

    case "ICMarketsSC-Live14":
      return "c179f0ed-7c34-45a4-89c5-2911e4ac321b"
    break;

    case "ICMarketsSC-Live15":
      return "2dd73589-9b58-4d76-a72a-b21e9e3fc36a"
    break;

    case "ICMarketsSC-Live16":
      return "555bd41c-df37-4ba9-945d-cb60d951f8d9"
    break;

    case "ICMarketsSC-Live17":
      return "f5e1e65c-c9e8-4afd-8844-ffd9d36eaf36"
    break;

    case "ICMarketsSC-Live18":
      return "ae7089f6-189a-4803-ba91-6ed8eaa735fa"
    break;

    case "ICMarketsSC-Live19":
      return "499ed6de-a49c-4f7d-bab0-1d3cba3f4c94"
    break;

    case "ICMarketsSC-Live20":
      return "7a2879fd-4ba7-4746-8a2b-dc49710c0e6d"
    break;

    case "ICMarketsSC-Live21":
      return "16b77288-2d4a-4978-a5fe-7729cf7be169"
    break;

    case "ICMarketsSC-Live22":
      return "f4d6fd7e-abff-44ed-a790-bfc5073bff26"
    break;

    case "ICMarketsSC-Live23":
      return "28b79079-6b3f-4cd2-84da-cd641706cf9b"
    break;

    case "ICMarketsSC-Live24":
      return "e5c6aad3-5238-4b41-95a0-72a234e4b106"
    break;

    case "ICMarketsSC-Live25":
      return "a305f01b-401e-4343-ba89-93d008a4ca52"
    break;

    case "ICMarketsSC-Live26":
      return "abe62ee7-98d9-4d54-8df8-e0611233ed48"
    break;

    case "ICMarketsSC-Live27":
      return "5ca1e309-1ab0-44f6-9865-3e405feee30d"
    break;

    case "ICMarketsSC-Live29":
      return "167abcce-b291-4b83-9517-6201e1e1fd4d"
    break;

    case "ICMarketsSC-Live30":
      return "798d8643-abb3-4e69-9577-570ff9e1f5f3"
    break;

    default:
      return false;
    break;



  }

}

app.post("/app/addaccount", async function(req, res) {
  const login = req.body.login
  const pass = req.body.password
  const server = req.body.server

  if(login !== "" && pass !== "" && server !== ""){
    const x = getPP(server);
    const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (id) => {
      
      
      const account = await api.metatraderAccountApi.createAccount({
        name: id.email,
        type: 'cloud',
        login: login,
        // password can be investor password for read-only access
        password: pass,
        server: server,
        provisioningProfileId: x,
        application: 'MetaApi',
        magic: 123456,
        quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
        reliability: 'high' // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
      }).then(async (x) => {
        //console.log(x)
        //console.log(x._data._id)
        await db.collection("clients").doc(id.uid).update({accountId: x._data._id, status: "active"});
        return res.status(200).send();
      }).catch((err)=> {
        return console.log(err)
    })

      // const expert = await account.createExpertAdvisor('expertId', {
      //   period: '1h',
      //   symbol: 'EURUSD',
      //   preset: 'a2V5MT12YWx1ZTEKa2V5Mj12YWx1ZTIKa2V5Mz12YWx1ZTMKc3VwZXI9dHJ1ZQ'
      // });
      // await expert.uploadFile('/path/to/custom-ea');
    })
    .catch((error) => {
      res.redirect("/app");
    });

  }
})

app.post("/app/updateaccount", async function(req, res) {
  const login = req.body.login
  const pass = req.body.pass
  const server = req.body.server

  if(login !== "" && pass !== "" && server !== ""){
    const x = getPP(server);
    const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (id) => {
      
      
      const account = await api.metatraderAccountApi.update({
        type: 'cloud',
        login: login,
        // password can be investor password for read-only access
        password: pass,
        server: server,
        provisioningProfileId: x,
        application: 'MetaApi'
      }).then(async (x) => {
        return await db.collection("clients").doc(id.uid).update({accountId: x._data._id});
      }).then(()=>{
        return res.status(200).send();
      }).catch((err)=> {
        return res.status(400).send();
    })

      // const expert = await account.createExpertAdvisor('expertId', {
      //   period: '1h',
      //   symbol: 'EURUSD',
      //   preset: 'a2V5MT12YWx1ZTEKa2V5Mj12YWx1ZTIKa2V5Mz12YWx1ZTMKc3VwZXI9dHJ1ZQ'
      // });
      // await expert.uploadFile('/path/to/custom-ea');
    })
    .catch((error) => {
      res.redirect("/app");
    });

  }
})

app.get('/app/getinfo', function(req,res) {
  const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {

      const user = await db.collection("clients").doc(x.uid).get();
      const u = user.data();

      if(user.empty){
        res.status(400).send();
      }

      if(u.accountId != "") {

        res.send({acc: u.accountId});
        

      }


    });

})

var handleFetchResult = function(result) {
  if (!result.ok) {
    return result.json().then(function(json) {
      if (json.error && json.error.message) {
        throw new Error(result.url + ' ' + result.status + ' ' + json.error.message);
      }
    }).catch(function(err) {
      console.log(err);
      throw err;
    });
  }
  return result.json();
};

app.get('/app/getmetrics', function(req, res) {

  const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {

      const user = await db.collection("clients").doc(x.uid).get();
      const u = user.data();
      if(u.accountId != "") {
        fetch(`https://metastats-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${u.accountId}/metrics`, {
				  method: "POST",
				  headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"auth-token": token,
				  }
        }).then((d)=>{
          res.send(d)
        
        }).catch(()=>{
          res.status(400).send();
        })

      }


    });

})

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
  
);

app.post('/create-donation', async (req,res) => {
  var a = req.body.amount * 100;
  const domainURL = process.env.DOMAIN;
  try {
    const session = await stripe.checkout.sessions.create({
      submit_type: 'donate',
      payment_method_types: ["card"],
      line_items: [{
        amount: a,
        name: 'Donation',
        currency: 'USD',
        quantity: 1
      }],
      metadata: {
        'cause': 'ICARUS_INVESTMENTS_FUND',
      },
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/thankyou`,
      cancel_url: `${domainURL}/`
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

})

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post("/create-checkout-session", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const { priceId } = req.body;
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
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/`,
      consent_collection: {
        promotions: 'auto',
      },
      after_expiration: {
        recovery: {
          enabled: true,
        },
      }
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

app.post("/create-lifetime-session", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const { priceId } = req.body;
  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the form
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/`,
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
    monPrice: process.env.MON_PRICE_ID,
    lifetimePrice: process.env.LIFETIME_PRICE_ID
  });
});

app.get('/create-customer-portal', async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID. 
  // Typically this is stored alongside the authenticated user in your database.
  //var g = req.body.cus
  //const { sessionId } = req.body;
  //const checkoutsession = await stripe.checkout.sessions.retrieve(sessionId);

  const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (id) => {
  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.

  const u = await db.collection('clients').doc(id.uid).get();

  if (u.empty) {
    res.redirect('/app/login');
  }  

  
    var d = u.data();
    const returnUrl = process.env.DOMAIN;

  return await stripe.billingPortal.sessions.create({
    customer: d.customer,
    return_url: returnUrl + '/app/main',
  });
    
  
}).then((c)=>{
  res.send({billingurl: c.url});
}).catch(()=>{
  res.redirect("/app/login")
})
});

app.get("/billing", async (req, res) => {

  const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {
      const user = db.collection("clients").doc(x.uid).get();
      const u = user.data();
      if(user.id === x.uid){

        const returnUrl = process.env.DOMAIN;

  const portalsession = await stripe.billingPortal.sessions.create({
    customer: user.customer,
    return_url: returnUrl + "/app",
  });

  res.send({
    url: portalsession.url,
  });
        
      }
    })
    .catch((error) => {
      res.redirect("/app");
    });

})

app.post('/customer-portal', async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID. 
  // Typically this is stored alongside the authenticated user in your database.
  var g = req.body.cus
  //const { sessionId } = req.body;
  //const checkoutsession = await stripe.checkout.sessions.retrieve(sessionId);

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = process.env.DOMAIN;

  const portalsession = await stripe.billingPortal.sessions.create({
    customer: g,
    return_url: returnUrl + "/app",
  });

  res.send({
    url: portalsession.url,
  });
});


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
    } else if(eventType === "customer.subscription.updated"){ 
      handleCustomer(data.object.customer, data.object.default_payment_method).then(()=>{return res.sendStatus(200);}).catch((err)=>{return res.send(err);})
    } else if(eventType === "customer.subscription.deleted"){
      disableCustomer(data.object.customer).then(()=>{return res.sendStatus(200);}).catch((err)=>{return res.send(err);})
    } else if(eventType === "payment_intent.payment_failed"){
      disableCustomer(data.object.customer).then(()=>{return res.sendStatus(200);}).catch((err)=>{return res.send(err);})
    } else if(eventType === "checkout.session.expired"){
      
    } else {
  
      return res.sendStatus(200);
    }
  });

const csrfMiddleware = csrf({ cookie: true });
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().verifyIdToken(idToken).then(function(decodedClaims) {
    // In this case, we are enforcing that the user signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - decodedClaims.auth_time < 5 * 60) {
      return admin.auth().createSessionCookie(idToken, {expiresIn: expiresIn});
    }
    throw new Error('UNAUTHORIZED REQUEST!');
  }).then(function(sessionCookie) {
    // Note httpOnly cookie will not be accessible from javascript.
    // secure flag should be set to true in production.
    const options = {maxAge: expiresIn, secure: false /** to test in localhost */};
    res.cookie('__session', sessionCookie, options);
    res.end(JSON.stringify({status: 'success'}));
  })
  .catch(function(error) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
  });
  // admin
  //   .auth()
  //   .createSessionCookie(idToken, { expiresIn })
  //   .then(async (sessionCookie) => {
  //       const options = { maxAge: expiresIn, httpOnly: true };
  //       res.cookie("session", sessionCookie, options);
  //       res.end(JSON.stringify({ status: "success" }));
  //     })    
  //     .catch((error) => {
  //       res.status(401).send("UNAUTHORIZED REQUEST!");
  //     })
    
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("__session");
  res.redirect("/app/login");
});



app.listen(5000, () => console.log(`Node server listening at https://.web.app:${5000}/`));

exports.app = functions.https.onRequest(app);


