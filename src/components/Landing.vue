<template>
    <div class="p-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5">
            <img class="bog-roll" src="dist/assets/e.png">
            <p class="col-md-8 fs-4">
                <p class="text-muted text-end fs-6">by three</p>
            </p>
            <p class="col-md-12 fs-4">
                <p class="text-center">
                    <a class="btn btn-purple" @click="flushAll" role="button" id="flush">flush</a>
                </p>
            </p>
        </div>
    </div>
    <footer>
        <p>XRPL ledger: {{ledger}}</p>
        <p>account: {{account}}</p>
    </footer>
</template>

<script>
    import { XrplClient } from 'xrpl-client'

    export default {
        name: 'Landing',
        data() {
            return {
                client: new XrplClient(['wss://hooks-testnet-v2.xrpl-labs.com']),
            }
        },
        async mounted() {
            
        },
        computed: {
            ledger() {
                return this.$store.getters.getLedger
            },
            account() {
                return this.$store.getters.getAccount
            }
        },
        methods: {
            async flushAll() {
                const payload = {
                    'id': 8,
                    'command': 'account_objects',
                    'account': 'rNxpKPGexAFoyr9QjNmLqu2eP5iVLrJWrt',
                    'ledger_index': 'validated',
                    'limit': 200
                }
                const res = await this.client.send(payload)
                console.log('res', res)
                for (let index = 0; index < res.length; index++) {
                    const element = res[index]
                    if (element?.LedgerEntryType === 'NFTokenOffer') {
                        console.log('NFTokenOffer', element)

                    }
                }
            },
            currencyHexToUTF8(code) {
				if (code.length === 3)
					return code

				let decoded = new TextDecoder()
					.decode(this.hexToBytes(code))
				let padNull = decoded.length

				while (decoded.charAt(padNull - 1) === '\0')
					padNull--

				return decoded.slice(0, padNull)
			},
            hexToBytes(hex) {
				let bytes = new Uint8Array(hex.length / 2)

				for (let i = 0; i !== bytes.length; i++) {
					bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
				}

				return bytes
			}
        },
    }
</script>
<style scoped>
    .bog-roll {
        width: 100%;
    }
    .main-text {
        color: #753ee2;
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: black;
    }
    .btn-purple {
        background-color: #753ee2;
        color: #ffffff;
    }
    .btn-pink {
        background-color: #ff1a8b;
        color: #ffffff;
    }

    .btn-green {
        background-color: #00e56a;
        color: #ffffff;
    }
</style>
