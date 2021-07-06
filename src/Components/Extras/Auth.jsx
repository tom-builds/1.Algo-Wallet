
import crypto from 'crypto-js'


export default function Auth() {


     const apiKey = '' 
     const apiSecret = '' 

     const authNonce = Date.now() * 1000
     const authPayload = 'AUTH' + authNonce 
     const authSig = crypto.HmacSHA384(authPayload, apiSecret).toString(crypto.enc.Hex)

     return( {apiKey, authSig, authNonce,authPayload, event: 'auth'} )

    }
