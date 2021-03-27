function DB (dbSchema) {
    let records // = store.records
    const ss = SpreadsheetApp.openById(dbSchema.ssid)
    const sheet = ss.getSheetByName(dbSchema.dataSheet)
    const archive = ss.getSheetByName(dbSchema.deletedSheet)
    const fieldsSheet = ss.getSheetByName(dbSchema.fieldsSheet)
    const values = sheet.getDataRange().getValues()
    const [fieldValues, typeValues, ...dataValues] = values
    // const fields = JSON.parse(fieldsJSON[0])
    // const values = fieldsSheet.getDataRange().getValues()
    // const [keys, , ...rows] = values
    const fields = fieldValues.map( (v,i) => [v,typeValues[i]])
    const columns = fields.length
    const toSpreadsheetValueFns = {
        string: st => st
        , text: text => text
        , number: n => n
        , boolean: b => Boolean(b)
        , array: a => JSON.stringify(a)
        , object: o => JSON.stringify(o)
        , date: d => getDate(d).date
        , time: t => t
        , datetime: dt => getDate(dt).local
    }

    const toObjectValueFns = {
        string: st => st
        , text: text => text
        , number: n => n
        , boolean: b => Boolean(b)
        , array: a => parseArray(a)
        , object: o => parseObj(o)
        , date: d => d
        , time: t => t
        , datetime: dt => dt
    }

    // getRecords()
    records = dataValues.reduce((objArray, row) => {
    const rowObj = fields.reduce((record, [name, type ], i) => {
        record[name] = toObjectValue(row[i], type)
        return record
    }, {})
    objArray.push(rowObj)
    return objArray
}, [])

    // function getRecords () {
    //     const values = sheet.getDataRange().getValues()
    //     const [, , , ...dataValues] = values
    //     // records = dataValues.reduce((objArray, row) => {
    //     //     const rowObj = fields.reduce((record, { name, type, def }, i) => {
    //     //         record[name] = toObjectValue(row[i], type, def)
    //     //         return record
    //     //     }, {})
    //     //     objArray.push(rowObj)
    //     //     return objArray
    //     // }, [])
    //     return records
    // }

    function getNextKey () {
        if (records.length == 0) return 1000
        return Math.max.apply(null, (records.map(r => r.key))) + 1
    }

    function findRecord (key) {
        if (!records) getRecords()
        const index = records.findIndex(r => r.key == key)
        if (index == -1) throw dbError(`Record not found, key=${key}`)
        const record = records[index]
        const row = index + store.config.headerRows + 1 // header rows + 1 for 0 index array
        return { row, record, index }
    }

    function recordToValuesArray (record) {
        return [fields.map(([ field, type ]) => {
          const v = toSpreadsheetValue(record[field], type)
          return v
        }
      )]
    }

    function createRecord (record) {
        const { headerRows } = store.config
        record.key = getNextKey()
        sheet.insertRowAfter(headerRows)
        writeRecord(record, headerRows + 1)
        records = [record, ...records]
        return record
    }

    function writeRecord (record, row) {
        const values = recordToValuesArray(record)
        sheet.getRange(row, 1, 1, columns).setValues(values)
    }

    function archiveRecord (row) {
        archive.insertRowAfter(2)
        const target = archive.getRange(3, 1, 1, columns)
        const from = sheet.getRange(row, 1, 1, columns)
        from.copyTo(target)
    }

    function updateRecord (update) {
        let { record, row } = findRecord(update.key)
        archiveRecord(row)
        const updatedRecord = { ...record, ...update }
        writeRecord(updatedRecord, row)
        return updatedRecord
    }

    function deleteRecord (record) {
        const {key} = record
        const { row, index } = findRecord(key)
        const after = records.slice(0, index)
        const before = records.slice(index + 1)
        archiveRecord(row)
        records = [...before, ...after]
        sheet.deleteRow(row)
    }

    function newDate (y = 2020, m = 0, d = 1, h = 0, mm = 0, s = 0) { return new Date(y, m, d, h, mm, s) }

    function toSpreadsheetValue (value, type = "string") {
        return toSpreadsheetValueFns[type](value)
    }


    function toObjectValue (value, type = "string") {
        return toObjectValueFns[type](value)
    }

    function parseObj (st) {
        let x = {}
        if (!st) return x
        try { x = JSON.parse(st) }
        catch (e) {
            log(`Object (JSON) Error: [ ${st} ] ( ${e.message} )`)
            x = {}
        }
        return x
    }

    function parseArray (st) {
        let x = []
        if (!st) return x
        try { x = JSON.parse(st) }
        catch (e) {
            log(`Array (JSON) Error: [ ${st} ] ( ${e.message} )`)
            x = []
        }
        return x
    }

    return {
        dbSchema
        , records
        , fields
        , findRecord
        // , getRecords
        , createRecord
        , updateRecord
        , deleteRecord
    }

}

