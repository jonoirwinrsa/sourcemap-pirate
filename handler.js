const sourceMap = require('source-map')
const fs = require('fs')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname
const fetch = require('node-fetch')
const {zip} = require('zip-a-folder')

const getRawSourceMap = (url) => fetch(url).then(res => res.json()).then(json => json)

async function writeFolderAndFile (path, content) {
  await mkdirp(getDirName('/tmp/generated/' + path))

  fs.writeFileSync('/tmp/generated/' + path, content)
}

async function writeSourceToFile (consumer) {
  console.log('writeSourceToFile')
  return Promise.all(consumer.sources.map(async (source, index) => {
    await writeFolderAndFile(source, consumer.sourcesContent[index])
  }))
}

async function generateSource (url) {
  console.log('generateSource')

  const parsedMap = await getRawSourceMap(url)
  await sourceMap.SourceMapConsumer.with(parsedMap, null, writeSourceToFile)
    .catch(error => handleError(error))
}

function handleError (message) {
  console.log(message)
  return {
    body: message || 'An error occurred',
    statusCode: 500
  }
}

module.exports.generate = async event => {

  console.log(event)

  if (event && event.queryStringParameters && event.queryStringParameters.url) {
    const url = event.queryStringParameters.url

    await generateSource(url)
      .then(async () => {await zip('/tmp/generated', '/tmp/archive.zip')})
      .catch(e => handleError(e))

    return {
      headers: {
        'Content-Type': 'application/zip, application/octet-stream',
        'Content-disposition': 'attachment; filename=archive.zip'

      },
      body: fs.readFileSync('/tmp/archive.zip').toString('base64'),
      isBase64Encoded: true,
      statusCode: 200
    }
  } else {
    return handleError('A url is required')
  }
}
