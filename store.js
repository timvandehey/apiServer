function getMetaData () {
    const md = JSON.parse(PropertiesService.getScriptProperties().getProperty('metaData'))
    // Logger.log(JSON.stringify(md.schemas,null,2))
    return md
}

const metaSchemas= {
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


let store = {
    ...getMetaData()
}

// store.jwtEr = store.config.jwtEr
// const { jwtEr } = store.config

const timer = timerFactory()

const fns = {
    fbtest: toFirebase
    , create
    , read
    , update
    , delete: deleteRecord
    , getFields
    , initializeMetaData
    , login
    , getAppsIframesAndLinks: vandyMetaDataLib.getAppsIframesAndLinks
}

const apiFunctions = new Map(Object.entries(fns))

const apis = [...apiFunctions.keys()].reduce(
    (p, c, i) => {
        p[c] = c
        return p
    }, {}
)

