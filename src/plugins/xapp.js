import axios from 'axios'

let tokenData
let jwt

const apiEndPoint = 'https://xumm.app/api/v1/xapp-jwt'
const apiKey = import.meta.env.VITE_APP_XAPP_KEY
const apiSecret = import.meta.env.VITE_APP_XAPP_SECRET

const headers = () => {
    return { headers: { Authorization: `Bearer ${jwt}` } }
}

const getTokenData = async (ott) => {
    if(!tokenData) {
        try {
            const res = await axios.get(`${apiEndPoint}/authorize`, { headers: { 'x-api-key': apiKey, 'x-api-ott': ott } })
            tokenData = res.data.ott
            jwt = res.data.jwt
            console.log('jwt', jwt)
            return tokenData
        } catch(e) {
            throw 'Error getting Token Data'
        }
    } else {
        return tokenData
    }    
}

const sendCommandtoXumm = (command) => {
    if (typeof window.ReactNativeWebView === 'undefined') throw new Error('This is not a react native webview')
    window.ReactNativeWebView.postMessage(JSON.stringify(command))
}

const openSignRequest = (uuid) => {
    try {
        sendCommandtoXumm({
            command: 'openSignRequest',
            uuid: uuid
        })
    } catch(e) {
        throw e
    }
}

const closeXapp = () => {
    try {
        sendCommandtoXumm({
            command: "close",
            refreshEvents: false
        })
    } catch(e) {
        throw e
    }
}

const openExternalBrowser = (url) => {
    try {
        sendCommandtoXumm({
            command: 'openBrowser',
            url: url
        })
    } catch(e) {
        throw e
    }
}

const openTxViewer = (tx, account) => {
    try {
        sendCommandtoXumm({
            command: 'txDetails',
            tx,
            account
        })
    } catch(e) {
        throw e
    }
}

const status = () => {
    return new Promise((resolve, reject) => {
        function message(event) {
            window.removeEventListener("message", message)
            document.removeEventListener("message", message)

            const data = JSON.parse(event.data)
            if(data.method !== 'payloadResolved') return reject('')
            if(data.reason === 'SIGNED') return resolve()
            else return reject('')
        }
        //iOS
        window.addEventListener('message', message)
        //Android
        document.addEventListener('message', message)
    })
}


//https://xumm.app/api/v1/jwt/payload/{uuid}

// curl --request GET \
//       --url https://xumm.app/api/v1/platform/payload/fced2f02-5f19-4b35-b29c-c9d4cc62ab3b \
//       --header 'Accept: application/json' \
//       --header 'X-API-Key: fa0382d0-ed38-458b-b0a1-2972567187de' \
//       --header 'X-API-Secret: ba43f18b-aaab-46db-83b6-06aa09070d6a'
const payloadGet = async (payload_uuid) => {
    try {
        console.log('header', {
            headers: { 
                'Accept': 'application/json',
                'X-API-Key': apiKey,
                'X-API-Secret': apiSecret
            }
        })
        const result = await axios.get(`https://xumm.app/api/v1/platform/payload/${payload_uuid}`, {
            headers: { 
                'Accept': 'application/json',
                'X-API-Key': apiKey,
                'X-API-Secret': apiSecret
            }
        })
        return result
    } catch(e) {
        if (e === '') throw { msg: 'closed', error: false }
        throw e
    }
}

const payload = async (payload) => {
    try {
        console.log('jwt', jwt)
        const res = await axios.post(`${apiEndPoint}/payload`, payload, headers())
        openSignRequest(res.data.uuid)
        await status()
        const result = await axios.get(`${apiEndPoint}/payload/${res.data.uuid}`, headers())
        return result
    } catch(e) {
        if (e === '') throw { msg: 'closed', error: false }
        throw e
    }
}

const versionCheck = (v1, v2) => {
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');

    // First, validate both numbers are true version numbers
    function validateParts(parts) {
        for (var i = 0; i < parts.length; ++i) {
            if (!/^\d+$/.test(parts[i])) {
                return false;
            }
        }
        return true;
    }
    if (!validateParts(v1parts) || !validateParts(v2parts)) {
        return NaN;
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length === i) {
            return 1;
        }

        if (v1parts[i] === v2parts[i]) {
            continue;
        }
        if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        return -1;
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

export default {
    getTokenData,
    closeXapp,
    signPayload: payload,
    payloadGet,
    openExternalBrowser,
    openTxViewer,
    versionCheck
}