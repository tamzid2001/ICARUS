const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4YWYxZGI3ZDBjYzA1NmFkNzVkNmYwY2IzYmQ5ZTVlNiIsInBlcm1pc3Npb25zIjpbXSwiaWF0IjoxNjA1NTE2OTQ3LCJyZWFsVXNlcklkIjoiOGFmMWRiN2QwY2MwNTZhZDc1ZDZmMGNiM2JkOWU1ZTYifQ.Q2mBRdxm3Rz800XGLazxkZhDdZyONZWX-tcfboN4lkKiRpDioCzAP21vZ8krP6HEMJ4SPO51_TT2699h1c9W6VtkagE8dSn1jAetrZULFeomPhpy3lE8N7t7P0_yIGPvUPR19XJ6mWhrav_chB8kX7W6deAE8T0ieAm8zKCe_A47tixoXGkfZUFABHNHQO6gxj4ctfVAfolMmcHYDMYFZYSrCEtPruqCZ1UeRl1fcyRvI_3oD38sDbwowRsy5bhK-Bul6jO448YcodvFmtOBFJCV8VNAKw-Z6DfLDlgWBevTZfc_KBrmP9H3ZvUGroIVdRXg8GagEeIwdPMJ07Hjpu7cy2kz0F2i926Q-SA2gCKtYQqgzDhdZ3zMFj2howEI5cBhl9YUL_8MSAVf3OkrYcqD3JlUPhYYxoNIrpGREq6v2T6YumN8n5adKjdHTQtAP8IAJchDd8ySkkt3BaTPq_zxQ2QGKey04QNSN6NIlVjT03gj24iyhPSHun3OKCP7-g2P8BTL0_d1AW8aJBP9xPsORKEzSGr1BBKmoUtyZtgu8bqesp85Ql5cGDMvjMCLYgAmw2p-4xCp_nLRT9fZTeX65RjZsa6NdsnQGYew1bkrJYTqhd0FV-Rt21EPSIAx69NQxoM8cHqvB4jSioNKQ3kaA3QiBC9jkaxkSmkPAIY';
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
    async function getUser(){
    const account = await api.metatraderAccountApi.getAccount('7e6f8f56-f53d-4cba-8f81-cdfd5213bcb8');
    const connection = await account.connect();
 	var d = [];
 	
await connection.waitSynchronized();
historyStorage = connection.historyStorage;
console.log(historyStorage);
// both orderSynchronizationFinished and dealSynchronizationFinished
// should be true once history synchronization have finished
console.log(historyStorage.orderSynchronizationFinished);
console.log(historyStorage.dealSynchronizationFinished);
// retrieve balance and equity
const ac = await connection.getAccountInformation();
console.log(ac);
// retrieve open positions
console.log(await connection.getPositions());
// retrieve a position by id
//console.log(await connection.getPosition('1234567'));
// retrieve pending orders
console.log(await connection.getOrders());
// retrieve a pending order by id
//console.log(await connection.getOrder('1234567'));
// retrieve history orders by ticket
//console.log(await connection.getHistoryOrdersByTicket('1234567'));
// retrieve history orders by position id
//console.log(await connection.getHistoryOrdersByPosition('1234567'));
// retrieve history orders by time range
console.log(await connection.getHistoryOrdersByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));
// retrieve history deals by ticket
//console.log(await connection.getDealsByTicket('1234567'));
// retrieve history deals by position id
//console.log(await connection.getDealsByPosition('1234567'));
// retrieve history deals by time range
const deals = await connection.getDealsByTimeRange(new Date(1970, 0, 1), new Date());
const deal = deals.deals;
console.log(deal);
var counter = 0;
for(i = 0;i<deal.length;i++) {
	if(deal[i].type == "DEAL_TYPE_BALANCE" || deal[i].type == "DEAL_TYPE_SELL" || deal[i].type == "DEAL_TYPE_BUY"){
		counter++;
		if(counter > 1){
		var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
        d.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100});
        if(new Date(deal[i].brokerTime) >= new Date()){
            var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
		    eqd1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100});
        } 
        if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-7))){
            var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
		    eqw1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
        }
        if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-30))){
            var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
		    eqm1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
        }
        if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-90))){
            var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
		    eqm3.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
        }
        if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-365))){
            var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
		    eqy1.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
        } 
        if(new Date(deal[i].brokerTime) >= new Date(new Date().setDate(new Date().getDate()-1825))){
            var balance = d[d.length - 1].y + deal[i].profit + deal[i].commission + deal[i].swap;
		    eqy5.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100}); 
        }
		} else {
		var balance = deal[i].profit + deal[i].commission + deal[i].swap;
		d.push({x: new Date(deal[i].brokerTime), y: Math.round((balance + Number.EPSILON) * 100) / 100});
	}
	}
}
console.log(eqd1)
console.log(eqw1)
console.log(eqm1)
console.log(eqm3)
console.log(eqy1)
console.log(eqy5)
console.log(d)
console.log(await connection.getDealsByTimeRange(new Date(1970, 0, 1), new Date()));
var myObj = JSON.parse(localStorage.getItem("eq"));
var c = myObj.q
c.push(d);
console.log(c);
localStorage.setItem("eq", JSON.stringify(myObj));
return d;

}
getUser().then(x => {
	var myObj = JSON.parse(localStorage.getItem("eq"));
    var c = myObj.q
	c.push(x);
	console.log(c);
	localStorage.setItem("eq", JSON.stringify(myObj));
	d=c;
	});