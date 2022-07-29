<template>
    <div class="p-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5">
            <h1 class="display-5 fw-bold"><slot></slot></h1>
            <p>
                <a class="btn btn-purple text-white" @click="subscribeLender" role="button" id="login">Subscribe Lend</a>
                <a class="btn btn-purple text-white ms-2" @click="$emit('action','loan')" role="button" id="login">Create Loan</a>
                <a class="btn btn-dark text-white ms-2" @click="$emit('action','home')" role="button" id="return">Return</a>
            </p>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'LoanActions',
        emits: ['socket-send'],
        data() {
            return {
            }
        },
        mounted() {
            
        },
        computed: {
            account() {
                return this.$store.getters.getAccount
            },
        },
        methods: {
            async subscribeLender() {
                console.log('url', this.connection.url + `/api/v1/loans/subscribe?account=${this.$store.getters.getAccount}&notifications=true&user_token=${this.$store.getters.getUserToken}`)
                const {data} = await this.axios.get(this.connection.url + `/api/v1/loans/subscribe?account=${this.$store.getters.getAccount}&notifications=true&user_token=${this.$store.getters.getUserToken}`)
                console.log('subscribeLender', data)
            },
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
        }
    }
</script>

<style scoped>
    .btn-purple {
        background-color: #974CFF !important;
        border-color: #974CFF !important;
    }
</style>
