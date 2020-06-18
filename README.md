# Gridsome Remote Image Downloader

This is a simple plugin, which is based on a discord discussion.
It's more a workaround than a permanent solution.

The plugin should work with any data source, but I have tested it only with `source-filesystem`.

## Features

* Download of remote images
* Support of multiple images ( see example )

## Install

```sh
npm i @noxify/gridsome-plugin-remote-image

# or

yarn add @noxify/gridsome-plugin-remote-image
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
        'original': true,
        'typeName' : 'Entry',
        'sourceField': 'remoteImage',
        'targetField': 'imageDownloaded',
        'targetPath': './src/assets/remoteImages'
      }
    },
    {
      use: '@noxify/gridsome-plugin-remote-image',
      options: {
        'cache': false,
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

## Configuration options

* `typeName`
Defines the collection where the script should update the nodes

* `sourceField`
Defines the graphql field which contains the remote image url

* `targetField`
Defines the field name which will be generated.
The field is from Type `Image` or `[Images]` in case the source field is not a string.

* `targetPath`
Defines the target directory for the downloaded images
If you set `./src/assets/remoteImages`, it will save the images to `<projectroot>/src/assets/remoteImages/`

> **You have to ensure, that the defined path is valid and the directory exists.**
> It's currently not possible to use `~` or `@`.

### Optional configurations

* `cache`
Defines whether images will be cached - defaults to `true`.
Setting this to false will force re-download of all images.

* `original`
Defines whether to use the original image path as the file path - defaults to false.
Setting this to true will save images in a folder structure the same as the image URL - `https://example.com/some/image/path.jpg` will be saved as `/<target path>/some/image/path.jpg`

# Example

## Markdown Files

> /content/entries/entry1.md

```md
---
title: First Post
remoteImage: https://images.unsplash.com/photo-1580451998921-c1e6e1ababe0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80
---

Image Credits: https://unsplash.com/
```

> /content/entries/entry2.md

```md
---
title: Second Post
excerpt: Second Post
date: 2020-01-14T21:53:14.578Z
remoteImages:
  - https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80
  - https://images.unsplash.com/photo-1546489545-697049cfdc1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2872&q=80
---

Image Credits: https://unsplash.com/
```

## GraphQL Query

```graphql
{
  allEntry {
    edges {
      node {
        title
        imageDownloaded
        imagesDownloaded {
          image
        }
      }
    }
  }
}

```

## GraphQL Result

```json
{
  "data": {
    "allEntry": {
      "edges": [
        {
          "node": {
            "title": "Second Post",
            "imageDownloaded": {
              "type": "image",
              "mimeType": "image/jpeg",
              //... and all other image properties
            },
            "imagesDownloaded": null
          }
        },
        {
          "node": {
            "title": "First Post",
            "imageDownloaded": null,
            "imagesDownloaded": [
              {
                "image": {
                  "type": "image",
                  "mimeType": "image/jpeg",
                  //... and all other image properties
                }
              },
              {
                "image": {
                  "type": "image",
                  "mimeType": "image/jpeg",
                  //... and all other image properties
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```
