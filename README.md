# node-pre-gyp-github

Publishes release assets to already existing releases.
Depends on https://github.com/mapbox/node-pre-gyp


# Usage



```json 
{
    "binary": {
        "module_name": "myproject",
        "module_path": "./lib/binding/napi-v{napi_build_version}",
        "remote_path": "v{version}",
        "package_name": "{platform}-{arch}-napi-v{napi_build_version}.tar.gz",
        "host": "https://github.com/<myorg>/<myproject>/releases/download",
        "napi_versions": [
            3
        ]
    },
    "scripts": {
        "package": "node-pre-gyp package",
        "publish": "npm run package && node-pre-gyp-github publish"
    },
}
```
Attention: the `remote_path` have to resolve to a valid release tag!

Before publishing, you need to provide the `NODE_PRE_GYP_GITHUB_TOKEN` which is compatible to the original https://github.com/bchr02/node-pre-gyp-github.

### How do I get the NODE_PRE_GYP_GITHUB_TOKEN? 

Needed rights:

* `write:packages` (for uploading release assets)
* `delete:packages` (for replacing release assets)

See the how to https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
