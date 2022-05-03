import { Uri, workspace } from "vscode";
import { AppIdCache } from "./AppIdCache";
import path = require("path");
import * as fs from "fs";
import { ALRange, AppManifest } from "./types";
import { PropertyBag } from "./PropertyBag";
import { ObjIdConfig } from "./ObjIdConfig";

const encryptionKeys: PropertyBag<string> = {};
const manifestMap: PropertyBag<AppManifest> = {};
const uriMap: WeakMap<Uri, AppManifest> = new WeakMap();

interface AppManifestBackwardCompatibility extends AppManifest {
    idRange: ALRange;
}

export function getManifest(uri: Uri): AppManifest | null {
    const folder = workspace.getWorkspaceFolder(uri);
    if (!folder) return null;

    const folderUri = folder?.uri;

    const appPath = path.join(folder.uri.fsPath, "app.json");
    try {
        const manifest = JSON.parse(fs.readFileSync(appPath).toString()) as AppManifestBackwardCompatibility;
        manifest.ninja = {
            unsafeOriginalId: manifest.id,
            uri: folderUri,
            path: appPath,
            config: ObjIdConfig.instance(folderUri, manifest.name),
        };
        manifest.id = AppIdCache.instance.getAppIdHash(manifest.ninja.unsafeOriginalId);

        const encryptionKey = AppIdCache.instance.getAppIdHash(manifest.ninja.unsafeOriginalId.replace("-", ""));

        setAppEncryptionKey(manifest.id, encryptionKey);

        if (!manifest.idRanges && manifest.idRange) {
            manifest.idRanges = [manifest.idRange];
        }

        manifestMap[manifest.id] = manifest;
        uriMap.set(uri, manifest);
        if (uri.fsPath !== folderUri.fsPath) {
            uriMap.set(folderUri, manifest);
        }
        return manifest;
    }
    catch {
        return null;
    }
}

function setAppEncryptionKey(appId: string, key: string) {
    if (encryptionKeys[appId]) {
        return;
    }

    const first = key[0];
    const numeric = parseInt(first, 16);
    encryptionKeys[appId] = key.substring(numeric, numeric + 32);
}

/**
 * This function returns a cached manifest from an URI. It is not safe to just call this
 * function without actually knowing that the URI is a valid AL app root URI. It is only
 * safe to call this function in conjunction with previously calling `ALWorkspace.getALFolders`
 * or when the same URI has previously been used with `getManifest`.
 * @param uri URI for which manifest is to be returned
 * @returns AppManifest for the URI
 */
export function getCachedManifestFromUri(uri: Uri): AppManifest {
    return uriMap.get(uri)!;
}

export function getAppEncryptionKey(appId: string): string {
    return encryptionKeys[appId];
}

export function getCachedManifestFromAppId(appId: string): AppManifest {
    return manifestMap[appId];
}

export function getAppNamesFromManifests(manifests: AppManifest[]): string {
    switch (manifests.length) {
        case 1:
            return manifests[0].name;
        case 2:
            return manifests.map(manifest => manifest.name).join(" and ");
        default:
            return `${manifests.slice(0, manifests.length - 1).map(manifest => manifest.name).join(", ")}, and ${manifests[manifests.length - 1].name}`;
    }
}
