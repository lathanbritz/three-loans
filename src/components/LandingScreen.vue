<template>
    <div class="p-5 mb-4 bg-light rounded-3" v-if="component==='LandingScreen'">
        <div class="container-fluid py-5">
            <h1 class="display-1 fw-bold main-text text-center"><em><slot></slot></em></h1>
            <p class="col-md-8 fs-4">
                <p class="text-muted text-end fs-6">by three</p>
            </p>
            <p class="col-md-12 fs-4">
                <p class="text-center">
                    <a class="btn btn-purple" href="/loans" role="button" id="loan">loan</a>
                    <a class="btn btn-green ms-2" href="/stash" role="button" id="stash">stash</a>
                </p>
            </p>
        </div>
    </div>

    <div v-if="rows.length > 0" class="py-5 mb-4">
        <div class="container-fluid pb-5">
            <h1 class="display-5 fw-bold">{loans}</h1>
            <table class="table">
                <thead class="table-dark">
                    <tr>
                        <th style="cursor: pointer;" scope="col" v-for="col in columns" v-on:click="sortTable(col)">{{col}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows">
                        <td scope="row">{{numeralFormat(row['amount'], '0,0[.]000000')}} {{row['currency']}}</td>
                        <td scope="row">{{row['collateral']}} {{row['currency']}}</td>
                        <td scope="row">{{numeralFormat(row['original_rate'], '0,0[.]000000')}} {{row['currency']}}/XRP</td>
                        <td scope="row">{{numeralFormat(row['current_rate'], '0,0[.]000000')}} {{row['currency']}}/XRP</td>

                        <td scope="row">{{numeralFormat(row['liquidation'], '0,0[.]000000')}} XRP</td>
                        <td scope="row">{{numeralFormat(row['current'], '0,0[.]000000')}} XRP</td>
                        <td scope="row">{{numeralFormat(row['original'], '0,0[.]000000')}} XRP</td>

                        <!-- <td scope="row">{{row['ledger']}}</td> -->
                        <td scope="row">{{
                            new Date((row['loan_term'] + 946684800) * 1000).toISOString().split('.')[0]
                        }}</td>
                        <!-- <td scope="row">{{row['issuer']}}</td> -->
                        
                        
                        
                        
                        <!-- <td scope="row"><a :href="'/account?account=' + row['account']" class="text-pink">{{row['account']}}</a></td>
                        <td scope="row"><a :href="'/account?account=' + row['destination']" class="text-pink">{{row['destination']}}</a></td> -->
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <footer>
        <p>XRPL ledger: {{ledger}}</p>
        <p>account: {{account}}</p>
    </footer>
</template>

<script>
    export default {
        name: 'LandingScreen',
        props: ['socket', 'component'],
        data() {
            return {
                ready: false,
                account : ''
            }
        },
        updated() {
            console.log('updated updated updated updated updated updated updated updated landing.....')
            this.account = this.$store.getters.getAccount
            if (this.account != '') {
                this.ready = true
            }
            if (this.ready) {
                this.onmessage()
            }
        },
        async mounted() {
            if (this.component != 'LandingScreen') { return }
            console.log('Landing screen mounted')
        },
        computed: {
            rows() {
                console.log('loanss...s')
                return this.$store.getters.getLoans
            },
            ledger() {
                return this.$store.getters.getLedger
            },
            "columns": function columns() {
                if (this.rows.length == 0) {
                    return []
                }
                return Object.keys(this.rows[0]).filter( code => code !== 'ledger').filter( code => code !== 'currency').filter( code => code !== 'account').filter( code => code !== 'issuer').filter( code => code !== 'escrow_condition')
            }
        },
        methods: {
            appendLoans(item) {
                this.ledger = item.ledger
                for (let index = 0; index < this.rows.length; index++) {
                    const element = this.rows[index]
                    if (element.escrow_condition === item.escrow_condition) {
                        this.rows[index].original_rate = item.original_rate
                        this.rows[index].current_rate = item.current_rate
                        this.rows[index].ledger = item.ledger
                        this.rows[index].currency = item.currency
                        this.rows[index].liquidation = item.liquidity_base
                        this.rows[index].current = item.liquidity_call
                        return
                    }
                }
                this.rows.push({
                    amount: item.amount,
                    collateral: item.collateral,
                    original_rate: item.original_rate,
                    current_rate: item.current_rate,
                    liquidation: item.liquidity_base,
                    current: item.liquidity_call,
                    original: item.capital,
                    ledger: item.ledger,
                    amount: item.amount,
                    account: item.account,
                    currency: item.currency,
                    issuer: item.issuer,
                    escrow_condition: item.escrow_condition,
                    loan_term: item.cancel_after,
                }) 
            },
            onmessage() {
                const self = this

                this.socket.onmessage = function (message) {
                    let data = JSON.parse(message.data)
                    console.log('data', data)
                    if (self.account in data) {
                        data = data[self.account]
                        if ('RRRRRR' in data) {
                            console.log('rate update', data.rate_update)
                            self.appendLoans(data.rate_update)
                        }
                    }
                }
            },
            "sortTable": function sortTable(col) {
                if (this.sortColumn === col) {
                    this.ascending = !this.ascending
                } else {
                    this.ascending = true
                    this.sortColumn = col
                }

                let ascending = this.ascending

                this.rows.sort(function(a, b) {
                    if (a[col] > b[col]) {
                    return ascending ? 1 : -1
                    } else if (a[col] < b[col]) {
                    return ascending ? -1 : 1
                    }
                    return 0
                })
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
