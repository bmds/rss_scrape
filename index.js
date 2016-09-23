const rss = require('./src/feed')
const URL = 'http://roebuck.ng2.devwebsite.co.uk/feeds/news.asp?pid=3&nid=11'

rss.parse(URL)
	.then(function (sdd) {
		// console.log('then', sdd)
	})
