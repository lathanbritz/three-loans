<template>
    <div class="p-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5">
            <h1 class="display-5 fw-bold"><slot></slot></h1>
            <p v-if="qr_link==null" class="col-md-8 fs-4">
                <div id="v-model-select-dynamic">
                    <select v-model="trustline" v-on:change="selectCurrency($event)">
                        <option v-for="option in trustlines" :value="option.value">
                        {{ option.label }}
                        </option>
                    </select>
                </div>
                <label>Destination</label><input v-model="destination" /><br/>
                <label>Amount</label><input v-model="amount" placeholder="100" /><br/>
                <label>Collateral</label><input v-model="collateral" placeholder="10" /><br/>
                <label for="end">Expires:</label>
                <input type="datetime-local" id="end" name="escrow-end"
                    v-model="end_date"
                    v-on:change="selectPeriod($event)"
                    :min="end_now" :max="end_max">

                <p><a class="btn btn-purple text-white" @click="createLoan" role="button" id="login">Create Loan</a><a class="btn btn-dark text-white ms-2" @click="returnHome" role="button" id="return">Return</a></p>
            </p>

            <p v-if="qr_link!=null" class="col-md-8 fs-4">
                Lets take a loan....
                <div v-if="sign_request">
                    <p><img :src="qr_png" /></p>
                    <p><a class="btn btn-purple text-white" :href="qr_link" target="_blank" role="button">Open Xumm</a></p>
                </div>
            </p>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Loan',
        emits: ['socket-send'],
        data() {
            return {
                sign_request: false,
                qr_link: null,
                qr_png: null,
                trustlines: [],
                trustline: null,
                end_now: new Date().toISOString().split('.')[0],
                end_date: new Date().toISOString().split('.')[0],
                end_max: new Date().toISOString().split('.')[0],
                amount: null,
                collateral: null,
                destination: 'rNbDBfxEpSV2G9Y8Qbvsn4mEZ98DafkpxK'
            }
        },
        mounted() {
            // set max date range.
            const max = new Date()
            max.setDate(max.getDate() + 31)
            this.end_max = new Date(max).toISOString().split('.')[0]
            console.log('max', this.end_max)

            this.getTrustlines()
        },
        computed: {
            account() {
                return this.$store.getters.getAccount
            },
        },
        methods: {
            async getTrustlines() {
                //const {data} = await this.axios.get(this.connection.url + `/api/v1/loans/trustlines?account=${this.account}`)
                const {data} = await this.axios.get(this.connection.url + `/api/v1/loans/trustlines?account=rThREeXrp54XTQueDowPV1RxmkEAGUmg8`)
                for (let index = 0; index < data.length; index++) {
                    const element = data[index]
                    if (this.trustline == null) {
                        this.trustline = this.currencyHexToUTF8(element.currency) + '-' + element.account
                    }
                    
                    this.trustlines.push({
                        label: this.currencyHexToUTF8(element.currency),
                        value: this.currencyHexToUTF8(element.currency) + '-' + element.account
                    })    
                }
                console.log('trustlines', this.trustlines)
            },
            returnHome() {
                this.$emit('action', 'home')
            },
            createLoan() {
                const loan = {
                    request: 'escrowCreate',
                    account: this.$store.getters.getAccount,
                    destination: this.destination,
                    amount: this.amount,
                    collateral: this.collateral,
                    currency: this.trustline.split('-')[0],
                    issuer: this.trustline.split('-')[1],
                    destination_tag: 0,
                    source_tag: 0,
                    cancel_after: this.end_date
                }

                console.log('createLoan', loan)
                console.log('amount', this.amount)
                console.log('destination', this.destination)

                this.$emit('socket-send', {
                    request: 'ESCROW',
                    message: loan,
                    channel: this.$store.getters.getAccount
                })
                this.$emit('action', 'home')
            },
            selectPeriod(e) {
                console.log('sselected', e.target.value)
                console.log('converted', new Date(e.target.value).getTime())
            },
            selectCurrency(e) {
                if (e.target.options.selectedIndex > -1) {
                    console.log('sselected', e.target.value)
                    this.trustline = e.target.value
                }
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
