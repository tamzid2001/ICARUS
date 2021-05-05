const functions = require("firebase-functions");
const express = require("express");
const app = express();
const path = require("path");
var admin = require("firebase-admin");
const bodyParser = require('body-parser');
const MetaAp = require('metaapi.cloud-sdk')
const MetaApi = MetaAp.default
//import MetaApi from 'metaapi.cloud-sdk';
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const url = require('url');

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
  var sub;
  var paymentIntent;
  if (snapshot.empty) {
    return false;
  }  

  snapshot.forEach(doc => {
    id = doc.id;
    sub = doc.subscriptionId;
    paymentIntent = doc.paymentIntent;
  });

  await removeAccount(doc.id).then((x)=>{
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

  return true;

}



async function handleCustomer(k) {
  const members = db.collection('clients');
  const snapshot = await members.where('customerId', '==', k).get();
  var id;
  var sub;
  var paymentIntent;
  if (snapshot.empty) {
    return false;
  } 

  snapshot.forEach(doc => {
    id = doc.id;
    sub = doc.subscriptionId;
    paymentIntent = doc.paymentIntent;
  });


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

          if(new Date(deal[i].brokerTime) >= new Date()){
      
              da.d1lr.push(g);
          }
          if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
              da.w1lr.push(g);
          }
          if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
              da.m1lr.push(g); 
          }
          if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
              da.m3lr.push(g); 
               
          }
          if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
              da.y1lr.push(g);  
          } 
          if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
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
  if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
      da.w1wr.push(g);
  }
  if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
      da.m1wr.push(g); 
  }
  if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
      da.m3wr.push(g); 
       
  }
  if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
      da.y1wr.push(g);  
  } 
  if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
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
      if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqw1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
      if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqm1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
      if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqm3.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      }
      if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
          var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
      da.eqy1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
      } 
      if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
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

async function createUser(){

}

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

app.get("/app/create", (req, res) => {
  const sessionCookie = req.cookies.__session || "";

  return admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((x) => {
      return db.collection("clients").doc(x.uid).create({email: x.email, status: "sgnup", customer: "na", accountId: "na"}).then(()=>{return res.status(200).send();}).catch((err)=>{return res.status(400).send();});
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

  await stripe.checkout.sessions.retrieve(
    sess
  ).then((cust) => {
    custID = cust.customer;
    email = cust.customer_details.email;
    sub = cust.subscription;
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
    await db.collection("clients").doc(x.uid).update({customer: custID, fingerprint: fingerprint, subscription: sub, status: "paid"})


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
      const user = db.collection("clients").doc(x.uid).get();
      const u = user.data();
      if(user.id === x.uid){
        if(u.status === "sgnup"){
          res.redirect("/app/subscribe");
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

app.get('/verify', async(req, res) => {
  const sessionCookie = req.cookies.__session || "";
  var uid = "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((id) => {
      uid = id.uid;
    }).then(async ()=>{

    
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

  await db.collection("clients").doc(uid).update({status: "paid", customer: custID, fingerprint: fingerprint}).then(()=>{
    res.redirect('/app/trade')
  })

    }).catch(()=> {
      res.redirect('/app/login')
    })


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

async function getPP(x){
  switch(x){

    case "Traders-Way-Live2":
      return "0f0293b4-92e1-41b0-a0f2-bfd327884169"
    break;

    case "Traders-Way-Live2":
      return "0f0293b4-92e1-41b0-a0f2-bfd327884169"
    break;

    case "Traders-Way-Live2":
      return "0f0293b4-92e1-41b0-a0f2-bfd327884169"
    break;

    case "Traders-Way-Live2":
      return "0f0293b4-92e1-41b0-a0f2-bfd327884169"
    break;

    case "Traders-Way-Live2":
      return "0f0293b4-92e1-41b0-a0f2-bfd327884169"
    break;

    default:

    break;



  }

}

app.post("/app/addaccount", async function(req, res) {
  const login = req.body.login.toString();
  const pass = req.body.pass.toString();
  const server = req.body.server.toString();

  if(login !== "" && pass !== "" && server !== ""){
    const x = await getPP(server);
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
        provisioningProfileId: x.id,
        application: 'MetaApi',
        magic: 123456,
        quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
        reliability: 'high' // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
      }).then(async (x) => {
        return await db.collection("clients").doc(id.uid).update({accountId: x.id, status: "active"});

      }).then(()=>{
        return res.redirect("/app/main")
      }).catch((err)=> {
        return res.redirect("/app/trade")
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
  const login = req.body.login.toString();
  const pass = req.body.pass.toString();
  const server = req.body.server.toString();

  if(login !== "" && pass !== "" && server !== ""){
    const x = await getPP(server);
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
        provisioningProfileId: x.id,
        application: 'MetaApi'
      }).then(async (x) => {
        return await db.collection("clients").doc(id.uid).update({accountId: x.id});
      }).then(()=>{
        return res.redirect("/app/main")
      }).catch((err)=> {
        return res.redirect("/app/trade")
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

      const user = db.collection("clients").doc(x.uid).get();
      const u = user.data();
      if(u.accountId != "") {

        await getUser(u.accountId).then((d)=>{
          res.send({data: d})
        
        }).catch(()=>{
          res.status(400).send();
        })

      }


    });

})

app.get('/app/getmetrics', function(req, res) {

  const sessionCookie = req.cookies.__session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(async (x) => {

      const user = db.collection("clients").doc(x.uid).get();
      const u = user.data();
      if(u.accountId != "") {
        fetch(`https://metastats-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${u.accountId}/metrics`, {
				  method: "POST",
				  headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"auth-token": token,
				  }
        }).then(handeError).then((d)=>{
          res.send({data: d})
        
        }).catch(()=>{
          res.status(400).send();
        })

      }


    });

})

const envFilePath = path.resolve(__dirname, './.env');
const env = require("dotenv").config({ path: envFilePath });
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
}

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
      cancel_url: `${domainURL}/app`,
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
    yearPrice: process.env.YEAR_PRICE_ID
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

  u.forEach(async(doc) => {
    var d = doc.data();
    const returnUrl = process.env.DOMAIN;

  const portalsession = await stripe.billingPortal.sessions.create({
    customer: d.customer,
    return_url: returnUrl + '/app/main',
  });
  res.redirect(portalsession.url);
    
  });

  
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
      handleCustomer(data.object.customer).then(()=>{return res.sendStatus(200);}).catch((err)=>{return res.send(err);})
    } else if(eventType === "customer.subscription.deleted"){
      disableCustomer(data.object.customer).then(()=>{return res.sendStatus(200);}).catch((err)=>{return res.send(err);})
    } else if(eventType === "payment_intent.payment_failed"){
      disableCustomer(data.object.customer).then(()=>{return res.sendStatus(200);}).catch((err)=>{return res.send(err);})
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
  })
  .then(function(sessionCookie) {
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
  res.clearCookie("session");
  res.redirect("/app/login");
});



app.listen(5000, () => console.log(`Node server listening at https://.web.app:${5000}/`));

exports.app = functions.https.onRequest(app);
