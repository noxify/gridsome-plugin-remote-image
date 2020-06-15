# Gridsome Remote Image Downloader

This is a simple plugin, which is based on a discord discussion.
It's more a workaround than a permanent solution.

The plugin should work with any data source, but I have tested it only with `source-filesystem`.

## Features

* Download of remote images
* Support of multiple images ( see example )

## Install

```sh
npm install -s https://github.com/noxify/gridsome-plugin-remote-image.git

# or

yarn add https://github.com/noxify/gridsome-plugin-remote-image.git
```

## Setup

```js
//gridsome.config.js

module.exports = {
  siteName: 'Gridsome',
  plugins: [
    //...
    {
      use: '@noxify/gridsome-plugin-remote-image',
      options: {
        'typeName' : 'Entry',
        'sourceField': 'remoteImage',
        'targetField': 'imageDownloaded',
        'targetPath': './src/assets/remoteImages'
      }
    },
    {
      use: '@noxify/gridsome-plugin-remote-image',
      options: {
        'typeName' : 'Entry',
        'sourceField': 'remoteImages',
        'targetField': 'imagesDownloaded',
        'targetPath': './src/assets/remoteImages'
      }
    }
  ]
  //...
}
```

## Documentation

You can find the complete documentation here: https://webstone.info/documentation/gridsome-plugin-remote-image
