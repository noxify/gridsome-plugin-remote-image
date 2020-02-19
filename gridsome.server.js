const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const imageType = require('image-type')
const imageDownload = require('image-download')
const validate = require('validate.js')
const chalk = require('chalk')
const _ = require('lodash')

class ImageDownloader {
    
    constructor(api, options) {

        //no one is perfect, so we check that all required
        //config values are defined in `gridsome.config.js`
        const validationResult = this.validateOptions(options);
        if( validationResult ) {
            console.log();
            console.log(`${chalk.yellowBright('Remote images are not downloaded. Please check your configuration.')}`)
            console.log(`${chalk.yellowBright('* '+validationResult.join('\n* '))}`)
            console.log();

            return null;
        }

        this.options = options;

        api.loadSource(async actions => {
        
            //check and ensure that at least one node contains
            //the defined source field - if not, we don't have to continue
            const fieldType = this.getFieldType(actions);    
                        
            if( !fieldType ) {
                console.log();
                console.log(`${chalk.yellowBright('Remote images are not downloaded.')}`)
                console.log(`${chalk.yellowBright(`* Unable to find a node where "${this.options.sourceField}" is filled.`)}`)
                console.log();

                return null;
            }

            //update the graphql schema
            this.addFieldToSchema(actions, fieldType)

            //download the images and update the nodes
            await this.updateNodes(actions, fieldType)            
        });
    }

    addFieldToSchema(actions, fieldType) {
        const schemaType = (fieldType == 'string') ? 'Image' : '[Images]';
        
        //it seems that `[Image]` isn't supported, yet
        //created this type as workaround
        actions.addSchemaTypes(`
            type Images  {
                image: Image
            }
        `)
        
        //extend the existing schema
        const result = actions.addSchemaTypes(`
            type ${this.options.typeName} implements Node @infer {
                ${this.options.targetField}: ${schemaType}
            }
        `)        
    }

    async updateNodes(actions, fieldType) {

        var collection = actions.getCollection(this.options.typeName);

        var that = this;
        collection.data().forEach(async function (node) {
            
            if ( _.get(node, that.options.sourceField) !== undefined ) {

                const imagePaths = await that.getRemoteImage(node, fieldType);
                if( fieldType == 'string' ) {
                    node[that.options.targetField] = imagePaths[0];
                } else {
                   
                    node[that.options.targetField] = _.map(imagePaths, function(imagePath) {
                        return {
                            image: imagePath
                        };
                    });   
                }

                collection.updateNode(node);
            }
        })

    }

    async getRemoteImage(node, fieldType) {

        var that = this;

        const imageSources = (fieldType == 'string') ? [_.get(node, this.options.sourceField)] : _.get(node, this.options.sourceField);        

        let imagePaths = await Promise.all(
            _.map(imageSources, async (imageSource) => {
                
                return await imageDownload(imageSource).then(buffer => {

                    const hash = crypto.createHash('sha256');
                    hash.update(imageSource);
                    var targetFileName = hash.digest('hex');
                    
                    const type = imageType(buffer);

                    const filePath = path.resolve(
                        that.options.targetPath, 
                        `${targetFileName}.${type.ext}`
                    )

                    fs.writeFile(filePath, buffer, (err) => console.log(err ? err : ''));
                    return filePath;
                });
            })
        );
        
        return imagePaths;
    }

    getFieldType(actions) {

        const nodeCollection = actions.getCollection(this.options.typeName);

        

        let findQuery = {};
        
        //details about this definition can be found here
        //https://github.com/techfort/LokiJS/wiki/Query-Examples#find-operator-examples-
        findQuery[this.options.sourceField] = {
            '$exists': true
        };
        
        const node = nodeCollection.findNodes(findQuery);
    
        return (node[0]) ? typeof _.get(node[0], this.options.sourceField) : false;
    }

    validateOptions(options={}) {
        const contraintOption = {
            presence: {
                allowEmpty: false
            }
        };

        const constraints = {
            typeName: contraintOption,
            sourceField: contraintOption,
            targetField: {
                format: {
                    pattern: "[a-zA-Z0-9_-]+",
                    flags: "i",
                    message: "can only contain a-z, A-Z, 0-9, _ and -"
                },
                ...contraintOption
            },
            targetPath: contraintOption
        };

        const validationResult = validate(options, constraints, {
            format: "flat"
        });

        return validationResult;
    }
}

module.exports = ImageDownloader