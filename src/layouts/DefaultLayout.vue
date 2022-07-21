<template>
    <Nav />

    <header class="container">
        <TakeLoan v-if="components.TakeLoan" @socket-send="sendSocket" @action="buttonAction">What is the point of all?</TakeLoan>
        <LandingScreen v-if="components.LandingScreen" @action="buttonAction">{escrows}</LandingScreen>
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
    import xapp from '../plugins/xapp.js'
    import client from '../plugins/ws-client.js'

    import Nav from "../components/Nav.vue"
    import Refs from "../components/Refs.vue"
    import TakeLoan from "../components/TakeLoan.vue"
    import LandingScreen from "../components/LandingScreen.vue"

    export default {
        name: 'DefaultLayout',
        components: {
            Nav,
            Refs,
            TakeLoan,
            LandingScreen
        },
        data() {
            return {
                account: '',
                nodetype: 'TESTNET',
                socket: null,
                timeout_socket: null,
                reconnect_socket: 0,
                pong: false,
                ready: false,
                components: {
                    LandingScreen: true,
                    TakeLoan: false,
                }
            }
        },
        deactivated() {
            console.log('deactivated deactivated deactivated!!!!')
            if (this.socket != null) {
                this.socket.close()
            }
        },
        beforeUnmount() {
            console.log('beforeUnmount beforeUnmount beforeUnmount!!!!')
            if (this.socket != null) {
                this.socket.close()
            }
        },
        beforeMount() {
            console.log('beforeMount beforeMount beforeMount')
        },
        async mounted() {
            console.log('token data on mounted', this.$store.getters.getXummTokenData)
            if ( this.$store.getters.getXummTokenData == null) {
                try {
                    if (typeof window.ReactNativeWebView === 'undefined') {
                        this.$store.dispatch('setAccount', 'rMB8mXNQ6spV2i7n7DHVVb5qvC4YWMqp3v')
                        this.account = 'rMB8mXNQ6spV2i7n7DHVVb5qvC4YWMqp3v',
                        this.nodetype = 'TESTNET'
                    } else {
                        const data = await this.getTokenData()
                        if (data == null) { return }
                        this.$store.dispatch('xummTokenData', data)
                        this.$store.dispatch('setAccount', data.account)
                        this.account = data.account
                        this.nodetype = data.nodetype
                    }
                    
                } catch(e) { 
                    console.log('error mounted', e)
                    return 
                }
            }
            
            this.ready = true
            this.account = this.$store.getters.getAccount

            if (this.ready) {
                this.connectWebsocket()
            }
        },
        methods: {
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
                    self.socket.send(JSON.stringify({
                        request: 'SUBSCRIBE',
                        message: {account: self.account},
                        channel: self.account
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
                    
                    if (self.account in data) {
                        if ('PONG' in data[self.account]) {
                            console.log('PONG')
                            self.pong = true
                        }
                        if ('SUBSCRIBED' in data[self.account]) {
                            console.log('SUBSCRIBED!')
                        }
                        if ('RATE_UPDATE' in data[self.account]) {
                            console.log('RATE_UPDATE', data[self.account].RATE_UPDATE)
                            self.$store.dispatch('appendLoans', data[self.account].RATE_UPDATE)
                        }
                        if ('ESCROW_CREATE' in data[self.account]) {
                            console.log('ESCROW_CREATE', data[self.account].ESCROW_CREATE)
                            const result = await xapp.signPayload(data[self.account].ESCROW_CREATE)
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
                if (this.account != '') {
                    this.socket.send(JSON.stringify({
                        request: 'PING',
                        message: {account: this.account},
                        channel: this.account
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
                        this.components.TakeLoan = true
                        this.components.LandingScreen = false
                        break
                    case 'home':
                        this.components.LandingScreen = true
                        this.components.TakeLoan = false
                        break
                }
            }
        } 
    }
</script>
