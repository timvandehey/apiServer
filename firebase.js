function toFirebase (request) {
    const { data } = request
    timer.start('setup')
    const schema = store.schemas['testfb']
    const RTDB_URL = schema.fburl
    // const token = ScriptApp.getOAuthToken()
    // const idtoken = ScriptApp.getIdentityToken()
    // log(getPayload(idtoken))
    const token = request.jwt
    log(token)
    try {
    const url = `${RTDB_URL}/${schema.location}.json?access_token=${encodeURIComponent(token)}`
    timer.end('setup')
    timer.start('write')
    Logger.log(url, data)
    const response = UrlFetchApp.fetch(url, {
        method: 'PUT',
        payload: JSON.stringify(data),
        muteHttpExceptions: true
    })
    timer.end('write')
    Logger.log(4, response)
    timer.start('read')
    // url = RTDB_URL + "/fbtest.json?access_token=" + encodeURIComponent(token)
    const res = UrlFetchApp.fetch(url)
    Logger.log(5, res.getResponseCode())
    Logger.log('_read_')
    log('res', res)
    timer.end('read')
    }
    catch (e) {
      throw firebaseError(e)
    }
    return JSON.parse(res)
}