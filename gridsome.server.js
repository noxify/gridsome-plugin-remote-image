const chalk = require('chalk')
const crypto = require('crypto')
const fs = require('fs-extra')
const get = require('lodash.get')
const got = require('got').default
const mime = require('mime/lite')
const normalizeUrl = require('normalize-url')
const path = require('path')
const stream = require('stream')
const url = require('url')
const validate = require('validate.js')
const { promisify } = require('util')

const pipeline = promisify(stream.pipeline)

class ImageDownloader {
    constructor(api, options) {

        //no one is perfect, so we check that all required
        //config values are defined in `gridsome.config.js`
        const validationResult = this.validateOptions(options)

        if (validationResult) {
            console.log()
            console.log(`${chalk.yellowBright('Remote images are not downloaded. Please check your configuration.')}`)
            console.log(`${chalk.yellowBright('* '+validationResult.join('\n* '))}`)
            console.log()

            return null
        }

        this.options = options
        this.api = api

        //initialize the `loadImage` event and make
        //it available before we run the `onBootstrap` command
        this.initializeEvent(api)

        //create a new type `Images` which is required
        //for array support
        //also add a new field to the defined collection
        //to store the downloaded images
        api.createSchema(({ addSchemaTypes }) => {
            const fieldType = this.getFieldType(api, options)
            this.generateSchemaType(addSchemaTypes, fieldType)
        });

        //run the plugin code, after gridsome finished all their work
        api.onBootstrap(() => this.loadImages())
    }

    /**
     * Create a new event via the gridsome plugin api
     * reference: node_modules/gridsome/lib/app/PluginAPI.js
     */
    initializeEvent(api) {
        api._on('loadImage', this.runDownloader)
    }

    /**
     * Run the defined event with the required
     * arguments - i have no clue why `this` is not available
     * but I'm too tired to check this in detail...
     * Defining the needed methods is fine for me :)
     */
    async loadImages() {
        await this.run('loadImage', null, {
            getFieldType: this.getFieldType,
            getRemoteImage: this.getRemoteImage,
            updateNodes: this.updateNodes,
            options: this.options
        })
    }

    /**
     * Defined in `initializeEvent`
     * Called via `loadImages`
     */
    async runDownloader(plugin, api) {
        const fieldType = plugin.getFieldType(api, plugin.options)
        await plugin.updateNodes(api, fieldType, plugin)
    }

    getFieldType(api, options) {
        const nodeCollection = api._app.store.getCollection(options.typeName)

        //details about this definition can be found here
        //https://github.com/techfort/LokiJS/wiki/Query-Examples#find-operator-examples-
        const findQuery = {
            [options.sourceField]: {
                '$exists': true
            }
        }

        const node = nodeCollection.findNode( findQuery )

        //we're using the lodash get functionality
        //to allow a dot notation in the source field name
        return (node) ? typeof get(node, options.sourceField) : false
    }

    generateSchemaType(addSchemaTypes, fieldType) {

        const schemaType =
        fieldType === 'string' ||
        !!(this.options.schemaType && this.options.schemaType === 'Image')
            ? 'Image'
            : '[Images]'

        addSchemaTypes(`
            type Images {
                image: Image
            }
        `)

        //extend the existing schema
        addSchemaTypes(`
            type ${this.options.typeName} implements Node @infer {
                ${this.options.targetField}: ${schemaType}
            }
        `)
    }

    async updateNodes(api, fieldType, plugin) {
        const collection = api._app.store.getCollection(plugin.options.typeName)


        await collection.data().reduce(async (prev, node) => {
            await prev
            if (get(node,plugin.options.sourceField)) {
                const imagePaths = await plugin.getRemoteImage(node, fieldType, plugin.options)

                if( fieldType === 'string' ) {
                    node[plugin.options.targetField] = imagePaths[0]
                } else {
                    node[plugin.options.targetField] = imagePaths.map(image => ({ image }))
                }

                collection.updateNode(node)
            }
            return Promise.resolve()
        }, Promise.resolve())
    }

    async getRemoteImage ( node, fieldType, options ) {
        // Set some defaults
        const { cache = true, original = false, forceHttps = true, downloadFromLocalNetwork = false, targetPath = 'src/assets/remoteImages', sourceField } = options

        const imageSources = (fieldType === 'string') ? [get(node, sourceField)] : get(node, sourceField)

        return Promise.all(
            imageSources.map( async imageSource => {

                // Check if we have a local file as source
                var isLocal = validate({ imageSource: imageSource }, { imageSource: { url: { allowLocal: downloadFromLocalNetwork } } })

                // If this is the case, we can stop here and re-using the existing image
                if( isLocal ) {
                    return imageSource
                }

                // Normalize URL, and extract the pathname, to be used for the original filename if required
                imageSource = normalizeUrl(imageSource, { 'forceHttps': forceHttps })
                const { pathname } = new URL(imageSource)
                // Parse the path to get the existing name, dir, and ext
                let { name, dir, ext } = path.parse(pathname)

                try {
                    // If there is no ext, we will try to guess from the http content-type
                    if (!ext) {
                        const { headers } = await got.head(imageSource)
                        ext = `.${mime.getExtension(headers['content-type'])}`
                    }

                    // Build the target file name - if we want the original name then return that, otherwise return a hash of the image source
                    const targetFileName = original ? name : crypto.createHash('sha256').update(imageSource).digest('hex')
                    // Build the target folder path - joining the current dir, target dir, and optional original path
                    const targetFolder = path.join(process.cwd(), targetPath, original ? dir : '')
                    // Build the file path including ext & dir
                    const filePath = path.format({ ext, name: targetFileName, dir: targetFolder })

                    // If cache = true, and file exists, we can skip downloading
                    if (cache && await fs.exists(filePath)) return filePath

                    // Otherwise, make sure the file exists, and start downloading with a stream
                    await fs.ensureFile(filePath)
                    // This streams the download directly to disk, saving Node temporarily storing every single image in memory
                    await pipeline(
                        got.stream(imageSource),
                        fs.createWriteStream(filePath)
                    )

                    // Return the complete file path for further use
                    return filePath
                } catch(e) {
                    console.log('')
                    console.log(`${chalk.yellowBright(`Unable to download image for ${options.typeName} - Source URL: ${imageSource}`)}`)
                    console.log(`${chalk.redBright(e)}`)
                    return null
                }
            })
        )
    }

    /**********************
     * Helpers
     **********************/

    /**
     * Copied from node_modules/gridsome/lib/app/Plugins.js
     */
    async run(eventName, cb, ...args) {

        if (!this.api._app.plugins._listeners[eventName]) return []

        const results = []

        for (const entry of this.api._app.plugins._listeners[eventName]) {
            if (entry.options.once && entry.done) continue

            const { api, handler } = entry
            const result = typeof cb === 'function'
                ? await handler(cb(api))
                : await handler(...args, api)

            results.push(result)
            entry.done = true
        }

        return results
    }

    validateOptions(options = {}) {
        const contraintOption = {
            presence: {
                allowEmpty: false
            }
        };

        const constraints = {
            typeName: contraintOption,
            sourceField: contraintOption,
            targetField: contraintOption
        };

        const validationResult = validate(options, constraints, {
            format: 'flat'
        })

        return validationResult
    }
}

module.exports = ImageDownloader
