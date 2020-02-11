const sourceMap = require('source-map')
const fs = require('fs')
const mkdirp = require('mkdirp')
const getDirName = require('path').dirname

fs.readFile('main.e9423c49.chunk.js.map', (err, rawSourceMap) => {
  if (err) throw err
  const parsedMap = JSON.parse(rawSourceMap)
  sourceMap.SourceMapConsumer.with(parsedMap, null, async consumer => {

    consumer.eachMapping(async function (m) {
      const content = consumer.sourceContentFor(m.source)
      await mkdirp(getDirName('./generated/' + m.source))

      fs.writeFileSync('./generated/' + m.source, content)
    })

  }).catch(error => console.log(error))
})
