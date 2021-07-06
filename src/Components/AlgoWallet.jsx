
import React, { useState, useEffect} from "react"

import './styles/algo.css' 
import './styles/tables.css'

import sr from "../json/supportres.json"
import price from "../json/price.json"

import Pfunc from './Percent' 
import Auth from './Extras/Auth'

    let resistence_3 = Number(sr.re_3)

    let ethPrice = Number(price.last_price).toFixed(1)

    let resist2 = Number(sr.re_2).toFixed(2)
    let smallGain = ((ethPrice / 100) * 3) + ethPrice
    let smallGain2 =  resist2 > smallGain ?   resist2  : smallGain

    let pChange = 0
        ethPrice < resistence_3 ? pChange = Pfunc(resistence_3, ethPrice).toFixed(1) : pChange = Pfunc(ethPrice, resistence_3).toFixed(1) 

    let chip = 50
    let theChip = chip / ethPrice

const ws = new WebSocket('wss://api.bitfinex.com/ws/2');
    ws.onopen = () => { ws.send( JSON.stringify( Auth())) }


export default function AlgoApp() {


    function post(payloadNum, id, execAmount ){

        let theAmount = theChip.toString()

        let inputBuy = ({cid: Date.now(), type:'EXCHANGE MARKET', symbol:'tETHUSD',  amount:theAmount})
        let inputSell = ({cid: Date.now(), type:'EXCHANGE MARKET', symbol:'tETHUSD', amount: (execAmount < theChip) ? "-"+execAmount : "-"+theChip })   

        let input = [  [0, 'oc', null, {id: id}]  , [0, 'on', null, inputBuy], [0, 'on', null, inputSell]  ]

            let inputPayload = input[payloadNum]
                ws.send( JSON.stringify(inputPayload) )
                    
        }
                

    const [open, setOpen] = React.useState(0)

    const [hb, setHb] = useState()
            
    const [usd, setUsd] = useState({coin:'', usdAmount:'0.0001'})
    const [eth, setEth] = useState({coin:'', ethAmount:''})

    const [on, setOn] = useState([])
    const [tus, setTus] = useState([])
    const [tusClosed, setTusClosed] = useState([])


    useEffect(() =>  {

    ws.onmessage = (msg) => { 
    const res = JSON.parse(msg.data)
    if(res[1] ==="n") console.log(res)
    else if(res[1] ==="hb") setHb(res[1])
    else if(res[1] ==='wu'){ 
        
    let[ , coin, theAmount ] = res[2] 
    
        let usdAmount = Number(theAmount).toFixed(2)
        let ethAmount = Number(theAmount).toFixed(7)

        if(res[2][1] === 'USD'){  setUsd({coin, usdAmount})  }
            else if(res[2][1] === 'ETH'){ setEth({coin, ethAmount})  }  

    }
    else if(res[1] ==='tu' && res[2][10] !== "USD"){

        let tuOpen = res[2]
        let [ , , , , exec_amount,,,] = tuOpen 
            

        let thetuAmt = exec_amount.toString()
        let smallPriceIncrease = smallGain2.toString()
        let tuOrder = JSON.stringify([0, 'on', null, ({cid: Date.now(), type: 'EXCHANGE LIMIT', symbol: 'tETHUSD', amount:"-"+thetuAmt, price: smallPriceIncrease}) ])
    
        ws.send(tuOrder)
            tuOrder = ''

        
    }
    else if(res[1] === "on") {

    const [ID, , ,SYMBOL ,MTS_CREATE ,MTS_UPDATE ,AMOUNT, ,TYPE ,MTS_TIF , , , ,  , , , PRICE ] = res[2]

        let CREATE = new Date(MTS_CREATE).toLocaleTimeString()
        let update =  new Date(MTS_UPDATE).toLocaleTimeString()
        let tif    = new Date(MTS_TIF).toLocaleTimeString()

        let newOn = {ID, SYMBOL, CREATE, update, AMOUNT, TYPE, PRICE, tif }

        setOn([...on, newOn]) 
        
    }
    else if(res[1] ==='tu' && res[2][10] === "USD"){

        let tuClosed = res[2]
        let anMtsCreate = new Date(tuClosed[2]).toLocaleTimeString()
    
        let [ anId, anSymbol, , , anexecAmount, anexecPrice, anorderType, anorderPrice ] = tuClosed   

        let gain =  Math.abs(Number(anexecAmount) * Number(anexecPrice)).toFixed(1)
    
        let anItem = ({ anId, anSymbol, anexecAmount, anexecPrice, anorderType, anorderPrice,  anMtsCreate, gain })
            
        setTusClosed([...tusClosed, anItem])
    
        }
    
    }
    },[on,tus,tusClosed])


    function removeTus(x) {
        let newTus = tus.filter(( _, i ) =>  x !== i )
        setTus(newTus)
    }

    function removeOns(y) {
        let newOn = on.filter(( _, i ) =>  y !== i )
        setOn(newOn)
    }
   

    return(

    <div className="algo-wallet-container">

    <div className='title-wrap'>
        <div className='flex-row'> 

                <h3>Algo Wallet</h3>

    <span>  
        <span className={hb === "hb" ? "heartbeat online": "heartbeat offline"}> 
            {hb === "hb" ? "online":"offline"}
        </span> 
    </span>
    </div>  
    </div>  
     
    <div className='price-box-wrap'>
        <div className="justfied big-symbol">$
        <span className="big-price">{ethPrice}</span>
    </div>

    <div className="info-wrap">
        <div className={ open <= 0 ? "info-box " : "zoom"}> 

        <span className="price-target"> Price Target $ {resistence_3.toFixed(2)}</span>
        <span className={ pChange > 3 ? " trade " : " notrade "}>% {pChange} {pChange > 3 ? " OK " : " NO TRADE "} </span>

        </div>
    </div>

    <div className="bottom-box">

        <div className="bottom-inner">
        <div className={ open === 2 ? 'open-animate': 'closed-animate'}>
        
        <table className="table-wallets">
        <thead>
        <tr><th>Coin</th><th>Balance</th><th>Value</th><th>&#8470; Chips</th></tr>
        </thead>
        <tbody>

        <tr>
        <td>{usd.coin}</td><td>{usd.usdAmount}</td><td>-</td><td>{Math.round(Number(usd.usdAmount / 50))}</td>
        </tr>

        <tr>
        <td>{eth.coin}</td><td>{eth.ethAmount}</td><td>${(eth.ethAmount * ethPrice).toFixed(1)}</td>
        <td>{Math.round(eth.ethAmount * ethPrice / 50)}</td>
        </tr>

        </tbody> 
        </table>
        </div>


    {/* Trades Tables */}
    <div>
    <div className={ open === 1 ? 'open-animate': 'closed-animate'}>

    <table className="table-orders">
    <thead>
        <tr><th>Close</th><th>Time</th><th>Coin</th><th>Amount</th><th>Set Target</th><th>Status</th><th>Value</th></tr>
    </thead>
        <tbody>
        { on.map( (n, i) => 
        <tr key={i}>
            <td className="a-btn"  onClick={() => post(0, n.ID) + post(2, "sell", n.AMOUNT) + removeOns(i)}> &times;</td>
            <td>{n.CREATE}</td>
            <td>{n.SYMBOL}</td>
            <td>{n.AMOUNT}</td> 
            <td>{sr.re_3}</td>
            <td>Open</td>
            <td>${Math.abs((Number(n.AMOUNT) * ethPrice).toFixed(1))}</td>
        </tr>
        )}
    </tbody>  
    <tbody>    
        {tusClosed.map(({anSymbol,  anMtsCreate, anexecAmount, anexecPrice, gain}, i) => 

        <tr key={i}>
            <td className="a-btn" onClick={() => removeTus(i) }> - </td> 
            <td>{anMtsCreate}</td>
            <td>{anSymbol}</td>
            <td>{anexecAmount.toFixed(3)}</td>
            <td>{anexecPrice}</td>
            <td>Closed</td>
            <td>${gain}</td>
        </tr>
        )}
        </tbody>  
    </table>

    </div>
    </div>

    </div>
     </div> 

    <div className='bottom-box flex-right'>       
        <button value="Buy ETH"   onClick={() => setOpen(open >= 2 ?  0 : open + 1)} className='arrow-button'>
            {open >= 1 ? " ": "$"}  &#9660;
        </button>
    </div>

        <input type='button' value="Buy ETH"  onClick={()=> post(1, "buy")} className='buy-button'/> 
            
       </div>
    </div>
    )
}
