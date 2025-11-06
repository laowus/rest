(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/utils/misc.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOSPlatform",
    ()=>getOSPlatform,
    "isContentURI",
    ()=>isContentURI,
    "isFileURI",
    ()=>isFileURI,
    "isValidURL",
    ()=>isValidURL
]);
const isContentURI = (uri)=>{
    return uri.startsWith('content://');
};
const isFileURI = (uri)=>{
    return uri.startsWith('file://');
};
const isValidURL = (url, allowedSchemes = [
    'http',
    'https'
])=>{
    try {
        const { protocol } = new URL(url);
        return allowedSchemes.some((scheme)=>`${scheme}:` === protocol);
    } catch  {
        return false;
    }
};
const getOSPlatform = ()=>{
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('macintosh') || userAgent.includes('mac os x')) return 'macos';
    if (userAgent.includes('windows nt')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';
    return 'unknown';
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/path.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBaseFilename",
    ()=>getBaseFilename,
    "getDirPath",
    ()=>getDirPath,
    "getFilename",
    ()=>getFilename
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/misc.ts [app-client] (ecmascript)");
;
const getFilename = (fileOrUri)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidURL"])(fileOrUri) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isContentURI"])(fileOrUri) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isFileURI"])(fileOrUri)) {
        fileOrUri = decodeURI(fileOrUri);
    }
    const normalizedPath = fileOrUri.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');
    const lastPart = parts.pop();
    return lastPart.split('?')[0];
};
const getBaseFilename = (filename)=>{
    const normalizedPath = filename.replace(/\\/g, '/');
    const baseName = normalizedPath.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
    return baseName;
};
const getDirPath = (filePath)=>{
    const normalizedPath = filePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');
    parts.pop();
    return parts.join('/');
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/file.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NativeFile",
    ()=>NativeFile,
    "RemoteFile",
    ()=>RemoteFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+plugin-fs@2.4.4/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/misc.ts [app-client] (ecmascript)");
;
;
class DeferredBlob extends Blob {
    #dataPromise;
    #type;
    constructor(dataPromise, type){
        super();
        this.#dataPromise = dataPromise;
        this.#type = type;
    }
    async arrayBuffer() {
        const data = await this.#dataPromise;
        return data;
    }
    async text() {
        const data = await this.#dataPromise;
        return new TextDecoder().decode(data);
    }
    stream() {
        return new ReadableStream({
            start: async (controller)=>{
                const data = await this.#dataPromise;
                const reader = new ReadableStream({
                    start (controller) {
                        controller.enqueue(new Uint8Array(data));
                        controller.close();
                    }
                }).getReader();
                const pump = ()=>reader.read().then(({ done, value })=>{
                        if (done) {
                            controller.close();
                            return Promise.resolve();
                        }
                        controller.enqueue(value);
                        return pump();
                    });
                return pump();
            }
        });
    }
    get type() {
        return this.#type;
    }
}
class NativeFile extends File {
    #handle = null;
    #fp;
    #name;
    #baseDir;
    #lastModified = 0;
    #size = -1;
    #type = '';
    static MAX_CACHE_CHUNK_SIZE = 1024 * 1024;
    static MAX_CACHE_ITEMS_SIZE = 50;
    #cache = new Map();
    #order = [];
    constructor(fp, name, baseDir = null, type = ''){
        super([], name || fp, {
            type
        });
        this.#fp = fp;
        this.#baseDir = baseDir;
        this.#name = name || fp;
    }
    async open() {
        this.#handle = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["open"])(this.#fp, this.#baseDir ? {
            baseDir: this.#baseDir
        } : undefined);
        const stats = await this.#handle.stat();
        this.#size = stats.size;
        this.#lastModified = stats.mtime ? stats.mtime.getTime() : Date.now();
        return this;
    }
    async close() {
        if (this.#handle) {
            await this.#handle.close();
            this.#handle = null;
        }
        this.#cache.clear();
        this.#order = [];
    }
    get name() {
        return this.#name;
    }
    get type() {
        return this.#type;
    }
    get size() {
        return this.#size;
    }
    get lastModified() {
        return this.#lastModified;
    }
    async stat() {
        return this.#handle?.stat();
    }
    async seek(offset, whence) {
        if (!this.#handle) {
            throw new Error('File handle is not open');
        }
        return this.#handle.seek(offset, whence);
    }
    // exclusive reading of the end: [start, end)
    async readData(start, end) {
        // PDF.js workers might call readData concurrently
        // make readData thread-safe by always opening and closing the file handle
        const handle = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["open"])(this.#fp, this.#baseDir ? {
            baseDir: this.#baseDir
        } : undefined);
        if (!handle) {
            throw new Error('File handle is not open');
        }
        try {
            start = Math.max(0, start);
            end = Math.max(start, Math.min(this.size, end));
            const size = end - start;
            if (size > NativeFile.MAX_CACHE_CHUNK_SIZE) {
                await handle.seek(start, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SeekMode"].Start);
                const buffer = new Uint8Array(size);
                await handle.read(buffer);
                return buffer.buffer;
            }
            const cachedChunkStart = Array.from(this.#cache.keys()).find((chunkStart)=>{
                const buffer = this.#cache.get(chunkStart);
                return start >= chunkStart && end <= chunkStart + buffer.byteLength;
            });
            if (cachedChunkStart !== undefined) {
                this.#updateAccessOrder(cachedChunkStart);
                const buffer = this.#cache.get(cachedChunkStart);
                const offset = start - cachedChunkStart;
                return buffer.slice(offset, offset + size);
            }
            const chunkStart = Math.max(0, start - 1024);
            const chunkEnd = Math.min(this.size, start + NativeFile.MAX_CACHE_CHUNK_SIZE);
            const chunkSize = chunkEnd - chunkStart;
            await handle.seek(chunkStart, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SeekMode"].Start);
            const buffer = new Uint8Array(chunkSize);
            await handle.read(buffer);
            this.#cache.set(chunkStart, buffer.buffer);
            this.#updateAccessOrder(chunkStart);
            this.#ensureCacheSize();
            const offset = start - chunkStart;
            return buffer.buffer.slice(offset, offset + size);
        } finally{
            await handle.close();
        }
    }
    #updateAccessOrder(chunkStart) {
        const index = this.#order.indexOf(chunkStart);
        if (index > -1) {
            this.#order.splice(index, 1);
        }
        this.#order.unshift(chunkStart);
    }
    #ensureCacheSize() {
        while(this.#cache.size > NativeFile.MAX_CACHE_ITEMS_SIZE){
            const oldestKey = this.#order.pop();
            if (oldestKey !== undefined) {
                this.#cache.delete(oldestKey);
            }
        }
    }
    slice(start = 0, end = this.size, contentType = this.type) {
        // console.log(`Slicing: ${start}-${end}, size: ${end - start}`);
        const dataPromise = this.readData(start, end);
        return new DeferredBlob(dataPromise, contentType);
    }
    stream() {
        const CHUNK_SIZE = 1024 * 1024;
        let offset = 0;
        return new ReadableStream({
            pull: async (controller)=>{
                if (!this.#handle) {
                    controller.error(new Error('File handle is not open'));
                    return;
                }
                if (offset >= this.size) {
                    controller.close();
                    return;
                }
                const end = Math.min(offset + CHUNK_SIZE, this.size);
                const buffer = new Uint8Array(end - offset);
                await this.#handle.seek(offset, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SeekMode"].Start);
                const bytesRead = await this.#handle.read(buffer);
                if (bytesRead === null || bytesRead === 0) {
                    controller.close();
                    return;
                }
                controller.enqueue(buffer.subarray(0, bytesRead));
                offset += bytesRead;
            },
            cancel: async ()=>{
                await this.#handle?.close();
            }
        });
    }
    async text() {
        const blob = this.slice(0, this.size);
        return blob.text();
    }
    async arrayBuffer() {
        const blob = this.slice(0, this.size);
        return blob.arrayBuffer();
    }
}
class RemoteFile extends File {
    url;
    #name;
    #lastModified;
    #size = -1;
    #type = '';
    #cache = new Map();
    #order = [];
    static MAX_CACHE_CHUNK_SIZE = 1024 * 128;
    static MAX_CACHE_ITEMS_SIZE = 10;
    constructor(url, name, type = '', lastModified = Date.now()){
        const basename = url.split('/').pop() || 'remote-file';
        super([], name || basename, {
            type,
            lastModified
        });
        this.url = url;
        this.#name = name || basename;
        this.#type = type;
        this.#lastModified = lastModified;
    }
    get name() {
        return this.#name;
    }
    get type() {
        return this.#type;
    }
    get size() {
        return this.#size;
    }
    get lastModified() {
        return this.#lastModified;
    }
    async _open_with_head() {
        const response = await fetch(this.url, {
            method: 'HEAD'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch file size: ${response.status}`);
        }
        this.#size = Number(response.headers.get('content-length'));
        this.#type = response.headers.get('content-type') || '';
        return this;
    }
    async _open_with_range() {
        const response = await fetch(this.url, {
            headers: {
                Range: `bytes=${0}-${1023}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch file size: ${response.status}`);
        }
        this.#size = Number(response.headers.get('content-range')?.split('/')[1]);
        this.#type = response.headers.get('content-type') || '';
        return this;
    }
    async open() {
        // FIXME: currently HEAD request in asset protocol is not supported on Android
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOSPlatform"])() === 'android') {
            return this._open_with_range();
        } else {
            return this._open_with_head();
        }
    }
    async close() {
        this.#cache.clear();
        this.#order = [];
    }
    async fetchRangePart(start, end) {
        start = Math.max(0, start);
        end = Math.min(this.size - 1, end);
        // console.log(`Fetching range: ${start}-${end}, size: ${end - start + 1}`);
        const response = await fetch(this.url, {
            headers: {
                Range: `bytes=${start}-${end}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch range: ${response.status}`);
        }
        return response.arrayBuffer();
    }
    // inclusive reading of the end: [start, end]
    async fetchRange(start, end) {
        const rangeSize = end - start + 1;
        const MAX_RANGE_LEN = 1024 * 1000;
        if (rangeSize > MAX_RANGE_LEN) {
            const buffers = [];
            for(let currentStart = start; currentStart <= end; currentStart += MAX_RANGE_LEN){
                const currentEnd = Math.min(currentStart + MAX_RANGE_LEN - 1, end);
                buffers.push(await this.fetchRangePart(currentStart, currentEnd));
            }
            const totalSize = buffers.reduce((sum, buffer)=>sum + buffer.byteLength, 0);
            const combinedBuffer = new Uint8Array(totalSize);
            let offset = 0;
            for (const buffer of buffers){
                combinedBuffer.set(new Uint8Array(buffer), offset);
                offset += buffer.byteLength;
            }
            return combinedBuffer.buffer;
        } else if (rangeSize > RemoteFile.MAX_CACHE_CHUNK_SIZE) {
            return this.fetchRangePart(start, end);
        } else {
            let cachedChunkStart = Array.from(this.#cache.keys()).find((chunkStart)=>{
                const buffer = this.#cache.get(chunkStart);
                const bufferSize = buffer.byteLength;
                return start >= chunkStart && end <= chunkStart + bufferSize;
            });
            if (cachedChunkStart !== undefined) {
                this.#updateAccessOrder(cachedChunkStart);
                const buffer = this.#cache.get(cachedChunkStart);
                const offset = start - cachedChunkStart;
                return buffer.slice(offset, offset + rangeSize);
            }
            cachedChunkStart = await this.#fetchAndCacheChunk(start, end);
            const buffer = this.#cache.get(cachedChunkStart);
            const offset = start - cachedChunkStart;
            return buffer.slice(offset, offset + rangeSize);
        }
    }
    async #fetchAndCacheChunk(start, end) {
        const chunkStart = Math.max(0, start - 1024);
        const chunkEnd = Math.max(end, start + RemoteFile.MAX_CACHE_CHUNK_SIZE - 1024 - 1);
        this.#cache.set(chunkStart, await this.fetchRangePart(chunkStart, chunkEnd));
        this.#updateAccessOrder(chunkStart);
        this.#ensureCacheSize();
        return chunkStart;
    }
    #updateAccessOrder(chunkStart) {
        const index = this.#order.indexOf(chunkStart);
        if (index > -1) {
            this.#order.splice(index, 1);
        }
        this.#order.unshift(chunkStart);
    }
    #ensureCacheSize() {
        while(this.#cache.size > RemoteFile.MAX_CACHE_ITEMS_SIZE){
            const oldestKey = this.#order.pop();
            if (oldestKey !== undefined) {
                this.#cache.delete(oldestKey);
            }
        }
    }
    slice(start = 0, end = this.size, contentType = this.type) {
        // console.log(`Slicing: ${start}-${end}, size: ${end - start}`);
        const dataPromise = this.fetchRange(start, end - 1);
        return new DeferredBlob(dataPromise, contentType);
    }
    async text() {
        const blob = this.slice(0, this.size);
        return blob.text();
    }
    async arrayBuffer() {
        const blob = this.slice(0, this.size);
        return blob.arrayBuffer();
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/bridge.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "copyURIToPath",
    ()=>copyURIToPath,
    "getExternalSDCardPath",
    ()=>getExternalSDCardPath,
    "getSafeAreaInsets",
    ()=>getSafeAreaInsets,
    "getScreenBrightness",
    ()=>getScreenBrightness,
    "getStatusBarHeight",
    ()=>getStatusBarHeight,
    "getSysFontsList",
    ()=>getSysFontsList,
    "getSystemColorScheme",
    ()=>getSystemColorScheme,
    "installPackage",
    ()=>installPackage,
    "interceptKeys",
    ()=>interceptKeys,
    "invokeUseBackgroundAudio",
    ()=>invokeUseBackgroundAudio,
    "lockScreenOrientation",
    ()=>lockScreenOrientation,
    "setScreenBrightness",
    ()=>setScreenBrightness,
    "setSystemUIVisibility",
    ()=>setSystemUIVisibility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
async function copyURIToPath(request) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|copy_uri_to_path', {
        payload: request
    });
    return result;
}
async function invokeUseBackgroundAudio(request) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|use_background_audio', {
        payload: request
    });
}
async function installPackage(request) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|install_package', {
        payload: request
    });
    return result;
}
async function setSystemUIVisibility(request) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|set_system_ui_visibility', {
        payload: request
    });
    return result;
}
async function getStatusBarHeight() {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|get_status_bar_height');
    return result;
}
let cachedSysFontsResult = null;
async function getSysFontsList() {
    if (cachedSysFontsResult) {
        return cachedSysFontsResult;
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|get_sys_fonts_list');
    cachedSysFontsResult = result;
    return result;
}
async function interceptKeys(request) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|intercept_keys', {
        payload: request
    });
}
async function lockScreenOrientation(request) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|lock_screen_orientation', {
        payload: request
    });
}
async function getSystemColorScheme() {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|get_system_color_scheme');
    return result;
}
async function getSafeAreaInsets() {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|get_safe_area_insets');
    return result;
}
async function getScreenBrightness() {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|get_screen_brightness');
    return result;
}
async function setScreenBrightness(request) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|set_screen_brightness', {
        payload: request
    });
    return result;
}
async function getExternalSDCardPath() {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:native-bridge|get_external_sdcard_path');
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/appService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseAppService",
    ()=>BaseAppService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/misc.ts [app-client] (ecmascript)");
;
class BaseAppService {
    osPlatform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOSPlatform"])();
    appPlatform = 'tauri';
    localBooksDir = '';
    isMobile = false;
    isMacOSApp = false;
    isLinuxApp = false;
    isAppDataSandbox = false;
    isAndroidApp = false;
    isIOSApp = false;
    isMobileApp = false;
    isPortableApp = false;
    isDesktopApp = false;
    hasTrafficLight = false;
    hasWindow = false;
    hasWindowBar = false;
    hasContextMenu = false;
    hasRoundedWindow = false;
    hasSafeAreaInset = false;
    hasHaptics = false;
    hasUpdater = false;
    hasOrientationLock = false;
    hasScreenBrightness = false;
    hasIAP = false;
    canCustomizeRootDir = false;
    distChannel = 'readest';
    async openFile(path, base) {
        return await this.fs.openFile(path, base);
    }
    async copyFile(srcPath, dstPath, base) {
        return await this.fs.copyFile(srcPath, dstPath, base);
    }
    async writeFile(path, base, content) {
        return await this.fs.writeFile(path, base, content);
    }
    async createDir(path, base, recursive = true) {
        return await this.fs.createDir(path, base, recursive);
    }
    async deleteFile(path, base) {
        return await this.fs.removeFile(path, base);
    }
    async deleteDir(path, base, recursive = true) {
        return await this.fs.removeDir(path, base, recursive);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLOUD_BOOKS_SUBDIR",
    ()=>CLOUD_BOOKS_SUBDIR,
    "DATA_SUBDIR",
    ()=>DATA_SUBDIR,
    "LOCAL_BOOKS_SUBDIR",
    ()=>LOCAL_BOOKS_SUBDIR,
    "LOCAL_FONTS_SUBDIR",
    ()=>LOCAL_FONTS_SUBDIR,
    "LOCAL_IMAGES_SUBDIR",
    ()=>LOCAL_IMAGES_SUBDIR,
    "SETTINGS_FILENAME",
    ()=>SETTINGS_FILENAME,
    "SUPPORTED_BOOK_EXTS",
    ()=>SUPPORTED_BOOK_EXTS
]);
const SETTINGS_FILENAME = 'settings.json';
const DATA_SUBDIR = 'Readest';
const LOCAL_BOOKS_SUBDIR = `${DATA_SUBDIR}/Books`;
const CLOUD_BOOKS_SUBDIR = `${DATA_SUBDIR}/Books`;
const LOCAL_FONTS_SUBDIR = `${DATA_SUBDIR}/Fonts`;
const LOCAL_IMAGES_SUBDIR = `${DATA_SUBDIR}/Images`;
const SUPPORTED_BOOK_EXTS = [
    'epub',
    'mobi',
    'azw',
    'azw3',
    'fb2',
    'zip',
    'cbz',
    'pdf',
    'txt'
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/nativeAppService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NativeAppService",
    ()=>NativeAppService,
    "nativeFileSystem",
    ()=>nativeFileSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+plugin-fs@2.4.4/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/path.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$os$40$2$2e$3$2e$2$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$os$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+plugin-os@2.3.2/node_modules/@tauri-apps/plugin-os/dist-js/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/misc.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/path.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$file$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/file.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bridge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/bridge.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$appService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/appService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/constants.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const OS_TYPE = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$os$40$2$2e$3$2e$2$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$os$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["type"])();
const getPathResolver = ({ customRootDir, isPortable, execDir } = {})=>{
    const customBaseDir = customRootDir ? 0 : undefined;
    const isCustomBaseDir = Boolean(customRootDir);
    const getCustomBasePrefixSync = isCustomBaseDir ? (baseDir)=>{
        return ()=>{
            const dataDirs = [
                'Settings',
                'Data',
                'Books',
                'Fonts',
                'Images'
            ];
            const leafDir = dataDirs.includes(baseDir) ? '' : baseDir;
            return leafDir ? `${customRootDir}/${leafDir}` : customRootDir;
        };
    } : undefined;
    const getCustomBasePrefix = getCustomBasePrefixSync ? (baseDir)=>async ()=>getCustomBasePrefixSync(baseDir)() : undefined;
    return (path, base)=>{
        const customBasePrefixSync = getCustomBasePrefixSync?.(base);
        const customBasePrefix = getCustomBasePrefix?.(base);
        switch(base){
            case 'Settings':
                return {
                    baseDir: isPortable ? 0 : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseDirectory"].AppConfig,
                    basePrefix: isPortable && execDir ? async ()=>execDir : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appConfigDir"],
                    fp: isPortable && execDir ? `${execDir}${path ? `/${path}` : ''}` : path,
                    base
                };
            default:
                return {
                    baseDir: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseDirectory"].Temp,
                    basePrefix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tempDir"],
                    fp: path,
                    base
                };
        }
    };
};
const nativeFileSystem = {
    resolvePath: getPathResolver(),
    async getPrefix (base) {
        const { basePrefix, fp, baseDir } = this.resolvePath('', base);
        let basePath = await basePrefix();
        basePath = basePath.replace(/\/+$/, '');
        return fp ? baseDir === 0 ? fp : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(basePath, fp) : basePath;
    },
    getURL (path) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidURL"])(path) ? path : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertFileSrc"])(path);
    },
    async getBlobURL (path, base) {
        const content = await this.readFile(path, base, 'binary');
        return URL.createObjectURL(new Blob([
            content
        ]));
    },
    async openFile (path, base, name) {
        const { fp, baseDir } = this.resolvePath(path, base);
        let fname = name || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFilename"])(fp);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidURL"])(path)) {
            return await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$file$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RemoteFile"](path, fname).open();
        } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isContentURI"])(path)) {
            fname = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["basename"])(path);
            if (path.includes('com.android.externalstorage')) {
                // If the URI is from shared internal storage (like /storage/emulated/0),
                // we can access it directly using the path — no need to copy.
                return await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$file$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NativeFile"](fp, fname, baseDir ? baseDir : null).open();
            } else {
                // Otherwise, for content:// URIs (e.g. from MediaStore, Drive, or third-party apps),
                // we cannot access the file directly — so we copy it to a temporary cache location.
                const prefix = await this.getPrefix('Cache');
                const dst = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(prefix, fname);
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bridge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copyURIToPath"])({
                    uri: path,
                    dst
                });
                if (!res.success) {
                    console.error('Failed to open file:', res);
                    throw new Error('Failed to open file');
                }
                return await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$file$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NativeFile"](dst, fname, baseDir ? baseDir : null).open();
            }
        } else {
            const prefix = await this.getPrefix(base);
            const absolutePath = path.startsWith('/') ? path : prefix ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(prefix, path) : null;
            if (absolutePath && OS_TYPE !== 'android') {
                // NOTE: RemoteFile currently performs about 2× faster than NativeFile
                // due to an unresolved performance issue in Tauri (see tauri-apps/tauri#9190).
                // Once the bug is resolved, we should switch back to using NativeFile.
                // RemoteFile is not usable on Android due to unknown issues of range fetch with Android WebView.
                return await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$file$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RemoteFile"](this.getURL(absolutePath), fname).open();
            } else {
                return await new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$file$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NativeFile"](fp, fname, baseDir ? baseDir : null).open();
            }
        }
    },
    async copyFile (srcPath, dstPath, base) {
        if (!await this.exists((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDirPath"])(dstPath), base)) {
            await this.createDir((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDirPath"])(dstPath), base, true);
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isContentURI"])(srcPath)) {
            const prefix = await this.getPrefix(base);
            if (!prefix) {
                throw new Error('Invalid base directory');
            }
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$bridge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["copyURIToPath"])({
                uri: srcPath,
                dst: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(prefix, dstPath)
            });
            if (!res.success) {
                console.error('Failed to copy file:', res);
                throw new Error('Failed to copy file');
            }
        } else {
            const { fp, baseDir } = this.resolvePath(dstPath, base);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["copyFile"])(srcPath, fp, baseDir ? {
                toPathBaseDir: baseDir
            } : undefined);
        }
    },
    async readFile (path, base, mode) {
        const { fp, baseDir } = this.resolvePath(path, base);
        return mode === 'text' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readTextFile"])(fp, baseDir ? {
            baseDir
        } : undefined) : (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readFile"])(fp, baseDir ? {
            baseDir
        } : undefined)).buffer;
    },
    async writeFile (path, base, content) {
        // NOTE: this could be very slow for large files and might block the UI thread
        // so do not use this for large files
        const { fp, baseDir } = this.resolvePath(path, base);
        if (!await this.exists((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDirPath"])(path), base)) {
            await this.createDir((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$path$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDirPath"])(path), base, true);
        }
        if (typeof content === 'string') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeTextFile"])(fp, content, baseDir ? {
                baseDir
            } : undefined);
        } else if (content instanceof File) {
            const writeOptions = {
                write: true,
                create: true,
                baseDir: baseDir ? baseDir : undefined
            };
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeFile"])(fp, content.stream(), writeOptions);
        } else {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeFile"])(fp, new Uint8Array(content), baseDir ? {
                baseDir
            } : undefined);
        }
    },
    async removeFile (path, base) {
        const { fp, baseDir } = this.resolvePath(path, base);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["remove"])(fp, baseDir ? {
            baseDir
        } : undefined);
    },
    async createDir (path, base, recursive = false) {
        const { fp, baseDir } = this.resolvePath(path, base);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["mkdir"])(fp, {
            baseDir: baseDir ? baseDir : undefined,
            recursive
        });
    },
    async removeDir (path, base, recursive = false) {
        const { fp, baseDir } = this.resolvePath(path, base);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["remove"])(fp, {
            baseDir: baseDir ? baseDir : undefined,
            recursive
        });
    },
    async readDir (path, base) {
        const { fp, baseDir } = this.resolvePath(path, base);
        const entries = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readDir"])(fp, baseDir ? {
            baseDir
        } : undefined);
        const fileList = [];
        const readDirRecursively = async (parent, relative, entries, fileList)=>{
            for (const entry of entries){
                if (entry.isDirectory) {
                    const dir = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(parent, entry.name);
                    const relativeDir = relative ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(relative, entry.name) : entry.name;
                    await readDirRecursively(dir, relativeDir, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readDir"])(dir, baseDir ? {
                        baseDir
                    } : undefined), fileList);
                } else {
                    const filePath = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(parent, entry.name);
                    const relativePath = relative ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["join"])(relative, entry.name) : entry.name;
                    const fileInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["stat"])(filePath, baseDir ? {
                        baseDir
                    } : undefined);
                    fileList.push({
                        path: relativePath,
                        size: fileInfo.size
                    });
                }
            }
        };
        await readDirRecursively(fp, '', entries, fileList);
        return fileList;
    },
    async exists (path, base) {
        const { fp, baseDir } = this.resolvePath(path, base);
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$plugin$2d$fs$40$2$2e$4$2e$4$2f$node_modules$2f40$tauri$2d$apps$2f$plugin$2d$fs$2f$dist$2d$js$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["exists"])(fp, baseDir ? {
                baseDir
            } : undefined);
            return res;
        } catch  {
            return false;
        }
    }
};
const DIST_CHANNEL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env['NEXT_PUBLIC_DIST_CHANNEL'] || 'readest';
class NativeAppService extends __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$appService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BaseAppService"] {
    fs = nativeFileSystem;
    appPlatform = 'tauri';
    isAppDataSandbox = [
        'android',
        'ios'
    ].includes(OS_TYPE);
    isMobile = [
        'android',
        'ios'
    ].includes(OS_TYPE);
    isAndroidApp = OS_TYPE === 'android';
    isIOSApp = OS_TYPE === 'ios';
    isMacOSApp = OS_TYPE === 'macos';
    isLinuxApp = OS_TYPE === 'linux';
    isMobileApp = [
        'android',
        'ios'
    ].includes(OS_TYPE);
    isDesktopApp = [
        'macos',
        'windows',
        'linux'
    ].includes(OS_TYPE);
    hasTrafficLight = OS_TYPE === 'macos';
    hasWindow = !(OS_TYPE === 'ios' || OS_TYPE === 'android');
    hasWindowBar = !(OS_TYPE === 'ios' || OS_TYPE === 'android');
    hasContextMenu = !(OS_TYPE === 'ios' || OS_TYPE === 'android');
    hasRoundedWindow = OS_TYPE === 'linux';
    hasSafeAreaInset = OS_TYPE === 'ios' || OS_TYPE === 'android';
    hasHaptics = OS_TYPE === 'ios' || OS_TYPE === 'android';
    hasUpdater = OS_TYPE !== 'ios' && !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env['NEXT_PUBLIC_DISABLE_UPDATER'] && !window.__READEST_UPDATER_DISABLED;
    // orientation lock is not supported on iPad
    hasOrientationLock = OS_TYPE === 'ios' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$misc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOSPlatform"])() === 'ios' || OS_TYPE === 'android';
    hasScreenBrightness = OS_TYPE === 'ios' || OS_TYPE === 'android';
    hasIAP = OS_TYPE === 'ios' || OS_TYPE === 'android' && DIST_CHANNEL === 'playstore';
    // CustomizeRootDir has a blocker on macOS App Store builds due to Security Scoped Resource restrictions.
    // See: https://github.com/tauri-apps/tauri/issues/3716
    canCustomizeRootDir = DIST_CHANNEL !== 'appstore';
    distChannel = DIST_CHANNEL;
    execDir = undefined;
    async init() {
        const execDir = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('get_executable_dir');
        this.execDir = execDir;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env['NEXT_PUBLIC_PORTABLE_APP'] || await this.fs.exists(`${execDir}/${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS_FILENAME"]}`, 'None')) {
            this.isPortableApp = true;
            this.fs.resolvePath = getPathResolver({
                customRootDir: execDir,
                isPortable: this.isPortableApp,
                execDir
            });
        }
    }
    resolvePath(fp, base) {
        return this.fs.resolvePath(fp, base);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ __turbopack_context__.s([
    "__classPrivateFieldGet",
    ()=>__classPrivateFieldGet,
    "__classPrivateFieldSet",
    ()=>__classPrivateFieldSet
]);
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
;
}),
"[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Channel",
    ()=>Channel,
    "PluginListener",
    ()=>PluginListener,
    "Resource",
    ()=>Resource,
    "SERIALIZE_TO_IPC_FN",
    ()=>SERIALIZE_TO_IPC_FN,
    "addPluginListener",
    ()=>addPluginListener,
    "checkPermissions",
    ()=>checkPermissions,
    "convertFileSrc",
    ()=>convertFileSrc,
    "invoke",
    ()=>invoke,
    "isTauri",
    ()=>isTauri,
    "requestPermissions",
    ()=>requestPermissions,
    "transformCallback",
    ()=>transformCallback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js [app-client] (ecmascript)");
;
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
var _Channel_onmessage, _Channel_nextMessageIndex, _Channel_pendingMessages, _Channel_messageEndIndex, _Resource_rid;
/**
 * Invoke your custom commands.
 *
 * This package is also accessible with `window.__TAURI__.core` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 * @module
 */ /**
 * A key to be used to implement a special function
 * on your types that define how your type should be serialized
 * when passing across the IPC.
 * @example
 * Given a type in Rust that looks like this
 * ```rs
 * #[derive(serde::Serialize, serde::Deserialize)
 * enum UserId {
 *   String(String),
 *   Number(u32),
 * }
 * ```
 * `UserId::String("id")` would be serialized into `{ String: "id" }`
 * and so we need to pass the same structure back to Rust
 * ```ts
 * import { SERIALIZE_TO_IPC_FN } from "@tauri-apps/api/core"
 *
 * class UserIdString {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { String: this.id }
 *   }
 * }
 *
 * class UserIdNumber {
 *   id
 *   constructor(id) {
 *     this.id = id
 *   }
 *
 *   [SERIALIZE_TO_IPC_FN]() {
 *     return { Number: this.id }
 *   }
 * }
 *
 * type UserId = UserIdString | UserIdNumber
 * ```
 *
 */ // if this value changes, make sure to update it in:
// 1. ipc.js
// 2. process-ipc-message-fn.js
const SERIALIZE_TO_IPC_FN = '__TAURI_TO_IPC_KEY__';
/**
 * Stores the callback in a known location, and returns an identifier that can be passed to the backend.
 * The backend uses the identifier to `eval()` the callback.
 *
 * @return An unique identifier associated with the callback function.
 *
 * @since 1.0.0
 */ function transformCallback(// TODO: Make this not optional in v3
callback, once = false) {
    return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
class Channel {
    constructor(onmessage){
        _Channel_onmessage.set(this, void 0);
        // the index is used as a mechanism to preserve message order
        _Channel_nextMessageIndex.set(this, 0);
        _Channel_pendingMessages.set(this, []);
        _Channel_messageEndIndex.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_onmessage, onmessage || (()=>{}), "f");
        this.id = transformCallback((rawMessage)=>{
            const index = rawMessage.index;
            if ('end' in rawMessage) {
                if (index == (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")) {
                    this.cleanupCallback();
                } else {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_messageEndIndex, index, "f");
                }
                return;
            }
            const message = rawMessage.message;
            // Process the message if we're at the right order
            if (index == (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_onmessage, "f").call(this, message);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_nextMessageIndex, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") + 1, "f");
                // process pending messages
                while((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") in (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")){
                    const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")[(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")];
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_onmessage, "f").call(this, message);
                    // eslint-disable-next-line @typescript-eslint/no-array-delete
                    delete (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")[(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f")];
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_nextMessageIndex, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") + 1, "f");
                }
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_nextMessageIndex, "f") === (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_messageEndIndex, "f")) {
                    this.cleanupCallback();
                }
            } else {
                // eslint-disable-next-line security/detect-object-injection
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_pendingMessages, "f")[index] = message;
            }
        });
    }
    cleanupCallback() {
        window.__TAURI_INTERNALS__.unregisterCallback(this.id);
    }
    set onmessage(handler) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Channel_onmessage, handler, "f");
    }
    get onmessage() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Channel_onmessage, "f");
    }
    [(_Channel_onmessage = new WeakMap(), _Channel_nextMessageIndex = new WeakMap(), _Channel_pendingMessages = new WeakMap(), _Channel_messageEndIndex = new WeakMap(), SERIALIZE_TO_IPC_FN)]() {
        return `__CHANNEL__:${this.id}`;
    }
    toJSON() {
        // eslint-disable-next-line security/detect-object-injection
        return this[SERIALIZE_TO_IPC_FN]();
    }
}
class PluginListener {
    constructor(plugin, event, channelId){
        this.plugin = plugin;
        this.event = event;
        this.channelId = channelId;
    }
    async unregister() {
        return invoke(`plugin:${this.plugin}|remove_listener`, {
            event: this.event,
            channelId: this.channelId
        });
    }
}
/**
 * Adds a listener to a plugin event.
 *
 * @returns The listener object to stop listening to the events.
 *
 * @since 2.0.0
 */ async function addPluginListener(plugin, event, cb) {
    const handler = new Channel(cb);
    try {
        return invoke(`plugin:${plugin}|register_listener`, {
            event,
            handler
        }).then(()=>new PluginListener(plugin, event, handler.id));
    } catch  {
        // TODO(v3): remove this fallback
        // note: we must try with camelCase here for backwards compatibility
        return invoke(`plugin:${plugin}|registerListener`, {
            event,
            handler
        }).then(()=>new PluginListener(plugin, event, handler.id));
    }
}
/**
 * Get permission state for a plugin.
 *
 * This should be used by plugin authors to wrap their actual implementation.
 */ async function checkPermissions(plugin) {
    return invoke(`plugin:${plugin}|check_permissions`);
}
/**
 * Request permissions.
 *
 * This should be used by plugin authors to wrap their actual implementation.
 */ async function requestPermissions(plugin) {
    return invoke(`plugin:${plugin}|request_permissions`);
}
/**
 * Sends a message to the backend.
 * @example
 * ```typescript
 * import { invoke } from '@tauri-apps/api/core';
 * await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
 * ```
 *
 * @param cmd The command name.
 * @param args The optional arguments to pass to the command.
 * @param options The request options.
 * @return A promise resolving or rejecting to the backend response.
 *
 * @since 1.0.0
 */ async function invoke(cmd, args = {}, options) {
    return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
/**
 * Convert a device file path to an URL that can be loaded by the webview.
 * Note that `asset:` and `http://asset.localhost` must be added to [`app.security.csp`](https://v2.tauri.app/reference/config/#csp-1) in `tauri.conf.json`.
 * Example CSP value: `"csp": "default-src 'self' ipc: http://ipc.localhost; img-src 'self' asset: http://asset.localhost"` to use the asset protocol on image sources.
 *
 * Additionally, `"enable" : "true"` must be added to [`app.security.assetProtocol`](https://v2.tauri.app/reference/config/#assetprotocolconfig)
 * in `tauri.conf.json` and its access scope must be defined on the `scope` array on the same `assetProtocol` object.
 *
 * @param  filePath The file path.
 * @param  protocol The protocol to use. Defaults to `asset`. You only need to set this when using a custom protocol.
 * @example
 * ```typescript
 * import { appDataDir, join } from '@tauri-apps/api/path';
 * import { convertFileSrc } from '@tauri-apps/api/core';
 * const appDataDirPath = await appDataDir();
 * const filePath = await join(appDataDirPath, 'assets/video.mp4');
 * const assetUrl = convertFileSrc(filePath);
 *
 * const video = document.getElementById('my-video');
 * const source = document.createElement('source');
 * source.type = 'video/mp4';
 * source.src = assetUrl;
 * video.appendChild(source);
 * video.load();
 * ```
 *
 * @return the URL that can be used as source on the webview.
 *
 * @since 1.0.0
 */ function convertFileSrc(filePath, protocol = 'asset') {
    return window.__TAURI_INTERNALS__.convertFileSrc(filePath, protocol);
}
/**
 * A rust-backed resource stored through `tauri::Manager::resources_table` API.
 *
 * The resource lives in the main process and does not exist
 * in the Javascript world, and thus will not be cleaned up automatiacally
 * except on application exit. If you want to clean it up early, call {@linkcode Resource.close}
 *
 * @example
 * ```typescript
 * import { Resource, invoke } from '@tauri-apps/api/core';
 * export class DatabaseHandle extends Resource {
 *   static async open(path: string): Promise<DatabaseHandle> {
 *     const rid: number = await invoke('open_db', { path });
 *     return new DatabaseHandle(rid);
 *   }
 *
 *   async execute(sql: string): Promise<void> {
 *     await invoke('execute_sql', { rid: this.rid, sql });
 *   }
 * }
 * ```
 */ class Resource {
    get rid() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldGet"])(this, _Resource_rid, "f");
    }
    constructor(rid){
        _Resource_rid.set(this, void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$external$2f$tslib$2f$tslib$2e$es6$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["__classPrivateFieldSet"])(this, _Resource_rid, rid, "f");
    }
    /**
     * Destroys and cleans up this resource from memory.
     * **You should not call any method on this object anymore and should drop any reference to it.**
     */ async close() {
        return invoke('plugin:resources|close', {
            rid: this.rid
        });
    }
}
_Resource_rid = new WeakMap();
function isTauri() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return !!(globalThis || window).isTauri;
}
;
}),
"[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/path.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseDirectory",
    ()=>BaseDirectory,
    "appCacheDir",
    ()=>appCacheDir,
    "appConfigDir",
    ()=>appConfigDir,
    "appDataDir",
    ()=>appDataDir,
    "appLocalDataDir",
    ()=>appLocalDataDir,
    "appLogDir",
    ()=>appLogDir,
    "audioDir",
    ()=>audioDir,
    "basename",
    ()=>basename,
    "cacheDir",
    ()=>cacheDir,
    "configDir",
    ()=>configDir,
    "dataDir",
    ()=>dataDir,
    "delimiter",
    ()=>delimiter,
    "desktopDir",
    ()=>desktopDir,
    "dirname",
    ()=>dirname,
    "documentDir",
    ()=>documentDir,
    "downloadDir",
    ()=>downloadDir,
    "executableDir",
    ()=>executableDir,
    "extname",
    ()=>extname,
    "fontDir",
    ()=>fontDir,
    "homeDir",
    ()=>homeDir,
    "isAbsolute",
    ()=>isAbsolute,
    "join",
    ()=>join,
    "localDataDir",
    ()=>localDataDir,
    "normalize",
    ()=>normalize,
    "pictureDir",
    ()=>pictureDir,
    "publicDir",
    ()=>publicDir,
    "resolve",
    ()=>resolve,
    "resolveResource",
    ()=>resolveResource,
    "resourceDir",
    ()=>resourceDir,
    "runtimeDir",
    ()=>runtimeDir,
    "sep",
    ()=>sep,
    "tempDir",
    ()=>tempDir,
    "templateDir",
    ()=>templateDir,
    "videoDir",
    ()=>videoDir
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * The path module provides utilities for working with file and directory paths.
 *
 * This package is also accessible with `window.__TAURI__.path` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
 *
 * It is recommended to allowlist only the APIs you use for optimal bundle size and security.
 * @module
 */ /**
 * @since 2.0.0
 */ var BaseDirectory;
(function(BaseDirectory) {
    /**
     * @see {@link audioDir} for more information.
     */ BaseDirectory[BaseDirectory["Audio"] = 1] = "Audio";
    /**
     * @see {@link cacheDir} for more information.
     */ BaseDirectory[BaseDirectory["Cache"] = 2] = "Cache";
    /**
     * @see {@link configDir} for more information.
     */ BaseDirectory[BaseDirectory["Config"] = 3] = "Config";
    /**
     * @see {@link dataDir} for more information.
     */ BaseDirectory[BaseDirectory["Data"] = 4] = "Data";
    /**
     * @see {@link localDataDir} for more information.
     */ BaseDirectory[BaseDirectory["LocalData"] = 5] = "LocalData";
    /**
     * @see {@link documentDir} for more information.
     */ BaseDirectory[BaseDirectory["Document"] = 6] = "Document";
    /**
     * @see {@link downloadDir} for more information.
     */ BaseDirectory[BaseDirectory["Download"] = 7] = "Download";
    /**
     * @see {@link pictureDir} for more information.
     */ BaseDirectory[BaseDirectory["Picture"] = 8] = "Picture";
    /**
     * @see {@link publicDir} for more information.
     */ BaseDirectory[BaseDirectory["Public"] = 9] = "Public";
    /**
     * @see {@link videoDir} for more information.
     */ BaseDirectory[BaseDirectory["Video"] = 10] = "Video";
    /**
     * @see {@link resourceDir} for more information.
     */ BaseDirectory[BaseDirectory["Resource"] = 11] = "Resource";
    /**
     * @see {@link tempDir} for more information.
     */ BaseDirectory[BaseDirectory["Temp"] = 12] = "Temp";
    /**
     * @see {@link appConfigDir} for more information.
     */ BaseDirectory[BaseDirectory["AppConfig"] = 13] = "AppConfig";
    /**
     * @see {@link appDataDir} for more information.
     */ BaseDirectory[BaseDirectory["AppData"] = 14] = "AppData";
    /**
     * @see {@link appLocalDataDir} for more information.
     */ BaseDirectory[BaseDirectory["AppLocalData"] = 15] = "AppLocalData";
    /**
     * @see {@link appCacheDir} for more information.
     */ BaseDirectory[BaseDirectory["AppCache"] = 16] = "AppCache";
    /**
     * @see {@link appLogDir} for more information.
     */ BaseDirectory[BaseDirectory["AppLog"] = 17] = "AppLog";
    /**
     * @see {@link desktopDir} for more information.
     */ BaseDirectory[BaseDirectory["Desktop"] = 18] = "Desktop";
    /**
     * @see {@link executableDir} for more information.
     */ BaseDirectory[BaseDirectory["Executable"] = 19] = "Executable";
    /**
     * @see {@link fontDir} for more information.
     */ BaseDirectory[BaseDirectory["Font"] = 20] = "Font";
    /**
     * @see {@link homeDir} for more information.
     */ BaseDirectory[BaseDirectory["Home"] = 21] = "Home";
    /**
     * @see {@link runtimeDir} for more information.
     */ BaseDirectory[BaseDirectory["Runtime"] = 22] = "Runtime";
    /**
     * @see {@link templateDir} for more information.
     */ BaseDirectory[BaseDirectory["Template"] = 23] = "Template";
})(BaseDirectory || (BaseDirectory = {}));
/**
 * Returns the path to the suggested directory for your app's config files.
 * Resolves to `${configDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appConfigDir } from '@tauri-apps/api/path';
 * const appConfigDirPath = await appConfigDir();
 * ```
 *
 * @since 1.2.0
 */ async function appConfigDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppConfig
    });
}
/**
 * Returns the path to the suggested directory for your app's data files.
 * Resolves to `${dataDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * ```
 *
 * @since 1.2.0
 */ async function appDataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppData
    });
}
/**
 * Returns the path to the suggested directory for your app's local data files.
 * Resolves to `${localDataDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appLocalDataDir } from '@tauri-apps/api/path';
 * const appLocalDataDirPath = await appLocalDataDir();
 * ```
 *
 * @since 1.2.0
 */ async function appLocalDataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppLocalData
    });
}
/**
 * Returns the path to the suggested directory for your app's cache files.
 * Resolves to `${cacheDir}/${bundleIdentifier}`, where `bundleIdentifier` is the [`identifier`](https://v2.tauri.app/reference/config/#identifier) value configured in `tauri.conf.json`.
 * @example
 * ```typescript
 * import { appCacheDir } from '@tauri-apps/api/path';
 * const appCacheDirPath = await appCacheDir();
 * ```
 *
 * @since 1.2.0
 */ async function appCacheDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppCache
    });
}
/**
 * Returns the path to the user's audio directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_MUSIC_DIR`.
 * - **macOS:** Resolves to `$HOME/Music`.
 * - **Windows:** Resolves to `{FOLDERID_Music}`.
 * @example
 * ```typescript
 * import { audioDir } from '@tauri-apps/api/path';
 * const audioDirPath = await audioDir();
 * ```
 *
 * @since 1.0.0
 */ async function audioDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Audio
    });
}
/**
 * Returns the path to the user's cache directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_CACHE_HOME` or `$HOME/.cache`.
 * - **macOS:** Resolves to `$HOME/Library/Caches`.
 * - **Windows:** Resolves to `{FOLDERID_LocalAppData}`.
 * @example
 * ```typescript
 * import { cacheDir } from '@tauri-apps/api/path';
 * const cacheDirPath = await cacheDir();
 * ```
 *
 * @since 1.0.0
 */ async function cacheDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Cache
    });
}
/**
 * Returns the path to the user's config directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_CONFIG_HOME` or `$HOME/.config`.
 * - **macOS:** Resolves to `$HOME/Library/Application Support`.
 * - **Windows:** Resolves to `{FOLDERID_RoamingAppData}`.
 * @example
 * ```typescript
 * import { configDir } from '@tauri-apps/api/path';
 * const configDirPath = await configDir();
 * ```
 *
 * @since 1.0.0
 */ async function configDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Config
    });
}
/**
 * Returns the path to the user's data directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_DATA_HOME` or `$HOME/.local/share`.
 * - **macOS:** Resolves to `$HOME/Library/Application Support`.
 * - **Windows:** Resolves to `{FOLDERID_RoamingAppData}`.
 * @example
 * ```typescript
 * import { dataDir } from '@tauri-apps/api/path';
 * const dataDirPath = await dataDir();
 * ```
 *
 * @since 1.0.0
 */ async function dataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Data
    });
}
/**
 * Returns the path to the user's desktop directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_DESKTOP_DIR`.
 * - **macOS:** Resolves to `$HOME/Desktop`.
 * - **Windows:** Resolves to `{FOLDERID_Desktop}`.
 * @example
 * ```typescript
 * import { desktopDir } from '@tauri-apps/api/path';
 * const desktopPath = await desktopDir();
 * ```
 *
 * @since 1.0.0
 */ async function desktopDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Desktop
    });
}
/**
 * Returns the path to the user's document directory.
 * @example
 * ```typescript
 * import { documentDir } from '@tauri-apps/api/path';
 * const documentDirPath = await documentDir();
 * ```
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_DOCUMENTS_DIR`.
 * - **macOS:** Resolves to `$HOME/Documents`.
 * - **Windows:** Resolves to `{FOLDERID_Documents}`.
 *
 * @since 1.0.0
 */ async function documentDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Document
    });
}
/**
 * Returns the path to the user's download directory.
 *
 * #### Platform-specific
 *
 * - **Linux**: Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_DOWNLOAD_DIR`.
 * - **macOS**: Resolves to `$HOME/Downloads`.
 * - **Windows**: Resolves to `{FOLDERID_Downloads}`.
 * @example
 * ```typescript
 * import { downloadDir } from '@tauri-apps/api/path';
 * const downloadDirPath = await downloadDir();
 * ```
 *
 * @since 1.0.0
 */ async function downloadDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Download
    });
}
/**
 * Returns the path to the user's executable directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_BIN_HOME/../bin` or `$XDG_DATA_HOME/../bin` or `$HOME/.local/bin`.
 * - **macOS:** Not supported.
 * - **Windows:** Not supported.
 * @example
 * ```typescript
 * import { executableDir } from '@tauri-apps/api/path';
 * const executableDirPath = await executableDir();
 * ```
 *
 * @since 1.0.0
 */ async function executableDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Executable
    });
}
/**
 * Returns the path to the user's font directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_DATA_HOME/fonts` or `$HOME/.local/share/fonts`.
 * - **macOS:** Resolves to `$HOME/Library/Fonts`.
 * - **Windows:** Not supported.
 * @example
 * ```typescript
 * import { fontDir } from '@tauri-apps/api/path';
 * const fontDirPath = await fontDir();
 * ```
 *
 * @since 1.0.0
 */ async function fontDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Font
    });
}
/**
 * Returns the path to the user's home directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$HOME`.
 * - **macOS:** Resolves to `$HOME`.
 * - **Windows:** Resolves to `{FOLDERID_Profile}`.
 * @example
 * ```typescript
 * import { homeDir } from '@tauri-apps/api/path';
 * const homeDirPath = await homeDir();
 * ```
 *
 * @since 1.0.0
 */ async function homeDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Home
    });
}
/**
 * Returns the path to the user's local data directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_DATA_HOME` or `$HOME/.local/share`.
 * - **macOS:** Resolves to `$HOME/Library/Application Support`.
 * - **Windows:** Resolves to `{FOLDERID_LocalAppData}`.
 * @example
 * ```typescript
 * import { localDataDir } from '@tauri-apps/api/path';
 * const localDataDirPath = await localDataDir();
 * ```
 *
 * @since 1.0.0
 */ async function localDataDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.LocalData
    });
}
/**
 * Returns the path to the user's picture directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_PICTURES_DIR`.
 * - **macOS:** Resolves to `$HOME/Pictures`.
 * - **Windows:** Resolves to `{FOLDERID_Pictures}`.
 * @example
 * ```typescript
 * import { pictureDir } from '@tauri-apps/api/path';
 * const pictureDirPath = await pictureDir();
 * ```
 *
 * @since 1.0.0
 */ async function pictureDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Picture
    });
}
/**
 * Returns the path to the user's public directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_PUBLICSHARE_DIR`.
 * - **macOS:** Resolves to `$HOME/Public`.
 * - **Windows:** Resolves to `{FOLDERID_Public}`.
 * @example
 * ```typescript
 * import { publicDir } from '@tauri-apps/api/path';
 * const publicDirPath = await publicDir();
 * ```
 *
 * @since 1.0.0
 */ async function publicDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Public
    });
}
/**
 * Returns the path to the application's resource directory.
 * To resolve a resource path, see {@linkcode resolveResource}.
 *
 * ## Platform-specific
 *
 * Although we provide the exact path where this function resolves to,
 * this is not a contract and things might change in the future
 *
 * - **Windows:** Resolves to the directory that contains the main executable.
 * - **Linux:** When running in an AppImage, the `APPDIR` variable will be set to
 *   the mounted location of the app, and the resource dir will be `${APPDIR}/usr/lib/${exe_name}`.
 *   If not running in an AppImage, the path is `/usr/lib/${exe_name}`.
 *   When running the app from `src-tauri/target/(debug|release)/`, the path is `${exe_dir}/../lib/${exe_name}`.
 * - **macOS:** Resolves to `${exe_dir}/../Resources` (inside .app).
 * - **iOS:** Resolves to `${exe_dir}/assets`.
 * - **Android:** Currently the resources are stored in the APK as assets so it's not a normal file system path,
 *   we return a special URI prefix `asset://localhost/` here that can be used with the [file system plugin](https://tauri.app/plugin/file-system/),
 *
 * @example
 * ```typescript
 * import { resourceDir } from '@tauri-apps/api/path';
 * const resourceDirPath = await resourceDir();
 * ```
 *
 * @since 1.0.0
 */ async function resourceDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Resource
    });
}
/**
 * Resolve the path to a resource file.
 * @example
 * ```typescript
 * import { resolveResource } from '@tauri-apps/api/path';
 * const resourcePath = await resolveResource('script.sh');
 * ```
 *
 * @param resourcePath The path to the resource.
 * Must follow the same syntax as defined in `tauri.conf.json > bundle > resources`, i.e. keeping subfolders and parent dir components (`../`).
 * @returns The full path to the resource.
 *
 * @since 1.0.0
 */ async function resolveResource(resourcePath) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Resource,
        path: resourcePath
    });
}
/**
 * Returns the path to the user's runtime directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `$XDG_RUNTIME_DIR`.
 * - **macOS:** Not supported.
 * - **Windows:** Not supported.
 * @example
 * ```typescript
 * import { runtimeDir } from '@tauri-apps/api/path';
 * const runtimeDirPath = await runtimeDir();
 * ```
 *
 * @since 1.0.0
 */ async function runtimeDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Runtime
    });
}
/**
 * Returns the path to the user's template directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_TEMPLATES_DIR`.
 * - **macOS:** Not supported.
 * - **Windows:** Resolves to `{FOLDERID_Templates}`.
 * @example
 * ```typescript
 * import { templateDir } from '@tauri-apps/api/path';
 * const templateDirPath = await templateDir();
 * ```
 *
 * @since 1.0.0
 */ async function templateDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Template
    });
}
/**
 * Returns the path to the user's video directory.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to [`xdg-user-dirs`](https://www.freedesktop.org/wiki/Software/xdg-user-dirs/)' `XDG_VIDEOS_DIR`.
 * - **macOS:** Resolves to `$HOME/Movies`.
 * - **Windows:** Resolves to `{FOLDERID_Videos}`.
 * @example
 * ```typescript
 * import { videoDir } from '@tauri-apps/api/path';
 * const videoDirPath = await videoDir();
 * ```
 *
 * @since 1.0.0
 */ async function videoDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Video
    });
}
/**
 * Returns the path to the suggested directory for your app's log files.
 *
 * #### Platform-specific
 *
 * - **Linux:** Resolves to `${configDir}/${bundleIdentifier}/logs`.
 * - **macOS:** Resolves to `${homeDir}/Library/Logs/{bundleIdentifier}`
 * - **Windows:** Resolves to `${configDir}/${bundleIdentifier}/logs`.
 * @example
 * ```typescript
 * import { appLogDir } from '@tauri-apps/api/path';
 * const appLogDirPath = await appLogDir();
 * ```
 *
 * @since 1.2.0
 */ async function appLogDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.AppLog
    });
}
/**
 * Returns a temporary directory.
 * @example
 * ```typescript
 * import { tempDir } from '@tauri-apps/api/path';
 * const temp = await tempDir();
 * ```
 *
 * @since 2.0.0
 */ async function tempDir() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve_directory', {
        directory: BaseDirectory.Temp
    });
}
/**
 * Returns the platform-specific path segment separator:
 * - `\` on Windows
 * - `/` on POSIX
 *
 * @since 2.0.0
 */ function sep() {
    return window.__TAURI_INTERNALS__.plugins.path.sep;
}
/**
 * Returns the platform-specific path segment delimiter:
 * - `;` on Windows
 * - `:` on POSIX
 *
 * @since 2.0.0
 */ function delimiter() {
    return window.__TAURI_INTERNALS__.plugins.path.delimiter;
}
/**
 * Resolves a sequence of `paths` or `path` segments into an absolute path.
 * @example
 * ```typescript
 * import { resolve, appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * const path = await resolve(appDataDirPath, '..', 'users', 'tauri', 'avatar.png');
 * ```
 *
 * @since 1.0.0
 */ async function resolve(...paths) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|resolve', {
        paths
    });
}
/**
 * Normalizes the given `path`, resolving `'..'` and `'.'` segments and resolve symbolic links.
 * @example
 * ```typescript
 * import { normalize, appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * const path = await normalize(`${appDataDirPath}/../users/tauri/avatar.png`);
 * ```
 *
 * @since 1.0.0
 */ async function normalize(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|normalize', {
        path
    });
}
/**
 *  Joins all given `path` segments together using the platform-specific separator as a delimiter, then normalizes the resulting path.
 * @example
 * ```typescript
 * import { join, appDataDir } from '@tauri-apps/api/path';
 * const appDataDirPath = await appDataDir();
 * const path = await join(appDataDirPath, 'users', 'tauri', 'avatar.png');
 * ```
 *
 * @since 1.0.0
 */ async function join(...paths) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|join', {
        paths
    });
}
/**
 * Returns the parent directory of a given `path`. Trailing directory separators are ignored.
 * @example
 * ```typescript
 * import { dirname } from '@tauri-apps/api/path';
 * const dir = await dirname('/path/to/somedir/');
 * assert(dir === '/path/to');
 * ```
 *
 * @since 1.0.0
 */ async function dirname(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|dirname', {
        path
    });
}
/**
 * Returns the extension of the `path`.
 * @example
 * ```typescript
 * import { extname } from '@tauri-apps/api/path';
 * const ext = await extname('/path/to/file.html');
 * assert(ext === 'html');
 * ```
 *
 * @since 1.0.0
 */ async function extname(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|extname', {
        path
    });
}
/**
 * Returns the last portion of a `path`. Trailing directory separators are ignored.
 * @example
 * ```typescript
 * import { basename } from '@tauri-apps/api/path';
 * const base = await basename('path/to/app.conf');
 * assert(base === 'app.conf');
 * ```
 * @param ext An optional file extension to be removed from the returned path.
 *
 * @since 1.0.0
 */ async function basename(path, ext) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|basename', {
        path,
        ext
    });
}
/**
 * Returns whether the path is absolute or not.
 * @example
 * ```typescript
 * import { isAbsolute } from '@tauri-apps/api/path';
 * assert(await isAbsolute('/home/tauri'));
 * ```
 *
 * @since 1.0.0
 */ async function isAbsolute(path) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:path|is_absolute', {
        path
    });
}
;
}),
"[project]/node_modules/.pnpm/@tauri-apps+plugin-fs@2.4.4/node_modules/@tauri-apps/plugin-fs/dist-js/index.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileHandle",
    ()=>FileHandle,
    "SeekMode",
    ()=>SeekMode,
    "copyFile",
    ()=>copyFile,
    "create",
    ()=>create,
    "exists",
    ()=>exists,
    "lstat",
    ()=>lstat,
    "mkdir",
    ()=>mkdir,
    "open",
    ()=>open,
    "readDir",
    ()=>readDir,
    "readFile",
    ()=>readFile,
    "readTextFile",
    ()=>readTextFile,
    "readTextFileLines",
    ()=>readTextFileLines,
    "remove",
    ()=>remove,
    "rename",
    ()=>rename,
    "size",
    ()=>size,
    "stat",
    ()=>stat,
    "truncate",
    ()=>truncate,
    "watch",
    ()=>watch,
    "watchImmediate",
    ()=>watchImmediate,
    "writeFile",
    ()=>writeFile,
    "writeTextFile",
    ()=>writeTextFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$path$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/path.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
;
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Access the file system.
 *
 * ## Security
 *
 * This module prevents path traversal, not allowing parent directory accessors to be used
 * (i.e. "/usr/path/to/../file" or "../path/to/file" paths are not allowed).
 * Paths accessed with this API must be either relative to one of the {@link BaseDirectory | base directories}
 * or created with the {@link https://v2.tauri.app/reference/javascript/api/namespacepath/ | path API}.
 *
 * The API has a scope configuration that forces you to restrict the paths that can be accessed using glob patterns.
 *
 * The scope configuration is an array of glob patterns describing file/directory paths that are allowed.
 * For instance, this scope configuration allows **all** enabled `fs` APIs to (only) access files in the
 * *databases* directory of the {@link https://v2.tauri.app/reference/javascript/api/namespacepath/#appdatadir | `$APPDATA` directory}:
 * ```json
 * {
 *   "permissions": [
 *     {
 *       "identifier": "fs:scope",
 *       "allow": [{ "path": "$APPDATA/databases/*" }]
 *     }
 *   ]
 * }
 * ```
 *
 * Scopes can also be applied to specific `fs` APIs by using the API's identifier instead of `fs:scope`:
 * ```json
 * {
 *   "permissions": [
 *     {
 *       "identifier": "fs:allow-exists",
 *       "allow": [{ "path": "$APPDATA/databases/*" }]
 *     }
 *   ]
 * }
 * ```
 *
 * Notice the use of the `$APPDATA` variable. The value is injected at runtime, resolving to the {@link https://v2.tauri.app/reference/javascript/api/namespacepath/#appdatadir | app data directory}.
 *
 * The available variables are:
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#appconfigdir | $APPCONFIG},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#appdatadir | $APPDATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#applocaldatadir | $APPLOCALDATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#appcachedir | $APPCACHE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#applogdir | $APPLOG},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#audiodir | $AUDIO},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#cachedir | $CACHE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#configdir | $CONFIG},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#datadir | $DATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#localdatadir | $LOCALDATA},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#desktopdir | $DESKTOP},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#documentdir | $DOCUMENT},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#downloaddir | $DOWNLOAD},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#executabledir | $EXE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#fontdir | $FONT},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#homedir | $HOME},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#picturedir | $PICTURE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#publicdir | $PUBLIC},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#runtimedir | $RUNTIME},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#templatedir | $TEMPLATE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#videodir | $VIDEO},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#resourcedir | $RESOURCE},
 * {@linkcode https://v2.tauri.app/reference/javascript/api/namespacepath/#tempdir | $TEMP}.
 *
 * Trying to execute any API with a URL not configured on the scope results in a promise rejection due to denied access.
 *
 * @module
 */ var SeekMode;
(function(SeekMode) {
    SeekMode[SeekMode["Start"] = 0] = "Start";
    SeekMode[SeekMode["Current"] = 1] = "Current";
    SeekMode[SeekMode["End"] = 2] = "End";
})(SeekMode || (SeekMode = {}));
function parseFileInfo(r) {
    return {
        isFile: r.isFile,
        isDirectory: r.isDirectory,
        isSymlink: r.isSymlink,
        size: r.size,
        mtime: r.mtime !== null ? new Date(r.mtime) : null,
        atime: r.atime !== null ? new Date(r.atime) : null,
        birthtime: r.birthtime !== null ? new Date(r.birthtime) : null,
        readonly: r.readonly,
        fileAttributes: r.fileAttributes,
        dev: r.dev,
        ino: r.ino,
        mode: r.mode,
        nlink: r.nlink,
        uid: r.uid,
        gid: r.gid,
        rdev: r.rdev,
        blksize: r.blksize,
        blocks: r.blocks
    };
}
// https://gist.github.com/zapthedingbat/38ebfbedd98396624e5b5f2ff462611d
/** Converts a big-endian eight byte array to number  */ function fromBytes(buffer) {
    const bytes = new Uint8ClampedArray(buffer);
    const size = bytes.byteLength;
    let x = 0;
    for(let i = 0; i < size; i++){
        // eslint-disable-next-line security/detect-object-injection
        const byte = bytes[i];
        x *= 0x100;
        x += byte;
    }
    return x;
}
/**
 *  The Tauri abstraction for reading and writing files.
 *
 * @since 2.0.0
 */ class FileHandle extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
    /**
     * Reads up to `p.byteLength` bytes into `p`. It resolves to the number of
     * bytes read (`0` < `n` <= `p.byteLength`) and rejects if any error
     * encountered. Even if `read()` resolves to `n` < `p.byteLength`, it may
     * use all of `p` as scratch space during the call. If some data is
     * available but not `p.byteLength` bytes, `read()` conventionally resolves
     * to what is available instead of waiting for more.
     *
     * When `read()` encounters end-of-file condition, it resolves to EOF
     * (`null`).
     *
     * When `read()` encounters an error, it rejects with an error.
     *
     * Callers should always process the `n` > `0` bytes returned before
     * considering the EOF (`null`). Doing so correctly handles I/O errors that
     * happen after reading some bytes and also both of the allowed EOF
     * behaviors.
     *
     * @example
     * ```typescript
     * import { open, BaseDirectory } from "@tauri-apps/plugin-fs"
     * // if "$APPCONFIG/foo/bar.txt" contains the text "hello world":
     * const file = await open("foo/bar.txt", { baseDir: BaseDirectory.AppConfig });
     * const buf = new Uint8Array(100);
     * const numberOfBytesRead = await file.read(buf); // 11 bytes
     * const text = new TextDecoder().decode(buf);  // "hello world"
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async read(buffer) {
        if (buffer.byteLength === 0) {
            return 0;
        }
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read', {
            rid: this.rid,
            len: buffer.byteLength
        });
        // Rust side will never return an empty array for this command and
        // ensure there is at least 8 elements there.
        //
        // This is an optimization to include the number of read bytes (as bigendian bytes)
        // at the end of returned array to avoid serialization overhead of separate values.
        const nread = fromBytes(data.slice(-8));
        const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
        buffer.set(bytes.slice(0, bytes.length - 8));
        return nread === 0 ? null : nread;
    }
    /**
     * Seek sets the offset for the next `read()` or `write()` to offset,
     * interpreted according to `whence`: `Start` means relative to the
     * start of the file, `Current` means relative to the current offset,
     * and `End` means relative to the end. Seek resolves to the new offset
     * relative to the start of the file.
     *
     * Seeking to an offset before the start of the file is an error. Seeking to
     * any positive offset is legal, but the behavior of subsequent I/O
     * operations on the underlying object is implementation-dependent.
     * It returns the number of cursor position.
     *
     * @example
     * ```typescript
     * import { open, SeekMode, BaseDirectory } from '@tauri-apps/plugin-fs';
     *
     * // Given hello.txt pointing to file with "Hello world", which is 11 bytes long:
     * const file = await open('hello.txt', { read: true, write: true, truncate: true, create: true, baseDir: BaseDirectory.AppLocalData });
     * await file.write(new TextEncoder().encode("Hello world"));
     *
     * // Seek 6 bytes from the start of the file
     * console.log(await file.seek(6, SeekMode.Start)); // "6"
     * // Seek 2 more bytes from the current position
     * console.log(await file.seek(2, SeekMode.Current)); // "8"
     * // Seek backwards 2 bytes from the end of the file
     * console.log(await file.seek(-2, SeekMode.End)); // "9" (e.g. 11-2)
     *
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async seek(offset, whence) {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|seek', {
            rid: this.rid,
            offset,
            whence
        });
    }
    /**
     * Returns a {@linkcode FileInfo } for this file.
     *
     * @example
     * ```typescript
     * import { open, BaseDirectory } from '@tauri-apps/plugin-fs';
     * const file = await open("file.txt", { read: true, baseDir: BaseDirectory.AppLocalData });
     * const fileInfo = await file.stat();
     * console.log(fileInfo.isFile); // true
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async stat() {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|fstat', {
            rid: this.rid
        });
        return parseFileInfo(res);
    }
    /**
     * Truncates or extends this file, to reach the specified `len`.
     * If `len` is not specified then the entire file contents are truncated.
     *
     * @example
     * ```typescript
     * import { open, BaseDirectory } from '@tauri-apps/plugin-fs';
     *
     * // truncate the entire file
     * const file = await open("my_file.txt", { read: true, write: true, create: true, baseDir: BaseDirectory.AppLocalData });
     * await file.truncate();
     *
     * // truncate part of the file
     * const file = await open("my_file.txt", { read: true, write: true, create: true, baseDir: BaseDirectory.AppLocalData });
     * await file.write(new TextEncoder().encode("Hello World"));
     * await file.truncate(7);
     * const data = new Uint8Array(32);
     * await file.read(data);
     * console.log(new TextDecoder().decode(data)); // Hello W
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async truncate(len) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|ftruncate', {
            rid: this.rid,
            len
        });
    }
    /**
     * Writes `data.byteLength` bytes from `data` to the underlying data stream. It
     * resolves to the number of bytes written from `data` (`0` <= `n` <=
     * `data.byteLength`) or reject with the error encountered that caused the
     * write to stop early. `write()` must reject with a non-null error if
     * would resolve to `n` < `data.byteLength`. `write()` must not modify the
     * slice data, even temporarily.
     *
     * @example
     * ```typescript
     * import { open, write, BaseDirectory } from '@tauri-apps/plugin-fs';
     * const encoder = new TextEncoder();
     * const data = encoder.encode("Hello world");
     * const file = await open("bar.txt", { write: true, baseDir: BaseDirectory.AppLocalData });
     * const bytesWritten = await file.write(data); // 11
     * await file.close();
     * ```
     *
     * @since 2.0.0
     */ async write(data) {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|write', {
            rid: this.rid,
            data
        });
    }
}
/**
 * Creates a file if none exists or truncates an existing file and resolves to
 *  an instance of {@linkcode FileHandle }.
 *
 * @example
 * ```typescript
 * import { create, BaseDirectory } from "@tauri-apps/plugin-fs"
 * const file = await create("foo/bar.txt", { baseDir: BaseDirectory.AppConfig });
 * await file.write(new TextEncoder().encode("Hello world"));
 * await file.close();
 * ```
 *
 * @since 2.0.0
 */ async function create(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|create', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return new FileHandle(rid);
}
/**
 * Open a file and resolve to an instance of {@linkcode FileHandle}. The
 * file does not need to previously exist if using the `create` or `createNew`
 * open options. It is the callers responsibility to close the file when finished
 * with it.
 *
 * @example
 * ```typescript
 * import { open, BaseDirectory } from "@tauri-apps/plugin-fs"
 * const file = await open("foo/bar.txt", { read: true, write: true, baseDir: BaseDirectory.AppLocalData });
 * // Do work with file
 * await file.close();
 * ```
 *
 * @since 2.0.0
 */ async function open(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|open', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return new FileHandle(rid);
}
/**
 * Copies the contents and permissions of one file to another specified path, by default creating a new file if needed, else overwriting.
 * @example
 * ```typescript
 * import { copyFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await copyFile('app.conf', 'app.conf.bk', { fromPathBaseDir: BaseDirectory.AppConfig, toPathBaseDir: BaseDirectory.AppConfig });
 * ```
 *
 * @since 2.0.0
 */ async function copyFile(fromPath, toPath, options) {
    if (fromPath instanceof URL && fromPath.protocol !== 'file:' || toPath instanceof URL && toPath.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|copy_file', {
        fromPath: fromPath instanceof URL ? fromPath.toString() : fromPath,
        toPath: toPath instanceof URL ? toPath.toString() : toPath,
        options
    });
}
/**
 * Creates a new directory with the specified path.
 * @example
 * ```typescript
 * import { mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await mkdir('users', { baseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function mkdir(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|mkdir', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
/**
 * Reads the directory given by path and returns an array of `DirEntry`.
 * @example
 * ```typescript
 * import { readDir, BaseDirectory } from '@tauri-apps/plugin-fs';
 * import { join } from '@tauri-apps/api/path';
 * const dir = "users"
 * const entries = await readDir('users', { baseDir: BaseDirectory.AppLocalData });
 * processEntriesRecursively(dir, entries);
 * async function processEntriesRecursively(parent, entries) {
 *   for (const entry of entries) {
 *     console.log(`Entry: ${entry.name}`);
 *     if (entry.isDirectory) {
 *        const dir = await join(parent, entry.name);
 *       processEntriesRecursively(dir, await readDir(dir, { baseDir: BaseDirectory.AppLocalData }))
 *     }
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 */ async function readDir(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_dir', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
/**
 * Reads and resolves to the entire contents of a file as an array of bytes.
 * TextDecoder can be used to transform the bytes to string if required.
 * @example
 * ```typescript
 * import { readFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const contents = await readFile('avatar.png', { baseDir: BaseDirectory.Resource });
 * ```
 *
 * @since 2.0.0
 */ async function readFile(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const arr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_file', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return arr instanceof ArrayBuffer ? new Uint8Array(arr) : Uint8Array.from(arr);
}
/**
 * Reads and returns the entire contents of a file as UTF-8 string.
 * @example
 * ```typescript
 * import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const contents = await readTextFile('app.conf', { baseDir: BaseDirectory.AppConfig });
 * ```
 *
 * @since 2.0.0
 */ async function readTextFile(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const arr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_text_file', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    const bytes = arr instanceof ArrayBuffer ? arr : Uint8Array.from(arr);
    return new TextDecoder().decode(bytes);
}
/**
 * Returns an async {@linkcode AsyncIterableIterator} over the lines of a file as UTF-8 string.
 * @example
 * ```typescript
 * import { readTextFileLines, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const lines = await readTextFileLines('app.conf', { baseDir: BaseDirectory.AppConfig });
 * for await (const line of lines) {
 *   console.log(line);
 * }
 * ```
 * You could also call {@linkcode AsyncIterableIterator.next} to advance the
 * iterator so you can lazily read the next line whenever you want.
 *
 * @since 2.0.0
 */ async function readTextFileLines(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const pathStr = path instanceof URL ? path.toString() : path;
    return await Promise.resolve({
        path: pathStr,
        rid: null,
        async next () {
            if (this.rid === null) {
                this.rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_text_file_lines', {
                    path: pathStr,
                    options
                });
            }
            const arr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|read_text_file_lines_next', {
                rid: this.rid
            });
            const bytes = arr instanceof ArrayBuffer ? new Uint8Array(arr) : Uint8Array.from(arr);
            // Rust side will never return an empty array for this command and
            // ensure there is at least one elements there.
            //
            // This is an optimization to include whether we finished iteration or not (1 or 0)
            // at the end of returned array to avoid serialization overhead of separate values.
            const done = bytes[bytes.byteLength - 1] === 1;
            if (done) {
                // a full iteration is over, reset rid for next iteration
                this.rid = null;
                return {
                    value: null,
                    done
                };
            }
            const line = new TextDecoder().decode(bytes.slice(0, bytes.byteLength));
            return {
                value: line,
                done
            };
        },
        [Symbol.asyncIterator] () {
            return this;
        }
    });
}
/**
 * Removes the named file or directory.
 * If the directory is not empty and the `recursive` option isn't set to true, the promise will be rejected.
 * @example
 * ```typescript
 * import { remove, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await remove('users/file.txt', { baseDir: BaseDirectory.AppLocalData });
 * await remove('users', { baseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function remove(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|remove', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
/**
 * Renames (moves) oldpath to newpath. Paths may be files or directories.
 * If newpath already exists and is not a directory, rename() replaces it.
 * OS-specific restrictions may apply when oldpath and newpath are in different directories.
 *
 * On Unix, this operation does not follow symlinks at either path.
 *
 * @example
 * ```typescript
 * import { rename, BaseDirectory } from '@tauri-apps/plugin-fs';
 * await rename('avatar.png', 'deleted.png', { oldPathBaseDir: BaseDirectory.App, newPathBaseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function rename(oldPath, newPath, options) {
    if (oldPath instanceof URL && oldPath.protocol !== 'file:' || newPath instanceof URL && newPath.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|rename', {
        oldPath: oldPath instanceof URL ? oldPath.toString() : oldPath,
        newPath: newPath instanceof URL ? newPath.toString() : newPath,
        options
    });
}
/**
 * Resolves to a {@linkcode FileInfo} for the specified `path`. Will always
 * follow symlinks but will reject if the symlink points to a path outside of the scope.
 *
 * @example
 * ```typescript
 * import { stat, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const fileInfo = await stat("hello.txt", { baseDir: BaseDirectory.AppLocalData });
 * console.log(fileInfo.isFile); // true
 * ```
 *
 * @since 2.0.0
 */ async function stat(path, options) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|stat', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return parseFileInfo(res);
}
/**
 * Resolves to a {@linkcode FileInfo} for the specified `path`. If `path` is a
 * symlink, information for the symlink will be returned instead of what it
 * points to.
 *
 * @example
 * ```typescript
 * import { lstat, BaseDirectory } from '@tauri-apps/plugin-fs';
 * const fileInfo = await lstat("hello.txt", { baseDir: BaseDirectory.AppLocalData });
 * console.log(fileInfo.isFile); // true
 * ```
 *
 * @since 2.0.0
 */ async function lstat(path, options) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|lstat', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
    return parseFileInfo(res);
}
/**
 * Truncates or extends the specified file, to reach the specified `len`.
 * If `len` is `0` or not specified, then the entire file contents are truncated.
 *
 * @example
 * ```typescript
 * import { truncate, readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 * // truncate the entire file
 * await truncate("my_file.txt", 0, { baseDir: BaseDirectory.AppLocalData });
 *
 * // truncate part of the file
 * const filePath = "file.txt";
 * await writeTextFile(filePath, "Hello World", { baseDir: BaseDirectory.AppLocalData });
 * await truncate(filePath, 7, { baseDir: BaseDirectory.AppLocalData });
 * const data = await readTextFile(filePath, { baseDir: BaseDirectory.AppLocalData });
 * console.log(data);  // "Hello W"
 * ```
 *
 * @since 2.0.0
 */ async function truncate(path, len, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|truncate', {
        path: path instanceof URL ? path.toString() : path,
        len,
        options
    });
}
/**
 * Write `data` to the given `path`, by default creating a new file if needed, else overwriting.
 * @example
 * ```typescript
 * import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
 *
 * let encoder = new TextEncoder();
 * let data = encoder.encode("Hello World");
 * await writeFile('file.txt', data, { baseDir: BaseDirectory.AppLocalData });
 * ```
 *
 * @since 2.0.0
 */ async function writeFile(path, data, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    if (data instanceof ReadableStream) {
        const file = await open(path, {
            read: false,
            create: true,
            write: true,
            ...options
        });
        const reader = data.getReader();
        try {
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                await file.write(value);
            }
        } finally{
            reader.releaseLock();
            await file.close();
        }
    } else {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|write_file', data, {
            headers: {
                path: encodeURIComponent(path instanceof URL ? path.toString() : path),
                options: JSON.stringify(options)
            }
        });
    }
}
/**
  * Writes UTF-8 string `data` to the given `path`, by default creating a new file if needed, else overwriting.
    @example
  * ```typescript
  * import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
  *
  * await writeTextFile('file.txt', "Hello world", { baseDir: BaseDirectory.AppLocalData });
  * ```
  *
  * @since 2.0.0
  */ async function writeTextFile(path, data, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    const encoder = new TextEncoder();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|write_text_file', encoder.encode(data), {
        headers: {
            path: encodeURIComponent(path instanceof URL ? path.toString() : path),
            options: JSON.stringify(options)
        }
    });
}
/**
 * Check if a path exists.
 * @example
 * ```typescript
 * import { exists, BaseDirectory } from '@tauri-apps/plugin-fs';
 * // Check if the `$APPDATA/avatar.png` file exists
 * await exists('avatar.png', { baseDir: BaseDirectory.AppData });
 * ```
 *
 * @since 2.0.0
 */ async function exists(path, options) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|exists', {
        path: path instanceof URL ? path.toString() : path,
        options
    });
}
class Watcher extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Resource"] {
}
async function watchInternal(paths, cb, options) {
    const watchPaths = Array.isArray(paths) ? paths : [
        paths
    ];
    for (const path of watchPaths){
        if (path instanceof URL && path.protocol !== 'file:') {
            throw new TypeError('Must be a file URL.');
        }
    }
    const onEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Channel"]();
    onEvent.onmessage = cb;
    const rid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|watch', {
        paths: watchPaths.map((p)=>p instanceof URL ? p.toString() : p),
        options,
        onEvent
    });
    const watcher = new Watcher(rid);
    return ()=>{
        void watcher.close();
    };
}
// TODO: Return `Watcher` instead in v3
/**
 * Watch changes (after a delay) on files or directories.
 *
 * @since 2.0.0
 */ async function watch(paths, cb, options) {
    return await watchInternal(paths, cb, {
        delayMs: 2000,
        ...options
    });
}
// TODO: Return `Watcher` instead in v3
/**
 * Watch changes on files or directories.
 *
 * @since 2.0.0
 */ async function watchImmediate(paths, cb, options) {
    return await watchInternal(paths, cb, {
        ...options,
        delayMs: undefined
    });
}
/**
 * Get the size of a file or directory. For files, the `stat` functions can be used as well.
 *
 * If `path` is a directory, this function will recursively iterate over every file and every directory inside of `path` and therefore will be very time consuming if used on larger directories.
 *
 * @example
 * ```typescript
 * import { size, BaseDirectory } from '@tauri-apps/plugin-fs';
 * // Get the size of the `$APPDATA/tauri` directory.
 * const dirSize = await size('tauri', { baseDir: BaseDirectory.AppData });
 * console.log(dirSize); // 1024
 * ```
 *
 * @since 2.1.0
 */ async function size(path) {
    if (path instanceof URL && path.protocol !== 'file:') {
        throw new TypeError('Must be a file URL.');
    }
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:fs|size', {
        path: path instanceof URL ? path.toString() : path
    });
}
;
}),
"[project]/node_modules/.pnpm/@tauri-apps+plugin-os@2.3.2/node_modules/@tauri-apps/plugin-os/dist-js/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "arch",
    ()=>arch,
    "eol",
    ()=>eol,
    "exeExtension",
    ()=>exeExtension,
    "family",
    ()=>family,
    "hostname",
    ()=>hostname,
    "locale",
    ()=>locale,
    "platform",
    ()=>platform,
    "type",
    ()=>type,
    "version",
    ()=>version
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@tauri-apps+api@2.9.0/node_modules/@tauri-apps/api/core.js [app-client] (ecmascript)");
;
// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
/**
 * Provides operating system-related utility methods and properties.
 *
 * @module
 */ /**
 * Returns the operating system-specific end-of-line marker.
 * - `\n` on POSIX
 * - `\r\n` on Windows
 *
 * @since 2.0.0
 * */ function eol() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.eol;
}
/**
 * Returns a string describing the specific operating system in use.
 * The value is set at compile time. Possible values are `'linux'`, `'macos'`, `'ios'`, `'freebsd'`, `'dragonfly'`, `'netbsd'`, `'openbsd'`, `'solaris'`, `'android'`, `'windows'`
 *
 * @example
 * ```typescript
 * import { platform } from '@tauri-apps/plugin-os';
 * const platformName = platform();
 * ```
 *
 * @since 2.0.0
 *
 */ function platform() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.platform;
}
/**
 * Returns the current operating system version.
 * @example
 * ```typescript
 * import { version } from '@tauri-apps/plugin-os';
 * const osVersion = version();
 * ```
 *
 * @since 2.0.0
 */ function version() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.version;
}
/**
 * Returns the current operating system family. Possible values are `'unix'`, `'windows'`.
 * @example
 * ```typescript
 * import { family } from '@tauri-apps/plugin-os';
 * const family = family();
 * ```
 *
 * @since 2.0.0
 */ function family() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.family;
}
/**
 * Returns the current operating system type. Returns `'linux'` on Linux, `'macos'` on macOS, `'windows'` on Windows, `'ios'` on iOS and `'android'` on Android.
 * @example
 * ```typescript
 * import { type } from '@tauri-apps/plugin-os';
 * const osType = type();
 * ```
 *
 * @since 2.0.0
 */ function type() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.os_type;
}
/**
 * Returns the current operating system architecture.
 * Possible values are `'x86'`, `'x86_64'`, `'arm'`, `'aarch64'`, `'mips'`, `'mips64'`, `'powerpc'`, `'powerpc64'`, `'riscv64'`, `'s390x'`, `'sparc64'`.
 * @example
 * ```typescript
 * import { arch } from '@tauri-apps/plugin-os';
 * const archName = arch();
 * ```
 *
 * @since 2.0.0
 */ function arch() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.arch;
}
/**
 * Returns the file extension, if any, used for executable binaries on this platform. Possible values are `'exe'` and `''` (empty string).
 * @example
 * ```typescript
 * import { exeExtension } from '@tauri-apps/plugin-os';
 * const exeExt = exeExtension();
 * ```
 *
 * @since 2.0.0
 */ function exeExtension() {
    return window.__TAURI_OS_PLUGIN_INTERNALS__.exe_extension;
}
/**
 * Returns a String with a `BCP-47` language tag inside. If the locale couldn’t be obtained, `null` is returned instead.
 * @example
 * ```typescript
 * import { locale } from '@tauri-apps/plugin-os';
 * const locale = await locale();
 * if (locale) {
 *    // use the locale string here
 * }
 * ```
 *
 * @since 2.0.0
 */ async function locale() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:os|locale');
}
/**
 * Returns the host name of the operating system.
 * @example
 * ```typescript
 * import { hostname } from '@tauri-apps/plugin-os';
 * const hostname = await hostname();
 * ```
 */ async function hostname() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$tauri$2d$apps$2b$api$40$2$2e$9$2e$0$2f$node_modules$2f40$tauri$2d$apps$2f$api$2f$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["invoke"])('plugin:os|hostname');
}
;
}),
]);

//# sourceMappingURL=_bf2ac8c6._.js.map