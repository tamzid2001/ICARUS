var token = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4YWYxZGI3ZDBjYzA1NmFkNzVkNmYwY2IzYmQ5ZTVlNiIsInBlcm1pc3Npb25zIjpbXSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaWF0IjoxNjE4NDM3NDI5LCJyZWFsVXNlcklkIjoiOGFmMWRiN2QwY2MwNTZhZDc1ZDZmMGNiM2JkOWU1ZTYifQ.ZjVdaIPtTsbpBmzI45Ka4SzSPmjsdNy9O0VsSHrL7r8DPNwT3dtps5fsp_RZjcTJIiSt9NfUyD0hWfaS9PsVrxyu21LFmzPaJmfkIlB-EnU7xdnZ3l5WqR-7W72B6yVJRlDl7-fum07vzZeIHHsrtzB-a1njUxKGe10ySjJ2bSiWiM1Du3kC0CzCe9JieIVAyegKmr7whTbMtXATAt6VoX73NRmo2yGDOqw5OfgR6l425ADoAW8AXw2NnSqgVJ4qIF84T0JEEnzc7bYliS4bxJgLSTdwtLxZv9mlaPvsOjFsPaF3Pt7GxBHHkWVhFqOGwB4Xtm5qd2RgzYk_i0YDbLOCs97B9Y174OxuriKMJMU7nHGdYXEz0GqCF3hL27uLiBtH42b-G-GltCYBEjmEH04lTF4amqm_zN9uJuZZJKEO4VW_vpAghCMQ5JH5eq6190zQWwcjUyAHGw2wTF-T3sxNWGTcdau1mtY-iiW1P6lkuZ6V5KiozykBER8alpUg5V8VyJMstwTE0bnnt-yCDaoa_yjQJsoPjuz9J7R4dMoaQOje2QmqzkinRZwBiBydozBbiL8lUfeHw-Y3p-lFgDQJMSGD-KE3YOyfZXbSxYv1HTj6L5o7aCS8Up9CdH70NHzoAS4zINtxBE7OdZTGn758c4XrjNnbuQiAOBdvJb0"
const api = new MetaApi(token);
var d = [];
var obj = {"q":[]};
var eqd1 = [];
var eqw1 = [];
var eqm3 = [];
var eqm1 = [];
var eqy1 = [];
var eqy5 = [];
if(localStorage.getItem("eq") == null){
  localStorage.setItem("eq", JSON.stringify(obj));
}

// var account;
// var connection;

// async function getAccount(){
//     account = await api.metatraderAccountApi.getAccount('7e6f8f56-f53d-4cba-8f81-cdfd5213bcb8');

// }

// async function connect(){
//     connection = await account.connect();

// }
//getAccount().then(() => {connect()})

async function getEquity(){
    const account = await api.metatraderAccountApi.getAccount('7e6f8f56-f53d-4cba-8f81-cdfd5213bcb8');
    const connection = await account.connect();
 	
await connection.waitSynchronized();
// retrieve balance and equity
const ac = await connection.getAccountInformation();
return ac.equity;
}

//getEquity().then((x)=>{console.log(x)})
async function getUser(id){
  //document.getElementById("y").style.display = "block"
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
// getUser().then(x => {
// 	var myObj = JSON.parse(localStorage.getItem("eq"));
//     var c = myObj.q
// 	c.push(x);
// 	console.log(c);
// 	localStorage.setItem("eq", JSON.stringify(myObj));
//     d=c;
    
// 	});