const FeedParser = require('feedparser')
const request    = require('./request')
const Promise    = require('bluebird')

const IMAGE_REGEX = /(https?:\/\/.+?\.(?:png|jpg))/i

function getImage (content) {
	let images

	if (content !== null && content.length) {
		images = content.match(IMAGE_REGEX)

		if (images !== null) {
			return images[0]
		}
	}

	return ''
}

function extractPostData (post) {
	return {
		title:   post.title,
		url:     post.link,
		pubdate: post.pubdate,
		intro:   post.summary,
		content: post.description,
		image:   getImage(post.description)
	}
}

function FeedSource (url, resolve, reject) {
	let feedparser

	let posts = []

	function handleError (err) {
		// console.log('feedparser error')
		// console.log(err, err.stack)
		reject(err)
	}

	function done () {
		resolve(posts)
	}

	function handleResponse () {
		let post
		while (post = this.read()) {
			if (typeof post !== undefined) {
				posts.push(extractPostData(post))
			}
		}
	}

	function init () {
		feedparser = new FeedParser()
		feedparser.on('error', handleError)
		feedparser.on('readable', handleResponse)
		feedparser.on('end', done)

		return request(url)
			.pipe(feedparser)
	}

	return init()
}

function parse (url) {
	return new Promise(function (resolve, reject) {
		return new FeedSource(url, resolve, reject)
	})
}

module.exports = {
	parse
}
