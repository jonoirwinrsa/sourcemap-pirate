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

      await writeFile('./generated/' + m.source, content).then(r => {console.log(r)})
    })

  }).catch(error => console.log(error))
})

const writeFile = async (path, content) => {
  await mkdirp(getDirName(path))
  await fs.writeFileSync(path, content, {
    encoding: 'utf8',
    mode: 666,
    flag: 'w'
  })
  return 'success'
}
