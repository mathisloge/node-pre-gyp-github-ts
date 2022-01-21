"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
var octokit_1 = require("octokit");
var process_1 = require("process");
var promises_1 = require("fs/promises");
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var node_url_1 = require("node:url");
// @ts-ignore
var versioning_js_1 = __importDefault(require("@mapbox/node-pre-gyp/lib/util/versioning.js"));
exports.command = 'publish';
exports.desc = 'Publishes the package';
var builder = function (yargs) {
    return yargs
        .options({
        cwd: { type: 'string' }
    })
        .env('NODE_PRE_GYP_GITHUB');
};
exports.builder = builder;
;
var handler = function (argv) { return __awaiter(void 0, void 0, void 0, function () {
    var working_dir, package_json_path, package_json, token, _a, _b, napi_version, node_pre_gyp_opts, package_name, tarball, remote_path, octokit, github_url, github_url_path, github_owner, github_repo, release, asset, data, e_1_1;
    var e_1, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                working_dir = argv.cwd ? argv.cwd : (0, process_1.cwd)();
                console.log((0, process_1.cwd)());
                package_json_path = path_1.default.join(working_dir, 'package.json');
                if (!(0, fs_1.existsSync)(package_json_path)) {
                    console.error("Current working dir has no package.json");
                    (0, process_1.exit)(-1);
                }
                package_json = require(package_json_path);
                token = argv.token;
                if (!token) {
                    console.error("NODE_PRE_GYP_GITHUB_TOKEN not present. Usage: NODE_PRE_GYP_GITHUB=<your token here> node node-pre-gyp-github");
                    (0, process_1.exit)(-1);
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 11, 12, 17]);
                _a = __asyncValues(package_json.binary.napi_versions);
                _d.label = 2;
            case 2: return [4 /*yield*/, _a.next()];
            case 3:
                if (!(_b = _d.sent(), !_b.done)) return [3 /*break*/, 10];
                napi_version = _b.value;
                node_pre_gyp_opts = versioning_js_1.default.evaluate(package_json, {}, napi_version);
                package_name = node_pre_gyp_opts.package_name;
                tarball = node_pre_gyp_opts.staged_tarball;
                remote_path = node_pre_gyp_opts.remote_path.split('/')[0];
                octokit = new octokit_1.Octokit({ auth: token });
                github_url = new node_url_1.URL(package_json.binary.host);
                github_url_path = github_url.pathname.split('/');
                github_owner = github_url_path[1];
                github_repo = github_url_path[2];
                console.log(github_url.pathname.split('/'));
                return [4 /*yield*/, octokit.rest.repos.getReleaseByTag({
                        owner: github_owner,
                        repo: github_repo,
                        tag: remote_path
                    })];
            case 4:
                release = _d.sent();
                asset = release.data.assets.find(function (a) { return a.name === package_name; });
                return [4 /*yield*/, (0, promises_1.readFile)(tarball)];
            case 5:
                data = _d.sent();
                if (!asset) return [3 /*break*/, 7];
                console.log("Deleting existing release asset");
                return [4 /*yield*/, octokit.rest.repos.deleteReleaseAsset({
                        owner: github_owner,
                        repo: github_repo,
                        asset_id: asset.id
                    })];
            case 6:
                _d.sent();
                _d.label = 7;
            case 7:
                console.log("Uploading release asset");
                return [4 /*yield*/, octokit.rest.repos.uploadReleaseAsset({
                        owner: github_owner,
                        repo: github_repo,
                        release_id: release.data.id,
                        name: package_name,
                        data: data
                    })];
            case 8:
                _d.sent();
                _d.label = 9;
            case 9: return [3 /*break*/, 2];
            case 10: return [3 /*break*/, 17];
            case 11:
                e_1_1 = _d.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 17];
            case 12:
                _d.trys.push([12, , 15, 16]);
                if (!(_b && !_b.done && (_c = _a.return))) return [3 /*break*/, 14];
                return [4 /*yield*/, _c.call(_a)];
            case 13:
                _d.sent();
                _d.label = 14;
            case 14: return [3 /*break*/, 16];
            case 15:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 16: return [7 /*endfinally*/];
            case 17: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
//# sourceMappingURL=publish.js.map