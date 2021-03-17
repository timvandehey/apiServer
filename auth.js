function login () {
  const {user} =store
  log(user)
  return user
}

function validateToken(idToken) {
  try {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    // const user = JSON.parse(UrlFetchApp.fetch(url))
    // return user
  } 
  catch (e) {
    throw credentialsError(e + idToken)
  } 
}

function checkUser (user) {
  validateToken(user.idToken)
  return user
}

function getSchema(dbName) {
  if (dbName == '') return null
  const {user} = store
  const schema = store.schemas[dbName]
  if (!schema) throw dbError(`invalid Database Name - ${dbName}`)
  if (schema.needPin && !user.hasPin) throw Error(`Need PIN for ${dbName}`)
  const { owners, editors, viewers } = schema
  log([...owners, ...editors, viewers], user.email)
  user.read = viewers.includes('all') || [...owners, ...editors, ...viewers].includes(user.email)
  user.write = [...owners, ...editors].includes(user.email)
  return schema
}


/* Not needed because using Google Signin
function googleJWT () {
  const jwt = `eyJhbGciOiJSUzI1NiIsImtpZCI6ImZkYjQwZTJmOTM1M2M1OGFkZDY0OGI2MzYzNGU1YmJmNjNlNGY1MDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiODU2NzE5MzgwMjctOXRqcWxnbTA3cWVqbHRyMXRwcDRvMDE2ZTEydDlubjguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NTY3MTkzODAyNy05dGpxbGdtMDdxZWpsdHIxdHBwNG8wMTZlMTJ0OW5uOC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzMwNzI3NzAzMzA4MjY0NjQxNSIsImVtYWlsIjoidGltLnZhbmRlaGV5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiOEpDakxpeVAzZ2s4b3RXam5nVmNYQSIsIm5hbWUiOiJUaW0gVmFuZGVoZXkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2l5S1pNUXhDX0phOU1Ca01qSVQzcDVGWVhHY0ExUHRGTllseTRQN1E9czk2LWMiLCJnaXZlbl9uYW1lIjoiVGltIiwiZmFtaWx5X25hbWUiOiJWYW5kZWhleSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjE0MDMzMTMxLCJleHAiOjE2MTQwMzY3MzEsImp0aSI6IjM2YWNhZTQwY2EwZGY5NTY2ODZkMjI5MzJiZjc5Y2QzMGJkNWQzZjAifQ.TRxBRFDXVCnjLZpHmnYm_DXE75E0oTrJBIq1jmdMSHExuCPyLRRCg7UI31gUrDKjcGHxPiv-T7_ofyaDhtibKN1tZO1Z0d1ZeVt1XDHG2XE8bG3pKCLSIV2gSdp5su02nyD5930QkhcuzfNYCJ9rgMhR9ZjdYEgXL1bvj7CE5qiIhYfkLM55Qdamiy6rGYf8V4LHfQMBRL1jphZwjSe2cNyr7ZzqKm_M9iaeTJ9U2JGENt4HwbXjx6n8PBcImdPcbi8EygLnIk8JUNDCS1ppEzNxqkNF3RozzeV7UykoQg6WKrYcWj1HfB0ox7dzL6YUr9OiyEsblRoZxMiVvtUx4A`

 log(JSON.stringify(getUserInfo(jwt),null,2))
}

function getPayload (jwt) {
    let payload
    try {
        const body = jwt.split('.')[1];
        payload = parse(body)
        log( payload )
    }
    catch (e) {
        Logger.log('invalid IdToken')
        payload = {}
    }
    return payload
}

function parse (base64String) {
  return JSON.parse(Utilities.newBlob(Utilities.base64Decode(base64String)).getDataAsString())
}

function sign (text, secret) {
    return base64Encode(Utilities.computeHmacSha256Signature(text, secret))
}

function verifyJWT (jwt) {
  const msg = "User credentials (JWT) are invalid"
  try {
    const [header, body, signature] = jwt.split('.')
    const headerAndBody = [header, body].join('.')
    const now = Date.now()/1000
    const objHeader = parse(header)
    log( objHeader.exp - now)
    if (now > objHeader.exp) throw credentialsError(msg)
    const computed = sign(headerAndBody, jwtEr)
    if (signature == computed) {
        return getPayload(jwt)
    } else {
        throw credentialsError(msg)
    }
  }
  catch(e) {
    throw credentialsError(msg)
  }
}

function base64Encode (str) {
    var encoded = Utilities.base64EncodeWebSafe(str);
    // Remove padding
    return encoded.replace(/=+$/, '');
}

function createJWT (payload) {
  const iat = Math.floor(Date.now() / 1000) // seconds since epoch
  const hour = 60 * 60
  const expSeconds = store.config.jwtExpHours * hour
  const exp = Math.floor(iat+expSeconds) 
  const header = JSON.stringify({
      typ: 'JWT'
      , alg: 'HS256'
      , iat
      , exp
  });
  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(JSON.stringify(payload));
  const headerAndBody = [encodedHeader, encodedPayload].join('.');
  const signature = sign(headerAndBody, jwtEr)
  //    var signature = Utilities.computeHmacSha256Signature(toSign, jwtEr);
  //    var encodedSignature = base64Encode(signature);
  return [headerAndBody, signature].join('.');
}

function OldLogin (request) {
  const {idToken} = request.params
  const user = getUserInfo(idToken)
  user.auth = true
  log(user)
  return user
  
    // const { email, pwd } = request.params
    // const pwdComputed = sign(pwd, email)
    // const user = store.users[email]
    // const errMessage = "Email Password combination not valid."
    // if (!user) throw userPwdError(errMessage)
    // const { firstname, lastname, avatar, pwd: password } = user
    // if (pwdComputed != password) throw userPwdError(errMessage)
    // const more = { firstname, lastname, avatar }
    // const payload = { auth: true, email, hasPin: false, ...more }
    // const newJwt = createJWT(payload)
    // return { ...payload, jwt: newJwt }
}

*/