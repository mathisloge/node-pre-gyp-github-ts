import { Arguments, CommandBuilder } from 'yargs';
import { Octokit } from "octokit";
import { exit, cwd, arch, platform } from 'process';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import tar from 'tar';


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
    const token = argv.token;
    if (!token) {
        console.error("NODE_PRE_GYP_GITHUB_TOKEN not present. Usage: NODE_PRE_GYP_GITHUB=xxxxxxx node YYY");
        exit(-1);
    }
    const working_dir = argv.cwd ? argv.cwd : cwd();
    console.log(cwd());
    const package_json_path = path.join(working_dir, 'package.json');
    if (!existsSync(package_json_path)) {
        console.error("Current working dir has no package.json");
        exit(-1);
    }

    const package_json = require(package_json_path) as PackageJson;
    const remote_path = package_json.binary.remote_path.replaceAll('{version}', package_json.version);
    const module_path = path.join(working_dir, package_json.binary.module_path.replaceAll('{napi_build_version}', '3'));
    const tar_file_name = package_json.binary.package_name
        .replaceAll('{platform}', platform)
        .replaceAll('{arch}', arch)
        .replaceAll('{napi_build_version}', '3');

    console.log(`creating ${tar_file_name}`);
    await tar.create({ gzip: true, file: tar_file_name }, [module_path]);

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

    const asset = release.data.assets.find(a => a.name === tar_file_name);

    const data = await readFile(tar_file_name);
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
        data: <string><unknown>data
    });
};
