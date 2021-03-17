function a () {
  timer.start()
  timer.start(1)
  timer.end(1)
  timer.start(3)
  const db = DB({
    ssid: '1YzNtxGkQuraD_ByQH2gBAMnLthHfA4NVBHLPo2ntuc0'
    , dataSheet: "dbsData"
    , deletedSheet: "dbsDeleted"
    , fieldsSheet: "dbsFields"
  })
  timer.end(3)
  timer.start(4)
  log(db.findRecord(1004))
  // log(db.findRecord(100499))
  db.records.push(56)
  timer.end(4)
  timer.end()
  return { db }
}

function processUsers () {
  const ssData = metaSchemas.users
  const db = DB(ssData)
  const users = {}
  db.records.forEach(r => users[r.email] = r)
  log(users)
  log(getMetaData().users)
  return users
}

function setProperties(key,object) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(object))
}


function t() {
  log(getProperties('config'))
  log(getMetaData().config)
}
function getProperties(key) {
  const val = PropertiesService.getScriptProperties().getProperty(key)
  const obj = JSON.parse(val)
  return {val,obj}
}

function processSchemas () {
  const ssData = metaSchemas.schemaDefs
  const db = DB(ssData)
  const schemas = {...metaSchemas}
  db.records.forEach(r => schemas[r.name] = r)
  setProperties('schemas',schemas) 
  return schemas
}

function processConfig() {
  const ssData = metaSchemas.config
  const ss = SpreadsheetApp.openById(ssData.ssid)
  const sheet = ss.getSheetByName(ssData.dataSheet)
  const values = sheet.getDataRange().getValues()
  const config = values.reduce((acc, row) => {
    const [name, value] = row
    acc[name] = value
    return acc
  }, {})
  setProperties('config',config) 
  return config
}


function initializeMetaData () {
  const metaData = {
    schemas: {
      schemaDefs: {
        ssid: '1YzNtxGkQuraD_ByQH2gBAMnLthHfA4NVBHLPo2ntuc0'
        , url: "https://docs.google.com/spreadsheets/d/1YzNtxGkQuraD_ByQH2gBAMnLthHfA4NVBHLPo2ntuc0/edit#gid=1731555711"
        , dataSheet: 'schemas'
      }
      , users: {
        ssid: '1YzNtxGkQuraD_ByQH2gBAMnLthHfA4NVBHLPo2ntuc0'
        , dataSheet: 'users'
      }
      , config: {
        ssid: '1YzNtxGkQuraD_ByQH2gBAMnLthHfA4NVBHLPo2ntuc0'
        , dataSheet: 'config'
      }
    }
  }
  timer.start('meta')
  let { schemas } = metaData
  try {
    const { schemaDefs, users, config } = schemas
    let ss = SpreadsheetApp.openById(config.ssid)
    let sheet = ss.getSheetByName(config.dataSheet)
    let values = sheet.getDataRange().getValues()
    metaData.config = values.reduce((acc, row) => {
      const [name, value] = row
      acc[name] = value
      return acc
    }, {})
    store.config = metaData.config
    db = DB(schemaDefs)
    schemaDefs.schema = db.schema
    db.records.forEach(r => schemas[r.name] = r)
    db = DB(users)
    users.schema = db.schema
    metaData.users = {}
    db.records.forEach(r => metaData.users[r.email] = r)
    timer.end('meta')
    Logger.log(JSON.stringify(metaData))
    PropertiesService.getScriptProperties().setProperty('metaData', JSON.stringify(metaData))
  }
  catch (e) {
    throw Error(e.message)
  }
  return metaData
}

function checkReadAccess () {
  const {user} = store
  if (!user.read) throw notAuthorized(`${user.email} not authorized to read ${schema.name}`)
}

function checkWriteAccess () {
  const {user} = store
    if (!user.write) throw notAuthorized(`${user.email} not authorized to write ${schema.name}`)

}

function create (record) {
  checkWriteAccess()
  return DB(store.schema).createRecord(record)
}

function read (key=0) {
  checkReadAccess()
  const db = DB(store.schema)
  return key ? [db.findRecord(key).record] : db.records
}

function update (record) {
  checkWriteAccess
  return DB(store.schema).updateRecord(record)
}

function deleteRecord (record) {
  checkWriteAccess()
  return DB(store.schema).deleteRecord(record)
}

function getFields () {
  return DB(store.schema).fields
}




// function getDataOld (request) {
//   const { dbName } = request
//   const schema = store.schemas[dbName]
//   const ss = SpreadsheetApp.openById(schema.ssid)
//   const sheet = ss.getSheetByName(schema.dataSheet)

//   const allRows = sheet.getDataRange().getValues()
//   const values = allRows.slice(schema.headerRows)
//   const records = values.reduce((objArray, row) => {
//     const rowObj = schema.fields.reduce((record, [name, type], i) => {
//       record[name] = toObjectValue(row[i], type)
//       return record
//     }, {})
//     objArray.push(rowObj)
//     return objArray
//   }, [])
//   // apiLog spreadsheet
//   const outss = SpreadsheetApp.openById('1QYmRgX49MOB13GlqQv4XrPkMmUbN7AZovrSQQXhJsW4')
//   const outsheet = outss.getSheetByName('Sheet1')
//   outsheet.clear()
//   const fields = schema.fields.map(([f]) => f)
//   const types = schema.fields.map(([, t]) => t)
//   const headers = [fields, types]
//   const outValues = [...headers, ...records.map(
//     obj => schema.fields.reduce(
//       (acc, [name, type]) => {
//         acc.push(toSpreadsheetValue(obj[name], type))
//         return acc
//       }, []
//     )
//   )]
//   outsheet.getRange(1, 1, outValues.length, schema.columns).setValues(outValues)
//   return records
// }


// function getMetaSchema (values) {
//   const headers = values.slice(0, 2)
//   const [fieldArray, typesArray] = headers
//   const fields = zip(fieldArray, typesArray)
//   const headerRows = 2
//   return { fields, headerRows }
// }

// function initializeMetaDataOLD () {
//   // timer.start()
//   // const { ssid, dataSheets, dbs } = store.metaSchema
//   // dataSheets.forEach(dataSheet => {
//   //   dbs[dataSheet] = DB({ ssid, dataSheet })
//   // })
//   // store.config = dbs.config.getData(dbs.config)[0]
//   // jwtEr = store.config.jwtEr
//   // store.users = dbs.config.getData(dbs.config)
//   // store.schemas = dbs.schemas.getData(dbs.schemas)
//   // timer.end()
//   return store.metaSchema

//   const ss = SpreadsheetApp.openById('1YzNtxGkQuraD_ByQH2gBAMnLthHfA4NVBHLPo2ntuc0')
//   const nameAndSheetName = [
//     ['schemas', 'schemas']
//     , ['config', 'config']
//     , ['users', 'users']
//     , ['panels', 'panels']
//   ]
//   const meta = nameAndSheetName.reduce((buildMeta, [name, sheetName]) => {
//     const sheet = ss.getSheetByName(sheetName)
//     const values = sheet.getDataRange().getValues()
//     buildMeta[name] = getRecords(values, getMetaSchema(values))
//     return buildMeta
//   }, {})
//   const schemaObjects = meta.schemas.reduce((schemas, schema, i) => {
//     if (schema.dbtype == 'ss') {
//       schema.fields = zip(schema.fields.split('||'), schema.types.split('||'))
//       schema.columns = schema.fields.length
//       delete schema.types
//     }
//     schemas[schema.name] = schema
//     return schemas
//   }, {})
//   meta.schemas = schemaObjects
//   meta.config = meta.config[0]
//   PropertiesService.getScriptProperties().setProperty('meta', JSON.stringify(meta))
//   return meta
// }

// function getRecords (values, schema) {
//   const { fields, headerRows } = schema
//   const datavalues = values.slice(headerRows)
//   const records = datavalues.reduce((objArray, row) => {
//     const rowObj = fields.reduce((record, [name, type], i) => {
//       record[name] = getValue(row[i], type)
//       return record
//     }, {})
//     objArray.push(rowObj)
//     return objArray
//   }, [])
//   return records
// }

