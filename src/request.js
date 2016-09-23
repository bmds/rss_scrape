const request = require('request')
const Iconv   = require('iconv').Iconv

const HEADER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'
const HEADER_ACCEPT     = 'text/html,application/xhtml+xml'

// const REGEX_DEFLATE = /\bdeflate\b/
// const REGEX_GZIP    = /\bgzip\b/

function handleError (err) {
	return err.message
	// console.log('feedparser error')
	// console.log(error)
	// if (err) {
	// 	console.log(err, err.stack)
	// }
}

// function maybeDecompress (res, encoding) {
// 	let decompress
// 	if (encoding.match(REGEX_DEFLATE)) {
// 		decompress = zlib.createInflate()
// 	} else if (encoding.match(REGEX_GZIP)) {
// 		decompress = zlib.createGunzip()
// 	}
// 	return decompress ? res.pipe(decompress) : res
// }

function maybeTranslate (res, charset) {
	let iconv
	// Use iconv if its not utf8 already.
	if (!iconv && charset && !/utf-*8/i.test(charset)) {
		try {
			iconv = new Iconv(charset, 'utf-8')
			// console.log('Converting from charset %s to utf-8', charset)
			iconv.on('error', handleError)
			// If we're using iconv, stream will be the output of iconv
			// otherwise it will remain the output of request
			res = res.pipe(iconv)
		} catch (err) {
			res.emit('error', err)
		}
	}
	return res
}

function trimParamater (part) {
	return part.trim()
}

function splitParamater (params, param) {
	let parts = param.split('=').map(trimParamater)

	if (parts.length === 2) {
		params[parts[0]] = parts[1]
	}

	return params
}

function getParams (str) {
	let params = str.split(';').reduce(splitParamater, {})

	return params
}

function handleResponse (res) {
	if (res.statusCode !== 200) return this.emit('error', new Error('Bad status code'))
	let charset = getParams(res.headers['content-type'] || '').charset

	// res = maybeDecompress(res, encoding)
	res = maybeTranslate(res, charset)
}

function fetch (url) {
	// Define our streams
	let req = request(url, {timeout: 10000, pool: false})
	req.setMaxListeners(50)
	// Some feeds do not respond without user-agent and accept headers.
	req.setHeader('user-agent', HEADER_USER_AGENT)
	req.setHeader('accept', HEADER_ACCEPT)

	// Define our handlers
	req.on('error', handleError)
	req.on('response', handleResponse)

	return req
}

module.exports = fetch
