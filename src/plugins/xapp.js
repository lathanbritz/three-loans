import axios from 'axios'

let tokenData
let jwt

const apiEndPoint = 'https://xumm.app/api/v1/xapp-jwt'
const apiKey = import.meta.env.VITE_APP_XAPP_KEY

const headers = () => {
    return { headers: { Authorization: `Bearer ${jwt}` } }
}

const getTokenData = async (ott) => {
    if(!tokenData) {
        try {
            const res = await axios.get(`${apiEndPoint}/authorize`, { headers: { 'x-api-key': apiKey, 'x-api-ott': ott } })
            tokenData = res.data.ott
            jwt = res.data.jwt
            return tokenData
        } catch(e) {
            throw 'Error getting Token Data'
        }
    } else {
        return tokenData
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


const payload = async (payload) => {
    try {
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

export default {
    getTokenData,
    signPayload: payload,
}