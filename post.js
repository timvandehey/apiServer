function post (request = {}) {
  let result
    const {postData={}} = request
    const {contents=''} = postData;
    const data = contents.length==0 ? {} : JSON.parse(contents)
    const { user={}, dbName='', fnName='echo', args=[] } = data
    result = {
      error: false
      , extra: {
          data
          , dbName
          , fnName
          , args
          , request
      }
    }
  try {
    if (!apiFunctions.has(fnName)) throw invalidFunction(fnName)
    store.user = checkUser(user)
    store.schema = getSchema(dbName)
    try {
    result.value = apiFunctions.get(fnName).apply(null,args)
    }
    catch (e) {
      throw generalError(e)
    }
  } catch (e) {
    log(e)
    result.hadError = true
    result.error = e
    result.error.hadError = true
    result.value = e
  }
  result.extra.logs = Logger.getLog()
  return jsonText(result)
}


function get (e = {}) {
    try { return jsonText(safeGet(e)) }
    catch (err) { return errorReturn(err, e) }
}

function jsonText (result) {
    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
}

function safeGet (e = {}) {
    const obj = { ...getData(), e }
    const content = JSON.stringify(obj, null, 2)
    return content
}
