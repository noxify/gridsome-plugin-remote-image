# Gridsome Remote Image Downloader

This is a simple plugin, which is based on a discord discussion.
It's more a workaround than a permanent solution.

The plugin should work with any data source, but I have tested it only with `source-filesystem`.

## Features

* Download of remote images
* Support of multiple images ( see example )

## Install

```sh
npm install -s @noxify/gridsome-plugin-remote-image

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
      use: '@noxify/gridsome-plugin-image-download',
      options: {
        'typeName' : 'Entry',
        'sourceField': 'remoteImage',
        'targetField': 'imageDownloaded',
        'targetPath': './src/assets/remoteImages'
      }
    },
    {
      use: '@noxify/gridsome-plugin-image-download',
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

# Example 


## Example 1 - Simple string field

<details>
  <summary>Click here to see the example code</summary>
  
  > /content/entries/entry1.md

  ```md
  ---
  title: First Post
  remoteImage: https://images.unsplash.com/photo-1580451998921-c1e6e1ababe0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80
  ---

  Image Credits: https://unsplash.com/
  ```

  > gridsome.config.js

  ```js
  module.exports = {
    siteName: 'Gridsome',
    plugins: [{
        use: '@gridsome/source-filesystem',
        options: {
          typeName: 'Entry',
          path: './content/entries/*.md'
        }
      },
      {
        use: '@noxify/gridsome-plugin-remote-image',
        options: {
          typeName: 'Entry',
          sourceField: 'remoteImage',
          targetField: 'downloadedImage',
          targetPath: './src/assets/downloadedImages'
        }
      }
    ]
  }
  ```

</details>

## Example 2 - Multiple images

<details>
  <summary>Click here to see the example code</summary>
  
  > /content/entries/entry1.md

  ```md
  ---
  title: First Post
  remoteImages:
    - https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80
    - https://images.unsplash.com/photo-1546489545-697049cfdc1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2872&q=80
  ---

  Image Credits: https://unsplash.com/
  ```

  > gridsome.config.js

  ```js
  module.exports = {
    siteName: 'Gridsome',
    plugins: [{
        use: '@gridsome/source-filesystem',
        options: {
          typeName: 'Entry',
          path: './content/entries/*.md'
        }
      },
      {
        use: '@noxify/gridsome-plugin-remote-image',
        options: {
          typeName: 'Entry',
          sourceField: 'remoteImages',
          targetField: 'downloadedImage',
          targetPath: './src/assets/downloadedImages'
        }
      }
    ]
  }
  ```

</details>

## Example 3 - Nested source field

> **Limitation:** The plugin does not support `Array of objects`, yet. (Check `notSupported` in the example below)
> Please ensure, that you have use only `Strings`, `Arrays` or `Objects` in your yaml.
> If you're using `Array object` in your YAML definition, the plugin will not download the remote image(s).


<details>
  <summary>Click here to see the example code</summary>
  
  > /content/entries/entry1.md

  ```md
  ---
  title: First Post
  nested:
    with:
      stringValue: https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80
      arrayValue:
        - https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80
        - https://images.unsplash.com/photo-1546489545-697049cfdc1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2872&q=80
  notSupported:
    - sub:
        child: https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80
    - sub:
      child: https://images.unsplash.com/photo-1546489545-697049cfdc1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2872&q=80
  ---

  Image Credits: https://unsplash.com/
  ```

  > gridsome.config.js

  ```js
  module.exports = {
    siteName: 'Gridsome',
    plugins: [{
        use: '@gridsome/source-filesystem',
        options: {
          typeName: 'Entry',
          path: './content/entries/*.md'
        }
      },
      {
        use: '@noxify/gridsome-plugin-remote-image',
        options: {
          typeName: 'Entry',
          sourceField: 'nested.with.stringValue',
          targetField: 'downloadedNestedStringValue',
          targetPath: './src/assets/downloadedImages'
        }
      },
      {
        use: '@noxify/gridsome-plugin-remote-image',
        options: {
          typeName: 'Entry',
          sourceField: 'nested.with.arrayValue',
          targetField: 'downloadedNestedArrayValue',
          targetPath: './src/assets/downloadedImages'
        }
      }
    ]
  }
  ```

</details>