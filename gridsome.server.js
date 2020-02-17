const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const imageType = require('image-type')
const hash = crypto.createHash('sha256')
const imageDownload = require('image-download')

module.exports = function (api, options) {

    api.loadSource(({
        addSchemaTypes
    }) => {
        addSchemaTypes(`
            type ${options.typeName} implements Node @infer {
                ${options.targetField}: Image
            }
        `)
    })

    api.loadSource(async actions => {

        var nodes = actions.getCollection(options.typeName);

        nodes.data().forEach(async function (node) {

            if (node[options.sourceField]) {
                await getRemoteImage(node, nodes, options);
            }
        })
    })
}

async function getRemoteImage(node, collection, options) {

    await imageDownload(node[options.sourceField]).then(buffer => {
        
        for (let i = 0; i < 5; i++) {
            hash.update(node[options.sourceField] + i);
            const type = imageType(buffer);
            var targetFileName = hash.digest('hex');
            const filePath = path.resolve('./', options.targetPath, `${targetFileName}.${type.ext}`)        

            fs.writeFile(filePath, buffer, (err) => console.log(err ? err : ''));

            node[options.targetField] = filePath;

            collection.updateNode(node);
        }
        
    });

}