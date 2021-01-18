class FXPair {
  constructor(pair, src1, src2, description) {
    this.pair = pair;
    this.src1 = src1;
    this.src2 = src2;
    this.description = description;
  }
}

var pairs = ["EUR/USD","GBP/USD","USD/CAD", "USD/JPY", "NZD/USD","AUD/USD","USD/CHF", "EUR/GBP","EUR/JPY","EUR/CAD","EUR/NZD","EUR/AUD","EUR/CHF", "GBP/JPY","GBP/CAD", "GBP/CHF", "GBP/NZD", "GBP/AUD", "AUD/CAD","AUD/CHF","AUD/JPY","AUD/NZD", "NZD/CAD","NZD/CHF","NZD/JPY", "CAD/CHF","CAD/JPY", "CHF/JPY"];
var pairs_ = ["EURUSD","GBPUSD","USDCAD", "USDJPY", "NZDUSD","AUDUSD","USDCHF", "EURGBP","EURJPY","EURCAD","EURNZD","EURAUD","EURCHF", "GBPJPY","GBPCAD", "GBPCHF", "GBPNZD", "GBPAUD", "AUDCAD","AUDCHF","AUDJPY","AUDNZD", "NZDCAD","NZDCHF","NZDJPY", "CADCHF","CADJPY", "CHFJPY"];

var tf = [1,5,15,60,240,1440,10080,9];

var default_tf = 1;

var fx = [
new FXPair("EURUSD", "euro.svg","usd.png","Euro / U.S. Dollar"),
new FXPair("GBPUSD", "gbp.png","usd.png","British Pound / U.S. Dollar"),
new FXPair("USDCAD", "usd.png","cad.png","U.S. Dollar / Canadian Dollar"),
new FXPair("USDJPY", "usd.png","jpy.png","U.S. Dollar / Japanese Yen"),
new FXPair("NZDUSD", "nzd.png","usd.png","New Zealand Dollar / U.S. Dollar"),
new FXPair("AUDUSD", "aud.png","usd.png","Australian Dollar / U.S. Dollar"),
new FXPair("USDCHF", "usd.png","chf.png","U.S. Dollar / Swiss Franc"),
new FXPair("EURGBP", "euro.svg","gbp.png","Euro / British Pound"),
new FXPair("EURJPY", "euro.svg","jpy.png","Euro / Japanese Yen"),
new FXPair("EURCAD", "euro.svg","cad.png","Euro / Canadian Dollar"),
new FXPair("EURNZD", "euro.svg","nzd.png","Euro / New Zealand Dollar"),
new FXPair("EURAUD", "euro.svg","aud.png","Euro / Australian Dollar"),
new FXPair("EURCHF", "euro.svg","usd.png","Euro / Swiss Franc"),
new FXPair("GBPCAD", "gbp.png","cad.png","British Pound / Canadian Dollar"),
new FXPair("GBPJPY", "gbp.png","jpy.png","British Pound / Japanese Yen"),
new FXPair("GBPAUD", "gbp.png","aud.png","British Pound / Australian Dollar"),
new FXPair("GBPNZD", "gbp.png","nzd.png","British Pound / New Zealand Dollar"),
new FXPair("GBPCHF", "gbp.png","chf.png","British Pound / Swiss Franc"),
new FXPair("AUDCAD", "aud.png","cad.png","Australian Dollar / Canadian Dollar"),
new FXPair("AUDCHF", "aud.png","chf.png","Australian Dollar / Swiss Franc"),
new FXPair("AUDJPY", "aud.png","jpy.png","Australian Dollar / Japanese Yen"),
new FXPair("AUDNZD", "aud.png","nzd.png","Australian Dollar / New Zealand Dollar"),
new FXPair("NZDCAD", "nzd.png","cad.png","New Zealand Dollar / Canadian Dollar"),
new FXPair("NZDCHF", "nzd.png","chf.png","New Zealand Dollar / Swiss Franc"),
new FXPair("NZDJPY", "nzd.png","jpy.png","New Zealand Dollar / Japanese Yen"),
new FXPair("CADCHF", "cad.png","chf.png","Canadian Dollar / Swiss Franc"),
new FXPair("CADJPY", "cad.png","jpy.png","Canadian Dollar / Japanese Yen"),
new FXPair("CHFJPY", "chf.png","jpy.png","Swiss Franc / Japanese Yen")
];

function f(a, b) {
  switch(b) {
  case "EUR/USD":
    a.push(new FXPair("EURUSD", "euro.svg","usd.png","Euro / U.S. Dollar"));
    break;
  case "GBP/USD":
    a.push(new FXPair("GBPUSD", "gbp.png","usd.png","British Pound / U.S. Dollar"));
    break;
  case "USD/CAD":
    a.push(new FXPair("USDCAD", "usd.png","cad.png","U.S. Dollar / Canadian Dollar"));
    break;
  case "USD/JPY":
    a.push(new FXPair("USDJPY", "usd.png","jpy.png","U.S. Dollar / Japanese Yen"));
    break;
  case "NZD/USD":
    a.push(new FXPair("NZDUSD", "nzd.png","usd.png","New Zealand Dollar / U.S. Dollar"));
    break;
  case "AUD/USD":
    a.push(new FXPair("AUDUSD", "aud.png","usd.png","Australian Dollar / U.S. Dollar"));
    break;
  case "USD/CHF":
    a.push(new FXPair("USDCHF", "usd.png","chf.png","U.S. Dollar / Swiss Franc"));
    break;
  case "EUR/GBP":
    a.push(new FXPair("EURGBP", "euro.svg","gbp.png","Euro / British Pound"));
    break;
  case "EUR/JPY":
    a.push(new FXPair("EURJPY", "euro.svg","jpy.png","Euro / Japanese Yen"));
    break;
  case "EUR/CAD":
    a.push(new FXPair("EURCAD", "euro.svg","cad.png","Euro / Canadian Dollar"));
    break;
  case "EUR/NZD":
    a.push(new FXPair("EURNZD", "euro.svg","nzd.png","Euro / New Zealand Dollar"));
    break;
  case "EUR/AUD":
    a.push(new FXPair("EURAUD", "euro.svg","aud.png","Euro / Australian Dollar"));
    break;
  case "EUR/CHF":
    a.push(new FXPair("EURCHF", "euro.svg","usd.svg","Euro / Swiss Franc"));
    break;
  case "GBP/JPY":
    a.push(new FXPair("GBPJPY", "gbp.png","jpy.png","British Pound / Japanese Yen"),);
    break;
  case "GBP/CAD":
    a.push(new FXPair("GBPCAD", "gbp.png","cad.png","British Pound / Canadian Dollar"));
    break;
  case "GBP/CHF":
    a.push(new FXPair("GBPCHF", "gbp.png","chf.png","British Pound / Swiss Franc"));
    break;
  case "GBP/NZD":
    a.push(new FXPair("GBPNZD", "gbp.png","nzd.png","British Pound / New Zealand Dollar"));
    break;
  case "GBP/AUD":
    a.push(new FXPair("GBPAUD", "gbp.png","aud.png","British Pound / Australian Dollar"));
    break;
  case "AUD/CAD":
    a.push(new FXPair("AUDCAD", "aud.png","cad.png","Australian Dollar / Canadian Dollar"));
    break;
  case "AUD/CHF":
    a.push(new FXPair("AUDCHF", "aud.png","chf.png","Australian Dollar / Swiss Franc"));
    break;
  case "AUD/JPY":
    a.push(new FXPair("AUDJPY", "aud.png","jpy.png","Australian Dollar / Japanese Yen"));
    break;
  case "AUD/NZD":
    a.push(new FXPair("AUDNZD", "aud.png","nzd.png","Australian Dollar / New Zealand Dollar"));
    break;
  case "NZD/CAD":
    a.push(new FXPair("NZDCAD", "nzd.png","cad.png","New Zealand Dollar / Canadian Dollar"));
    break;
  case "NZD/CHF":
    a.push(new FXPair("NZDCHF", "nzd.png","chf.png","New Zealand Dollar / Swiss Franc"));
    break;
  case "NZD/JPY":
    a.push(new FXPair("NZDJPY", "nzd.png","jpy.png","New Zealand Dollar / Japanese Yen"));
    break;
  case "CAD/CHF":
    a.push(new FXPair("CADCHF", "cad.png","chf.png","Canadian Dollar / Swiss Franc"));
    break;
  case "CAD/JPY":
    a.push(new FXPair("CADJPY", "cad.png","jpy.png","Canadian Dollar / Japanese Yen"));
    break;
  case "CHF/JPY":
    a.push(new FXPair("CHFJPY", "chf.png","jpy.png","Swiss Franc / Japanese Yen"));
    break;
  default:
    return 0;
}
}

function createQ(a) {

  a.forEach(function (i) {

    var list = document.createElement('li');
    list.setAttribute('data-pair', i.pair);
    var img = document.createElement('img');
    img.setAttribute("src", i.scr1);
    var main = document.createElement('div');
    main.setAttribute("class", 'd-flex flex-row justify-content-between');
    var div = document.createElement('div');
    var r = document.createElement('p');
    r.setAttribute("class", "noselect");
    r.appendChild(document.createTextNode(i.pair))
    var d = document.createElement('small');
    d.setAttribute("class", "noselect")
    d.appendChild(document.createTextNode(i.description))
    var rate = document.createElement('div');
    rate.appendChild(document.createTextNode('$.$$$$'));
    list.appendChild(img);
    div.appendChild(r);
    div.appendChild(d);
    main.appendChild(div);
    main.appendChild(rate);
    list.appendChild(main);

    document.getElementById('image').appendChild(list);


  })

}

function createQuotes(a) {

	var container = document.createElement('div');
  	container.setAttribute("class","container-fluid");
  	var main = document.createElement('div');
  	main.setAttribute("class","list-group list-group-flush d-flex");
  	main.setAttribute("id","demo1")

a.forEach(function (i) {
  
  	var item = document.createElement('div');
  	item.setAttribute("class","list-group-item list-group-item-action d-flex flex-row");
  	var suba = document.createElement('div');
  	suba.setAttribute("class","p p-0");
  	
  	var a = document.createElement('div');
  	a.setAttribute("class","top rounded-cirlce p-1");
  	var spa = document.createElement('span');
  	
  	var spb = document.createElement('span');
  	var imga = document.createElement('img');
  	imga.setAttribute("src",i.src1);
  	var b = document.createElement('div');
  	b.setAttribute("class","b rounded-cirlce p-0");
  	b.appendChild(spb);
  	var imgb = document.createElement('img');
  	imgb.setAttribute("src",i.src2);
  	spb.appendChild(imgb);
  	spa.appendChild(imga);
  	a.appendChild(spa);
  	b.appendChild(spb);
  	suba.appendChild(a);
  	suba.appendChild(b);
  	var subb = document.createElement('div');
  	subb.setAttribute("class","ml-5 d-flex flex-column");
  	var des = document.createElement('small');
  	des.setAttribute("class", "text-muted");
  	des.appendChild(document.createTextNode(i.description));
  	subb.appendChild(document.createTextNode(i.pair));
  	subb.appendChild(des);
  	suba.appendChild(subb);
  	//add text EUR/USD
  	var subc = document.createElement('div');
  	subc.setAttribute("class","p-2");
  	subc.appendChild(document.createTextNode("$.$$$$$"));
  	//add text $.44444
  	item.appendChild(suba);
  	item.appendChild(subc);
  	main.appendChild(item);
  	container.appendChild(main);

  });

  document.body.appendChild(container);

}

