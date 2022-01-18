"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const octokit_1 = require("octokit");
const process_1 = require("process");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const tar_1 = __importDefault(require("tar"));
exports.command = 'publish';
exports.desc = 'Publishes the package';
const builder = (yargs) => yargs
    .options({
    cwd: { type: 'string' }
})
    .env('NODE_PRE_GYP_GITHUB');
exports.builder = builder;
;
const handler = async (argv) => {
    const token = argv.token;
    if (!token) {
        console.error("NODE_PRE_GYP_GITHUB_TOKEN not present. Usage: NODE_PRE_GYP_GITHUB=xxxxxxx node YYY");
        (0, process_1.exit)(-1);
    }
    const working_dir = argv.cwd ? argv.cwd : (0, process_1.cwd)();
    console.log((0, process_1.cwd)());
    const package_json_path = path_1.default.join(working_dir, 'package.json');
    if (!(0, fs_1.existsSync)(package_json_path)) {
        console.error("Current working dir has no package.json");
        (0, process_1.exit)(-1);
    }
    const package_json = require(package_json_path);
    const remote_path = package_json.binary.remote_path.replaceAll('{version}', package_json.version);
    const module_path = path_1.default.join(working_dir, package_json.binary.module_path.replaceAll('{napi_build_version}', '3'));
    const tar_file_name = package_json.binary.package_name
        .replaceAll('{platform}', process_1.platform)
        .replaceAll('{arch}', process_1.arch)
        .replaceAll('{napi_build_version}', '3');
    console.log(`creating ${tar_file_name}`);
    await tar_1.default.create({ gzip: true, file: tar_file_name }, [module_path]);
    const octokit = new octokit_1.Octokit({ auth: token });
    const github_url = new URL(package_json.binary.host);
    const github_url_path = github_url.pathname.split('/');
    const github_owner = github_url_path[1];
    const github_repo = github_url_path[2];
    console.log(github_url.pathname.split('/'));
    const release = await octokit.rest.repos.getReleaseByTag({
        owner: github_owner,
        repo: github_repo,
        tag: remote_path
    });
    const asset = release.data.assets.find(a => a.name === tar_file_name);
    const data = await (0, promises_1.readFile)(tar_file_name);
    if (asset) {
        console.log("Deleting existing release asset");
        await octokit.rest.repos.deleteReleaseAsset({
            owner: github_owner,
            repo: github_repo,
            asset_id: asset.id
        });
    }
    console.log("Uploading release asset");
    await octokit.rest.repos.uploadReleaseAsset({
        owner: github_owner,
        repo: github_repo,
        release_id: release.data.id,
        name: tar_file_name,
        data: data
    });
};
exports.handler = handler;
//# sourceMappingURL=publish.js.map