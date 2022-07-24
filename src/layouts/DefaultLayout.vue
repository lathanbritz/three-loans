<template>
    <header class="container">
        <Loan v-if="components.Loan" @socket-send="sendSocket" @action="buttonAction">What is the point of all?</Loan>
        <Landing v-if="components.Landing" @action="buttonAction">{escrows}</Landing>
    </header>

    <main class="container flex-shrink-0 mb-4">
        <router-view />
    </main>

    <footer class="container footer mb-2 mt-auto">
        <div class="border-top py-3">
            &copy; Three
            <Refs />
        </div>
    </footer>
</template>

<script>
    import Refs from '../components/Refs.vue'
    import Loan from '../components/Loan.vue'
    import Landing from '../components/Landing.vue'

    import {XummSdkJwt} from 'xumm-sdk'

    const Sdk = new XummSdkJwt(import.meta.env.VITE_APP_XAPP_KEY)
    const xapp = new xAppSdk()

    export default {
        name: 'DefaultLayout',
        components: {
            Refs,
            Loan,
            Landing
        },
        data() {
            return {
                nodetype: 'TESTNET',
                socket: null,
                timeout_socket: null,
                reconnect_socket: 0,
                pong: false,
                ready: false,
                components: {
                    Landing: true,
                    Loan: false,
                }
            }
        },
        async mounted() {
            Sdk.getOttData().then(async tokenData => {
                console.log('OTT Data', tokenData)
                this.$store.dispatch('xummTokenData', tokenData)
                this.$store.dispatch('setAccount', tokenData.account)
                this.nodetype = tokenData.nodetype

                const {data} = await this.axios.get(this.connection.url + `/api/v1/loans/user?account=${tokenData.account}`)
                console.log('is user', data)

                if (data.user == false) {
                    await this.signIn()
                }
                else {
                    this.$store.dispatch('setUUID', data.uuid)
                    this.connectWebsocket()
                }

                if (tokenData?.origin?.type == 'PUSH_NOTIFICATION' || tokenData?.origin?.type == 'EVENT_LIST') {
                    console.log('data origin', tokenData?.origin)
                    this.consumePayload(tokenData?.origin?.data?.payload)
                }

                
                Sdk.ping().then(data => {
                    console.log('Pong', data)
                    console.log('jwtData', data.jwtData)
                    console.log('token data on mounted', this.$store.getters.getXummTokenData)
                })
            })
        },
        methods: {
            async signPayload(data) {
                console.log('ask to signPayload', data)
                const payload = await Sdk.payload.create(data)
                return await xapp.openSignRequest({ uuid: payload.uuid })
                .then(d => {
                    console.log('response', d)
                    console.log('openSignRequest response:', d instanceof Error ? response.d : d)
                    return d
                })
            },
            async consumePayload(payload_uuid) {
                console.log('consumePayload....', payload_uuid)    
                const result = await Sdk.payload.cancel(payload_uuid)
                console.log('payload cancel result....', result)

                ["data origin",{"type":"EVENT_LIST","data":{"payload":"f41241b1-e4f9-4e3f-9429-21f55ea7cff2","tx":"FF53E21AED1E7F899B864EDFEDCBA78B63E38D7E7777FE0CB9618A7AFBA1958C"}}]
            },
            async signIn() {
                const self = this
                console.log('in signIn')
                const comand = { 'txjson': { 'TransactionType': 'SignIn' }}
                console.log('comand', comand)
                
                const payload = await Sdk.payload.createAndSubscribe(comand, e => {
                    console.log('createAndSubscribe', e.data)
                    if (e.data?.user_token == true) {
                        console.log('setUUID', e.data?.payload_uuidv4)
                        this.$store.dispatch('setUUID', e.data?.payload_uuidv4)
                        self.connectWebsocket()
                    }
                    if (typeof e.data.signed !== 'undefined') {
                        return e.data
                    }
                })
    
                xapp.openSignRequest({ uuid: payload.created.uuid })
                .then(d => {
                    // d (returned value) can be Error or return data:
                    console.log('response', d)
                    console.log('openSignRequest response:', d instanceof Error ? d.message : d)
                    return d
                })
                .catch(e => console.log('Error:', e.message))

                const resolved_sign = await xapp.on('payload', function (data) {
                    console.log('signin payload', data)
                    return data?.reason
                })

                return resolved_sign
            },
            connectWebsocket() {
                const self = this
                console.log('location', window.location.origin)
                if ('https://192.168.0.19:3007' == window.location.origin) {
                    console.log('using local socket')
                    this.socket = new WebSocket(this.connection.socket_local)
                }
                else {
                    console.log('using remote socket')
                    this.socket = new WebSocket(this.connection.socket)    
                }
                
                this.reconnect_socket++
                this.socket.onopen = function (message) {

                    const tokenData = self.$store.getters.getXummTokenData
                    self.socket.send(JSON.stringify({
                        request: 'SUBSCRIBE',
                        message: {
                            account: self.$store.getters.getAccount, 
                            uuid: self.$store.getters.getUUID, 
                            version: tokenData?.version,
                            locale: tokenData?.locale,
                            currency: tokenData?.currency,
                            nodetype: tokenData?.nodetype,
                            nodewss: tokenData?.nodewss,
                            user: tokenData?.user
                        },
                        channel: self.$store.getters.getAccount
                    }))
                    self.ping()

                    console.log('three escrow sockets connected! :)')
                }
                this.socket.onmessage = async function (message) {
                    if (self.timeout_socket != null) {
                        clearTimeout(self.timeout_socket)
                        self.timeout_socket = null
                    }
                    let data = JSON.parse(message.data)
                    const account = self.$store.getters.getAccount
                    if (account in data) {
                        if ('PONG' in data[account]) {
                            // console.log('PONG')
                            self.pong = true
                        }
                        if ('SUBSCRIBED' in data[account]) {
                            console.log('SUBSCRIBED!')
                        }
                        if ('RATE_UPDATE' in data[account]) {
                            // console.log('RATE_UPDATE', data[account].RATE_UPDATE)
                            self.$store.dispatch('appendLoans', data[account].RATE_UPDATE)
                        }
                        if ('ESCROW_CREATE' in data[account]) {
                            console.log('ESCROW_CREATE', data[account].ESCROW_CREATE)
                            const result = await self.signPayload(data[account].ESCROW_CREATE)
                            console.log('result', result)
                        }
                    }
                }
                setInterval(() => {
                    self.pong = false
                    self.ping()
                }, 10_000)

                this.socket.onerror = function (message) {
                    console.log('There was an error connection to three escrow socket! :(')
                    console.log(message)
                    self.socket.close()
                }

                this.socket.onclose = function (message) {
                    console.log('three socket escrow disconnected!', message)
                    if (self.timeout_socket == null && message.code != 1005) {
                        self.timeout_socket = setTimeout(() => {
                            if (self.reconnect_socket < 30) {
                                self.connectWebsocket() 
                            }
                        }, 3000)
                    }
                }
            },
            ping() {
                if (this.$store.getters.getAccount != '') {
                    this.socket.send(JSON.stringify({
                        request: 'PING',
                        message: {account: this.$store.getters.getAccount},
                        channel: this.$store.getters.getAccount
                    }))
                }
                else {
                    console.log('account is empty')
                }
            },
            sendSocket(params) {
                this.socket.send(JSON.stringify(params))
            },
            buttonAction(action) {
                console.log('buttonAction', action)
                switch (action) {
                    case 'loan':
                        this.components.Loan = true
                        this.components.Landing = false
                        break
                    case 'home':
                        this.components.Landing = true
                        this.components.Loan = false
                        break
                }
            }
        } 
    }
</script>
