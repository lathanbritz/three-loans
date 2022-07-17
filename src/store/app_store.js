'use strict'
 /* eslint-disable */ 
export const AppStore = {
    state: () => ({
        version: '0.0.1',
        xumm: {
            tokenData: {}
        },
        account: ''
    }),
    actions: {
        xummTokenData({commit}, data) {
            commit('TOKEN_DATA', data)
        },
        setAccount({commit}, account) {
            commit('ACCOUNT', account)
        }
    },
    mutations: {
        TOKEN_DATA(state, data) {
            state.xumm.tokenData = data
        },
        ACCOUNT(state, account) {
            state.account = account
        },
    },
    getters: {
        getVersion: state => {
            return state.version
        },
        getXummTokenData: state => {
            return state.xumm.tokenData
        },
        getAccount: state => {
            return state.account
        },
    }
}