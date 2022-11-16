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
    //import xapp from './plugins/xapp.js'
    
    const xapp = new xAppSdk()

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
                    Landing: false
                }
            }
        },
        async mounted() {
            await this.jwtFlow()
            this.components.Landing = true
        },
        methods: {
            async jwtFlow() {
                const tokenData = await Sdk.getOttData()
                console.log('tokenData', tokenData)
                this.$store.dispatch('xummTokenData', tokenData)
                console.log('account', tokenData.account)
                this.$store.dispatch('setAccount', tokenData.account)
                this.nodetype = tokenData.nodetype

                this.jwtSignIn()
                
                

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

                console.log('test')

                const request  = { txjson: { TransactionType: 'SignIn' }}
                const subscription = await Sdk.payload.create(request)
                console.log('subscription.created', subscription)

                const res = subscription.openSignRequest({ uuid: subscription.uuid })
                console.log('res', res)
               

 
                // console.log('result', signin)
                // console.log('UUID', signin.uuid)
                // this.$store.dispatch('setUserToken', signin.uuid)                      
            },
        }
    }
</script>