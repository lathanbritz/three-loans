<template>
    <component :is="layout"  :socket="socket" :component="active_component"/>
</template>

<script>
    import DefaultLayout from "./layouts/DefaultLayout.vue"
    import MainLayout from "./layouts/MainLayout.vue"

    export default {
        components: {
            DefaultLayout,
            MainLayout,
        },
        data() {
            return {
                active_component: 'LandingScreen',
                account: 'rMB8mXNQ6spV2i7n7DHVVb5qvC4YWMqp3v',
                socket: null,
                timeout_socket: null,
                reconnect_socket: 0,
                layout: null,
            };
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
        mounted() {
            
            this.connectWebsocket()
        },
        methods: {
            connectWebsocket() {
                const self = this
                console.log('location', window.location.origin)
                if ('https://192.168.0.19:3007/' == window.location.origin) {
                    console.log('using local socket')
                    this.socket = new WebSocket(this.connection.socket_local)
                }
                else {
                    console.log('using remote socket')
                    this.socket = new WebSocket(this.connection.socket)    
                }
                
                this.reconnect_socket++
                this.socket.onopen = function (message) {
                    // self.socket.send(JSON.stringify({
                    //     request: 'SUBSCRIBE',
                    //     message: {request: 'subscribeUpdates'},
                    //     channel: self.account
                    // }))
                    console.log('three escrow sockets connected! :)')
                }
                this.socket.onmessage = function (message) {
                    if (self.timeout_socket != null) {
                        clearTimeout(self.timeout_socket)
                        self.timeout_socket = null
                    }
                }
                this.socket.onerror = function (message) {
                    console.log("There was an error connection to three escrow socket! :(")
                    console.log(message)
                    self.socket.close()
                }

                this.socket.onclose = function (message) {
                    console.log("three socket escrow disconnected!", message)
                    if (self.timeout_socket == null && message.code != 1005) {
                        self.timeout_socket = setTimeout(() => {
                            if (self.reconnect_socket < 30) {
                                self.connectWebsocket() 
                            }
                        }, 3000)
                    }
                }
            },
        } 
    }
</script>