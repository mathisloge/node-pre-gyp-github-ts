import { Arguments, CommandBuilder } from 'yargs';
import { Octokit } from "octokit";
import { exit, cwd } from 'process';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { URL } from 'node:url';

// @ts-ignore
import versioning from '@mapbox/node-pre-gyp/lib/util/versioning.js';

type Options = {
    cwd: string | undefined;
    token: string | undefined;
};

export const command: string = 'publish';
export const desc: string = 'Publishes the package';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            cwd: { type: 'string' }
        })
        .env('NODE_PRE_GYP_GITHUB');


interface PackageJson {
    version: string;
    binary: {
        host: string;
        remote_path: string;
        package_name: string;
        napi_versions: Array<number>;
        module_name: string;
        module_path: string;
    };
};
export const handler = async (argv: Arguments<Options>): Promise<void> => {
    const working_dir = argv.cwd ? argv.cwd : cwd();
    console.log(cwd());
    const package_json_path = path.join(working_dir, 'package.json');
    if (!existsSync(package_json_path)) {
        console.error("Current working dir has no package.json");
        exit(-1);
    }
    const package_json = require(package_json_path) as PackageJson;

    const token = argv.token;
    if (!token) {
        console.error("NODE_PRE_GYP_GITHUB_TOKEN not present. Usage: NODE_PRE_GYP_GITHUB=<your token here> node node-pre-gyp-github");
        exit(-1);
    }

    for await (const napi_version of package_json.binary.napi_versions) {
        const node_pre_gyp_opts = versioning.evaluate(package_json, {}, napi_version);
        const package_name = node_pre_gyp_opts.package_name;
        const tarball = node_pre_gyp_opts.staged_tarball;
        const remote_path = node_pre_gyp_opts.remote_path.split('/')[0]; // node pre gyp adds a / to the end.


        const octokit = new Octokit({ auth: token });
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

        const asset = release.data.assets.find(a => a.name === package_name);
        const data = await readFile(tarball);
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
            name: package_name,
            data: <string><unknown>data
        });
    }
};
