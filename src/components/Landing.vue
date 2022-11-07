<template>
    <div class="p-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5">
            <img src="dist/assets/a.png">
            <p class="col-md-8 fs-4">
                <p class="text-muted text-end fs-6">by three</p>
            </p>
            <p class="col-md-12 fs-4">
                <p class="text-center">
                    <a class="btn btn-purple" @click="$emit('action','loan-actions')" role="button" id="loan">loan</a>
                    <a class="btn btn-green ms-2" @click="$emit('action','stash')" role="button" id="stash">stash</a>
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
    export default {
        name: 'Landing',
        data() {
            return {
                
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
            "currencyHexToUTF8": function currencyHexToUTF8(code) {
				if (code.length === 3)
					return code

				let decoded = new TextDecoder()
					.decode(this.hexToBytes(code))
				let padNull = decoded.length

				while (decoded.charAt(padNull - 1) === '\0')
					padNull--

				return decoded.slice(0, padNull)
			},
            "hexToBytes": function hexToBytes(hex) {
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
