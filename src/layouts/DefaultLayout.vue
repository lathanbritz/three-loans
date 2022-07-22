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
    // import {XummSdkJwt} from 'xumm-sdk'
    import xapp from '../plugins/xapp.js'

    import Refs from '../components/Refs.vue'
    import Loan from '../components/Loan.vue'
    import Landing from '../components/Landing.vue'

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
        deactivated() {
            console.log('deactivated deactivated deactivated!!!!')
            if (this.socket != null) {
                this.socket.close('message test')
            }
        },
        beforeUnmount() {
            console.log('beforeUnmount beforeUnmount beforeUnmount!!!!')
            if (this.socket != null) {
                this.socket.close('message test')
            }
        },
        beforeMount() {
            console.log('beforeMount beforeMount beforeMount')
        },
        async mounted() {
            console.log('token data on mounted', this.$store.getters.getXummTokenData)
            // console.log('keyyy', import.meta.env.VITE_APP_XAPP_KEY)
            // const Sdk = new XummSdkJwt(import.meta.env.VITE_APP_XAPP_KEY)

            // Sdk.getOttData().then(c => {
            //     console.log('OTT Data', c)

            //     Sdk.ping().then(c => {
            //         console.log('Pong', c)
            //     })
            // })


            // // const xppsdk = new xAppSdk()

            if ( this.$store.getters.getXummTokenData == null) {
                try {
                    if (typeof window.ReactNativeWebView === 'undefined') {
                        this.$store.dispatch('setAccount', 'rMB8mXNQ6spV2i7n7DHVVb5qvC4YWMqp3v')
                        this.nodetype = 'TESTNET'
                    } else {
                        const tokenData = await this.getTokenData()
                        if (tokenData == null) { return }
                        this.$store.dispatch('xummTokenData', tokenData)
                        console.log('token data', tokenData)
                        this.$store.dispatch('setAccount', tokenData.account)
                        this.nodetype = tokenData.nodetype

                        const {data} = await this.axios.get(this.connection.url + `/api/v1/loans/user?account=${tokenData.account}`)
                        console.log('is user', data)
                        if (false == true) {
                            await this.signIn()
                        }
                    }
                    
                } catch(e) { 
                    console.log('error mounted', e)
                    return 
                }
            }

            this.ready = true

            if (this.ready) {
                this.connectWebsocket()
            }
        },
        methods: {
            async signIn() {
                const {data} = await xapp.signPayload({ 'txjson': { 'TransactionType': 'SignIn' }})
                console.log('result', data)
                console.log('UUID', data?.application?.issued_user_token)
                this.$store.dispatch('setUUID', data?.application?.issued_user_token)
                console.log('uuid from store', this.$store.getters.getUUID)
            },
            async getTokenData() {
                try {
                    console.log('fetching token data')
                    const urlParams = new URLSearchParams(window.location.search)
                    const ott = urlParams.get('xAppToken')
                    if (ott == null)  { return }
                    return await xapp.getTokenData(ott)
                } catch(e) {
                    console.log('error token fetch', e)
                }
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
                            uuid:self.$store.getters.getUUID,
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
                            console.log('PONG')
                            self.pong = true
                        }
                        if ('SUBSCRIBED' in data[account]) {
                            console.log('SUBSCRIBED!')
                        }
                        if ('RATE_UPDATE' in data[account]) {
                            console.log('RATE_UPDATE', data[account].RATE_UPDATE)
                            self.$store.dispatch('appendLoans', data[account].RATE_UPDATE)
                        }
                        if ('ESCROW_CREATE' in data[account]) {
                            console.log('ESCROW_CREATE', data[account].ESCROW_CREATE)
                            const result = await xapp.signPayload(data[account].ESCROW_CREATE)
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
