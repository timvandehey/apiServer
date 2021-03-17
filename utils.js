function log (...text) {
    text.forEach(t => {
        Logger.log(t)
    })
}

function test () {
  log(new Date().toTimeString().slice(9));
log(Intl.DateTimeFormat().resolvedOptions().timeZone);
log(new Date().getTimezoneOffset() / -60);
  log(JSON.stringify(getDate(new Date),null,2))
}

function getTimezone () {
  const scriptTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  try {
    return store.user.timezone.city || scriptTz
  }
  catch (e) {
    return scriptTz
  }
}

 function getDate (dt) {
  // const tz = getTimezone()
  const d = new Date(dt)
  const hour = d.getHours()
  const dows = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Fridat","Saturday"]
  const local = d.toLocaleString().replace(',','')
  const [date , ...rest] = local.split(' ')
  log({local,rest})
  const time = rest.join('') 
  const ret = {
        hour
//           ,azHour: d.getTimezoneOffset() == 300 ? hour - 2 : hour -1
        ,minute: d.getMinutes()
        ,second: d.getSeconds()
        ,local
        ,date
        ,time
        ,rest
        // ,az: d.toLocaleString('en-US',{timeZone:'America/Phoenix'}).replace(',','')
      //  ,intl: getIntlInfo(d)
        ,month: d.getMonth()
        ,day: d.getDay()
        ,year: d.getYear()+1900
        ,dow: dows[d.getDay()].substring(0,3)
        ,dowLong: dows[d.getDay()]
        // ,time: String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0')
        ,getTime: d.getTime()
  }
  const {minute,second} = ret
  log({hour,minute,second})
  return ret
}
  
// function getIntlInfo(date) {
// // request a weekday along with a long date
// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
// options.timeZone = 'America/Chicago'
// return new Intl.DateTimeFormat('en-US', options).format(date);
// }

function timerFactory () {
    const def = "default";
    let timers = {};
    const start = (name = def) => {
        timers[name] = {};
        timers[name].start = Date.now();
        log(`Timer [${name}] started`);
    };
    const stop = (name = def) => {
        const timer = timers[name]
        if (!timer.diff) {
            timer.finish = Date.now();
            const { start, finish } = timer;
            timer.diff = finish - start;
        }
        const { diff } = timer;
        log(`Timer [${name}] took ${diff}ms`);
    };
    const status = (name = def) => {
        const now = Date.now();
        const { start } = timers[name];
        const diff = now - start;
        log(`Timer [${name}] has been running for ${diff}ms`);
    };
    const debug = () => log("--debug timers", timers, "-----");
    const all = () => {
        log("--- status of timers ----");
        Object.keys(timers).forEach(status);
        log("-------------------------");
    };
    return { start, stop, end: stop, status, all, debug };
}

function zip (arr1, arr2) {
    if (arr1.length >= arr2.length) return arr1.map((k, i) => [k, arr2[i]])
    return arr2.map((k, i) => [arr1[i], k])
}

function zeroFill (numberDigits, n) {
    const padded = `${Array(numberDigits).fill(0).join('')}${n}`
    const len = Math.max(numberDigits, n.toString().length)
    return padded.substr(-len)
}

function zeroFill2 (n) { return zeroFill(2, n) }

// function apiFnDoesntExist (fn) {
//     throw invalidFunction(`Api function [ ${fn} ] does not exist`)
// }

function apiError (type='unknown', msg="Unknown Error!") {
    const err = new Error(msg)
    const object =  {
        name: 'ApiError'
        , msg: msg
        , date: new Date()
        , stack: err.stack
        , type
    }
    return object
}

const userPwdError = (msg) => apiError('userPwdError',msg)
const dbError = (msg) => apiError('dbError',msg)
const credentialsError = (msg) => apiError('credentialsError',msg)
const notAuthorized = (msg) => apiError('notAuthorized',msg)
const invalidFunction = (fnName) => apiError('invalidFunction',`Api function [ ${fnName} ] does not exist`)
const firebaseError = (msg) => apiError('firebaseError',msg) 
const generalError = (msg) => apiError('generalError',msg)
const recordNotFound = (msg) => apiError('recordNotFound',msg)

class ApiError extends Error {
    constructor(message = "Unknown Error", authError = false) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(message)

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError)
        }

        this.name = 'ApiError'
        // Custom debugging information
        this.autherror = authError
        this.date = new Date()
        this.msg = message
        this.errnum = 18
    }
}