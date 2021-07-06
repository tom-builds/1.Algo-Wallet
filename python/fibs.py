import requests
import json
import time
import datetime

from os import system

def get_signal(market, candle, index_counter):

    headers = {'User-Agent': 'Mozilla/5.0'}
    url = "https://scanner.tradingview.com/crypto/scan"

    payload = {
        "symbols": {
            "tickers": ["BITFINEX:{}".format(market)],
            "query": {"types": []}
        },
        "columns": [
          
            "Pivot.M.Fibonacci.S3|{}".format(candle), 
            "Pivot.M.Fibonacci.S2|{}".format(candle), 
            "Pivot.M.Fibonacci.S1|{}".format(candle),
            "Pivot.M.Fibonacci.Middle|{}".format(candle), 
            "Pivot.M.Fibonacci.R1|{}".format(candle), 
            "Pivot.M.Fibonacci.R2|{}".format(candle), 
            "Pivot.M.Fibonacci.R3|{}".format(candle), 
       
        ]
    }

    resp = requests.post(url, headers=headers, data=json.dumps(payload)).json()
    market = str(market)

    unix_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    fib_s3 = str((resp["data"][0]["d"][0]))
    fib_s2 = str((resp["data"][0]["d"][1]))
    fib_s1 = str((resp["data"][0]["d"][2]))
    fib_mid= str((resp["data"][0]["d"][3]))
    fib_r1 = str((resp["data"][0]["d"][4]))
    fib_r2 = str((resp["data"][0]["d"][5]))
    fib_r3 = str((resp["data"][0]["d"][6]))


    urltwo = "https://api.bitfinex.com/v1/pubticker/" + coin.lower()
    responsetwo = requests.request("GET", urltwo)

    price = responsetwo.json()

    with open('../src/json/price.json', 'w') as file:
        json.dump(price, file, indent = 1)

    fibs = ({ "counter" :str(index_counter), "timeDate" : unix_time , "candle": candle , "market": market , 
              "sup_1" : fib_s1[0:5], "sup_2": fib_s2[0:5] , "sup_3": fib_s3[0:5], "re_1": fib_r1[0:5], "re_2": fib_r2[0:5],  "re_3": fib_r3[0:5] 
                                            })

    with open('../src/json/supportres.json', 'w') as file:

      json.dump(fibs, file, indent = 1)
      print(json.dumps(fibs, indent=4, sort_keys=True))


    return

if 5 == 5:
   
    index_counter = 0
    
    while True:
  
        timeframe = [5]     
           
        coin = "ETHUSD"
       
        for candle in timeframe:
                get_signal(coin, candle, index_counter)
                
                index_counter += 1

                time.sleep(60.0)




