const axios = require('axios')
const https = require('https')
const qs = require('qs')
const moment = require('moment')

// DESENV
const authUrl = 'https://oauth.desenv.bb.com.br/oauth/token';
const getUrl = 'https://api.desenv.bb.com.br/cards/v1/credit-cards/authorizations';

const dateFormatter = 'YYYY-MM-DD HH:mm:ss'

let token = null;
let appKey = null;
let accessToken = null;

function init(initToken, key) {
    const url = authUrl;
    const headers = {
        Authorization: `Basic ${initToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const config = {
        headers
    }

    const params = qs.stringify({
        grant_type: 'client_credentials',
        scope: 'cards.authorization-info'
    })

    if(!initToken){
        return new Promise((resolve, reject) => {
            reject('Token não informado!')
        })
    }

    if(!key){
        return new Promise((resolve, reject) => {
            reject('App key não informada!')
        })
    }

    token = initToken;
    appKey = key;

    return axios.post(url, params, config)
        .then(response => new Promise((resolve, reject) => {
            if (response && response.data && response.data.access_token) {
                accessToken = response.data.access_token
                resolve()
            }else{
                reject('Falha ao obter access_token!')
            }
        }))
        .catch(error => new Promise((resolve, reject) => {
            reject(error.response.data)
        }))
}

function getAuthorizations(initialDate, finalDate) {
    let url = getUrl;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
    };

    const config = {
        headers,
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    }

    const params = {
        'gw-app-key': appKey,
        initialDatetime: moment(initialDate).format(dateFormatter),
        finalDatetime: moment(finalDate).format(dateFormatter)
    }

    Object.keys(params).forEach((param, index) => {
        url += (index === 0 ? '?' : '&') + param + "=" + params[param]
    })

    console.log('url get', url)

    return axios.get(url, config)
        .then(response => new Promise((resolve, reject) => {
            // tratar quanto nao retornarem todos os dados
            resolve(response.data.authorizationsList)
        }))
        .catch(error => new Promise(async (resolve, reject) => {
            // token expirado
            if (error.response.data && error.response.data.statusCode === 401 && token && appKey) {
                await init(token, appKey)
                    .catch(error => reject(error))

                getAuthorizations(initialDate, finalDate)
            }else{
                reject(error.response.data)
            }
        }))
}

exports.init = init;
exports.getAuthorizations = getAuthorizations;
