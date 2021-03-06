'use strict'
 /* eslint-disable */ 
export const AppStore = {
    state: () => ({
        version: '0.0.1',
        xumm: {
            tokenData: null
        },
        account: '',
        user_token: '',
        ledger: 0,
        loans: []
    }),
    actions: {
        xummTokenData({commit}, data) {
            commit('TOKEN_DATA', data)
        },
        setUserToken({commit}, user_token) {
            commit('USER_TOKEN', user_token)
        },
        setAccount({commit}, account) {
            commit('ACCOUNT', account)
        },
        appendLoans({commit}, data) {
            commit('APPEND_LOANS', data)
        },
        removeLoan({commit}, data) {
            commit('REMOVE_LOAN', data)
        }
    },
    mutations: {
        TOKEN_DATA(state, data) {
            state.xumm.tokenData = data
        },
        ACCOUNT(state, account) {
            state.account = account
        },
        USER_TOKEN(state, user_token) {
            state.user_token = user_token
        },
        APPEND_LOANS(state, data) {
            state.ledger = data.ledger
            for (let index = 0; index < state.loans.length; index++) {
                const element = state.loans[index]
                if (element.escrow_condition === data.escrow_condition) {
                    state.loans[index].original_rate = data.original_rate
                    state.loans[index].current_rate = data.current_rate
                    state.loans[index].ledger = data.ledger
                    state.loans[index].currency = data.currency
                    state.loans[index].liquidation = data.liquidity_base
                    state.loans[index].current = data.liquidity_call
                    return
                }
            }
            state.loans.push({
                amount: data.amount,
                collateral: data.collateral,
                original_rate: data.original_rate,
                current_rate: data.current_rate,
                liquidation: data.liquidity_base,
                current: data.liquidity_call,
                original: data.capital,
                ledger: data.ledger,
                amount: data.amount,
                account: data.account,
                currency: data.currency,
                issuer: data.issuer,
                escrow_condition: data.escrow_condition,
                loan_term: data.cancel_after,
            }) 
        },
        REMOVE_LOAN(state, data) {
            for (let index = 0; index < state.loans.length; index++) {
                const element = state.loans[index]
                if (element.escrow_condition === data.escrow_condition) {
                    state.loans.splice(index, 1)
                    return
                }
            }
        }
    },
    getters: {
        getVersion: state => {
            return state.version
        },
        getXummTokenData: state => {
            return state.xumm.tokenData
        },
        getUserToken: state => {
            return state.user_token
        },
        getAccount: state => {
            return state.account
        },
        getLoans: state => {
            return state.loans
        },
        getLedger: state => {
            return state.ledger
        }
    }
}