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
    const xappSdk = new xAppSdk()

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
                const urlParams = new URLSearchParams(window.location.search)
                const ott = urlParams.get('xAppToken')
                const tokenData =  await xapp.getTokenData(ott)
                console.log('tokenData', tokenData)
                this.$store.dispatch('xummTokenData', tokenData)
                this.$store.dispatch('setAccount', tokenData.account)
                this.nodetype = tokenData.nodetype

                const {data} = await this.axios.get(this.connection.url + `/api/v1/loans/user?account=${tokenData.account}`)
                
                await this.jwtSignIn()

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
                console.log('jwtSignInjwtSignInjwtSignIn')
                const {data} = await xapp.signPayload({ txjson: { TransactionType: 'SignIn' }})
                console.log('result', data)
                console.log('UUID', data.application.issued_user_token)
                this.$store.dispatch('setUserToken', data.application.issued_user_token)  
            },
        }
    }
</script>