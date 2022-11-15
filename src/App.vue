<template>
    <header class="container">
        <Landing v-if="components.Landing" @action="buttonAction">{NFT Flush}</Landing>
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
    import Refs from './components/Refs.vue'
    import Landing from './components/Landing.vue'
    import xapp from './plugins/xapp.js'
    
    import {XummSdkJwt} from 'xumm-sdk'

    const Sdk = new XummSdkJwt(import.meta.env.VITE_APP_NFT_KEY)

    export default {
        components: {
            Landing,
            Refs
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
                    Actions: false
                }
            }
        },
        mounted() {
            this.jwtFlow()
        },
        methods: {
            async jwtFlow() {
                const self = this
                Sdk.getOttData().then(tokenData => {
                    console.log('tokenData', tokenData)
                    self.$store.dispatch('xummTokenData', tokenData)
                    self.$store.dispatch('setAccount', tokenData.account)
                    self.nodetype = tokenData.nodetype

                    this.jwtSignIn()
                })
                
                

                // if (data.user == false) {
                //     await this.jwtSignIn()
                // }
                // else {
                //     console.log('user', data)
                //     this.$store.dispatch('setUserToken', data.uuid)
                // }
                
                // this.connectWebsocket()
            },
            async jwtSignIn() {
                const self = this
                console.log('jwtSignInjwtSignInjwtSignIn')
                Sdk.payload.create({ txjson: { TransactionType: 'SignIn' }})
                    .then(data => {
                        // d (returned value) can be Error or return data:
                        console.log('openSignRequest response:', data instanceof Error ? data.message : data)

                        console.log('result', data)
                        console.log('UUID', data.application.issued_user_token)
                        self.$store.dispatch('setUserToken', data.application.issued_user_token)
                    })
                    .catch(e => console.log('Error:', e.message))                
            },
        }
    }
</script>