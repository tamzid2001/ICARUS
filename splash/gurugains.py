import time
from pprint import pprint
import telepot
from telepot.loop import MessageLoop
from telepot.namedtuple import LabeledPrice, ShippingOption
from telepot.delegate import (
    per_invoice_payload, pave_event_space, create_open,
    per_message, call)

import json
import robin_stocks as rs
from datetime import datetime, timedelta, date
from threading import Timer

import stripe
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import requests

from urllib.parse import urlencode
from urllib.request import Request, urlopen

def getDatabase():
    with open('gurugainsmember.json') as f:
        membersdata = json.load(f)
        f.close()
    return membersdata

#getDatabase()

def updateDatabase(m,k,t):
    data = m
    s = "customer,subscription,fingerprint,email,key,telegramId\n"
    for i in range(0,len(data), 1):
        if(data[i]['key'] == k):
            data[i]['telegramId'] = t
    for i in range(0,len(data), 1):
        s = s + data[i]['customer'] + "," + data[i]['subscription'] + "," + data[i]['fingerprint'] + "," + data[i]['email'] + "," + data[i]['key'] + "," + data[i]['telegramId'] + "\n"

    url = 'http://localhost:4242/members'
    x = requests.post(url, data=s)




cred = credentials.Certificate("gurugains-fac88-firebase-adminsdk-9p958-ff71d51ac0.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
stripe.api_key = "sk_test_51HKbjkA9aDHcXm5h8gBeVM5cXvZoeMLKg2I3HBMeBKLS2PUpbO5uVXTBUSj870G3wNj42a3X7ZQy6hejHnX4XCNn00hVK7OuRf"
rid = ''
rinfo = {}
starttime = time.time()

rs.login(username='AhsanU75972',
         password='hacker99667',
         expiresIn=86400,
         by_sms=True)
print("All Open Stock Orders")
print(rs.account.get_open_stock_positions())
print("All Open Option Orders")
print(rs.options.get_open_option_positions())
print(rs.options.get_all_option_positions())
print(rs.profiles.load_account_profile())
memberslist = [];
watchlist = [];

openorders = []
def getOpenOrders():
    openoptionpositions = rs.options.get_open_option_positions()
    ooplist = []
    oop = {}

    openstockpositions = rs.account.get_open_stock_positions()
    osplist = []
    osp = {}

    if(openoptionpositions != []):
        for i in range(0,len(openoptionpositions)):
            oop = {
                "date": openoptionpositions[i].get('created_at'),
                "symbol": openoptionpositions[i].get('chain_symbol'),
                "order": "option",
                "type": openoptionpositions[i].get('type'),
                "option_date": rs.options.get_option_instrument_data_by_id(openoptionpositions[i].get('option_id')).get('expiration_date'),
                "strike_price": float(rs.options.get_option_instrument_data_by_id(openoptionpositions[i].get('option_id')).get('strike_price'))
            }
            openorders.append(oop)
    if (openstockpositions != []):
        for i in range(0,len(openstockpositions)):
            osp = {
                "date": openstockpositions[i].get('created_at'),
                "symbol": openstockpositions[i].get('instrument'),
                "order": "stock",
                "type": "buy",
                "price": openstockpositions[i].get('average_buy_price'),
                "post": True
            }
            openorders.append(osp)

def createTradeRecord(ticker,openprice,type):
    if(type == "option"):
        closeprice = rs.options.get_option_market_data(ticker, expirationDate, strikePrice, optionType, info=None)
        gain = ((closeprice - openprice) / openprice) * 100
        tr = {
            "date": "date",
            "ticker": ticker,
            "order": "stock",
            "type": "buy",
            "gain": str(gain)
        }
        return tr
    elif(type == "stock"):
        closeprice = rs.stocks.get_latest_price(ticker, priceType='ask_price', includeExtendedHours=False)
        gain = ((closeprice - openprice) / openprice ) * 100
        tr = {
            "date": "date",
            "ticker": ticker,
            "order": "stock",
            "type": "buy",
            "gain": str(gain)
        }
        return tr




def checkforupdate():
    getOpenOrders()
    new = []
    jsonFile = open("openorders.json", mode="r")
    jdata = json.load(jsonFile)
    jsonFile.close()
    if(len(jdata)<len(openorders)):
        for i in range(0,len(openorders)):
            if(openorders[i] not in jdata):
                new.append(openorders[i])
        sendNewSignal(new)
        jsonFile = open('openorders.json', mode='w+')
        json.dump(openorders, jsonFile)
        jsonFile.close()
    elif(len(jdata)>len(openorders)):
        for i in range(0,len(jdata)):
            if(jdata[i] not in openorders):
                new.append(jdata[i])
        sendCloseSignal(new)
        jsonFile = open('openorders.json', mode='w+')
        json.dump(openorders, jsonFile)
        jsonFile.close()


def sendOpenOrders():
    jsonFile = open("openorders.json", mode="r")
    jdata = json.load(jsonFile)
    jsonFile.close()
    now = datetime.now()
    tids = db.collection('ggmembers').where('telegramId', '!=', '').stream()
    dt_string = now.strftime("%B %d, %Y %H:%M:%S")
    for i in range(0, len(jdata)):
        if(jdata[i].get('order') == "stock"):
            message = dt_string + "\n" + "Buy \n" + jdata[i].get('symbol') + " @" + jdata[i].get('price')
            for tid in tids:
                t = tid.to_dict()
                signalbot.sendMessage(t['telegramId'], message)
        elif(jdata[i].get('order') == "option"):
            message = dt_string + "\n" + "Buy \n"+ jdata[i].get('option_date') + " " + "$" + str(jdata[i].get('strike_price')) + " " + jdata[i].get('type') + " Option " + jdata[i].get('symbol')
            for tid in tids:
                t = tid.to_dict()
                signalbot.sendMessage(t['telegramId'], message)


def sendNewSignal(a):
    now = datetime.now()
    tids = db.collection('ggmembers').where('telegramId', '!=', '').stream()
    dt_string = now.strftime("%B %d, %Y %H:%M:%S")
    for i in range(0, len(a)):
        if(a[i].get('order') == "stock"):
            message = dt_string + "\n" + "Buy \n" + a[i].get('symbol') + " @" + a[i].get('price')
            for tid in tids:
                t = tid.to_dict()
                signalbot.sendMessage(t['telegramId'], message)
        elif(a[i].get('order') == "option"):
            message = dt_string + "\n" + "Buy \n"+ a[i].get('option_date') + " " + "$" + str(a[i].get('strike_price')) + " " + a[i].get('type') + " Option " + a[i].get('symbol')
            for tid in tids:
                t = tid.to_dict()
                signalbot.sendMessage(t['telegramId'], message)

def sendCloseSignal(a):
    now = datetime.now()
    tids = db.collection('ggmembers').where('telegramId', '!=', '').stream()
    dt_string = now.strftime("%B %d, %Y %H:%M:%S")
    for i in range(0, len(a)):
        if(a[i].get('order') == "stock"):
            message = dt_string + "\n" + "Close \n" + a[i].get('symbol') + " @" + a[i].get('price')

            for tid in tids:
                signalbot.sendMessage(tid.to_dict()['telegramId'], message)
        elif(a[i].get('order') == "option"):
            message = dt_string + "\n" + "Close \n"+ a[i].get('option_date') + " " + "$" + str(a[i].get('strike_price')) + " " + a[i].get('type') + " Option " + a[i].get('symbol')
            for tid in tids:
                signalbot.sendMessage(tid.to_dict()['telegramId'], message)

def writeUsers(user):
    with open('gurugainsmember.json', 'w') as json_file:
        json_file.seek(0)
        json.dump(user, json_file)

    json_file.close()

def copy():
    docs = db.collection('ggmembers').stream()

    for doc in docs:
        #print(f'{doc.id} => {doc.to_dict()}')
        memberslist.append(doc.to_dict())

    writeUsers(memberslist)

def validateUser(c_id):
    with open('gurugainsmember.json') as f:
        data = json.load(f)

    for i in data:
        if(i["telegramId"] == c_id):
            f.close()
            return True

    f.close()
    return False

def validateUserKey(key):
    with open('gurugainsmember.json') as f:
        data = json.load(f)

    for i in data:
        if(i["key"] == key):
            f.close()
            return True

    f.close()
    return False

def lookup(t):
    m = getDatabase()
    for i in range(0,len(m),1):
        if(m[i]['telegramId'] == t):
            return m[i]

    return False

with open('gurugainsmember.json') as f:
  membersdata = json.load(f)
  f.close()

with open('trackrecord.json') as f:
  trackrecorddata = json.load(f)
  f.close()

with open('openorders.json') as f:
  openordersdata = json.load(f)
  f.close()

class OrderProcessor(telepot.helper.InvoiceHandler):
    newmember = {}
    newtrackrecorddata = {}
    newopenordersdata = {}
    token_a = False
    cancel_pending = False
    """
    Run it by:
    $ python3.5 script.py <bot-token> <payment-provider-token>
    """
    firstname = ""
    lastname = ""
    date = 0
    id = 0
    def __init__(self, *args, **kwargs):
        super(OrderProcessor, self).__init__(*args, **kwargs)

    def on_shipping_query(self, msg):
        query_id, from_id, invoice_payload = telepot.glance(msg, flavor='shipping_query')

        print('Shipping query:')
        pprint(msg)

        signalbot.answerShippingQuery(
            query_id, True,
            shipping_options=[
                ShippingOption(id='fedex', title='FedEx', prices=[
                    LabeledPrice(label='Local', amount=345),
                    LabeledPrice(label='International', amount=2345)]),
                ShippingOption(id='dhl', title='DHL', prices=[
                    LabeledPrice(label='Local', amount=342),
                    LabeledPrice(label='International', amount=1234)])])

    def on_pre_checkout_query(self, msg):
        query_id, from_id, invoice_payload = telepot.glance(msg, flavor='pre_checkout_query')

        print('Pre-Checkout query:')
        pprint(msg)

        signalbot.answerPreCheckoutQuery(query_id, True)

    def on_chat_message(self, msg):
        content_type, chat_type, chat_id = telepot.glance(msg)
        docs = db.collection('ggmembers').where('key', '==', msg['text']).stream()
        tids = db.collection('ggmembers').where('telegramId', '==', chat_id).stream()



        for doc in docs:
            rid = doc.id
            rinfo = doc.to_dict()
            print(f'{doc.id} => {doc.to_dict()}')
            #set telegram id
            db.collection('ggmembers').doc(doc.id).update('telegramId',chat_id)
            #db.collection('ggmembers').set()
            memberslist.append(doc.to_dict())
            signalbot.sendMessage(chat_id, "Welcome to GuruGains Premium Stocks & Options Signals")

        for tid in tids:
            print(f'{tid.id} => {tid.to_dict()}')
            signalbot.sendMessage(chat_id, "Please enter your membership key to gain access!")
        #signalbot.restrictChatMember('@GuruGains',OrderProcessor.id,0,False,False,False,False)
        if content_type != 'text':
            return

        elif content_type == 'text':
            if msg['text'].lower() == 'cancel':
                #canel sub
                #customer = stripe.Customer.retrieve("cust_id")
                #stripe.Subscription.delete(customer.subscription)
                signalbot.sendMessage(chat_id, "Your membership will cancel at" + "end-date")
                return True
            elif msg['text'].lower() == 'status':
                signalbot.sendMessage(chat_id, "Your membership will renew at" + "end-date")
                return True
                    #send status
            elif msg['text'] == rinfo.key:
                signalbot.sendMessage(chat_id, "Welcome to GuruGains Premium Stocks & Options Signals")
                return True
        if content_type == 'successful_payment':
            signalbot.sendMessage('-1001324850323', "Welcome "+OrderProcessor.firstname+"!")
            OrderProcessor.newmember = {
                "id": OrderProcessor.id,
                "first_name": OrderProcessor.firstname,
                "last_name": OrderProcessor.lastname,
                "payment": True,
                "payment_date": OrderProcessor.date,
                "post": True
            }
            with open('gurugainsmember.json', 'w') as json_file:
                json_file.seek(0)
                s = json.dump(OrderProcessor.newmember) + ","
                json.dump(s, json_file)

            OrderProcessor.newmember = {}
            print('Successful payment RECEIVED!!!')
            pprint(msg)
        else:
            print('Chat message:')
            pprint(msg)

def send_invoice(seed_tuple):
    msg = seed_tuple[1]

    content_type, chat_type, chat_id = telepot.glance(msg)

    if content_type == 'text':
        sent = signalbot.sendInvoice(
                   chat_id, "GuruGains Premium Membership", "Profitable Stocks & Options Signals",
                   payload='a-string-identifying-related-payment-messages-tuvwxyz',
                   provider_token=PAYMENT_PROVIDER_TOKEN,
                   start_parameter='GuruGainsMembership',
                   currency='USD', prices=[
                       LabeledPrice(label='Monthly Membership', amount=10000)])  # required for shipping query

        print('Invoice sent:')
        OrderProcessor.firstname = sent['chat']['first_name']
        OrderProcessor.lastname = sent['chat']['last_name']
        OrderProcessor.date = sent['date']
        OrderProcessor.id = sent['chat']['id']
        pprint(sent)


def backup(seed_tuple):
    msg = seed_tuple[1]
    content_type, chat_type, chat_id = telepot.glance(msg)
    docs = db.collection('ggmembers').where('key', '==', msg['text']).stream()
    tids = db.collection('ggmembers').where('telegramId', '==', chat_id).stream()

    for doc in docs:
        if doc.id != "":
            # set telegram id
            db.collection('ggmembers').document(doc.id).update({'telegramId': chat_id})
            # db.collection('ggmembers').set()
            # memberslist.append(doc.to_dict())
            signalbot.sendMessage(chat_id, "Welcome to GuruGains Premium Stocks & Options Signals")
            sendOpenOrders()
            OrderProcessor.token_a = True
            return True
    for tid in tids:
        if tid.id != "":
            if msg['text'].lower() == 'cancel':
                today = date.today()
                u = tid.to_dict()
                sub = stripe.Subscription.retrieve(u["subscription"])
                print(sub)
                if(sub["trial_start"] != None or sub["trial_end"] != None):
                    stripe.Subscription.update(u["subscription"], {"trial_end":"now"})
                    stripe.Subscription.delete(u['subscription'])
                    signalbot.sendMessage(chat_id, "Your membership has been canceled. To renew your membership, visit www.gurugains.com", parse_mode='html')
                    return True
                else:
                # canel sub
                #customer = stripe.Customer.retrieve(u['customer'])

                    sub = stripe.Subscription.retrieve(u['subscription'])
                    if(sub["status"] != "canceled"):
                        stripe.Subscription.delete(u['subscription'])
                    enddate = datetime.fromtimestamp(sub['billing_cycle_anchor'])
                    date_time = enddate.strftime("%m/%d/%Y")
                    signalbot.sendMessage(chat_id, "Your membership will cancel on " + date_time)
                    OrderProcessor.token_a = True
                    return True
            elif msg['text'].lower() == 'status':
                u = tid.to_dict()
                sub = stripe.Subscription.retrieve(u['subscription'])
                if (sub["status"] == "canceled"):
                    enddate = datetime.fromtimestamp(sub['billing_cycle_anchor'])
                    date_time = enddate.strftime("%m/%d/%Y")
                    signalbot.sendMessage(chat_id, "Your membership will cancel on " + date_time)
                elif(sub["status"] == "active"):
                    enddate = datetime.fromtimestamp(sub['billing_cycle_anchor'])
                    date_time = enddate.strftime("%m/%d/%Y")
                    signalbot.sendMessage(chat_id, "Your membership will renew on " + date_time)

                OrderProcessor.token_a = True
                return True
                # send status
            elif msg['text'].lower() == 'open':
                sendOpenOrders()
            else:
                signalbot.sendMessage(chat_id,
                                      "GuruGainsBot Commands: \nstatus - get account information\ncancel - cancel membership")
                OrderProcessor.token_a = True
                return True
    if (OrderProcessor.token_a == False):
        signalbot.sendMessage(chat_id, "Please enter your membersip key!")


def hello(seed_tuple):
    msg = seed_tuple[1]
    data = getDatabase()
    content_type, chat_type, chat_id = telepot.glance(msg)

    if content_type == 'text':
        for i in range(0,len(data),1):
            if(data[i]['key'] == msg['text'] and data[i]['telegramId'] == 'none'):
                docs = db.collection('ggmembers').where('key', '==', data[i]['key']).stream()
                for doc in docs:
                    if doc.id != "":
                        # set telegram id
                        db.collection('ggmembers').document(doc.id).update({'telegramId': chat_id})
                        #updateDatabase(data,data[i]['key'],chat_id)
                        # db.collection('ggmembers').set()
                        # memberslist.append(doc.to_dict())
                        signalbot.sendMessage(chat_id, "Welcome to GuruGains Premium Stocks & Options Signals")
                        sendOpenOrders()
                        OrderProcessor.token_a = True
                        return True
            elif(data[i]['telegramId'] == chat_id):
                if msg['text'].lower() == 'cancel':
                    # canel sub
                    # customer = stripe.Customer.retrieve("cust_id")
                    # stripe.Subscription.delete(customer.subscription)
                    stripe.Subscription.modify('sub_49ty4767H20z6a', trial_end='now')
                    signalbot.sendMessage(chat_id, "Your membership will cancel at" + "end-date")
                    OrderProcessor.token_a = True
                    return True
                elif msg['text'].lower() == 'status':
                    signalbot.sendMessage(chat_id, "Your membership will renew at" + "end-date")
                    OrderProcessor.token_a = True
                    return True
                    # send status
                else:
                    signalbot.sendMessage(chat_id, "GuruGainsBot Commands: \nstatus - get account information\ncancel - cancel membership")
                    OrderProcessor.token_a = True
                    return True
            else:
                signalbot.sendMessage(chat_id, "Please enter your membersip key!")
    elif content_type != "text":
        return True

def updateAll():
    openorders = []
    getOpenOrders()
    checkforupdate()


x = datetime.today()
y = x.replace(day=x.day, hour=4, minute=0, second=0, microsecond=0) + timedelta(days=1)
delta_t = y-x

secs = delta_t.total_seconds()

t = Timer(secs, copy)
up = Timer(60, updateAll)
t.start()
up.start()

signalbotTOKEN = '1442613084:AAHusTotxz6mRrqzLK3dJoaW5MzRqEcOL0E'
PAYMENT_PROVIDER_TOKEN = '284685063:TEST:YTM0YzU1YTIwNzgy'
signalbot = telepot.DelegatorBot(signalbotTOKEN, [
    (per_message(flavors=['chat']), call(backup)),
    pave_event_space()(
        per_invoice_payload(), create_open, OrderProcessor, timeout=30,
    )
])

MessageLoop(signalbot).run_as_thread()