const express = require('express') //importacao do pacote
const app = express() //instanciando express
const moment = require('moment')
const service = require('./service')

const token = 'ZXlKcFpDSTZJbUl6TW1Ga016TXRZVE5rTXkwME4yRXdMU0lzSW1OdlpHbG5iMUIxWW14cFkyRmtiM0lpT2pBc0ltTnZaR2xuYjFOdlpuUjNZWEpsSWpveE5pd2ljMlZ4ZFdWdVkybGhiRWx1YzNSaGJHRmpZVzhpT2pGOTpleUpwWkNJNkltSTBNVFkzWlRFdFlqRTFaaTAwT1dObExUa3daamt0WWpjeU5tUXdPRGRsWmpWaE5XWXpJaXdpWTI5a2FXZHZVSFZpYkdsallXUnZjaUk2TUN3aVkyOWthV2R2VTI5bWRIZGhjbVVpT2pFMkxDSnpaWEYxWlc1amFXRnNTVzV6ZEdGc1lXTmhieUk2TVN3aWMyVnhkV1Z1WTJsaGJFTnlaV1JsYm1OcFlXd2lPakY5'
const appKey = '6186b150aaa801352801005056891bef'

const dateFormatter = 'YYYY-MM-DD HH:mm:ss'

let lastDate = moment('2019-10-01 00:00:00', dateFormatter).toDate()

const poolingInterval = 5000

let authorizations = []

app.get('/', function (req, res) { //endereco da requisicao onde e retornado hello world
  res.send('Hello World');
})
app.listen(3000) //execucao do servidor

function getAuthorizations() {
    const now = new Date()
    service.getAuthorizations(lastDate, now)
        .then(response => {
            console.log('get success', response)
            lastDate = now
            authorizations.concat(response)

            setTimeout(() => {
                getAuthorizations()
            }, poolingInterval);
        })
        .catch(error => [
            console.log('get error', error)
        ])
}

function start() {
    service.init(token, appKey)
        .then(() => {
            console.log('auth success')
            getAuthorizations()
        })
        .catch(error => {
            console.log('auth error', error)
        })
}

start()
