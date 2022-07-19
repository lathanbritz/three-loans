<template>
    <Nav />

    <header class="container">
        <TakeLoan @socket-send="sendSocket" :component="active_component">What is the point of all?</TakeLoan>
        <LandingScreen :component="component">{escrows}</LandingScreen>
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
                active_component: 'LandingScreen',
                account: '',
                socket: null,
                active_socket: null,
                timeout_socket: null,
                reconnect_socket: 0,
                layout: null,
                pong: false,
                ready: false
            }
        },
        watch: {
            $route(to) {
                console.log(to)
                switch (to.fullPath) {
                    case '/':
                        this.active_component = 'LandingScreen'
                        break
                    case '/loans':
                        this.active_component = 'TakeLoan'
                        break
                
                    default:
                        break
                }
                this.layout = to.meta.layout !== undefined ? to.meta.layout : "DefaultLayout";
            },
        },
        beforeMount() {
            console.log('beforeMount beforeMount beforeMount')
        },
        async mounted() {
            console.log('mounted mounted ------')
            console.log('token data,,,,', this.$store.getters.getXummTokenData)
            if ( this.$store.getters.getXummTokenData == null) {
                try {
                    // if (typeof window.ReactNativeWebView === 'undefined') {
                    //     this.account = 'rMB8mXNQ6spV2i7n7DHVVb5qvC4YWMqp3v',
                    //     this.nodetype = 'TESTNET'
                    // } else {
                        const data = await this.getTokenData()
                        if (data == null) { return }
                        this.$store.dispatch('xummTokenData', data)
                        this.$store.dispatch('setAccount', data.account)
                        this.account = data.account
                    // }
                    
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
                console.log('connectWebsocket............')
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
                            self.active_socket = self.socket
                        }
                        if ('rate_update' in data[self.account]) {
                            console.log('RATE_UPDATE', data[self.account].rate_update)
                            self.$store.dispatch('appendLoans', data[self.account].rate_update)
                        }
                        if ('CreateEscrow' in data[self.account]) {
                            console.log('CREATE_ESCROW', data[self.account].CreateEscrow)
                            const result = await xapp.signPayload(data[self.account].CreateEscrow)
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
                console.log('sendSocket', params)
                console.log('scoket', this.socket)
                console.log('account', this.account)
                //this.socket.send(JSON.stringify(params))
            }
        } 
    }
</script>
