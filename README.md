# Gridsome Remote Image Downloader

This is a simple plugin, which is based on a discord discussion.
It's more a workaround than a permanent solution.

The plugin should work with any data source, but I have tested it only with `source-filesystem`


## Install

```sh
npm install -s noxify/gridsome-plugin-image-download
```

## Setup

```js
//gridsome.config.js

module.exports = {
  siteName: 'Gridsome',
  plugins: [
    //...
    {
      use: '@noxify/gridsome-plugin-image-download',
      options: {
        'typeName' : 'Entry',
        'sourceField': 'remoteImage',
        'targetField': 'imageDownloaded',
        'targetPath': 'src/assets/remoteImages'
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
Defines the field name which will be generated. The field is from Type `Image`

* `targetPath`
Defines the target directory for the downloaded images
If you set `src/assets/remoteImages`, it will save the images to `<projectroot>/src/assets/remoteImages/`

> **You have to ensure, that the defined path is valid and the directory exists.**
> It's currently not possible to use `~` or `@`.

# Example 

## Markdown File

> /content/entries/entry1.md

```md
---
title: First Post
excerpt: First Post
date: 2020-01-14T21:53:14.578Z
remoteImage: https://images.unsplash.com/photo-1580451998921-c1e6e1ababe0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80
---

Image Credits: https://unsplash.com/@sumit_saharkar
```

## GraphQL Result

```
{
    "title": "First Post",
    "imageDownloaded": {
        "type": "image",
        "mimeType": "image/jpeg",
        "src": "/assets/static/src/assets/remoteImages/a95472d2a0d9513e9146aefc4829217a94c35cca00be7ad01aa6712d80f8cbec.jpg?width=668&fit=cover&key=4bebc73",
        "size": {
        "width": 668,
        "height": 1002
        },
        "sizes": "(max-width: 668px) 100vw, 668px",
        "srcset": [
        "/assets/static/src/assets/remoteImages/a95472d2a0d9513e9146aefc4829217a94c35cca00be7ad01aa6712d80f8cbec.jpg?width=668&fit=cover&key=4bebc73 668w"
        ],
        "dataUri": "data:image/..."
    }
}
```