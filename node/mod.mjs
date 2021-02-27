class DenoStdInternalError extends Error {
    constructor(message1){
        super(message1);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
const CHAR_FORWARD_SLASH = 47;
const CHAR_FORWARD_SLASH1 = 47;
function isPosixPathSeparator(code) {
    return code === 47;
}
const isPosixPathSeparator1 = isPosixPathSeparator;
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
const isPathSeparator1 = isPathSeparator;
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator2(code)) break;
        else code = CHAR_FORWARD_SLASH1;
        if (isPathSeparator2(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
const normalizeString1 = normalizeString;
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const mod = function() {
    const sep = "/";
    const delimiter = ":";
    function resolve(...pathSegments) {
        let resolvedPath = "";
        let resolvedAbsolute = false;
        for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
            let path;
            if (i >= 0) path = pathSegments[i];
            else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.cwd();
            }
            assertPath(path);
            if (path.length === 0) {
                continue;
            }
            resolvedPath = `${path}/${resolvedPath}`;
            resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        resolvedPath = normalizeString1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator1);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0) return `/${resolvedPath}`;
            else return "/";
        } else if (resolvedPath.length > 0) return resolvedPath;
        else return ".";
    }
    function normalize(path) {
        assertPath(path);
        if (path.length === 0) return ".";
        const isAbsolute = path.charCodeAt(0) === 47;
        const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
        path = normalizeString1(path, !isAbsolute, "/", isPosixPathSeparator1);
        if (path.length === 0 && !isAbsolute) path = ".";
        if (path.length > 0 && trailingSeparator) path += "/";
        if (isAbsolute) return `/${path}`;
        return path;
    }
    function isAbsolute(path) {
        assertPath(path);
        return path.length > 0 && path.charCodeAt(0) === 47;
    }
    function join(...paths) {
        if (paths.length === 0) return ".";
        let joined;
        for(let i = 0, len = paths.length; i < len; ++i){
            const path = paths[i];
            assertPath(path);
            if (path.length > 0) {
                if (!joined) joined = path;
                else joined += `/${path}`;
            }
        }
        if (!joined) return ".";
        return normalize(joined);
    }
    function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        from = resolve(from);
        to = resolve(to);
        if (from === to) return "";
        let fromStart = 1;
        const fromEnd = from.length;
        for(; fromStart < fromEnd; ++fromStart){
            if (from.charCodeAt(fromStart) !== 47) break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 1;
        const toEnd = to.length;
        for(; toStart < toEnd; ++toStart){
            if (to.charCodeAt(toStart) !== 47) break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for(; i <= length; ++i){
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 47) {
                        return to.slice(toStart + i + 1);
                    } else if (i === 0) {
                        return to.slice(toStart + i);
                    }
                } else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 47) {
                        lastCommonSep = i;
                    } else if (i === 0) {
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode) break;
            else if (fromCode === 47) lastCommonSep = i;
        }
        let out = "";
        for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
            if (i === fromEnd || from.charCodeAt(i) === 47) {
                if (out.length === 0) out += "..";
                else out += "/..";
            }
        }
        if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === 47) ++toStart;
            return to.slice(toStart);
        }
    }
    function toNamespacedPath(path) {
        return path;
    }
    function dirname(path) {
        assertPath(path);
        if (path.length === 0) return ".";
        const hasRoot = path.charCodeAt(0) === 47;
        let end = -1;
        let matchedSlash = true;
        for(let i = path.length - 1; i >= 1; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            } else {
                matchedSlash = false;
            }
        }
        if (end === -1) return hasRoot ? "/" : ".";
        if (hasRoot && end === 1) return "//";
        return path.slice(0, end);
    }
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for(i = path.length - 1; i >= 0; --i){
                const code = path.charCodeAt(i);
                if (code === 47) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if ((--extIdx) === -1) {
                                end = i;
                            }
                        } else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) end = firstNonSlashEnd;
            else if (end === -1) end = path.length;
            return path.slice(start, end);
        } else {
            for(i = path.length - 1; i >= 0; --i){
                if (path.charCodeAt(i) === 47) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) return "";
            return path.slice(start, end);
        }
    }
    function extname(path) {
        assertPath(path);
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        for(let i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return "";
        }
        return path.slice(startDot, end);
    }
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _format("/", pathObject);
    }
    function parse(path) {
        assertPath(path);
        const ret = {
            root: "",
            dir: "",
            base: "",
            ext: "",
            name: ""
        };
        if (path.length === 0) return ret;
        const isAbsolute1 = path.charCodeAt(0) === 47;
        let start;
        if (isAbsolute1) {
            ret.root = "/";
            start = 1;
        } else {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for(; i >= start; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute1) {
                    ret.base = ret.name = path.slice(1, end);
                } else {
                    ret.base = ret.name = path.slice(startPart, end);
                }
            }
        } else {
            if (startPart === 0 && isAbsolute1) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            } else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute1) ret.dir = "/";
        return ret;
    }
    function fromFileUrl(url) {
        url = url instanceof URL ? url : new URL(url);
        if (url.protocol != "file:") {
            throw new TypeError("Must be a file URL.");
        }
        return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
    }
    function toFileUrl(path) {
        if (!isAbsolute(path)) {
            throw new TypeError("Must be an absolute path.");
        }
        const url = new URL("file:///");
        url.pathname = path.replace(/%/g, "%25").replace(/\\/g, "%5C");
        return url;
    }
    return {
        sep,
        delimiter,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        toNamespacedPath,
        dirname,
        basename,
        extname,
        format,
        parse,
        fromFileUrl,
        toFileUrl
    };
}();
const normalizeString2 = normalizeString;
const mod1 = function() {
    const sep = "\\";
    const delimiter = ";";
    function resolve(...pathSegments) {
        let resolvedDevice = "";
        let resolvedTail = "";
        let resolvedAbsolute = false;
        for(let i = pathSegments.length - 1; i >= -1; i--){
            let path;
            if (i >= 0) {
                path = pathSegments[i];
            } else if (!resolvedDevice) {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a drive-letter-less path without a CWD.");
                }
                path = Deno.cwd();
            } else {
                if (globalThis.Deno == null) {
                    throw new TypeError("Resolved a relative path without a CWD.");
                }
                path = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
                if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                    path = `${resolvedDevice}\\`;
                }
            }
            assertPath(path);
            const len = path.length;
            if (len === 0) continue;
            let rootEnd = 0;
            let device = "";
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            if (len > 1) {
                if (isPathSeparator(code)) {
                    isAbsolute = true;
                    if (isPathSeparator(path.charCodeAt(1))) {
                        let j = 2;
                        let last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            const firstPart = path.slice(last, j);
                            last = j;
                            for(; j < len; ++j){
                                if (!isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j < len && j !== last) {
                                last = j;
                                for(; j < len; ++j){
                                    if (isPathSeparator(path.charCodeAt(j))) break;
                                }
                                if (j === len) {
                                    device = `\\\\${firstPart}\\${path.slice(last)}`;
                                    rootEnd = j;
                                } else if (j !== last) {
                                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                    rootEnd = j;
                                }
                            }
                        }
                    } else {
                        rootEnd = 1;
                    }
                } else if (isWindowsDeviceRoot(code)) {
                    if (path.charCodeAt(1) === 58) {
                        device = path.slice(0, 2);
                        rootEnd = 2;
                        if (len > 2) {
                            if (isPathSeparator(path.charCodeAt(2))) {
                                isAbsolute = true;
                                rootEnd = 3;
                            }
                        }
                    }
                }
            } else if (isPathSeparator(code)) {
                rootEnd = 1;
                isAbsolute = true;
            }
            if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                continue;
            }
            if (resolvedDevice.length === 0 && device.length > 0) {
                resolvedDevice = device;
            }
            if (!resolvedAbsolute) {
                resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                resolvedAbsolute = isAbsolute;
            }
            if (resolvedAbsolute && resolvedDevice.length > 0) break;
        }
        resolvedTail = normalizeString2(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator1);
        return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
    }
    function normalize(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return ".";
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                return `\\\\${firstPart}\\${path.slice(last)}\\`;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            return "\\";
        }
        let tail;
        if (rootEnd < len) {
            tail = normalizeString2(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator1);
        } else {
            tail = "";
        }
        if (tail.length === 0 && !isAbsolute) tail = ".";
        if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
            tail += "\\";
        }
        if (device === undefined) {
            if (isAbsolute) {
                if (tail.length > 0) return `\\${tail}`;
                else return "\\";
            } else if (tail.length > 0) {
                return tail;
            } else {
                return "";
            }
        } else if (isAbsolute) {
            if (tail.length > 0) return `${device}\\${tail}`;
            else return `${device}\\`;
        } else if (tail.length > 0) {
            return device + tail;
        } else {
            return device;
        }
    }
    function isAbsolute(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return false;
        const code = path.charCodeAt(0);
        if (isPathSeparator(code)) {
            return true;
        } else if (isWindowsDeviceRoot(code)) {
            if (len > 2 && path.charCodeAt(1) === 58) {
                if (isPathSeparator(path.charCodeAt(2))) return true;
            }
        }
        return false;
    }
    function join(...paths) {
        const pathsCount = paths.length;
        if (pathsCount === 0) return ".";
        let joined;
        let firstPart = null;
        for(let i = 0; i < pathsCount; ++i){
            const path = paths[i];
            assertPath(path);
            if (path.length > 0) {
                if (joined === undefined) joined = firstPart = path;
                else joined += `\\${path}`;
            }
        }
        if (joined === undefined) return ".";
        let needsReplace = true;
        let slashCount = 0;
        assert(firstPart != null);
        if (isPathSeparator(firstPart.charCodeAt(0))) {
            ++slashCount;
            const firstLen = firstPart.length;
            if (firstLen > 1) {
                if (isPathSeparator(firstPart.charCodeAt(1))) {
                    ++slashCount;
                    if (firstLen > 2) {
                        if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                        else {
                            needsReplace = false;
                        }
                    }
                }
            }
        }
        if (needsReplace) {
            for(; slashCount < joined.length; ++slashCount){
                if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
            }
            if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
        }
        return normalize(joined);
    }
    function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        const fromOrig = resolve(from);
        const toOrig = resolve(to);
        if (fromOrig === toOrig) return "";
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) return "";
        let fromStart = 0;
        let fromEnd = from.length;
        for(; fromStart < fromEnd; ++fromStart){
            if (from.charCodeAt(fromStart) !== 92) break;
        }
        for(; fromEnd - 1 > fromStart; --fromEnd){
            if (from.charCodeAt(fromEnd - 1) !== 92) break;
        }
        const fromLen = fromEnd - fromStart;
        let toStart = 0;
        let toEnd = to.length;
        for(; toStart < toEnd; ++toStart){
            if (to.charCodeAt(toStart) !== 92) break;
        }
        for(; toEnd - 1 > toStart; --toEnd){
            if (to.charCodeAt(toEnd - 1) !== 92) break;
        }
        const toLen = toEnd - toStart;
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for(; i <= length; ++i){
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 92) {
                        return toOrig.slice(toStart + i + 1);
                    } else if (i === 2) {
                        return toOrig.slice(toStart + i);
                    }
                }
                if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 92) {
                        lastCommonSep = i;
                    } else if (i === 2) {
                        lastCommonSep = 3;
                    }
                }
                break;
            }
            const fromCode = from.charCodeAt(fromStart + i);
            const toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode) break;
            else if (fromCode === 92) lastCommonSep = i;
        }
        if (i !== length && lastCommonSep === -1) {
            return toOrig;
        }
        let out = "";
        if (lastCommonSep === -1) lastCommonSep = 0;
        for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
            if (i === fromEnd || from.charCodeAt(i) === 92) {
                if (out.length === 0) out += "..";
                else out += "\\..";
            }
        }
        if (out.length > 0) {
            return out + toOrig.slice(toStart + lastCommonSep, toEnd);
        } else {
            toStart += lastCommonSep;
            if (toOrig.charCodeAt(toStart) === 92) ++toStart;
            return toOrig.slice(toStart, toEnd);
        }
    }
    function toNamespacedPath(path) {
        if (typeof path !== "string") return path;
        if (path.length === 0) return "";
        const resolvedPath = resolve(path);
        if (resolvedPath.length >= 3) {
            if (resolvedPath.charCodeAt(0) === 92) {
                if (resolvedPath.charCodeAt(1) === 92) {
                    const code = resolvedPath.charCodeAt(2);
                    if (code !== 63 && code !== 46) {
                        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                    }
                }
            } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
                if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                    return `\\\\?\\${resolvedPath}`;
                }
            }
        }
        return path;
    }
    function dirname(path) {
        assertPath(path);
        const len = path.length;
        if (len === 0) return ".";
        let rootEnd = -1;
        let end = -1;
        let matchedSlash = true;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                rootEnd = offset = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                return path;
                            }
                            if (j !== last) {
                                rootEnd = offset = j + 1;
                            }
                        }
                    }
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    rootEnd = offset = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            return path;
        }
        for(let i = len - 1; i >= offset; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            } else {
                matchedSlash = false;
            }
        }
        if (end === -1) {
            if (rootEnd === -1) return ".";
            else end = rootEnd;
        }
        return path.slice(0, end);
    }
    function basename(path, ext = "") {
        if (ext !== undefined && typeof ext !== "string") {
            throw new TypeError('"ext" argument must be a string');
        }
        assertPath(path);
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (path.length >= 2) {
            const drive = path.charCodeAt(0);
            if (isWindowsDeviceRoot(drive)) {
                if (path.charCodeAt(1) === 58) start = 2;
            }
        }
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path) return "";
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for(i = path.length - 1; i >= start; --i){
                const code = path.charCodeAt(i);
                if (isPathSeparator(code)) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else {
                    if (firstNonSlashEnd === -1) {
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        if (code === ext.charCodeAt(extIdx)) {
                            if ((--extIdx) === -1) {
                                end = i;
                            }
                        } else {
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) end = firstNonSlashEnd;
            else if (end === -1) end = path.length;
            return path.slice(start, end);
        } else {
            for(i = path.length - 1; i >= start; --i){
                if (isPathSeparator(path.charCodeAt(i))) {
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                } else if (end === -1) {
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) return "";
            return path.slice(start, end);
        }
    }
    function extname(path) {
        assertPath(path);
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let preDotState = 0;
        if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
            start = startPart = 2;
        }
        for(let i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return "";
        }
        return path.slice(startDot, end);
    }
    function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
            throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
        }
        return _format("\\", pathObject);
    }
    function parse(path) {
        assertPath(path);
        const ret = {
            root: "",
            dir: "",
            base: "",
            ext: "",
            name: ""
        };
        const len = path.length;
        if (len === 0) return ret;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                rootEnd = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                rootEnd = j;
                            } else if (j !== last) {
                                rootEnd = j + 1;
                            }
                        }
                    }
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            if (len === 3) {
                                ret.root = ret.dir = path;
                                return ret;
                            }
                            rootEnd = 3;
                        }
                    } else {
                        ret.root = ret.dir = path;
                        return ret;
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            ret.root = ret.dir = path;
            return ret;
        }
        if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
        let startDot = -1;
        let startPart = rootEnd;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        let preDotState = 0;
        for(; i >= rootEnd; --i){
            code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46) {
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                ret.base = ret.name = path.slice(startPart, end);
            }
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0 && startPart !== rootEnd) {
            ret.dir = path.slice(0, startPart - 1);
        } else ret.dir = ret.root;
        return ret;
    }
    function fromFileUrl(url) {
        url = url instanceof URL ? url : new URL(url);
        if (url.protocol != "file:") {
            throw new TypeError("Must be a file URL.");
        }
        let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
        if (url.hostname != "") {
            path = `\\\\${url.hostname}${path}`;
        }
        return path;
    }
    function toFileUrl(path) {
        if (!isAbsolute(path)) {
            throw new TypeError("Must be an absolute path.");
        }
        const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\][^/\\]))?(.*)/);
        const url = new URL("file:///");
        url.pathname = pathname.replace(/%/g, "%25");
        if (hostname != null) {
            url.hostname = hostname;
            if (!url.hostname) {
                throw new TypeError("Invalid hostname.");
            }
        }
        return url;
    }
    return {
        sep,
        delimiter,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        toNamespacedPath,
        dirname,
        basename,
        extname,
        format,
        parse,
        fromFileUrl,
        toFileUrl
    };
}();
const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const SEP = isWindows ? "\\" : "/";
const SEP1 = SEP;
const SEP2 = SEP1;
const SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
const SEP_PATTERN1 = SEP_PATTERN;
const path1 = isWindows ? mod1 : mod;
const { basename , delimiter , dirname , extname , format , fromFileUrl , isAbsolute , join: join1 , normalize , parse , relative , resolve , sep , toFileUrl , toNamespacedPath ,  } = path1;
const regExpEscapeChars = [
    "!",
    "$",
    "(",
    ")",
    "*",
    "+",
    ".",
    "=",
    "?",
    "[",
    "\\",
    "^",
    "{",
    "|"
];
const rangeEscapeChars = [
    "-",
    "\\",
    "]"
];
function normalizeGlob(glob, { globstar =false  } = {
}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize(glob);
    }
    const s = SEP_PATTERN1.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path1, base) {
            return commonjsRequire(path1, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function getDefaultExportFromNamespaceIfNotNamed(n) {
    return n && Object.prototype.hasOwnProperty.call(n, "default") && Object.keys(n).length === 1 ? n["default"] : n;
}
function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var types = createCommonjsModule(function(module, exports) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
});
var util = createCommonjsModule(function(module, exports) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.decodePtrInit = exports.pickDecoder = exports.looksLikeFragment = exports.unsetValueAtPath = exports.setValueAtPath = exports.compilePointerDereference = exports.toArrayIndexReference = exports.encodeUriFragmentIdentifier = exports.decodeUriFragmentIdentifier = exports.encodePointer = exports.decodePointer = exports.encodePointerSegments = exports.decodePointerSegments = exports.encodeFragmentSegments = exports.decodeFragmentSegments = exports.replace = void 0;
    function replace2(source, find, repl) {
        let res = "";
        let rem = source;
        let beg = 0;
        let end = -1;
        while((end = rem.indexOf(find)) > -1){
            res += source.substring(beg, beg + end) + repl;
            rem = rem.substring(end + find.length, rem.length);
            beg += end + find.length;
        }
        if (rem.length > 0) {
            res += source.substring(source.length - rem.length, source.length);
        }
        return res;
    }
    exports.replace = replace2;
    function decodeFragmentSegments2(segments) {
        let i = -1;
        const len = segments.length;
        const res = new Array(len);
        while((++i) < len){
            if (typeof segments[i] === "string") {
                res[i] = replace2(replace2(decodeURIComponent(segments[i]), "~1", "/"), "~0", "~");
            } else {
                res[i] = segments[i];
            }
        }
        return res;
    }
    exports.decodeFragmentSegments = decodeFragmentSegments2;
    function encodeFragmentSegments2(segments) {
        let i = -1;
        const len = segments.length;
        const res = new Array(len);
        while((++i) < len){
            if (typeof segments[i] === "string") {
                res[i] = encodeURIComponent(replace2(replace2(segments[i], "~", "~0"), "/", "~1"));
            } else {
                res[i] = segments[i];
            }
        }
        return res;
    }
    exports.encodeFragmentSegments = encodeFragmentSegments2;
    function decodePointerSegments2(segments) {
        let i = -1;
        const len = segments.length;
        const res = new Array(len);
        while((++i) < len){
            if (typeof segments[i] === "string") {
                res[i] = replace2(replace2(segments[i], "~1", "/"), "~0", "~");
            } else {
                res[i] = segments[i];
            }
        }
        return res;
    }
    exports.decodePointerSegments = decodePointerSegments2;
    function encodePointerSegments2(segments) {
        let i = -1;
        const len = segments.length;
        const res = new Array(len);
        while((++i) < len){
            if (typeof segments[i] === "string") {
                res[i] = replace2(replace2(segments[i], "~", "~0"), "/", "~1");
            } else {
                res[i] = segments[i];
            }
        }
        return res;
    }
    exports.encodePointerSegments = encodePointerSegments2;
    function decodePointer2(ptr) {
        if (typeof ptr !== "string") {
            throw new TypeError("Invalid type: JSON Pointers are represented as strings.");
        }
        if (ptr.length === 0) {
            return [];
        }
        if (ptr[0] !== "/") {
            throw new ReferenceError("Invalid JSON Pointer syntax. Non-empty pointer must begin with a solidus `/`.");
        }
        return decodePointerSegments2(ptr.substring(1).split("/"));
    }
    exports.decodePointer = decodePointer2;
    function encodePointer2(path1) {
        if (!path1 || path1 && !Array.isArray(path1)) {
            throw new TypeError("Invalid type: path must be an array of segments.");
        }
        if (path1.length === 0) {
            return "";
        }
        return "/".concat(encodePointerSegments2(path1).join("/"));
    }
    exports.encodePointer = encodePointer2;
    function decodeUriFragmentIdentifier2(ptr) {
        if (typeof ptr !== "string") {
            throw new TypeError("Invalid type: JSON Pointers are represented as strings.");
        }
        if (ptr.length === 0 || ptr[0] !== "#") {
            throw new ReferenceError("Invalid JSON Pointer syntax; URI fragment identifiers must begin with a hash.");
        }
        if (ptr.length === 1) {
            return [];
        }
        if (ptr[1] !== "/") {
            throw new ReferenceError("Invalid JSON Pointer syntax.");
        }
        return decodeFragmentSegments2(ptr.substring(2).split("/"));
    }
    exports.decodeUriFragmentIdentifier = decodeUriFragmentIdentifier2;
    function encodeUriFragmentIdentifier2(path1) {
        if (!path1 || path1 && !Array.isArray(path1)) {
            throw new TypeError("Invalid type: path must be an array of segments.");
        }
        if (path1.length === 0) {
            return "#";
        }
        return "#/".concat(encodeFragmentSegments2(path1).join("/"));
    }
    exports.encodeUriFragmentIdentifier = encodeUriFragmentIdentifier2;
    function toArrayIndexReference2(arr, idx) {
        if (typeof idx === "number") return idx;
        const len = idx.length;
        if (!len) return -1;
        let cursor = 0;
        if (len === 1 && idx[0] === "-") {
            if (!Array.isArray(arr)) {
                return 0;
            }
            return arr.length;
        }
        while((++cursor) < len){
            if (idx[cursor] < "0" || idx[cursor] > "9") {
                return -1;
            }
        }
        return parseInt(idx, 10);
    }
    exports.toArrayIndexReference = toArrayIndexReference2;
    function compilePointerDereference2(path1) {
        let body = "if (typeof(it) !== 'undefined'";
        if (path1.length === 0) {
            return (it)=>it
            ;
        }
        body = path1.reduce((body2, _, i)=>{
            return body2 + " && \n	typeof((it = it['" + replace2(path1[i] + "", "\\", "\\\\") + "'])) !== 'undefined'";
        }, "if (typeof(it) !== 'undefined'");
        body = body + ") {\n	return it;\n }";
        return new Function("it", body);
    }
    exports.compilePointerDereference = compilePointerDereference2;
    function setValueAtPath2(target, val, path1, force = false) {
        if (path1.length === 0) {
            throw new Error("Cannot set the root object; assign it directly.");
        }
        if (typeof target === "undefined") {
            throw new TypeError("Cannot set values on undefined");
        }
        let it = target;
        const len = path1.length;
        const end = path1.length - 1;
        let step;
        let cursor = -1;
        let rem;
        let p;
        while((++cursor) < len){
            step = path1[cursor];
            if (step === "__proto__" || step === "constructor" || step === "prototype") {
                throw new Error("Attempted prototype pollution disallowed.");
            }
            if (Array.isArray(it)) {
                if (step === "-" && cursor === end) {
                    it.push(val);
                    return void 0;
                }
                p = toArrayIndexReference2(it, step);
                if (it.length > p) {
                    if (cursor === end) {
                        rem = it[p];
                        it[p] = val;
                        break;
                    }
                    it = it[p];
                } else if (cursor === end && p === it.length) {
                    if (force) {
                        it.push(val);
                        return void 0;
                    }
                } else if (force) {
                    it = it[p] = cursor === end ? val : {
                    };
                }
            } else {
                if (typeof it[step] === "undefined") {
                    if (force) {
                        if (cursor === end) {
                            it[step] = val;
                            return void 0;
                        }
                        if (toArrayIndexReference2(it[step], path1[cursor + 1]) !== -1) {
                            it = it[step] = [];
                            continue;
                        }
                        it = it[step] = {
                        };
                        continue;
                    }
                    return void 0;
                }
                if (cursor === end) {
                    rem = it[step];
                    it[step] = val;
                    break;
                }
                it = it[step];
            }
        }
        return rem;
    }
    exports.setValueAtPath = setValueAtPath2;
    function unsetValueAtPath2(target, path1) {
        if (path1.length === 0) {
            throw new Error("Cannot unset the root object; assign it directly.");
        }
        if (typeof target === "undefined") {
            throw new TypeError("Cannot unset values on undefined");
        }
        let it = target;
        const len = path1.length;
        const end = path1.length - 1;
        let step;
        let cursor = -1;
        let rem;
        let p;
        while((++cursor) < len){
            step = path1[cursor];
            if (Array.isArray(it)) {
                p = toArrayIndexReference2(it, step);
                if (p >= it.length) return void 0;
                if (cursor === end) {
                    rem = it[p];
                    delete it[p];
                    break;
                }
                it = it[p];
            } else {
                if (typeof it[step] === "undefined") {
                    return void 0;
                }
                if (cursor === end) {
                    rem = it[step];
                    delete it[step];
                    break;
                }
                it = it[step];
            }
        }
        return rem;
    }
    exports.unsetValueAtPath = unsetValueAtPath2;
    function looksLikeFragment2(ptr) {
        return (ptr === null || ptr === void 0 ? void 0 : ptr.length) > 0 && ptr[0] === "#";
    }
    exports.looksLikeFragment = looksLikeFragment2;
    function pickDecoder2(ptr) {
        return looksLikeFragment2(ptr) ? decodeUriFragmentIdentifier2 : decodePointer2;
    }
    exports.pickDecoder = pickDecoder2;
    function decodePtrInit2(ptr) {
        return Array.isArray(ptr) ? ptr.slice(0) : pickDecoder2(ptr)(ptr);
    }
    exports.decodePtrInit = decodePtrInit2;
});
var pointer = createCommonjsModule(function(module, exports) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.JsonReference = exports.JsonPointer = void 0;
    function isObject(value) {
        return typeof value === "object" && value !== null;
    }
    function shouldDescend(obj) {
        return isObject(obj) && !JsonReference2.isReference(obj);
    }
    function descendingVisit(target, visitor, encoder) {
        const distinctObjects = new Map();
        const q = [
            {
                obj: target,
                path: []
            }
        ];
        while(q.length){
            const { obj , path: path1  } = q.shift();
            visitor(encoder(path1), obj);
            if (shouldDescend(obj)) {
                distinctObjects.set(obj, new JsonPointer2(util.encodeUriFragmentIdentifier(path1)));
                if (!Array.isArray(obj)) {
                    const keys = Object.keys(obj);
                    const len = keys.length;
                    let i = -1;
                    while((++i) < len){
                        const it = obj[keys[i]];
                        if (isObject(it) && distinctObjects.has(it)) {
                            q.push({
                                obj: new JsonReference2(distinctObjects.get(it)),
                                path: path1.concat(keys[i])
                            });
                        } else {
                            q.push({
                                obj: it,
                                path: path1.concat(keys[i])
                            });
                        }
                    }
                } else {
                    let j = -1;
                    const len = obj.length;
                    while((++j) < len){
                        const it = obj[j];
                        if (isObject(it) && distinctObjects.has(it)) {
                            q.push({
                                obj: new JsonReference2(distinctObjects.get(it)),
                                path: path1.concat([
                                    j + ""
                                ])
                            });
                        } else {
                            q.push({
                                obj: it,
                                path: path1.concat([
                                    j + ""
                                ])
                            });
                        }
                    }
                }
            }
        }
    }
    const $ptr = Symbol("pointer");
    const $frg = Symbol("fragmentId");
    const $get = Symbol("getter");
    class JsonPointer2 {
        constructor(ptr1){
            this.path = util.decodePtrInit(ptr1);
        }
        static create(pointer2) {
            return new JsonPointer2(pointer2);
        }
        static has(target, pointer2) {
            if (typeof pointer2 === "string" || Array.isArray(pointer2)) {
                pointer2 = new JsonPointer2(pointer2);
            }
            return pointer2.has(target);
        }
        static get(target, pointer2) {
            if (typeof pointer2 === "string" || Array.isArray(pointer2)) {
                pointer2 = new JsonPointer2(pointer2);
            }
            return pointer2.get(target);
        }
        static set(target, pointer2, val, force = false) {
            if (typeof pointer2 === "string" || Array.isArray(pointer2)) {
                pointer2 = new JsonPointer2(pointer2);
            }
            return pointer2.set(target, val, force);
        }
        static unset(target, pointer2) {
            if (typeof pointer2 === "string" || Array.isArray(pointer2)) {
                pointer2 = new JsonPointer2(pointer2);
            }
            return pointer2.unset(target);
        }
        static decode(pointer2) {
            return util.pickDecoder(pointer2)(pointer2);
        }
        static visit(target, visitor, fragmentId = false) {
            descendingVisit(target, visitor, fragmentId ? util.encodeUriFragmentIdentifier : util.encodePointer);
        }
        static listPointers(target) {
            const res = [];
            descendingVisit(target, (pointer2, value)=>{
                res.push({
                    pointer: pointer2,
                    value
                });
            }, util.encodePointer);
            return res;
        }
        static listFragmentIds(target) {
            const res = [];
            descendingVisit(target, (fragmentId, value)=>{
                res.push({
                    fragmentId,
                    value
                });
            }, util.encodeUriFragmentIdentifier);
            return res;
        }
        static flatten(target, fragmentId = false) {
            const res = {
            };
            descendingVisit(target, (p, v)=>{
                res[p] = v;
            }, fragmentId ? util.encodeUriFragmentIdentifier : util.encodePointer);
            return res;
        }
        static map(target, fragmentId = false) {
            const res = new Map();
            descendingVisit(target, res.set.bind(res), fragmentId ? util.encodeUriFragmentIdentifier : util.encodePointer);
            return res;
        }
        get(target) {
            if (!this[$get]) {
                this[$get] = util.compilePointerDereference(this.path);
            }
            return this[$get](target);
        }
        set(target, value, force = false) {
            return util.setValueAtPath(target, value, this.path, force);
        }
        unset(target) {
            return util.unsetValueAtPath(target, this.path);
        }
        has(target) {
            return typeof this.get(target) !== "undefined";
        }
        concat(ptr) {
            return new JsonPointer2(this.path.concat(ptr instanceof JsonPointer2 ? ptr.path : util.decodePtrInit(ptr)));
        }
        get pointer() {
            if (this[$ptr] === void 0) {
                this[$ptr] = util.encodePointer(this.path);
            }
            return this[$ptr];
        }
        get uriFragmentIdentifier() {
            if (!this[$frg]) {
                this[$frg] = util.encodeUriFragmentIdentifier(this.path);
            }
            return this[$frg];
        }
        toString() {
            return this.pointer;
        }
    }
    exports.JsonPointer = JsonPointer2;
    const $pointer = Symbol("pointer");
    class JsonReference2 {
        constructor(pointer2){
            this[$pointer] = pointer2 instanceof JsonPointer2 ? pointer2 : new JsonPointer2(pointer2);
            this.$ref = this[$pointer].uriFragmentIdentifier;
        }
        static isReference(candidate) {
            if (!candidate) return false;
            const ref = candidate;
            return typeof ref.$ref === "string" && typeof ref.resolve === "function";
        }
        resolve(target) {
            return this[$pointer].get(target);
        }
        pointer() {
            return this[$pointer];
        }
        toString() {
            return this.$ref;
        }
    }
    exports.JsonReference = JsonReference2;
});
const mod2 = function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
        } || function(d2, b2) {
            for(var p in b2)if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    const __extends1 = __extends;
    var __assign = function() {
        __assign = Object.assign || function __assign2(t) {
            for(var s, i = 1, n = arguments.length; i < n; i++){
                s = arguments[i];
                for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    const __assign1 = __assign;
    function __rest(s, e) {
        var t = {
        };
        for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    }
    const __rest1 = __rest;
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    const __decorate1 = __decorate;
    function __param(paramIndex, decorator) {
        return function(target, key) {
            decorator(target, key, paramIndex);
        };
    }
    const __param1 = __param;
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }
    const __metadata1 = __metadata;
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P(function(resolve1) {
                resolve1(value);
            });
        }
        return new (P || (P = Promise))(function(resolve1, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve1(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    const __awaiter1 = __awaiter;
    function __generator(thisArg, body) {
        var _ = {
            label: 0,
            sent: function() {
                if (t[0] & 1) throw t[1];
                return t[1];
            },
            trys: [],
            ops: []
        }, f, y, t, g;
        return g = {
            next: verb(0),
            throw: verb(1),
            return: verb(2)
        }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
            return this;
        }), g;
        function verb(n) {
            return function(v) {
                return step([
                    n,
                    v
                ]);
            };
        }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while(_)try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [
                    op[0] & 2,
                    t.value
                ];
                switch(op[0]){
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return {
                            value: op[1],
                            done: false
                        };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [
                            0
                        ];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2]) _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            } catch (e) {
                op = [
                    6,
                    e
                ];
                y = 0;
            } finally{
                f = t = 0;
            }
            if (op[0] & 5) throw op[1];
            return {
                value: op[0] ? op[1] : void 0,
                done: true
            };
        }
    }
    const __generator1 = __generator;
    var __createBinding = Object.create ? function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        Object.defineProperty(o, k2, {
            enumerable: true,
            get: function() {
                return m[k];
            }
        });
    } : function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
    };
    const __createBinding1 = __createBinding;
    function __exportStar(m, o) {
        for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    }
    const __exportStar1 = __exportStar;
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function() {
                if (o && i >= o.length) o = void 0;
                return {
                    value: o && o[i++],
                    done: !o
                };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    const __values1 = __values;
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while((n === void 0 || (n--) > 0) && !(r = i.next()).done)ar.push(r.value);
        } catch (error) {
            e = {
                error
            };
        } finally{
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            } finally{
                if (e) throw e.error;
            }
        }
        return ar;
    }
    const __read1 = __read;
    function __spread() {
        for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    const __spread1 = __spread;
    function __spreadArrays() {
        for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
        for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
        return r;
    }
    const __spreadArrays1 = __spreadArrays;
    function __spreadArray(to, from) {
        for(var i = 0, il = from.length, j = to.length; i < il; i++, j++)to[j] = from[i];
        return to;
    }
    const __spreadArray1 = __spreadArray;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    const __await1 = __await;
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {
        }, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
            return this;
        }, i;
        function verb(n) {
            if (g[n]) i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
        }
        function resume(n, v) {
            try {
                step(g[n](v));
            } catch (e) {
                settle(q[0][3], e);
            }
        }
        function step(r) {
            r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
        }
        function fulfill(value) {
            resume("next", value);
        }
        function reject(value) {
            resume("throw", value);
        }
        function settle(f, v) {
            if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
        }
    }
    const __asyncGenerator1 = __asyncGenerator;
    function __asyncDelegator(o) {
        var i, p;
        return i = {
        }, verb("next"), verb("throw", function(e) {
            throw e;
        }), verb("return"), i[Symbol.iterator] = function() {
            return this;
        }, i;
        function verb(n, f) {
            i[n] = o[n] ? function(v) {
                return (p = !p) ? {
                    value: __await(o[n](v)),
                    done: n === "return"
                } : f ? f(v) : v;
            } : f;
        }
    }
    const __asyncDelegator1 = __asyncDelegator;
    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {
        }, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
            return this;
        }, i);
        function verb(n) {
            i[n] = o[n] && function(v) {
                return new Promise(function(resolve1, reject) {
                    v = o[n](v), settle(resolve1, reject, v.done, v.value);
                });
            };
        }
        function settle(resolve1, reject, d, v) {
            Promise.resolve(v).then(function(v2) {
                resolve1({
                    value: v2,
                    done: d
                });
            }, reject);
        }
    }
    const __asyncValues1 = __asyncValues;
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", {
                value: raw
            });
        } else {
            cooked.raw = raw;
        }
        return cooked;
    }
    const __makeTemplateObject1 = __makeTemplateObject;
    var __setModuleDefault = Object.create ? function(o, v) {
        Object.defineProperty(o, "default", {
            enumerable: true,
            value: v
        });
    } : function(o, v) {
        o["default"] = v;
    };
    function __importStar(mod3) {
        if (mod3 && mod3.__esModule) return mod3;
        var result = {
        };
        if (mod3 != null) {
            for(var k in mod3)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod3, k)) __createBinding(result, mod3, k);
        }
        __setModuleDefault(result, mod3);
        return result;
    }
    const __importStar1 = __importStar;
    function __importDefault(mod3) {
        return mod3 && mod3.__esModule ? mod3 : {
            default: mod3
        };
    }
    const __importDefault1 = __importDefault;
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    const __classPrivateFieldGet1 = __classPrivateFieldGet;
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }
    const __classPrivateFieldSet1 = __classPrivateFieldSet;
    return {
        __assign: __assign,
        __asyncDelegator: __asyncDelegator,
        __asyncGenerator: __asyncGenerator,
        __asyncValues: __asyncValues,
        __await: __await,
        __awaiter: __awaiter,
        __classPrivateFieldGet: __classPrivateFieldGet,
        __classPrivateFieldSet: __classPrivateFieldSet,
        __createBinding: __createBinding,
        __decorate: __decorate,
        __exportStar: __exportStar,
        __extends: __extends,
        __generator: __generator,
        __importDefault: __importDefault,
        __importStar: __importStar,
        __makeTemplateObject: __makeTemplateObject,
        __metadata: __metadata,
        __param: __param,
        __read: __read,
        __rest: __rest,
        __spread: __spread,
        __spreadArray: __spreadArray,
        __spreadArrays: __spreadArrays,
        __values: __values
    };
}();
var tslib_1 = getDefaultExportFromNamespaceIfNotNamed(mod2);
var dist = createCommonjsModule(function(module, exports) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    tslib_1.__exportStar(types, exports);
    tslib_1.__exportStar(util, exports);
    tslib_1.__exportStar(pointer, exports);
});
var JsonPointer = dist.JsonPointer;
const JsonPointer1 = JsonPointer;
const identityReplacer = (k, v)=>v
;
const { isArray  } = Array;
const isPlainObject = (value)=>value && typeof value === `object` && !isArray(value)
;
const pipeSecondArg = (replacers)=>function(k, v) {
        return replacers.reduce((acc, fn)=>fn.call(this, k, acc)
        , v);
    }
;
const pipeReplacers = (replacers)=>replacers.length === 0 ? undefined : replacers.length === 1 ? replacers[0] : pipeSecondArg(replacers)
;
const printType1 = Object.prototype.toString;
const maxDepthReplacer = (maxDepth)=>{
    if (maxDepth === 0) {
        return identityReplacer;
    }
    if (maxDepth === 1) {
        return (k, v)=>k !== `` && v && typeof v === `object` ? printType1.call(v) : v
        ;
    }
    const depthTrack = new Map();
    return function(k, v) {
        const currentDepth = depthTrack.get(this) || 0;
        if (v && typeof v === `object`) {
            if (currentDepth >= maxDepth) {
                return printType1.call(v);
            }
            depthTrack.set(v, currentDepth + 1);
        }
        return v;
    };
};
const serializeMapReplacer = (k, v)=>v && v instanceof Map ? Object.fromEntries(v.entries()) : v
;
const replacerFromOptions = ({ maxDepth , supportMap  })=>pipeReplacers([
        supportMap && serializeMapReplacer,
        maxDepth && maxDepthReplacer(maxDepth)
    ].filter(Boolean))
;
const stringify = (value, replacer, space)=>JSON.stringify(value, isPlainObject(replacer) ? replacerFromOptions(replacer) : replacer, space)
;
const stringify1 = stringify;
const log = (...args)=>console.log(...args)
;
function validateSchema(schema) {
    assertSchema(schema);
    if (schema.__validationErrors) {
        return schema.__validationErrors;
    }
    const context = new SchemaValidationContext(schema);
    validateRootTypes(context);
    validateDirectives(context);
    validateTypes(context);
    const errors = context.getErrors();
    schema.__validationErrors = errors;
    return errors;
}
function parse1(source, options) {
    const parser = new Parser(source, options);
    return parser.parseDocument();
}
function devAssert(condition, message1) {
    const booleanCondition = Boolean(condition);
    if (!booleanCondition) {
        throw new Error(message1);
    }
}
function assertValidSchema(schema) {
    const errors = validateSchema(schema);
    if (errors.length !== 0) {
        throw new Error(errors.map((error)=>error.message
        ).join('\n\n'));
    }
}
function validate(schema, documentAST, rules = specifiedRules, typeInfo = new TypeInfo(schema), options = {
    maxErrors: undefined
}) {
    devAssert(documentAST, 'Must provide document.');
    assertValidSchema(schema);
    const abortObj = Object.freeze({
    });
    const errors = [];
    const context = new ValidationContext(schema, documentAST, typeInfo, (error)=>{
        if (options.maxErrors != null && errors.length >= options.maxErrors) {
            errors.push(new GraphQLError('Too many validation errors, error limit reached. Validation aborted.'));
            throw abortObj;
        }
        errors.push(error);
    });
    const visitor = visitInParallel(rules.map((rule)=>rule(context)
    ));
    try {
        visit(documentAST, visitWithTypeInfo(typeInfo, visitor));
    } catch (e) {
        if (e !== abortObj) {
            throw e;
        }
    }
    return errors;
}
function execute(argsOrSchema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver) {
    return arguments.length === 1 ? executeImpl(argsOrSchema) : executeImpl({
        schema: argsOrSchema,
        document,
        rootValue,
        contextValue,
        variableValues,
        operationName,
        fieldResolver,
        typeResolver
    });
}
function inspect(value) {
    return formatValue(value, []);
}
function isObjectLike(value) {
    return typeof value == 'object' && value !== null;
}
const objectEntries = Object.entries || ((obj)=>Object.keys(obj).map((key)=>[
            key,
            obj[key]
        ]
    )
);
const objectEntries1 = objectEntries;
function isDirective(directive) {
    return __default(directive, GraphQLDirective);
}
function assertDirective(directive) {
    if (!isDirective(directive)) {
        throw new Error(`Expected ${inspect(directive)} to be a GraphQL directive.`);
    }
    return directive;
}
const toObjMap = __default;
const SYMBOL_ITERATOR = typeof Symbol === 'function' ? Symbol.iterator : '@@iterator';
const SYMBOL_ASYNC_ITERATOR = typeof Symbol === 'function' ? Symbol.asyncIterator : '@@asyncIterator';
const nodejsCustomInspectSymbol = typeof Symbol === 'function' && typeof Symbol.for === 'function' ? Symbol.for('nodejs.util.inspect.custom') : undefined;
const nodejsCustomInspectSymbol1 = nodejsCustomInspectSymbol;
function defineToJSON(classObject, fn = classObject.prototype.toString) {
    classObject.prototype.toJSON = fn;
    classObject.prototype.inspect = fn;
    if (nodejsCustomInspectSymbol) {
        classObject.prototype[nodejsCustomInspectSymbol1] = fn;
    }
}
const MIN_INT = -2147483648;
const isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};
function serializeInt(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === 'boolean') {
        return coercedValue ? 1 : 0;
    }
    let num = coercedValue;
    if (typeof coercedValue === 'string' && coercedValue !== '') {
        num = Number(coercedValue);
    }
    if (!isInteger(num)) {
        throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(coercedValue)}`);
    }
    if (num > 2147483647 || num < MIN_INT) {
        throw new GraphQLError('Int cannot represent non 32-bit signed integer value: ' + inspect(coercedValue));
    }
    return num;
}
function coerceInt(inputValue) {
    if (!isInteger(inputValue)) {
        throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(inputValue)}`);
    }
    if (inputValue > 2147483647 || inputValue < MIN_INT) {
        throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${inputValue}`);
    }
    return inputValue;
}
const GraphQLInt = new GraphQLScalarType({
    name: 'Int',
    description: 'The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.',
    serialize: serializeInt,
    parseValue: coerceInt,
    parseLiteral (valueNode) {
        if (valueNode.kind !== Kind.INT) {
            throw new GraphQLError(`Int cannot represent non-integer value: ${print(valueNode)}`, valueNode);
        }
        const num = parseInt(valueNode.value, 10);
        if (num > 2147483647 || num < MIN_INT) {
            throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${valueNode.value}`, valueNode);
        }
        return num;
    }
});
const isFinitePolyfill = Number.isFinite || function(value) {
    return typeof value === 'number' && isFinite(value);
};
function serializeFloat(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === 'boolean') {
        return coercedValue ? 1 : 0;
    }
    let num = coercedValue;
    if (typeof coercedValue === 'string' && coercedValue !== '') {
        num = Number(coercedValue);
    }
    if (!isFinitePolyfill(num)) {
        throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(coercedValue)}`);
    }
    return num;
}
function coerceFloat(inputValue) {
    if (!isFinitePolyfill(inputValue)) {
        throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(inputValue)}`);
    }
    return inputValue;
}
const GraphQLFloat = new GraphQLScalarType({
    name: 'Float',
    description: 'The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).',
    serialize: serializeFloat,
    parseValue: coerceFloat,
    parseLiteral (valueNode) {
        if (valueNode.kind !== Kind.FLOAT && valueNode.kind !== Kind.INT) {
            throw new GraphQLError(`Float cannot represent non numeric value: ${print(valueNode)}`, valueNode);
        }
        return parseFloat(valueNode.value);
    }
});
const SYMBOL_TO_STRING_TAG = typeof Symbol === 'function' ? Symbol.toStringTag : '@@toStringTag';
function serializeObject(outputValue) {
    if (isObjectLike(outputValue)) {
        if (typeof outputValue.valueOf === 'function') {
            const valueOfResult = outputValue.valueOf();
            if (!isObjectLike(valueOfResult)) {
                return valueOfResult;
            }
        }
        if (typeof outputValue.toJSON === 'function') {
            return outputValue.toJSON();
        }
    }
    return outputValue;
}
function serializeString(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === 'string') {
        return coercedValue;
    }
    if (typeof coercedValue === 'boolean') {
        return coercedValue ? 'true' : 'false';
    }
    if (isFinitePolyfill(coercedValue)) {
        return coercedValue.toString();
    }
    throw new GraphQLError(`String cannot represent value: ${inspect(outputValue)}`);
}
function coerceString(inputValue) {
    if (typeof inputValue !== 'string') {
        throw new GraphQLError(`String cannot represent a non string value: ${inspect(inputValue)}`);
    }
    return inputValue;
}
const GraphQLString = new GraphQLScalarType({
    name: 'String',
    description: 'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.',
    serialize: serializeString,
    parseValue: coerceString,
    parseLiteral (valueNode) {
        if (valueNode.kind !== Kind.STRING) {
            throw new GraphQLError(`String cannot represent a non string value: ${print(valueNode)}`, valueNode);
        }
        return valueNode.value;
    }
});
const specifiedDirectives = Object.freeze([
    GraphQLIncludeDirective,
    GraphQLSkipDirective,
    GraphQLDeprecatedDirective
]);
const objectValues = Object.values || ((obj)=>Object.keys(obj).map((key)=>obj[key]
    )
);
const __Schema = new GraphQLObjectType({
    name: '__Schema',
    description: 'A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.',
    fields: ()=>({
            description: {
                type: GraphQLString,
                resolve: (schema)=>schema.description
            },
            types: {
                description: 'A list of all types supported by this server.',
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(__Type))),
                resolve (schema) {
                    return objectValues(schema.getTypeMap());
                }
            },
            queryType: {
                description: 'The type that query operations will be rooted at.',
                type: GraphQLNonNull(__Type),
                resolve: (schema)=>schema.getQueryType()
            },
            mutationType: {
                description: 'If this server supports mutation, the type that mutation operations will be rooted at.',
                type: __Type,
                resolve: (schema)=>schema.getMutationType()
            },
            subscriptionType: {
                description: 'If this server support subscription, the type that subscription operations will be rooted at.',
                type: __Type,
                resolve: (schema)=>schema.getSubscriptionType()
            },
            directives: {
                description: 'A list of all directives supported by this server.',
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(__Directive))),
                resolve: (schema)=>schema.getDirectives()
            }
        })
});
const arrayFrom = Array.from || function(obj, mapFn, thisArg) {
    if (obj == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    const iteratorMethod = obj[SYMBOL_ITERATOR];
    if (typeof iteratorMethod === 'function') {
        const iterator = iteratorMethod.call(obj);
        const result = [];
        let step;
        for(let i = 0; !(step = iterator.next()).done; ++i){
            result.push(mapFn.call(thisArg, step.value, i));
            if (i > 9999999) {
                throw new TypeError('Near-infinite iteration.');
            }
        }
        return result;
    }
    const length = obj.length;
    if (typeof length === 'number' && length >= 0 && length % 1 === 0) {
        const result = [];
        for(let i = 0; i < length; ++i){
            if (Object.prototype.hasOwnProperty.call(obj, i)) {
                result.push(mapFn.call(thisArg, obj[i], i));
            }
        }
        return result;
    }
    return [];
};
function keyValMap(list, keyFn, valFn) {
    return list.reduce((map, item)=>{
        map[keyFn(item)] = valFn(item);
        return map;
    }, Object.create(null));
}
function invariant(condition, message1) {
    const booleanCondition = Boolean(condition);
    if (!booleanCondition) {
        throw new Error(message1 != null ? message1 : 'Unexpected invariant triggered.');
    }
}
function valueFromASTUntyped(valueNode, variables) {
    switch(valueNode.kind){
        case Kind.NULL:
            return null;
        case Kind.INT:
            return parseInt(valueNode.value, 10);
        case Kind.FLOAT:
            return parseFloat(valueNode.value);
        case Kind.STRING:
        case Kind.ENUM:
        case Kind.BOOLEAN:
            return valueNode.value;
        case Kind.LIST:
            return valueNode.values.map((node)=>valueFromASTUntyped(node, variables)
            );
        case Kind.OBJECT:
            return keyValMap(valueNode.fields, (field)=>field.name.value
            , (field)=>valueFromASTUntyped(field.value, variables)
            );
        case Kind.VARIABLE:
            return variables?.[valueNode.name.value];
    }
    invariant(false, 'Unexpected value node: ' + inspect(valueNode));
}
function getLocation(source, position) {
    const lineRegexp = /\r\n|[\n\r]/g;
    let line = 1;
    let column = position + 1;
    let match;
    while((match = lineRegexp.exec(source.body)) && match.index < position){
        line += 1;
        column = position + 1 - (match.index + match[0].length);
    }
    return {
        line,
        column
    };
}
function printLocation(location) {
    return printSourceLocation(location.source, getLocation(location.source, location.start));
}
function printSourceLocation(source, sourceLocation) {
    const firstLineColumnOffset = source.locationOffset.column - 1;
    const body = whitespace(firstLineColumnOffset) + source.body;
    const lineIndex = sourceLocation.line - 1;
    const lineOffset = source.locationOffset.line - 1;
    const lineNum = sourceLocation.line + lineOffset;
    const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
    const columnNum = sourceLocation.column + columnOffset;
    const locationStr = `${source.name}:${lineNum}:${columnNum}\n`;
    const lines = body.split(/\r\n|[\n\r]/g);
    const locationLine = lines[lineIndex];
    if (locationLine.length > 120) {
        const subLineIndex = Math.floor(columnNum / 80);
        const subLineColumnNum = columnNum % 80;
        const subLines = [];
        for(let i = 0; i < locationLine.length; i += 80){
            subLines.push(locationLine.slice(i, i + 80));
        }
        return locationStr + printPrefixedLines([
            [
                `${lineNum}`,
                subLines[0]
            ],
            ...subLines.slice(1, subLineIndex + 1).map((subLine)=>[
                    '',
                    subLine
                ]
            ),
            [
                ' ',
                whitespace(subLineColumnNum - 1) + '^'
            ],
            [
                '',
                subLines[subLineIndex + 1]
            ]
        ]);
    }
    return locationStr + printPrefixedLines([
        [
            `${lineNum - 1}`,
            lines[lineIndex - 1]
        ],
        [
            `${lineNum}`,
            locationLine
        ],
        [
            '',
            whitespace(columnNum - 1) + '^'
        ],
        [
            `${lineNum + 1}`,
            lines[lineIndex + 1]
        ]
    ]);
}
class Location1 {
    constructor(startToken1, endToken, source3){
        this.start = startToken1.start;
        this.end = endToken.end;
        this.startToken = startToken1;
        this.endToken = endToken;
        this.source = source3;
    }
}
defineToJSON(Location1, function() {
    return {
        start: this.start,
        end: this.end
    };
});
class Token {
    constructor(kind1, start, end, line, column, prev, value1){
        this.kind = kind1;
        this.start = start;
        this.end = end;
        this.line = line;
        this.column = column;
        this.value = value1;
        this.prev = prev;
        this.next = null;
    }
}
defineToJSON(Token, function() {
    return {
        kind: this.kind,
        value: this.value,
        line: this.line,
        column: this.column
    };
});
function isNode(maybeNode) {
    return maybeNode != null && typeof maybeNode.kind === 'string';
}
function dedentBlockStringValue(rawString) {
    const lines = rawString.split(/\r\n|[\n\r]/g);
    const commonIndent = getBlockStringIndentation(lines);
    if (commonIndent !== 0) {
        for(let i = 1; i < lines.length; i++){
            lines[i] = lines[i].slice(commonIndent);
        }
    }
    while(lines.length > 0 && isBlank(lines[0])){
        lines.shift();
    }
    while(lines.length > 0 && isBlank(lines[lines.length - 1])){
        lines.pop();
    }
    return lines.join('\n');
}
function getBlockStringIndentation(lines) {
    let commonIndent = null;
    for(let i = 1; i < lines.length; i++){
        const line1 = lines[i];
        const indent = leadingWhitespace(line1);
        if (indent === line1.length) {
            continue;
        }
        if (commonIndent === null || indent < commonIndent) {
            commonIndent = indent;
            if (commonIndent === 0) {
                break;
            }
        }
    }
    return commonIndent === null ? 0 : commonIndent;
}
function leadingWhitespace(str) {
    let i = 0;
    while(i < str.length && (str[i] === ' ' || str[i] === '\t')){
        i++;
    }
    return i;
}
function isBlank(str) {
    return leadingWhitespace(str) === str.length;
}
function printBlockString(value1, indentation = '', preferMultipleLines = false) {
    const isSingleLine = value1.indexOf('\n') === -1;
    const hasLeadingSpace = value1[0] === ' ' || value1[0] === '\t';
    const hasTrailingQuote = value1[value1.length - 1] === '"';
    const printAsMultipleLines = !isSingleLine || hasTrailingQuote || preferMultipleLines;
    let result = '';
    if (printAsMultipleLines && !(isSingleLine && hasLeadingSpace)) {
        result += '\n' + indentation;
    }
    result += indentation ? value1.replace(/\n/g, '\n' + indentation) : value1;
    if (printAsMultipleLines) {
        result += '\n';
    }
    return '"""' + result.replace(/"""/g, '\\"""') + '"""';
}
function suggestionList(input, options) {
    const optionsByDistance = Object.create(null);
    const lexicalDistance = new LexicalDistance(input);
    const threshold = Math.floor(input.length * 0.4) + 1;
    for (const option of options){
        const distance = lexicalDistance.measure(option, threshold);
        if (distance !== undefined) {
            optionsByDistance[option] = distance;
        }
    }
    return Object.keys(optionsByDistance).sort((a, b)=>{
        const distanceDiff = optionsByDistance[a] - optionsByDistance[b];
        return distanceDiff !== 0 ? distanceDiff : a.localeCompare(b);
    });
}
function didYouMean(firstArg, secondArg) {
    const [subMessage, suggestionsArg] = typeof firstArg === 'string' ? [
        firstArg,
        secondArg
    ] : [
        undefined,
        firstArg
    ];
    let message1 = ' Did you mean ';
    if (subMessage) {
        message1 += subMessage + ' ';
    }
    const suggestions = suggestionsArg.map((x)=>`"${x}"`
    );
    switch(suggestions.length){
        case 0:
            return '';
        case 1:
            return message1 + suggestions[0] + '?';
        case 2:
            return message1 + suggestions[0] + ' or ' + suggestions[1] + '?';
    }
    const selected = suggestions.slice(0, 5);
    const lastItem = selected.pop();
    return message1 + selected.join(', ') + ', or ' + lastItem + '?';
}
const find = Array.prototype.find ? function(list, predicate) {
    return Array.prototype.find.call(list, predicate);
} : function(list, predicate) {
    for (const value1 of list){
        if (predicate(value1)) {
            return value1;
        }
    }
};
class GraphQLDirective {
    constructor(config){
        this.name = config.name;
        this.description = config.description;
        this.locations = config.locations;
        this.isRepeatable = config.isRepeatable ?? false;
        this.extensions = config.extensions && toObjMap(config.extensions);
        this.astNode = config.astNode;
        devAssert(config.name, 'Directive must be named.');
        devAssert(Array.isArray(config.locations), `@${config.name} locations must be an Array.`);
        const args = config.args ?? {
        };
        devAssert(isObjectLike(args) && !Array.isArray(args), `@${config.name} args must be an object with argument names as keys.`);
        this.args = objectEntries1(args).map(([argName, argConfig])=>({
                name: argName,
                description: argConfig.description,
                type: argConfig.type,
                defaultValue: argConfig.defaultValue,
                extensions: argConfig.extensions && toObjMap(argConfig.extensions),
                astNode: argConfig.astNode
            })
        );
    }
    toConfig() {
        return {
            name: this.name,
            description: this.description,
            locations: this.locations,
            args: argsToArgsConfig(this.args),
            isRepeatable: this.isRepeatable,
            extensions: this.extensions,
            astNode: this.astNode
        };
    }
    toString() {
        return '@' + this.name;
    }
    get [SYMBOL_TO_STRING_TAG]() {
        return 'GraphQLDirective';
    }
}
defineToJSON(GraphQLDirective);
function serializeBoolean(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === 'boolean') {
        return coercedValue;
    }
    if (isFinitePolyfill(coercedValue)) {
        return coercedValue !== 0;
    }
    throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(coercedValue)}`);
}
function coerceBoolean(inputValue) {
    if (typeof inputValue !== 'boolean') {
        throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(inputValue)}`);
    }
    return inputValue;
}
const GraphQLBoolean = new GraphQLScalarType({
    name: 'Boolean',
    description: 'The `Boolean` scalar type represents `true` or `false`.',
    serialize: serializeBoolean,
    parseValue: coerceBoolean,
    parseLiteral (valueNode) {
        if (valueNode.kind !== Kind.BOOLEAN) {
            throw new GraphQLError(`Boolean cannot represent a non boolean value: ${print(valueNode)}`, valueNode);
        }
        return valueNode.value;
    }
});
const GraphQLIncludeDirective = new GraphQLDirective({
    name: 'include',
    description: 'Directs the executor to include this field or fragment only when the `if` argument is true.',
    locations: [
        DirectiveLocation.FIELD,
        DirectiveLocation.FRAGMENT_SPREAD,
        DirectiveLocation.INLINE_FRAGMENT
    ],
    args: {
        if: {
            type: GraphQLNonNull(GraphQLBoolean),
            description: 'Included when true.'
        }
    }
});
const GraphQLSkipDirective = new GraphQLDirective({
    name: 'skip',
    description: 'Directs the executor to skip this field or fragment when the `if` argument is true.',
    locations: [
        DirectiveLocation.FIELD,
        DirectiveLocation.FRAGMENT_SPREAD,
        DirectiveLocation.INLINE_FRAGMENT
    ],
    args: {
        if: {
            type: GraphQLNonNull(GraphQLBoolean),
            description: 'Skipped when true.'
        }
    }
});
const DEFAULT_DEPRECATION_REASON = 'No longer supported';
const GraphQLDeprecatedDirective = new GraphQLDirective({
    name: 'deprecated',
    description: 'Marks an element of a GraphQL schema as no longer supported.',
    locations: [
        DirectiveLocation.FIELD_DEFINITION,
        DirectiveLocation.ENUM_VALUE
    ],
    args: {
        reason: {
            type: GraphQLString,
            description: 'Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).',
            defaultValue: DEFAULT_DEPRECATION_REASON
        }
    }
});
function isSpecifiedDirective(directive) {
    return specifiedDirectives.some(({ name  })=>name === directive.name
    );
}
function serializeID(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === 'string') {
        return coercedValue;
    }
    if (isInteger(coercedValue)) {
        return String(coercedValue);
    }
    throw new GraphQLError(`ID cannot represent value: ${inspect(outputValue)}`);
}
function coerceID(inputValue) {
    if (typeof inputValue === 'string') {
        return inputValue;
    }
    if (isInteger(inputValue)) {
        return inputValue.toString();
    }
    throw new GraphQLError(`ID cannot represent value: ${inspect(inputValue)}`);
}
const GraphQLID = new GraphQLScalarType({
    name: 'ID',
    description: 'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',
    serialize: serializeID,
    parseValue: coerceID,
    parseLiteral (valueNode) {
        if (valueNode.kind !== Kind.STRING && valueNode.kind !== Kind.INT) {
            throw new GraphQLError('ID cannot represent a non-string and non-integer value: ' + print(valueNode), valueNode);
        }
        return valueNode.value;
    }
});
const specifiedScalarTypes = Object.freeze([
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLID
]);
function isSpecifiedScalarType(type) {
    return specifiedScalarTypes.some(({ name  })=>type.name === name
    );
}
const __Directive = new GraphQLObjectType({
    name: '__Directive',
    description: "A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.\n\nIn some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.",
    fields: ()=>({
            name: {
                type: GraphQLNonNull(GraphQLString),
                resolve: (directive)=>directive.name
            },
            description: {
                type: GraphQLString,
                resolve: (directive)=>directive.description
            },
            isRepeatable: {
                type: GraphQLNonNull(GraphQLBoolean),
                resolve: (directive)=>directive.isRepeatable
            },
            locations: {
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(__DirectiveLocation))),
                resolve: (directive)=>directive.locations
            },
            args: {
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(__InputValue))),
                resolve: (directive)=>directive.args
            }
        })
});
const __DirectiveLocation = new GraphQLEnumType({
    name: '__DirectiveLocation',
    description: 'A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.',
    values: {
        QUERY: {
            value: DirectiveLocation.QUERY,
            description: 'Location adjacent to a query operation.'
        },
        MUTATION: {
            value: DirectiveLocation.MUTATION,
            description: 'Location adjacent to a mutation operation.'
        },
        SUBSCRIPTION: {
            value: DirectiveLocation.SUBSCRIPTION,
            description: 'Location adjacent to a subscription operation.'
        },
        FIELD: {
            value: DirectiveLocation.FIELD,
            description: 'Location adjacent to a field.'
        },
        FRAGMENT_DEFINITION: {
            value: DirectiveLocation.FRAGMENT_DEFINITION,
            description: 'Location adjacent to a fragment definition.'
        },
        FRAGMENT_SPREAD: {
            value: DirectiveLocation.FRAGMENT_SPREAD,
            description: 'Location adjacent to a fragment spread.'
        },
        INLINE_FRAGMENT: {
            value: DirectiveLocation.INLINE_FRAGMENT,
            description: 'Location adjacent to an inline fragment.'
        },
        VARIABLE_DEFINITION: {
            value: DirectiveLocation.VARIABLE_DEFINITION,
            description: 'Location adjacent to a variable definition.'
        },
        SCHEMA: {
            value: DirectiveLocation.SCHEMA,
            description: 'Location adjacent to a schema definition.'
        },
        SCALAR: {
            value: DirectiveLocation.SCALAR,
            description: 'Location adjacent to a scalar definition.'
        },
        OBJECT: {
            value: DirectiveLocation.OBJECT,
            description: 'Location adjacent to an object type definition.'
        },
        FIELD_DEFINITION: {
            value: DirectiveLocation.FIELD_DEFINITION,
            description: 'Location adjacent to a field definition.'
        },
        ARGUMENT_DEFINITION: {
            value: DirectiveLocation.ARGUMENT_DEFINITION,
            description: 'Location adjacent to an argument definition.'
        },
        INTERFACE: {
            value: DirectiveLocation.INTERFACE,
            description: 'Location adjacent to an interface definition.'
        },
        UNION: {
            value: DirectiveLocation.UNION,
            description: 'Location adjacent to a union definition.'
        },
        ENUM: {
            value: DirectiveLocation.ENUM,
            description: 'Location adjacent to an enum definition.'
        },
        ENUM_VALUE: {
            value: DirectiveLocation.ENUM_VALUE,
            description: 'Location adjacent to an enum value definition.'
        },
        INPUT_OBJECT: {
            value: DirectiveLocation.INPUT_OBJECT,
            description: 'Location adjacent to an input object type definition.'
        },
        INPUT_FIELD_DEFINITION: {
            value: DirectiveLocation.INPUT_FIELD_DEFINITION,
            description: 'Location adjacent to an input object field definition.'
        }
    }
});
const __Type = new GraphQLObjectType({
    name: '__Type',
    description: 'The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name and description, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.',
    fields: ()=>({
            kind: {
                type: GraphQLNonNull(__TypeKind),
                resolve (type) {
                    if (isScalarType(type)) {
                        return TypeKind.SCALAR;
                    }
                    if (isObjectType(type)) {
                        return TypeKind.OBJECT;
                    }
                    if (isInterfaceType(type)) {
                        return TypeKind.INTERFACE;
                    }
                    if (isUnionType(type)) {
                        return TypeKind.UNION;
                    }
                    if (isEnumType(type)) {
                        return TypeKind.ENUM;
                    }
                    if (isInputObjectType(type)) {
                        return TypeKind.INPUT_OBJECT;
                    }
                    if (isListType(type)) {
                        return TypeKind.LIST;
                    }
                    if (isNonNullType(type)) {
                        return TypeKind.NON_NULL;
                    }
                    invariant(false, `Unexpected type: "${inspect(type)}".`);
                }
            },
            name: {
                type: GraphQLString,
                resolve: (type)=>type.name !== undefined ? type.name : undefined
            },
            description: {
                type: GraphQLString,
                resolve: (type)=>type.description !== undefined ? type.description : undefined
            },
            fields: {
                type: GraphQLList(GraphQLNonNull(__Field)),
                args: {
                    includeDeprecated: {
                        type: GraphQLBoolean,
                        defaultValue: false
                    }
                },
                resolve (type, { includeDeprecated  }) {
                    if (isObjectType(type) || isInterfaceType(type)) {
                        let fields = objectValues(type.getFields());
                        if (!includeDeprecated) {
                            fields = fields.filter((field)=>!field.isDeprecated
                            );
                        }
                        return fields;
                    }
                    return null;
                }
            },
            interfaces: {
                type: GraphQLList(GraphQLNonNull(__Type)),
                resolve (type) {
                    if (isObjectType(type) || isInterfaceType(type)) {
                        return type.getInterfaces();
                    }
                }
            },
            possibleTypes: {
                type: GraphQLList(GraphQLNonNull(__Type)),
                resolve (type, _args, _context, { schema  }) {
                    if (isAbstractType(type)) {
                        return schema.getPossibleTypes(type);
                    }
                }
            },
            enumValues: {
                type: GraphQLList(GraphQLNonNull(__EnumValue)),
                args: {
                    includeDeprecated: {
                        type: GraphQLBoolean,
                        defaultValue: false
                    }
                },
                resolve (type, { includeDeprecated  }) {
                    if (isEnumType(type)) {
                        let values = type.getValues();
                        if (!includeDeprecated) {
                            values = values.filter((value1)=>!value1.isDeprecated
                            );
                        }
                        return values;
                    }
                }
            },
            inputFields: {
                type: GraphQLList(GraphQLNonNull(__InputValue)),
                resolve (type) {
                    if (isInputObjectType(type)) {
                        return objectValues(type.getFields());
                    }
                }
            },
            ofType: {
                type: __Type,
                resolve: (type)=>type.ofType !== undefined ? type.ofType : undefined
            }
        })
});
const __Field = new GraphQLObjectType({
    name: '__Field',
    description: 'Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.',
    fields: ()=>({
            name: {
                type: GraphQLNonNull(GraphQLString),
                resolve: (field)=>field.name
            },
            description: {
                type: GraphQLString,
                resolve: (field)=>field.description
            },
            args: {
                type: GraphQLNonNull(GraphQLList(GraphQLNonNull(__InputValue))),
                resolve: (field)=>field.args
            },
            type: {
                type: GraphQLNonNull(__Type),
                resolve: (field)=>field.type
            },
            isDeprecated: {
                type: GraphQLNonNull(GraphQLBoolean),
                resolve: (field)=>field.isDeprecated
            },
            deprecationReason: {
                type: GraphQLString,
                resolve: (field)=>field.deprecationReason
            }
        })
});
function isCollection(obj) {
    if (obj == null || typeof obj !== 'object') {
        return false;
    }
    const length = obj.length;
    if (typeof length === 'number' && length >= 0 && length % 1 === 0) {
        return true;
    }
    return typeof obj[SYMBOL_ITERATOR] === 'function';
}
function astFromValue(value1, type) {
    if (isNonNullType(type)) {
        const astValue = astFromValue(value1, type.ofType);
        if (astValue?.kind === Kind.NULL) {
            return null;
        }
        return astValue;
    }
    if (value1 === null) {
        return {
            kind: Kind.NULL
        };
    }
    if (value1 === undefined) {
        return null;
    }
    if (isListType(type)) {
        const itemType = type.ofType;
        if (isCollection(value1)) {
            const valuesNodes = [];
            for (const item of arrayFrom(value1)){
                const itemNode = astFromValue(item, itemType);
                if (itemNode != null) {
                    valuesNodes.push(itemNode);
                }
            }
            return {
                kind: Kind.LIST,
                values: valuesNodes
            };
        }
        return astFromValue(value1, itemType);
    }
    if (isInputObjectType(type)) {
        if (!isObjectLike(value1)) {
            return null;
        }
        const fieldNodes = [];
        for (const field of objectValues(type.getFields())){
            const fieldValue = astFromValue(value1[field.name], field.type);
            if (fieldValue) {
                fieldNodes.push({
                    kind: Kind.OBJECT_FIELD,
                    name: {
                        kind: Kind.NAME,
                        value: field.name
                    },
                    value: fieldValue
                });
            }
        }
        return {
            kind: Kind.OBJECT,
            fields: fieldNodes
        };
    }
    if (isLeafType(type)) {
        const serialized = type.serialize(value1);
        if (serialized == null) {
            return null;
        }
        if (typeof serialized === 'boolean') {
            return {
                kind: Kind.BOOLEAN,
                value: serialized
            };
        }
        if (typeof serialized === 'number' && isFinitePolyfill(serialized)) {
            const stringNum = String(serialized);
            return integerStringRegExp.test(stringNum) ? {
                kind: Kind.INT,
                value: stringNum
            } : {
                kind: Kind.FLOAT,
                value: stringNum
            };
        }
        if (typeof serialized === 'string') {
            if (isEnumType(type)) {
                return {
                    kind: Kind.ENUM,
                    value: serialized
                };
            }
            if (type === GraphQLID && integerStringRegExp.test(serialized)) {
                return {
                    kind: Kind.INT,
                    value: serialized
                };
            }
            return {
                kind: Kind.STRING,
                value: serialized
            };
        }
        throw new TypeError(`Cannot convert value to AST: ${inspect(serialized)}.`);
    }
    invariant(false, 'Unexpected input type: ' + inspect(type));
}
const __InputValue = new GraphQLObjectType({
    name: '__InputValue',
    description: 'Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.',
    fields: ()=>({
            name: {
                type: GraphQLNonNull(GraphQLString),
                resolve: (inputValue)=>inputValue.name
            },
            description: {
                type: GraphQLString,
                resolve: (inputValue)=>inputValue.description
            },
            type: {
                type: GraphQLNonNull(__Type),
                resolve: (inputValue)=>inputValue.type
            },
            defaultValue: {
                type: GraphQLString,
                description: 'A GraphQL-formatted string representing the default value for this input value.',
                resolve (inputValue) {
                    const { type , defaultValue  } = inputValue;
                    const valueAST = astFromValue(defaultValue, type);
                    return valueAST ? print(valueAST) : null;
                }
            }
        })
});
const __EnumValue = new GraphQLObjectType({
    name: '__EnumValue',
    description: 'One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.',
    fields: ()=>({
            name: {
                type: GraphQLNonNull(GraphQLString),
                resolve: (enumValue)=>enumValue.name
            },
            description: {
                type: GraphQLString,
                resolve: (enumValue)=>enumValue.description
            },
            isDeprecated: {
                type: GraphQLNonNull(GraphQLBoolean),
                resolve: (enumValue)=>enumValue.isDeprecated
            },
            deprecationReason: {
                type: GraphQLString,
                resolve: (enumValue)=>enumValue.deprecationReason
            }
        })
});
const TypeKind = Object.freeze({
    SCALAR: 'SCALAR',
    OBJECT: 'OBJECT',
    INTERFACE: 'INTERFACE',
    UNION: 'UNION',
    ENUM: 'ENUM',
    INPUT_OBJECT: 'INPUT_OBJECT',
    LIST: 'LIST',
    NON_NULL: 'NON_NULL'
});
const __TypeKind = new GraphQLEnumType({
    name: '__TypeKind',
    description: 'An enum describing what kind of type a given `__Type` is.',
    values: {
        SCALAR: {
            value: TypeKind.SCALAR,
            description: 'Indicates this type is a scalar.'
        },
        OBJECT: {
            value: TypeKind.OBJECT,
            description: 'Indicates this type is an object. `fields` and `interfaces` are valid fields.'
        },
        INTERFACE: {
            value: TypeKind.INTERFACE,
            description: 'Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields.'
        },
        UNION: {
            value: TypeKind.UNION,
            description: 'Indicates this type is a union. `possibleTypes` is a valid field.'
        },
        ENUM: {
            value: TypeKind.ENUM,
            description: 'Indicates this type is an enum. `enumValues` is a valid field.'
        },
        INPUT_OBJECT: {
            value: TypeKind.INPUT_OBJECT,
            description: 'Indicates this type is an input object. `inputFields` is a valid field.'
        },
        LIST: {
            value: TypeKind.LIST,
            description: 'Indicates this type is a list. `ofType` is a valid field.'
        },
        NON_NULL: {
            value: TypeKind.NON_NULL,
            description: 'Indicates this type is a non-null. `ofType` is a valid field.'
        }
    }
});
const SchemaMetaFieldDef = {
    name: '__schema',
    type: GraphQLNonNull(__Schema),
    description: 'Access the current type schema of this server.',
    args: [],
    resolve: (_source, _args, _context, { schema  })=>schema
    ,
    isDeprecated: false,
    deprecationReason: undefined,
    extensions: undefined,
    astNode: undefined
};
const TypeMetaFieldDef = {
    name: '__type',
    type: __Type,
    description: 'Request the type information of a single type.',
    args: [
        {
            name: 'name',
            description: undefined,
            type: GraphQLNonNull(GraphQLString),
            defaultValue: undefined,
            extensions: undefined,
            astNode: undefined
        }
    ],
    resolve: (_source, { name  }, _context, { schema  })=>schema.getType(name)
    ,
    isDeprecated: false,
    deprecationReason: undefined,
    extensions: undefined,
    astNode: undefined
};
function isIntrospectionType(type) {
    return introspectionTypes.some(({ name  })=>type.name === name
    );
}
const TypeNameMetaFieldDef = {
    name: '__typename',
    type: GraphQLNonNull(GraphQLString),
    description: 'The name of the current Object type at runtime.',
    args: [],
    resolve: (_source, _args, _context, { parentType  })=>parentType.name
    ,
    isDeprecated: false,
    deprecationReason: undefined,
    extensions: undefined,
    astNode: undefined
};
const introspectionTypes = Object.freeze([
    __Schema,
    __Directive,
    __DirectiveLocation,
    __Type,
    __Field,
    __InputValue,
    __EnumValue,
    __TypeKind
]);
const TokenKind = Object.freeze({
    SOF: '<SOF>',
    EOF: '<EOF>',
    BANG: '!',
    DOLLAR: '$',
    AMP: '&',
    PAREN_L: '(',
    PAREN_R: ')',
    SPREAD: '...',
    COLON: ':',
    EQUALS: '=',
    AT: '@',
    BRACKET_L: '[',
    BRACKET_R: ']',
    BRACE_L: '{',
    PIPE: '|',
    BRACE_R: '}',
    NAME: 'Name',
    INT: 'Int',
    FLOAT: 'Float',
    STRING: 'String',
    BLOCK_STRING: 'BlockString',
    COMMENT: 'Comment'
});
function parseValue(source1, options) {
    const parser = new Parser(source1, options);
    parser.expectToken(TokenKind.SOF);
    const value1 = parser.parseValueLiteral(false);
    parser.expectToken(TokenKind.EOF);
    return value1;
}
function parseType(source1, options) {
    const parser = new Parser(source1, options);
    parser.expectToken(TokenKind.SOF);
    const type = parser.parseTypeReference();
    parser.expectToken(TokenKind.EOF);
    return type;
}
function typeFromAST(schema, typeNode) {
    let innerType;
    if (typeNode.kind === Kind.LIST_TYPE) {
        innerType = typeFromAST(schema, typeNode.type);
        return innerType && GraphQLList(innerType);
    }
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
        innerType = typeFromAST(schema, typeNode.type);
        return innerType && GraphQLNonNull(innerType);
    }
    if (typeNode.kind === Kind.NAMED_TYPE) {
        return schema.getType(typeNode.name.value);
    }
    invariant(false, 'Unexpected type node: ' + inspect(typeNode));
}
function addPath(prev1, key) {
    return {
        prev: prev1,
        key
    };
}
function pathToArray(path1) {
    const flattened = [];
    let curr = path1;
    while(curr){
        flattened.push(curr.key);
        curr = curr.prev;
    }
    return flattened.reverse();
}
function executeImpl(args1) {
    const { schema , document , rootValue , contextValue , variableValues , operationName , fieldResolver , typeResolver  } = args1;
    assertValidExecutionArguments(schema, document, variableValues);
    const exeContext = buildExecutionContext(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver);
    if (Array.isArray(exeContext)) {
        return {
            errors: exeContext
        };
    }
    const data = executeOperation(exeContext, exeContext.operation, rootValue);
    return buildResponse(exeContext, data);
}
function buildResponse(exeContext, data) {
    if (__default(data)) {
        return data.then((resolved)=>buildResponse(exeContext, resolved)
        );
    }
    return exeContext.errors.length === 0 ? {
        data
    } : {
        errors: exeContext.errors,
        data
    };
}
function assertValidExecutionArguments(schema, document, rawVariableValues) {
    devAssert(document, 'Must provide document.');
    assertValidSchema(schema);
    devAssert(rawVariableValues == null || isObjectLike(rawVariableValues), 'Variables must be provided as an Object where each property is a variable value. Perhaps look to see if an unparsed JSON string was provided.');
}
function buildExecutionContext(schema, document, rootValue, contextValue, rawVariableValues, operationName, fieldResolver, typeResolver) {
    let operation;
    const fragments = Object.create(null);
    for (const definition of document.definitions){
        switch(definition.kind){
            case Kind.OPERATION_DEFINITION:
                if (operationName == null) {
                    if (operation !== undefined) {
                        return [
                            new GraphQLError('Must provide operation name if query contains multiple operations.')
                        ];
                    }
                    operation = definition;
                } else if (definition.name?.value === operationName) {
                    operation = definition;
                }
                break;
            case Kind.FRAGMENT_DEFINITION:
                fragments[definition.name.value] = definition;
                break;
        }
    }
    if (!operation) {
        if (operationName != null) {
            return [
                new GraphQLError(`Unknown operation named "${operationName}".`)
            ];
        }
        return [
            new GraphQLError('Must provide an operation.')
        ];
    }
    const variableDefinitions = operation.variableDefinitions ?? [];
    const coercedVariableValues = getVariableValues(schema, variableDefinitions, rawVariableValues ?? {
    }, {
        maxErrors: 50
    });
    if (coercedVariableValues.errors) {
        return coercedVariableValues.errors;
    }
    return {
        schema,
        fragments,
        rootValue,
        contextValue,
        operation,
        variableValues: coercedVariableValues.coerced,
        fieldResolver: fieldResolver ?? defaultFieldResolver,
        typeResolver: typeResolver ?? defaultTypeResolver,
        errors: []
    };
}
function getOperationRootType(schema, operation) {
    if (operation.operation === 'query') {
        const queryType = schema.getQueryType();
        if (!queryType) {
            throw new GraphQLError('Schema does not define the required query root type.', operation);
        }
        return queryType;
    }
    if (operation.operation === 'mutation') {
        const mutationType = schema.getMutationType();
        if (!mutationType) {
            throw new GraphQLError('Schema is not configured for mutations.', operation);
        }
        return mutationType;
    }
    if (operation.operation === 'subscription') {
        const subscriptionType = schema.getSubscriptionType();
        if (!subscriptionType) {
            throw new GraphQLError('Schema is not configured for subscriptions.', operation);
        }
        return subscriptionType;
    }
    throw new GraphQLError('Can only have query, mutation and subscription operations.', operation);
}
function promiseReduce(values, callback, initialValue) {
    return values.reduce((previous, value1)=>__default(previous) ? previous.then((resolved)=>callback(resolved, value1)
        ) : callback(previous, value1)
    , initialValue);
}
function executeOperation(exeContext, operation, rootValue) {
    const type = getOperationRootType(exeContext.schema, operation);
    const fields = collectFields(exeContext, type, operation.selectionSet, Object.create(null), Object.create(null));
    const path1 = undefined;
    try {
        const result = operation.operation === 'mutation' ? executeFieldsSerially(exeContext, type, rootValue, path1, fields) : executeFields(exeContext, type, rootValue, path1, fields);
        if (__default(result)) {
            return result.then(undefined, (error)=>{
                exeContext.errors.push(error);
                return Promise.resolve(null);
            });
        }
        return result;
    } catch (error) {
        exeContext.errors.push(error);
        return null;
    }
}
function executeFieldsSerially(exeContext, parentType, sourceValue, path1, fields) {
    return promiseReduce(Object.keys(fields), (results, responseName)=>{
        const fieldNodes = fields[responseName];
        const fieldPath = addPath(path1, responseName);
        const result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath);
        if (result === undefined) {
            return results;
        }
        if (__default(result)) {
            return result.then((resolvedResult)=>{
                results[responseName] = resolvedResult;
                return results;
            });
        }
        results[responseName] = result;
        return results;
    }, Object.create(null));
}
function promiseForObject(object) {
    const keys = Object.keys(object);
    const valuesAndPromises = keys.map((name)=>object[name]
    );
    return Promise.all(valuesAndPromises).then((values)=>values.reduce((resolvedObject, value1, i)=>{
            resolvedObject[keys[i]] = value1;
            return resolvedObject;
        }, Object.create(null))
    );
}
function executeFields(exeContext, parentType, sourceValue, path1, fields) {
    const results = Object.create(null);
    let containsPromise = false;
    for (const responseName of Object.keys(fields)){
        const fieldNodes = fields[responseName];
        const fieldPath = addPath(path1, responseName);
        const result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath);
        if (result !== undefined) {
            results[responseName] = result;
            if (!containsPromise && __default(result)) {
                containsPromise = true;
            }
        }
    }
    if (!containsPromise) {
        return results;
    }
    return promiseForObject(results);
}
function collectFields(exeContext, runtimeType, selectionSet, fields, visitedFragmentNames) {
    for (const selection of selectionSet.selections){
        switch(selection.kind){
            case Kind.FIELD:
                {
                    if (!shouldIncludeNode(exeContext, selection)) {
                        continue;
                    }
                    const name = getFieldEntryKey(selection);
                    if (!fields[name]) {
                        fields[name] = [];
                    }
                    fields[name].push(selection);
                    break;
                }
            case Kind.INLINE_FRAGMENT:
                {
                    if (!shouldIncludeNode(exeContext, selection) || !doesFragmentConditionMatch(exeContext, selection, runtimeType)) {
                        continue;
                    }
                    collectFields(exeContext, runtimeType, selection.selectionSet, fields, visitedFragmentNames);
                    break;
                }
            case Kind.FRAGMENT_SPREAD:
                {
                    const fragName = selection.name.value;
                    if (visitedFragmentNames[fragName] || !shouldIncludeNode(exeContext, selection)) {
                        continue;
                    }
                    visitedFragmentNames[fragName] = true;
                    const fragment = exeContext.fragments[fragName];
                    if (!fragment || !doesFragmentConditionMatch(exeContext, fragment, runtimeType)) {
                        continue;
                    }
                    collectFields(exeContext, runtimeType, fragment.selectionSet, fields, visitedFragmentNames);
                    break;
                }
        }
    }
    return fields;
}
function shouldIncludeNode(exeContext, node) {
    const skip = getDirectiveValues(GraphQLSkipDirective, node, exeContext.variableValues);
    if (skip?.if === true) {
        return false;
    }
    const include = getDirectiveValues(GraphQLIncludeDirective, node, exeContext.variableValues);
    if (include?.if === false) {
        return false;
    }
    return true;
}
function doesFragmentConditionMatch(exeContext, fragment, type) {
    const typeConditionNode = fragment.typeCondition;
    if (!typeConditionNode) {
        return true;
    }
    const conditionalType = typeFromAST(exeContext.schema, typeConditionNode);
    if (conditionalType === type) {
        return true;
    }
    if (isAbstractType(conditionalType)) {
        return exeContext.schema.isSubType(conditionalType, type);
    }
    return false;
}
function getFieldEntryKey(node) {
    return node.alias ? node.alias.value : node.name.value;
}
function resolveField(exeContext, parentType, source1, fieldNodes, path1) {
    const fieldNode = fieldNodes[0];
    const fieldName = fieldNode.name.value;
    const fieldDef = getFieldDef2(exeContext.schema, parentType, fieldName);
    if (!fieldDef) {
        return;
    }
    const resolveFn = fieldDef.resolve ?? exeContext.fieldResolver;
    const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path1);
    const result = resolveFieldValueOrError(exeContext, fieldDef, fieldNodes, resolveFn, source1, info);
    return completeValueCatchingError(exeContext, fieldDef.type, fieldNodes, info, path1, result);
}
function buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path1) {
    return {
        fieldName: fieldDef.name,
        fieldNodes,
        returnType: fieldDef.type,
        parentType,
        path: path1,
        schema: exeContext.schema,
        fragments: exeContext.fragments,
        rootValue: exeContext.rootValue,
        operation: exeContext.operation,
        variableValues: exeContext.variableValues
    };
}
function resolveFieldValueOrError(exeContext, fieldDef, fieldNodes, resolveFn, source1, info) {
    try {
        const args1 = getArgumentValues(fieldDef, fieldNodes[0], exeContext.variableValues);
        const contextValue = exeContext.contextValue;
        const result = resolveFn(source1, args1, contextValue, info);
        return __default(result) ? result.then(undefined, asErrorInstance) : result;
    } catch (error) {
        return asErrorInstance(error);
    }
}
function asErrorInstance(error) {
    if (error instanceof Error) {
        return error;
    }
    return new Error('Unexpected error value: ' + inspect(error));
}
function completeValueCatchingError(exeContext, returnType, fieldNodes, info, path1, result) {
    try {
        let completed;
        if (__default(result)) {
            completed = result.then((resolved)=>completeValue(exeContext, returnType, fieldNodes, info, path1, resolved)
            );
        } else {
            completed = completeValue(exeContext, returnType, fieldNodes, info, path1, result);
        }
        if (__default(completed)) {
            return completed.then(undefined, (error)=>handleFieldError(error, fieldNodes, path1, returnType, exeContext)
            );
        }
        return completed;
    } catch (error) {
        return handleFieldError(error, fieldNodes, path1, returnType, exeContext);
    }
}
function handleFieldError(rawError, fieldNodes, path1, returnType, exeContext) {
    const error = locatedError(asErrorInstance(rawError), fieldNodes, pathToArray(path1));
    if (isNonNullType(returnType)) {
        throw error;
    }
    exeContext.errors.push(error);
    return null;
}
function completeValue(exeContext, returnType, fieldNodes, info, path1, result) {
    if (result instanceof Error) {
        throw result;
    }
    if (isNonNullType(returnType)) {
        const completed = completeValue(exeContext, returnType.ofType, fieldNodes, info, path1, result);
        if (completed === null) {
            throw new Error(`Cannot return null for non-nullable field ${info.parentType.name}.${info.fieldName}.`);
        }
        return completed;
    }
    if (result == null) {
        return null;
    }
    if (isListType(returnType)) {
        return completeListValue(exeContext, returnType, fieldNodes, info, path1, result);
    }
    if (isLeafType(returnType)) {
        return completeLeafValue(returnType, result);
    }
    if (isAbstractType(returnType)) {
        return completeAbstractValue(exeContext, returnType, fieldNodes, info, path1, result);
    }
    if (isObjectType(returnType)) {
        return completeObjectValue(exeContext, returnType, fieldNodes, info, path1, result);
    }
    invariant(false, 'Cannot complete value of unexpected output type: ' + inspect(returnType));
}
function completeListValue(exeContext, returnType, fieldNodes, info, path1, result) {
    if (!isCollection(result)) {
        throw new GraphQLError(`Expected Iterable, but did not find one for field "${info.parentType.name}.${info.fieldName}".`);
    }
    const itemType = returnType.ofType;
    let containsPromise = false;
    const completedResults = arrayFrom(result, (item, index)=>{
        const fieldPath = addPath(path1, index);
        const completedItem = completeValueCatchingError(exeContext, itemType, fieldNodes, info, fieldPath, item);
        if (!containsPromise && __default(completedItem)) {
            containsPromise = true;
        }
        return completedItem;
    });
    return containsPromise ? Promise.all(completedResults) : completedResults;
}
function completeLeafValue(returnType, result) {
    const serializedResult = returnType.serialize(result);
    if (serializedResult === undefined) {
        throw new Error(`Expected a value of type "${inspect(returnType)}" but ` + `received: ${inspect(result)}`);
    }
    return serializedResult;
}
function completeAbstractValue(exeContext, returnType, fieldNodes, info, path1, result) {
    const resolveTypeFn = returnType.resolveType ?? exeContext.typeResolver;
    const contextValue = exeContext.contextValue;
    const runtimeType = resolveTypeFn(result, contextValue, info, returnType);
    if (__default(runtimeType)) {
        return runtimeType.then((resolvedRuntimeType)=>completeObjectValue(exeContext, ensureValidRuntimeType(resolvedRuntimeType, exeContext, returnType, fieldNodes, info, result), fieldNodes, info, path1, result)
        );
    }
    return completeObjectValue(exeContext, ensureValidRuntimeType(runtimeType, exeContext, returnType, fieldNodes, info, result), fieldNodes, info, path1, result);
}
function ensureValidRuntimeType(runtimeTypeOrName, exeContext, returnType, fieldNodes, info, result) {
    const runtimeType = typeof runtimeTypeOrName === 'string' ? exeContext.schema.getType(runtimeTypeOrName) : runtimeTypeOrName;
    if (!isObjectType(runtimeType)) {
        throw new GraphQLError(`Abstract type "${returnType.name}" must resolve to an Object type at runtime for field "${info.parentType.name}.${info.fieldName}" with ` + `value ${inspect(result)}, received "${inspect(runtimeType)}". ` + `Either the "${returnType.name}" type should provide a "resolveType" function or each possible type should provide an "isTypeOf" function.`, fieldNodes);
    }
    if (!exeContext.schema.isSubType(returnType, runtimeType)) {
        throw new GraphQLError(`Runtime Object type "${runtimeType.name}" is not a possible type for "${returnType.name}".`, fieldNodes);
    }
    return runtimeType;
}
function completeObjectValue(exeContext, returnType, fieldNodes, info, path1, result) {
    if (returnType.isTypeOf) {
        const isTypeOf = returnType.isTypeOf(result, exeContext.contextValue, info);
        if (__default(isTypeOf)) {
            return isTypeOf.then((resolvedIsTypeOf)=>{
                if (!resolvedIsTypeOf) {
                    throw invalidReturnTypeError(returnType, result, fieldNodes);
                }
                return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path1, result);
            });
        }
        if (!isTypeOf) {
            throw invalidReturnTypeError(returnType, result, fieldNodes);
        }
    }
    return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path1, result);
}
function invalidReturnTypeError(returnType, result, fieldNodes) {
    return new GraphQLError(`Expected value of type "${returnType.name}" but got: ${inspect(result)}.`, fieldNodes);
}
function collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path1, result) {
    const subFieldNodes = collectSubfields(exeContext, returnType, fieldNodes);
    return executeFields(exeContext, returnType, result, path1, subFieldNodes);
}
function memoize3(fn) {
    let cache0;
    function memoized(a1, a2, a3) {
        if (!cache0) {
            cache0 = new WeakMap();
        }
        let cache1 = cache0.get(a1);
        let cache2;
        if (cache1) {
            cache2 = cache1.get(a2);
            if (cache2) {
                const cachedValue = cache2.get(a3);
                if (cachedValue !== undefined) {
                    return cachedValue;
                }
            }
        } else {
            cache1 = new WeakMap();
            cache0.set(a1, cache1);
        }
        if (!cache2) {
            cache2 = new WeakMap();
            cache1.set(a2, cache2);
        }
        const newValue = fn(a1, a2, a3);
        cache2.set(a3, newValue);
        return newValue;
    }
    return memoized;
}
const collectSubfields = memoize3(_collectSubfields);
function _collectSubfields(exeContext, returnType, fieldNodes) {
    let subFieldNodes = Object.create(null);
    const visitedFragmentNames = Object.create(null);
    for (const node of fieldNodes){
        if (node.selectionSet) {
            subFieldNodes = collectFields(exeContext, returnType, node.selectionSet, subFieldNodes, visitedFragmentNames);
        }
    }
    return subFieldNodes;
}
const defaultTypeResolver = function(value1, contextValue, info, abstractType) {
    if (isObjectLike(value1) && typeof value1.__typename === 'string') {
        return value1.__typename;
    }
    const possibleTypes = info.schema.getPossibleTypes(abstractType);
    const promisedIsTypeOfResults = [];
    for(let i = 0; i < possibleTypes.length; i++){
        const type = possibleTypes[i];
        if (type.isTypeOf) {
            const isTypeOfResult = type.isTypeOf(value1, contextValue, info);
            if (__default(isTypeOfResult)) {
                promisedIsTypeOfResults[i] = isTypeOfResult;
            } else if (isTypeOfResult) {
                return type;
            }
        }
    }
    if (promisedIsTypeOfResults.length) {
        return Promise.all(promisedIsTypeOfResults).then((isTypeOfResults)=>{
            for(let i1 = 0; i1 < isTypeOfResults.length; i1++){
                if (isTypeOfResults[i1]) {
                    return possibleTypes[i1];
                }
            }
        });
    }
};
const defaultFieldResolver = function(source1, args1, contextValue, info) {
    if (isObjectLike(source1) || typeof source1 === 'function') {
        const property = source1[info.fieldName];
        if (typeof property === 'function') {
            return source1[info.fieldName](args1, contextValue, info);
        }
        return property;
    }
};
function getFieldDef2(schema, parentType, fieldName) {
    if (fieldName === SchemaMetaFieldDef.name && schema.getQueryType() === parentType) {
        return SchemaMetaFieldDef;
    } else if (fieldName === TypeMetaFieldDef.name && schema.getQueryType() === parentType) {
        return TypeMetaFieldDef;
    } else if (fieldName === TypeNameMetaFieldDef.name) {
        return TypeNameMetaFieldDef;
    }
    return parentType.getFields()[fieldName];
}
function validateSDL(documentAST, schemaToExtend, rules = specifiedSDLRules) {
    const errors = [];
    const context = new SDLValidationContext(documentAST, schemaToExtend, (error)=>{
        errors.push(error);
    });
    const visitors = rules.map((rule)=>rule(context)
    );
    visit(documentAST, visitInParallel(visitors));
    return errors;
}
function assertValidSDL(documentAST) {
    const errors = validateSDL(documentAST);
    if (errors.length !== 0) {
        throw new Error(errors.map((error)=>error.message
        ).join('\n\n'));
    }
}
function assertValidSDLExtension(documentAST, schema) {
    const errors = validateSDL(documentAST, schema);
    if (errors.length !== 0) {
        throw new Error(errors.map((error)=>error.message
        ).join('\n\n'));
    }
}
const flatMapMethod = Array.prototype.flatMap;
const flatMap = flatMapMethod ? function(list, fn) {
    return flatMapMethod.call(list, fn);
} : function(list, fn) {
    let result = [];
    for (const item of list){
        const value1 = fn(item);
        if (Array.isArray(value1)) {
            result = result.concat(value1);
        } else {
            result.push(value1);
        }
    }
    return result;
};
const mod3 = function() {
    const version = '15.0.0';
    const version1 = version;
    const versionInfo = Object.freeze({
        major: 15,
        minor: 0,
        patch: 0,
        preReleaseTag: null
    });
    const versionInfo1 = versionInfo;
    function graphql(argsOrSchema, source1, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver) {
        return new Promise((resolve1)=>resolve1(arguments.length === 1 ? graphqlImpl(argsOrSchema) : graphqlImpl({
                schema: argsOrSchema,
                source: source1,
                rootValue,
                contextValue,
                variableValues,
                operationName,
                fieldResolver,
                typeResolver
            }))
        );
    }
    const graphql1 = graphql;
    function isPromise(value1) {
        return typeof value1?.then === 'function';
    }
    const __default = isPromise;
    const __default1 = isPromise;
    const isPromise1 = isPromise;
    const isPromise2 = isPromise;
    function graphqlSync(argsOrSchema, source1, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver) {
        const result = arguments.length === 1 ? graphqlImpl(argsOrSchema) : graphqlImpl({
            schema: argsOrSchema,
            source: source1,
            rootValue,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver
        });
        if (isPromise(result)) {
            throw new Error('GraphQL execution failed to complete synchronously.');
        }
        return result;
    }
    const graphqlSync1 = graphqlSync;
    const validateSchema1 = validateSchema;
    const parse2 = parse1;
    const validate1 = validate;
    const execute1 = execute;
    function graphqlImpl(args1) {
        const { schema , source: source1 , rootValue , contextValue , variableValues , operationName , fieldResolver , typeResolver  } = args1;
        const schemaValidationErrors = validateSchema(schema);
        if (schemaValidationErrors.length > 0) {
            return {
                errors: schemaValidationErrors
            };
        }
        let document;
        try {
            document = parse2(source1);
        } catch (syntaxError) {
            return {
                errors: [
                    syntaxError
                ]
            };
        }
        const validationErrors = validate(schema, document);
        if (validationErrors.length > 0) {
            return {
                errors: validationErrors
            };
        }
        return execute({
            schema,
            document,
            rootValue,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver
        });
    }
    const __default2 = Deno.env.NODE_ENV === 'production' ? function instanceOf(value1, constructor) {
        return value1 instanceof constructor;
    } : function instanceOf(value1, constructor) {
        if (value1 instanceof constructor) {
            return true;
        }
        if (value1) {
            const valueClass = value1.constructor;
            const className = constructor.name;
            if (className && valueClass && valueClass.name === className) {
                throw new Error(`Cannot use ${className} "${value1}" from another module or realm.\n\nEnsure that there is only one instance of "graphql" in the node_modules\ndirectory. If different versions of "graphql" are the dependencies of other\nrelied on modules, use "resolutions" to ensure only one version is installed.\n\nhttps://yarnpkg.com/en/docs/selective-version-resolutions\n\nDuplicate "graphql" modules cannot be used at the same time since different\nversions may have different capabilities and behavior. The data from one\nversion used in the function from another could produce confusing and\nspurious results.`);
            }
        }
        return false;
    };
    const __default3 = __default2;
    const instanceOf1 = __default2;
    const instanceOf2 = __default2;
    function isSchema(schema) {
        return __default2(schema, GraphQLSchema);
    }
    const isSchema1 = isSchema;
    const inspect1 = inspect;
    function assertSchema(schema) {
        if (!isSchema(schema)) {
            throw new Error(`Expected ${inspect(schema)} to be a GraphQL schema.`);
        }
        return schema;
    }
    const assertSchema1 = assertSchema;
    const assertSchema2 = assertSchema1;
    const devAssert1 = devAssert;
    const isObjectLike1 = isObjectLike;
    const objectEntries2 = objectEntries;
    function toObjMap1(obj) {
        if (Object.getPrototypeOf(obj) === null) {
            return obj;
        }
        const map = Object.create(null);
        for (const [key, value1] of objectEntries(obj)){
            map[key] = value1;
        }
        return map;
    }
    const __default4 = toObjMap1;
    const __default5 = toObjMap1;
    const toObjMap2 = toObjMap1;
    const toObjMap3 = toObjMap1;
    const specifiedDirectives1 = specifiedDirectives;
    const isDirective1 = isDirective;
    const __Schema1 = __Schema;
    const arrayFrom1 = arrayFrom;
    function isType(type) {
        return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type) || isListType(type) || isNonNullType(type);
    }
    const isType1 = isType;
    const isType2 = isType1;
    const inspect2 = inspect;
    function assertType(type) {
        if (!isType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL type.`);
        }
        return type;
    }
    const assertType1 = assertType;
    function isScalarType(type) {
        return __default2(type, GraphQLScalarType);
    }
    const isScalarType1 = isScalarType;
    const isScalarType2 = isScalarType1;
    const isScalarType3 = isScalarType1;
    const isScalarType4 = isScalarType1;
    const isScalarType5 = isScalarType1;
    const isScalarType6 = isScalarType1;
    function assertScalarType(type) {
        if (!isScalarType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Scalar type.`);
        }
        return type;
    }
    const assertScalarType1 = assertScalarType;
    function isObjectType(type) {
        return __default2(type, GraphQLObjectType);
    }
    const isObjectType1 = isObjectType;
    const isObjectType2 = isObjectType1;
    const isObjectType3 = isObjectType1;
    const isObjectType4 = isObjectType1;
    const isObjectType5 = isObjectType1;
    const isObjectType6 = isObjectType1;
    const isObjectType7 = isObjectType1;
    const isObjectType8 = isObjectType1;
    const isObjectType9 = isObjectType1;
    const isObjectType10 = isObjectType1;
    const isObjectType11 = isObjectType1;
    const isObjectType12 = isObjectType1;
    function assertObjectType(type) {
        if (!isObjectType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Object type.`);
        }
        return type;
    }
    const assertObjectType1 = assertObjectType;
    const assertObjectType2 = assertObjectType1;
    function isInterfaceType(type) {
        return __default2(type, GraphQLInterfaceType);
    }
    const isInterfaceType1 = isInterfaceType;
    const isInterfaceType2 = isInterfaceType1;
    const isInterfaceType3 = isInterfaceType1;
    const isInterfaceType4 = isInterfaceType1;
    const isInterfaceType5 = isInterfaceType1;
    const isInterfaceType6 = isInterfaceType1;
    const isInterfaceType7 = isInterfaceType1;
    const isInterfaceType8 = isInterfaceType1;
    const isInterfaceType9 = isInterfaceType1;
    const isInterfaceType10 = isInterfaceType1;
    const isInterfaceType11 = isInterfaceType1;
    const isInterfaceType12 = isInterfaceType1;
    function assertInterfaceType(type) {
        if (!isInterfaceType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Interface type.`);
        }
        return type;
    }
    const assertInterfaceType1 = assertInterfaceType;
    const assertInterfaceType2 = assertInterfaceType1;
    function isUnionType(type) {
        return __default2(type, GraphQLUnionType);
    }
    const isUnionType1 = isUnionType;
    const isUnionType2 = isUnionType1;
    const isUnionType3 = isUnionType1;
    const isUnionType4 = isUnionType1;
    const isUnionType5 = isUnionType1;
    const isUnionType6 = isUnionType1;
    const isUnionType7 = isUnionType1;
    function assertUnionType(type) {
        if (!isUnionType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Union type.`);
        }
        return type;
    }
    const assertUnionType1 = assertUnionType;
    function isEnumType(type) {
        return __default2(type, GraphQLEnumType);
    }
    const isEnumType1 = isEnumType;
    const isEnumType2 = isEnumType1;
    const isEnumType3 = isEnumType1;
    const isEnumType4 = isEnumType1;
    const isEnumType5 = isEnumType1;
    const isEnumType6 = isEnumType1;
    const isEnumType7 = isEnumType1;
    const isEnumType8 = isEnumType1;
    function assertEnumType(type) {
        if (!isEnumType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Enum type.`);
        }
        return type;
    }
    const assertEnumType1 = assertEnumType;
    function isInputObjectType(type) {
        return __default2(type, GraphQLInputObjectType);
    }
    const isInputObjectType1 = isInputObjectType;
    const isInputObjectType2 = isInputObjectType1;
    const isInputObjectType3 = isInputObjectType1;
    const isInputObjectType4 = isInputObjectType1;
    const isInputObjectType5 = isInputObjectType1;
    const isInputObjectType6 = isInputObjectType1;
    const isInputObjectType7 = isInputObjectType1;
    const isInputObjectType8 = isInputObjectType1;
    const isInputObjectType9 = isInputObjectType1;
    const isInputObjectType10 = isInputObjectType1;
    const isInputObjectType11 = isInputObjectType1;
    const isInputObjectType12 = isInputObjectType1;
    function assertInputObjectType(type) {
        if (!isInputObjectType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Input Object type.`);
        }
        return type;
    }
    const assertInputObjectType1 = assertInputObjectType;
    function isListType(type) {
        return __default2(type, GraphQLList);
    }
    const isListType1 = isListType;
    const isListType2 = isListType1;
    const isListType3 = isListType1;
    const isListType4 = isListType1;
    const isListType5 = isListType1;
    const isListType6 = isListType1;
    const isListType7 = isListType1;
    const isListType8 = isListType1;
    const isListType9 = isListType1;
    const isListType10 = isListType1;
    function assertListType(type) {
        if (!isListType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL List type.`);
        }
        return type;
    }
    const assertListType1 = assertListType;
    function isNonNullType(type) {
        return __default2(type, GraphQLNonNull);
    }
    const isNonNullType1 = isNonNullType;
    const isNonNullType2 = isNonNullType1;
    const isNonNullType3 = isNonNullType1;
    const isNonNullType4 = isNonNullType1;
    const isNonNullType5 = isNonNullType1;
    const isNonNullType6 = isNonNullType1;
    const isNonNullType7 = isNonNullType1;
    const isNonNullType8 = isNonNullType1;
    const isNonNullType9 = isNonNullType1;
    const isNonNullType10 = isNonNullType1;
    const isNonNullType11 = isNonNullType1;
    function assertNonNullType(type) {
        if (!isNonNullType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL Non-Null type.`);
        }
        return type;
    }
    const assertNonNullType1 = assertNonNullType;
    function isInputType(type) {
        return isScalarType(type) || isEnumType(type) || isInputObjectType(type) || isWrappingType(type) && isInputType(type.ofType);
    }
    const isInputType1 = isInputType;
    const isInputType2 = isInputType1;
    const isInputType3 = isInputType1;
    const isInputType4 = isInputType1;
    const isInputType5 = isInputType1;
    function assertInputType(type) {
        if (!isInputType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL input type.`);
        }
        return type;
    }
    const assertInputType1 = assertInputType;
    function isOutputType(type) {
        return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isWrappingType(type) && isOutputType(type.ofType);
    }
    const isOutputType1 = isOutputType;
    const isOutputType2 = isOutputType1;
    const isOutputType3 = isOutputType1;
    function assertOutputType(type) {
        if (!isOutputType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL output type.`);
        }
        return type;
    }
    const assertOutputType1 = assertOutputType;
    function isLeafType(type) {
        return isScalarType(type) || isEnumType(type);
    }
    const isLeafType1 = isLeafType;
    const isLeafType2 = isLeafType1;
    const isLeafType3 = isLeafType1;
    const isLeafType4 = isLeafType1;
    const isLeafType5 = isLeafType1;
    const isLeafType6 = isLeafType1;
    function assertLeafType(type) {
        if (!isLeafType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL leaf type.`);
        }
        return type;
    }
    const assertLeafType1 = assertLeafType;
    function isCompositeType(type) {
        return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
    }
    const isCompositeType1 = isCompositeType;
    const isCompositeType2 = isCompositeType1;
    const isCompositeType3 = isCompositeType1;
    const isCompositeType4 = isCompositeType1;
    function assertCompositeType(type) {
        if (!isCompositeType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL composite type.`);
        }
        return type;
    }
    const assertCompositeType1 = assertCompositeType;
    function isAbstractType(type) {
        return isInterfaceType(type) || isUnionType(type);
    }
    const isAbstractType1 = isAbstractType;
    const isAbstractType2 = isAbstractType1;
    const isAbstractType3 = isAbstractType1;
    function assertAbstractType(type) {
        if (!isAbstractType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL abstract type.`);
        }
        return type;
    }
    const assertAbstractType1 = assertAbstractType;
    function GraphQLList(ofType) {
        if (this instanceof GraphQLList) {
            this.ofType = assertType(ofType);
        } else {
            return new GraphQLList(ofType);
        }
    }
    GraphQLList.prototype.toString = function toString() {
        return '[' + String(this.ofType) + ']';
    };
    const SYMBOL_TO_STRING_TAG1 = SYMBOL_TO_STRING_TAG;
    Object.defineProperty(GraphQLList.prototype, SYMBOL_TO_STRING_TAG, {
        get () {
            return 'GraphQLList';
        }
    });
    const GraphQLList1 = GraphQLList;
    const GraphQLList2 = GraphQLList1;
    const GraphQLList3 = GraphQLList1;
    const GraphQLList4 = GraphQLList1;
    const defineToJSON1 = defineToJSON;
    defineToJSON(GraphQLList);
    function GraphQLNonNull(ofType) {
        if (this instanceof GraphQLNonNull) {
            this.ofType = assertNullableType(ofType);
        } else {
            return new GraphQLNonNull(ofType);
        }
    }
    GraphQLNonNull.prototype.toString = function toString() {
        return String(this.ofType) + '!';
    };
    Object.defineProperty(GraphQLNonNull.prototype, SYMBOL_TO_STRING_TAG, {
        get () {
            return 'GraphQLNonNull';
        }
    });
    const GraphQLNonNull1 = GraphQLNonNull;
    const GraphQLNonNull2 = GraphQLNonNull1;
    const GraphQLNonNull3 = GraphQLNonNull1;
    const GraphQLNonNull4 = GraphQLNonNull1;
    defineToJSON(GraphQLNonNull);
    function isWrappingType(type) {
        return isListType(type) || isNonNullType(type);
    }
    const isWrappingType1 = isWrappingType;
    function assertWrappingType(type) {
        if (!isWrappingType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL wrapping type.`);
        }
        return type;
    }
    const assertWrappingType1 = assertWrappingType;
    function isNullableType(type) {
        return isType(type) && !isNonNullType(type);
    }
    const isNullableType1 = isNullableType;
    function assertNullableType(type) {
        if (!isNullableType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL nullable type.`);
        }
        return type;
    }
    const assertNullableType1 = assertNullableType;
    const assertNullableType2 = assertNullableType1;
    function getNullableType(type) {
        if (type) {
            return isNonNullType(type) ? type.ofType : type;
        }
    }
    const getNullableType1 = getNullableType;
    const getNullableType2 = getNullableType1;
    const getNullableType3 = getNullableType1;
    function isNamedType(type) {
        return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type);
    }
    const isNamedType1 = isNamedType;
    const isNamedType2 = isNamedType1;
    function assertNamedType(type) {
        if (!isNamedType(type)) {
            throw new Error(`Expected ${inspect(type)} to be a GraphQL named type.`);
        }
        return type;
    }
    const assertNamedType1 = assertNamedType;
    function getNamedType9(type) {
        if (type) {
            let unwrappedType = type;
            while(isWrappingType(unwrappedType)){
                unwrappedType = unwrappedType.ofType;
            }
            return unwrappedType;
        }
    }
    const getNamedType1 = getNamedType9;
    const getNamedType2 = getNamedType1;
    const getNamedType3 = getNamedType1;
    const getNamedType4 = getNamedType1;
    const getNamedType5 = getNamedType1;
    const getNamedType6 = getNamedType1;
    const getNamedType7 = getNamedType1;
    function resolveThunk(thunk) {
        return typeof thunk === 'function' ? thunk() : thunk;
    }
    function undefineIfEmpty(arr) {
        return arr && arr.length > 0 ? arr : undefined;
    }
    function identityFunc(x) {
        return x;
    }
    const __default6 = identityFunc;
    const __default7 = identityFunc;
    const identityFunc1 = identityFunc;
    const valueFromASTUntyped1 = valueFromASTUntyped;
    const devAssert2 = devAssert;
    class GraphQLScalarType {
        constructor(config1){
            const parseValue1 = config1.parseValue ?? identityFunc;
            this.name = config1.name;
            this.description = config1.description;
            this.serialize = config1.serialize ?? identityFunc1;
            this.parseValue = parseValue1;
            this.parseLiteral = config1.parseLiteral ?? ((node)=>parseValue1(valueFromASTUntyped1(node))
            );
            this.extensions = config1.extensions && toObjMap2(config1.extensions);
            this.astNode = config1.astNode;
            this.extensionASTNodes = undefineIfEmpty(config1.extensionASTNodes);
            devAssert(typeof config1.name === 'string', 'Must provide name.');
            devAssert(config1.serialize == null || typeof config1.serialize === 'function', `${this.name} must provide "serialize" function. If this custom Scalar is also used as an input type, ensure "parseValue" and "parseLiteral" functions are also provided.`);
            if (config1.parseLiteral) {
                devAssert(typeof config1.parseValue === 'function' && typeof config1.parseLiteral === 'function', `${this.name} must provide both "parseValue" and "parseLiteral" functions.`);
            }
        }
        toConfig() {
            return {
                name: this.name,
                description: this.description,
                serialize: this.serialize,
                parseValue: this.parseValue,
                parseLiteral: this.parseLiteral,
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes ?? []
            };
        }
        toString() {
            return this.name;
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLScalarType';
        }
    }
    const GraphQLScalarType1 = GraphQLScalarType;
    const GraphQLScalarType2 = GraphQLScalarType1;
    const GraphQLScalarType3 = GraphQLScalarType1;
    defineToJSON(GraphQLScalarType);
    class GraphQLObjectType {
        constructor(config2){
            this.name = config2.name;
            this.description = config2.description;
            this.isTypeOf = config2.isTypeOf;
            this.extensions = config2.extensions && toObjMap2(config2.extensions);
            this.astNode = config2.astNode;
            this.extensionASTNodes = undefineIfEmpty(config2.extensionASTNodes);
            this._fields = defineFieldMap.bind(undefined, config2);
            this._interfaces = defineInterfaces.bind(undefined, config2);
            devAssert(typeof config2.name === 'string', 'Must provide name.');
            devAssert(config2.isTypeOf == null || typeof config2.isTypeOf === 'function', `${this.name} must provide "isTypeOf" as a function, ` + `but got: ${inspect(config2.isTypeOf)}.`);
        }
        getFields() {
            if (typeof this._fields === 'function') {
                this._fields = this._fields();
            }
            return this._fields;
        }
        getInterfaces() {
            if (typeof this._interfaces === 'function') {
                this._interfaces = this._interfaces();
            }
            return this._interfaces;
        }
        toConfig() {
            return {
                name: this.name,
                description: this.description,
                interfaces: this.getInterfaces(),
                fields: fieldsToFieldsConfig(this.getFields()),
                isTypeOf: this.isTypeOf,
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes || []
            };
        }
        toString() {
            return this.name;
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLObjectType';
        }
    }
    const GraphQLObjectType1 = GraphQLObjectType;
    const GraphQLObjectType2 = GraphQLObjectType1;
    const GraphQLObjectType3 = GraphQLObjectType1;
    const GraphQLObjectType4 = GraphQLObjectType1;
    defineToJSON(GraphQLObjectType);
    function defineInterfaces(config3) {
        const interfaces = resolveThunk(config3.interfaces) ?? [];
        devAssert(Array.isArray(interfaces), `${config3.name} interfaces must be an Array or a function which returns an Array.`);
        return interfaces;
    }
    const objectEntries3 = objectEntries;
    function mapValue(map, fn) {
        const result = Object.create(null);
        for (const [key, value1] of objectEntries(map)){
            result[key] = fn(value1, key);
        }
        return result;
    }
    const __default8 = mapValue;
    const __default9 = mapValue;
    const mapValue1 = mapValue;
    const mapValue2 = mapValue;
    const objectEntries4 = objectEntries;
    function defineFieldMap(config3) {
        const fieldMap = resolveThunk(config3.fields);
        devAssert(isPlainObj(fieldMap), `${config3.name} fields must be an object with field names as keys or a function which returns such an object.`);
        return mapValue(fieldMap, (fieldConfig, fieldName)=>{
            devAssert(isPlainObj(fieldConfig), `${config3.name}.${fieldName} field config must be an object.`);
            devAssert(!('isDeprecated' in fieldConfig), `${config3.name}.${fieldName} should provide "deprecationReason" instead of "isDeprecated".`);
            devAssert(fieldConfig.resolve == null || typeof fieldConfig.resolve === 'function', `${config3.name}.${fieldName} field resolver must be a function if ` + `provided, but got: ${inspect(fieldConfig.resolve)}.`);
            const argsConfig = fieldConfig.args ?? {
            };
            devAssert(isPlainObj(argsConfig), `${config3.name}.${fieldName} args must be an object with argument names as keys.`);
            const args1 = objectEntries(argsConfig).map(([argName, argConfig])=>({
                    name: argName,
                    description: argConfig.description,
                    type: argConfig.type,
                    defaultValue: argConfig.defaultValue,
                    extensions: argConfig.extensions && toObjMap1(argConfig.extensions),
                    astNode: argConfig.astNode
                })
            );
            return {
                name: fieldName,
                description: fieldConfig.description,
                type: fieldConfig.type,
                args: args1,
                resolve: fieldConfig.resolve,
                subscribe: fieldConfig.subscribe,
                isDeprecated: fieldConfig.deprecationReason != null,
                deprecationReason: fieldConfig.deprecationReason,
                extensions: fieldConfig.extensions && toObjMap1(fieldConfig.extensions),
                astNode: fieldConfig.astNode
            };
        });
    }
    const isObjectLike2 = isObjectLike;
    function isPlainObj(obj) {
        return isObjectLike(obj) && !Array.isArray(obj);
    }
    function fieldsToFieldsConfig(fields) {
        return mapValue(fields, (field)=>({
                description: field.description,
                type: field.type,
                args: argsToArgsConfig(field.args),
                resolve: field.resolve,
                subscribe: field.subscribe,
                deprecationReason: field.deprecationReason,
                extensions: field.extensions,
                astNode: field.astNode
            })
        );
    }
    const keyValMap1 = keyValMap;
    function argsToArgsConfig(args1) {
        return keyValMap(args1, (arg)=>arg.name
        , (arg)=>({
                description: arg.description,
                type: arg.type,
                defaultValue: arg.defaultValue,
                extensions: arg.extensions,
                astNode: arg.astNode
            })
        );
    }
    const argsToArgsConfig1 = argsToArgsConfig;
    function isRequiredArgument(arg) {
        return isNonNullType(arg.type) && arg.defaultValue === undefined;
    }
    const isRequiredArgument1 = isRequiredArgument;
    const isRequiredArgument2 = isRequiredArgument1;
    const isRequiredArgument3 = isRequiredArgument1;
    class GraphQLInterfaceType {
        constructor(config3){
            this.name = config3.name;
            this.description = config3.description;
            this.resolveType = config3.resolveType;
            this.extensions = config3.extensions && toObjMap2(config3.extensions);
            this.astNode = config3.astNode;
            this.extensionASTNodes = undefineIfEmpty(config3.extensionASTNodes);
            this._fields = defineFieldMap.bind(undefined, config3);
            this._interfaces = defineInterfaces.bind(undefined, config3);
            devAssert(typeof config3.name === 'string', 'Must provide name.');
            devAssert(config3.resolveType == null || typeof config3.resolveType === 'function', `${this.name} must provide "resolveType" as a function, ` + `but got: ${inspect(config3.resolveType)}.`);
        }
        getFields() {
            if (typeof this._fields === 'function') {
                this._fields = this._fields();
            }
            return this._fields;
        }
        getInterfaces() {
            if (typeof this._interfaces === 'function') {
                this._interfaces = this._interfaces();
            }
            return this._interfaces;
        }
        toConfig() {
            return {
                name: this.name,
                description: this.description,
                interfaces: this.getInterfaces(),
                fields: fieldsToFieldsConfig(this.getFields()),
                resolveType: this.resolveType,
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes ?? []
            };
        }
        toString() {
            return this.name;
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLInterfaceType';
        }
    }
    const GraphQLInterfaceType1 = GraphQLInterfaceType;
    const GraphQLInterfaceType2 = GraphQLInterfaceType1;
    const GraphQLInterfaceType3 = GraphQLInterfaceType1;
    const GraphQLInterfaceType4 = GraphQLInterfaceType1;
    defineToJSON(GraphQLInterfaceType);
    class GraphQLUnionType {
        constructor(config4){
            this.name = config4.name;
            this.description = config4.description;
            this.resolveType = config4.resolveType;
            this.extensions = config4.extensions && toObjMap2(config4.extensions);
            this.astNode = config4.astNode;
            this.extensionASTNodes = undefineIfEmpty(config4.extensionASTNodes);
            this._types = defineTypes.bind(undefined, config4);
            devAssert(typeof config4.name === 'string', 'Must provide name.');
            devAssert(config4.resolveType == null || typeof config4.resolveType === 'function', `${this.name} must provide "resolveType" as a function, ` + `but got: ${inspect(config4.resolveType)}.`);
        }
        getTypes() {
            if (typeof this._types === 'function') {
                this._types = this._types();
            }
            return this._types;
        }
        toConfig() {
            return {
                name: this.name,
                description: this.description,
                types: this.getTypes(),
                resolveType: this.resolveType,
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes ?? []
            };
        }
        toString() {
            return this.name;
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLUnionType';
        }
    }
    const GraphQLUnionType1 = GraphQLUnionType;
    const GraphQLUnionType2 = GraphQLUnionType1;
    const GraphQLUnionType3 = GraphQLUnionType1;
    const GraphQLUnionType4 = GraphQLUnionType1;
    defineToJSON(GraphQLUnionType);
    function defineTypes(config5) {
        const types1 = resolveThunk(config5.types);
        devAssert(Array.isArray(types1), `Must provide Array of types or a function which returns such an array for Union ${config5.name}.`);
        return types1;
    }
    function keyMap(list, keyFn) {
        return list.reduce((map, item)=>{
            map[keyFn(item)] = item;
            return map;
        }, Object.create(null));
    }
    const __default10 = keyMap;
    const __default11 = keyMap;
    const keyMap1 = keyMap;
    const keyMap2 = keyMap;
    const keyMap3 = keyMap;
    const keyMap4 = keyMap;
    const keyMap5 = keyMap;
    const keyMap6 = keyMap;
    const keyMap7 = keyMap;
    const getLocation1 = getLocation;
    const isObjectLike3 = isObjectLike;
    const SYMBOL_TO_STRING_TAG2 = SYMBOL_TO_STRING_TAG;
    class GraphQLError extends Error {
        constructor(message1, nodes, source1, positions, path1, originalError, extensions){
            super(message1);
            const _nodes = Array.isArray(nodes) ? nodes.length !== 0 ? nodes : undefined : nodes ? [
                nodes
            ] : undefined;
            let _source = source1;
            if (!_source && _nodes) {
                _source = _nodes[0].loc?.source;
            }
            let _positions = positions;
            if (!_positions && _nodes) {
                _positions = _nodes.reduce((list, node)=>{
                    if (node.loc) {
                        list.push(node.loc.start);
                    }
                    return list;
                }, []);
            }
            if (_positions && _positions.length === 0) {
                _positions = undefined;
            }
            let _locations;
            if (positions && source1) {
                _locations = positions.map((pos)=>getLocation1(source1, pos)
                );
            } else if (_nodes) {
                _locations = _nodes.reduce((list, node)=>{
                    if (node.loc) {
                        list.push(getLocation1(node.loc.source, node.loc.start));
                    }
                    return list;
                }, []);
            }
            let _extensions = extensions;
            if (_extensions == null && originalError != null) {
                const originalExtensions = originalError.extensions;
                if (isObjectLike(originalExtensions)) {
                    _extensions = originalExtensions;
                }
            }
            Object.defineProperties(this, {
                name: {
                    value: 'GraphQLError'
                },
                message: {
                    value: message1,
                    enumerable: true,
                    writable: true
                },
                locations: {
                    value: _locations ?? undefined,
                    enumerable: _locations != null
                },
                path: {
                    value: path1 ?? undefined,
                    enumerable: path1 != null
                },
                nodes: {
                    value: _nodes ?? undefined
                },
                source: {
                    value: _source ?? undefined
                },
                positions: {
                    value: _positions ?? undefined
                },
                originalError: {
                    value: originalError
                },
                extensions: {
                    value: _extensions ?? undefined,
                    enumerable: _extensions != null
                }
            });
            if (originalError?.stack) {
                Object.defineProperty(this, 'stack', {
                    value: originalError.stack,
                    writable: true,
                    configurable: true
                });
                return;
            }
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, GraphQLError);
            } else {
                Object.defineProperty(this, 'stack', {
                    value: Error().stack,
                    writable: true,
                    configurable: true
                });
            }
        }
        toString() {
            return printError(this);
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'Object';
        }
    }
    const GraphQLError1 = GraphQLError;
    const GraphQLError2 = GraphQLError1;
    const GraphQLError3 = GraphQLError1;
    const GraphQLError4 = GraphQLError1;
    const GraphQLError5 = GraphQLError1;
    const GraphQLError6 = GraphQLError1;
    const GraphQLError7 = GraphQLError1;
    const GraphQLError8 = GraphQLError1;
    const GraphQLError9 = GraphQLError1;
    const GraphQLError10 = GraphQLError1;
    const GraphQLError11 = GraphQLError1;
    const GraphQLError12 = GraphQLError1;
    const GraphQLError13 = GraphQLError1;
    const GraphQLError14 = GraphQLError1;
    const GraphQLError15 = GraphQLError1;
    const GraphQLError16 = GraphQLError1;
    const GraphQLError17 = GraphQLError1;
    const GraphQLError18 = GraphQLError1;
    const GraphQLError19 = GraphQLError1;
    const GraphQLError20 = GraphQLError1;
    const GraphQLError21 = GraphQLError1;
    const GraphQLError22 = GraphQLError1;
    const GraphQLError23 = GraphQLError1;
    const GraphQLError24 = GraphQLError1;
    const GraphQLError25 = GraphQLError1;
    const GraphQLError26 = GraphQLError1;
    const GraphQLError27 = GraphQLError1;
    const GraphQLError28 = GraphQLError1;
    const GraphQLError29 = GraphQLError1;
    const GraphQLError30 = GraphQLError1;
    const GraphQLError31 = GraphQLError1;
    const GraphQLError32 = GraphQLError1;
    const GraphQLError33 = GraphQLError1;
    const GraphQLError34 = GraphQLError1;
    const GraphQLError35 = GraphQLError1;
    const GraphQLError36 = GraphQLError1;
    const GraphQLError37 = GraphQLError1;
    const GraphQLError38 = GraphQLError1;
    const GraphQLError39 = GraphQLError1;
    const GraphQLError40 = GraphQLError1;
    const GraphQLError41 = GraphQLError1;
    const GraphQLError42 = GraphQLError1;
    const printLocation1 = printLocation;
    const printSourceLocation1 = printSourceLocation;
    function printError(error) {
        let output = error.message;
        if (error.nodes) {
            for (const node of error.nodes){
                if (node.loc) {
                    output += '\n\n' + printLocation1(node.loc);
                }
            }
        } else if (error.source && error.locations) {
            for (const location of error.locations){
                output += '\n\n' + printSourceLocation1(error.source, location);
            }
        }
        return output;
    }
    const printError1 = printError;
    const Kind = Object.freeze({
        NAME: 'Name',
        DOCUMENT: 'Document',
        OPERATION_DEFINITION: 'OperationDefinition',
        VARIABLE_DEFINITION: 'VariableDefinition',
        SELECTION_SET: 'SelectionSet',
        FIELD: 'Field',
        ARGUMENT: 'Argument',
        FRAGMENT_SPREAD: 'FragmentSpread',
        INLINE_FRAGMENT: 'InlineFragment',
        FRAGMENT_DEFINITION: 'FragmentDefinition',
        VARIABLE: 'Variable',
        INT: 'IntValue',
        FLOAT: 'FloatValue',
        STRING: 'StringValue',
        BOOLEAN: 'BooleanValue',
        NULL: 'NullValue',
        ENUM: 'EnumValue',
        LIST: 'ListValue',
        OBJECT: 'ObjectValue',
        OBJECT_FIELD: 'ObjectField',
        DIRECTIVE: 'Directive',
        NAMED_TYPE: 'NamedType',
        LIST_TYPE: 'ListType',
        NON_NULL_TYPE: 'NonNullType',
        SCHEMA_DEFINITION: 'SchemaDefinition',
        OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',
        SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
        OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
        FIELD_DEFINITION: 'FieldDefinition',
        INPUT_VALUE_DEFINITION: 'InputValueDefinition',
        INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
        UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
        ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
        ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
        INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',
        DIRECTIVE_DEFINITION: 'DirectiveDefinition',
        SCHEMA_EXTENSION: 'SchemaExtension',
        SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
        OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
        INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
        UNION_TYPE_EXTENSION: 'UnionTypeExtension',
        ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
        INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension'
    });
    const Kind1 = Kind;
    const Kind2 = Kind1;
    const Kind3 = Kind1;
    const Kind4 = Kind1;
    const Kind5 = Kind1;
    const Kind6 = Kind1;
    const Kind7 = Kind1;
    const Kind8 = Kind1;
    const Kind9 = Kind1;
    const Kind10 = Kind1;
    const Kind11 = Kind1;
    const Kind12 = Kind1;
    const Kind13 = Kind1;
    const Kind14 = Kind1;
    const Kind15 = Kind1;
    const Kind16 = Kind1;
    const Kind17 = Kind1;
    const Kind18 = Kind1;
    const Kind19 = Kind1;
    const Kind20 = Kind1;
    const isNode1 = isNode;
    const inspect3 = inspect;
    const QueryDocumentKeys = {
        Name: [],
        Document: [
            'definitions'
        ],
        OperationDefinition: [
            'name',
            'variableDefinitions',
            'directives',
            'selectionSet'
        ],
        VariableDefinition: [
            'variable',
            'type',
            'defaultValue',
            'directives'
        ],
        Variable: [
            'name'
        ],
        SelectionSet: [
            'selections'
        ],
        Field: [
            'alias',
            'name',
            'arguments',
            'directives',
            'selectionSet'
        ],
        Argument: [
            'name',
            'value'
        ],
        FragmentSpread: [
            'name',
            'directives'
        ],
        InlineFragment: [
            'typeCondition',
            'directives',
            'selectionSet'
        ],
        FragmentDefinition: [
            'name',
            'variableDefinitions',
            'typeCondition',
            'directives',
            'selectionSet'
        ],
        IntValue: [],
        FloatValue: [],
        StringValue: [],
        BooleanValue: [],
        NullValue: [],
        EnumValue: [],
        ListValue: [
            'values'
        ],
        ObjectValue: [
            'fields'
        ],
        ObjectField: [
            'name',
            'value'
        ],
        Directive: [
            'name',
            'arguments'
        ],
        NamedType: [
            'name'
        ],
        ListType: [
            'type'
        ],
        NonNullType: [
            'type'
        ],
        SchemaDefinition: [
            'description',
            'directives',
            'operationTypes'
        ],
        OperationTypeDefinition: [
            'type'
        ],
        ScalarTypeDefinition: [
            'description',
            'name',
            'directives'
        ],
        ObjectTypeDefinition: [
            'description',
            'name',
            'interfaces',
            'directives',
            'fields'
        ],
        FieldDefinition: [
            'description',
            'name',
            'arguments',
            'type',
            'directives'
        ],
        InputValueDefinition: [
            'description',
            'name',
            'type',
            'defaultValue',
            'directives'
        ],
        InterfaceTypeDefinition: [
            'description',
            'name',
            'interfaces',
            'directives',
            'fields'
        ],
        UnionTypeDefinition: [
            'description',
            'name',
            'directives',
            'types'
        ],
        EnumTypeDefinition: [
            'description',
            'name',
            'directives',
            'values'
        ],
        EnumValueDefinition: [
            'description',
            'name',
            'directives'
        ],
        InputObjectTypeDefinition: [
            'description',
            'name',
            'directives',
            'fields'
        ],
        DirectiveDefinition: [
            'description',
            'name',
            'arguments',
            'locations'
        ],
        SchemaExtension: [
            'directives',
            'operationTypes'
        ],
        ScalarTypeExtension: [
            'name',
            'directives'
        ],
        ObjectTypeExtension: [
            'name',
            'interfaces',
            'directives',
            'fields'
        ],
        InterfaceTypeExtension: [
            'name',
            'interfaces',
            'directives',
            'fields'
        ],
        UnionTypeExtension: [
            'name',
            'directives',
            'types'
        ],
        EnumTypeExtension: [
            'name',
            'directives',
            'values'
        ],
        InputObjectTypeExtension: [
            'name',
            'directives',
            'fields'
        ]
    };
    const QueryDocumentKeys1 = QueryDocumentKeys;
    const BREAK = Object.freeze({
    });
    const BREAK1 = BREAK;
    function visit(root, visitor, visitorKeys = QueryDocumentKeys) {
        let stack = undefined;
        let inArray = Array.isArray(root);
        let keys = [
            root
        ];
        let index = -1;
        let edits = [];
        let node = undefined;
        let key = undefined;
        let parent = undefined;
        const path2 = [];
        const ancestors = [];
        let newRoot = root;
        do {
            index++;
            const isLeaving = index === keys.length;
            const isEdited = isLeaving && edits.length !== 0;
            if (isLeaving) {
                key = ancestors.length === 0 ? undefined : path2[path2.length - 1];
                node = parent;
                parent = ancestors.pop();
                if (isEdited) {
                    if (inArray) {
                        node = node.slice();
                    } else {
                        const clone = {
                        };
                        for (const k of Object.keys(node)){
                            clone[k] = node[k];
                        }
                        node = clone;
                    }
                    let editOffset = 0;
                    for(let ii = 0; ii < edits.length; ii++){
                        let editKey = edits[ii][0];
                        const editValue = edits[ii][1];
                        if (inArray) {
                            editKey -= editOffset;
                        }
                        if (inArray && editValue === null) {
                            node.splice(editKey, 1);
                            editOffset++;
                        } else {
                            node[editKey] = editValue;
                        }
                    }
                }
                index = stack.index;
                keys = stack.keys;
                edits = stack.edits;
                inArray = stack.inArray;
                stack = stack.prev;
            } else {
                key = parent ? inArray ? index : keys[index] : undefined;
                node = parent ? parent[key] : newRoot;
                if (node === null || node === undefined) {
                    continue;
                }
                if (parent) {
                    path2.push(key);
                }
            }
            let result;
            if (!Array.isArray(node)) {
                if (!isNode(node)) {
                    throw new Error(`Invalid AST Node: ${inspect(node)}.`);
                }
                const visitFn = getVisitFn(visitor, node.kind, isLeaving);
                if (visitFn) {
                    result = visitFn.call(visitor, node, key, parent, path2, ancestors);
                    if (result === BREAK) {
                        break;
                    }
                    if (result === false) {
                        if (!isLeaving) {
                            path2.pop();
                            continue;
                        }
                    } else if (result !== undefined) {
                        edits.push([
                            key,
                            result
                        ]);
                        if (!isLeaving) {
                            if (isNode(result)) {
                                node = result;
                            } else {
                                path2.pop();
                                continue;
                            }
                        }
                    }
                }
            }
            if (result === undefined && isEdited) {
                edits.push([
                    key,
                    node
                ]);
            }
            if (isLeaving) {
                path2.pop();
            } else {
                stack = {
                    inArray,
                    index,
                    keys,
                    edits,
                    prev: stack
                };
                inArray = Array.isArray(node);
                keys = inArray ? node : visitorKeys[node.kind] ?? [];
                index = -1;
                edits = [];
                if (parent) {
                    ancestors.push(parent);
                }
                parent = node;
            }
        }while (stack !== undefined)
        if (edits.length !== 0) {
            newRoot = edits[edits.length - 1][1];
        }
        return newRoot;
    }
    const visit1 = visit;
    const visit2 = visit1;
    const visit3 = visit1;
    const visit4 = visit1;
    const visit5 = visit1;
    const visit6 = visit1;
    function visitInParallel(visitors) {
        const skipping = new Array(visitors.length);
        return {
            enter (node) {
                for(let i = 0; i < visitors.length; i++){
                    if (skipping[i] == null) {
                        const fn = getVisitFn(visitors[i], node.kind, false);
                        if (fn) {
                            const result = fn.apply(visitors[i], arguments);
                            if (result === false) {
                                skipping[i] = node;
                            } else if (result === BREAK) {
                                skipping[i] = BREAK;
                            } else if (result !== undefined) {
                                return result;
                            }
                        }
                    }
                }
            },
            leave (node) {
                for(let i = 0; i < visitors.length; i++){
                    if (skipping[i] == null) {
                        const fn = getVisitFn(visitors[i], node.kind, true);
                        if (fn) {
                            const result = fn.apply(visitors[i], arguments);
                            if (result === BREAK) {
                                skipping[i] = BREAK;
                            } else if (result !== undefined && result !== false) {
                                return result;
                            }
                        }
                    } else if (skipping[i] === node) {
                        skipping[i] = null;
                    }
                }
            }
        };
    }
    const visitInParallel1 = visitInParallel;
    function getVisitFn(visitor, kind1, isLeaving) {
        const kindVisitor = visitor[kind1];
        if (kindVisitor) {
            if (!isLeaving && typeof kindVisitor === 'function') {
                return kindVisitor;
            }
            const kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;
            if (typeof kindSpecificVisitor === 'function') {
                return kindSpecificVisitor;
            }
        } else {
            const specificVisitor = isLeaving ? visitor.leave : visitor.enter;
            if (specificVisitor) {
                if (typeof specificVisitor === 'function') {
                    return specificVisitor;
                }
                const specificKindVisitor = specificVisitor[kind1];
                if (typeof specificKindVisitor === 'function') {
                    return specificKindVisitor;
                }
            }
        }
    }
    const getVisitFn1 = getVisitFn;
    const getVisitFn2 = getVisitFn1;
    function print(ast) {
        return visit1(ast, {
            leave: printDocASTReducer
        });
    }
    const print1 = print;
    const print2 = print1;
    const print3 = print1;
    const print4 = print1;
    const print5 = print1;
    const print6 = print1;
    const print7 = print1;
    const print8 = print1;
    const print9 = print1;
    const print10 = print1;
    const printBlockString1 = printBlockString;
    const printDocASTReducer = {
        Name: (node)=>node.value
        ,
        Variable: (node)=>'$' + node.name
        ,
        Document: (node)=>join2(node.definitions, '\n\n') + '\n'
        ,
        OperationDefinition (node) {
            const op = node.operation;
            const name = node.name;
            const varDefs = wrap('(', join2(node.variableDefinitions, ', '), ')');
            const directives = join2(node.directives, ' ');
            const selectionSet = node.selectionSet;
            return !name && !directives && !varDefs && op === 'query' ? selectionSet : join2([
                op,
                join2([
                    name,
                    varDefs
                ]),
                directives,
                selectionSet
            ], ' ');
        },
        VariableDefinition: ({ variable , type , defaultValue , directives  })=>variable + ': ' + type + wrap(' = ', defaultValue) + wrap(' ', join2(directives, ' '))
        ,
        SelectionSet: ({ selections  })=>block(selections)
        ,
        Field: ({ alias , name , arguments: args1 , directives , selectionSet  })=>join2([
                wrap('', alias, ': ') + name + wrap('(', join2(args1, ', '), ')'),
                join2(directives, ' '),
                selectionSet
            ], ' ')
        ,
        Argument: ({ name , value: value1  })=>name + ': ' + value1
        ,
        FragmentSpread: ({ name , directives  })=>'...' + name + wrap(' ', join2(directives, ' '))
        ,
        InlineFragment: ({ typeCondition , directives , selectionSet  })=>join2([
                '...',
                wrap('on ', typeCondition),
                join2(directives, ' '),
                selectionSet
            ], ' ')
        ,
        FragmentDefinition: ({ name , typeCondition , variableDefinitions , directives , selectionSet  })=>`fragment ${name}${wrap('(', join2(variableDefinitions, ', '), ')')} ` + `on ${typeCondition} ${wrap('', join2(directives, ' '), ' ')}` + selectionSet
        ,
        IntValue: ({ value: value1  })=>value1
        ,
        FloatValue: ({ value: value1  })=>value1
        ,
        StringValue: ({ value: value1 , block: isBlockString  }, key)=>isBlockString ? printBlockString(value1, key === 'description' ? '' : '  ') : JSON.stringify(value1)
        ,
        BooleanValue: ({ value: value1  })=>value1 ? 'true' : 'false'
        ,
        NullValue: ()=>'null'
        ,
        EnumValue: ({ value: value1  })=>value1
        ,
        ListValue: ({ values  })=>'[' + join2(values, ', ') + ']'
        ,
        ObjectValue: ({ fields  })=>'{' + join2(fields, ', ') + '}'
        ,
        ObjectField: ({ name , value: value1  })=>name + ': ' + value1
        ,
        Directive: ({ name , arguments: args1  })=>'@' + name + wrap('(', join2(args1, ', '), ')')
        ,
        NamedType: ({ name  })=>name
        ,
        ListType: ({ type  })=>'[' + type + ']'
        ,
        NonNullType: ({ type  })=>type + '!'
        ,
        SchemaDefinition: addDescription(({ directives , operationTypes  })=>join2([
                'schema',
                join2(directives, ' '),
                block(operationTypes)
            ], ' ')
        ),
        OperationTypeDefinition: ({ operation , type  })=>operation + ': ' + type
        ,
        ScalarTypeDefinition: addDescription(({ name , directives  })=>join2([
                'scalar',
                name,
                join2(directives, ' ')
            ], ' ')
        ),
        ObjectTypeDefinition: addDescription(({ name , interfaces , directives , fields  })=>join2([
                'type',
                name,
                wrap('implements ', join2(interfaces, ' & ')),
                join2(directives, ' '),
                block(fields)
            ], ' ')
        ),
        FieldDefinition: addDescription(({ name , arguments: args1 , type , directives  })=>name + (hasMultilineItems(args1) ? wrap('(\n', indent(join2(args1, '\n')), '\n)') : wrap('(', join2(args1, ', '), ')')) + ': ' + type + wrap(' ', join2(directives, ' '))
        ),
        InputValueDefinition: addDescription(({ name , type , defaultValue , directives  })=>join2([
                name + ': ' + type,
                wrap('= ', defaultValue),
                join2(directives, ' ')
            ], ' ')
        ),
        InterfaceTypeDefinition: addDescription(({ name , interfaces , directives , fields  })=>join2([
                'interface',
                name,
                wrap('implements ', join2(interfaces, ' & ')),
                join2(directives, ' '),
                block(fields)
            ], ' ')
        ),
        UnionTypeDefinition: addDescription(({ name , directives , types: types1  })=>join2([
                'union',
                name,
                join2(directives, ' '),
                types1 && types1.length !== 0 ? '= ' + join2(types1, ' | ') : ''
            ], ' ')
        ),
        EnumTypeDefinition: addDescription(({ name , directives , values  })=>join2([
                'enum',
                name,
                join2(directives, ' '),
                block(values)
            ], ' ')
        ),
        EnumValueDefinition: addDescription(({ name , directives  })=>join2([
                name,
                join2(directives, ' ')
            ], ' ')
        ),
        InputObjectTypeDefinition: addDescription(({ name , directives , fields  })=>join2([
                'input',
                name,
                join2(directives, ' '),
                block(fields)
            ], ' ')
        ),
        DirectiveDefinition: addDescription(({ name , arguments: args1 , repeatable , locations  })=>'directive @' + name + (hasMultilineItems(args1) ? wrap('(\n', indent(join2(args1, '\n')), '\n)') : wrap('(', join2(args1, ', '), ')')) + (repeatable ? ' repeatable' : '') + ' on ' + join2(locations, ' | ')
        ),
        SchemaExtension: ({ directives , operationTypes  })=>join2([
                'extend schema',
                join2(directives, ' '),
                block(operationTypes)
            ], ' ')
        ,
        ScalarTypeExtension: ({ name , directives  })=>join2([
                'extend scalar',
                name,
                join2(directives, ' ')
            ], ' ')
        ,
        ObjectTypeExtension: ({ name , interfaces , directives , fields  })=>join2([
                'extend type',
                name,
                wrap('implements ', join2(interfaces, ' & ')),
                join2(directives, ' '),
                block(fields)
            ], ' ')
        ,
        InterfaceTypeExtension: ({ name , interfaces , directives , fields  })=>join2([
                'extend interface',
                name,
                wrap('implements ', join2(interfaces, ' & ')),
                join2(directives, ' '),
                block(fields)
            ], ' ')
        ,
        UnionTypeExtension: ({ name , directives , types: types1  })=>join2([
                'extend union',
                name,
                join2(directives, ' '),
                types1 && types1.length !== 0 ? '= ' + join2(types1, ' | ') : ''
            ], ' ')
        ,
        EnumTypeExtension: ({ name , directives , values  })=>join2([
                'extend enum',
                name,
                join2(directives, ' '),
                block(values)
            ], ' ')
        ,
        InputObjectTypeExtension: ({ name , directives , fields  })=>join2([
                'extend input',
                name,
                join2(directives, ' '),
                block(fields)
            ], ' ')
    };
    function addDescription(cb) {
        return (node)=>join2([
                node.description,
                cb(node)
            ], '\n')
        ;
    }
    function join2(maybeArray, separator = '') {
        return maybeArray?.filter((x)=>x
        ).join(separator) ?? '';
    }
    function block(array) {
        return array && array.length !== 0 ? '{\n' + indent(join2(array, '\n')) + '\n}' : '';
    }
    function wrap(start1, maybeString, end1 = '') {
        return maybeString ? start1 + maybeString + end1 : '';
    }
    function indent(maybeString) {
        return maybeString && '  ' + maybeString.replace(/\n/g, '\n  ');
    }
    function isMultiline(string) {
        return string.indexOf('\n') !== -1;
    }
    function hasMultilineItems(maybeArray) {
        return maybeArray && maybeArray.some(isMultiline);
    }
    class GraphQLEnumType {
        constructor(config5){
            this.name = config5.name;
            this.description = config5.description;
            this.extensions = config5.extensions && toObjMap2(config5.extensions);
            this.astNode = config5.astNode;
            this.extensionASTNodes = undefineIfEmpty(config5.extensionASTNodes);
            this._values = defineEnumValues(this.name, config5.values);
            this._valueLookup = new Map(this._values.map((enumValue)=>[
                    enumValue.value,
                    enumValue
                ]
            ));
            this._nameLookup = keyMap7(this._values, (value1)=>value1.name
            );
            devAssert(typeof config5.name === 'string', 'Must provide name.');
        }
        getValues() {
            return this._values;
        }
        getValue(name) {
            return this._nameLookup[name];
        }
        serialize(outputValue) {
            const enumValue = this._valueLookup.get(outputValue);
            if (enumValue === undefined) {
                throw new GraphQLError1(`Enum "${this.name}" cannot represent value: ${inspect(outputValue)}`);
            }
            return enumValue.name;
        }
        parseValue(inputValue) {
            if (typeof inputValue !== 'string') {
                const valueStr = inspect(inputValue);
                throw new GraphQLError1(`Enum "${this.name}" cannot represent non-string value: ${valueStr}.` + didYouMeanEnumValue(this, valueStr));
            }
            const enumValue = this.getValue(inputValue);
            if (enumValue == null) {
                throw new GraphQLError1(`Value "${inputValue}" does not exist in "${this.name}" enum.` + didYouMeanEnumValue(this, inputValue));
            }
            return enumValue.value;
        }
        parseLiteral(valueNode, _variables) {
            if (valueNode.kind !== Kind1.ENUM) {
                const valueStr = print1(valueNode);
                throw new GraphQLError1(`Enum "${this.name}" cannot represent non-enum value: ${valueStr}.` + didYouMeanEnumValue(this, valueStr), valueNode);
            }
            const enumValue = this.getValue(valueNode.value);
            if (enumValue == null) {
                const valueStr = print1(valueNode);
                throw new GraphQLError1(`Value "${valueStr}" does not exist in "${this.name}" enum.` + didYouMeanEnumValue(this, valueStr), valueNode);
            }
            return enumValue.value;
        }
        toConfig() {
            const values = keyValMap(this.getValues(), (value1)=>value1.name
            , (value1)=>({
                    description: value1.description,
                    value: value1.value,
                    deprecationReason: value1.deprecationReason,
                    extensions: value1.extensions,
                    astNode: value1.astNode
                })
            );
            return {
                name: this.name,
                description: this.description,
                values,
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes ?? []
            };
        }
        toString() {
            return this.name;
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLEnumType';
        }
    }
    const GraphQLEnumType1 = GraphQLEnumType;
    const GraphQLEnumType2 = GraphQLEnumType1;
    const GraphQLEnumType3 = GraphQLEnumType1;
    const GraphQLEnumType4 = GraphQLEnumType1;
    defineToJSON(GraphQLEnumType);
    const suggestionList1 = suggestionList;
    const didYouMean1 = didYouMean;
    function didYouMeanEnumValue(enumType, unknownValueStr) {
        const allNames = enumType.getValues().map((value1)=>value1.name
        );
        const suggestedValues = suggestionList(unknownValueStr, allNames);
        return didYouMean('the enum value', suggestedValues);
    }
    function defineEnumValues(typeName, valueMap) {
        devAssert(isPlainObj(valueMap), `${typeName} values must be an object with value names as keys.`);
        return objectEntries(valueMap).map(([valueName, valueConfig])=>{
            devAssert(isPlainObj(valueConfig), `${typeName}.${valueName} must refer to an object with a "value" key ` + `representing an internal value but got: ${inspect(valueConfig)}.`);
            devAssert(!('isDeprecated' in valueConfig), `${typeName}.${valueName} should provide "deprecationReason" instead of "isDeprecated".`);
            return {
                name: valueName,
                description: valueConfig.description,
                value: valueConfig.value !== undefined ? valueConfig.value : valueName,
                isDeprecated: valueConfig.deprecationReason != null,
                deprecationReason: valueConfig.deprecationReason,
                extensions: valueConfig.extensions && toObjMap1(valueConfig.extensions),
                astNode: valueConfig.astNode
            };
        });
    }
    class GraphQLInputObjectType {
        constructor(config6){
            this.name = config6.name;
            this.description = config6.description;
            this.extensions = config6.extensions && toObjMap2(config6.extensions);
            this.astNode = config6.astNode;
            this.extensionASTNodes = undefineIfEmpty(config6.extensionASTNodes);
            this._fields = defineInputFieldMap.bind(undefined, config6);
            devAssert(typeof config6.name === 'string', 'Must provide name.');
        }
        getFields() {
            if (typeof this._fields === 'function') {
                this._fields = this._fields();
            }
            return this._fields;
        }
        toConfig() {
            const fields = mapValue(this.getFields(), (field)=>({
                    description: field.description,
                    type: field.type,
                    defaultValue: field.defaultValue,
                    extensions: field.extensions,
                    astNode: field.astNode
                })
            );
            return {
                name: this.name,
                description: this.description,
                fields,
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes ?? []
            };
        }
        toString() {
            return this.name;
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLInputObjectType';
        }
    }
    const GraphQLInputObjectType1 = GraphQLInputObjectType;
    const GraphQLInputObjectType2 = GraphQLInputObjectType1;
    const GraphQLInputObjectType3 = GraphQLInputObjectType1;
    const GraphQLInputObjectType4 = GraphQLInputObjectType1;
    defineToJSON(GraphQLInputObjectType);
    function defineInputFieldMap(config7) {
        const fieldMap = resolveThunk(config7.fields);
        devAssert(isPlainObj(fieldMap), `${config7.name} fields must be an object with field names as keys or a function which returns such an object.`);
        return mapValue(fieldMap, (fieldConfig, fieldName)=>{
            devAssert(!('resolve' in fieldConfig), `${config7.name}.${fieldName} field has a resolve property, but Input Types cannot define resolvers.`);
            return {
                name: fieldName,
                description: fieldConfig.description,
                type: fieldConfig.type,
                defaultValue: fieldConfig.defaultValue,
                extensions: fieldConfig.extensions && toObjMap1(fieldConfig.extensions),
                astNode: fieldConfig.astNode
            };
        });
    }
    function isRequiredInputField(field) {
        return isNonNullType(field.type) && field.defaultValue === undefined;
    }
    const isRequiredInputField1 = isRequiredInputField;
    const isRequiredInputField2 = isRequiredInputField1;
    const isRequiredInputField3 = isRequiredInputField1;
    const find1 = find;
    const objectValues1 = objectValues;
    const SYMBOL_TO_STRING_TAG3 = SYMBOL_TO_STRING_TAG;
    class GraphQLSchema {
        constructor(config7){
            this.__validationErrors = config7.assumeValid === true ? [] : undefined;
            devAssert(isObjectLike(config7), 'Must provide configuration object.');
            devAssert(!config7.types || Array.isArray(config7.types), `"types" must be Array if provided but got: ${inspect(config7.types)}.`);
            devAssert(!config7.directives || Array.isArray(config7.directives), '"directives" must be Array if provided but got: ' + `${inspect(config7.directives)}.`);
            this.description = config7.description;
            this.extensions = config7.extensions && toObjMap3(config7.extensions);
            this.astNode = config7.astNode;
            this.extensionASTNodes = config7.extensionASTNodes;
            this._queryType = config7.query;
            this._mutationType = config7.mutation;
            this._subscriptionType = config7.subscription;
            this._directives = config7.directives ?? specifiedDirectives1;
            const allReferencedTypes = new Set(config7.types);
            if (config7.types != null) {
                for (const type of config7.types){
                    allReferencedTypes.delete(type);
                    collectReferencedTypes(type, allReferencedTypes);
                }
            }
            if (this._queryType != null) {
                collectReferencedTypes(this._queryType, allReferencedTypes);
            }
            if (this._mutationType != null) {
                collectReferencedTypes(this._mutationType, allReferencedTypes);
            }
            if (this._subscriptionType != null) {
                collectReferencedTypes(this._subscriptionType, allReferencedTypes);
            }
            for (const directive of this._directives){
                if (isDirective(directive)) {
                    for (const arg of directive.args){
                        collectReferencedTypes(arg.type, allReferencedTypes);
                    }
                }
            }
            collectReferencedTypes(__Schema, allReferencedTypes);
            this._typeMap = Object.create(null);
            this._subTypeMap = Object.create(null);
            this._implementationsMap = Object.create(null);
            for (const namedType of arrayFrom(allReferencedTypes)){
                if (namedType == null) {
                    continue;
                }
                const typeName = namedType.name;
                devAssert(typeName, 'One of the provided types for building the Schema is missing a name.');
                if (this._typeMap[typeName] !== undefined) {
                    throw new Error(`Schema must contain uniquely named types but contains multiple types named "${typeName}".`);
                }
                this._typeMap[typeName] = namedType;
                if (isInterfaceType1(namedType)) {
                    for (const iface of namedType.getInterfaces()){
                        if (isInterfaceType1(iface)) {
                            let implementations = this._implementationsMap[iface.name];
                            if (implementations === undefined) {
                                implementations = this._implementationsMap[iface.name] = {
                                    objects: [],
                                    interfaces: []
                                };
                            }
                            implementations.interfaces.push(namedType);
                        }
                    }
                } else if (isObjectType1(namedType)) {
                    for (const iface of namedType.getInterfaces()){
                        if (isInterfaceType1(iface)) {
                            let implementations = this._implementationsMap[iface.name];
                            if (implementations === undefined) {
                                implementations = this._implementationsMap[iface.name] = {
                                    objects: [],
                                    interfaces: []
                                };
                            }
                            implementations.objects.push(namedType);
                        }
                    }
                }
            }
        }
        getQueryType() {
            return this._queryType;
        }
        getMutationType() {
            return this._mutationType;
        }
        getSubscriptionType() {
            return this._subscriptionType;
        }
        getTypeMap() {
            return this._typeMap;
        }
        getType(name) {
            return this.getTypeMap()[name];
        }
        getPossibleTypes(abstractType) {
            return isUnionType1(abstractType) ? abstractType.getTypes() : this.getImplementations(abstractType).objects;
        }
        getImplementations(interfaceType) {
            const implementations = this._implementationsMap[interfaceType.name];
            return implementations ?? {
                objects: [],
                interfaces: []
            };
        }
        isPossibleType(abstractType, possibleType) {
            return this.isSubType(abstractType, possibleType);
        }
        isSubType(abstractType, maybeSubType) {
            let map = this._subTypeMap[abstractType.name];
            if (map === undefined) {
                map = Object.create(null);
                if (isUnionType1(abstractType)) {
                    for (const type of abstractType.getTypes()){
                        map[type.name] = true;
                    }
                } else {
                    const implementations = this.getImplementations(abstractType);
                    for (const type of implementations.objects){
                        map[type.name] = true;
                    }
                    for (const type1 of implementations.interfaces){
                        map[type1.name] = true;
                    }
                }
                this._subTypeMap[abstractType.name] = map;
            }
            return map[maybeSubType.name] !== undefined;
        }
        getDirectives() {
            return this._directives;
        }
        getDirective(name) {
            return find(this.getDirectives(), (directive1)=>directive1.name === name
            );
        }
        toConfig() {
            return {
                description: this.description,
                query: this.getQueryType(),
                mutation: this.getMutationType(),
                subscription: this.getSubscriptionType(),
                types: objectValues(this.getTypeMap()),
                directives: this.getDirectives().slice(),
                extensions: this.extensions,
                astNode: this.astNode,
                extensionASTNodes: this.extensionASTNodes ?? [],
                assumeValid: this.__validationErrors !== undefined
            };
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'GraphQLSchema';
        }
    }
    const GraphQLSchema1 = GraphQLSchema;
    const GraphQLSchema2 = GraphQLSchema1;
    const GraphQLSchema3 = GraphQLSchema1;
    const GraphQLSchema4 = GraphQLSchema1;
    const GraphQLSchema5 = GraphQLSchema1;
    function collectReferencedTypes(type, typeSet) {
        const namedType1 = getNamedType1(type);
        if (!typeSet.has(namedType1)) {
            typeSet.add(namedType1);
            if (isUnionType1(namedType1)) {
                for (const memberType of namedType1.getTypes()){
                    collectReferencedTypes(memberType, typeSet);
                }
            } else if (isObjectType1(namedType1) || isInterfaceType1(namedType1)) {
                for (const interfaceType of namedType1.getInterfaces()){
                    collectReferencedTypes(interfaceType, typeSet);
                }
                for (const field of objectValues(namedType1.getFields())){
                    collectReferencedTypes(field.type, typeSet);
                    for (const arg of field.args){
                        collectReferencedTypes(arg.type, typeSet);
                    }
                }
            } else if (isInputObjectType1(namedType1)) {
                for (const field of objectValues(namedType1.getFields())){
                    collectReferencedTypes(field.type, typeSet);
                }
            }
        }
        return typeSet;
    }
    const isSchema2 = isSchema1, assertSchema3 = assertSchema1, GraphQLSchema6 = GraphQLSchema1;
    const isType3 = isType1, isScalarType7 = isScalarType1, isObjectType13 = isObjectType1, isInterfaceType13 = isInterfaceType1, isUnionType8 = isUnionType1, isEnumType9 = isEnumType1, isInputObjectType13 = isInputObjectType1, isListType11 = isListType1, isNonNullType12 = isNonNullType1, isInputType6 = isInputType1, isOutputType4 = isOutputType1, isLeafType7 = isLeafType1, isCompositeType5 = isCompositeType1, isAbstractType4 = isAbstractType1, isWrappingType2 = isWrappingType1, isNullableType2 = isNullableType1, isNamedType3 = isNamedType1, isRequiredArgument4 = isRequiredArgument1, isRequiredInputField4 = isRequiredInputField1, assertType2 = assertType1, assertScalarType2 = assertScalarType1, assertObjectType3 = assertObjectType1, assertInterfaceType3 = assertInterfaceType1, assertUnionType2 = assertUnionType1, assertEnumType2 = assertEnumType1, assertInputObjectType2 = assertInputObjectType1, assertListType2 = assertListType1, assertNonNullType2 = assertNonNullType1, assertInputType2 = assertInputType1, assertOutputType2 = assertOutputType1, assertLeafType2 = assertLeafType1, assertCompositeType2 = assertCompositeType1, assertAbstractType2 = assertAbstractType1, assertWrappingType2 = assertWrappingType1, assertNullableType3 = assertNullableType1, assertNamedType2 = assertNamedType1, getNullableType4 = getNullableType1, getNamedType8 = getNamedType1, GraphQLScalarType4 = GraphQLScalarType1, GraphQLObjectType5 = GraphQLObjectType1, GraphQLInterfaceType5 = GraphQLInterfaceType1, GraphQLUnionType5 = GraphQLUnionType1, GraphQLEnumType5 = GraphQLEnumType1, GraphQLInputObjectType5 = GraphQLInputObjectType1, GraphQLList5 = GraphQLList1, GraphQLNonNull5 = GraphQLNonNull1;
    const isDirective2 = isDirective, assertDirective1 = assertDirective, GraphQLDirective1 = GraphQLDirective, isSpecifiedDirective1 = isSpecifiedDirective, specifiedDirectives2 = specifiedDirectives, GraphQLIncludeDirective1 = GraphQLIncludeDirective, GraphQLSkipDirective1 = GraphQLSkipDirective, GraphQLDeprecatedDirective1 = GraphQLDeprecatedDirective, DEFAULT_DEPRECATION_REASON1 = DEFAULT_DEPRECATION_REASON;
    const isSpecifiedScalarType1 = isSpecifiedScalarType, specifiedScalarTypes1 = specifiedScalarTypes, GraphQLInt1 = GraphQLInt, GraphQLFloat1 = GraphQLFloat, GraphQLString1 = GraphQLString, GraphQLBoolean1 = GraphQLBoolean, GraphQLID1 = GraphQLID;
    const isIntrospectionType1 = isIntrospectionType, introspectionTypes1 = introspectionTypes, __Schema2 = __Schema, __Directive1 = __Directive, __DirectiveLocation1 = __DirectiveLocation, __Type1 = __Type, __Field1 = __Field, __InputValue1 = __InputValue, __EnumValue1 = __EnumValue, __TypeKind1 = __TypeKind, TypeKind1 = TypeKind, SchemaMetaFieldDef1 = SchemaMetaFieldDef, TypeMetaFieldDef1 = TypeMetaFieldDef, TypeNameMetaFieldDef1 = TypeNameMetaFieldDef;
    const validateSchema2 = validateSchema, assertValidSchema1 = assertValidSchema;
    const devAssert3 = devAssert;
    const SYMBOL_TO_STRING_TAG4 = SYMBOL_TO_STRING_TAG;
    class Source {
        constructor(body, name1 = 'GraphQL request', locationOffset = {
            line: 1,
            column: 1
        }){
            this.body = body;
            this.name = name1;
            this.locationOffset = locationOffset;
            devAssert(this.locationOffset.line > 0, 'line in locationOffset is 1-indexed and must be positive.');
            devAssert(this.locationOffset.column > 0, 'column in locationOffset is 1-indexed and must be positive.');
        }
        get [SYMBOL_TO_STRING_TAG]() {
            return 'Source';
        }
    }
    const Source1 = Source;
    const Source2 = Source1;
    const DirectiveLocation = Object.freeze({
        QUERY: 'QUERY',
        MUTATION: 'MUTATION',
        SUBSCRIPTION: 'SUBSCRIPTION',
        FIELD: 'FIELD',
        FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION',
        FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',
        INLINE_FRAGMENT: 'INLINE_FRAGMENT',
        VARIABLE_DEFINITION: 'VARIABLE_DEFINITION',
        SCHEMA: 'SCHEMA',
        SCALAR: 'SCALAR',
        OBJECT: 'OBJECT',
        FIELD_DEFINITION: 'FIELD_DEFINITION',
        ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
        INTERFACE: 'INTERFACE',
        UNION: 'UNION',
        ENUM: 'ENUM',
        ENUM_VALUE: 'ENUM_VALUE',
        INPUT_OBJECT: 'INPUT_OBJECT',
        INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'
    });
    const DirectiveLocation1 = DirectiveLocation;
    const DirectiveLocation2 = DirectiveLocation1;
    const Token1 = Token;
    const TokenKind1 = TokenKind;
    class Lexer {
        constructor(source2){
            const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0, null);
            this.source = source2;
            this.lastToken = startOfFileToken;
            this.token = startOfFileToken;
            this.line = 1;
            this.lineStart = 0;
        }
        advance() {
            this.lastToken = this.token;
            const token = this.token = this.lookahead();
            return token;
        }
        lookahead() {
            let token = this.token;
            if (token.kind !== TokenKind.EOF) {
                do {
                    token = token.next ?? (token.next = readToken(this, token));
                }while (token.kind === TokenKind.COMMENT)
            }
            return token;
        }
    }
    const Lexer1 = Lexer;
    const Lexer2 = Lexer1;
    function isPunctuatorTokenKind(kind1) {
        return kind1 === TokenKind.BANG || kind1 === TokenKind.DOLLAR || kind1 === TokenKind.AMP || kind1 === TokenKind.PAREN_L || kind1 === TokenKind.PAREN_R || kind1 === TokenKind.SPREAD || kind1 === TokenKind.COLON || kind1 === TokenKind.EQUALS || kind1 === TokenKind.AT || kind1 === TokenKind.BRACKET_L || kind1 === TokenKind.BRACKET_R || kind1 === TokenKind.BRACE_L || kind1 === TokenKind.PIPE || kind1 === TokenKind.BRACE_R;
    }
    const isPunctuatorTokenKind1 = isPunctuatorTokenKind;
    const isPunctuatorTokenKind2 = isPunctuatorTokenKind1;
    function printCharCode(code) {
        return isNaN(code) ? TokenKind.EOF : code < 127 ? JSON.stringify(String.fromCharCode(code)) : `"\\u${('00' + code.toString(16).toUpperCase()).slice(-4)}"`;
    }
    function syntaxError(source3, position, description) {
        return new GraphQLError1(`Syntax Error: ${description}`, undefined, source3, [
            position
        ]);
    }
    const syntaxError1 = syntaxError;
    const syntaxError2 = syntaxError1;
    function readToken(lexer, prev1) {
        const source3 = lexer.source;
        const body1 = source3.body;
        const bodyLength = body1.length;
        const pos = positionAfterWhitespace(body1, prev1.end, lexer);
        const line1 = lexer.line;
        const col = 1 + pos - lexer.lineStart;
        if (pos >= bodyLength) {
            return new Token(TokenKind.EOF, bodyLength, bodyLength, line1, col, prev1);
        }
        const code = body1.charCodeAt(pos);
        switch(code){
            case 33:
                return new Token(TokenKind.BANG, pos, pos + 1, line1, col, prev1);
            case 35:
                return readComment(source3, pos, line1, col, prev1);
            case 36:
                return new Token(TokenKind.DOLLAR, pos, pos + 1, line1, col, prev1);
            case 38:
                return new Token(TokenKind.AMP, pos, pos + 1, line1, col, prev1);
            case 40:
                return new Token(TokenKind.PAREN_L, pos, pos + 1, line1, col, prev1);
            case 41:
                return new Token(TokenKind.PAREN_R, pos, pos + 1, line1, col, prev1);
            case 46:
                if (body1.charCodeAt(pos + 1) === 46 && body1.charCodeAt(pos + 2) === 46) {
                    return new Token(TokenKind.SPREAD, pos, pos + 3, line1, col, prev1);
                }
                break;
            case 58:
                return new Token(TokenKind.COLON, pos, pos + 1, line1, col, prev1);
            case 61:
                return new Token(TokenKind.EQUALS, pos, pos + 1, line1, col, prev1);
            case 64:
                return new Token(TokenKind.AT, pos, pos + 1, line1, col, prev1);
            case 91:
                return new Token(TokenKind.BRACKET_L, pos, pos + 1, line1, col, prev1);
            case 93:
                return new Token(TokenKind.BRACKET_R, pos, pos + 1, line1, col, prev1);
            case 123:
                return new Token(TokenKind.BRACE_L, pos, pos + 1, line1, col, prev1);
            case 124:
                return new Token(TokenKind.PIPE, pos, pos + 1, line1, col, prev1);
            case 125:
                return new Token(TokenKind.BRACE_R, pos, pos + 1, line1, col, prev1);
            case 65:
            case 66:
            case 67:
            case 68:
            case 69:
            case 70:
            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
            case 77:
            case 78:
            case 79:
            case 80:
            case 81:
            case 82:
            case 83:
            case 84:
            case 85:
            case 86:
            case 87:
            case 88:
            case 89:
            case 90:
            case 95:
            case 97:
            case 98:
            case 99:
            case 100:
            case 101:
            case 102:
            case 103:
            case 104:
            case 105:
            case 106:
            case 107:
            case 108:
            case 109:
            case 110:
            case 111:
            case 112:
            case 113:
            case 114:
            case 115:
            case 116:
            case 117:
            case 118:
            case 119:
            case 120:
            case 121:
            case 122:
                return readName(source3, pos, line1, col, prev1);
            case 45:
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                return readNumber(source3, pos, code, line1, col, prev1);
            case 34:
                if (body1.charCodeAt(pos + 1) === 34 && body1.charCodeAt(pos + 2) === 34) {
                    return readBlockString(source3, pos, line1, col, prev1, lexer);
                }
                return readString(source3, pos, line1, col, prev1);
        }
        throw syntaxError1(source3, pos, unexpectedCharacterMessage(code));
    }
    function unexpectedCharacterMessage(code) {
        if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
            return `Cannot contain the invalid character ${printCharCode(code)}.`;
        }
        if (code === 39) {
            return 'Unexpected single quote character (\'), did you mean to use a double quote (")?';
        }
        return `Cannot parse the unexpected character ${printCharCode(code)}.`;
    }
    function positionAfterWhitespace(body1, startPosition, lexer) {
        const bodyLength = body1.length;
        let position = startPosition;
        while(position < bodyLength){
            const code = body1.charCodeAt(position);
            if (code === 9 || code === 32 || code === 44 || code === 65279) {
                ++position;
            } else if (code === 10) {
                ++position;
                ++lexer.line;
                lexer.lineStart = position;
            } else if (code === 13) {
                if (body1.charCodeAt(position + 1) === 10) {
                    position += 2;
                } else {
                    ++position;
                }
                ++lexer.line;
                lexer.lineStart = position;
            } else {
                break;
            }
        }
        return position;
    }
    function readComment(source3, start1, line1, col, prev1) {
        const body1 = source3.body;
        let code;
        let position = start1;
        do {
            code = body1.charCodeAt(++position);
        }while (!isNaN(code) && (code > 31 || code === 9))
        return new Token(TokenKind.COMMENT, start1, position, line1, col, prev1, body1.slice(start1 + 1, position));
    }
    function readNumber(source3, start1, firstCode, line1, col, prev1) {
        const body1 = source3.body;
        let code = firstCode;
        let position = start1;
        let isFloat = false;
        if (code === 45) {
            code = body1.charCodeAt(++position);
        }
        if (code === 48) {
            code = body1.charCodeAt(++position);
            if (code >= 48 && code <= 57) {
                throw syntaxError1(source3, position, `Invalid number, unexpected digit after 0: ${printCharCode(code)}.`);
            }
        } else {
            position = readDigits(source3, position, code);
            code = body1.charCodeAt(position);
        }
        if (code === 46) {
            isFloat = true;
            code = body1.charCodeAt(++position);
            position = readDigits(source3, position, code);
            code = body1.charCodeAt(position);
        }
        if (code === 69 || code === 101) {
            isFloat = true;
            code = body1.charCodeAt(++position);
            if (code === 43 || code === 45) {
                code = body1.charCodeAt(++position);
            }
            position = readDigits(source3, position, code);
            code = body1.charCodeAt(position);
        }
        if (code === 46 || isNameStart(code)) {
            throw syntaxError1(source3, position, `Invalid number, expected digit but got: ${printCharCode(code)}.`);
        }
        return new Token(isFloat ? TokenKind.FLOAT : TokenKind.INT, start1, position, line1, col, prev1, body1.slice(start1, position));
    }
    function readDigits(source3, start1, firstCode) {
        const body1 = source3.body;
        let position = start1;
        let code = firstCode;
        if (code >= 48 && code <= 57) {
            do {
                code = body1.charCodeAt(++position);
            }while (code >= 48 && code <= 57)
            return position;
        }
        throw syntaxError1(source3, position, `Invalid number, expected digit but got: ${printCharCode(code)}.`);
    }
    function readString(source3, start1, line1, col, prev1) {
        const body1 = source3.body;
        let position = start1 + 1;
        let chunkStart = position;
        let code = 0;
        let value1 = '';
        while(position < body1.length && !isNaN(code = body1.charCodeAt(position)) && code !== 10 && code !== 13){
            if (code === 34) {
                value1 += body1.slice(chunkStart, position);
                return new Token(TokenKind.STRING, start1, position + 1, line1, col, prev1, value1);
            }
            if (code < 32 && code !== 9) {
                throw syntaxError1(source3, position, `Invalid character within String: ${printCharCode(code)}.`);
            }
            ++position;
            if (code === 92) {
                value1 += body1.slice(chunkStart, position - 1);
                code = body1.charCodeAt(position);
                switch(code){
                    case 34:
                        value1 += '"';
                        break;
                    case 47:
                        value1 += '/';
                        break;
                    case 92:
                        value1 += '\\';
                        break;
                    case 98:
                        value1 += '\b';
                        break;
                    case 102:
                        value1 += '\f';
                        break;
                    case 110:
                        value1 += '\n';
                        break;
                    case 114:
                        value1 += '\r';
                        break;
                    case 116:
                        value1 += '\t';
                        break;
                    case 117:
                        {
                            const charCode = uniCharCode(body1.charCodeAt(position + 1), body1.charCodeAt(position + 2), body1.charCodeAt(position + 3), body1.charCodeAt(position + 4));
                            if (charCode < 0) {
                                const invalidSequence = body1.slice(position + 1, position + 5);
                                throw syntaxError1(source3, position, `Invalid character escape sequence: \\u${invalidSequence}.`);
                            }
                            value1 += String.fromCharCode(charCode);
                            position += 4;
                            break;
                        }
                    default:
                        throw syntaxError1(source3, position, `Invalid character escape sequence: \\${String.fromCharCode(code)}.`);
                }
                ++position;
                chunkStart = position;
            }
        }
        throw syntaxError1(source3, position, 'Unterminated string.');
    }
    const dedentBlockStringValue1 = dedentBlockStringValue;
    function readBlockString(source3, start1, line1, col, prev1, lexer) {
        const body1 = source3.body;
        let position = start1 + 3;
        let chunkStart = position;
        let code = 0;
        let rawValue = '';
        while(position < body1.length && !isNaN(code = body1.charCodeAt(position))){
            if (code === 34 && body1.charCodeAt(position + 1) === 34 && body1.charCodeAt(position + 2) === 34) {
                rawValue += body1.slice(chunkStart, position);
                return new Token(TokenKind.BLOCK_STRING, start1, position + 3, line1, col, prev1, dedentBlockStringValue(rawValue));
            }
            if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
                throw syntaxError1(source3, position, `Invalid character within String: ${printCharCode(code)}.`);
            }
            if (code === 10) {
                ++position;
                ++lexer.line;
                lexer.lineStart = position;
            } else if (code === 13) {
                if (body1.charCodeAt(position + 1) === 10) {
                    position += 2;
                } else {
                    ++position;
                }
                ++lexer.line;
                lexer.lineStart = position;
            } else if (code === 92 && body1.charCodeAt(position + 1) === 34 && body1.charCodeAt(position + 2) === 34 && body1.charCodeAt(position + 3) === 34) {
                rawValue += body1.slice(chunkStart, position) + '"""';
                position += 4;
                chunkStart = position;
            } else {
                ++position;
            }
        }
        throw syntaxError1(source3, position, 'Unterminated string.');
    }
    function uniCharCode(a, b, c, d) {
        return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
    }
    function char2hex(a) {
        return a >= 48 && a <= 57 ? a - 48 : a >= 65 && a <= 70 ? a - 55 : a >= 97 && a <= 102 ? a - 87 : -1;
    }
    function readName(source3, start1, line1, col, prev1) {
        const body1 = source3.body;
        const bodyLength = body1.length;
        let position = start1 + 1;
        let code = 0;
        while(position !== bodyLength && !isNaN(code = body1.charCodeAt(position)) && (code === 95 || code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122)){
            ++position;
        }
        return new Token(TokenKind.NAME, start1, position, line1, col, prev1, body1.slice(start1, position));
    }
    function isNameStart(code) {
        return code === 95 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
    }
    function isDefinitionNode(node) {
        return isExecutableDefinitionNode(node) || isTypeSystemDefinitionNode(node) || isTypeSystemExtensionNode(node);
    }
    const isDefinitionNode1 = isDefinitionNode;
    function isExecutableDefinitionNode(node) {
        return node.kind === Kind1.OPERATION_DEFINITION || node.kind === Kind1.FRAGMENT_DEFINITION;
    }
    const isExecutableDefinitionNode1 = isExecutableDefinitionNode;
    const isExecutableDefinitionNode2 = isExecutableDefinitionNode1;
    function isSelectionNode(node) {
        return node.kind === Kind1.FIELD || node.kind === Kind1.FRAGMENT_SPREAD || node.kind === Kind1.INLINE_FRAGMENT;
    }
    const isSelectionNode1 = isSelectionNode;
    function isValueNode(node) {
        return node.kind === Kind1.VARIABLE || node.kind === Kind1.INT || node.kind === Kind1.FLOAT || node.kind === Kind1.STRING || node.kind === Kind1.BOOLEAN || node.kind === Kind1.NULL || node.kind === Kind1.ENUM || node.kind === Kind1.LIST || node.kind === Kind1.OBJECT;
    }
    const isValueNode1 = isValueNode;
    function isTypeNode(node) {
        return node.kind === Kind1.NAMED_TYPE || node.kind === Kind1.LIST_TYPE || node.kind === Kind1.NON_NULL_TYPE;
    }
    const isTypeNode1 = isTypeNode;
    function isTypeSystemDefinitionNode(node) {
        return node.kind === Kind1.SCHEMA_DEFINITION || isTypeDefinitionNode(node) || node.kind === Kind1.DIRECTIVE_DEFINITION;
    }
    const isTypeSystemDefinitionNode1 = isTypeSystemDefinitionNode;
    const isTypeSystemDefinitionNode2 = isTypeSystemDefinitionNode1;
    function isTypeDefinitionNode(node) {
        return node.kind === Kind1.SCALAR_TYPE_DEFINITION || node.kind === Kind1.OBJECT_TYPE_DEFINITION || node.kind === Kind1.INTERFACE_TYPE_DEFINITION || node.kind === Kind1.UNION_TYPE_DEFINITION || node.kind === Kind1.ENUM_TYPE_DEFINITION || node.kind === Kind1.INPUT_OBJECT_TYPE_DEFINITION;
    }
    const isTypeDefinitionNode1 = isTypeDefinitionNode;
    const isTypeDefinitionNode2 = isTypeDefinitionNode1;
    const isTypeDefinitionNode3 = isTypeDefinitionNode1;
    const isTypeDefinitionNode4 = isTypeDefinitionNode1;
    const isTypeDefinitionNode5 = isTypeDefinitionNode1;
    function isTypeSystemExtensionNode(node) {
        return node.kind === Kind1.SCHEMA_EXTENSION || isTypeExtensionNode(node);
    }
    const isTypeSystemExtensionNode1 = isTypeSystemExtensionNode;
    const isTypeSystemExtensionNode2 = isTypeSystemExtensionNode1;
    function isTypeExtensionNode(node) {
        return node.kind === Kind1.SCALAR_TYPE_EXTENSION || node.kind === Kind1.OBJECT_TYPE_EXTENSION || node.kind === Kind1.INTERFACE_TYPE_EXTENSION || node.kind === Kind1.UNION_TYPE_EXTENSION || node.kind === Kind1.ENUM_TYPE_EXTENSION || node.kind === Kind1.INPUT_OBJECT_TYPE_EXTENSION;
    }
    const isTypeExtensionNode1 = isTypeExtensionNode;
    const isTypeExtensionNode2 = isTypeExtensionNode1;
    const isTypeExtensionNode3 = isTypeExtensionNode1;
    const Source3 = Source1;
    const getLocation2 = getLocation;
    const printLocation2 = printLocation, printSourceLocation2 = printSourceLocation;
    const Kind21 = Kind1;
    const TokenKind2 = TokenKind;
    const Lexer3 = Lexer1;
    const parse3 = parse1, parseValue2 = parseValue, parseType1 = parseType;
    const print11 = print1;
    const visit7 = visit1, visitInParallel2 = visitInParallel1, getVisitFn3 = getVisitFn1, BREAK2 = BREAK1;
    const isDefinitionNode2 = isDefinitionNode1, isExecutableDefinitionNode3 = isExecutableDefinitionNode1, isSelectionNode2 = isSelectionNode1, isValueNode2 = isValueNode1, isTypeNode2 = isTypeNode1, isTypeSystemDefinitionNode3 = isTypeSystemDefinitionNode1, isTypeDefinitionNode6 = isTypeDefinitionNode1, isTypeSystemExtensionNode3 = isTypeSystemExtensionNode1, isTypeExtensionNode4 = isTypeExtensionNode1;
    const DirectiveLocation3 = DirectiveLocation1;
    function printPathArray(path2) {
        return path2.map((key)=>typeof key === 'number' ? '[' + key.toString() + ']' : '.' + key
        ).join('');
    }
    const __default12 = printPathArray;
    const __default13 = printPathArray;
    const printPathArray1 = printPathArray;
    const printPathArray2 = printPathArray;
    function getVariableValues(schema, varDefNodes, inputs, options) {
        const errors = [];
        const maxErrors = options?.maxErrors;
        try {
            const coerced = coerceVariableValues(schema, varDefNodes, inputs, (error)=>{
                if (maxErrors != null && errors.length >= maxErrors) {
                    throw new GraphQLError1('Too many errors processing variables, error limit reached. Execution aborted.');
                }
                errors.push(error);
            });
            if (errors.length === 0) {
                return {
                    coerced
                };
            }
        } catch (error) {
            errors.push(error);
        }
        return {
            errors
        };
    }
    const getVariableValues1 = getVariableValues;
    const typeFromAST1 = typeFromAST;
    const objectValues2 = objectValues;
    const invariant1 = invariant;
    const inspect4 = inspect;
    function valueFromAST(valueNode, type, variables) {
        if (!valueNode) {
            return;
        }
        if (valueNode.kind === Kind1.VARIABLE) {
            const variableName = valueNode.name.value;
            if (variables == null || variables[variableName] === undefined) {
                return;
            }
            const variableValue = variables[variableName];
            if (variableValue === null && isNonNullType1(type)) {
                return;
            }
            return variableValue;
        }
        if (isNonNullType1(type)) {
            if (valueNode.kind === Kind1.NULL) {
                return;
            }
            return valueFromAST(valueNode, type.ofType, variables);
        }
        if (valueNode.kind === Kind1.NULL) {
            return null;
        }
        if (isListType1(type)) {
            const itemType = type.ofType;
            if (valueNode.kind === Kind1.LIST) {
                const coercedValues = [];
                for (const itemNode of valueNode.values){
                    if (isMissingVariable(itemNode, variables)) {
                        if (isNonNullType1(itemType)) {
                            return;
                        }
                        coercedValues.push(null);
                    } else {
                        const itemValue = valueFromAST(itemNode, itemType, variables);
                        if (itemValue === undefined) {
                            return;
                        }
                        coercedValues.push(itemValue);
                    }
                }
                return coercedValues;
            }
            const coercedValue = valueFromAST(valueNode, itemType, variables);
            if (coercedValue === undefined) {
                return;
            }
            return [
                coercedValue
            ];
        }
        if (isInputObjectType1(type)) {
            if (valueNode.kind !== Kind1.OBJECT) {
                return;
            }
            const coercedObj = Object.create(null);
            const fieldNodes = keyMap(valueNode.fields, (field)=>field.name.value
            );
            for (const field of objectValues(type.getFields())){
                const fieldNode = fieldNodes[field.name];
                if (!fieldNode || isMissingVariable(fieldNode.value, variables)) {
                    if (field.defaultValue !== undefined) {
                        coercedObj[field.name] = field.defaultValue;
                    } else if (isNonNullType1(field.type)) {
                        return;
                    }
                    continue;
                }
                const fieldValue = valueFromAST(fieldNode.value, field.type, variables);
                if (fieldValue === undefined) {
                    return;
                }
                coercedObj[field.name] = fieldValue;
            }
            return coercedObj;
        }
        if (isLeafType1(type)) {
            let result;
            try {
                result = type.parseLiteral(valueNode, variables);
            } catch (_error) {
                return;
            }
            if (result === undefined) {
                return;
            }
            return result;
        }
        invariant(false, 'Unexpected input type: ' + inspect(type));
    }
    const valueFromAST1 = valueFromAST;
    const valueFromAST2 = valueFromAST1;
    const valueFromAST3 = valueFromAST1;
    const valueFromAST4 = valueFromAST1;
    function isMissingVariable(valueNode, variables) {
        return valueNode.kind === Kind1.VARIABLE && (variables == null || variables[valueNode.name.value] === undefined);
    }
    const inspect5 = inspect;
    function coerceInputValue(inputValue, type, onError = defaultOnError) {
        return coerceInputValueImpl(inputValue, type, onError);
    }
    const coerceInputValue1 = coerceInputValue;
    const coerceInputValue2 = coerceInputValue1;
    const inspect6 = inspect;
    function defaultOnError(path2, invalidValue, error) {
        let errorPrefix = 'Invalid value ' + inspect(invalidValue);
        if (path2.length > 0) {
            errorPrefix += ` at "value${printPathArray1(path2)}"`;
        }
        error.message = errorPrefix + ': ' + error.message;
        throw error;
    }
    const pathToArray1 = pathToArray;
    const isCollection1 = isCollection;
    const arrayFrom2 = arrayFrom;
    const addPath1 = addPath;
    const isObjectLike4 = isObjectLike;
    const objectValues3 = objectValues;
    const suggestionList2 = suggestionList;
    const didYouMean2 = didYouMean;
    const invariant2 = invariant;
    function coerceInputValueImpl(inputValue, type, onError, path2) {
        if (isNonNullType1(type)) {
            if (inputValue != null) {
                return coerceInputValueImpl(inputValue, type.ofType, onError, path2);
            }
            onError(pathToArray(path2), inputValue, new GraphQLError1(`Expected non-nullable type "${inspect(type)}" not to be null.`));
            return;
        }
        if (inputValue == null) {
            return null;
        }
        if (isListType1(type)) {
            const itemType = type.ofType;
            if (isCollection(inputValue)) {
                return arrayFrom(inputValue, (itemValue, index)=>{
                    const itemPath = addPath(path2, index);
                    return coerceInputValueImpl(itemValue, itemType, onError, itemPath);
                });
            }
            return [
                coerceInputValueImpl(inputValue, itemType, onError, path2)
            ];
        }
        if (isInputObjectType1(type)) {
            if (!isObjectLike(inputValue)) {
                onError(pathToArray(path2), inputValue, new GraphQLError1(`Expected type "${type.name}" to be an object.`));
                return;
            }
            const coercedValue = {
            };
            const fieldDefs = type.getFields();
            for (const field of objectValues(fieldDefs)){
                const fieldValue = inputValue[field.name];
                if (fieldValue === undefined) {
                    if (field.defaultValue !== undefined) {
                        coercedValue[field.name] = field.defaultValue;
                    } else if (isNonNullType1(field.type)) {
                        const typeStr = inspect(field.type);
                        onError(pathToArray(path2), inputValue, new GraphQLError1(`Field "${field.name}" of required type "${typeStr}" was not provided.`));
                    }
                    continue;
                }
                coercedValue[field.name] = coerceInputValueImpl(fieldValue, field.type, onError, addPath1(path2, field.name));
            }
            for (const fieldName of Object.keys(inputValue)){
                if (!fieldDefs[fieldName]) {
                    const suggestions = suggestionList(fieldName, Object.keys(type.getFields()));
                    onError(pathToArray(path2), inputValue, new GraphQLError1(`Field "${fieldName}" is not defined by type "${type.name}".` + didYouMean(suggestions)));
                }
            }
            return coercedValue;
        }
        if (isLeafType1(type)) {
            let parseResult;
            try {
                parseResult = type.parseValue(inputValue);
            } catch (error) {
                if (error instanceof GraphQLError1) {
                    onError(pathToArray(path2), inputValue, error);
                } else {
                    onError(pathToArray(path2), inputValue, new GraphQLError1(`Expected type "${type.name}". ` + error.message, undefined, undefined, undefined, undefined, error));
                }
                return;
            }
            if (parseResult === undefined) {
                onError(pathToArray(path2), inputValue, new GraphQLError1(`Expected type "${type.name}".`));
            }
            return parseResult;
        }
        invariant(false, 'Unexpected input type: ' + inspect(type));
    }
    function coerceVariableValues(schema, varDefNodes, inputs, onError) {
        const coercedValues = {
        };
        for (const varDefNode of varDefNodes){
            const varName = varDefNode.variable.name.value;
            const varType = typeFromAST(schema, varDefNode.type);
            if (!isInputType1(varType)) {
                const varTypeStr = print1(varDefNode.type);
                onError(new GraphQLError1(`Variable "$${varName}" expected value of type "${varTypeStr}" which cannot be used as an input type.`, varDefNode.type));
                continue;
            }
            if (!hasOwnProperty(inputs, varName)) {
                if (varDefNode.defaultValue) {
                    coercedValues[varName] = valueFromAST4(varDefNode.defaultValue, varType);
                } else if (isNonNullType1(varType)) {
                    const varTypeStr = inspect(varType);
                    onError(new GraphQLError1(`Variable "$${varName}" of required type "${varTypeStr}" was not provided.`, varDefNode));
                }
                continue;
            }
            const value1 = inputs[varName];
            if (value1 === null && isNonNullType1(varType)) {
                const varTypeStr = inspect(varType);
                onError(new GraphQLError1(`Variable "$${varName}" of non-null type "${varTypeStr}" must not be null.`, varDefNode));
                continue;
            }
            coercedValues[varName] = coerceInputValue2(value1, varType, (path2, invalidValue, error)=>{
                let prefix = `Variable "$${varName}" got invalid value ` + inspect5(invalidValue);
                if (path2.length > 0) {
                    prefix += ` at "${varName}${printPathArray2(path2)}"`;
                }
                onError(new GraphQLError41(prefix + '; ' + error.message, varDefNode, undefined, undefined, undefined, error.originalError));
            });
        }
        return coercedValues;
    }
    function getArgumentValues(def, node, variableValues) {
        const coercedValues = {
        };
        const argumentNodes = node.arguments ?? [];
        const argNodeMap = keyMap(argumentNodes, (arg)=>arg.name.value
        );
        for (const argDef of def.args){
            const name1 = argDef.name;
            const argType = argDef.type;
            const argumentNode = argNodeMap[name1];
            if (!argumentNode) {
                if (argDef.defaultValue !== undefined) {
                    coercedValues[name1] = argDef.defaultValue;
                } else if (isNonNullType1(argType)) {
                    throw new GraphQLError1(`Argument "${name1}" of required type "${inspect(argType)}" ` + 'was not provided.', node);
                }
                continue;
            }
            const valueNode = argumentNode.value;
            let isNull = valueNode.kind === Kind1.NULL;
            if (valueNode.kind === Kind1.VARIABLE) {
                const variableName = valueNode.name.value;
                if (variableValues == null || !hasOwnProperty(variableValues, variableName)) {
                    if (argDef.defaultValue !== undefined) {
                        coercedValues[name1] = argDef.defaultValue;
                    } else if (isNonNullType1(argType)) {
                        throw new GraphQLError1(`Argument "${name1}" of required type "${inspect(argType)}" ` + `was provided the variable "$${variableName}" which was not provided a runtime value.`, valueNode);
                    }
                    continue;
                }
                isNull = variableValues[variableName] == null;
            }
            if (isNull && isNonNullType1(argType)) {
                throw new GraphQLError1(`Argument "${name1}" of non-null type "${inspect(argType)}" ` + 'must not be null.', valueNode);
            }
            const coercedValue = valueFromAST1(valueNode, argType, variableValues);
            if (coercedValue === undefined) {
                throw new GraphQLError1(`Argument "${name1}" has invalid value ${print1(valueNode)}.`, valueNode);
            }
            coercedValues[name1] = coercedValue;
        }
        return coercedValues;
    }
    const getArgumentValues1 = getArgumentValues;
    const find2 = find;
    function getDirectiveValues(directiveDef, node, variableValues) {
        const directiveNode = node.directives && find(node.directives, (directive1)=>directive1.name.value === directiveDef.name
        );
        if (directiveNode) {
            return getArgumentValues(directiveDef, directiveNode, variableValues);
        }
    }
    const getDirectiveValues1 = getDirectiveValues;
    const getDirectiveValues2 = getDirectiveValues1;
    function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    const responsePathAsArray = pathToArray;
    const execute2 = execute, defaultFieldResolver1 = defaultFieldResolver, defaultTypeResolver1 = defaultTypeResolver;
    const getDirectiveValues3 = getDirectiveValues1;
    const SYMBOL_ASYNC_ITERATOR1 = SYMBOL_ASYNC_ITERATOR;
    function mapAsyncIterator(iterable, callback, rejectCallback) {
        const iteratorMethod = iterable[SYMBOL_ASYNC_ITERATOR];
        const iterator = iteratorMethod.call(iterable);
        let $return;
        let abruptClose;
        if (typeof iterator.return === 'function') {
            $return = iterator.return;
            abruptClose = (error)=>{
                const rethrow = ()=>Promise.reject(error)
                ;
                return $return.call(iterator).then(rethrow, rethrow);
            };
        }
        function mapResult(result) {
            return result.done ? result : asyncMapValue(result.value, callback).then(iteratorResult, abruptClose);
        }
        let mapReject;
        if (rejectCallback) {
            const reject = rejectCallback;
            mapReject = (error)=>asyncMapValue(error, reject).then(iteratorResult, abruptClose)
            ;
        }
        return {
            next () {
                return iterator.next().then(mapResult, mapReject);
            },
            return () {
                return $return ? $return.call(iterator).then(mapResult, mapReject) : Promise.resolve({
                    value: undefined,
                    done: true
                });
            },
            throw (error) {
                if (typeof iterator.throw === 'function') {
                    return iterator.throw(error).then(mapResult, mapReject);
                }
                return Promise.reject(error).catch(abruptClose);
            },
            [SYMBOL_ASYNC_ITERATOR] () {
                return this;
            }
        };
    }
    const __default14 = mapAsyncIterator;
    const __default15 = mapAsyncIterator;
    const mapAsyncIterator1 = mapAsyncIterator;
    function asyncMapValue(value1, callback) {
        return new Promise((resolve1)=>resolve1(callback(value1))
        );
    }
    function iteratorResult(value1) {
        return {
            value: value1,
            done: false
        };
    }
    function subscribe(argsOrSchema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, subscribeFieldResolver) {
        return arguments.length === 1 ? subscribeImpl(argsOrSchema) : subscribeImpl({
            schema: argsOrSchema,
            document,
            rootValue,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            subscribeFieldResolver
        });
    }
    const subscribe1 = subscribe;
    function reportGraphQLError(error) {
        if (error instanceof GraphQLError1) {
            return {
                errors: [
                    error
                ]
            };
        }
        throw error;
    }
    const execute3 = execute;
    function subscribeImpl(args1) {
        const { schema , document , rootValue , contextValue , variableValues , operationName , fieldResolver , subscribeFieldResolver  } = args1;
        const sourcePromise = createSourceEventStream(schema, document, rootValue, contextValue, variableValues, operationName, subscribeFieldResolver);
        const mapSourceToResponse = (payload)=>execute({
                schema,
                document,
                rootValue: payload,
                contextValue,
                variableValues,
                operationName,
                fieldResolver
            })
        ;
        return sourcePromise.then((resultOrStream)=>isAsyncIterable(resultOrStream) ? mapAsyncIterator(resultOrStream, mapSourceToResponse, reportGraphQLError) : resultOrStream
        );
    }
    const assertValidExecutionArguments1 = assertValidExecutionArguments;
    const buildExecutionContext1 = buildExecutionContext;
    const getOperationRootType1 = getOperationRootType;
    const collectFields1 = collectFields;
    const getFieldDef1 = getFieldDef2;
    const addPath2 = addPath;
    const buildResolveInfo1 = buildResolveInfo;
    const resolveFieldValueOrError1 = resolveFieldValueOrError;
    function locatedError(originalError1, nodes1, path2) {
        if (Array.isArray(originalError1.path)) {
            return originalError1;
        }
        return new GraphQLError1(originalError1.message, originalError1.nodes ?? nodes1, originalError1.source, originalError1.positions, path2, originalError1);
    }
    const locatedError1 = locatedError;
    const locatedError2 = locatedError1;
    const pathToArray2 = pathToArray;
    const inspect7 = inspect;
    function createSourceEventStream(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver) {
        assertValidExecutionArguments(schema, document, variableValues);
        try {
            const exeContext = buildExecutionContext(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver);
            if (Array.isArray(exeContext)) {
                return Promise.resolve({
                    errors: exeContext
                });
            }
            const type = getOperationRootType(schema, exeContext.operation);
            const fields = collectFields(exeContext, type, exeContext.operation.selectionSet, Object.create(null), Object.create(null));
            const responseNames = Object.keys(fields);
            const responseName = responseNames[0];
            const fieldNodes = fields[responseName];
            const fieldNode = fieldNodes[0];
            const fieldName = fieldNode.name.value;
            const fieldDef = getFieldDef2(schema, type, fieldName);
            if (!fieldDef) {
                throw new GraphQLError1(`The subscription field "${fieldName}" is not defined.`, fieldNodes);
            }
            const resolveFn = fieldDef.subscribe ?? exeContext.fieldResolver;
            const path2 = addPath(undefined, responseName);
            const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, type, path2);
            const result = resolveFieldValueOrError(exeContext, fieldDef, fieldNodes, resolveFn, rootValue, info);
            return Promise.resolve(result).then((eventStream)=>{
                if (eventStream instanceof Error) {
                    return {
                        errors: [
                            locatedError1(eventStream, fieldNodes, pathToArray(path2))
                        ]
                    };
                }
                if (isAsyncIterable(eventStream)) {
                    return eventStream;
                }
                throw new Error('Subscription field must return Async Iterable. ' + `Received: ${inspect(eventStream)}.`);
            });
        } catch (error) {
            return error instanceof GraphQLError1 ? Promise.resolve({
                errors: [
                    error
                ]
            }) : Promise.reject(error);
        }
    }
    const createSourceEventStream1 = createSourceEventStream;
    const SYMBOL_ASYNC_ITERATOR2 = SYMBOL_ASYNC_ITERATOR;
    function isAsyncIterable(maybeAsyncIterable) {
        if (maybeAsyncIterable == null || typeof maybeAsyncIterable !== 'object') {
            return false;
        }
        return typeof maybeAsyncIterable[SYMBOL_ASYNC_ITERATOR] === 'function';
    }
    const subscribe2 = subscribe1, createSourceEventStream2 = createSourceEventStream1;
    function ExecutableDefinitionsRule(context) {
        return {
            Document (node) {
                for (const definition of node.definitions){
                    if (!isExecutableDefinitionNode1(definition)) {
                        const defName = definition.kind === Kind1.SCHEMA_DEFINITION || definition.kind === Kind1.SCHEMA_EXTENSION ? 'schema' : '"' + definition.name.value + '"';
                        context.reportError(new GraphQLError1(`The ${defName} definition is not executable.`, definition));
                    }
                }
                return false;
            }
        };
    }
    const ExecutableDefinitionsRule1 = ExecutableDefinitionsRule;
    const ExecutableDefinitionsRule2 = ExecutableDefinitionsRule1;
    function UniqueOperationNamesRule(context) {
        const knownOperationNames = Object.create(null);
        return {
            OperationDefinition (node) {
                const operationName = node.name;
                if (operationName) {
                    if (knownOperationNames[operationName.value]) {
                        context.reportError(new GraphQLError1(`There can be only one operation named "${operationName.value}".`, [
                            knownOperationNames[operationName.value],
                            operationName
                        ]));
                    } else {
                        knownOperationNames[operationName.value] = operationName;
                    }
                }
                return false;
            },
            FragmentDefinition: ()=>false
        };
    }
    const UniqueOperationNamesRule1 = UniqueOperationNamesRule;
    const UniqueOperationNamesRule2 = UniqueOperationNamesRule1;
    function LoneAnonymousOperationRule(context) {
        let operationCount = 0;
        return {
            Document (node) {
                operationCount = node.definitions.filter((definition)=>definition.kind === Kind15.OPERATION_DEFINITION
                ).length;
            },
            OperationDefinition (node) {
                if (!node.name && operationCount > 1) {
                    context.reportError(new GraphQLError1('This anonymous operation must be the only defined operation.', node));
                }
            }
        };
    }
    const LoneAnonymousOperationRule1 = LoneAnonymousOperationRule;
    const LoneAnonymousOperationRule2 = LoneAnonymousOperationRule1;
    function SingleFieldSubscriptionsRule(context) {
        return {
            OperationDefinition (node) {
                if (node.operation === 'subscription') {
                    if (node.selectionSet.selections.length !== 1) {
                        context.reportError(new GraphQLError1(node.name ? `Subscription "${node.name.value}" must select only one top level field.` : 'Anonymous Subscription must select only one top level field.', node.selectionSet.selections.slice(1)));
                    }
                }
            }
        };
    }
    const SingleFieldSubscriptionsRule1 = SingleFieldSubscriptionsRule;
    const SingleFieldSubscriptionsRule2 = SingleFieldSubscriptionsRule1;
    const suggestionList3 = suggestionList;
    const didYouMean3 = didYouMean;
    function KnownTypeNamesRule(context) {
        const schema = context.getSchema();
        const existingTypesMap = schema ? schema.getTypeMap() : Object.create(null);
        const definedTypes = Object.create(null);
        for (const def of context.getDocument().definitions){
            if (isTypeDefinitionNode1(def)) {
                definedTypes[def.name.value] = true;
            }
        }
        const typeNames = Object.keys(existingTypesMap).concat(Object.keys(definedTypes));
        return {
            NamedType (node, _1, parent, _2, ancestors) {
                const typeName = node.name.value;
                if (!existingTypesMap[typeName] && !definedTypes[typeName]) {
                    const definitionNode = ancestors[2] ?? parent;
                    const isSDL = definitionNode != null && isSDLNode(definitionNode);
                    if (isSDL && isSpecifiedScalarName(typeName)) {
                        return;
                    }
                    const suggestedTypes = suggestionList(typeName, isSDL ? specifiedScalarsNames.concat(typeNames) : typeNames);
                    context.reportError(new GraphQLError1(`Unknown type "${typeName}".` + didYouMean(suggestedTypes), node));
                }
            }
        };
    }
    const KnownTypeNamesRule1 = KnownTypeNamesRule;
    const KnownTypeNamesRule2 = KnownTypeNamesRule1;
    const specifiedScalarTypes2 = specifiedScalarTypes;
    const specifiedScalarsNames = specifiedScalarTypes.map((type)=>type.name
    );
    function isSpecifiedScalarName(typeName) {
        return specifiedScalarsNames.indexOf(typeName) !== -1;
    }
    function isSDLNode(value1) {
        return !Array.isArray(value1) && (isTypeSystemDefinitionNode1(value1) || isTypeSystemExtensionNode1(value1));
    }
    const typeFromAST2 = typeFromAST;
    function FragmentsOnCompositeTypesRule(context) {
        return {
            InlineFragment (node) {
                const typeCondition = node.typeCondition;
                if (typeCondition) {
                    const type = typeFromAST(context.getSchema(), typeCondition);
                    if (type && !isCompositeType1(type)) {
                        const typeStr = print1(typeCondition);
                        context.reportError(new GraphQLError1(`Fragment cannot condition on non composite type "${typeStr}".`, typeCondition));
                    }
                }
            },
            FragmentDefinition (node) {
                const type = typeFromAST(context.getSchema(), node.typeCondition);
                if (type && !isCompositeType1(type)) {
                    const typeStr = print1(node.typeCondition);
                    context.reportError(new GraphQLError1(`Fragment "${node.name.value}" cannot condition on non composite type "${typeStr}".`, node.typeCondition));
                }
            }
        };
    }
    const FragmentsOnCompositeTypesRule1 = FragmentsOnCompositeTypesRule;
    const FragmentsOnCompositeTypesRule2 = FragmentsOnCompositeTypesRule1;
    const typeFromAST3 = typeFromAST;
    function VariablesAreInputTypesRule(context) {
        return {
            VariableDefinition (node) {
                const type = typeFromAST(context.getSchema(), node.type);
                if (type && !isInputType1(type)) {
                    const variableName = node.variable.name.value;
                    const typeName = print1(node.type);
                    context.reportError(new GraphQLError1(`Variable "$${variableName}" cannot be non-input type "${typeName}".`, node.type));
                }
            }
        };
    }
    const VariablesAreInputTypesRule1 = VariablesAreInputTypesRule;
    const VariablesAreInputTypesRule2 = VariablesAreInputTypesRule1;
    const inspect8 = inspect;
    function ScalarLeafsRule(context) {
        return {
            Field (node) {
                const type = context.getType();
                const selectionSet = node.selectionSet;
                if (type) {
                    if (isLeafType1(getNamedType1(type))) {
                        if (selectionSet) {
                            const fieldName = node.name.value;
                            const typeStr = inspect(type);
                            context.reportError(new GraphQLError1(`Field "${fieldName}" must not have a selection since type "${typeStr}" has no subfields.`, selectionSet));
                        }
                    } else if (!selectionSet) {
                        const fieldName = node.name.value;
                        const typeStr = inspect(type);
                        context.reportError(new GraphQLError1(`Field "${fieldName}" of type "${typeStr}" must have a selection of subfields. Did you mean "${fieldName} { ... }"?`, node));
                    }
                }
            }
        };
    }
    const ScalarLeafsRule1 = ScalarLeafsRule;
    const ScalarLeafsRule2 = ScalarLeafsRule1;
    const didYouMean4 = didYouMean;
    function FieldsOnCorrectTypeRule(context) {
        return {
            Field (node) {
                const type = context.getParentType();
                if (type) {
                    const fieldDef = context.getFieldDef();
                    if (!fieldDef) {
                        const schema = context.getSchema();
                        const fieldName = node.name.value;
                        let suggestion = didYouMean('to use an inline fragment on', getSuggestedTypeNames(schema, type, fieldName));
                        if (suggestion === '') {
                            suggestion = didYouMean4(getSuggestedFieldNames(type, fieldName));
                        }
                        context.reportError(new GraphQLError1(`Cannot query field "${fieldName}" on type "${type.name}".` + suggestion, node));
                    }
                }
            }
        };
    }
    const FieldsOnCorrectTypeRule1 = FieldsOnCorrectTypeRule;
    const FieldsOnCorrectTypeRule2 = FieldsOnCorrectTypeRule1;
    const arrayFrom3 = arrayFrom;
    function getSuggestedTypeNames(schema, type, fieldName) {
        if (!isAbstractType1(type)) {
            return [];
        }
        const suggestedTypes = new Set();
        const usageCount = Object.create(null);
        for (const possibleType of schema.getPossibleTypes(type)){
            if (!possibleType.getFields()[fieldName]) {
                continue;
            }
            suggestedTypes.add(possibleType);
            usageCount[possibleType.name] = 1;
            for (const possibleInterface of possibleType.getInterfaces()){
                if (!possibleInterface.getFields()[fieldName]) {
                    continue;
                }
                suggestedTypes.add(possibleInterface);
                usageCount[possibleInterface.name] = (usageCount[possibleInterface.name] ?? 0) + 1;
            }
        }
        return arrayFrom(suggestedTypes).sort((typeA, typeB)=>{
            const usageCountDiff = usageCount[typeB.name] - usageCount[typeA.name];
            if (usageCountDiff !== 0) {
                return usageCountDiff;
            }
            if (isInterfaceType1(typeA) && schema.isSubType(typeA, typeB)) {
                return -1;
            }
            if (isInterfaceType1(typeB) && schema.isSubType(typeB, typeA)) {
                return 1;
            }
            return typeA.name.localeCompare(typeB.name);
        }).map((x)=>x.name
        );
    }
    const suggestionList4 = suggestionList;
    function getSuggestedFieldNames(type, fieldName) {
        if (isObjectType1(type) || isInterfaceType1(type)) {
            const possibleFieldNames = Object.keys(type.getFields());
            return suggestionList(fieldName, possibleFieldNames);
        }
        return [];
    }
    function UniqueFragmentNamesRule(context) {
        const knownFragmentNames = Object.create(null);
        return {
            OperationDefinition: ()=>false
            ,
            FragmentDefinition (node) {
                const fragmentName = node.name.value;
                if (knownFragmentNames[fragmentName]) {
                    context.reportError(new GraphQLError1(`There can be only one fragment named "${fragmentName}".`, [
                        knownFragmentNames[fragmentName],
                        node.name
                    ]));
                } else {
                    knownFragmentNames[fragmentName] = node.name;
                }
                return false;
            }
        };
    }
    const UniqueFragmentNamesRule1 = UniqueFragmentNamesRule;
    const UniqueFragmentNamesRule2 = UniqueFragmentNamesRule1;
    function KnownFragmentNamesRule(context) {
        return {
            FragmentSpread (node) {
                const fragmentName = node.name.value;
                const fragment = context.getFragment(fragmentName);
                if (!fragment) {
                    context.reportError(new GraphQLError1(`Unknown fragment "${fragmentName}".`, node.name));
                }
            }
        };
    }
    const KnownFragmentNamesRule1 = KnownFragmentNamesRule;
    const KnownFragmentNamesRule2 = KnownFragmentNamesRule1;
    function NoUnusedFragmentsRule(context) {
        const operationDefs = [];
        const fragmentDefs = [];
        return {
            OperationDefinition (node) {
                operationDefs.push(node);
                return false;
            },
            FragmentDefinition (node) {
                fragmentDefs.push(node);
                return false;
            },
            Document: {
                leave () {
                    const fragmentNameUsed = Object.create(null);
                    for (const operation of operationDefs){
                        for (const fragment of context.getRecursivelyReferencedFragments(operation)){
                            fragmentNameUsed[fragment.name.value] = true;
                        }
                    }
                    for (const fragmentDef of fragmentDefs){
                        const fragName = fragmentDef.name.value;
                        if (fragmentNameUsed[fragName] !== true) {
                            context.reportError(new GraphQLError1(`Fragment "${fragName}" is never used.`, fragmentDef));
                        }
                    }
                }
            }
        };
    }
    const NoUnusedFragmentsRule1 = NoUnusedFragmentsRule;
    const NoUnusedFragmentsRule2 = NoUnusedFragmentsRule1;
    function isEqualType(typeA, typeB) {
        if (typeA === typeB) {
            return true;
        }
        if (isNonNullType1(typeA) && isNonNullType1(typeB)) {
            return isEqualType(typeA.ofType, typeB.ofType);
        }
        if (isListType1(typeA) && isListType1(typeB)) {
            return isEqualType(typeA.ofType, typeB.ofType);
        }
        return false;
    }
    const isEqualType1 = isEqualType;
    function isTypeSubTypeOf(schema, maybeSubType, superType) {
        if (maybeSubType === superType) {
            return true;
        }
        if (isNonNullType1(superType)) {
            if (isNonNullType1(maybeSubType)) {
                return isTypeSubTypeOf(schema, maybeSubType.ofType, superType.ofType);
            }
            return false;
        }
        if (isNonNullType1(maybeSubType)) {
            return isTypeSubTypeOf(schema, maybeSubType.ofType, superType);
        }
        if (isListType1(superType)) {
            if (isListType1(maybeSubType)) {
                return isTypeSubTypeOf(schema, maybeSubType.ofType, superType.ofType);
            }
            return false;
        }
        if (isListType1(maybeSubType)) {
            return false;
        }
        return isAbstractType1(superType) && (isInterfaceType1(maybeSubType) || isObjectType1(maybeSubType)) && schema.isSubType(superType, maybeSubType);
    }
    const isTypeSubTypeOf1 = isTypeSubTypeOf;
    const isTypeSubTypeOf2 = isTypeSubTypeOf1;
    function doTypesOverlap(schema, typeA, typeB) {
        if (typeA === typeB) {
            return true;
        }
        if (isAbstractType1(typeA)) {
            if (isAbstractType1(typeB)) {
                return schema.getPossibleTypes(typeA).some((type)=>schema.isSubType(typeB, type)
                );
            }
            return schema.isSubType(typeA, typeB);
        }
        if (isAbstractType1(typeB)) {
            return schema.isSubType(typeB, typeA);
        }
        return false;
    }
    const doTypesOverlap1 = doTypesOverlap;
    const doTypesOverlap2 = doTypesOverlap1;
    const inspect9 = inspect;
    function PossibleFragmentSpreadsRule(context) {
        return {
            InlineFragment (node) {
                const fragType = context.getType();
                const parentType = context.getParentType();
                if (isCompositeType1(fragType) && isCompositeType1(parentType) && !doTypesOverlap1(context.getSchema(), fragType, parentType)) {
                    const parentTypeStr = inspect(parentType);
                    const fragTypeStr = inspect(fragType);
                    context.reportError(new GraphQLError1(`Fragment cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, node));
                }
            },
            FragmentSpread (node) {
                const fragName = node.name.value;
                const fragType = getFragmentType(context, fragName);
                const parentType = context.getParentType();
                if (fragType && parentType && !doTypesOverlap1(context.getSchema(), fragType, parentType)) {
                    const parentTypeStr = inspect(parentType);
                    const fragTypeStr = inspect(fragType);
                    context.reportError(new GraphQLError1(`Fragment "${fragName}" cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, node));
                }
            }
        };
    }
    const PossibleFragmentSpreadsRule1 = PossibleFragmentSpreadsRule;
    const PossibleFragmentSpreadsRule2 = PossibleFragmentSpreadsRule1;
    const typeFromAST4 = typeFromAST;
    function getFragmentType(context, name1) {
        const frag = context.getFragment(name1);
        if (frag) {
            const type = typeFromAST(context.getSchema(), frag.typeCondition);
            if (isCompositeType1(type)) {
                return type;
            }
        }
    }
    function NoFragmentCyclesRule(context) {
        const visitedFrags = Object.create(null);
        const spreadPath = [];
        const spreadPathIndexByName = Object.create(null);
        return {
            OperationDefinition: ()=>false
            ,
            FragmentDefinition (node) {
                detectCycleRecursive(node);
                return false;
            }
        };
        function detectCycleRecursive(fragment) {
            if (visitedFrags[fragment.name.value]) {
                return;
            }
            const fragmentName = fragment.name.value;
            visitedFrags[fragmentName] = true;
            const spreadNodes = context.getFragmentSpreads(fragment.selectionSet);
            if (spreadNodes.length === 0) {
                return;
            }
            spreadPathIndexByName[fragmentName] = spreadPath.length;
            for (const spreadNode of spreadNodes){
                const spreadName = spreadNode.name.value;
                const cycleIndex = spreadPathIndexByName[spreadName];
                spreadPath.push(spreadNode);
                if (cycleIndex === undefined) {
                    const spreadFragment = context.getFragment(spreadName);
                    if (spreadFragment) {
                        detectCycleRecursive(spreadFragment);
                    }
                } else {
                    const cyclePath = spreadPath.slice(cycleIndex);
                    const viaPath = cyclePath.slice(0, -1).map((s)=>'"' + s.name.value + '"'
                    ).join(', ');
                    context.reportError(new GraphQLError1(`Cannot spread fragment "${spreadName}" within itself` + (viaPath !== '' ? ` via ${viaPath}.` : '.'), cyclePath));
                }
                spreadPath.pop();
            }
            spreadPathIndexByName[fragmentName] = undefined;
        }
    }
    const NoFragmentCyclesRule1 = NoFragmentCyclesRule;
    const NoFragmentCyclesRule2 = NoFragmentCyclesRule1;
    function UniqueVariableNamesRule(context) {
        let knownVariableNames = Object.create(null);
        return {
            OperationDefinition () {
                knownVariableNames = Object.create(null);
            },
            VariableDefinition (node) {
                const variableName = node.variable.name.value;
                if (knownVariableNames[variableName]) {
                    context.reportError(new GraphQLError1(`There can be only one variable named "$${variableName}".`, [
                        knownVariableNames[variableName],
                        node.variable.name
                    ]));
                } else {
                    knownVariableNames[variableName] = node.variable.name;
                }
            }
        };
    }
    const UniqueVariableNamesRule1 = UniqueVariableNamesRule;
    const UniqueVariableNamesRule2 = UniqueVariableNamesRule1;
    function NoUndefinedVariablesRule(context) {
        let variableNameDefined = Object.create(null);
        return {
            OperationDefinition: {
                enter () {
                    variableNameDefined = Object.create(null);
                },
                leave (operation) {
                    const usages = context.getRecursiveVariableUsages(operation);
                    for (const { node  } of usages){
                        const varName = node.name.value;
                        if (variableNameDefined[varName] !== true) {
                            context.reportError(new GraphQLError1(operation.name ? `Variable "$${varName}" is not defined by operation "${operation.name.value}".` : `Variable "$${varName}" is not defined.`, [
                                node,
                                operation
                            ]));
                        }
                    }
                }
            },
            VariableDefinition (node) {
                variableNameDefined[node.variable.name.value] = true;
            }
        };
    }
    const NoUndefinedVariablesRule1 = NoUndefinedVariablesRule;
    const NoUndefinedVariablesRule2 = NoUndefinedVariablesRule1;
    function NoUnusedVariablesRule(context) {
        let variableDefs = [];
        return {
            OperationDefinition: {
                enter () {
                    variableDefs = [];
                },
                leave (operation) {
                    const variableNameUsed = Object.create(null);
                    const usages = context.getRecursiveVariableUsages(operation);
                    for (const { node  } of usages){
                        variableNameUsed[node.name.value] = true;
                    }
                    for (const variableDef of variableDefs){
                        const variableName = variableDef.variable.name.value;
                        if (variableNameUsed[variableName] !== true) {
                            context.reportError(new GraphQLError1(operation.name ? `Variable "$${variableName}" is never used in operation "${operation.name.value}".` : `Variable "$${variableName}" is never used.`, variableDef));
                        }
                    }
                }
            },
            VariableDefinition (def) {
                variableDefs.push(def);
            }
        };
    }
    const NoUnusedVariablesRule1 = NoUnusedVariablesRule;
    const NoUnusedVariablesRule2 = NoUnusedVariablesRule1;
    const specifiedDirectives3 = specifiedDirectives;
    function KnownDirectivesRule(context) {
        const locationsMap = Object.create(null);
        const schema = context.getSchema();
        const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
        for (const directive1 of definedDirectives){
            locationsMap[directive1.name] = directive1.locations;
        }
        const astDefinitions = context.getDocument().definitions;
        for (const def of astDefinitions){
            if (def.kind === Kind1.DIRECTIVE_DEFINITION) {
                locationsMap[def.name.value] = def.locations.map((name1)=>name1.value
                );
            }
        }
        return {
            Directive (node, _key, _parent, _path, ancestors) {
                const name1 = node.name.value;
                const locations = locationsMap[name1];
                if (!locations) {
                    context.reportError(new GraphQLError1(`Unknown directive "@${name1}".`, node));
                    return;
                }
                const candidateLocation = getDirectiveLocationForASTPath(ancestors);
                if (candidateLocation && locations.indexOf(candidateLocation) === -1) {
                    context.reportError(new GraphQLError1(`Directive "@${name1}" may not be used on ${candidateLocation}.`, node));
                }
            }
        };
    }
    const KnownDirectivesRule1 = KnownDirectivesRule;
    const KnownDirectivesRule2 = KnownDirectivesRule1;
    const invariant3 = invariant;
    function getDirectiveLocationForASTPath(ancestors) {
        const appliedTo = ancestors[ancestors.length - 1];
        invariant(!Array.isArray(appliedTo));
        switch(appliedTo.kind){
            case Kind1.OPERATION_DEFINITION:
                return getDirectiveLocationForOperation(appliedTo.operation);
            case Kind1.FIELD:
                return DirectiveLocation1.FIELD;
            case Kind1.FRAGMENT_SPREAD:
                return DirectiveLocation1.FRAGMENT_SPREAD;
            case Kind1.INLINE_FRAGMENT:
                return DirectiveLocation1.INLINE_FRAGMENT;
            case Kind1.FRAGMENT_DEFINITION:
                return DirectiveLocation1.FRAGMENT_DEFINITION;
            case Kind1.VARIABLE_DEFINITION:
                return DirectiveLocation1.VARIABLE_DEFINITION;
            case Kind1.SCHEMA_DEFINITION:
            case Kind1.SCHEMA_EXTENSION:
                return DirectiveLocation1.SCHEMA;
            case Kind1.SCALAR_TYPE_DEFINITION:
            case Kind1.SCALAR_TYPE_EXTENSION:
                return DirectiveLocation1.SCALAR;
            case Kind1.OBJECT_TYPE_DEFINITION:
            case Kind1.OBJECT_TYPE_EXTENSION:
                return DirectiveLocation1.OBJECT;
            case Kind1.FIELD_DEFINITION:
                return DirectiveLocation1.FIELD_DEFINITION;
            case Kind1.INTERFACE_TYPE_DEFINITION:
            case Kind1.INTERFACE_TYPE_EXTENSION:
                return DirectiveLocation1.INTERFACE;
            case Kind1.UNION_TYPE_DEFINITION:
            case Kind1.UNION_TYPE_EXTENSION:
                return DirectiveLocation1.UNION;
            case Kind1.ENUM_TYPE_DEFINITION:
            case Kind1.ENUM_TYPE_EXTENSION:
                return DirectiveLocation1.ENUM;
            case Kind1.ENUM_VALUE_DEFINITION:
                return DirectiveLocation1.ENUM_VALUE;
            case Kind1.INPUT_OBJECT_TYPE_DEFINITION:
            case Kind1.INPUT_OBJECT_TYPE_EXTENSION:
                return DirectiveLocation1.INPUT_OBJECT;
            case Kind1.INPUT_VALUE_DEFINITION:
                {
                    const parentNode = ancestors[ancestors.length - 3];
                    return parentNode.kind === Kind1.INPUT_OBJECT_TYPE_DEFINITION ? DirectiveLocation1.INPUT_FIELD_DEFINITION : DirectiveLocation1.ARGUMENT_DEFINITION;
                }
        }
    }
    const inspect10 = inspect;
    function getDirectiveLocationForOperation(operation) {
        switch(operation){
            case 'query':
                return DirectiveLocation1.QUERY;
            case 'mutation':
                return DirectiveLocation1.MUTATION;
            case 'subscription':
                return DirectiveLocation1.SUBSCRIPTION;
        }
        invariant(false, 'Unexpected operation: ' + inspect(operation));
    }
    const specifiedDirectives4 = specifiedDirectives;
    function UniqueDirectivesPerLocationRule(context) {
        const uniqueDirectiveMap = Object.create(null);
        const schema = context.getSchema();
        const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
        for (const directive1 of definedDirectives){
            uniqueDirectiveMap[directive1.name] = !directive1.isRepeatable;
        }
        const astDefinitions = context.getDocument().definitions;
        for (const def of astDefinitions){
            if (def.kind === Kind1.DIRECTIVE_DEFINITION) {
                uniqueDirectiveMap[def.name.value] = !def.repeatable;
            }
        }
        const schemaDirectives = Object.create(null);
        const typeDirectivesMap = Object.create(null);
        return {
            enter (node) {
                if (node.directives == null) {
                    return;
                }
                let seenDirectives;
                if (node.kind === Kind1.SCHEMA_DEFINITION || node.kind === Kind1.SCHEMA_EXTENSION) {
                    seenDirectives = schemaDirectives;
                } else if (isTypeDefinitionNode1(node) || isTypeExtensionNode1(node)) {
                    const typeName = node.name.value;
                    seenDirectives = typeDirectivesMap[typeName];
                    if (seenDirectives === undefined) {
                        typeDirectivesMap[typeName] = seenDirectives = Object.create(null);
                    }
                } else {
                    seenDirectives = Object.create(null);
                }
                for (const directive2 of node.directives){
                    const directiveName = directive2.name.value;
                    if (uniqueDirectiveMap[directiveName]) {
                        if (seenDirectives[directiveName]) {
                            context.reportError(new GraphQLError1(`The directive "@${directiveName}" can only be used once at this location.`, [
                                seenDirectives[directiveName],
                                directive2
                            ]));
                        } else {
                            seenDirectives[directiveName] = directive2;
                        }
                    }
                }
            }
        };
    }
    const UniqueDirectivesPerLocationRule1 = UniqueDirectivesPerLocationRule;
    const UniqueDirectivesPerLocationRule2 = UniqueDirectivesPerLocationRule1;
    const suggestionList5 = suggestionList;
    const didYouMean5 = didYouMean;
    function KnownArgumentNamesRule(context) {
        return {
            ...KnownArgumentNamesOnDirectivesRule(context),
            Argument (argNode) {
                const argDef = context.getArgument();
                const fieldDef = context.getFieldDef();
                const parentType = context.getParentType();
                if (!argDef && fieldDef && parentType) {
                    const argName = argNode.name.value;
                    const knownArgsNames = fieldDef.args.map((arg)=>arg.name
                    );
                    const suggestions = suggestionList(argName, knownArgsNames);
                    context.reportError(new GraphQLError1(`Unknown argument "${argName}" on field "${parentType.name}.${fieldDef.name}".` + didYouMean(suggestions), argNode));
                }
            }
        };
    }
    const KnownArgumentNamesRule1 = KnownArgumentNamesRule;
    const KnownArgumentNamesRule2 = KnownArgumentNamesRule1;
    const specifiedDirectives5 = specifiedDirectives;
    function KnownArgumentNamesOnDirectivesRule(context) {
        const directiveArgs = Object.create(null);
        const schema = context.getSchema();
        const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
        for (const directive1 of definedDirectives){
            directiveArgs[directive1.name] = directive1.args.map((arg)=>arg.name
            );
        }
        const astDefinitions = context.getDocument().definitions;
        for (const def of astDefinitions){
            if (def.kind === Kind1.DIRECTIVE_DEFINITION) {
                const argsNodes = def.arguments ?? [];
                directiveArgs[def.name.value] = argsNodes.map((arg)=>arg.name.value
                );
            }
        }
        return {
            Directive (directiveNode) {
                const directiveName = directiveNode.name.value;
                const knownArgs = directiveArgs[directiveName];
                if (directiveNode.arguments && knownArgs) {
                    for (const argNode of directiveNode.arguments){
                        const argName = argNode.name.value;
                        if (knownArgs.indexOf(argName) === -1) {
                            const suggestions = suggestionList(argName, knownArgs);
                            context.reportError(new GraphQLError1(`Unknown argument "${argName}" on directive "@${directiveName}".` + didYouMean(suggestions), argNode));
                        }
                    }
                }
                return false;
            }
        };
    }
    const KnownArgumentNamesOnDirectivesRule1 = KnownArgumentNamesOnDirectivesRule;
    const KnownArgumentNamesOnDirectivesRule2 = KnownArgumentNamesOnDirectivesRule1;
    function UniqueArgumentNamesRule(context) {
        let knownArgNames = Object.create(null);
        return {
            Field () {
                knownArgNames = Object.create(null);
            },
            Directive () {
                knownArgNames = Object.create(null);
            },
            Argument (node) {
                const argName = node.name.value;
                if (knownArgNames[argName]) {
                    context.reportError(new GraphQLError1(`There can be only one argument named "${argName}".`, [
                        knownArgNames[argName],
                        node.name
                    ]));
                } else {
                    knownArgNames[argName] = node.name;
                }
                return false;
            }
        };
    }
    const UniqueArgumentNamesRule1 = UniqueArgumentNamesRule;
    const UniqueArgumentNamesRule2 = UniqueArgumentNamesRule1;
    const objectValues4 = objectValues;
    const inspect11 = inspect;
    const suggestionList6 = suggestionList;
    const didYouMean6 = didYouMean;
    function ValuesOfCorrectTypeRule(context) {
        return {
            ListValue (node) {
                const type = getNullableType1(context.getParentInputType());
                if (!isListType1(type)) {
                    isValidValueNode(context, node);
                    return false;
                }
            },
            ObjectValue (node) {
                const type = getNamedType1(context.getInputType());
                if (!isInputObjectType1(type)) {
                    isValidValueNode(context, node);
                    return false;
                }
                const fieldNodeMap = keyMap(node.fields, (field)=>field.name.value
                );
                for (const fieldDef of objectValues(type.getFields())){
                    const fieldNode = fieldNodeMap[fieldDef.name];
                    if (!fieldNode && isRequiredInputField1(fieldDef)) {
                        const typeStr = inspect(fieldDef.type);
                        context.reportError(new GraphQLError1(`Field "${type.name}.${fieldDef.name}" of required type "${typeStr}" was not provided.`, node));
                    }
                }
            },
            ObjectField (node) {
                const parentType = getNamedType1(context.getParentInputType());
                const fieldType = context.getInputType();
                if (!fieldType && isInputObjectType1(parentType)) {
                    const suggestions = suggestionList(node.name.value, Object.keys(parentType.getFields()));
                    context.reportError(new GraphQLError1(`Field "${node.name.value}" is not defined by type "${parentType.name}".` + didYouMean(suggestions), node));
                }
            },
            NullValue (node) {
                const type = context.getInputType();
                if (isNonNullType1(type)) {
                    context.reportError(new GraphQLError1(`Expected value of type "${inspect(type)}", found ${print1(node)}.`, node));
                }
            },
            EnumValue: (node)=>isValidValueNode(context, node)
            ,
            IntValue: (node)=>isValidValueNode(context, node)
            ,
            FloatValue: (node)=>isValidValueNode(context, node)
            ,
            StringValue: (node)=>isValidValueNode(context, node)
            ,
            BooleanValue: (node)=>isValidValueNode(context, node)
        };
    }
    const ValuesOfCorrectTypeRule1 = ValuesOfCorrectTypeRule;
    const ValuesOfCorrectTypeRule2 = ValuesOfCorrectTypeRule1;
    function isValidValueNode(context, node) {
        const locationType = context.getInputType();
        if (!locationType) {
            return;
        }
        const type = getNamedType1(locationType);
        if (!isLeafType1(type)) {
            const typeStr = inspect(locationType);
            context.reportError(new GraphQLError1(`Expected value of type "${typeStr}", found ${print1(node)}.`, node));
            return;
        }
        try {
            const parseResult = type.parseLiteral(node, undefined);
            if (parseResult === undefined) {
                const typeStr = inspect(locationType);
                context.reportError(new GraphQLError1(`Expected value of type "${typeStr}", found ${print1(node)}.`, node));
            }
        } catch (error) {
            const typeStr = inspect(locationType);
            if (error instanceof GraphQLError1) {
                context.reportError(error);
            } else {
                context.reportError(new GraphQLError1(`Expected value of type "${typeStr}", found ${print1(node)}; ` + error.message, node, undefined, undefined, undefined, error));
            }
        }
    }
    const inspect12 = inspect;
    function ProvidedRequiredArgumentsRule(context) {
        return {
            ...ProvidedRequiredArgumentsOnDirectivesRule(context),
            Field: {
                leave (fieldNode) {
                    const fieldDef = context.getFieldDef();
                    if (!fieldDef) {
                        return false;
                    }
                    const argNodes = fieldNode.arguments ?? [];
                    const argNodeMap = keyMap(argNodes, (arg)=>arg.name.value
                    );
                    for (const argDef of fieldDef.args){
                        const argNode = argNodeMap[argDef.name];
                        if (!argNode && isRequiredArgument1(argDef)) {
                            const argTypeStr = inspect(argDef.type);
                            context.reportError(new GraphQLError1(`Field "${fieldDef.name}" argument "${argDef.name}" of type "${argTypeStr}" is required, but it was not provided.`, fieldNode));
                        }
                    }
                }
            }
        };
    }
    const ProvidedRequiredArgumentsRule1 = ProvidedRequiredArgumentsRule;
    const ProvidedRequiredArgumentsRule2 = ProvidedRequiredArgumentsRule1;
    const specifiedDirectives6 = specifiedDirectives;
    function ProvidedRequiredArgumentsOnDirectivesRule(context) {
        const requiredArgsMap = Object.create(null);
        const schema = context.getSchema();
        const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
        for (const directive1 of definedDirectives){
            requiredArgsMap[directive1.name] = keyMap4(directive1.args.filter(isRequiredArgument3), (arg)=>arg.name
            );
        }
        const astDefinitions = context.getDocument().definitions;
        for (const def of astDefinitions){
            if (def.kind === Kind1.DIRECTIVE_DEFINITION) {
                const argNodes = def.arguments ?? [];
                requiredArgsMap[def.name.value] = keyMap4(argNodes.filter(isRequiredArgumentNode), (arg)=>arg.name.value
                );
            }
        }
        return {
            Directive: {
                leave (directiveNode) {
                    const directiveName = directiveNode.name.value;
                    const requiredArgs = requiredArgsMap[directiveName];
                    if (requiredArgs) {
                        const argNodes = directiveNode.arguments ?? [];
                        const argNodeMap = keyMap(argNodes, (arg)=>arg.name.value
                        );
                        for (const argName of Object.keys(requiredArgs)){
                            if (!argNodeMap[argName]) {
                                const argType = requiredArgs[argName].type;
                                const argTypeStr = isType1(argType) ? inspect(argType) : print1(argType);
                                context.reportError(new GraphQLError1(`Directive "@${directiveName}" argument "${argName}" of type "${argTypeStr}" is required, but it was not provided.`, directiveNode));
                            }
                        }
                    }
                }
            }
        };
    }
    const ProvidedRequiredArgumentsOnDirectivesRule1 = ProvidedRequiredArgumentsOnDirectivesRule;
    const ProvidedRequiredArgumentsOnDirectivesRule2 = ProvidedRequiredArgumentsOnDirectivesRule1;
    function isRequiredArgumentNode(arg) {
        return arg.type.kind === Kind1.NON_NULL_TYPE && arg.defaultValue == null;
    }
    const typeFromAST5 = typeFromAST;
    const inspect13 = inspect;
    function VariablesInAllowedPositionRule(context) {
        let varDefMap = Object.create(null);
        return {
            OperationDefinition: {
                enter () {
                    varDefMap = Object.create(null);
                },
                leave (operation) {
                    const usages = context.getRecursiveVariableUsages(operation);
                    for (const { node , type , defaultValue  } of usages){
                        const varName = node.name.value;
                        const varDef = varDefMap[varName];
                        if (varDef && type) {
                            const schema = context.getSchema();
                            const varType = typeFromAST(schema, varDef.type);
                            if (varType && !allowedVariableUsage(schema, varType, varDef.defaultValue, type, defaultValue)) {
                                const varTypeStr = inspect(varType);
                                const typeStr = inspect(type);
                                context.reportError(new GraphQLError1(`Variable "$${varName}" of type "${varTypeStr}" used in position expecting type "${typeStr}".`, [
                                    varDef,
                                    node
                                ]));
                            }
                        }
                    }
                }
            },
            VariableDefinition (node) {
                varDefMap[node.variable.name.value] = node;
            }
        };
    }
    const VariablesInAllowedPositionRule1 = VariablesInAllowedPositionRule;
    const VariablesInAllowedPositionRule2 = VariablesInAllowedPositionRule1;
    function allowedVariableUsage(schema, varType, varDefaultValue, locationType, locationDefaultValue) {
        if (isNonNullType1(locationType) && !isNonNullType1(varType)) {
            const hasNonNullVariableDefaultValue = varDefaultValue != null && varDefaultValue.kind !== Kind1.NULL;
            const hasLocationDefaultValue = locationDefaultValue !== undefined;
            if (!hasNonNullVariableDefaultValue && !hasLocationDefaultValue) {
                return false;
            }
            const nullableLocationType = locationType.ofType;
            return isTypeSubTypeOf1(schema, varType, nullableLocationType);
        }
        return isTypeSubTypeOf1(schema, varType, locationType);
    }
    function reasonMessage(reason) {
        if (Array.isArray(reason)) {
            return reason.map(([responseName, subReason])=>`subfields "${responseName}" conflict because ` + reasonMessage(subReason)
            ).join(' and ');
        }
        return reason;
    }
    function OverlappingFieldsCanBeMergedRule(context) {
        const comparedFragmentPairs = new PairSet();
        const cachedFieldsAndFragmentNames = new Map();
        return {
            SelectionSet (selectionSet) {
                const conflicts = findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, context.getParentType(), selectionSet);
                for (const [[responseName, reason], fields1, fields2] of conflicts){
                    const reasonMsg = reasonMessage(reason);
                    context.reportError(new GraphQLError1(`Fields "${responseName}" conflict because ${reasonMsg}. Use different aliases on the fields to fetch both if this was intentional.`, fields1.concat(fields2)));
                }
            }
        };
    }
    const OverlappingFieldsCanBeMergedRule1 = OverlappingFieldsCanBeMergedRule;
    const OverlappingFieldsCanBeMergedRule2 = OverlappingFieldsCanBeMergedRule1;
    function findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentType, selectionSet) {
        const conflicts = [];
        const [fieldMap, fragmentNames] = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType, selectionSet);
        collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, fieldMap);
        if (fragmentNames.length !== 0) {
            for(let i = 0; i < fragmentNames.length; i++){
                collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, false, fieldMap, fragmentNames[i]);
                for(let j = i + 1; j < fragmentNames.length; j++){
                    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, false, fragmentNames[i], fragmentNames[j]);
                }
            }
        }
        return conflicts;
    }
    function collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fragmentName) {
        const fragment = context.getFragment(fragmentName);
        if (!fragment) {
            return;
        }
        const [fieldMap2, fragmentNames2] = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment);
        if (fieldMap === fieldMap2) {
            return;
        }
        collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fieldMap2);
        for(let i = 0; i < fragmentNames2.length; i++){
            collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fragmentNames2[i]);
        }
    }
    function collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, fragmentName2) {
        if (fragmentName1 === fragmentName2) {
            return;
        }
        if (comparedFragmentPairs.has(fragmentName1, fragmentName2, areMutuallyExclusive)) {
            return;
        }
        comparedFragmentPairs.add(fragmentName1, fragmentName2, areMutuallyExclusive);
        const fragment1 = context.getFragment(fragmentName1);
        const fragment2 = context.getFragment(fragmentName2);
        if (!fragment1 || !fragment2) {
            return;
        }
        const [fieldMap1, fragmentNames1] = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment1);
        const [fieldMap2, fragmentNames2] = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment2);
        collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fieldMap2);
        for(let j = 0; j < fragmentNames2.length; j++){
            collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, fragmentNames2[j]);
        }
        for(let i = 0; i < fragmentNames1.length; i++){
            collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentNames1[i], fragmentName2);
        }
    }
    function findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, parentType1, selectionSet1, parentType2, selectionSet2) {
        const conflicts = [];
        const [fieldMap1, fragmentNames1] = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType1, selectionSet1);
        const [fieldMap2, fragmentNames2] = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType2, selectionSet2);
        collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fieldMap2);
        if (fragmentNames2.length !== 0) {
            for(let j = 0; j < fragmentNames2.length; j++){
                collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fragmentNames2[j]);
            }
        }
        if (fragmentNames1.length !== 0) {
            for(let i = 0; i < fragmentNames1.length; i++){
                collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fieldMap2, fragmentNames1[i]);
            }
        }
        for(let i = 0; i < fragmentNames1.length; i++){
            for(let j = 0; j < fragmentNames2.length; j++){
                collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, fragmentNames1[i], fragmentNames2[j]);
            }
        }
        return conflicts;
    }
    const objectEntries5 = objectEntries;
    function collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, fieldMap) {
        for (const [responseName, fields] of objectEntries(fieldMap)){
            if (fields.length > 1) {
                for(let i = 0; i < fields.length; i++){
                    for(let j = i + 1; j < fields.length; j++){
                        const conflict = findConflict(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, false, responseName, fields[i], fields[j]);
                        if (conflict) {
                            conflicts.push(conflict);
                        }
                    }
                }
            }
        }
    }
    function collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, fieldMap1, fieldMap2) {
        for (const responseName of Object.keys(fieldMap1)){
            const fields2 = fieldMap2[responseName];
            if (fields2) {
                const fields1 = fieldMap1[responseName];
                for(let i = 0; i < fields1.length; i++){
                    for(let j = 0; j < fields2.length; j++){
                        const conflict = findConflict(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, fields1[i], fields2[j]);
                        if (conflict) {
                            conflicts.push(conflict);
                        }
                    }
                }
            }
        }
    }
    const inspect14 = inspect;
    function findConflict(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, field1, field2) {
        const [parentType1, node1, def1] = field1;
        const [parentType2, node2, def2] = field2;
        const areMutuallyExclusive = parentFieldsAreMutuallyExclusive || parentType1 !== parentType2 && isObjectType1(parentType1) && isObjectType1(parentType2);
        if (!areMutuallyExclusive) {
            const name1 = node1.name.value;
            const name2 = node2.name.value;
            if (name1 !== name2) {
                return [
                    [
                        responseName,
                        `"${name1}" and "${name2}" are different fields`
                    ],
                    [
                        node1
                    ],
                    [
                        node2
                    ]
                ];
            }
            const args1 = node1.arguments ?? [];
            const args2 = node2.arguments ?? [];
            if (!sameArguments(args1, args2)) {
                return [
                    [
                        responseName,
                        'they have differing arguments'
                    ],
                    [
                        node1
                    ],
                    [
                        node2
                    ]
                ];
            }
        }
        const type1 = def1?.type;
        const type2 = def2?.type;
        if (type1 && type2 && doTypesConflict(type1, type2)) {
            return [
                [
                    responseName,
                    `they return conflicting types "${inspect(type1)}" and "${inspect(type2)}"`
                ],
                [
                    node1
                ],
                [
                    node2
                ]
            ];
        }
        const selectionSet1 = node1.selectionSet;
        const selectionSet2 = node2.selectionSet;
        if (selectionSet1 && selectionSet2) {
            const conflicts = findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentNames, comparedFragmentPairs, areMutuallyExclusive, getNamedType1(type1), selectionSet1, getNamedType1(type2), selectionSet2);
            return subfieldConflicts(conflicts, responseName, node1, node2);
        }
    }
    const find3 = find;
    function sameArguments(arguments1, arguments2) {
        if (arguments1.length !== arguments2.length) {
            return false;
        }
        return arguments1.every((argument1)=>{
            const argument2 = find(arguments2, (argument)=>argument.name.value === argument1.name.value
            );
            if (!argument2) {
                return false;
            }
            return sameValue(argument1.value, argument2.value);
        });
    }
    function sameValue(value1, value2) {
        return print1(value1) === print1(value2);
    }
    function doTypesConflict(type1, type2) {
        if (isListType1(type1)) {
            return isListType1(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
        }
        if (isListType1(type2)) {
            return true;
        }
        if (isNonNullType1(type1)) {
            return isNonNullType1(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
        }
        if (isNonNullType1(type2)) {
            return true;
        }
        if (isLeafType1(type1) || isLeafType1(type2)) {
            return type1 !== type2;
        }
        return false;
    }
    function getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType, selectionSet) {
        let cached = cachedFieldsAndFragmentNames.get(selectionSet);
        if (!cached) {
            const nodeAndDefs = Object.create(null);
            const fragmentNames = Object.create(null);
            _collectFieldsAndFragmentNames(context, parentType, selectionSet, nodeAndDefs, fragmentNames);
            cached = [
                nodeAndDefs,
                Object.keys(fragmentNames)
            ];
            cachedFieldsAndFragmentNames.set(selectionSet, cached);
        }
        return cached;
    }
    const typeFromAST6 = typeFromAST;
    function getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment) {
        const cached = cachedFieldsAndFragmentNames.get(fragment.selectionSet);
        if (cached) {
            return cached;
        }
        const fragmentType = typeFromAST(context.getSchema(), fragment.typeCondition);
        return getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragmentType, fragment.selectionSet);
    }
    function _collectFieldsAndFragmentNames(context, parentType, selectionSet, nodeAndDefs, fragmentNames) {
        for (const selection of selectionSet.selections){
            switch(selection.kind){
                case Kind1.FIELD:
                    {
                        const fieldName = selection.name.value;
                        let fieldDef;
                        if (isObjectType1(parentType) || isInterfaceType1(parentType)) {
                            fieldDef = parentType.getFields()[fieldName];
                        }
                        const responseName = selection.alias ? selection.alias.value : fieldName;
                        if (!nodeAndDefs[responseName]) {
                            nodeAndDefs[responseName] = [];
                        }
                        nodeAndDefs[responseName].push([
                            parentType,
                            selection,
                            fieldDef
                        ]);
                        break;
                    }
                case Kind1.FRAGMENT_SPREAD:
                    fragmentNames[selection.name.value] = true;
                    break;
                case Kind1.INLINE_FRAGMENT:
                    {
                        const typeCondition = selection.typeCondition;
                        const inlineFragmentType = typeCondition ? typeFromAST(context.getSchema(), typeCondition) : parentType;
                        _collectFieldsAndFragmentNames(context, inlineFragmentType, selection.selectionSet, nodeAndDefs, fragmentNames);
                        break;
                    }
            }
        }
    }
    function subfieldConflicts(conflicts, responseName, node1, node2) {
        if (conflicts.length > 0) {
            return [
                [
                    responseName,
                    conflicts.map(([reason])=>reason
                    )
                ],
                conflicts.reduce((allFields, [, fields1])=>allFields.concat(fields1)
                , [
                    node1
                ]),
                conflicts.reduce((allFields, [, , fields2])=>allFields.concat(fields2)
                , [
                    node2
                ])
            ];
        }
    }
    class PairSet {
        constructor(){
            this._data = Object.create(null);
        }
        has(a, b, areMutuallyExclusive) {
            const first = this._data[a];
            const result = first && first[b];
            if (result === undefined) {
                return false;
            }
            if (areMutuallyExclusive === false) {
                return result === false;
            }
            return true;
        }
        add(a, b, areMutuallyExclusive) {
            _pairSetAdd(this._data, a, b, areMutuallyExclusive);
            _pairSetAdd(this._data, b, a, areMutuallyExclusive);
        }
    }
    function _pairSetAdd(data, a, b, areMutuallyExclusive) {
        let map = data[a];
        if (!map) {
            map = Object.create(null);
            data[a] = map;
        }
        map[b] = areMutuallyExclusive;
    }
    function UniqueInputFieldNamesRule(context) {
        const knownNameStack = [];
        let knownNames = Object.create(null);
        return {
            ObjectValue: {
                enter () {
                    knownNameStack.push(knownNames);
                    knownNames = Object.create(null);
                },
                leave () {
                    knownNames = knownNameStack.pop();
                }
            },
            ObjectField (node) {
                const fieldName = node.name.value;
                if (knownNames[fieldName]) {
                    context.reportError(new GraphQLError1(`There can be only one input field named "${fieldName}".`, [
                        knownNames[fieldName],
                        node.name
                    ]));
                } else {
                    knownNames[fieldName] = node.name;
                }
            }
        };
    }
    const UniqueInputFieldNamesRule1 = UniqueInputFieldNamesRule;
    const UniqueInputFieldNamesRule2 = UniqueInputFieldNamesRule1;
    const specifiedRules = Object.freeze([
        ExecutableDefinitionsRule1,
        UniqueOperationNamesRule1,
        LoneAnonymousOperationRule1,
        SingleFieldSubscriptionsRule1,
        KnownTypeNamesRule1,
        FragmentsOnCompositeTypesRule1,
        VariablesAreInputTypesRule1,
        ScalarLeafsRule1,
        FieldsOnCorrectTypeRule1,
        UniqueFragmentNamesRule1,
        KnownFragmentNamesRule1,
        NoUnusedFragmentsRule1,
        PossibleFragmentSpreadsRule1,
        NoFragmentCyclesRule1,
        UniqueVariableNamesRule1,
        NoUndefinedVariablesRule1,
        NoUnusedVariablesRule1,
        KnownDirectivesRule1,
        UniqueDirectivesPerLocationRule1,
        KnownArgumentNamesRule1,
        UniqueArgumentNamesRule1,
        ValuesOfCorrectTypeRule1,
        ProvidedRequiredArgumentsRule1,
        VariablesInAllowedPositionRule1,
        OverlappingFieldsCanBeMergedRule1,
        UniqueInputFieldNamesRule1
    ]);
    const specifiedRules1 = specifiedRules;
    function LoneSchemaDefinitionRule(context) {
        const oldSchema = context.getSchema();
        const alreadyDefined = ((oldSchema?.astNode ?? oldSchema?.getQueryType()) ?? oldSchema?.getMutationType()) ?? oldSchema?.getSubscriptionType();
        let schemaDefinitionsCount = 0;
        return {
            SchemaDefinition (node) {
                if (alreadyDefined) {
                    context.reportError(new GraphQLError1('Cannot define a new schema within a schema extension.', node));
                    return;
                }
                if (schemaDefinitionsCount > 0) {
                    context.reportError(new GraphQLError1('Must provide only one schema definition.', node));
                }
                ++schemaDefinitionsCount;
            }
        };
    }
    const LoneSchemaDefinitionRule1 = LoneSchemaDefinitionRule;
    const LoneSchemaDefinitionRule2 = LoneSchemaDefinitionRule1;
    function UniqueOperationTypesRule(context) {
        const schema = context.getSchema();
        const definedOperationTypes = Object.create(null);
        const existingOperationTypes = schema ? {
            query: schema.getQueryType(),
            mutation: schema.getMutationType(),
            subscription: schema.getSubscriptionType()
        } : {
        };
        return {
            SchemaDefinition: checkOperationTypes,
            SchemaExtension: checkOperationTypes
        };
        function checkOperationTypes(node) {
            const operationTypesNodes = node.operationTypes ?? [];
            for (const operationType of operationTypesNodes){
                const operation = operationType.operation;
                const alreadyDefinedOperationType = definedOperationTypes[operation];
                if (existingOperationTypes[operation]) {
                    context.reportError(new GraphQLError1(`Type for ${operation} already defined in the schema. It cannot be redefined.`, operationType));
                } else if (alreadyDefinedOperationType) {
                    context.reportError(new GraphQLError1(`There can be only one ${operation} type in schema.`, [
                        alreadyDefinedOperationType,
                        operationType
                    ]));
                } else {
                    definedOperationTypes[operation] = operationType;
                }
            }
            return false;
        }
    }
    const UniqueOperationTypesRule1 = UniqueOperationTypesRule;
    const UniqueOperationTypesRule2 = UniqueOperationTypesRule1;
    function UniqueTypeNamesRule(context) {
        const knownTypeNames = Object.create(null);
        const schema = context.getSchema();
        return {
            ScalarTypeDefinition: checkTypeName,
            ObjectTypeDefinition: checkTypeName,
            InterfaceTypeDefinition: checkTypeName,
            UnionTypeDefinition: checkTypeName,
            EnumTypeDefinition: checkTypeName,
            InputObjectTypeDefinition: checkTypeName
        };
        function checkTypeName(node) {
            const typeName = node.name.value;
            if (schema?.getType(typeName)) {
                context.reportError(new GraphQLError1(`Type "${typeName}" already exists in the schema. It cannot also be defined in this type definition.`, node.name));
                return;
            }
            if (knownTypeNames[typeName]) {
                context.reportError(new GraphQLError1(`There can be only one type named "${typeName}".`, [
                    knownTypeNames[typeName],
                    node.name
                ]));
            } else {
                knownTypeNames[typeName] = node.name;
            }
            return false;
        }
    }
    const UniqueTypeNamesRule1 = UniqueTypeNamesRule;
    const UniqueTypeNamesRule2 = UniqueTypeNamesRule1;
    function UniqueEnumValueNamesRule(context) {
        const schema = context.getSchema();
        const existingTypeMap = schema ? schema.getTypeMap() : Object.create(null);
        const knownValueNames = Object.create(null);
        return {
            EnumTypeDefinition: checkValueUniqueness,
            EnumTypeExtension: checkValueUniqueness
        };
        function checkValueUniqueness(node) {
            const typeName = node.name.value;
            if (!knownValueNames[typeName]) {
                knownValueNames[typeName] = Object.create(null);
            }
            const valueNodes = node.values ?? [];
            const valueNames = knownValueNames[typeName];
            for (const valueDef of valueNodes){
                const valueName = valueDef.name.value;
                const existingType = existingTypeMap[typeName];
                if (isEnumType1(existingType) && existingType.getValue(valueName)) {
                    context.reportError(new GraphQLError1(`Enum value "${typeName}.${valueName}" already exists in the schema. It cannot also be defined in this type extension.`, valueDef.name));
                } else if (valueNames[valueName]) {
                    context.reportError(new GraphQLError1(`Enum value "${typeName}.${valueName}" can only be defined once.`, [
                        valueNames[valueName],
                        valueDef.name
                    ]));
                } else {
                    valueNames[valueName] = valueDef.name;
                }
            }
            return false;
        }
    }
    const UniqueEnumValueNamesRule1 = UniqueEnumValueNamesRule;
    const UniqueEnumValueNamesRule2 = UniqueEnumValueNamesRule1;
    function UniqueFieldDefinitionNamesRule(context) {
        const schema = context.getSchema();
        const existingTypeMap = schema ? schema.getTypeMap() : Object.create(null);
        const knownFieldNames = Object.create(null);
        return {
            InputObjectTypeDefinition: checkFieldUniqueness,
            InputObjectTypeExtension: checkFieldUniqueness,
            InterfaceTypeDefinition: checkFieldUniqueness,
            InterfaceTypeExtension: checkFieldUniqueness,
            ObjectTypeDefinition: checkFieldUniqueness,
            ObjectTypeExtension: checkFieldUniqueness
        };
        function checkFieldUniqueness(node) {
            const typeName = node.name.value;
            if (!knownFieldNames[typeName]) {
                knownFieldNames[typeName] = Object.create(null);
            }
            const fieldNodes = node.fields ?? [];
            const fieldNames = knownFieldNames[typeName];
            for (const fieldDef of fieldNodes){
                const fieldName = fieldDef.name.value;
                if (hasField(existingTypeMap[typeName], fieldName)) {
                    context.reportError(new GraphQLError1(`Field "${typeName}.${fieldName}" already exists in the schema. It cannot also be defined in this type extension.`, fieldDef.name));
                } else if (fieldNames[fieldName]) {
                    context.reportError(new GraphQLError1(`Field "${typeName}.${fieldName}" can only be defined once.`, [
                        fieldNames[fieldName],
                        fieldDef.name
                    ]));
                } else {
                    fieldNames[fieldName] = fieldDef.name;
                }
            }
            return false;
        }
    }
    const UniqueFieldDefinitionNamesRule1 = UniqueFieldDefinitionNamesRule;
    const UniqueFieldDefinitionNamesRule2 = UniqueFieldDefinitionNamesRule1;
    function hasField(type, fieldName) {
        if (isObjectType1(type) || isInterfaceType1(type) || isInputObjectType1(type)) {
            return type.getFields()[fieldName];
        }
        return false;
    }
    function UniqueDirectiveNamesRule(context) {
        const knownDirectiveNames = Object.create(null);
        const schema = context.getSchema();
        return {
            DirectiveDefinition (node) {
                const directiveName = node.name.value;
                if (schema?.getDirective(directiveName)) {
                    context.reportError(new GraphQLError1(`Directive "@${directiveName}" already exists in the schema. It cannot be redefined.`, node.name));
                    return;
                }
                if (knownDirectiveNames[directiveName]) {
                    context.reportError(new GraphQLError1(`There can be only one directive named "@${directiveName}".`, [
                        knownDirectiveNames[directiveName],
                        node.name
                    ]));
                } else {
                    knownDirectiveNames[directiveName] = node.name;
                }
                return false;
            }
        };
    }
    const UniqueDirectiveNamesRule1 = UniqueDirectiveNamesRule;
    const UniqueDirectiveNamesRule2 = UniqueDirectiveNamesRule1;
    const suggestionList7 = suggestionList;
    const didYouMean7 = didYouMean;
    function PossibleTypeExtensionsRule(context) {
        const schema = context.getSchema();
        const definedTypes = Object.create(null);
        for (const def of context.getDocument().definitions){
            if (isTypeDefinitionNode1(def)) {
                definedTypes[def.name.value] = def;
            }
        }
        return {
            ScalarTypeExtension: checkExtension,
            ObjectTypeExtension: checkExtension,
            InterfaceTypeExtension: checkExtension,
            UnionTypeExtension: checkExtension,
            EnumTypeExtension: checkExtension,
            InputObjectTypeExtension: checkExtension
        };
        function checkExtension(node) {
            const typeName = node.name.value;
            const defNode = definedTypes[typeName];
            const existingType = schema?.getType(typeName);
            let expectedKind;
            if (defNode) {
                expectedKind = defKindToExtKind[defNode.kind];
            } else if (existingType) {
                expectedKind = typeToExtKind(existingType);
            }
            if (expectedKind) {
                if (expectedKind !== node.kind) {
                    const kindStr = extensionKindToTypeName(node.kind);
                    context.reportError(new GraphQLError1(`Cannot extend non-${kindStr} type "${typeName}".`, defNode ? [
                        defNode,
                        node
                    ] : node));
                }
            } else {
                let allTypeNames = Object.keys(definedTypes);
                if (schema) {
                    allTypeNames = allTypeNames.concat(Object.keys(schema.getTypeMap()));
                }
                const suggestedTypes = suggestionList(typeName, allTypeNames);
                context.reportError(new GraphQLError1(`Cannot extend type "${typeName}" because it is not defined.` + didYouMean(suggestedTypes), node.name));
            }
        }
    }
    const PossibleTypeExtensionsRule1 = PossibleTypeExtensionsRule;
    const PossibleTypeExtensionsRule2 = PossibleTypeExtensionsRule1;
    const defKindToExtKind = {
        [Kind1.SCALAR_TYPE_DEFINITION]: Kind1.SCALAR_TYPE_EXTENSION,
        [Kind1.OBJECT_TYPE_DEFINITION]: Kind1.OBJECT_TYPE_EXTENSION,
        [Kind1.INTERFACE_TYPE_DEFINITION]: Kind1.INTERFACE_TYPE_EXTENSION,
        [Kind1.UNION_TYPE_DEFINITION]: Kind1.UNION_TYPE_EXTENSION,
        [Kind1.ENUM_TYPE_DEFINITION]: Kind1.ENUM_TYPE_EXTENSION,
        [Kind1.INPUT_OBJECT_TYPE_DEFINITION]: Kind1.INPUT_OBJECT_TYPE_EXTENSION
    };
    const invariant4 = invariant;
    const inspect15 = inspect;
    function typeToExtKind(type) {
        if (isScalarType1(type)) {
            return Kind1.SCALAR_TYPE_EXTENSION;
        }
        if (isObjectType1(type)) {
            return Kind1.OBJECT_TYPE_EXTENSION;
        }
        if (isInterfaceType1(type)) {
            return Kind1.INTERFACE_TYPE_EXTENSION;
        }
        if (isUnionType1(type)) {
            return Kind1.UNION_TYPE_EXTENSION;
        }
        if (isEnumType1(type)) {
            return Kind1.ENUM_TYPE_EXTENSION;
        }
        if (isInputObjectType1(type)) {
            return Kind1.INPUT_OBJECT_TYPE_EXTENSION;
        }
        invariant(false, 'Unexpected type: ' + inspect(type));
    }
    function extensionKindToTypeName(kind1) {
        switch(kind1){
            case Kind1.SCALAR_TYPE_EXTENSION:
                return 'scalar';
            case Kind1.OBJECT_TYPE_EXTENSION:
                return 'object';
            case Kind1.INTERFACE_TYPE_EXTENSION:
                return 'interface';
            case Kind1.UNION_TYPE_EXTENSION:
                return 'union';
            case Kind1.ENUM_TYPE_EXTENSION:
                return 'enum';
            case Kind1.INPUT_OBJECT_TYPE_EXTENSION:
                return 'input object';
        }
        invariant(false, 'Unexpected kind: ' + inspect(kind1));
    }
    const specifiedSDLRules = Object.freeze([
        LoneSchemaDefinitionRule1,
        UniqueOperationTypesRule1,
        UniqueTypeNamesRule1,
        UniqueEnumValueNamesRule1,
        UniqueFieldDefinitionNamesRule1,
        UniqueDirectiveNamesRule1,
        KnownTypeNamesRule1,
        KnownDirectivesRule1,
        UniqueDirectivesPerLocationRule1,
        PossibleTypeExtensionsRule1,
        KnownArgumentNamesOnDirectivesRule1,
        UniqueArgumentNamesRule1,
        UniqueInputFieldNamesRule1,
        ProvidedRequiredArgumentsOnDirectivesRule1
    ]);
    const specifiedSDLRules1 = specifiedSDLRules;
    class ASTValidationContext {
        constructor(ast, onError){
            this._ast = ast;
            this._fragments = undefined;
            this._fragmentSpreads = new Map();
            this._recursivelyReferencedFragments = new Map();
            this._onError = onError;
        }
        reportError(error) {
            this._onError(error);
        }
        getDocument() {
            return this._ast;
        }
        getFragment(name) {
            let fragments = this._fragments;
            if (!fragments) {
                this._fragments = fragments = this.getDocument().definitions.reduce((frags, statement)=>{
                    if (statement.kind === Kind17.FRAGMENT_DEFINITION) {
                        frags[statement.name.value] = statement;
                    }
                    return frags;
                }, Object.create(null));
            }
            return fragments[name];
        }
        getFragmentSpreads(node) {
            let spreads = this._fragmentSpreads.get(node);
            if (!spreads) {
                spreads = [];
                const setsToVisit = [
                    node
                ];
                while(setsToVisit.length !== 0){
                    const set = setsToVisit.pop();
                    for (const selection of set.selections){
                        if (selection.kind === Kind1.FRAGMENT_SPREAD) {
                            spreads.push(selection);
                        } else if (selection.selectionSet) {
                            setsToVisit.push(selection.selectionSet);
                        }
                    }
                }
                this._fragmentSpreads.set(node, spreads);
            }
            return spreads;
        }
        getRecursivelyReferencedFragments(operation) {
            let fragments = this._recursivelyReferencedFragments.get(operation);
            if (!fragments) {
                fragments = [];
                const collectedNames = Object.create(null);
                const nodesToVisit = [
                    operation.selectionSet
                ];
                while(nodesToVisit.length !== 0){
                    const node = nodesToVisit.pop();
                    for (const spread of this.getFragmentSpreads(node)){
                        const fragName = spread.name.value;
                        if (collectedNames[fragName] !== true) {
                            collectedNames[fragName] = true;
                            const fragment = this.getFragment(fragName);
                            if (fragment) {
                                fragments.push(fragment);
                                nodesToVisit.push(fragment.selectionSet);
                            }
                        }
                    }
                }
                this._recursivelyReferencedFragments.set(operation, fragments);
            }
            return fragments;
        }
    }
    const ASTValidationContext1 = ASTValidationContext;
    class SDLValidationContext extends ASTValidationContext {
        constructor(ast1, schema, onError1){
            super(ast1, onError1);
            this._schema = schema;
        }
        getSchema() {
            return this._schema;
        }
    }
    const SDLValidationContext1 = SDLValidationContext;
    const typeFromAST7 = typeFromAST;
    const find4 = find;
    class TypeInfo {
        constructor(schema1, getFieldDefFn, initialType){
            this._schema = schema1;
            this._typeStack = [];
            this._parentTypeStack = [];
            this._inputTypeStack = [];
            this._fieldDefStack = [];
            this._defaultValueStack = [];
            this._directive = null;
            this._argument = null;
            this._enumValue = null;
            this._getFieldDef = getFieldDefFn ?? getFieldDef3;
            if (initialType) {
                if (isInputType1(initialType)) {
                    this._inputTypeStack.push(initialType);
                }
                if (isCompositeType1(initialType)) {
                    this._parentTypeStack.push(initialType);
                }
                if (isOutputType1(initialType)) {
                    this._typeStack.push(initialType);
                }
            }
        }
        getType() {
            if (this._typeStack.length > 0) {
                return this._typeStack[this._typeStack.length - 1];
            }
        }
        getParentType() {
            if (this._parentTypeStack.length > 0) {
                return this._parentTypeStack[this._parentTypeStack.length - 1];
            }
        }
        getInputType() {
            if (this._inputTypeStack.length > 0) {
                return this._inputTypeStack[this._inputTypeStack.length - 1];
            }
        }
        getParentInputType() {
            if (this._inputTypeStack.length > 1) {
                return this._inputTypeStack[this._inputTypeStack.length - 2];
            }
        }
        getFieldDef() {
            if (this._fieldDefStack.length > 0) {
                return this._fieldDefStack[this._fieldDefStack.length - 1];
            }
        }
        getDefaultValue() {
            if (this._defaultValueStack.length > 0) {
                return this._defaultValueStack[this._defaultValueStack.length - 1];
            }
        }
        getDirective() {
            return this._directive;
        }
        getArgument() {
            return this._argument;
        }
        getEnumValue() {
            return this._enumValue;
        }
        enter(node) {
            const schema2 = this._schema;
            switch(node.kind){
                case Kind1.SELECTION_SET:
                    {
                        const namedType1 = getNamedType1(this.getType());
                        this._parentTypeStack.push(isCompositeType1(namedType1) ? namedType1 : undefined);
                        break;
                    }
                case Kind1.FIELD:
                    {
                        const parentType = this.getParentType();
                        let fieldDef;
                        let fieldType;
                        if (parentType) {
                            fieldDef = this._getFieldDef(schema2, parentType, node);
                            if (fieldDef) {
                                fieldType = fieldDef.type;
                            }
                        }
                        this._fieldDefStack.push(fieldDef);
                        this._typeStack.push(isOutputType1(fieldType) ? fieldType : undefined);
                        break;
                    }
                case Kind1.DIRECTIVE:
                    this._directive = schema2.getDirective(node.name.value);
                    break;
                case Kind1.OPERATION_DEFINITION:
                    {
                        let type;
                        switch(node.operation){
                            case 'query':
                                type = schema2.getQueryType();
                                break;
                            case 'mutation':
                                type = schema2.getMutationType();
                                break;
                            case 'subscription':
                                type = schema2.getSubscriptionType();
                                break;
                        }
                        this._typeStack.push(isObjectType1(type) ? type : undefined);
                        break;
                    }
                case Kind1.INLINE_FRAGMENT:
                case Kind1.FRAGMENT_DEFINITION:
                    {
                        const typeConditionAST = node.typeCondition;
                        const outputType = typeConditionAST ? typeFromAST(schema2, typeConditionAST) : getNamedType1(this.getType());
                        this._typeStack.push(isOutputType1(outputType) ? outputType : undefined);
                        break;
                    }
                case Kind1.VARIABLE_DEFINITION:
                    {
                        const inputType = typeFromAST(schema2, node.type);
                        this._inputTypeStack.push(isInputType1(inputType) ? inputType : undefined);
                        break;
                    }
                case Kind1.ARGUMENT:
                    {
                        let argDef;
                        let argType;
                        const fieldOrDirective = this.getDirective() ?? this.getFieldDef();
                        if (fieldOrDirective) {
                            argDef = find4(fieldOrDirective.args, (arg)=>arg.name === node.name.value
                            );
                            if (argDef) {
                                argType = argDef.type;
                            }
                        }
                        this._argument = argDef;
                        this._defaultValueStack.push(argDef ? argDef.defaultValue : undefined);
                        this._inputTypeStack.push(isInputType1(argType) ? argType : undefined);
                        break;
                    }
                case Kind1.LIST:
                    {
                        const listType = getNullableType1(this.getInputType());
                        const itemType = isListType1(listType) ? listType.ofType : listType;
                        this._defaultValueStack.push(undefined);
                        this._inputTypeStack.push(isInputType1(itemType) ? itemType : undefined);
                        break;
                    }
                case Kind1.OBJECT_FIELD:
                    {
                        const objectType = getNamedType1(this.getInputType());
                        let inputFieldType;
                        let inputField;
                        if (isInputObjectType1(objectType)) {
                            inputField = objectType.getFields()[node.name.value];
                            if (inputField) {
                                inputFieldType = inputField.type;
                            }
                        }
                        this._defaultValueStack.push(inputField ? inputField.defaultValue : undefined);
                        this._inputTypeStack.push(isInputType1(inputFieldType) ? inputFieldType : undefined);
                        break;
                    }
                case Kind1.ENUM:
                    {
                        const enumType = getNamedType1(this.getInputType());
                        let enumValue;
                        if (isEnumType1(enumType)) {
                            enumValue = enumType.getValue(node.value);
                        }
                        this._enumValue = enumValue;
                        break;
                    }
            }
        }
        leave(node) {
            switch(node.kind){
                case Kind1.SELECTION_SET:
                    this._parentTypeStack.pop();
                    break;
                case Kind1.FIELD:
                    this._fieldDefStack.pop();
                    this._typeStack.pop();
                    break;
                case Kind1.DIRECTIVE:
                    this._directive = null;
                    break;
                case Kind1.OPERATION_DEFINITION:
                case Kind1.INLINE_FRAGMENT:
                case Kind1.FRAGMENT_DEFINITION:
                    this._typeStack.pop();
                    break;
                case Kind1.VARIABLE_DEFINITION:
                    this._inputTypeStack.pop();
                    break;
                case Kind1.ARGUMENT:
                    this._argument = null;
                    this._defaultValueStack.pop();
                    this._inputTypeStack.pop();
                    break;
                case Kind1.LIST:
                case Kind1.OBJECT_FIELD:
                    this._defaultValueStack.pop();
                    this._inputTypeStack.pop();
                    break;
                case Kind1.ENUM:
                    this._enumValue = null;
                    break;
            }
        }
    }
    const TypeInfo1 = TypeInfo;
    const TypeInfo2 = TypeInfo1;
    const TypeInfo3 = TypeInfo1;
    const SchemaMetaFieldDef2 = SchemaMetaFieldDef;
    const TypeMetaFieldDef2 = TypeMetaFieldDef;
    const TypeNameMetaFieldDef2 = TypeNameMetaFieldDef;
    function getFieldDef3(schema2, parentType, fieldNode) {
        const name2 = fieldNode.name.value;
        if (name2 === SchemaMetaFieldDef.name && schema2.getQueryType() === parentType) {
            return SchemaMetaFieldDef;
        }
        if (name2 === TypeMetaFieldDef.name && schema2.getQueryType() === parentType) {
            return TypeMetaFieldDef;
        }
        if (name2 === TypeNameMetaFieldDef.name && isCompositeType1(parentType)) {
            return TypeNameMetaFieldDef;
        }
        if (isObjectType1(parentType) || isInterfaceType1(parentType)) {
            return parentType.getFields()[name2];
        }
    }
    const isNode2 = isNode;
    function visitWithTypeInfo(typeInfo, visitor) {
        return {
            enter (node) {
                typeInfo.enter(node);
                const fn = getVisitFn1(visitor, node.kind, false);
                if (fn) {
                    const result = fn.apply(visitor, arguments);
                    if (result !== undefined) {
                        typeInfo.leave(node);
                        if (isNode(result)) {
                            typeInfo.enter(result);
                        }
                    }
                    return result;
                }
            },
            leave (node) {
                const fn = getVisitFn1(visitor, node.kind, true);
                let result;
                if (fn) {
                    result = fn.apply(visitor, arguments);
                }
                typeInfo.leave(node);
                return result;
            }
        };
    }
    const visitWithTypeInfo1 = visitWithTypeInfo;
    const visitWithTypeInfo2 = visitWithTypeInfo1;
    const visitWithTypeInfo3 = visitWithTypeInfo1;
    class ValidationContext extends ASTValidationContext {
        constructor(schema2, ast2, typeInfo, onError2){
            super(ast2, onError2);
            this._schema = schema2;
            this._typeInfo = typeInfo;
            this._variableUsages = new Map();
            this._recursiveVariableUsages = new Map();
        }
        getSchema() {
            return this._schema;
        }
        getVariableUsages(node) {
            let usages = this._variableUsages.get(node);
            if (!usages) {
                const newUsages = [];
                const typeInfo1 = new TypeInfo1(this._schema);
                visit1(node, visitWithTypeInfo1(typeInfo1, {
                    VariableDefinition: ()=>false
                    ,
                    Variable (variable) {
                        newUsages.push({
                            node: variable,
                            type: typeInfo1.getInputType(),
                            defaultValue: typeInfo1.getDefaultValue()
                        });
                    }
                }));
                usages = newUsages;
                this._variableUsages.set(node, usages);
            }
            return usages;
        }
        getRecursiveVariableUsages(operation) {
            let usages = this._recursiveVariableUsages.get(operation);
            if (!usages) {
                usages = this.getVariableUsages(operation);
                for (const frag of this.getRecursivelyReferencedFragments(operation)){
                    usages = usages.concat(this.getVariableUsages(frag));
                }
                this._recursiveVariableUsages.set(operation, usages);
            }
            return usages;
        }
        getType() {
            return this._typeInfo.getType();
        }
        getParentType() {
            return this._typeInfo.getParentType();
        }
        getInputType() {
            return this._typeInfo.getInputType();
        }
        getParentInputType() {
            return this._typeInfo.getParentInputType();
        }
        getFieldDef() {
            return this._typeInfo.getFieldDef();
        }
        getDirective() {
            return this._typeInfo.getDirective();
        }
        getArgument() {
            return this._typeInfo.getArgument();
        }
    }
    const ValidationContext1 = ValidationContext;
    const validate2 = validate;
    const ValidationContext2 = ValidationContext1;
    const specifiedRules2 = specifiedRules1;
    const ExecutableDefinitionsRule3 = ExecutableDefinitionsRule1;
    const FieldsOnCorrectTypeRule3 = FieldsOnCorrectTypeRule1;
    const FragmentsOnCompositeTypesRule3 = FragmentsOnCompositeTypesRule1;
    const KnownArgumentNamesRule3 = KnownArgumentNamesRule1;
    const KnownDirectivesRule3 = KnownDirectivesRule1;
    const KnownFragmentNamesRule3 = KnownFragmentNamesRule1;
    const KnownTypeNamesRule3 = KnownTypeNamesRule1;
    const LoneAnonymousOperationRule3 = LoneAnonymousOperationRule1;
    const NoFragmentCyclesRule3 = NoFragmentCyclesRule1;
    const NoUndefinedVariablesRule3 = NoUndefinedVariablesRule1;
    const NoUnusedFragmentsRule3 = NoUnusedFragmentsRule1;
    const NoUnusedVariablesRule3 = NoUnusedVariablesRule1;
    const OverlappingFieldsCanBeMergedRule3 = OverlappingFieldsCanBeMergedRule1;
    const PossibleFragmentSpreadsRule3 = PossibleFragmentSpreadsRule1;
    const ProvidedRequiredArgumentsRule3 = ProvidedRequiredArgumentsRule1;
    const ScalarLeafsRule3 = ScalarLeafsRule1;
    const SingleFieldSubscriptionsRule3 = SingleFieldSubscriptionsRule1;
    const UniqueArgumentNamesRule3 = UniqueArgumentNamesRule1;
    const UniqueDirectivesPerLocationRule3 = UniqueDirectivesPerLocationRule1;
    const UniqueFragmentNamesRule3 = UniqueFragmentNamesRule1;
    const UniqueInputFieldNamesRule3 = UniqueInputFieldNamesRule1;
    const UniqueOperationNamesRule3 = UniqueOperationNamesRule1;
    const UniqueVariableNamesRule3 = UniqueVariableNamesRule1;
    const ValuesOfCorrectTypeRule3 = ValuesOfCorrectTypeRule1;
    const VariablesAreInputTypesRule3 = VariablesAreInputTypesRule1;
    const VariablesInAllowedPositionRule3 = VariablesInAllowedPositionRule1;
    const LoneSchemaDefinitionRule3 = LoneSchemaDefinitionRule1;
    const UniqueOperationTypesRule3 = UniqueOperationTypesRule1;
    const UniqueTypeNamesRule3 = UniqueTypeNamesRule1;
    const UniqueEnumValueNamesRule3 = UniqueEnumValueNamesRule1;
    const UniqueFieldDefinitionNamesRule3 = UniqueFieldDefinitionNamesRule1;
    const UniqueDirectiveNamesRule3 = UniqueDirectiveNamesRule1;
    const PossibleTypeExtensionsRule3 = PossibleTypeExtensionsRule1;
    const devAssert4 = devAssert;
    function formatError(error) {
        devAssert(error, 'Received null or undefined error.');
        const message2 = error.message ?? 'An unknown error occurred.';
        const locations = error.locations;
        const path2 = error.path;
        const extensions1 = error.extensions;
        return extensions1 ? {
            message: message2,
            locations,
            path: path2,
            extensions: extensions1
        } : {
            message: message2,
            locations,
            path: path2
        };
    }
    const formatError1 = formatError;
    const GraphQLError43 = GraphQLError1, printError2 = printError1;
    const syntaxError3 = syntaxError1;
    const locatedError3 = locatedError1;
    const formatError2 = formatError1;
    const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
    function assertValidName(name2) {
        const error = isValidNameError(name2);
        if (error) {
            throw error;
        }
        return name2;
    }
    const assertValidName1 = assertValidName;
    const devAssert5 = devAssert;
    function isValidNameError(name2) {
        devAssert(typeof name2 === 'string', 'Expected name to be a string.');
        if (name2.length > 1 && name2[0] === '_' && name2[1] === '_') {
            return new GraphQLError1(`Name "${name2}" must not begin with "__", which is reserved by GraphQL introspection.`);
        }
        if (!NAME_RX.test(name2)) {
            return new GraphQLError1(`Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ but "${name2}" does not.`);
        }
    }
    const isValidNameError1 = isValidNameError;
    function getIntrospectionQuery(options) {
        const optionsWithDefault = {
            descriptions: true,
            directiveIsRepeatable: false,
            schemaDescription: false,
            ...options
        };
        const descriptions = optionsWithDefault.descriptions ? 'description' : '';
        const directiveIsRepeatable = optionsWithDefault.directiveIsRepeatable ? 'isRepeatable' : '';
        const schemaDescription = optionsWithDefault.schemaDescription ? descriptions : '';
        return `\n    query IntrospectionQuery {\n      __schema {\n        ${schemaDescription}\n        queryType { name }\n        mutationType { name }\n        subscriptionType { name }\n        types {\n          ...FullType\n        }\n        directives {\n          name\n          ${descriptions}\n          ${directiveIsRepeatable}\n          locations\n          args {\n            ...InputValue\n          }\n        }\n      }\n    }\n\n    fragment FullType on __Type {\n      kind\n      name\n      ${descriptions}\n      fields(includeDeprecated: true) {\n        name\n        ${descriptions}\n        args {\n          ...InputValue\n        }\n        type {\n          ...TypeRef\n        }\n        isDeprecated\n        deprecationReason\n      }\n      inputFields {\n        ...InputValue\n      }\n      interfaces {\n        ...TypeRef\n      }\n      enumValues(includeDeprecated: true) {\n        name\n        ${descriptions}\n        isDeprecated\n        deprecationReason\n      }\n      possibleTypes {\n        ...TypeRef\n      }\n    }\n\n    fragment InputValue on __InputValue {\n      name\n      ${descriptions}\n      type { ...TypeRef }\n      defaultValue\n    }\n\n    fragment TypeRef on __Type {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  `;
    }
    const getIntrospectionQuery1 = getIntrospectionQuery;
    const getIntrospectionQuery2 = getIntrospectionQuery1;
    function getOperationAST(documentAST, operationName) {
        let operation = null;
        for (const definition of documentAST.definitions){
            if (definition.kind === Kind1.OPERATION_DEFINITION) {
                if (operationName == null) {
                    if (operation) {
                        return null;
                    }
                    operation = definition;
                } else if (definition.name?.value === operationName) {
                    return definition;
                }
            }
        }
        return operation;
    }
    const getOperationAST1 = getOperationAST;
    const parse4 = parse1;
    const execute4 = execute;
    const invariant5 = invariant;
    function introspectionFromSchema(schema3, options) {
        const optionsWithDefaults = {
            directiveIsRepeatable: true,
            schemaDescription: true,
            ...options
        };
        const document = parse1(getIntrospectionQuery1(optionsWithDefaults));
        const result = execute({
            schema: schema3,
            document
        });
        invariant(!isPromise(result) && !result.errors && result.data);
        return result.data;
    }
    const introspectionFromSchema1 = introspectionFromSchema;
    const devAssert6 = devAssert;
    const isObjectLike5 = isObjectLike;
    const inspect16 = inspect;
    const keyValMap2 = keyValMap;
    const specifiedScalarTypes3 = specifiedScalarTypes;
    const introspectionTypes2 = introspectionTypes;
    const objectValues5 = objectValues;
    const TypeKind2 = TypeKind;
    const parseValue3 = parseValue;
    const GraphQLDirective2 = GraphQLDirective;
    function buildClientSchema(introspection, options) {
        devAssert(isObjectLike(introspection) && isObjectLike(introspection.__schema), `Invalid or incomplete introspection result. Ensure that you are passing "data" property of introspection response and no "errors" was returned alongside: ${inspect(introspection)}.`);
        const schemaIntrospection = introspection.__schema;
        const typeMap = keyValMap(schemaIntrospection.types, (typeIntrospection)=>typeIntrospection.name
        , (typeIntrospection)=>buildType(typeIntrospection)
        );
        for (const stdType of [
            ...specifiedScalarTypes,
            ...introspectionTypes
        ]){
            if (typeMap[stdType.name]) {
                typeMap[stdType.name] = stdType;
            }
        }
        const queryType = schemaIntrospection.queryType ? getObjectType(schemaIntrospection.queryType) : null;
        const mutationType = schemaIntrospection.mutationType ? getObjectType(schemaIntrospection.mutationType) : null;
        const subscriptionType = schemaIntrospection.subscriptionType ? getObjectType(schemaIntrospection.subscriptionType) : null;
        const directives = schemaIntrospection.directives ? schemaIntrospection.directives.map(buildDirective) : [];
        return new GraphQLSchema1({
            description: schemaIntrospection.description,
            query: queryType,
            mutation: mutationType,
            subscription: subscriptionType,
            types: objectValues(typeMap),
            directives,
            assumeValid: options?.assumeValid
        });
        function getType(typeRef) {
            if (typeRef.kind === TypeKind.LIST) {
                const itemRef = typeRef.ofType;
                if (!itemRef) {
                    throw new Error('Decorated type deeper than introspection query.');
                }
                return GraphQLList1(getType(itemRef));
            }
            if (typeRef.kind === TypeKind.NON_NULL) {
                const nullableRef = typeRef.ofType;
                if (!nullableRef) {
                    throw new Error('Decorated type deeper than introspection query.');
                }
                const nullableType = getType(nullableRef);
                return GraphQLNonNull1(assertNullableType1(nullableType));
            }
            return getNamedType10(typeRef);
        }
        function getNamedType10(typeRef) {
            const typeName = typeRef.name;
            if (!typeName) {
                throw new Error(`Unknown type reference: ${inspect(typeRef)}.`);
            }
            const type = typeMap[typeName];
            if (!type) {
                throw new Error(`Invalid or incomplete schema, unknown type: ${typeName}. Ensure that a full introspection query is used in order to build a client schema.`);
            }
            return type;
        }
        function getObjectType(typeRef) {
            return assertObjectType1(getNamedType10(typeRef));
        }
        function getInterfaceType(typeRef) {
            return assertInterfaceType1(getNamedType10(typeRef));
        }
        function buildType(type) {
            if (type != null && type.name != null && type.kind != null) {
                switch(type.kind){
                    case TypeKind.SCALAR:
                        return buildScalarDef(type);
                    case TypeKind.OBJECT:
                        return buildObjectDef(type);
                    case TypeKind.INTERFACE:
                        return buildInterfaceDef(type);
                    case TypeKind.UNION:
                        return buildUnionDef(type);
                    case TypeKind.ENUM:
                        return buildEnumDef(type);
                    case TypeKind.INPUT_OBJECT:
                        return buildInputObjectDef(type);
                }
            }
            const typeStr = inspect(type);
            throw new Error(`Invalid or incomplete introspection result. Ensure that a full introspection query is used in order to build a client schema: ${typeStr}.`);
        }
        function buildScalarDef(scalarIntrospection) {
            return new GraphQLScalarType1({
                name: scalarIntrospection.name,
                description: scalarIntrospection.description
            });
        }
        function buildImplementationsList(implementingIntrospection) {
            if (implementingIntrospection.interfaces === null && implementingIntrospection.kind === TypeKind.INTERFACE) {
                return [];
            }
            if (!implementingIntrospection.interfaces) {
                const implementingIntrospectionStr = inspect(implementingIntrospection);
                throw new Error(`Introspection result missing interfaces: ${implementingIntrospectionStr}.`);
            }
            return implementingIntrospection.interfaces.map(getInterfaceType);
        }
        function buildObjectDef(objectIntrospection) {
            return new GraphQLObjectType1({
                name: objectIntrospection.name,
                description: objectIntrospection.description,
                interfaces: ()=>buildImplementationsList(objectIntrospection)
                ,
                fields: ()=>buildFieldDefMap(objectIntrospection)
            });
        }
        function buildInterfaceDef(interfaceIntrospection) {
            return new GraphQLInterfaceType1({
                name: interfaceIntrospection.name,
                description: interfaceIntrospection.description,
                interfaces: ()=>buildImplementationsList(interfaceIntrospection)
                ,
                fields: ()=>buildFieldDefMap(interfaceIntrospection)
            });
        }
        function buildUnionDef(unionIntrospection) {
            if (!unionIntrospection.possibleTypes) {
                const unionIntrospectionStr = inspect(unionIntrospection);
                throw new Error(`Introspection result missing possibleTypes: ${unionIntrospectionStr}.`);
            }
            return new GraphQLUnionType1({
                name: unionIntrospection.name,
                description: unionIntrospection.description,
                types: ()=>unionIntrospection.possibleTypes.map(getObjectType)
            });
        }
        function buildEnumDef(enumIntrospection) {
            if (!enumIntrospection.enumValues) {
                const enumIntrospectionStr = inspect(enumIntrospection);
                throw new Error(`Introspection result missing enumValues: ${enumIntrospectionStr}.`);
            }
            return new GraphQLEnumType1({
                name: enumIntrospection.name,
                description: enumIntrospection.description,
                values: keyValMap(enumIntrospection.enumValues, (valueIntrospection)=>valueIntrospection.name
                , (valueIntrospection)=>({
                        description: valueIntrospection.description,
                        deprecationReason: valueIntrospection.deprecationReason
                    })
                )
            });
        }
        function buildInputObjectDef(inputObjectIntrospection) {
            if (!inputObjectIntrospection.inputFields) {
                const inputObjectIntrospectionStr = inspect(inputObjectIntrospection);
                throw new Error(`Introspection result missing inputFields: ${inputObjectIntrospectionStr}.`);
            }
            return new GraphQLInputObjectType1({
                name: inputObjectIntrospection.name,
                description: inputObjectIntrospection.description,
                fields: ()=>buildInputValueDefMap(inputObjectIntrospection.inputFields)
            });
        }
        function buildFieldDefMap(typeIntrospection) {
            if (!typeIntrospection.fields) {
                throw new Error(`Introspection result missing fields: ${inspect(typeIntrospection)}.`);
            }
            return keyValMap(typeIntrospection.fields, (fieldIntrospection)=>fieldIntrospection.name
            , buildField);
        }
        function buildField(fieldIntrospection) {
            const type = getType(fieldIntrospection.type);
            if (!isOutputType1(type)) {
                const typeStr = inspect(type);
                throw new Error(`Introspection must provide output type for fields, but received: ${typeStr}.`);
            }
            if (!fieldIntrospection.args) {
                const fieldIntrospectionStr = inspect(fieldIntrospection);
                throw new Error(`Introspection result missing field args: ${fieldIntrospectionStr}.`);
            }
            return {
                description: fieldIntrospection.description,
                deprecationReason: fieldIntrospection.deprecationReason,
                type,
                args: buildInputValueDefMap(fieldIntrospection.args)
            };
        }
        function buildInputValueDefMap(inputValueIntrospections) {
            return keyValMap(inputValueIntrospections, (inputValue)=>inputValue.name
            , buildInputValue);
        }
        function buildInputValue(inputValueIntrospection) {
            const type = getType(inputValueIntrospection.type);
            if (!isInputType1(type)) {
                const typeStr = inspect(type);
                throw new Error(`Introspection must provide input type for arguments, but received: ${typeStr}.`);
            }
            const defaultValue = inputValueIntrospection.defaultValue != null ? valueFromAST1(parseValue(inputValueIntrospection.defaultValue), type) : undefined;
            return {
                description: inputValueIntrospection.description,
                type,
                defaultValue
            };
        }
        function buildDirective(directiveIntrospection) {
            if (!directiveIntrospection.args) {
                const directiveIntrospectionStr = inspect(directiveIntrospection);
                throw new Error(`Introspection result missing directive args: ${directiveIntrospectionStr}.`);
            }
            if (!directiveIntrospection.locations) {
                const directiveIntrospectionStr = inspect(directiveIntrospection);
                throw new Error(`Introspection result missing directive locations: ${directiveIntrospectionStr}.`);
            }
            return new GraphQLDirective({
                name: directiveIntrospection.name,
                description: directiveIntrospection.description,
                isRepeatable: directiveIntrospection.isRepeatable,
                locations: directiveIntrospection.locations.slice(),
                args: buildInputValueDefMap(directiveIntrospection.args)
            });
        }
    }
    const buildClientSchema1 = buildClientSchema;
    const devAssert7 = devAssert;
    const assertValidSDL1 = assertValidSDL;
    const objectValues6 = objectValues;
    const GraphQLDirective3 = GraphQLDirective;
    const isIntrospectionType2 = isIntrospectionType;
    const isSpecifiedScalarType2 = isSpecifiedScalarType;
    const invariant6 = invariant;
    const inspect17 = inspect;
    const devAssert8 = devAssert;
    const assertValidSDLExtension1 = assertValidSDLExtension;
    function extendSchema(schema3, documentAST, options) {
        assertSchema1(schema3);
        devAssert(documentAST != null && documentAST.kind === Kind1.DOCUMENT, 'Must provide valid Document AST.');
        if (options?.assumeValid !== true && options?.assumeValidSDL !== true) {
            assertValidSDLExtension(documentAST, schema3);
        }
        const schemaConfig = schema3.toConfig();
        const extendedConfig = extendSchemaImpl(schemaConfig, documentAST, options);
        return schemaConfig === extendedConfig ? schema3 : new GraphQLSchema1(extendedConfig);
    }
    const extendSchema1 = extendSchema;
    function extendSchemaImpl(schemaConfig, documentAST, options) {
        const typeDefs = [];
        const typeExtensionsMap = Object.create(null);
        const directiveDefs = [];
        let schemaDef;
        const schemaExtensions = [];
        for (const def of documentAST.definitions){
            if (def.kind === Kind1.SCHEMA_DEFINITION) {
                schemaDef = def;
            } else if (def.kind === Kind1.SCHEMA_EXTENSION) {
                schemaExtensions.push(def);
            } else if (isTypeDefinitionNode1(def)) {
                typeDefs.push(def);
            } else if (isTypeExtensionNode1(def)) {
                const extendedTypeName = def.name.value;
                const existingTypeExtensions = typeExtensionsMap[extendedTypeName];
                typeExtensionsMap[extendedTypeName] = existingTypeExtensions ? existingTypeExtensions.concat([
                    def
                ]) : [
                    def
                ];
            } else if (def.kind === Kind1.DIRECTIVE_DEFINITION) {
                directiveDefs.push(def);
            }
        }
        if (Object.keys(typeExtensionsMap).length === 0 && typeDefs.length === 0 && directiveDefs.length === 0 && schemaExtensions.length === 0 && schemaDef == null) {
            return schemaConfig;
        }
        const typeMap = Object.create(null);
        for (const existingType of schemaConfig.types){
            typeMap[existingType.name] = extendNamedType(existingType);
        }
        for (const typeNode of typeDefs){
            const name2 = typeNode.name.value;
            typeMap[name2] = stdTypeMap[name2] ?? buildType(typeNode);
        }
        const operationTypes = {
            query: schemaConfig.query && replaceNamedType(schemaConfig.query),
            mutation: schemaConfig.mutation && replaceNamedType(schemaConfig.mutation),
            subscription: schemaConfig.subscription && replaceNamedType(schemaConfig.subscription),
            ...schemaDef && getOperationTypes([
                schemaDef
            ]),
            ...getOperationTypes(schemaExtensions)
        };
        return {
            description: schemaDef?.description?.value,
            ...operationTypes,
            types: objectValues(typeMap),
            directives: [
                ...schemaConfig.directives.map(replaceDirective),
                ...directiveDefs.map(buildDirective)
            ],
            extensions: undefined,
            astNode: schemaDef ?? schemaConfig.astNode,
            extensionASTNodes: schemaConfig.extensionASTNodes.concat(schemaExtensions),
            assumeValid: options?.assumeValid ?? false
        };
        function replaceType(type) {
            if (isListType1(type)) {
                return new GraphQLList1(replaceType(type.ofType));
            } else if (isNonNullType1(type)) {
                return new GraphQLNonNull1(replaceType(type.ofType));
            }
            return replaceNamedType(type);
        }
        function replaceNamedType(type) {
            return typeMap[type.name];
        }
        function replaceDirective(directive1) {
            const config8 = directive1.toConfig();
            return new GraphQLDirective({
                ...config8,
                args: mapValue(config8.args, extendArg)
            });
        }
        function extendNamedType(type) {
            if (isIntrospectionType(type) || isSpecifiedScalarType(type)) {
                return type;
            }
            if (isScalarType1(type)) {
                return extendScalarType(type);
            }
            if (isObjectType1(type)) {
                return extendObjectType(type);
            }
            if (isInterfaceType1(type)) {
                return extendInterfaceType(type);
            }
            if (isUnionType1(type)) {
                return extendUnionType(type);
            }
            if (isEnumType1(type)) {
                return extendEnumType(type);
            }
            if (isInputObjectType1(type)) {
                return extendInputObjectType(type);
            }
            invariant(false, 'Unexpected type: ' + inspect(type));
        }
        function extendInputObjectType(type) {
            const config8 = type.toConfig();
            const extensions1 = typeExtensionsMap[config8.name] ?? [];
            return new GraphQLInputObjectType1({
                ...config8,
                fields: ()=>({
                        ...mapValue(config8.fields, (field)=>({
                                ...field,
                                type: replaceType(field.type)
                            })
                        ),
                        ...buildInputFieldMap(extensions1)
                    })
                ,
                extensionASTNodes: config8.extensionASTNodes.concat(extensions1)
            });
        }
        function extendEnumType(type) {
            const config8 = type.toConfig();
            const extensions1 = typeExtensionsMap[type.name] ?? [];
            return new GraphQLEnumType1({
                ...config8,
                values: {
                    ...config8.values,
                    ...buildEnumValueMap(extensions1)
                },
                extensionASTNodes: config8.extensionASTNodes.concat(extensions1)
            });
        }
        function extendScalarType(type) {
            const config8 = type.toConfig();
            const extensions1 = typeExtensionsMap[config8.name] ?? [];
            return new GraphQLScalarType1({
                ...config8,
                extensionASTNodes: config8.extensionASTNodes.concat(extensions1)
            });
        }
        function extendObjectType(type) {
            const config8 = type.toConfig();
            const extensions1 = typeExtensionsMap[config8.name] ?? [];
            return new GraphQLObjectType1({
                ...config8,
                interfaces: ()=>[
                        ...type.getInterfaces().map(replaceNamedType),
                        ...buildInterfaces(extensions1)
                    ]
                ,
                fields: ()=>({
                        ...mapValue(config8.fields, extendField),
                        ...buildFieldMap(extensions1)
                    })
                ,
                extensionASTNodes: config8.extensionASTNodes.concat(extensions1)
            });
        }
        function extendInterfaceType(type) {
            const config8 = type.toConfig();
            const extensions1 = typeExtensionsMap[config8.name] ?? [];
            return new GraphQLInterfaceType1({
                ...config8,
                interfaces: ()=>[
                        ...type.getInterfaces().map(replaceNamedType),
                        ...buildInterfaces(extensions1)
                    ]
                ,
                fields: ()=>({
                        ...mapValue(config8.fields, extendField),
                        ...buildFieldMap(extensions1)
                    })
                ,
                extensionASTNodes: config8.extensionASTNodes.concat(extensions1)
            });
        }
        function extendUnionType(type) {
            const config8 = type.toConfig();
            const extensions1 = typeExtensionsMap[config8.name] ?? [];
            return new GraphQLUnionType1({
                ...config8,
                types: ()=>[
                        ...type.getTypes().map(replaceNamedType),
                        ...buildUnionTypes(extensions1)
                    ]
                ,
                extensionASTNodes: config8.extensionASTNodes.concat(extensions1)
            });
        }
        function extendField(field) {
            return {
                ...field,
                type: replaceType(field.type),
                args: mapValue(field.args, extendArg)
            };
        }
        function extendArg(arg) {
            return {
                ...arg,
                type: replaceType(arg.type)
            };
        }
        function getOperationTypes(nodes1) {
            const opTypes = {
            };
            for (const node of nodes1){
                const operationTypesNodes = node.operationTypes ?? [];
                for (const operationType of operationTypesNodes){
                    opTypes[operationType.operation] = getNamedType10(operationType.type);
                }
            }
            return opTypes;
        }
        function getNamedType10(node) {
            const name2 = node.name.value;
            const type = stdTypeMap[name2] ?? typeMap[name2];
            if (type === undefined) {
                throw new Error(`Unknown type: "${name2}".`);
            }
            return type;
        }
        function getWrappedType(node) {
            if (node.kind === Kind1.LIST_TYPE) {
                return new GraphQLList1(getWrappedType(node.type));
            }
            if (node.kind === Kind1.NON_NULL_TYPE) {
                return new GraphQLNonNull1(getWrappedType(node.type));
            }
            return getNamedType10(node);
        }
        function buildDirective(node) {
            const locations = node.locations.map(({ value: value1  })=>value1
            );
            return new GraphQLDirective({
                name: node.name.value,
                description: getDescription(node, options),
                locations,
                isRepeatable: node.repeatable,
                args: buildArgumentMap(node.arguments),
                astNode: node
            });
        }
        function buildFieldMap(nodes1) {
            const fieldConfigMap = Object.create(null);
            for (const node of nodes1){
                const nodeFields = node.fields ?? [];
                for (const field of nodeFields){
                    fieldConfigMap[field.name.value] = {
                        type: getWrappedType(field.type),
                        description: getDescription(field, options),
                        args: buildArgumentMap(field.arguments),
                        deprecationReason: getDeprecationReason(field),
                        astNode: field
                    };
                }
            }
            return fieldConfigMap;
        }
        function buildArgumentMap(args1) {
            const argsNodes = args1 ?? [];
            const argConfigMap = Object.create(null);
            for (const arg of argsNodes){
                const type = getWrappedType(arg.type);
                argConfigMap[arg.name.value] = {
                    type,
                    description: getDescription(arg, options),
                    defaultValue: valueFromAST2(arg.defaultValue, type),
                    astNode: arg
                };
            }
            return argConfigMap;
        }
        function buildInputFieldMap(nodes1) {
            const inputFieldMap = Object.create(null);
            for (const node of nodes1){
                const fieldsNodes = node.fields ?? [];
                for (const field of fieldsNodes){
                    const type = getWrappedType(field.type);
                    inputFieldMap[field.name.value] = {
                        type,
                        description: getDescription(field, options),
                        defaultValue: valueFromAST2(field.defaultValue, type),
                        astNode: field
                    };
                }
            }
            return inputFieldMap;
        }
        function buildEnumValueMap(nodes1) {
            const enumValueMap = Object.create(null);
            for (const node of nodes1){
                const valuesNodes = node.values ?? [];
                for (const value1 of valuesNodes){
                    enumValueMap[value1.name.value] = {
                        description: getDescription(value1, options),
                        deprecationReason: getDeprecationReason(value1),
                        astNode: value1
                    };
                }
            }
            return enumValueMap;
        }
        function buildInterfaces(nodes1) {
            const interfaces = [];
            for (const node of nodes1){
                const interfacesNodes = node.interfaces ?? [];
                for (const type of interfacesNodes){
                    interfaces.push(getNamedType10(type));
                }
            }
            return interfaces;
        }
        function buildUnionTypes(nodes1) {
            const types1 = [];
            for (const node of nodes1){
                const typeNodes = node.types ?? [];
                for (const type of typeNodes){
                    types1.push(getNamedType10(type));
                }
            }
            return types1;
        }
        function buildType(astNode) {
            const name2 = astNode.name.value;
            const description = getDescription(astNode, options);
            const extensionNodes = typeExtensionsMap[name2] ?? [];
            switch(astNode.kind){
                case Kind1.OBJECT_TYPE_DEFINITION:
                    {
                        const extensionASTNodes = extensionNodes;
                        const allNodes = [
                            astNode,
                            ...extensionASTNodes
                        ];
                        return new GraphQLObjectType1({
                            name: name2,
                            description,
                            interfaces: ()=>buildInterfaces(allNodes)
                            ,
                            fields: ()=>buildFieldMap(allNodes)
                            ,
                            astNode,
                            extensionASTNodes
                        });
                    }
                case Kind1.INTERFACE_TYPE_DEFINITION:
                    {
                        const extensionASTNodes = extensionNodes;
                        const allNodes = [
                            astNode,
                            ...extensionASTNodes
                        ];
                        return new GraphQLInterfaceType1({
                            name: name2,
                            description,
                            interfaces: ()=>buildInterfaces(allNodes)
                            ,
                            fields: ()=>buildFieldMap(allNodes)
                            ,
                            astNode,
                            extensionASTNodes
                        });
                    }
                case Kind1.ENUM_TYPE_DEFINITION:
                    {
                        const extensionASTNodes = extensionNodes;
                        const allNodes = [
                            astNode,
                            ...extensionASTNodes
                        ];
                        return new GraphQLEnumType1({
                            name: name2,
                            description,
                            values: buildEnumValueMap(allNodes),
                            astNode,
                            extensionASTNodes
                        });
                    }
                case Kind1.UNION_TYPE_DEFINITION:
                    {
                        const extensionASTNodes = extensionNodes;
                        const allNodes = [
                            astNode,
                            ...extensionASTNodes
                        ];
                        return new GraphQLUnionType1({
                            name: name2,
                            description,
                            types: ()=>buildUnionTypes(allNodes)
                            ,
                            astNode,
                            extensionASTNodes
                        });
                    }
                case Kind1.SCALAR_TYPE_DEFINITION:
                    {
                        const extensionASTNodes = extensionNodes;
                        return new GraphQLScalarType1({
                            name: name2,
                            description,
                            astNode,
                            extensionASTNodes
                        });
                    }
                case Kind1.INPUT_OBJECT_TYPE_DEFINITION:
                    {
                        const extensionASTNodes = extensionNodes;
                        const allNodes = [
                            astNode,
                            ...extensionASTNodes
                        ];
                        return new GraphQLInputObjectType1({
                            name: name2,
                            description,
                            fields: ()=>buildInputFieldMap(allNodes)
                            ,
                            astNode,
                            extensionASTNodes
                        });
                    }
            }
            invariant(false, 'Unexpected type definition node: ' + inspect(astNode));
        }
    }
    const extendSchemaImpl1 = extendSchemaImpl;
    const extendSchemaImpl2 = extendSchemaImpl1;
    const specifiedScalarTypes4 = specifiedScalarTypes;
    const introspectionTypes3 = introspectionTypes;
    const stdTypeMap = keyMap(specifiedScalarTypes.concat(introspectionTypes), (type)=>type.name
    );
    const GraphQLDeprecatedDirective2 = GraphQLDeprecatedDirective;
    function getDeprecationReason(node) {
        const deprecated = getDirectiveValues1(GraphQLDeprecatedDirective, node);
        return deprecated?.reason;
    }
    const dedentBlockStringValue2 = dedentBlockStringValue;
    function getDescription(node, options) {
        if (node.description) {
            return node.description.value;
        }
        if (options?.commentDescriptions === true) {
            const rawValue = getLeadingCommentBlock(node);
            if (rawValue !== undefined) {
                return dedentBlockStringValue('\n' + rawValue);
            }
        }
    }
    const getDescription1 = getDescription;
    const TokenKind3 = TokenKind;
    function getLeadingCommentBlock(node) {
        const loc = node.loc;
        if (!loc) {
            return;
        }
        const comments = [];
        let token = loc.startToken.prev;
        while(token != null && token.kind === TokenKind.COMMENT && token.next && token.prev && token.line + 1 === token.next.line && token.line !== token.prev.line){
            const value1 = String(token.value);
            comments.push(value1);
            token = token.prev;
        }
        return comments.length > 0 ? comments.reverse().join('\n') : undefined;
    }
    const GraphQLSkipDirective2 = GraphQLSkipDirective;
    const GraphQLIncludeDirective2 = GraphQLIncludeDirective;
    const GraphQLDeprecatedDirective3 = GraphQLDeprecatedDirective;
    function buildASTSchema(documentAST, options) {
        devAssert(documentAST != null && documentAST.kind === Kind1.DOCUMENT, 'Must provide valid Document AST.');
        if (options?.assumeValid !== true && options?.assumeValidSDL !== true) {
            assertValidSDL(documentAST);
        }
        const config8 = extendSchemaImpl1(emptySchemaConfig, documentAST, options);
        if (config8.astNode == null) {
            for (const type of config8.types){
                switch(type.name){
                    case 'Query':
                        config8.query = type;
                        break;
                    case 'Mutation':
                        config8.mutation = type;
                        break;
                    case 'Subscription':
                        config8.subscription = type;
                        break;
                }
            }
        }
        const { directives  } = config8;
        if (!directives.some((directive1)=>directive1.name === 'skip'
        )) {
            directives.push(GraphQLSkipDirective);
        }
        if (!directives.some((directive1)=>directive1.name === 'include'
        )) {
            directives.push(GraphQLIncludeDirective);
        }
        if (!directives.some((directive1)=>directive1.name === 'deprecated'
        )) {
            directives.push(GraphQLDeprecatedDirective);
        }
        return new GraphQLSchema1(config8);
    }
    const buildASTSchema1 = buildASTSchema;
    const emptySchemaConfig = new GraphQLSchema1({
        directives: []
    }).toConfig();
    const parse5 = parse1;
    function buildSchema(source3, options) {
        const document = parse1(source3, {
            noLocation: options?.noLocation,
            allowLegacySDLEmptyFields: options?.allowLegacySDLEmptyFields,
            allowLegacySDLImplementsInterfaces: options?.allowLegacySDLImplementsInterfaces,
            experimentalFragmentVariables: options?.experimentalFragmentVariables
        });
        return buildASTSchema(document, {
            commentDescriptions: options?.commentDescriptions,
            assumeValidSDL: options?.assumeValidSDL,
            assumeValid: options?.assumeValid
        });
    }
    const buildSchema1 = buildSchema;
    const keyValMap3 = keyValMap;
    const objectValues7 = objectValues;
    const GraphQLDirective4 = GraphQLDirective;
    const isIntrospectionType3 = isIntrospectionType;
    const invariant7 = invariant;
    const inspect18 = inspect;
    function lexicographicSortSchema(schema3) {
        const schemaConfig = schema3.toConfig();
        const typeMap = keyValMap(sortByName(schemaConfig.types), (type)=>type.name
        , sortNamedType);
        return new GraphQLSchema1({
            ...schemaConfig,
            types: objectValues(typeMap),
            directives: sortByName(schemaConfig.directives).map(sortDirective),
            query: replaceMaybeType(schemaConfig.query),
            mutation: replaceMaybeType(schemaConfig.mutation),
            subscription: replaceMaybeType(schemaConfig.subscription)
        });
        function replaceType(type) {
            if (isListType1(type)) {
                return new GraphQLList1(replaceType(type.ofType));
            } else if (isNonNullType1(type)) {
                return new GraphQLNonNull1(replaceType(type.ofType));
            }
            return replaceNamedType(type);
        }
        function replaceNamedType(type) {
            return typeMap[type.name];
        }
        function replaceMaybeType(maybeType) {
            return maybeType && replaceNamedType(maybeType);
        }
        function sortDirective(directive1) {
            const config8 = directive1.toConfig();
            return new GraphQLDirective({
                ...config8,
                locations: sortBy(config8.locations, (x)=>x
                ),
                args: sortArgs(config8.args)
            });
        }
        function sortArgs(args1) {
            return sortObjMap(args1, (arg)=>({
                    ...arg,
                    type: replaceType(arg.type)
                })
            );
        }
        function sortFields(fieldsMap) {
            return sortObjMap(fieldsMap, (field)=>({
                    ...field,
                    type: replaceType(field.type),
                    args: sortArgs(field.args)
                })
            );
        }
        function sortInputFields(fieldsMap) {
            return sortObjMap(fieldsMap, (field)=>({
                    ...field,
                    type: replaceType(field.type)
                })
            );
        }
        function sortTypes(arr) {
            return sortByName(arr).map(replaceNamedType);
        }
        function sortNamedType(type) {
            if (isScalarType1(type) || isIntrospectionType(type)) {
                return type;
            }
            if (isObjectType1(type)) {
                const config8 = type.toConfig();
                return new GraphQLObjectType1({
                    ...config8,
                    interfaces: ()=>sortTypes(config8.interfaces)
                    ,
                    fields: ()=>sortFields(config8.fields)
                });
            }
            if (isInterfaceType1(type)) {
                const config8 = type.toConfig();
                return new GraphQLInterfaceType1({
                    ...config8,
                    interfaces: ()=>sortTypes(config8.interfaces)
                    ,
                    fields: ()=>sortFields(config8.fields)
                });
            }
            if (isUnionType1(type)) {
                const config8 = type.toConfig();
                return new GraphQLUnionType1({
                    ...config8,
                    types: ()=>sortTypes(config8.types)
                });
            }
            if (isEnumType1(type)) {
                const config8 = type.toConfig();
                return new GraphQLEnumType1({
                    ...config8,
                    values: sortObjMap(config8.values)
                });
            }
            if (isInputObjectType1(type)) {
                const config8 = type.toConfig();
                return new GraphQLInputObjectType1({
                    ...config8,
                    fields: ()=>sortInputFields(config8.fields)
                });
            }
            invariant(false, 'Unexpected type: ' + inspect(type));
        }
    }
    const lexicographicSortSchema1 = lexicographicSortSchema;
    function sortObjMap(map, sortValueFn) {
        const sortedMap = Object.create(null);
        const sortedKeys = sortBy(Object.keys(map), (x)=>x
        );
        for (const key of sortedKeys){
            const value1 = map[key];
            sortedMap[key] = sortValueFn ? sortValueFn(value1) : value1;
        }
        return sortedMap;
    }
    function sortByName(array) {
        return sortBy(array, (obj)=>obj.name
        );
    }
    function sortBy(array, mapToKey) {
        return array.slice().sort((obj1, obj2)=>{
            const key1 = mapToKey(obj1);
            const key2 = mapToKey(obj2);
            return key1.localeCompare(key2);
        });
    }
    const isSpecifiedDirective2 = isSpecifiedDirective;
    function printSchema(schema3, options) {
        return printFilteredSchema(schema3, (n)=>!isSpecifiedDirective(n)
        , isDefinedType, options);
    }
    const printSchema1 = printSchema;
    const isIntrospectionType4 = isIntrospectionType;
    function printIntrospectionSchema(schema3, options) {
        return printFilteredSchema(schema3, isSpecifiedDirective, isIntrospectionType, options);
    }
    const printIntrospectionSchema1 = printIntrospectionSchema;
    const isSpecifiedScalarType3 = isSpecifiedScalarType;
    function isDefinedType(type) {
        return !isSpecifiedScalarType(type) && !isIntrospectionType(type);
    }
    const objectValues8 = objectValues;
    function printFilteredSchema(schema3, directiveFilter, typeFilter, options) {
        const directives = schema3.getDirectives().filter(directiveFilter);
        const types1 = objectValues(schema3.getTypeMap()).filter(typeFilter);
        return [
            printSchemaDefinition(schema3)
        ].concat(directives.map((directive1)=>printDirective(directive1, options)
        ), types1.map((type)=>printType2(type, options)
        )).filter(Boolean).join('\n\n') + '\n';
    }
    function printSchemaDefinition(schema3) {
        if (schema3.description == null && isSchemaOfCommonNames(schema3)) {
            return;
        }
        const operationTypes = [];
        const queryType = schema3.getQueryType();
        if (queryType) {
            operationTypes.push(`  query: ${queryType.name}`);
        }
        const mutationType = schema3.getMutationType();
        if (mutationType) {
            operationTypes.push(`  mutation: ${mutationType.name}`);
        }
        const subscriptionType = schema3.getSubscriptionType();
        if (subscriptionType) {
            operationTypes.push(`  subscription: ${subscriptionType.name}`);
        }
        return printDescription({
        }, schema3) + `schema {\n${operationTypes.join('\n')}\n}`;
    }
    function isSchemaOfCommonNames(schema3) {
        const queryType = schema3.getQueryType();
        if (queryType && queryType.name !== 'Query') {
            return false;
        }
        const mutationType = schema3.getMutationType();
        if (mutationType && mutationType.name !== 'Mutation') {
            return false;
        }
        const subscriptionType = schema3.getSubscriptionType();
        if (subscriptionType && subscriptionType.name !== 'Subscription') {
            return false;
        }
        return true;
    }
    const invariant8 = invariant;
    const inspect19 = inspect;
    function printType2(type, options) {
        if (isScalarType1(type)) {
            return printScalar(type, options);
        }
        if (isObjectType1(type)) {
            return printObject(type, options);
        }
        if (isInterfaceType1(type)) {
            return printInterface(type, options);
        }
        if (isUnionType1(type)) {
            return printUnion(type, options);
        }
        if (isEnumType1(type)) {
            return printEnum(type, options);
        }
        if (isInputObjectType1(type)) {
            return printInputObject(type, options);
        }
        invariant(false, 'Unexpected type: ' + inspect(type));
    }
    const printType3 = printType2;
    function printScalar(type, options) {
        return printDescription(options, type) + `scalar ${type.name}`;
    }
    function printImplementedInterfaces(type) {
        const interfaces = type.getInterfaces();
        return interfaces.length ? ' implements ' + interfaces.map((i)=>i.name
        ).join(' & ') : '';
    }
    function printObject(type, options) {
        return printDescription(options, type) + `type ${type.name}` + printImplementedInterfaces(type) + printFields(options, type);
    }
    function printInterface(type, options) {
        return printDescription(options, type) + `interface ${type.name}` + printImplementedInterfaces(type) + printFields(options, type);
    }
    function printUnion(type, options) {
        const types1 = type.getTypes();
        const possibleTypes = types1.length ? ' = ' + types1.join(' | ') : '';
        return printDescription(options, type) + 'union ' + type.name + possibleTypes;
    }
    function printEnum(type, options) {
        const values = type.getValues().map((value1, i)=>printDescription(options, value1, '  ', !i) + '  ' + value1.name + printDeprecated(value1)
        );
        return printDescription(options, type) + `enum ${type.name}` + printBlock(values);
    }
    function printInputObject(type, options) {
        const fields = objectValues(type.getFields()).map((f, i)=>printDescription(options, f, '  ', !i) + '  ' + printInputValue(f)
        );
        return printDescription(options, type) + `input ${type.name}` + printBlock(fields);
    }
    function printFields(options, type) {
        const fields = objectValues(type.getFields()).map((f, i)=>printDescription(options, f, '  ', !i) + '  ' + f.name + printArgs(options, f.args, '  ') + ': ' + String(f.type) + printDeprecated(f)
        );
        return printBlock(fields);
    }
    function printBlock(items) {
        return items.length !== 0 ? ' {\n' + items.join('\n') + '\n}' : '';
    }
    function printArgs(options, args1, indentation = '') {
        if (args1.length === 0) {
            return '';
        }
        if (args1.every((arg)=>!arg.description
        )) {
            return '(' + args1.map(printInputValue).join(', ') + ')';
        }
        return '(\n' + args1.map((arg, i)=>printDescription(options, arg, '  ' + indentation, !i) + '  ' + indentation + printInputValue(arg)
        ).join('\n') + '\n' + indentation + ')';
    }
    const astFromValue1 = astFromValue;
    function printInputValue(arg) {
        const defaultAST = astFromValue(arg.defaultValue, arg.type);
        let argDecl = arg.name + ': ' + String(arg.type);
        if (defaultAST) {
            argDecl += ` = ${print3(defaultAST)}`;
        }
        return argDecl;
    }
    function printDirective(directive1, options) {
        return printDescription(options, directive1) + 'directive @' + directive1.name + printArgs(options, directive1.args) + (directive1.isRepeatable ? ' repeatable' : '') + ' on ' + directive1.locations.join(' | ');
    }
    const GraphQLString2 = GraphQLString;
    const DEFAULT_DEPRECATION_REASON2 = DEFAULT_DEPRECATION_REASON;
    function printDeprecated(fieldOrEnumVal) {
        if (!fieldOrEnumVal.isDeprecated) {
            return '';
        }
        const reason = fieldOrEnumVal.deprecationReason;
        const reasonAST = astFromValue(reason, GraphQLString);
        if (reasonAST && reason !== DEFAULT_DEPRECATION_REASON) {
            return ' @deprecated(reason: ' + print1(reasonAST) + ')';
        }
        return ' @deprecated';
    }
    const printBlockString2 = printBlockString;
    function printDescription(options, def, indentation = '', firstInBlock = true) {
        const { description  } = def;
        if (description == null) {
            return '';
        }
        if (options?.commentDescriptions === true) {
            return printDescriptionWithComments(description, indentation, firstInBlock);
        }
        const preferMultipleLines = description.length > 70;
        const blockString = printBlockString(description, '', preferMultipleLines);
        const prefix = indentation && !firstInBlock ? '\n' + indentation : indentation;
        return prefix + blockString.replace(/\n/g, '\n' + indentation) + '\n';
    }
    function printDescriptionWithComments(description, indentation, firstInBlock) {
        const prefix = indentation && !firstInBlock ? '\n' : '';
        const comment = description.split('\n').map((line1)=>indentation + (line1 !== '' ? '# ' + line1 : '#')
        ).join('\n');
        return prefix + comment + '\n';
    }
    const flatMap1 = flatMap;
    function concatAST(asts) {
        return {
            kind: 'Document',
            definitions: flatMap(asts, (ast3)=>ast3.definitions
            )
        };
    }
    const concatAST1 = concatAST;
    function separateOperations(documentAST) {
        const operations = [];
        const depGraph = Object.create(null);
        let fromName;
        visit1(documentAST, {
            OperationDefinition (node) {
                fromName = opName(node);
                operations.push(node);
            },
            FragmentDefinition (node) {
                fromName = node.name.value;
            },
            FragmentSpread (node) {
                const toName = node.name.value;
                let dependents = depGraph[fromName];
                if (dependents === undefined) {
                    dependents = depGraph[fromName] = Object.create(null);
                }
                dependents[toName] = true;
            }
        });
        const separatedDocumentASTs = Object.create(null);
        for (const operation of operations){
            const operationName = opName(operation);
            const dependencies = Object.create(null);
            collectTransitiveDependencies(dependencies, depGraph, operationName);
            separatedDocumentASTs[operationName] = {
                kind: Kind2.DOCUMENT,
                definitions: documentAST.definitions.filter((node)=>node === operation || node.kind === Kind2.FRAGMENT_DEFINITION && dependencies[node.name.value]
                )
            };
        }
        return separatedDocumentASTs;
    }
    const separateOperations1 = separateOperations;
    function opName(operation) {
        return operation.name ? operation.name.value : '';
    }
    function collectTransitiveDependencies(collected, depGraph, fromName) {
        const immediateDeps = depGraph[fromName];
        if (immediateDeps) {
            for (const toName of Object.keys(immediateDeps)){
                if (!collected[toName]) {
                    collected[toName] = true;
                    collectTransitiveDependencies(collected, depGraph, toName);
                }
            }
        }
    }
    const inspect20 = inspect;
    const TokenKind4 = TokenKind;
    function stripIgnoredCharacters(source3) {
        const sourceObj = typeof source3 === 'string' ? new Source1(source3) : source3;
        if (!(sourceObj instanceof Source1)) {
            throw new TypeError(`Must provide string or Source. Received: ${inspect(sourceObj)}.`);
        }
        const body1 = sourceObj.body;
        const lexer = new Lexer1(sourceObj);
        let strippedBody = '';
        let wasLastAddedTokenNonPunctuator = false;
        while(lexer.advance().kind !== TokenKind.EOF){
            const currentToken = lexer.token;
            const tokenKind = currentToken.kind;
            const isNonPunctuator = !isPunctuatorTokenKind1(currentToken.kind);
            if (wasLastAddedTokenNonPunctuator) {
                if (isNonPunctuator || currentToken.kind === TokenKind.SPREAD) {
                    strippedBody += ' ';
                }
            }
            const tokenBody = body1.slice(currentToken.start, currentToken.end);
            if (tokenKind === TokenKind.BLOCK_STRING) {
                strippedBody += dedentBlockString(tokenBody);
            } else {
                strippedBody += tokenBody;
            }
            wasLastAddedTokenNonPunctuator = isNonPunctuator;
        }
        return strippedBody;
    }
    const stripIgnoredCharacters1 = stripIgnoredCharacters;
    const dedentBlockStringValue3 = dedentBlockStringValue;
    const getBlockStringIndentation1 = getBlockStringIndentation;
    function dedentBlockString(blockStr) {
        const rawStr = blockStr.slice(3, -3);
        let body1 = dedentBlockStringValue(rawStr);
        const lines = body1.split(/\r\n|[\n\r]/g);
        if (getBlockStringIndentation(lines) > 0) {
            body1 = '\n' + body1;
        }
        const lastChar = body1[body1.length - 1];
        const hasTrailingQuote = lastChar === '"' && body1.slice(-4) !== '\\"""';
        if (hasTrailingQuote || lastChar === '\\') {
            body1 += '\n';
        }
        return '"""' + body1 + '"""';
    }
    const BreakingChangeType = Object.freeze({
        TYPE_REMOVED: 'TYPE_REMOVED',
        TYPE_CHANGED_KIND: 'TYPE_CHANGED_KIND',
        TYPE_REMOVED_FROM_UNION: 'TYPE_REMOVED_FROM_UNION',
        VALUE_REMOVED_FROM_ENUM: 'VALUE_REMOVED_FROM_ENUM',
        REQUIRED_INPUT_FIELD_ADDED: 'REQUIRED_INPUT_FIELD_ADDED',
        IMPLEMENTED_INTERFACE_REMOVED: 'IMPLEMENTED_INTERFACE_REMOVED',
        FIELD_REMOVED: 'FIELD_REMOVED',
        FIELD_CHANGED_KIND: 'FIELD_CHANGED_KIND',
        REQUIRED_ARG_ADDED: 'REQUIRED_ARG_ADDED',
        ARG_REMOVED: 'ARG_REMOVED',
        ARG_CHANGED_KIND: 'ARG_CHANGED_KIND',
        DIRECTIVE_REMOVED: 'DIRECTIVE_REMOVED',
        DIRECTIVE_ARG_REMOVED: 'DIRECTIVE_ARG_REMOVED',
        REQUIRED_DIRECTIVE_ARG_ADDED: 'REQUIRED_DIRECTIVE_ARG_ADDED',
        DIRECTIVE_REPEATABLE_REMOVED: 'DIRECTIVE_REPEATABLE_REMOVED',
        DIRECTIVE_LOCATION_REMOVED: 'DIRECTIVE_LOCATION_REMOVED'
    });
    const BreakingChangeType1 = BreakingChangeType;
    const DangerousChangeType = Object.freeze({
        VALUE_ADDED_TO_ENUM: 'VALUE_ADDED_TO_ENUM',
        TYPE_ADDED_TO_UNION: 'TYPE_ADDED_TO_UNION',
        OPTIONAL_INPUT_FIELD_ADDED: 'OPTIONAL_INPUT_FIELD_ADDED',
        OPTIONAL_ARG_ADDED: 'OPTIONAL_ARG_ADDED',
        IMPLEMENTED_INTERFACE_ADDED: 'IMPLEMENTED_INTERFACE_ADDED',
        ARG_DEFAULT_VALUE_CHANGE: 'ARG_DEFAULT_VALUE_CHANGE'
    });
    const DangerousChangeType1 = DangerousChangeType;
    function findBreakingChanges(oldSchema, newSchema) {
        const breakingChanges = findSchemaChanges(oldSchema, newSchema).filter((change)=>change.type in BreakingChangeType
        );
        return breakingChanges;
    }
    const findBreakingChanges1 = findBreakingChanges;
    function findDangerousChanges(oldSchema, newSchema) {
        const dangerousChanges = findSchemaChanges(oldSchema, newSchema).filter((change)=>change.type in DangerousChangeType
        );
        return dangerousChanges;
    }
    const findDangerousChanges1 = findDangerousChanges;
    function findSchemaChanges(oldSchema, newSchema) {
        return [
            ...findTypeChanges(oldSchema, newSchema),
            ...findDirectiveChanges(oldSchema, newSchema)
        ];
    }
    function findDirectiveChanges(oldSchema, newSchema) {
        const schemaChanges = [];
        const directivesDiff = diff(oldSchema.getDirectives(), newSchema.getDirectives());
        for (const oldDirective of directivesDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.DIRECTIVE_REMOVED,
                description: `${oldDirective.name} was removed.`
            });
        }
        for (const [oldDirective1, newDirective] of directivesDiff.persisted){
            const argsDiff = diff(oldDirective1.args, newDirective.args);
            for (const newArg of argsDiff.added){
                if (isRequiredArgument1(newArg)) {
                    schemaChanges.push({
                        type: BreakingChangeType.REQUIRED_DIRECTIVE_ARG_ADDED,
                        description: `A required arg ${newArg.name} on directive ${oldDirective1.name} was added.`
                    });
                }
            }
            for (const oldArg of argsDiff.removed){
                schemaChanges.push({
                    type: BreakingChangeType.DIRECTIVE_ARG_REMOVED,
                    description: `${oldArg.name} was removed from ${oldDirective1.name}.`
                });
            }
            if (oldDirective1.isRepeatable && !newDirective.isRepeatable) {
                schemaChanges.push({
                    type: BreakingChangeType.DIRECTIVE_REPEATABLE_REMOVED,
                    description: `Repeatable flag was removed from ${oldDirective1.name}.`
                });
            }
            for (const location of oldDirective1.locations){
                if (newDirective.locations.indexOf(location) === -1) {
                    schemaChanges.push({
                        type: BreakingChangeType.DIRECTIVE_LOCATION_REMOVED,
                        description: `${location} was removed from ${oldDirective1.name}.`
                    });
                }
            }
        }
        return schemaChanges;
    }
    const objectValues9 = objectValues;
    const isSpecifiedScalarType4 = isSpecifiedScalarType;
    function findTypeChanges(oldSchema, newSchema) {
        const schemaChanges = [];
        const typesDiff = diff(objectValues(oldSchema.getTypeMap()), objectValues(newSchema.getTypeMap()));
        for (const oldType of typesDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.TYPE_REMOVED,
                description: isSpecifiedScalarType(oldType) ? `Standard scalar ${oldType.name} was removed because it is not referenced anymore.` : `${oldType.name} was removed.`
            });
        }
        for (const [oldType1, newType] of typesDiff.persisted){
            if (isEnumType1(oldType1) && isEnumType1(newType)) {
                schemaChanges.push(...findEnumTypeChanges(oldType1, newType));
            } else if (isUnionType1(oldType1) && isUnionType1(newType)) {
                schemaChanges.push(...findUnionTypeChanges(oldType1, newType));
            } else if (isInputObjectType1(oldType1) && isInputObjectType1(newType)) {
                schemaChanges.push(...findInputObjectTypeChanges(oldType1, newType));
            } else if (isObjectType1(oldType1) && isObjectType1(newType)) {
                schemaChanges.push(...findFieldChanges(oldType1, newType), ...findImplementedInterfacesChanges(oldType1, newType));
            } else if (isInterfaceType1(oldType1) && isInterfaceType1(newType)) {
                schemaChanges.push(...findFieldChanges(oldType1, newType), ...findImplementedInterfacesChanges(oldType1, newType));
            } else if (oldType1.constructor !== newType.constructor) {
                schemaChanges.push({
                    type: BreakingChangeType.TYPE_CHANGED_KIND,
                    description: `${oldType1.name} changed from ` + `${typeKindName(oldType1)} to ${typeKindName(newType)}.`
                });
            }
        }
        return schemaChanges;
    }
    function findInputObjectTypeChanges(oldType, newType) {
        const schemaChanges = [];
        const fieldsDiff = diff(objectValues(oldType.getFields()), objectValues(newType.getFields()));
        for (const newField of fieldsDiff.added){
            if (isRequiredInputField1(newField)) {
                schemaChanges.push({
                    type: BreakingChangeType.REQUIRED_INPUT_FIELD_ADDED,
                    description: `A required field ${newField.name} on input type ${oldType.name} was added.`
                });
            } else {
                schemaChanges.push({
                    type: DangerousChangeType.OPTIONAL_INPUT_FIELD_ADDED,
                    description: `An optional field ${newField.name} on input type ${oldType.name} was added.`
                });
            }
        }
        for (const oldField of fieldsDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.FIELD_REMOVED,
                description: `${oldType.name}.${oldField.name} was removed.`
            });
        }
        for (const [oldField1, newField1] of fieldsDiff.persisted){
            const isSafe = isChangeSafeForInputObjectFieldOrFieldArg(oldField1.type, newField1.type);
            if (!isSafe) {
                schemaChanges.push({
                    type: BreakingChangeType.FIELD_CHANGED_KIND,
                    description: `${oldType.name}.${oldField1.name} changed type from ` + `${String(oldField1.type)} to ${String(newField1.type)}.`
                });
            }
        }
        return schemaChanges;
    }
    function findUnionTypeChanges(oldType, newType) {
        const schemaChanges = [];
        const possibleTypesDiff = diff(oldType.getTypes(), newType.getTypes());
        for (const newPossibleType of possibleTypesDiff.added){
            schemaChanges.push({
                type: DangerousChangeType.TYPE_ADDED_TO_UNION,
                description: `${newPossibleType.name} was added to union type ${oldType.name}.`
            });
        }
        for (const oldPossibleType of possibleTypesDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.TYPE_REMOVED_FROM_UNION,
                description: `${oldPossibleType.name} was removed from union type ${oldType.name}.`
            });
        }
        return schemaChanges;
    }
    function findEnumTypeChanges(oldType, newType) {
        const schemaChanges = [];
        const valuesDiff = diff(oldType.getValues(), newType.getValues());
        for (const newValue of valuesDiff.added){
            schemaChanges.push({
                type: DangerousChangeType.VALUE_ADDED_TO_ENUM,
                description: `${newValue.name} was added to enum type ${oldType.name}.`
            });
        }
        for (const oldValue of valuesDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.VALUE_REMOVED_FROM_ENUM,
                description: `${oldValue.name} was removed from enum type ${oldType.name}.`
            });
        }
        return schemaChanges;
    }
    function findImplementedInterfacesChanges(oldType, newType) {
        const schemaChanges = [];
        const interfacesDiff = diff(oldType.getInterfaces(), newType.getInterfaces());
        for (const newInterface of interfacesDiff.added){
            schemaChanges.push({
                type: DangerousChangeType.IMPLEMENTED_INTERFACE_ADDED,
                description: `${newInterface.name} added to interfaces implemented by ${oldType.name}.`
            });
        }
        for (const oldInterface of interfacesDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.IMPLEMENTED_INTERFACE_REMOVED,
                description: `${oldType.name} no longer implements interface ${oldInterface.name}.`
            });
        }
        return schemaChanges;
    }
    function findFieldChanges(oldType, newType) {
        const schemaChanges = [];
        const fieldsDiff = diff(objectValues(oldType.getFields()), objectValues(newType.getFields()));
        for (const oldField of fieldsDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.FIELD_REMOVED,
                description: `${oldType.name}.${oldField.name} was removed.`
            });
        }
        for (const [oldField1, newField] of fieldsDiff.persisted){
            schemaChanges.push(...findArgChanges(oldType, oldField1, newField));
            const isSafe = isChangeSafeForObjectOrInterfaceField(oldField1.type, newField.type);
            if (!isSafe) {
                schemaChanges.push({
                    type: BreakingChangeType.FIELD_CHANGED_KIND,
                    description: `${oldType.name}.${oldField1.name} changed type from ` + `${String(oldField1.type)} to ${String(newField.type)}.`
                });
            }
        }
        return schemaChanges;
    }
    function findArgChanges(oldType, oldField, newField) {
        const schemaChanges = [];
        const argsDiff = diff(oldField.args, newField.args);
        for (const oldArg of argsDiff.removed){
            schemaChanges.push({
                type: BreakingChangeType.ARG_REMOVED,
                description: `${oldType.name}.${oldField.name} arg ${oldArg.name} was removed.`
            });
        }
        for (const [oldArg1, newArg] of argsDiff.persisted){
            const isSafe = isChangeSafeForInputObjectFieldOrFieldArg(oldArg1.type, newArg.type);
            if (!isSafe) {
                schemaChanges.push({
                    type: BreakingChangeType.ARG_CHANGED_KIND,
                    description: `${oldType.name}.${oldField.name} arg ${oldArg1.name} has changed type from ` + `${String(oldArg1.type)} to ${String(newArg.type)}.`
                });
            } else if (oldArg1.defaultValue !== undefined) {
                if (newArg.defaultValue === undefined) {
                    schemaChanges.push({
                        type: DangerousChangeType.ARG_DEFAULT_VALUE_CHANGE,
                        description: `${oldType.name}.${oldField.name} arg ${oldArg1.name} defaultValue was removed.`
                    });
                } else {
                    const oldValueStr = stringifyValue(oldArg1.defaultValue, oldArg1.type);
                    const newValueStr = stringifyValue(newArg.defaultValue, newArg.type);
                    if (oldValueStr !== newValueStr) {
                        schemaChanges.push({
                            type: DangerousChangeType.ARG_DEFAULT_VALUE_CHANGE,
                            description: `${oldType.name}.${oldField.name} arg ${oldArg1.name} has changed defaultValue from ${oldValueStr} to ${newValueStr}.`
                        });
                    }
                }
            }
        }
        for (const newArg1 of argsDiff.added){
            if (isRequiredArgument1(newArg1)) {
                schemaChanges.push({
                    type: BreakingChangeType.REQUIRED_ARG_ADDED,
                    description: `A required arg ${newArg1.name} on ${oldType.name}.${oldField.name} was added.`
                });
            } else {
                schemaChanges.push({
                    type: DangerousChangeType.OPTIONAL_ARG_ADDED,
                    description: `An optional arg ${newArg1.name} on ${oldType.name}.${oldField.name} was added.`
                });
            }
        }
        return schemaChanges;
    }
    function isChangeSafeForObjectOrInterfaceField(oldType, newType) {
        if (isListType1(oldType)) {
            return isListType1(newType) && isChangeSafeForObjectOrInterfaceField(oldType.ofType, newType.ofType) || isNonNullType1(newType) && isChangeSafeForObjectOrInterfaceField(oldType, newType.ofType);
        }
        if (isNonNullType1(oldType)) {
            return isNonNullType1(newType) && isChangeSafeForObjectOrInterfaceField(oldType.ofType, newType.ofType);
        }
        return isNamedType1(newType) && oldType.name === newType.name || isNonNullType1(newType) && isChangeSafeForObjectOrInterfaceField(oldType, newType.ofType);
    }
    function isChangeSafeForInputObjectFieldOrFieldArg(oldType, newType) {
        if (isListType1(oldType)) {
            return isListType1(newType) && isChangeSafeForInputObjectFieldOrFieldArg(oldType.ofType, newType.ofType);
        }
        if (isNonNullType1(oldType)) {
            return isNonNullType1(newType) && isChangeSafeForInputObjectFieldOrFieldArg(oldType.ofType, newType.ofType) || !isNonNullType1(newType) && isChangeSafeForInputObjectFieldOrFieldArg(oldType.ofType, newType);
        }
        return isNamedType1(newType) && oldType.name === newType.name;
    }
    const invariant9 = invariant;
    const inspect21 = inspect;
    function typeKindName(type) {
        if (isScalarType1(type)) {
            return 'a Scalar type';
        }
        if (isObjectType1(type)) {
            return 'an Object type';
        }
        if (isInterfaceType1(type)) {
            return 'an Interface type';
        }
        if (isUnionType1(type)) {
            return 'a Union type';
        }
        if (isEnumType1(type)) {
            return 'an Enum type';
        }
        if (isInputObjectType1(type)) {
            return 'an Input type';
        }
        invariant(false, 'Unexpected type: ' + inspect(type));
    }
    const astFromValue2 = astFromValue;
    function stringifyValue(value1, type) {
        const ast3 = astFromValue(value1, type);
        invariant(ast3 != null);
        const sortedAST = visit1(ast3, {
            ObjectValue (objectNode) {
                const fields = [
                    ...objectNode.fields
                ].sort((fieldA, fieldB)=>fieldA.name.value.localeCompare(fieldB.name.value)
                );
                return {
                    ...objectNode,
                    fields
                };
            }
        });
        return print1(sortedAST);
    }
    function diff(oldArray, newArray) {
        const added = [];
        const removed = [];
        const persisted = [];
        const oldMap = keyMap(oldArray, ({ name: name2  })=>name2
        );
        const newMap = keyMap(newArray, ({ name: name2  })=>name2
        );
        for (const oldItem of oldArray){
            const newItem = newMap[oldItem.name];
            if (newItem === undefined) {
                removed.push(oldItem);
            } else {
                persisted.push([
                    oldItem,
                    newItem
                ]);
            }
        }
        for (const newItem of newArray){
            if (oldMap[newItem.name] === undefined) {
                added.push(newItem);
            }
        }
        return {
            added,
            persisted,
            removed
        };
    }
    function findDeprecatedUsages(schema3, ast3) {
        const errors = [];
        const typeInfo1 = new TypeInfo1(schema3);
        visit1(ast3, visitWithTypeInfo1(typeInfo1, {
            Field (node) {
                const parentType = typeInfo1.getParentType();
                const fieldDef = typeInfo1.getFieldDef();
                if (parentType && fieldDef?.deprecationReason != null) {
                    errors.push(new GraphQLError1(`The field "${parentType.name}.${fieldDef.name}" is deprecated. ` + fieldDef.deprecationReason, node));
                }
            },
            EnumValue (node) {
                const type = getNamedType1(typeInfo1.getInputType());
                const enumVal = typeInfo1.getEnumValue();
                if (type && enumVal?.deprecationReason != null) {
                    errors.push(new GraphQLError1(`The enum value "${type.name}.${enumVal.name}" is deprecated. ` + enumVal.deprecationReason, node));
                }
            }
        }));
        return errors;
    }
    const findDeprecatedUsages1 = findDeprecatedUsages;
    const getIntrospectionQuery3 = getIntrospectionQuery1;
    const getOperationAST2 = getOperationAST1;
    const getOperationRootType2 = getOperationRootType;
    const introspectionFromSchema2 = introspectionFromSchema1;
    const buildClientSchema2 = buildClientSchema1;
    const buildASTSchema2 = buildASTSchema1, buildSchema2 = buildSchema1;
    const extendSchema2 = extendSchema1, getDescription2 = getDescription1;
    const lexicographicSortSchema2 = lexicographicSortSchema1;
    const printSchema2 = printSchema1, printType4 = printType3, printIntrospectionSchema2 = printIntrospectionSchema1;
    const typeFromAST8 = typeFromAST;
    const valueFromAST5 = valueFromAST1;
    const valueFromASTUntyped2 = valueFromASTUntyped;
    const astFromValue3 = astFromValue;
    const TypeInfo4 = TypeInfo1, visitWithTypeInfo4 = visitWithTypeInfo1;
    const coerceInputValue3 = coerceInputValue1;
    const concatAST2 = concatAST1;
    const separateOperations2 = separateOperations1;
    const stripIgnoredCharacters2 = stripIgnoredCharacters1;
    const isEqualType2 = isEqualType1, isTypeSubTypeOf3 = isTypeSubTypeOf1, doTypesOverlap3 = doTypesOverlap1;
    const assertValidName2 = assertValidName1, isValidNameError2 = isValidNameError1;
    const BreakingChangeType2 = BreakingChangeType1, DangerousChangeType2 = DangerousChangeType1, findBreakingChanges2 = findBreakingChanges1, findDangerousChanges2 = findDangerousChanges1;
    const findDeprecatedUsages2 = findDeprecatedUsages1;
    const version2 = version1, versionInfo2 = versionInfo1;
    const versionInfo3 = versionInfo2;
    const version3 = version2;
    const graphql2 = graphql1, graphqlSync2 = graphqlSync1;
    const graphqlSync3 = graphqlSync2;
    const graphql3 = graphql2;
    const GraphQLSchema7 = GraphQLSchema6, GraphQLDirective5 = GraphQLDirective1, GraphQLScalarType5 = GraphQLScalarType4, GraphQLObjectType6 = GraphQLObjectType5, GraphQLInterfaceType6 = GraphQLInterfaceType5, GraphQLUnionType6 = GraphQLUnionType5, GraphQLEnumType6 = GraphQLEnumType5, GraphQLInputObjectType6 = GraphQLInputObjectType5, GraphQLList6 = GraphQLList5, GraphQLNonNull6 = GraphQLNonNull5, specifiedScalarTypes5 = specifiedScalarTypes1, GraphQLInt2 = GraphQLInt1, GraphQLFloat2 = GraphQLFloat1, GraphQLString3 = GraphQLString1, GraphQLBoolean2 = GraphQLBoolean1, GraphQLID2 = GraphQLID1, specifiedDirectives7 = specifiedDirectives2, GraphQLIncludeDirective3 = GraphQLIncludeDirective1, GraphQLSkipDirective3 = GraphQLSkipDirective1, GraphQLDeprecatedDirective4 = GraphQLDeprecatedDirective1, TypeKind3 = TypeKind1, DEFAULT_DEPRECATION_REASON3 = DEFAULT_DEPRECATION_REASON1, introspectionTypes4 = introspectionTypes1, __Schema3 = __Schema2, __Directive2 = __Directive1, __DirectiveLocation2 = __DirectiveLocation1, __Type2 = __Type1, __Field2 = __Field1, __InputValue2 = __InputValue1, __EnumValue2 = __EnumValue1, __TypeKind2 = __TypeKind1, SchemaMetaFieldDef3 = SchemaMetaFieldDef1, TypeMetaFieldDef3 = TypeMetaFieldDef1, TypeNameMetaFieldDef3 = TypeNameMetaFieldDef1, isSchema3 = isSchema2, isDirective3 = isDirective2, isType4 = isType3, isScalarType8 = isScalarType7, isObjectType14 = isObjectType13, isInterfaceType14 = isInterfaceType13, isUnionType9 = isUnionType8, isEnumType10 = isEnumType9, isInputObjectType14 = isInputObjectType13, isListType12 = isListType11, isNonNullType13 = isNonNullType12, isInputType7 = isInputType6, isOutputType5 = isOutputType4, isLeafType8 = isLeafType7, isCompositeType6 = isCompositeType5, isAbstractType5 = isAbstractType4, isWrappingType3 = isWrappingType2, isNullableType3 = isNullableType2, isNamedType4 = isNamedType3, isRequiredArgument5 = isRequiredArgument4, isRequiredInputField5 = isRequiredInputField4, isSpecifiedScalarType5 = isSpecifiedScalarType1, isIntrospectionType5 = isIntrospectionType1, isSpecifiedDirective3 = isSpecifiedDirective1, assertSchema4 = assertSchema3, assertDirective2 = assertDirective1, assertType3 = assertType2, assertScalarType3 = assertScalarType2, assertObjectType4 = assertObjectType3, assertInterfaceType4 = assertInterfaceType3, assertUnionType3 = assertUnionType2, assertEnumType3 = assertEnumType2, assertInputObjectType3 = assertInputObjectType2, assertListType3 = assertListType2, assertNonNullType3 = assertNonNullType2, assertInputType3 = assertInputType2, assertOutputType3 = assertOutputType2, assertLeafType3 = assertLeafType2, assertCompositeType3 = assertCompositeType2, assertAbstractType3 = assertAbstractType2, assertWrappingType3 = assertWrappingType2, assertNullableType4 = assertNullableType3, assertNamedType3 = assertNamedType2, getNullableType5 = getNullableType4, getNamedType10 = getNamedType8, validateSchema3 = validateSchema2, assertValidSchema2 = assertValidSchema1;
    const assertValidSchema3 = assertValidSchema2;
    const validateSchema4 = validateSchema3;
    const getNamedType11 = getNamedType10;
    const getNullableType6 = getNullableType5;
    const assertNamedType4 = assertNamedType3;
    const assertNullableType5 = assertNullableType4;
    const assertWrappingType4 = assertWrappingType3;
    const assertAbstractType4 = assertAbstractType3;
    const assertCompositeType4 = assertCompositeType3;
    const assertLeafType4 = assertLeafType3;
    const assertOutputType4 = assertOutputType3;
    const assertInputType4 = assertInputType3;
    const assertNonNullType4 = assertNonNullType3;
    const assertListType4 = assertListType3;
    const assertInputObjectType4 = assertInputObjectType3;
    const assertEnumType4 = assertEnumType3;
    const assertUnionType4 = assertUnionType3;
    const assertInterfaceType5 = assertInterfaceType4;
    const assertObjectType5 = assertObjectType4;
    const assertScalarType4 = assertScalarType3;
    const assertType4 = assertType3;
    const assertDirective3 = assertDirective2;
    const assertSchema5 = assertSchema4;
    const isSpecifiedDirective4 = isSpecifiedDirective3;
    const isIntrospectionType6 = isIntrospectionType5;
    const isSpecifiedScalarType6 = isSpecifiedScalarType5;
    const isRequiredInputField6 = isRequiredInputField5;
    const isRequiredArgument6 = isRequiredArgument5;
    const isNamedType5 = isNamedType4;
    const isNullableType4 = isNullableType3;
    const isWrappingType4 = isWrappingType3;
    const isAbstractType6 = isAbstractType5;
    const isCompositeType7 = isCompositeType6;
    const isLeafType9 = isLeafType8;
    const isOutputType6 = isOutputType5;
    const isInputType8 = isInputType7;
    const isNonNullType14 = isNonNullType13;
    const isListType13 = isListType12;
    const isInputObjectType15 = isInputObjectType14;
    const isEnumType11 = isEnumType10;
    const isUnionType10 = isUnionType9;
    const isInterfaceType15 = isInterfaceType14;
    const isObjectType15 = isObjectType14;
    const isScalarType9 = isScalarType8;
    const isType5 = isType4;
    const isDirective4 = isDirective3;
    const isSchema4 = isSchema3;
    const TypeNameMetaFieldDef4 = TypeNameMetaFieldDef3;
    const TypeMetaFieldDef4 = TypeMetaFieldDef3;
    const SchemaMetaFieldDef4 = SchemaMetaFieldDef3;
    const __TypeKind3 = __TypeKind2;
    const __EnumValue3 = __EnumValue2;
    const __InputValue3 = __InputValue2;
    const __Field3 = __Field2;
    const __Type3 = __Type2;
    const __DirectiveLocation3 = __DirectiveLocation2;
    const __Directive3 = __Directive2;
    const __Schema4 = __Schema3;
    const introspectionTypes5 = introspectionTypes4;
    const DEFAULT_DEPRECATION_REASON4 = DEFAULT_DEPRECATION_REASON3;
    const TypeKind4 = TypeKind3;
    const GraphQLDeprecatedDirective5 = GraphQLDeprecatedDirective4;
    const GraphQLSkipDirective4 = GraphQLSkipDirective3;
    const GraphQLIncludeDirective4 = GraphQLIncludeDirective3;
    const specifiedDirectives8 = specifiedDirectives7;
    const GraphQLID3 = GraphQLID2;
    const GraphQLBoolean3 = GraphQLBoolean2;
    const GraphQLString4 = GraphQLString3;
    const GraphQLFloat3 = GraphQLFloat2;
    const GraphQLInt3 = GraphQLInt2;
    const specifiedScalarTypes6 = specifiedScalarTypes5;
    const GraphQLNonNull7 = GraphQLNonNull6;
    const GraphQLList7 = GraphQLList6;
    const GraphQLInputObjectType7 = GraphQLInputObjectType6;
    const GraphQLEnumType7 = GraphQLEnumType6;
    const GraphQLUnionType7 = GraphQLUnionType6;
    const GraphQLInterfaceType7 = GraphQLInterfaceType6;
    const GraphQLObjectType7 = GraphQLObjectType6;
    const GraphQLScalarType6 = GraphQLScalarType5;
    const GraphQLDirective6 = GraphQLDirective5;
    const GraphQLSchema8 = GraphQLSchema7;
    const Source4 = Source3, getLocation3 = getLocation2, printLocation3 = printLocation2, printSourceLocation3 = printSourceLocation2, Lexer4 = Lexer3, TokenKind5 = TokenKind2, parse6 = parse3, parseValue4 = parseValue2, parseType2 = parseType1, print12 = print11, visit8 = visit7, visitInParallel3 = visitInParallel2, getVisitFn4 = getVisitFn3, BREAK3 = BREAK2, Kind22 = Kind21, DirectiveLocation4 = DirectiveLocation3, isDefinitionNode3 = isDefinitionNode2, isExecutableDefinitionNode4 = isExecutableDefinitionNode3, isSelectionNode3 = isSelectionNode2, isValueNode3 = isValueNode2, isTypeNode3 = isTypeNode2, isTypeSystemDefinitionNode4 = isTypeSystemDefinitionNode3, isTypeDefinitionNode7 = isTypeDefinitionNode6, isTypeSystemExtensionNode4 = isTypeSystemExtensionNode3, isTypeExtensionNode5 = isTypeExtensionNode4;
    const isTypeExtensionNode6 = isTypeExtensionNode5;
    const isTypeSystemExtensionNode5 = isTypeSystemExtensionNode4;
    const isTypeDefinitionNode8 = isTypeDefinitionNode7;
    const isTypeSystemDefinitionNode5 = isTypeSystemDefinitionNode4;
    const isTypeNode4 = isTypeNode3;
    const isValueNode4 = isValueNode3;
    const isSelectionNode4 = isSelectionNode3;
    const isExecutableDefinitionNode5 = isExecutableDefinitionNode4;
    const isDefinitionNode4 = isDefinitionNode3;
    const DirectiveLocation5 = DirectiveLocation4;
    const Kind23 = Kind22;
    const BREAK4 = BREAK3;
    const getVisitFn5 = getVisitFn4;
    const visitInParallel4 = visitInParallel3;
    const visit9 = visit8;
    const print13 = print12;
    const parseType3 = parseType2;
    const parseValue5 = parseValue4;
    const parse7 = parse6;
    const TokenKind6 = TokenKind5;
    const Lexer5 = Lexer4;
    const printSourceLocation4 = printSourceLocation3;
    const printLocation4 = printLocation3;
    const getLocation4 = getLocation3;
    const Source5 = Source4;
    const execute5 = execute2, defaultFieldResolver2 = defaultFieldResolver1, defaultTypeResolver2 = defaultTypeResolver1, responsePathAsArray1 = responsePathAsArray, getDirectiveValues4 = getDirectiveValues3;
    const getDirectiveValues5 = getDirectiveValues4;
    const responsePathAsArray2 = responsePathAsArray1;
    const defaultTypeResolver3 = defaultTypeResolver2;
    const defaultFieldResolver3 = defaultFieldResolver2;
    const execute6 = execute5;
    const subscribe3 = subscribe2, createSourceEventStream3 = createSourceEventStream2;
    const createSourceEventStream4 = createSourceEventStream3;
    const subscribe4 = subscribe3;
    const validate3 = validate2, ValidationContext3 = ValidationContext2, specifiedRules3 = specifiedRules2, ExecutableDefinitionsRule4 = ExecutableDefinitionsRule3, FieldsOnCorrectTypeRule4 = FieldsOnCorrectTypeRule3, FragmentsOnCompositeTypesRule4 = FragmentsOnCompositeTypesRule3, KnownArgumentNamesRule4 = KnownArgumentNamesRule3, KnownDirectivesRule4 = KnownDirectivesRule3, KnownFragmentNamesRule4 = KnownFragmentNamesRule3, KnownTypeNamesRule4 = KnownTypeNamesRule3, LoneAnonymousOperationRule4 = LoneAnonymousOperationRule3, NoFragmentCyclesRule4 = NoFragmentCyclesRule3, NoUndefinedVariablesRule4 = NoUndefinedVariablesRule3, NoUnusedFragmentsRule4 = NoUnusedFragmentsRule3, NoUnusedVariablesRule4 = NoUnusedVariablesRule3, OverlappingFieldsCanBeMergedRule4 = OverlappingFieldsCanBeMergedRule3, PossibleFragmentSpreadsRule4 = PossibleFragmentSpreadsRule3, ProvidedRequiredArgumentsRule4 = ProvidedRequiredArgumentsRule3, ScalarLeafsRule4 = ScalarLeafsRule3, SingleFieldSubscriptionsRule4 = SingleFieldSubscriptionsRule3, UniqueArgumentNamesRule4 = UniqueArgumentNamesRule3, UniqueDirectivesPerLocationRule4 = UniqueDirectivesPerLocationRule3, UniqueFragmentNamesRule4 = UniqueFragmentNamesRule3, UniqueInputFieldNamesRule4 = UniqueInputFieldNamesRule3, UniqueOperationNamesRule4 = UniqueOperationNamesRule3, UniqueVariableNamesRule4 = UniqueVariableNamesRule3, ValuesOfCorrectTypeRule4 = ValuesOfCorrectTypeRule3, VariablesAreInputTypesRule4 = VariablesAreInputTypesRule3, VariablesInAllowedPositionRule4 = VariablesInAllowedPositionRule3, LoneSchemaDefinitionRule4 = LoneSchemaDefinitionRule3, UniqueOperationTypesRule4 = UniqueOperationTypesRule3, UniqueTypeNamesRule4 = UniqueTypeNamesRule3, UniqueEnumValueNamesRule4 = UniqueEnumValueNamesRule3, UniqueFieldDefinitionNamesRule4 = UniqueFieldDefinitionNamesRule3, UniqueDirectiveNamesRule4 = UniqueDirectiveNamesRule3, PossibleTypeExtensionsRule4 = PossibleTypeExtensionsRule3;
    const PossibleTypeExtensionsRule5 = PossibleTypeExtensionsRule4;
    const UniqueDirectiveNamesRule5 = UniqueDirectiveNamesRule4;
    const UniqueFieldDefinitionNamesRule5 = UniqueFieldDefinitionNamesRule4;
    const UniqueEnumValueNamesRule5 = UniqueEnumValueNamesRule4;
    const UniqueTypeNamesRule5 = UniqueTypeNamesRule4;
    const UniqueOperationTypesRule5 = UniqueOperationTypesRule4;
    const LoneSchemaDefinitionRule5 = LoneSchemaDefinitionRule4;
    const VariablesInAllowedPositionRule5 = VariablesInAllowedPositionRule4;
    const VariablesAreInputTypesRule5 = VariablesAreInputTypesRule4;
    const ValuesOfCorrectTypeRule5 = ValuesOfCorrectTypeRule4;
    const UniqueVariableNamesRule5 = UniqueVariableNamesRule4;
    const UniqueOperationNamesRule5 = UniqueOperationNamesRule4;
    const UniqueInputFieldNamesRule5 = UniqueInputFieldNamesRule4;
    const UniqueFragmentNamesRule5 = UniqueFragmentNamesRule4;
    const UniqueDirectivesPerLocationRule5 = UniqueDirectivesPerLocationRule4;
    const UniqueArgumentNamesRule5 = UniqueArgumentNamesRule4;
    const SingleFieldSubscriptionsRule5 = SingleFieldSubscriptionsRule4;
    const ScalarLeafsRule5 = ScalarLeafsRule4;
    const ProvidedRequiredArgumentsRule5 = ProvidedRequiredArgumentsRule4;
    const PossibleFragmentSpreadsRule5 = PossibleFragmentSpreadsRule4;
    const OverlappingFieldsCanBeMergedRule5 = OverlappingFieldsCanBeMergedRule4;
    const NoUnusedVariablesRule5 = NoUnusedVariablesRule4;
    const NoUnusedFragmentsRule5 = NoUnusedFragmentsRule4;
    const NoUndefinedVariablesRule5 = NoUndefinedVariablesRule4;
    const NoFragmentCyclesRule5 = NoFragmentCyclesRule4;
    const LoneAnonymousOperationRule5 = LoneAnonymousOperationRule4;
    const KnownTypeNamesRule5 = KnownTypeNamesRule4;
    const KnownFragmentNamesRule5 = KnownFragmentNamesRule4;
    const KnownDirectivesRule5 = KnownDirectivesRule4;
    const KnownArgumentNamesRule5 = KnownArgumentNamesRule4;
    const FragmentsOnCompositeTypesRule5 = FragmentsOnCompositeTypesRule4;
    const FieldsOnCorrectTypeRule5 = FieldsOnCorrectTypeRule4;
    const ExecutableDefinitionsRule5 = ExecutableDefinitionsRule4;
    const specifiedRules4 = specifiedRules3;
    const ValidationContext4 = ValidationContext3;
    const validate4 = validate3;
    const GraphQLError44 = GraphQLError43, syntaxError4 = syntaxError3, locatedError4 = locatedError3, printError3 = printError2, formatError3 = formatError2;
    const formatError4 = formatError3;
    const printError4 = printError3;
    const locatedError5 = locatedError4;
    const syntaxError5 = syntaxError4;
    const GraphQLError45 = GraphQLError44;
    const getIntrospectionQuery4 = getIntrospectionQuery3, getOperationAST3 = getOperationAST2, getOperationRootType3 = getOperationRootType2, introspectionFromSchema3 = introspectionFromSchema2, buildClientSchema3 = buildClientSchema2, buildASTSchema3 = buildASTSchema2, buildSchema3 = buildSchema2, getDescription3 = getDescription2, extendSchema3 = extendSchema2, lexicographicSortSchema3 = lexicographicSortSchema2, printSchema3 = printSchema2, printType5 = printType4, printIntrospectionSchema3 = printIntrospectionSchema2, typeFromAST9 = typeFromAST8, valueFromAST6 = valueFromAST5, valueFromASTUntyped3 = valueFromASTUntyped2, astFromValue4 = astFromValue3, TypeInfo5 = TypeInfo4, visitWithTypeInfo5 = visitWithTypeInfo4, coerceInputValue4 = coerceInputValue3, concatAST3 = concatAST2, separateOperations3 = separateOperations2, stripIgnoredCharacters3 = stripIgnoredCharacters2, isEqualType3 = isEqualType2, isTypeSubTypeOf4 = isTypeSubTypeOf3, doTypesOverlap4 = doTypesOverlap3, assertValidName3 = assertValidName2, isValidNameError3 = isValidNameError2, BreakingChangeType3 = BreakingChangeType2, DangerousChangeType3 = DangerousChangeType2, findBreakingChanges3 = findBreakingChanges2, findDangerousChanges3 = findDangerousChanges2, findDeprecatedUsages3 = findDeprecatedUsages2;
    const findDeprecatedUsages4 = findDeprecatedUsages3;
    const findDangerousChanges4 = findDangerousChanges3;
    const findBreakingChanges4 = findBreakingChanges3;
    const DangerousChangeType4 = DangerousChangeType3;
    const BreakingChangeType4 = BreakingChangeType3;
    const isValidNameError4 = isValidNameError3;
    const assertValidName4 = assertValidName3;
    const doTypesOverlap5 = doTypesOverlap4;
    const isTypeSubTypeOf5 = isTypeSubTypeOf4;
    const isEqualType4 = isEqualType3;
    const separateOperations4 = separateOperations3;
    const concatAST4 = concatAST3;
    const coerceInputValue5 = coerceInputValue4;
    const visitWithTypeInfo6 = visitWithTypeInfo5;
    const TypeInfo6 = TypeInfo5;
    const astFromValue5 = astFromValue4;
    const valueFromASTUntyped4 = valueFromASTUntyped3;
    const valueFromAST7 = valueFromAST6;
    const typeFromAST10 = typeFromAST9;
    const printIntrospectionSchema4 = printIntrospectionSchema3;
    const printType6 = printType5;
    const printSchema4 = printSchema3;
    const lexicographicSortSchema4 = lexicographicSortSchema3;
    const extendSchema4 = extendSchema3;
    const getDescription4 = getDescription3;
    const buildSchema4 = buildSchema3;
    const buildASTSchema4 = buildASTSchema3;
    const buildClientSchema4 = buildClientSchema3;
    const introspectionFromSchema4 = introspectionFromSchema3;
    const getOperationRootType4 = getOperationRootType3;
    const getOperationAST4 = getOperationAST3;
    const getIntrospectionQuery5 = getIntrospectionQuery4;
    return {
        version: version2,
        versionInfo: versionInfo2,
        graphql: graphql2,
        graphqlSync: graphqlSync2,
        GraphQLSchema: GraphQLSchema7,
        GraphQLDirective: GraphQLDirective5,
        GraphQLScalarType: GraphQLScalarType5,
        GraphQLObjectType: GraphQLObjectType6,
        GraphQLInterfaceType: GraphQLInterfaceType6,
        GraphQLUnionType: GraphQLUnionType6,
        GraphQLEnumType: GraphQLEnumType6,
        GraphQLInputObjectType: GraphQLInputObjectType6,
        GraphQLList: GraphQLList6,
        GraphQLNonNull: GraphQLNonNull6,
        specifiedScalarTypes: specifiedScalarTypes5,
        GraphQLInt: GraphQLInt2,
        GraphQLFloat: GraphQLFloat2,
        GraphQLString: GraphQLString3,
        GraphQLBoolean: GraphQLBoolean2,
        GraphQLID: GraphQLID2,
        specifiedDirectives: specifiedDirectives7,
        GraphQLIncludeDirective: GraphQLIncludeDirective3,
        GraphQLSkipDirective: GraphQLSkipDirective3,
        GraphQLDeprecatedDirective: GraphQLDeprecatedDirective4,
        TypeKind: TypeKind3,
        DEFAULT_DEPRECATION_REASON: DEFAULT_DEPRECATION_REASON3,
        introspectionTypes: introspectionTypes4,
        __Schema: __Schema3,
        __Directive: __Directive2,
        __DirectiveLocation: __DirectiveLocation2,
        __Type: __Type2,
        __Field: __Field2,
        __InputValue: __InputValue2,
        __EnumValue: __EnumValue2,
        __TypeKind: __TypeKind2,
        SchemaMetaFieldDef: SchemaMetaFieldDef3,
        TypeMetaFieldDef: TypeMetaFieldDef3,
        TypeNameMetaFieldDef: TypeNameMetaFieldDef3,
        isSchema: isSchema3,
        isDirective: isDirective3,
        isType: isType4,
        isScalarType: isScalarType8,
        isObjectType: isObjectType14,
        isInterfaceType: isInterfaceType14,
        isUnionType: isUnionType9,
        isEnumType: isEnumType10,
        isInputObjectType: isInputObjectType14,
        isListType: isListType12,
        isNonNullType: isNonNullType13,
        isInputType: isInputType7,
        isOutputType: isOutputType5,
        isLeafType: isLeafType8,
        isCompositeType: isCompositeType6,
        isAbstractType: isAbstractType5,
        isWrappingType: isWrappingType3,
        isNullableType: isNullableType3,
        isNamedType: isNamedType4,
        isRequiredArgument: isRequiredArgument5,
        isRequiredInputField: isRequiredInputField5,
        isSpecifiedScalarType: isSpecifiedScalarType5,
        isIntrospectionType: isIntrospectionType5,
        isSpecifiedDirective: isSpecifiedDirective3,
        assertSchema: assertSchema4,
        assertDirective: assertDirective2,
        assertType: assertType3,
        assertScalarType: assertScalarType3,
        assertObjectType: assertObjectType4,
        assertInterfaceType: assertInterfaceType4,
        assertUnionType: assertUnionType3,
        assertEnumType: assertEnumType3,
        assertInputObjectType: assertInputObjectType3,
        assertListType: assertListType3,
        assertNonNullType: assertNonNullType3,
        assertInputType: assertInputType3,
        assertOutputType: assertOutputType3,
        assertLeafType: assertLeafType3,
        assertCompositeType: assertCompositeType3,
        assertAbstractType: assertAbstractType3,
        assertWrappingType: assertWrappingType3,
        assertNullableType: assertNullableType4,
        assertNamedType: assertNamedType3,
        getNullableType: getNullableType5,
        getNamedType: getNamedType10,
        validateSchema: validateSchema3,
        assertValidSchema: assertValidSchema2,
        Source: Source4,
        getLocation: getLocation3,
        printLocation: printLocation3,
        printSourceLocation: printSourceLocation3,
        Lexer: Lexer4,
        TokenKind: TokenKind5,
        parse: parse6,
        parseValue: parseValue4,
        parseType: parseType2,
        print: print12,
        visit: visit8,
        visitInParallel: visitInParallel3,
        getVisitFn: getVisitFn4,
        BREAK: BREAK3,
        Kind: Kind22,
        DirectiveLocation: DirectiveLocation4,
        isDefinitionNode: isDefinitionNode3,
        isExecutableDefinitionNode: isExecutableDefinitionNode4,
        isSelectionNode: isSelectionNode3,
        isValueNode: isValueNode3,
        isTypeNode: isTypeNode3,
        isTypeSystemDefinitionNode: isTypeSystemDefinitionNode4,
        isTypeDefinitionNode: isTypeDefinitionNode7,
        isTypeSystemExtensionNode: isTypeSystemExtensionNode4,
        isTypeExtensionNode: isTypeExtensionNode5,
        execute: execute5,
        defaultFieldResolver: defaultFieldResolver2,
        defaultTypeResolver: defaultTypeResolver2,
        responsePathAsArray: responsePathAsArray1,
        getDirectiveValues: getDirectiveValues4,
        subscribe: subscribe3,
        createSourceEventStream: createSourceEventStream3,
        validate: validate3,
        ValidationContext: ValidationContext3,
        specifiedRules: specifiedRules3,
        ExecutableDefinitionsRule: ExecutableDefinitionsRule4,
        FieldsOnCorrectTypeRule: FieldsOnCorrectTypeRule4,
        FragmentsOnCompositeTypesRule: FragmentsOnCompositeTypesRule4,
        KnownArgumentNamesRule: KnownArgumentNamesRule4,
        KnownDirectivesRule: KnownDirectivesRule4,
        KnownFragmentNamesRule: KnownFragmentNamesRule4,
        KnownTypeNamesRule: KnownTypeNamesRule4,
        LoneAnonymousOperationRule: LoneAnonymousOperationRule4,
        NoFragmentCyclesRule: NoFragmentCyclesRule4,
        NoUndefinedVariablesRule: NoUndefinedVariablesRule4,
        NoUnusedFragmentsRule: NoUnusedFragmentsRule4,
        NoUnusedVariablesRule: NoUnusedVariablesRule4,
        OverlappingFieldsCanBeMergedRule: OverlappingFieldsCanBeMergedRule4,
        PossibleFragmentSpreadsRule: PossibleFragmentSpreadsRule4,
        ProvidedRequiredArgumentsRule: ProvidedRequiredArgumentsRule4,
        ScalarLeafsRule: ScalarLeafsRule4,
        SingleFieldSubscriptionsRule: SingleFieldSubscriptionsRule4,
        UniqueArgumentNamesRule: UniqueArgumentNamesRule4,
        UniqueDirectivesPerLocationRule: UniqueDirectivesPerLocationRule4,
        UniqueFragmentNamesRule: UniqueFragmentNamesRule4,
        UniqueInputFieldNamesRule: UniqueInputFieldNamesRule4,
        UniqueOperationNamesRule: UniqueOperationNamesRule4,
        UniqueVariableNamesRule: UniqueVariableNamesRule4,
        ValuesOfCorrectTypeRule: ValuesOfCorrectTypeRule4,
        VariablesAreInputTypesRule: VariablesAreInputTypesRule4,
        VariablesInAllowedPositionRule: VariablesInAllowedPositionRule4,
        LoneSchemaDefinitionRule: LoneSchemaDefinitionRule4,
        UniqueOperationTypesRule: UniqueOperationTypesRule4,
        UniqueTypeNamesRule: UniqueTypeNamesRule4,
        UniqueEnumValueNamesRule: UniqueEnumValueNamesRule4,
        UniqueFieldDefinitionNamesRule: UniqueFieldDefinitionNamesRule4,
        UniqueDirectiveNamesRule: UniqueDirectiveNamesRule4,
        PossibleTypeExtensionsRule: PossibleTypeExtensionsRule4,
        GraphQLError: GraphQLError44,
        syntaxError: syntaxError4,
        locatedError: locatedError4,
        printError: printError3,
        formatError: formatError3,
        getIntrospectionQuery: getIntrospectionQuery4,
        getOperationAST: getOperationAST3,
        getOperationRootType: getOperationRootType3,
        introspectionFromSchema: introspectionFromSchema3,
        buildClientSchema: buildClientSchema3,
        buildASTSchema: buildASTSchema3,
        buildSchema: buildSchema3,
        getDescription: getDescription3,
        extendSchema: extendSchema3,
        lexicographicSortSchema: lexicographicSortSchema3,
        printSchema: printSchema3,
        printType: printType5,
        printIntrospectionSchema: printIntrospectionSchema3,
        typeFromAST: typeFromAST9,
        valueFromAST: valueFromAST6,
        valueFromASTUntyped: valueFromASTUntyped3,
        astFromValue: astFromValue4,
        TypeInfo: TypeInfo5,
        visitWithTypeInfo: visitWithTypeInfo5,
        coerceInputValue: coerceInputValue4,
        concatAST: concatAST3,
        separateOperations: separateOperations3,
        isEqualType: isEqualType3,
        isTypeSubTypeOf: isTypeSubTypeOf4,
        doTypesOverlap: doTypesOverlap4,
        assertValidName: assertValidName3,
        isValidNameError: isValidNameError3,
        BreakingChangeType: BreakingChangeType3,
        DangerousChangeType: DangerousChangeType3,
        findBreakingChanges: findBreakingChanges3,
        findDangerousChanges: findDangerousChanges3,
        findDeprecatedUsages: findDeprecatedUsages3
    };
}();
const G = mod3;
const Lexer1 = Lexer;
const Kind1 = Kind;
class Parser {
    constructor(source1, options){
        const sourceObj = typeof source1 === 'string' ? new Source(source1) : source1;
        devAssert(sourceObj instanceof Source, `Must provide Source. Received: ${inspect(sourceObj)}.`);
        this._lexer = new Lexer1(sourceObj);
        this._options = options;
    }
    parseName() {
        const token = this.expectToken(TokenKind.NAME);
        return {
            kind: Kind.NAME,
            value: token.value,
            loc: this.loc(token)
        };
    }
    parseDocument() {
        const start1 = this._lexer.token;
        return {
            kind: Kind.DOCUMENT,
            definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
            loc: this.loc(start1)
        };
    }
    parseDefinition() {
        if (this.peek(TokenKind.NAME)) {
            switch(this._lexer.token.value){
                case 'query':
                case 'mutation':
                case 'subscription':
                    return this.parseOperationDefinition();
                case 'fragment':
                    return this.parseFragmentDefinition();
                case 'schema':
                case 'scalar':
                case 'type':
                case 'interface':
                case 'union':
                case 'enum':
                case 'input':
                case 'directive':
                    return this.parseTypeSystemDefinition();
                case 'extend':
                    return this.parseTypeSystemExtension();
            }
        } else if (this.peek(TokenKind.BRACE_L)) {
            return this.parseOperationDefinition();
        } else if (this.peekDescription()) {
            return this.parseTypeSystemDefinition();
        }
        throw this.unexpected();
    }
    parseOperationDefinition() {
        const start1 = this._lexer.token;
        if (this.peek(TokenKind.BRACE_L)) {
            return {
                kind: Kind.OPERATION_DEFINITION,
                operation: 'query',
                name: undefined,
                variableDefinitions: [],
                directives: [],
                selectionSet: this.parseSelectionSet(),
                loc: this.loc(start1)
            };
        }
        const operation = this.parseOperationType();
        let name;
        if (this.peek(TokenKind.NAME)) {
            name = this.parseName();
        }
        return {
            kind: Kind.OPERATION_DEFINITION,
            operation,
            name,
            variableDefinitions: this.parseVariableDefinitions(),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start1)
        };
    }
    parseOperationType() {
        const operationToken = this.expectToken(TokenKind.NAME);
        switch(operationToken.value){
            case 'query':
                return 'query';
            case 'mutation':
                return 'mutation';
            case 'subscription':
                return 'subscription';
        }
        throw this.unexpected(operationToken);
    }
    parseVariableDefinitions() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
    }
    parseVariableDefinition() {
        const start1 = this._lexer.token;
        return {
            kind: Kind.VARIABLE_DEFINITION,
            variable: this.parseVariable(),
            type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
            defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseValueLiteral(true) : undefined,
            directives: this.parseDirectives(true),
            loc: this.loc(start1)
        };
    }
    parseVariable() {
        const start1 = this._lexer.token;
        this.expectToken(TokenKind.DOLLAR);
        return {
            kind: Kind.VARIABLE,
            name: this.parseName(),
            loc: this.loc(start1)
        };
    }
    parseSelectionSet() {
        const start1 = this._lexer.token;
        return {
            kind: Kind.SELECTION_SET,
            selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R),
            loc: this.loc(start1)
        };
    }
    parseSelection() {
        return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
    }
    parseField() {
        const start1 = this._lexer.token;
        const nameOrAlias = this.parseName();
        let alias;
        let name;
        if (this.expectOptionalToken(TokenKind.COLON)) {
            alias = nameOrAlias;
            name = this.parseName();
        } else {
            name = nameOrAlias;
        }
        return {
            kind: Kind.FIELD,
            alias,
            name,
            arguments: this.parseArguments(false),
            directives: this.parseDirectives(false),
            selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : undefined,
            loc: this.loc(start1)
        };
    }
    parseArguments(isConst) {
        const item = isConst ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
    }
    parseArgument() {
        const start1 = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
            kind: Kind.ARGUMENT,
            name,
            value: this.parseValueLiteral(false),
            loc: this.loc(start1)
        };
    }
    parseConstArgument() {
        const start1 = this._lexer.token;
        return {
            kind: Kind.ARGUMENT,
            name: this.parseName(),
            value: (this.expectToken(TokenKind.COLON), this.parseValueLiteral(true)),
            loc: this.loc(start1)
        };
    }
    parseFragment() {
        const start1 = this._lexer.token;
        this.expectToken(TokenKind.SPREAD);
        const hasTypeCondition = this.expectOptionalKeyword('on');
        if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
            return {
                kind: Kind.FRAGMENT_SPREAD,
                name: this.parseFragmentName(),
                directives: this.parseDirectives(false),
                loc: this.loc(start1)
            };
        }
        return {
            kind: Kind.INLINE_FRAGMENT,
            typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start1)
        };
    }
    parseFragmentDefinition() {
        const start1 = this._lexer.token;
        this.expectKeyword('fragment');
        if (this._options?.experimentalFragmentVariables === true) {
            return {
                kind: Kind.FRAGMENT_DEFINITION,
                name: this.parseFragmentName(),
                variableDefinitions: this.parseVariableDefinitions(),
                typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
                directives: this.parseDirectives(false),
                selectionSet: this.parseSelectionSet(),
                loc: this.loc(start1)
            };
        }
        return {
            kind: Kind.FRAGMENT_DEFINITION,
            name: this.parseFragmentName(),
            typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
            loc: this.loc(start1)
        };
    }
    parseFragmentName() {
        if (this._lexer.token.value === 'on') {
            throw this.unexpected();
        }
        return this.parseName();
    }
    parseValueLiteral(isConst) {
        const token = this._lexer.token;
        switch(token.kind){
            case TokenKind.BRACKET_L:
                return this.parseList(isConst);
            case TokenKind.BRACE_L:
                return this.parseObject(isConst);
            case TokenKind.INT:
                this._lexer.advance();
                return {
                    kind: Kind.INT,
                    value: token.value,
                    loc: this.loc(token)
                };
            case TokenKind.FLOAT:
                this._lexer.advance();
                return {
                    kind: Kind.FLOAT,
                    value: token.value,
                    loc: this.loc(token)
                };
            case TokenKind.STRING:
            case TokenKind.BLOCK_STRING:
                return this.parseStringLiteral();
            case TokenKind.NAME:
                this._lexer.advance();
                switch(token.value){
                    case 'true':
                        return {
                            kind: Kind.BOOLEAN,
                            value: true,
                            loc: this.loc(token)
                        };
                    case 'false':
                        return {
                            kind: Kind.BOOLEAN,
                            value: false,
                            loc: this.loc(token)
                        };
                    case 'null':
                        return {
                            kind: Kind.NULL,
                            loc: this.loc(token)
                        };
                    default:
                        return {
                            kind: Kind.ENUM,
                            value: token.value,
                            loc: this.loc(token)
                        };
                }
            case TokenKind.DOLLAR:
                if (!isConst) {
                    return this.parseVariable();
                }
                break;
        }
        throw this.unexpected();
    }
    parseStringLiteral() {
        const token = this._lexer.token;
        this._lexer.advance();
        return {
            kind: Kind.STRING,
            value: token.value,
            block: token.kind === TokenKind.BLOCK_STRING,
            loc: this.loc(token)
        };
    }
    parseList(isConst) {
        const start1 = this._lexer.token;
        const item = ()=>this.parseValueLiteral(isConst)
        ;
        return {
            kind: Kind.LIST,
            values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
            loc: this.loc(start1)
        };
    }
    parseObject(isConst) {
        const start1 = this._lexer.token;
        const item = ()=>this.parseObjectField(isConst)
        ;
        return {
            kind: Kind.OBJECT,
            fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
            loc: this.loc(start1)
        };
    }
    parseObjectField(isConst) {
        const start1 = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return {
            kind: Kind.OBJECT_FIELD,
            name,
            value: this.parseValueLiteral(isConst),
            loc: this.loc(start1)
        };
    }
    parseDirectives(isConst) {
        const directives = [];
        while(this.peek(TokenKind.AT)){
            directives.push(this.parseDirective(isConst));
        }
        return directives;
    }
    parseDirective(isConst) {
        const start1 = this._lexer.token;
        this.expectToken(TokenKind.AT);
        return {
            kind: Kind.DIRECTIVE,
            name: this.parseName(),
            arguments: this.parseArguments(isConst),
            loc: this.loc(start1)
        };
    }
    parseTypeReference() {
        const start1 = this._lexer.token;
        let type;
        if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
            type = this.parseTypeReference();
            this.expectToken(TokenKind.BRACKET_R);
            type = {
                kind: Kind1.LIST_TYPE,
                type,
                loc: this.loc(start1)
            };
        } else {
            type = this.parseNamedType();
        }
        if (this.expectOptionalToken(TokenKind.BANG)) {
            return {
                kind: Kind.NON_NULL_TYPE,
                type,
                loc: this.loc(start1)
            };
        }
        return type;
    }
    parseNamedType() {
        const start1 = this._lexer.token;
        return {
            kind: Kind.NAMED_TYPE,
            name: this.parseName(),
            loc: this.loc(start1)
        };
    }
    parseTypeSystemDefinition() {
        const keywordToken = this.peekDescription() ? this._lexer.lookahead() : this._lexer.token;
        if (keywordToken.kind === TokenKind.NAME) {
            switch(keywordToken.value){
                case 'schema':
                    return this.parseSchemaDefinition();
                case 'scalar':
                    return this.parseScalarTypeDefinition();
                case 'type':
                    return this.parseObjectTypeDefinition();
                case 'interface':
                    return this.parseInterfaceTypeDefinition();
                case 'union':
                    return this.parseUnionTypeDefinition();
                case 'enum':
                    return this.parseEnumTypeDefinition();
                case 'input':
                    return this.parseInputObjectTypeDefinition();
                case 'directive':
                    return this.parseDirectiveDefinition();
            }
        }
        throw this.unexpected(keywordToken);
    }
    peekDescription() {
        return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
    }
    parseDescription() {
        if (this.peekDescription()) {
            return this.parseStringLiteral();
        }
    }
    parseSchemaDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('schema');
        const directives = this.parseDirectives(true);
        const operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        return {
            kind: Kind.SCHEMA_DEFINITION,
            description,
            directives,
            operationTypes,
            loc: this.loc(start1)
        };
    }
    parseOperationTypeDefinition() {
        const start1 = this._lexer.token;
        const operation = this.parseOperationType();
        this.expectToken(TokenKind.COLON);
        const type = this.parseNamedType();
        return {
            kind: Kind.OPERATION_TYPE_DEFINITION,
            operation,
            type,
            loc: this.loc(start1)
        };
    }
    parseScalarTypeDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('scalar');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        return {
            kind: Kind.SCALAR_TYPE_DEFINITION,
            description,
            name,
            directives,
            loc: this.loc(start1)
        };
    }
    parseObjectTypeDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('type');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseDirectives(true);
        const fields = this.parseFieldsDefinition();
        return {
            kind: Kind.OBJECT_TYPE_DEFINITION,
            description,
            name,
            interfaces,
            directives,
            fields,
            loc: this.loc(start1)
        };
    }
    parseImplementsInterfaces() {
        const types1 = [];
        if (this.expectOptionalKeyword('implements')) {
            this.expectOptionalToken(TokenKind.AMP);
            do {
                types1.push(this.parseNamedType());
            }while (this.expectOptionalToken(TokenKind.AMP) || this._options?.allowLegacySDLImplementsInterfaces === true && this.peek(TokenKind.NAME))
        }
        return types1;
    }
    parseFieldsDefinition() {
        if (this._options?.allowLegacySDLEmptyFields === true && this.peek(TokenKind.BRACE_L) && this._lexer.lookahead().kind === TokenKind.BRACE_R) {
            this._lexer.advance();
            this._lexer.advance();
            return [];
        }
        return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
    }
    parseFieldDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        const args1 = this.parseArgumentDefs();
        this.expectToken(TokenKind.COLON);
        const type = this.parseTypeReference();
        const directives = this.parseDirectives(true);
        return {
            kind: Kind.FIELD_DEFINITION,
            description,
            name,
            arguments: args1,
            type,
            directives,
            loc: this.loc(start1)
        };
    }
    parseArgumentDefs() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
    }
    parseInputValueDef() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        const type = this.parseTypeReference();
        let defaultValue;
        if (this.expectOptionalToken(TokenKind.EQUALS)) {
            defaultValue = this.parseValueLiteral(true);
        }
        const directives = this.parseDirectives(true);
        return {
            kind: Kind.INPUT_VALUE_DEFINITION,
            description,
            name,
            type,
            defaultValue,
            directives,
            loc: this.loc(start1)
        };
    }
    parseInterfaceTypeDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('interface');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseDirectives(true);
        const fields = this.parseFieldsDefinition();
        return {
            kind: Kind.INTERFACE_TYPE_DEFINITION,
            description,
            name,
            interfaces,
            directives,
            fields,
            loc: this.loc(start1)
        };
    }
    parseUnionTypeDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('union');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        const types1 = this.parseUnionMemberTypes();
        return {
            kind: Kind.UNION_TYPE_DEFINITION,
            description,
            name,
            directives,
            types: types1,
            loc: this.loc(start1)
        };
    }
    parseUnionMemberTypes() {
        const types1 = [];
        if (this.expectOptionalToken(TokenKind.EQUALS)) {
            this.expectOptionalToken(TokenKind.PIPE);
            do {
                types1.push(this.parseNamedType());
            }while (this.expectOptionalToken(TokenKind.PIPE))
        }
        return types1;
    }
    parseEnumTypeDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('enum');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        const values = this.parseEnumValuesDefinition();
        return {
            kind: Kind.ENUM_TYPE_DEFINITION,
            description,
            name,
            directives,
            values,
            loc: this.loc(start1)
        };
    }
    parseEnumValuesDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
    }
    parseEnumValueDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        return {
            kind: Kind.ENUM_VALUE_DEFINITION,
            description,
            name,
            directives,
            loc: this.loc(start1)
        };
    }
    parseInputObjectTypeDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('input');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        const fields = this.parseInputFieldsDefinition();
        return {
            kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
            description,
            name,
            directives,
            fields,
            loc: this.loc(start1)
        };
    }
    parseInputFieldsDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
    }
    parseTypeSystemExtension() {
        const keywordToken = this._lexer.lookahead();
        if (keywordToken.kind === TokenKind.NAME) {
            switch(keywordToken.value){
                case 'schema':
                    return this.parseSchemaExtension();
                case 'scalar':
                    return this.parseScalarTypeExtension();
                case 'type':
                    return this.parseObjectTypeExtension();
                case 'interface':
                    return this.parseInterfaceTypeExtension();
                case 'union':
                    return this.parseUnionTypeExtension();
                case 'enum':
                    return this.parseEnumTypeExtension();
                case 'input':
                    return this.parseInputObjectTypeExtension();
            }
        }
        throw this.unexpected(keywordToken);
    }
    parseSchemaExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('schema');
        const directives = this.parseDirectives(true);
        const operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        if (directives.length === 0 && operationTypes.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.SCHEMA_EXTENSION,
            directives,
            operationTypes,
            loc: this.loc(start1)
        };
    }
    parseScalarTypeExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('scalar');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        if (directives.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.SCALAR_TYPE_EXTENSION,
            name,
            directives,
            loc: this.loc(start1)
        };
    }
    parseObjectTypeExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('type');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseDirectives(true);
        const fields = this.parseFieldsDefinition();
        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.OBJECT_TYPE_EXTENSION,
            name,
            interfaces,
            directives,
            fields,
            loc: this.loc(start1)
        };
    }
    parseInterfaceTypeExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('interface');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseDirectives(true);
        const fields = this.parseFieldsDefinition();
        if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.INTERFACE_TYPE_EXTENSION,
            name,
            interfaces,
            directives,
            fields,
            loc: this.loc(start1)
        };
    }
    parseUnionTypeExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('union');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        const types1 = this.parseUnionMemberTypes();
        if (directives.length === 0 && types1.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.UNION_TYPE_EXTENSION,
            name,
            directives,
            types: types1,
            loc: this.loc(start1)
        };
    }
    parseEnumTypeExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('enum');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        const values = this.parseEnumValuesDefinition();
        if (directives.length === 0 && values.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.ENUM_TYPE_EXTENSION,
            name,
            directives,
            values,
            loc: this.loc(start1)
        };
    }
    parseInputObjectTypeExtension() {
        const start1 = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('input');
        const name = this.parseName();
        const directives = this.parseDirectives(true);
        const fields = this.parseInputFieldsDefinition();
        if (directives.length === 0 && fields.length === 0) {
            throw this.unexpected();
        }
        return {
            kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
            name,
            directives,
            fields,
            loc: this.loc(start1)
        };
    }
    parseDirectiveDefinition() {
        const start1 = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        const name = this.parseName();
        const args1 = this.parseArgumentDefs();
        const repeatable = this.expectOptionalKeyword('repeatable');
        this.expectKeyword('on');
        const locations = this.parseDirectiveLocations();
        return {
            kind: Kind.DIRECTIVE_DEFINITION,
            description,
            name,
            arguments: args1,
            repeatable,
            locations,
            loc: this.loc(start1)
        };
    }
    parseDirectiveLocations() {
        this.expectOptionalToken(TokenKind.PIPE);
        const locations = [];
        do {
            locations.push(this.parseDirectiveLocation());
        }while (this.expectOptionalToken(TokenKind.PIPE))
        return locations;
    }
    parseDirectiveLocation() {
        const start1 = this._lexer.token;
        const name = this.parseName();
        if (DirectiveLocation[name.value] !== undefined) {
            return name;
        }
        throw this.unexpected(start1);
    }
    loc(startToken) {
        if (this._options?.noLocation !== true) {
            return new Location1(startToken, this._lexer.lastToken, this._lexer.source);
        }
    }
    peek(kind) {
        return this._lexer.token.kind === kind;
    }
    expectToken(kind) {
        const token = this._lexer.token;
        if (token.kind === kind) {
            this._lexer.advance();
            return token;
        }
        throw syntaxError(this._lexer.source, token.start, `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`);
    }
    expectOptionalToken(kind) {
        const token = this._lexer.token;
        if (token.kind === kind) {
            this._lexer.advance();
            return token;
        }
        return undefined;
    }
    expectKeyword(value) {
        const token = this._lexer.token;
        if (token.kind === TokenKind.NAME && token.value === value) {
            this._lexer.advance();
        } else {
            throw syntaxError(this._lexer.source, token.start, `Expected "${value}", found ${getTokenDesc(token)}.`);
        }
    }
    expectOptionalKeyword(value) {
        const token = this._lexer.token;
        if (token.kind === TokenKind.NAME && token.value === value) {
            this._lexer.advance();
            return true;
        }
        return false;
    }
    unexpected(atToken) {
        const token = atToken ?? this._lexer.token;
        return syntaxError(this._lexer.source, token.start, `Unexpected ${getTokenDesc(token)}.`);
    }
    any(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        const nodes = [];
        while(!this.expectOptionalToken(closeKind)){
            nodes.push(parseFn.call(this));
        }
        return nodes;
    }
    optionalMany(openKind, parseFn, closeKind) {
        if (this.expectOptionalToken(openKind)) {
            const nodes = [];
            do {
                nodes.push(parseFn.call(this));
            }while (!this.expectOptionalToken(closeKind))
            return nodes;
        }
        return [];
    }
    many(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        const nodes = [];
        do {
            nodes.push(parseFn.call(this));
        }while (!this.expectOptionalToken(closeKind))
        return nodes;
    }
}
function getTokenDesc(token) {
    const value2 = token.value;
    return getTokenKindDesc(token.kind) + (value2 != null ? ` "${value2}"` : '');
}
function getTokenKindDesc(kind2) {
    return isPunctuatorTokenKind(kind2) ? `"${kind2}"` : kind2;
}
const integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;
class LexicalDistance {
    constructor(input1){
        this._input = input1;
        this._inputLowerCase = input1.toLowerCase();
        this._inputArray = stringToArray(this._inputLowerCase);
        this._rows = [
            new Array(input1.length + 1).fill(0),
            new Array(input1.length + 1).fill(0),
            new Array(input1.length + 1).fill(0)
        ];
    }
    measure(option, threshold) {
        if (this._input === option) {
            return 0;
        }
        const optionLowerCase = option.toLowerCase();
        if (this._inputLowerCase === optionLowerCase) {
            return 1;
        }
        let a = stringToArray(optionLowerCase);
        let b = this._inputArray;
        if (a.length < b.length) {
            const tmp = a;
            a = b;
            b = tmp;
        }
        const aLength = a.length;
        const bLength = b.length;
        if (aLength - bLength > threshold) {
            return undefined;
        }
        const rows = this._rows;
        for(let j = 0; j <= bLength; j++){
            rows[0][j] = j;
        }
        for(let i = 1; i <= aLength; i++){
            const upRow = rows[(i - 1) % 3];
            const currentRow = rows[i % 3];
            let smallestCell = currentRow[0] = i;
            for(let j1 = 1; j1 <= bLength; j1++){
                const cost = a[i - 1] === b[j1 - 1] ? 0 : 1;
                let currentCell = Math.min(upRow[j1] + 1, currentRow[j1 - 1] + 1, upRow[j1 - 1] + cost);
                if (i > 1 && j1 > 1 && a[i - 1] === b[j1 - 2] && a[i - 2] === b[j1 - 1]) {
                    const doubleDiagonalCell = rows[(i - 2) % 3][j1 - 2];
                    currentCell = Math.min(currentCell, doubleDiagonalCell + 1);
                }
                if (currentCell < smallestCell) {
                    smallestCell = currentCell;
                }
                currentRow[j1] = currentCell;
            }
            if (smallestCell > threshold) {
                return undefined;
            }
        }
        const distance = rows[aLength % 3][bLength];
        return distance <= threshold ? distance : undefined;
    }
}
function stringToArray(str) {
    const strLength = str.length;
    const array = new Array(strLength);
    for(let i = 0; i < strLength; ++i){
        array[i] = str.charCodeAt(i);
    }
    return array;
}
function printPrefixedLines(lines) {
    const existingLines = lines.filter(([_, line1])=>line1 !== undefined
    );
    const padLen = Math.max(...existingLines.map(([prefix])=>prefix.length
    ));
    return existingLines.map(([prefix, line1])=>leftPad(padLen, prefix) + (line1 ? ' | ' + line1 : ' |')
    ).join('\n');
}
function whitespace(len) {
    return Array(len + 1).join(' ');
}
function leftPad(len, str) {
    return whitespace(len - str.length) + str;
}
function formatValue(value2, seenValues) {
    switch(typeof value2){
        case 'string':
            return JSON.stringify(value2);
        case 'function':
            return value2.name ? `[function ${value2.name}]` : '[function]';
        case 'object':
            if (value2 === null) {
                return 'null';
            }
            return formatObjectValue(value2, seenValues);
        default:
            return String(value2);
    }
}
function formatObjectValue(value2, previouslySeenValues) {
    if (previouslySeenValues.indexOf(value2) !== -1) {
        return '[Circular]';
    }
    const seenValues = [
        ...previouslySeenValues,
        value2
    ];
    const customInspectFn = getCustomFn(value2);
    if (customInspectFn !== undefined) {
        const customValue = customInspectFn.call(value2);
        if (customValue !== value2) {
            return typeof customValue === 'string' ? customValue : formatValue(customValue, seenValues);
        }
    } else if (Array.isArray(value2)) {
        return formatArray(value2, seenValues);
    }
    return formatObject(value2, seenValues);
}
function formatObject(object, seenValues) {
    const keys = Object.keys(object);
    if (keys.length === 0) {
        return '{}';
    }
    if (seenValues.length > 2) {
        return '[' + getObjectTag(object) + ']';
    }
    const properties = keys.map((key)=>{
        const value2 = formatValue(object[key], seenValues);
        return key + ': ' + value2;
    });
    return '{ ' + properties.join(', ') + ' }';
}
function formatArray(array, seenValues) {
    if (array.length === 0) {
        return '[]';
    }
    if (seenValues.length > 2) {
        return '[Array]';
    }
    const len = Math.min(10, array.length);
    const remaining = array.length - len;
    const items = [];
    for(let i = 0; i < len; ++i){
        items.push(formatValue(array[i], seenValues));
    }
    if (remaining === 1) {
        items.push('... 1 more item');
    } else if (remaining > 1) {
        items.push(`... ${remaining} more items`);
    }
    return '[' + items.join(', ') + ']';
}
function getCustomFn(object) {
    const customInspectFn = object[String(nodejsCustomInspectSymbol)];
    if (typeof customInspectFn === 'function') {
        return customInspectFn;
    }
    if (typeof object.inspect === 'function') {
        return object.inspect;
    }
}
function getObjectTag(object) {
    const tag = Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/]$/, '');
    if (tag === 'Object' && typeof object.constructor === 'function') {
        const name = object.constructor.name;
        if (typeof name === 'string' && name !== '') {
            return name;
        }
    }
    return tag;
}
class SchemaValidationContext {
    constructor(schema1){
        this._errors = [];
        this.schema = schema1;
    }
    reportError(message, nodes) {
        const _nodes = Array.isArray(nodes) ? nodes.filter(Boolean) : nodes;
        this.addError(new GraphQLError(message, _nodes));
    }
    addError(error) {
        this._errors.push(error);
    }
    getErrors() {
        return this._errors;
    }
}
function validateRootTypes(context) {
    const schema1 = context.schema;
    const queryType = schema1.getQueryType();
    if (!queryType) {
        context.reportError('Query root type must be provided.', schema1.astNode);
    } else if (!isObjectType(queryType)) {
        context.reportError(`Query root type must be Object type, it cannot be ${inspect(queryType)}.`, getOperationTypeNode(schema1, queryType, 'query'));
    }
    const mutationType = schema1.getMutationType();
    if (mutationType && !isObjectType(mutationType)) {
        context.reportError('Mutation root type must be Object type if provided, it cannot be ' + `${inspect(mutationType)}.`, getOperationTypeNode(schema1, mutationType, 'mutation'));
    }
    const subscriptionType = schema1.getSubscriptionType();
    if (subscriptionType && !isObjectType(subscriptionType)) {
        context.reportError('Subscription root type must be Object type if provided, it cannot be ' + `${inspect(subscriptionType)}.`, getOperationTypeNode(schema1, subscriptionType, 'subscription'));
    }
}
function getOperationTypeNode(schema1, type, operation) {
    const operationNodes = getAllSubNodes(schema1, (node)=>node.operationTypes
    );
    for (const node of operationNodes){
        if (node.operation === operation) {
            return node.type;
        }
    }
    return type.astNode;
}
function validateDirectives(context) {
    for (const directive of context.schema.getDirectives()){
        if (!isDirective(directive)) {
            context.reportError(`Expected directive but got: ${inspect(directive)}.`, directive?.astNode);
            continue;
        }
        validateName(context, directive);
        for (const arg of directive.args){
            validateName(context, arg);
            if (!isInputType(arg.type)) {
                context.reportError(`The type of @${directive.name}(${arg.name}:) must be Input Type ` + `but got: ${inspect(arg.type)}.`, arg.astNode);
            }
        }
    }
}
function validateName(context, node) {
    const error = isValidNameError(node.name);
    if (error) {
        context.addError(locatedError(error, node.astNode));
    }
}
function validateTypes(context) {
    const validateInputObjectCircularRefs = createInputObjectCircularRefsValidator(context);
    const typeMap = context.schema.getTypeMap();
    for (const type of objectValues(typeMap)){
        if (!isNamedType(type)) {
            context.reportError(`Expected GraphQL named type but got: ${inspect(type)}.`, type.astNode);
            continue;
        }
        if (!isIntrospectionType(type)) {
            validateName(context, type);
        }
        if (isObjectType(type)) {
            validateFields(context, type);
            validateInterfaces(context, type);
        } else if (isInterfaceType(type)) {
            validateFields(context, type);
            validateInterfaces(context, type);
        } else if (isUnionType(type)) {
            validateUnionMembers(context, type);
        } else if (isEnumType(type)) {
            validateEnumValues(context, type);
        } else if (isInputObjectType(type)) {
            validateInputFields(context, type);
            validateInputObjectCircularRefs(type);
        }
    }
}
function validateFields(context, type) {
    const fields = objectValues(type.getFields());
    if (fields.length === 0) {
        context.reportError(`Type ${type.name} must define one or more fields.`, getAllNodes(type));
    }
    for (const field of fields){
        validateName(context, field);
        if (!isOutputType(field.type)) {
            context.reportError(`The type of ${type.name}.${field.name} must be Output Type ` + `but got: ${inspect(field.type)}.`, field.astNode?.type);
        }
        for (const arg of field.args){
            const argName = arg.name;
            validateName(context, arg);
            if (!isInputType(arg.type)) {
                context.reportError(`The type of ${type.name}.${field.name}(${argName}:) must be Input ` + `Type but got: ${inspect(arg.type)}.`, arg.astNode?.type);
            }
        }
    }
}
function validateInterfaces(context, type) {
    const ifaceTypeNames = Object.create(null);
    for (const iface of type.getInterfaces()){
        if (!isInterfaceType(iface)) {
            context.reportError(`Type ${inspect(type)} must only implement Interface types, ` + `it cannot implement ${inspect(iface)}.`, getAllImplementsInterfaceNodes(type, iface));
            continue;
        }
        if (type === iface) {
            context.reportError(`Type ${type.name} cannot implement itself because it would create a circular reference.`, getAllImplementsInterfaceNodes(type, iface));
            continue;
        }
        if (ifaceTypeNames[iface.name]) {
            context.reportError(`Type ${type.name} can only implement ${iface.name} once.`, getAllImplementsInterfaceNodes(type, iface));
            continue;
        }
        ifaceTypeNames[iface.name] = true;
        validateTypeImplementsAncestors(context, type, iface);
        validateTypeImplementsInterface(context, type, iface);
    }
}
function validateTypeImplementsInterface(context, type, iface) {
    const typeFieldMap = type.getFields();
    for (const ifaceField of objectValues(iface.getFields())){
        const fieldName = ifaceField.name;
        const typeField = typeFieldMap[fieldName];
        if (!typeField) {
            context.reportError(`Interface field ${iface.name}.${fieldName} expected but ${type.name} does not provide it.`, [
                ifaceField.astNode,
                ...getAllNodes(type)
            ]);
            continue;
        }
        if (!isTypeSubTypeOf(context.schema, typeField.type, ifaceField.type)) {
            context.reportError(`Interface field ${iface.name}.${fieldName} expects type ` + `${inspect(ifaceField.type)} but ${type.name}.${fieldName} ` + `is type ${inspect(typeField.type)}.`, [
                ifaceField.astNode.type,
                typeField.astNode.type
            ]);
        }
        for (const ifaceArg of ifaceField.args){
            const argName = ifaceArg.name;
            const typeArg = find(typeField.args, (arg)=>arg.name === argName
            );
            if (!typeArg) {
                context.reportError(`Interface field argument ${iface.name}.${fieldName}(${argName}:) expected but ${type.name}.${fieldName} does not provide it.`, [
                    ifaceArg.astNode,
                    typeField.astNode
                ]);
                continue;
            }
            if (!isEqualType(ifaceArg.type, typeArg.type)) {
                context.reportError(`Interface field argument ${iface.name}.${fieldName}(${argName}:) ` + `expects type ${inspect(ifaceArg.type)} but ` + `${type.name}.${fieldName}(${argName}:) is type ` + `${inspect(typeArg.type)}.`, [
                    ifaceArg.astNode.type,
                    typeArg.astNode.type
                ]);
            }
        }
        for (const typeArg of typeField.args){
            const argName = typeArg.name;
            const ifaceArg1 = find(ifaceField.args, (arg)=>arg.name === argName
            );
            if (!ifaceArg1 && isRequiredArgument(typeArg)) {
                context.reportError(`Object field ${type.name}.${fieldName} includes required argument ${argName} that is missing from the Interface field ${iface.name}.${fieldName}.`, [
                    typeArg.astNode,
                    ifaceField.astNode
                ]);
            }
        }
    }
}
function validateTypeImplementsAncestors(context, type, iface) {
    const ifaceInterfaces = type.getInterfaces();
    for (const transitive of iface.getInterfaces()){
        if (ifaceInterfaces.indexOf(transitive) === -1) {
            context.reportError(transitive === type ? `Type ${type.name} cannot implement ${iface.name} because it would create a circular reference.` : `Type ${type.name} must implement ${transitive.name} because it is implemented by ${iface.name}.`, [
                ...getAllImplementsInterfaceNodes(iface, transitive),
                ...getAllImplementsInterfaceNodes(type, iface)
            ]);
        }
    }
}
function validateUnionMembers(context, union) {
    const memberTypes = union.getTypes();
    if (memberTypes.length === 0) {
        context.reportError(`Union type ${union.name} must define one or more member types.`, getAllNodes(union));
    }
    const includedTypeNames = Object.create(null);
    for (const memberType of memberTypes){
        if (includedTypeNames[memberType.name]) {
            context.reportError(`Union type ${union.name} can only include type ${memberType.name} once.`, getUnionMemberTypeNodes(union, memberType.name));
            continue;
        }
        includedTypeNames[memberType.name] = true;
        if (!isObjectType(memberType)) {
            context.reportError(`Union type ${union.name} can only include Object types, ` + `it cannot include ${inspect(memberType)}.`, getUnionMemberTypeNodes(union, String(memberType)));
        }
    }
}
function validateEnumValues(context, enumType) {
    const enumValues = enumType.getValues();
    if (enumValues.length === 0) {
        context.reportError(`Enum type ${enumType.name} must define one or more values.`, getAllNodes(enumType));
    }
    for (const enumValue of enumValues){
        const valueName = enumValue.name;
        validateName(context, enumValue);
        if (valueName === 'true' || valueName === 'false' || valueName === 'null') {
            context.reportError(`Enum type ${enumType.name} cannot include value: ${valueName}.`, enumValue.astNode);
        }
    }
}
function validateInputFields(context, inputObj) {
    const fields = objectValues(inputObj.getFields());
    if (fields.length === 0) {
        context.reportError(`Input Object type ${inputObj.name} must define one or more fields.`, getAllNodes(inputObj));
    }
    for (const field of fields){
        validateName(context, field);
        if (!isInputType(field.type)) {
            context.reportError(`The type of ${inputObj.name}.${field.name} must be Input Type ` + `but got: ${inspect(field.type)}.`, field.astNode?.type);
        }
    }
}
function createInputObjectCircularRefsValidator(context) {
    const visitedTypes = Object.create(null);
    const fieldPath = [];
    const fieldPathIndexByTypeName = Object.create(null);
    return detectCycleRecursive;
    function detectCycleRecursive(inputObj) {
        if (visitedTypes[inputObj.name]) {
            return;
        }
        visitedTypes[inputObj.name] = true;
        fieldPathIndexByTypeName[inputObj.name] = fieldPath.length;
        const fields = objectValues(inputObj.getFields());
        for (const field of fields){
            if (isNonNullType(field.type) && isInputObjectType(field.type.ofType)) {
                const fieldType = field.type.ofType;
                const cycleIndex = fieldPathIndexByTypeName[fieldType.name];
                fieldPath.push(field);
                if (cycleIndex === undefined) {
                    detectCycleRecursive(fieldType);
                } else {
                    const cyclePath = fieldPath.slice(cycleIndex);
                    const pathStr = cyclePath.map((fieldObj)=>fieldObj.name
                    ).join('.');
                    context.reportError(`Cannot reference Input Object "${fieldType.name}" within itself through a series of non-null fields: "${pathStr}".`, cyclePath.map((fieldObj)=>fieldObj.astNode
                    ));
                }
                fieldPath.pop();
            }
        }
        fieldPathIndexByTypeName[inputObj.name] = undefined;
    }
}
function getAllNodes(object) {
    const { astNode , extensionASTNodes  } = object;
    return astNode ? extensionASTNodes ? [
        astNode
    ].concat(extensionASTNodes) : [
        astNode
    ] : extensionASTNodes ?? [];
}
function getAllSubNodes(object, getter) {
    return flatMap(getAllNodes(object), (item)=>getter(item) ?? []
    );
}
function getAllImplementsInterfaceNodes(type, iface) {
    return getAllSubNodes(type, (typeNode)=>typeNode.interfaces
    ).filter((ifaceNode)=>ifaceNode.name.value === iface.name
    );
}
function getUnionMemberTypeNodes(union, typeName) {
    return getAllSubNodes(union, (unionNode)=>unionNode.types
    ).filter((typeNode)=>typeNode.name.value === typeName
    );
}
const nameKind = (value2)=>({
        kind: mod3.Kind.NAME,
        value: value2
    })
;
const namedTypeKind = (value2)=>({
        kind: mod3.Kind.NAMED_TYPE,
        name: nameKind(value2)
    })
;
const fieldToAST = (field)=>({
        kind: mod3.Kind.FIELD_DEFINITION,
        name: nameKind(field.name),
        type: mod3.parseType(field.type.toString())
    })
;
const interfaceToAST = (iface)=>({
        kind: mod3.Kind.INTERFACE_TYPE_DEFINITION,
        name: nameKind(iface.name),
        fields: Object.values(iface.getFields()).map(fieldToAST)
    })
;
const interfaceExtensionFactory = ()=>{
    const interfaceRelations = new Map();
    const interfaces = new Map();
    const addInterfaceRelation = (extendsName, ifaceName)=>{
        let relation = interfaceRelations.get(extendsName);
        if (!relation) {
            relation = new Set();
            interfaceRelations.set(extendsName, relation);
        }
        relation.add(ifaceName);
    };
    const getInterface = (source2)=>{
        const interfaceName = `${source2.name}Interface`;
        let iface = interfaces.get(interfaceName);
        if (!iface) {
            iface = new G.GraphQLInterfaceType({
                name: interfaceName,
                fields: source2.toConfig().fields
            });
            interfaces.set(interfaceName, iface);
            addInterfaceRelation(source2.name, iface.name);
        }
        return iface;
    };
    const addInterfaceConnection = (interfaceObject, extendingObject)=>{
        const iface = getInterface(interfaceObject);
        addInterfaceRelation(extendingObject.name, iface.name);
    };
    const extendSchema = (schema1)=>{
        const ifaces = Array.from(interfaces.values());
        if (ifaces.length === 0) {
            return schema1;
        }
        const interfaceDefinitions = ifaces.map(interfaceToAST);
        const objectExtendsDefinitions = Array.from(interfaceRelations.entries()).map(([typeName, interfaces1])=>({
                kind: mod3.Kind.OBJECT_TYPE_EXTENSION,
                name: nameKind(typeName),
                interfaces: Array.from(interfaces1).map(namedTypeKind)
            })
        );
        const document = {
            kind: mod3.Kind.DOCUMENT,
            definitions: [
                ...interfaceDefinitions,
                ...objectExtendsDefinitions, 
            ]
        };
        return mod3.extendSchema(schema1, document, {
            assumeValidSDL: true
        });
    };
    return {
        addInterfaceConnection,
        extendSchema
    };
};
const isGQLObject = (obj)=>mod3.isInputObjectType(obj) || mod3.isObjectType(obj)
;
function _isPlaceholder(a) {
    return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}
function _curry1(fn) {
    return function f1(a) {
        if (arguments.length === 0 || _isPlaceholder(a)) {
            return f1;
        } else {
            return fn.apply(this, arguments);
        }
    };
}
function _curry2(fn) {
    return function f2(a, b) {
        switch(arguments.length){
            case 0:
                return f2;
            case 1:
                return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
                    return fn(a, _b);
                });
            default:
                return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
                    return fn(_a, b);
                }) : _isPlaceholder(b) ? _curry1(function(_b) {
                    return fn(a, _b);
                }) : fn(a, b);
        }
    };
}
function _arity(n, fn) {
    switch(n){
        case 0:
            return function() {
                return fn.apply(this, arguments);
            };
        case 1:
            return function(a0) {
                return fn.apply(this, arguments);
            };
        case 2:
            return function(a0, a1) {
                return fn.apply(this, arguments);
            };
        case 3:
            return function(a0, a1, a2) {
                return fn.apply(this, arguments);
            };
        case 4:
            return function(a0, a1, a2, a3) {
                return fn.apply(this, arguments);
            };
        case 5:
            return function(a0, a1, a2, a3, a4) {
                return fn.apply(this, arguments);
            };
        case 6:
            return function(a0, a1, a2, a3, a4, a5) {
                return fn.apply(this, arguments);
            };
        case 7:
            return function(a0, a1, a2, a3, a4, a5, a6) {
                return fn.apply(this, arguments);
            };
        case 8:
            return function(a0, a1, a2, a3, a4, a5, a6, a7) {
                return fn.apply(this, arguments);
            };
        case 9:
            return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                return fn.apply(this, arguments);
            };
        case 10:
            return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                return fn.apply(this, arguments);
            };
        default:
            throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
    }
}
function _curryN(length, received, fn) {
    return function() {
        var combined = [];
        var argsIdx = 0;
        var left = length;
        var combinedIdx = 0;
        while(combinedIdx < received.length || argsIdx < arguments.length){
            var result;
            if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
                result = received[combinedIdx];
            } else {
                result = arguments[argsIdx];
                argsIdx += 1;
            }
            combined[combinedIdx] = result;
            if (!_isPlaceholder(result)) {
                left -= 1;
            }
            combinedIdx += 1;
        }
        return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
    };
}
function _concat(set1, set2) {
    set1 = set1 || [];
    set2 = set2 || [];
    var idx;
    var len1 = set1.length;
    var len2 = set2.length;
    var result = [];
    idx = 0;
    while(idx < len1){
        result[result.length] = set1[idx];
        idx += 1;
    }
    idx = 0;
    while(idx < len2){
        result[result.length] = set2[idx];
        idx += 1;
    }
    return result;
}
function _curry3(fn) {
    return function f3(a, b, c) {
        switch(arguments.length){
            case 0:
                return f3;
            case 1:
                return _isPlaceholder(a) ? f3 : _curry2(function(_b, _c) {
                    return fn(a, _b, _c);
                });
            case 2:
                return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function(_a, _c) {
                    return fn(_a, b, _c);
                }) : _isPlaceholder(b) ? _curry2(function(_b, _c) {
                    return fn(a, _b, _c);
                }) : _curry1(function(_c) {
                    return fn(a, b, _c);
                });
            default:
                return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) {
                    return fn(_a, _b, c);
                }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) {
                    return fn(_a, b, _c);
                }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) {
                    return fn(a, _b, _c);
                }) : _isPlaceholder(a) ? _curry1(function(_a) {
                    return fn(_a, b, c);
                }) : _isPlaceholder(b) ? _curry1(function(_b) {
                    return fn(a, _b, c);
                }) : _isPlaceholder(c) ? _curry1(function(_c) {
                    return fn(a, b, _c);
                }) : fn(a, b, c);
        }
    };
}
const __default2 = {
    init: function() {
        return this.xf['@@transducer/init']();
    },
    result: function(result) {
        return this.xf['@@transducer/result'](result);
    }
};
function _reduced(x) {
    return x && x['@@transducer/reduced'] ? x : {
        '@@transducer/value': x,
        '@@transducer/reduced': true
    };
}
const __default1 = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};
function _isTransformer(obj) {
    return obj != null && typeof obj['@@transducer/step'] === 'function';
}
function _dispatchable(methodNames, transducerCreator, fn) {
    return function() {
        if (arguments.length === 0) {
            return fn();
        }
        var obj = arguments[arguments.length - 1];
        if (!__default1(obj)) {
            var idx = 0;
            while(idx < methodNames.length){
                if (typeof obj[methodNames[idx]] === 'function') {
                    return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
                }
                idx += 1;
            }
            if (_isTransformer(obj)) {
                var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
                return transducer(obj);
            }
        }
        return fn.apply(this, arguments);
    };
}
const _xwrap = __default;
function _isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
}
var _isArrayLike = _curry1(function isArrayLike(x) {
    if (__default1(x)) {
        return true;
    }
    if (!x) {
        return false;
    }
    if (typeof x !== 'object') {
        return false;
    }
    if (_isString(x)) {
        return false;
    }
    if (x.length === 0) {
        return true;
    }
    if (x.length > 0) {
        return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
    }
    return false;
});
function _arrayReduce(xf, acc, list) {
    var idx = 0;
    var len = list.length;
    while(idx < len){
        acc = xf['@@transducer/step'](acc, list[idx]);
        if (acc && acc['@@transducer/reduced']) {
            acc = acc['@@transducer/value'];
            break;
        }
        idx += 1;
    }
    return xf['@@transducer/result'](acc);
}
function _iterableReduce(xf, acc, iter) {
    var step = iter.next();
    while(!step.done){
        acc = xf['@@transducer/step'](acc, step.value);
        if (acc && acc['@@transducer/reduced']) {
            acc = acc['@@transducer/value'];
            break;
        }
        step = iter.next();
    }
    return xf['@@transducer/result'](acc);
}
var bind = _curry2(function bind(fn, thisObj) {
    return _arity(fn.length, function() {
        return fn.apply(thisObj, arguments);
    });
});
function _methodReduce(xf, acc, obj, methodName) {
    return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}
var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
function _reduce(fn, acc, list) {
    if (typeof fn === 'function') {
        fn = _xwrap(fn);
    }
    if (_isArrayLike(list)) {
        return _arrayReduce(fn, acc, list);
    }
    if (typeof list['fantasy-land/reduce'] === 'function') {
        return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
    }
    if (list[symIterator] != null) {
        return _iterableReduce(fn, acc, list[symIterator]());
    }
    if (typeof list.next === 'function') {
        return _iterableReduce(fn, acc, list);
    }
    if (typeof list.reduce === 'function') {
        return _methodReduce(fn, acc, list, 'reduce');
    }
    throw new TypeError('reduce: list must be array or iterable');
}
var reduce = _curry3(_reduce);
var max = _curry2(function max(a, b) {
    return b > a ? b : a;
});
function _has(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
const _has1 = _has;
var toString = Object.prototype.toString;
var _isArguments = function() {
    return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
        return toString.call(x) === '[object Arguments]';
    } : function _isArguments(x) {
        return _has('callee', x);
    };
}();
var hasEnumBug = !({
    toString: null
}).propertyIsEnumerable('toString');
var nonEnumerableProps = [
    'constructor',
    'valueOf',
    'isPrototypeOf',
    'toString',
    'propertyIsEnumerable',
    'hasOwnProperty',
    'toLocaleString'
];
var hasArgsEnumBug = function() {
    'use strict';
    return arguments.propertyIsEnumerable('length');
}();
var contains = function contains(list, item) {
    var idx = 0;
    while(idx < list.length){
        if (list[idx] === item) {
            return true;
        }
        idx += 1;
    }
    return false;
};
var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ? _curry1(function keys(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
}) : _curry1(function keys(obj) {
    if (Object(obj) !== obj) {
        return [];
    }
    var prop, nIdx;
    var ks = [];
    var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
    for(prop in obj){
        if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
            ks[ks.length] = prop;
        }
    }
    if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;
        while(nIdx >= 0){
            prop = nonEnumerableProps[nIdx];
            if (_has(prop, obj) && !contains(ks, prop)) {
                ks[ks.length] = prop;
            }
            nIdx -= 1;
        }
    }
    return ks;
});
function _map(fn, functor) {
    var idx = 0;
    var len = functor.length;
    var result = Array(len);
    while(idx < len){
        result[idx] = fn(functor[idx]);
        idx += 1;
    }
    return result;
}
const __default3 = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
};
var nth = _curry2(function nth(offset, list) {
    var idx = offset < 0 ? list.length + offset : offset;
    return _isString(list) ? list.charAt(idx) : list[idx];
});
var isNil = _curry1(function isNil(x) {
    return x == null;
});
function _assoc(prop, val, obj) {
    if (__default3(prop) && __default1(obj)) {
        var arr = [].concat(obj);
        arr[prop] = val;
        return arr;
    }
    var result = {
    };
    for(var p in obj){
        result[p] = obj[p];
    }
    result[prop] = val;
    return result;
}
var assocPath = _curry3(function assocPath(path1, val, obj) {
    if (path1.length === 0) {
        return val;
    }
    var idx = path1[0];
    if (path1.length > 1) {
        var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : __default3(path1[1]) ? [] : {
        };
        val = assocPath(Array.prototype.slice.call(path1, 1), val, nextObj);
    }
    return _assoc(idx, val, obj);
});
function _isFunction(x) {
    var type = Object.prototype.toString.call(x);
    return type === '[object Function]' || type === '[object AsyncFunction]' || type === '[object GeneratorFunction]' || type === '[object AsyncGeneratorFunction]';
}
var ap = _curry2(function ap(applyF, applyX) {
    return typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) : typeof applyF.ap === 'function' ? applyF.ap(applyX) : typeof applyF === 'function' ? function(x) {
        return applyF(x)(applyX(x));
    } : _reduce(function(acc, f) {
        return _concat(acc, __default(f, applyX));
    }, [], applyF);
});
function _makeFlat(recursive) {
    return function flatt(list) {
        var value2, jlen, j;
        var result = [];
        var idx = 0;
        var ilen = list.length;
        while(idx < ilen){
            if (_isArrayLike(list[idx])) {
                value2 = recursive ? flatt(list[idx]) : list[idx];
                j = 0;
                jlen = value2.length;
                while(j < jlen){
                    result[result.length] = value2[j];
                    j += 1;
                }
            } else {
                result[result.length] = list[idx];
            }
            idx += 1;
        }
        return result;
    };
}
var type = _curry1(function type(val) {
    return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});
function _cloneRegExp(pattern) {
    return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
}
function _clone(value2, refFrom, refTo, deep) {
    var copy = function copy(copiedValue) {
        var len = refFrom.length;
        var idx = 0;
        while(idx < len){
            if (value2 === refFrom[idx]) {
                return refTo[idx];
            }
            idx += 1;
        }
        refFrom[idx] = value2;
        refTo[idx] = copiedValue;
        for(var key in value2){
            if (value2.hasOwnProperty(key)) {
                copiedValue[key] = deep ? _clone(value2[key], refFrom, refTo, true) : value2[key];
            }
        }
        return copiedValue;
    };
    switch(type(value2)){
        case 'Object':
            return copy(Object.create(Object.getPrototypeOf(value2)));
        case 'Array':
            return copy([]);
        case 'Date':
            return new Date(value2.valueOf());
        case 'RegExp':
            return _cloneRegExp(value2);
        default:
            return value2;
    }
}
function _checkForMethod(methodname, fn) {
    return function() {
        var length = arguments.length;
        if (length === 0) {
            return fn();
        }
        var obj = arguments[length - 1];
        return __default1(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
    };
}
var slice = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
    return Array.prototype.slice.call(list, fromIndex, toIndex);
}));
var tail = _curry1(_checkForMethod('tail', slice(1, Infinity)));
var reverse = _curry1(function reverse(list) {
    return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
});
function _identity(x) {
    return x;
}
function _objectIs(a, b) {
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
    } else {
        return a !== a && b !== b;
    }
}
const __default4 = typeof Object.is === 'function' ? Object.is : _objectIs;
function _functionName(f) {
    var match = String(f).match(/^function (\w*)/);
    return match == null ? '' : match[1];
}
function _arrayFromIterator(iter) {
    var list = [];
    var next;
    while(!(next = iter.next()).done){
        list.push(next.value);
    }
    return list;
}
function _includesWith(pred, x, list) {
    var idx = 0;
    var len = list.length;
    while(idx < len){
        if (pred(x, list[idx])) {
            return true;
        }
        idx += 1;
    }
    return false;
}
function _equals(a, b, stackA, stackB) {
    if (__default4(a, b)) {
        return true;
    }
    var typeA = type(a);
    if (typeA !== type(b)) {
        return false;
    }
    if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
        return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
    }
    if (typeof a.equals === 'function' || typeof b.equals === 'function') {
        return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
    }
    switch(typeA){
        case 'Arguments':
        case 'Array':
        case 'Object':
            if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
                return a === b;
            }
            break;
        case 'Boolean':
        case 'Number':
        case 'String':
            if (!(typeof a === typeof b && __default4(a.valueOf(), b.valueOf()))) {
                return false;
            }
            break;
        case 'Date':
            if (!__default4(a.valueOf(), b.valueOf())) {
                return false;
            }
            break;
        case 'Error':
            return a.name === b.name && a.message === b.message;
        case 'RegExp':
            if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
                return false;
            }
            break;
    }
    var idx = stackA.length - 1;
    while(idx >= 0){
        if (stackA[idx] === a) {
            return stackB[idx] === b;
        }
        idx -= 1;
    }
    switch(typeA){
        case 'Map':
            if (a.size !== b.size) {
                return false;
            }
            return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([
                a
            ]), stackB.concat([
                b
            ]));
        case 'Set':
            if (a.size !== b.size) {
                return false;
            }
            return _uniqContentEquals(a.values(), b.values(), stackA.concat([
                a
            ]), stackB.concat([
                b
            ]));
        case 'Arguments':
        case 'Array':
        case 'Object':
        case 'Boolean':
        case 'Number':
        case 'String':
        case 'Date':
        case 'Error':
        case 'RegExp':
        case 'Int8Array':
        case 'Uint8Array':
        case 'Uint8ClampedArray':
        case 'Int16Array':
        case 'Uint16Array':
        case 'Int32Array':
        case 'Uint32Array':
        case 'Float32Array':
        case 'Float64Array':
        case 'ArrayBuffer': break;
        default:
            return false;
    }
    var keysA = keys(a);
    if (keysA.length !== keys(b).length) {
        return false;
    }
    var extendedStackA = stackA.concat([
        a
    ]);
    var extendedStackB = stackB.concat([
        b
    ]);
    idx = keysA.length - 1;
    while(idx >= 0){
        var key = keysA[idx];
        if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
            return false;
        }
        idx -= 1;
    }
    return true;
}
var equals = _curry2(function equals(a, b) {
    return _equals(a, b, [], []);
});
function _indexOf(list, a, idx) {
    var inf, item;
    if (typeof list.indexOf === 'function') {
        switch(typeof a){
            case 'number':
                if (a === 0) {
                    inf = 1 / a;
                    while(idx < list.length){
                        item = list[idx];
                        if (item === 0 && 1 / item === inf) {
                            return idx;
                        }
                        idx += 1;
                    }
                    return -1;
                } else if (a !== a) {
                    while(idx < list.length){
                        item = list[idx];
                        if (typeof item === 'number' && item !== item) {
                            return idx;
                        }
                        idx += 1;
                    }
                    return -1;
                }
                return list.indexOf(a, idx);
            case 'string':
            case 'boolean':
            case 'function':
            case 'undefined':
                return list.indexOf(a, idx);
            case 'object':
                if (a === null) {
                    return list.indexOf(a, idx);
                }
        }
    }
    while(idx < list.length){
        if (equals(list[idx], a)) {
            return idx;
        }
        idx += 1;
    }
    return -1;
}
function _includes(a, list) {
    return _indexOf(list, a, 0) >= 0;
}
function _quote(s) {
    var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b').replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
    return '"' + escaped.replace(/"/g, '\\"') + '"';
}
var pad = function pad(n) {
    return (n < 10 ? '0' : '') + n;
};
var _toISOString = typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
    return d.toISOString();
} : function _toISOString(d) {
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
};
function _toString(x, seen) {
    var recur = function recur(y) {
        var xs = seen.concat([
            x
        ]);
        return _includes(y, xs) ? '<Circular>' : _toString(y, xs);
    };
    var mapPairs = function(obj, keys1) {
        return _map(function(k) {
            return _quote(k) + ': ' + recur(obj[k]);
        }, keys1.slice().sort());
    };
    switch(Object.prototype.toString.call(x)){
        case '[object Arguments]':
            return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
        case '[object Array]':
            return '[' + _map(recur, x).concat(mapPairs(x, __default(function(k) {
                return /^\d+$/.test(k);
            }, keys(x)))).join(', ') + ']';
        case '[object Boolean]':
            return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
        case '[object Date]':
            return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';
        case '[object Null]':
            return 'null';
        case '[object Number]':
            return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
        case '[object String]':
            return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
        case '[object Undefined]':
            return 'undefined';
        default:
            if (typeof x.toString === 'function') {
                var repr = x.toString();
                if (repr !== '[object Object]') {
                    return repr;
                }
            }
            return '{' + mapPairs(x, keys(x)).join(', ') + '}';
    }
}
var toString1 = _curry1(function toString1(val) {
    return _toString(val, []);
});
function _Set() {
    this._nativeSet = typeof Set === 'function' ? new Set() : null;
    this._items = {
    };
}
_Set.prototype.add = function(item) {
    return !hasOrAdd(item, true, this);
};
_Set.prototype.has = function(item) {
    return hasOrAdd(item, false, this);
};
function _isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]';
}
function _filter(fn, list) {
    var idx = 0;
    var len = list.length;
    var result = [];
    while(idx < len){
        if (fn(list[idx])) {
            result[result.length] = list[idx];
        }
        idx += 1;
    }
    return result;
}
function _objectAssign(target) {
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    var output = Object(target);
    var idx = 1;
    var length = arguments.length;
    while(idx < length){
        var source2 = arguments[idx];
        if (source2 != null) {
            for(var nextKey in source2){
                if (_has(nextKey, source2)) {
                    output[nextKey] = source2[nextKey];
                }
            }
        }
        idx += 1;
    }
    return output;
}
const __default5 = typeof Object.assign === 'function' ? Object.assign : _objectAssign;
function _isNumber(x) {
    return Object.prototype.toString.call(x) === '[object Number]';
}
var mergeWithKey = _curry3(function mergeWithKey(fn, l, r) {
    var result = {
    };
    var k;
    for(k in l){
        if (_has(k, l)) {
            result[k] = _has1(k, r) ? fn(k, l[k], r[k]) : l[k];
        }
    }
    for(k in r){
        if (_has(k, r) && !_has(k, result)) {
            result[k] = r[k];
        }
    }
    return result;
});
var mergeDeepWithKey = _curry3(function mergeDeepWithKey(fn, lObj, rObj) {
    return mergeWithKey(function(k, lVal, rVal) {
        if (_isObject(lVal) && _isObject(rVal)) {
            return mergeDeepWithKey(fn, lVal, rVal);
        } else {
            return fn(k, lVal, rVal);
        }
    }, lObj, rObj);
});
function _complement(f) {
    return function() {
        return !f.apply(this, arguments);
    };
}
function _assertPromise(name, p) {
    if (p == null || !_isFunction(p.then)) {
        throw new TypeError('`' + name + '` expected a Promise, received ' + _toString(p, []));
    }
}
function _createPartialApplicator(concat) {
    return _curry2(function(fn, args1) {
        return _arity(Math.max(0, fn.length - args1.length), function() {
            return fn.apply(this, concat(args1, arguments));
        });
    });
}
const mod4 = function() {
    var F = function() {
        return false;
    };
    const __default6 = F;
    const __default7 = F;
    const F1 = F;
    var T = function() {
        return true;
    };
    const __default8 = T;
    const __default9 = T;
    const T1 = T;
    const _curry21 = _curry2;
    var add = _curry2(function add(a, b) {
        return Number(a) + Number(b);
    });
    const __default10 = add;
    const __default11 = add;
    const add1 = add;
    const add2 = add;
    const add3 = add;
    const add4 = add;
    const _curry11 = _curry1;
    const _curry22 = _curry2;
    const _curry12 = _curry1;
    const _arity1 = _arity;
    const _curryN1 = _curryN;
    var curryN = _curry2(function curryN(length, fn) {
        if (length === 1) {
            return _curry1(fn);
        }
        return _arity(length, _curryN(length, [], fn));
    });
    const __default12 = curryN;
    const __default13 = curryN;
    const curryN1 = curryN;
    const curryN2 = curryN;
    const curryN3 = curryN;
    const curryN4 = curryN;
    const curryN5 = curryN;
    const curryN6 = curryN;
    const curryN7 = curryN;
    const curryN8 = curryN;
    const curryN9 = curryN;
    const curryN10 = curryN;
    const curryN11 = curryN;
    const curryN12 = curryN;
    const curryN13 = curryN;
    const curryN14 = curryN;
    const curryN15 = curryN;
    const curryN16 = curryN;
    const curryN17 = curryN;
    const _concat1 = _concat;
    var addIndex = _curry1(function addIndex(fn) {
        return curryN(fn.length, function() {
            var idx = 0;
            var origFn = arguments[0];
            var list = arguments[arguments.length - 1];
            var args1 = Array.prototype.slice.call(arguments, 0);
            args1[0] = function() {
                var result = origFn.apply(this, _concat1(arguments, [
                    idx,
                    list
                ]));
                idx += 1;
                return result;
            };
            return fn.apply(this, args1);
        });
    });
    const __default14 = addIndex;
    const __default15 = addIndex;
    const addIndex1 = addIndex;
    const _curry31 = _curry3;
    const _concat2 = _concat;
    var adjust = _curry3(function adjust(idx, fn, list) {
        if (idx >= list.length || idx < -list.length) {
            return list;
        }
        var start1 = idx < 0 ? list.length : 0;
        var _idx = start1 + idx;
        var _list = _concat(list);
        _list[_idx] = fn(list[_idx]);
        return _list;
    });
    const __default16 = adjust;
    const __default17 = adjust;
    const adjust1 = adjust;
    const adjust2 = adjust;
    function XAll(f, xf) {
        this.xf = xf;
        this.f = f;
        this.all = true;
    }
    const _xfBase = __default2;
    XAll.prototype['@@transducer/init'] = _xfBase.init;
    XAll.prototype['@@transducer/result'] = function(result) {
        if (this.all) {
            result = this.xf['@@transducer/step'](result, true);
        }
        return this.xf['@@transducer/result'](result);
    };
    const _reduced1 = _reduced;
    XAll.prototype['@@transducer/step'] = function(result, input1) {
        if (!this.f(input1)) {
            this.all = false;
            result = _reduced1(this.xf['@@transducer/step'](result, false));
        }
        return result;
    };
    const _curry23 = _curry2;
    var _xall = _curry2(function _xall(f, xf) {
        return new XAll(f, xf);
    });
    const __default18 = _xall;
    const __default19 = _xall;
    const _xall1 = _xall;
    const _curry24 = _curry2;
    const _dispatchable1 = _dispatchable;
    var all = _curry2(_dispatchable([
        'all'
    ], _xall, function all(fn, list) {
        var idx = 0;
        while(idx < list.length){
            if (!fn(list[idx])) {
                return false;
            }
            idx += 1;
        }
        return true;
    }));
    const __default20 = all;
    const __default21 = all;
    const all1 = all;
    const all2 = all;
    const _curry13 = _curry1;
    const reduce1 = reduce;
    const max1 = max;
    const _curry25 = _curry2;
    const _curry26 = _curry2;
    const _dispatchable2 = _dispatchable;
    const _curry27 = _curry2;
    function XMap(f, xf) {
        this.xf = xf;
        this.f = f;
    }
    const _xfBase1 = __default2;
    XMap.prototype['@@transducer/init'] = _xfBase1.init;
    XMap.prototype['@@transducer/result'] = _xfBase1.result;
    XMap.prototype['@@transducer/step'] = function(result, input1) {
        return this.xf['@@transducer/step'](result, this.f(input1));
    };
    var _xmap = _curry2(function _xmap(f, xf) {
        return new XMap(f, xf);
    });
    const __default22 = _xmap;
    const __default23 = _xmap;
    const _xmap1 = _xmap;
    const _reduce1 = _reduce;
    const keys1 = keys;
    const _map1 = _map;
    var map = _curry2(_dispatchable([
        'fantasy-land/map',
        'map'
    ], _xmap, function map(fn, functor) {
        switch(Object.prototype.toString.call(functor)){
            case '[object Function]':
                return curryN(functor.length, function() {
                    return fn.call(this, functor.apply(this, arguments));
                });
            case '[object Object]':
                return _reduce(function(acc, key) {
                    acc[key] = fn(functor[key]);
                    return acc;
                }, {
                }, keys(functor));
            default:
                return _map(fn, functor);
        }
    }));
    const __default24 = map;
    const __default25 = map;
    const map1 = __default25;
    const map2 = __default25;
    const map3 = __default25;
    const map4 = __default25;
    const map5 = __default25;
    const map6 = __default25;
    const map7 = __default25;
    const map8 = __default25;
    const map9 = __default25;
    const map10 = __default25;
    const _curry28 = _curry2;
    const _isInteger1 = __default3;
    const nth1 = nth;
    var prop = _curry2(function prop(p, obj) {
        if (obj == null) {
            return;
        }
        return __default3(p) ? nth(p, obj) : obj[p];
    });
    const __default26 = prop;
    const __default27 = prop;
    const prop1 = prop;
    const prop2 = prop;
    const prop3 = prop;
    const prop4 = prop;
    const prop5 = prop;
    const prop6 = prop;
    const prop7 = prop;
    var pluck = _curry2(function pluck(p, list) {
        return __default25(prop(p), list);
    });
    const __default28 = pluck;
    const __default29 = pluck;
    const pluck1 = pluck;
    const pluck2 = pluck;
    const pluck3 = pluck;
    const pluck4 = pluck;
    const pluck5 = pluck;
    var allPass = _curry1(function allPass(preds) {
        return curryN(reduce(max, 0, pluck('length', preds)), function() {
            var idx = 0;
            var len = preds.length;
            while(idx < len){
                if (!preds[idx].apply(this, arguments)) {
                    return false;
                }
                idx += 1;
            }
            return true;
        });
    });
    const __default30 = allPass;
    const __default31 = allPass;
    const allPass1 = allPass;
    const _curry14 = _curry1;
    var always = _curry1(function always(val) {
        return function() {
            return val;
        };
    });
    const __default32 = always;
    const __default33 = always;
    const always1 = always;
    const always2 = always;
    const always3 = always;
    const always4 = always;
    const _curry29 = _curry2;
    var and = _curry2(function and(a, b) {
        return a && b;
    });
    const __default34 = and;
    const __default35 = and;
    const and1 = and;
    const and2 = and;
    function XAny(f, xf) {
        this.xf = xf;
        this.f = f;
        this.any = false;
    }
    const _xfBase2 = __default2;
    XAny.prototype['@@transducer/init'] = _xfBase2.init;
    XAny.prototype['@@transducer/result'] = function(result) {
        if (!this.any) {
            result = this.xf['@@transducer/step'](result, false);
        }
        return this.xf['@@transducer/result'](result);
    };
    const _reduced2 = _reduced;
    XAny.prototype['@@transducer/step'] = function(result, input1) {
        if (this.f(input1)) {
            this.any = true;
            result = _reduced2(this.xf['@@transducer/step'](result, true));
        }
        return result;
    };
    const _curry210 = _curry2;
    var _xany = _curry2(function _xany(f, xf) {
        return new XAny(f, xf);
    });
    const __default36 = _xany;
    const __default37 = _xany;
    const _xany1 = _xany;
    const _curry211 = _curry2;
    const _dispatchable3 = _dispatchable;
    var any = _curry2(_dispatchable([
        'any'
    ], _xany, function any(fn, list) {
        var idx = 0;
        while(idx < list.length){
            if (fn(list[idx])) {
                return true;
            }
            idx += 1;
        }
        return false;
    }));
    const __default38 = any;
    const __default39 = any;
    const any1 = any;
    const _curry15 = _curry1;
    const reduce2 = reduce;
    const max2 = max;
    var anyPass = _curry1(function anyPass(preds) {
        return curryN(reduce(max, 0, pluck('length', preds)), function() {
            var idx = 0;
            var len = preds.length;
            while(idx < len){
                if (preds[idx].apply(this, arguments)) {
                    return true;
                }
                idx += 1;
            }
            return false;
        });
    });
    const __default40 = anyPass;
    const __default41 = anyPass;
    const anyPass1 = anyPass;
    function _aperture(n, list) {
        var idx = 0;
        var limit = list.length - (n - 1);
        var acc = new Array(limit >= 0 ? limit : 0);
        while(idx < limit){
            acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
            idx += 1;
        }
        return acc;
    }
    const __default42 = _aperture;
    const __default43 = _aperture;
    const _aperture1 = _aperture;
    function XAperture(n, xf) {
        this.xf = xf;
        this.pos = 0;
        this.full = false;
        this.acc = new Array(n);
    }
    const _xfBase3 = __default2;
    XAperture.prototype['@@transducer/init'] = _xfBase3.init;
    XAperture.prototype['@@transducer/result'] = function(result) {
        this.acc = null;
        return this.xf['@@transducer/result'](result);
    };
    XAperture.prototype['@@transducer/step'] = function(result, input1) {
        this.store(input1);
        return this.full ? this.xf['@@transducer/step'](result, this.getCopy()) : result;
    };
    XAperture.prototype.store = function(input1) {
        this.acc[this.pos] = input1;
        this.pos += 1;
        if (this.pos === this.acc.length) {
            this.pos = 0;
            this.full = true;
        }
    };
    const _concat3 = _concat;
    XAperture.prototype.getCopy = function() {
        return _concat3(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
    };
    const _curry212 = _curry2;
    var _xaperture = _curry2(function _xaperture(n, xf) {
        return new XAperture(n, xf);
    });
    const __default44 = _xaperture;
    const __default45 = _xaperture;
    const _xaperture1 = _xaperture;
    const _curry213 = _curry2;
    const _dispatchable4 = _dispatchable;
    var aperture = _curry2(_dispatchable([], _xaperture, _aperture));
    const __default46 = aperture;
    const __default47 = aperture;
    const aperture1 = aperture;
    const _curry214 = _curry2;
    const _concat4 = _concat;
    var append = _curry2(function append(el, list) {
        return _concat(list, [
            el
        ]);
    });
    const __default48 = append;
    const __default49 = append;
    const append1 = append;
    const _curry215 = _curry2;
    var apply = _curry2(function apply(fn, args1) {
        return fn.apply(this, args1);
    });
    const __default50 = apply;
    const __default51 = apply;
    const apply1 = apply;
    const apply2 = apply;
    const _isArray1 = __default1;
    const keys2 = keys;
    function mapValues(fn, obj) {
        return __default1(obj) ? obj.map(fn) : keys(obj).reduce(function(acc, key) {
            acc[key] = fn(obj[key]);
            return acc;
        }, {
        });
    }
    const _curry16 = _curry1;
    const reduce3 = reduce;
    const max3 = max;
    const _curry17 = _curry1;
    const keys3 = keys;
    var values = _curry1(function values(obj) {
        var props = keys(obj);
        var len = props.length;
        var vals = [];
        var idx = 0;
        while(idx < len){
            vals[idx] = obj[props[idx]];
            idx += 1;
        }
        return vals;
    });
    const __default52 = values;
    const __default53 = values;
    const values1 = values;
    const values2 = values;
    var applySpec = _curry1(function applySpec(spec) {
        spec = mapValues(function(v) {
            return typeof v == 'function' ? v : applySpec(v);
        }, spec);
        return curryN(reduce(max, 0, pluck('length', values(spec))), function() {
            var args1 = arguments;
            return mapValues(function(f) {
                return apply(f, args1);
            }, spec);
        });
    });
    const __default54 = applySpec;
    const __default55 = applySpec;
    const applySpec1 = applySpec;
    const _curry216 = _curry2;
    var applyTo = _curry2(function applyTo(x, f) {
        return f(x);
    });
    const __default56 = applyTo;
    const __default57 = applyTo;
    const applyTo1 = applyTo;
    const _curry32 = _curry3;
    var ascend = _curry3(function ascend(fn, a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
    const __default58 = ascend;
    const __default59 = ascend;
    const ascend1 = ascend;
    const _curry33 = _curry3;
    const assocPath1 = assocPath;
    var assoc = _curry3(function assoc(prop8, val, obj) {
        return assocPath([
            prop8
        ], val, obj);
    });
    const __default60 = assoc;
    const __default61 = assoc;
    const assoc1 = assoc;
    const assoc2 = assoc;
    const assoc3 = assoc;
    const _curry18 = _curry1;
    const _curry217 = _curry2;
    var nAry = _curry2(function nAry(n, fn) {
        switch(n){
            case 0:
                return function() {
                    return fn.call(this);
                };
            case 1:
                return function(a0) {
                    return fn.call(this, a0);
                };
            case 2:
                return function(a0, a1) {
                    return fn.call(this, a0, a1);
                };
            case 3:
                return function(a0, a1, a2) {
                    return fn.call(this, a0, a1, a2);
                };
            case 4:
                return function(a0, a1, a2, a3) {
                    return fn.call(this, a0, a1, a2, a3);
                };
            case 5:
                return function(a0, a1, a2, a3, a4) {
                    return fn.call(this, a0, a1, a2, a3, a4);
                };
            case 6:
                return function(a0, a1, a2, a3, a4, a5) {
                    return fn.call(this, a0, a1, a2, a3, a4, a5);
                };
            case 7:
                return function(a0, a1, a2, a3, a4, a5, a6) {
                    return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
                };
            case 8:
                return function(a0, a1, a2, a3, a4, a5, a6, a7) {
                    return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
                };
            case 9:
                return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                    return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
                };
            case 10:
                return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                    return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
                };
            default:
                throw new Error('First argument to nAry must be a non-negative integer no greater than ten');
        }
    });
    const __default62 = nAry;
    const __default63 = nAry;
    const nAry1 = nAry;
    const nAry2 = nAry;
    const nAry3 = nAry;
    const nAry4 = nAry;
    var binary = _curry1(function binary(fn) {
        return nAry(2, fn);
    });
    const __default64 = binary;
    const __default65 = binary;
    const binary1 = binary;
    const _curry218 = _curry2;
    const _isFunction1 = _isFunction;
    const _curry19 = _curry1;
    const _curry219 = _curry2;
    const _reduce2 = _reduce;
    const ap1 = ap;
    var liftN = _curry2(function liftN(arity, fn) {
        var lifted = curryN(arity, fn);
        return curryN(arity, function() {
            return _reduce(ap, __default25(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
        });
    });
    const __default66 = liftN;
    const __default67 = liftN;
    const liftN1 = liftN;
    const liftN2 = liftN;
    var lift = _curry1(function lift(fn) {
        return liftN(fn.length, fn);
    });
    const __default68 = lift;
    const __default69 = lift;
    const lift1 = lift;
    const lift2 = lift;
    const lift3 = lift;
    const lift4 = lift;
    var both = _curry2(function both(f, g) {
        return _isFunction(f) ? function _both() {
            return f.apply(this, arguments) && g.apply(this, arguments);
        } : lift(and)(f, g);
    });
    const __default70 = both;
    const __default71 = both;
    const both1 = both;
    const _curry110 = _curry1;
    var call = _curry1(function call(fn) {
        return fn.apply(this, Array.prototype.slice.call(arguments, 1));
    });
    const __default72 = call;
    const __default73 = call;
    const call1 = call;
    function _forceReduced(x) {
        return {
            '@@transducer/value': x,
            '@@transducer/reduced': true
        };
    }
    const __default74 = _forceReduced;
    const __default75 = _forceReduced;
    const _forceReduced1 = _forceReduced;
    const _xfBase4 = __default2;
    var preservingReduced = function(xf) {
        return {
            '@@transducer/init': __default2.init,
            '@@transducer/result': function(result) {
                return xf['@@transducer/result'](result);
            },
            '@@transducer/step': function(result, input1) {
                var ret = xf['@@transducer/step'](result, input1);
                return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
            }
        };
    };
    const _isArrayLike1 = _isArrayLike;
    const _reduce3 = _reduce;
    var _flatCat = function _xcat(xf) {
        var rxf = preservingReduced(xf);
        return {
            '@@transducer/init': __default2.init,
            '@@transducer/result': function(result) {
                return rxf['@@transducer/result'](result);
            },
            '@@transducer/step': function(result, input1) {
                return !_isArrayLike(input1) ? _reduce(rxf, result, [
                    input1
                ]) : _reduce(rxf, result, input1);
            }
        };
    };
    const __default76 = _flatCat;
    const __default77 = _flatCat;
    const _flatCat1 = _flatCat;
    const _curry220 = _curry2;
    var _xchain = _curry2(function _xchain(f, xf) {
        return __default25(f, _flatCat(xf));
    });
    const __default78 = _xchain;
    const __default79 = _xchain;
    const _xchain1 = _xchain;
    const _curry221 = _curry2;
    const _dispatchable5 = _dispatchable;
    const _makeFlat1 = _makeFlat;
    var chain = _curry2(_dispatchable([
        'fantasy-land/chain',
        'chain'
    ], _xchain, function chain(fn, monad) {
        if (typeof monad === 'function') {
            return function(x) {
                return fn(monad(x))(x);
            };
        }
        return _makeFlat(false)(__default25(fn, monad));
    }));
    const __default80 = chain;
    const __default81 = chain;
    const chain1 = chain;
    const chain2 = chain;
    const _curry34 = _curry3;
    var clamp = _curry3(function clamp(min, max4, value2) {
        if (min > max4) {
            throw new Error('min must not be greater than max in clamp(min, max, value)');
        }
        return value2 < min ? min : value2 > max4 ? max4 : value2;
    });
    const __default82 = clamp;
    const __default83 = clamp;
    const clamp1 = clamp;
    const _curry111 = _curry1;
    const _clone1 = _clone;
    var clone = _curry1(function clone(value2) {
        return value2 != null && typeof value2.clone === 'function' ? value2.clone() : _clone(value2, [], [], true);
    });
    const __default84 = clone;
    const __default85 = clone;
    const clone1 = clone;
    const _curry222 = _curry2;
    const _reduce4 = _reduce;
    var collectBy = _curry2(function collectBy(fn, list) {
        var group = _reduce(function(o, x) {
            var tag = fn(x);
            if (o[tag] === undefined) {
                o[tag] = [];
            }
            o[tag].push(x);
            return o;
        }, {
        }, list);
        var newList = [];
        for(var tag in group){
            newList.push(group[tag]);
        }
        return newList;
    });
    const __default86 = collectBy;
    const __default87 = collectBy;
    const collectBy1 = collectBy;
    const _curry112 = _curry1;
    var comparator = _curry1(function comparator(pred) {
        return function(a, b) {
            return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
        };
    });
    const __default88 = comparator;
    const __default89 = comparator;
    const comparator1 = comparator;
    const _curry113 = _curry1;
    var not = _curry1(function not(a) {
        return !a;
    });
    const __default90 = not;
    const __default91 = not;
    const not1 = not;
    const not2 = not;
    var complement = lift(not);
    const __default92 = complement;
    const __default93 = complement;
    const complement1 = complement;
    function _pipe(f, g) {
        return function() {
            return g.call(this, f.apply(this, arguments));
        };
    }
    const __default94 = _pipe;
    const __default95 = _pipe;
    const _pipe1 = _pipe;
    const _arity2 = _arity;
    const reduce4 = reduce;
    const tail1 = tail;
    function pipe() {
        if (arguments.length === 0) {
            throw new Error('pipe requires at least one argument');
        }
        return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
    }
    const __default96 = pipe;
    const __default97 = pipe;
    const pipe1 = pipe;
    const pipe2 = pipe;
    const reverse1 = reverse;
    function compose() {
        if (arguments.length === 0) {
            throw new Error('compose requires at least one argument');
        }
        return pipe.apply(this, reverse(arguments));
    }
    const __default98 = compose;
    const __default99 = compose;
    const compose1 = compose;
    const compose2 = compose;
    const _curry223 = _curry2;
    const _curry224 = _curry2;
    const _curry114 = _curry1;
    const _identity1 = _identity;
    var identity = _curry1(_identity);
    const __default100 = identity;
    const __default101 = identity;
    const identity1 = identity;
    const identity2 = identity;
    const identity3 = identity;
    const identity4 = identity;
    const nth2 = nth;
    var head = nth(0);
    const __default102 = head;
    const __default103 = head;
    const head1 = head;
    const head2 = head;
    const tail2 = tail;
    const _arity3 = _arity;
    const _reduce5 = _reduce;
    var pipeWith = _curry2(function pipeWith(xf, list) {
        if (list.length <= 0) {
            return identity;
        }
        var headList = head(list);
        var tailList = tail(list);
        return _arity(headList.length, function() {
            return _reduce(function(result, f) {
                return xf.call(this, f, result);
            }, headList.apply(this, arguments), tailList);
        });
    });
    const __default104 = pipeWith;
    const __default105 = pipeWith;
    const pipeWith1 = pipeWith;
    const pipeWith2 = pipeWith;
    const reverse2 = reverse;
    var composeWith = _curry2(function composeWith(xf, list) {
        return pipeWith.apply(this, [
            xf,
            reverse(list)
        ]);
    });
    const __default106 = composeWith;
    const __default107 = composeWith;
    const composeWith1 = composeWith;
    const _curry225 = _curry2;
    const _isArray2 = __default1;
    const toString2 = toString1;
    const _isString1 = _isString;
    const _isFunction2 = _isFunction;
    var concat = _curry2(function concat(a, b) {
        if (__default1(a)) {
            if (__default1(b)) {
                return a.concat(b);
            }
            throw new TypeError(toString1(b) + ' is not an array');
        }
        if (_isString(a)) {
            if (_isString(b)) {
                return a + b;
            }
            throw new TypeError(toString1(b) + ' is not a string');
        }
        if (a != null && _isFunction(a['fantasy-land/concat'])) {
            return a['fantasy-land/concat'](b);
        }
        if (a != null && _isFunction(a.concat)) {
            return a.concat(b);
        }
        throw new TypeError(toString1(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
    });
    const __default108 = concat;
    const __default109 = concat;
    const concat1 = concat;
    const concat2 = concat;
    const concat3 = concat;
    const _curry115 = _curry1;
    const reduce5 = reduce;
    const max4 = max;
    const _arity4 = _arity;
    var cond = _curry1(function cond(pairs) {
        var arity = reduce(max, 0, __default25(function(pair) {
            return pair[0].length;
        }, pairs));
        return _arity(arity, function() {
            var idx = 0;
            while(idx < pairs.length){
                if (pairs[idx][0].apply(this, arguments)) {
                    return pairs[idx][1].apply(this, arguments);
                }
                idx += 1;
            }
        });
    });
    const __default110 = cond;
    const __default111 = cond;
    const cond1 = cond;
    const _curry116 = _curry1;
    const _curry226 = _curry2;
    const _curry117 = _curry1;
    var curry = _curry1(function curry(fn) {
        return curryN(fn.length, fn);
    });
    const __default112 = curry;
    const __default113 = curry;
    const curry1 = curry;
    const curry2 = curry;
    var constructN = _curry2(function constructN(n, Fn) {
        if (n > 10) {
            throw new Error('Constructor with greater than ten arguments');
        }
        if (n === 0) {
            return function() {
                return new Fn();
            };
        }
        return curry(nAry(n, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
            switch(arguments.length){
                case 1:
                    return new Fn($0);
                case 2:
                    return new Fn($0, $1);
                case 3:
                    return new Fn($0, $1, $2);
                case 4:
                    return new Fn($0, $1, $2, $3);
                case 5:
                    return new Fn($0, $1, $2, $3, $4);
                case 6:
                    return new Fn($0, $1, $2, $3, $4, $5);
                case 7:
                    return new Fn($0, $1, $2, $3, $4, $5, $6);
                case 8:
                    return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
                case 9:
                    return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
                case 10:
                    return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
            }
        }));
    });
    const __default114 = constructN;
    const __default115 = constructN;
    const constructN1 = constructN;
    const constructN2 = constructN;
    var construct = _curry1(function construct(Fn) {
        return constructN(Fn.length, Fn);
    });
    const __default116 = construct;
    const __default117 = construct;
    const construct1 = construct;
    const _curryN2 = _curryN;
    const _dispatchable6 = _dispatchable;
    const _curryN3 = _curryN;
    function XReduceBy(valueFn, valueAcc, keyFn, xf) {
        this.valueFn = valueFn;
        this.valueAcc = valueAcc;
        this.keyFn = keyFn;
        this.xf = xf;
        this.inputs = {
        };
    }
    const _xfBase5 = __default2;
    XReduceBy.prototype['@@transducer/init'] = _xfBase5.init;
    const _has2 = _has;
    XReduceBy.prototype['@@transducer/result'] = function(result) {
        var key;
        for(key in this.inputs){
            if (_has2(key, this.inputs)) {
                result = this.xf['@@transducer/step'](result, this.inputs[key]);
                if (result['@@transducer/reduced']) {
                    result = result['@@transducer/value'];
                    break;
                }
            }
        }
        this.inputs = null;
        return this.xf['@@transducer/result'](result);
    };
    XReduceBy.prototype['@@transducer/step'] = function(result, input1) {
        var key = this.keyFn(input1);
        this.inputs[key] = this.inputs[key] || [
            key,
            this.valueAcc
        ];
        this.inputs[key][1] = this.valueFn(this.inputs[key][1], input1);
        return result;
    };
    var _xreduceBy = _curryN(4, [], function _xreduceBy(valueFn, valueAcc, keyFn, xf) {
        return new XReduceBy(valueFn, valueAcc, keyFn, xf);
    });
    const __default118 = _xreduceBy;
    const __default119 = _xreduceBy;
    const _xreduceBy1 = _xreduceBy;
    const _reduce6 = _reduce;
    const _has3 = _has;
    const _clone2 = _clone;
    var reduceBy = _curryN(4, [], _dispatchable([], _xreduceBy, function reduceBy(valueFn, valueAcc, keyFn, list) {
        return _reduce(function(acc, elt) {
            var key = keyFn(elt);
            acc[key] = valueFn(_has3(key, acc) ? acc[key] : _clone2(valueAcc, [], [], false), elt);
            return acc;
        }, {
        }, list);
    }));
    const __default120 = reduceBy;
    const __default121 = reduceBy;
    const reduceBy1 = reduceBy;
    const reduceBy2 = reduceBy;
    const reduceBy3 = reduceBy;
    const reduceBy4 = reduceBy;
    var countBy = reduceBy(function(acc, elem) {
        return acc + 1;
    }, 0);
    const __default122 = countBy;
    const __default123 = countBy;
    const countBy1 = countBy;
    var dec = add(-1);
    const __default124 = dec;
    const __default125 = dec;
    const dec1 = dec;
    const _curry227 = _curry2;
    var defaultTo = _curry2(function defaultTo(d, v) {
        return v == null || v !== v ? d : v;
    });
    const __default126 = defaultTo;
    const __default127 = defaultTo;
    const defaultTo1 = defaultTo;
    const defaultTo2 = defaultTo;
    const defaultTo3 = defaultTo;
    const _curry35 = _curry3;
    var descend = _curry3(function descend(fn, a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa > bb ? -1 : aa < bb ? 1 : 0;
    });
    const __default128 = descend;
    const __default129 = descend;
    const descend1 = descend;
    const _curry228 = _curry2;
    const _Set1 = _Set;
    var difference = _curry2(function difference(first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        var secondLen = second.length;
        var toFilterOut = new _Set();
        for(var i = 0; i < secondLen; i += 1){
            toFilterOut.add(second[i]);
        }
        while(idx < firstLen){
            if (toFilterOut.add(first[idx])) {
                out[out.length] = first[idx];
            }
            idx += 1;
        }
        return out;
    });
    const __default130 = difference;
    const __default131 = difference;
    const difference1 = difference;
    const difference2 = difference;
    const _curry36 = _curry3;
    const _includesWith1 = _includesWith;
    var differenceWith = _curry3(function differenceWith(pred, first, second) {
        var out = [];
        var idx = 0;
        var firstLen = first.length;
        while(idx < firstLen){
            if (!_includesWith(pred, first[idx], second) && !_includesWith(pred, first[idx], out)) {
                out.push(first[idx]);
            }
            idx += 1;
        }
        return out;
    });
    const __default132 = differenceWith;
    const __default133 = differenceWith;
    const differenceWith1 = differenceWith;
    const differenceWith2 = differenceWith;
    const _curry229 = _curry2;
    const _curry230 = _curry2;
    const _isInteger2 = __default3;
    const _isArray3 = __default1;
    const _curry37 = _curry3;
    var remove = _curry3(function remove(start1, count, list) {
        var result = Array.prototype.slice.call(list, 0);
        result.splice(start1, count);
        return result;
    });
    const __default134 = remove;
    const __default135 = remove;
    const remove1 = remove;
    const remove2 = remove;
    function _dissoc(prop8, obj) {
        if (obj == null) {
            return obj;
        }
        if (__default3(prop8) && __default1(obj)) {
            return remove(prop8, 1, obj);
        }
        var result = {
        };
        for(var p in obj){
            result[p] = obj[p];
        }
        delete result[prop8];
        return result;
    }
    const __default136 = _dissoc;
    const __default137 = _dissoc;
    const _dissoc1 = _dissoc;
    const _isInteger3 = __default3;
    const _isArray4 = __default1;
    function _shallowCloneObject(prop8, obj) {
        if (__default3(prop8) && __default1(obj)) {
            return [].concat(obj);
        }
        var result = {
        };
        for(var p in obj){
            result[p] = obj[p];
        }
        return result;
    }
    var dissocPath = _curry2(function dissocPath(path1, obj) {
        if (obj == null) {
            return obj;
        }
        switch(path1.length){
            case 0:
                return obj;
            case 1:
                return _dissoc(path1[0], obj);
            default:
                var head3 = path1[0];
                var tail3 = Array.prototype.slice.call(path1, 1);
                if (obj[head3] == null) {
                    return _shallowCloneObject(head3, obj);
                } else {
                    return assoc(head3, dissocPath(tail3, obj[head3]), obj);
                }
        }
    });
    const __default138 = dissocPath;
    const __default139 = dissocPath;
    const dissocPath1 = dissocPath;
    const dissocPath2 = dissocPath;
    var dissoc = _curry2(function dissoc(prop8, obj) {
        return dissocPath([
            prop8
        ], obj);
    });
    const __default140 = dissoc;
    const __default141 = dissoc;
    const dissoc1 = dissoc;
    const _curry231 = _curry2;
    var divide = _curry2(function divide(a, b) {
        return a / b;
    });
    const __default142 = divide;
    const __default143 = divide;
    const divide1 = divide;
    function XDrop(n, xf) {
        this.xf = xf;
        this.n = n;
    }
    const _xfBase6 = __default2;
    XDrop.prototype['@@transducer/init'] = _xfBase6.init;
    XDrop.prototype['@@transducer/result'] = _xfBase6.result;
    XDrop.prototype['@@transducer/step'] = function(result, input1) {
        if (this.n > 0) {
            this.n -= 1;
            return result;
        }
        return this.xf['@@transducer/step'](result, input1);
    };
    const _curry232 = _curry2;
    var _xdrop = _curry2(function _xdrop(n, xf) {
        return new XDrop(n, xf);
    });
    const __default144 = _xdrop;
    const __default145 = _xdrop;
    const _xdrop1 = _xdrop;
    const _curry233 = _curry2;
    const _dispatchable7 = _dispatchable;
    const slice1 = slice;
    var drop = _curry2(_dispatchable([
        'drop'
    ], _xdrop, function drop(n, xs) {
        return slice(Math.max(0, n), Infinity, xs);
    }));
    const __default146 = drop;
    const __default147 = drop;
    const drop1 = drop;
    const drop2 = drop;
    const _curry234 = _curry2;
    const _dispatchable8 = _dispatchable;
    const _curry235 = _curry2;
    function XTake(n, xf) {
        this.xf = xf;
        this.n = n;
        this.i = 0;
    }
    const _xfBase7 = __default2;
    XTake.prototype['@@transducer/init'] = _xfBase7.init;
    XTake.prototype['@@transducer/result'] = _xfBase7.result;
    const _reduced3 = _reduced;
    XTake.prototype['@@transducer/step'] = function(result, input1) {
        this.i += 1;
        var ret = this.n === 0 ? result : this.xf['@@transducer/step'](result, input1);
        return this.n >= 0 && this.i >= this.n ? _reduced3(ret) : ret;
    };
    var _xtake = _curry2(function _xtake(n, xf) {
        return new XTake(n, xf);
    });
    const __default148 = _xtake;
    const __default149 = _xtake;
    const _xtake1 = _xtake;
    const slice2 = slice;
    var take = _curry2(_dispatchable([
        'take'
    ], _xtake, function take(n, xs) {
        return slice(0, n < 0 ? Infinity : n, xs);
    }));
    const __default150 = take;
    const __default151 = take;
    const take1 = take;
    const take2 = take;
    const take3 = take;
    function dropLast(n, xs) {
        return take(n < xs.length ? xs.length - n : 0, xs);
    }
    const __default152 = dropLast;
    const __default153 = dropLast;
    const _dropLast = dropLast;
    function XDropLast(n, xf) {
        this.xf = xf;
        this.pos = 0;
        this.full = false;
        this.acc = new Array(n);
    }
    const _xfBase8 = __default2;
    XDropLast.prototype['@@transducer/init'] = _xfBase8.init;
    XDropLast.prototype['@@transducer/result'] = function(result) {
        this.acc = null;
        return this.xf['@@transducer/result'](result);
    };
    XDropLast.prototype['@@transducer/step'] = function(result, input1) {
        if (this.full) {
            result = this.xf['@@transducer/step'](result, this.acc[this.pos]);
        }
        this.store(input1);
        return result;
    };
    XDropLast.prototype.store = function(input1) {
        this.acc[this.pos] = input1;
        this.pos += 1;
        if (this.pos === this.acc.length) {
            this.pos = 0;
            this.full = true;
        }
    };
    const _curry236 = _curry2;
    var _xdropLast = _curry2(function _xdropLast(n, xf) {
        return new XDropLast(n, xf);
    });
    const __default154 = _xdropLast;
    const __default155 = _xdropLast;
    const _xdropLast1 = _xdropLast;
    const _curry237 = _curry2;
    const _dispatchable9 = _dispatchable;
    var dropLast1 = _curry2(_dispatchable([], _xdropLast, dropLast));
    const __default156 = dropLast1;
    const __default157 = dropLast1;
    const dropLast2 = dropLast1;
    const slice3 = slice;
    function dropLastWhile(pred, xs) {
        var idx = xs.length - 1;
        while(idx >= 0 && pred(xs[idx])){
            idx -= 1;
        }
        return slice(0, idx + 1, xs);
    }
    const __default158 = dropLastWhile;
    const __default159 = dropLastWhile;
    const _dropLastWhile = dropLastWhile;
    function XDropLastWhile(fn, xf) {
        this.f = fn;
        this.retained = [];
        this.xf = xf;
    }
    const _xfBase9 = __default2;
    XDropLastWhile.prototype['@@transducer/init'] = _xfBase9.init;
    XDropLastWhile.prototype['@@transducer/result'] = function(result) {
        this.retained = null;
        return this.xf['@@transducer/result'](result);
    };
    XDropLastWhile.prototype['@@transducer/step'] = function(result, input1) {
        return this.f(input1) ? this.retain(result, input1) : this.flush(result, input1);
    };
    const _reduce7 = _reduce;
    XDropLastWhile.prototype.flush = function(result, input1) {
        result = _reduce7(this.xf['@@transducer/step'], result, this.retained);
        this.retained = [];
        return this.xf['@@transducer/step'](result, input1);
    };
    XDropLastWhile.prototype.retain = function(result, input1) {
        this.retained.push(input1);
        return result;
    };
    const _curry238 = _curry2;
    var _xdropLastWhile = _curry2(function _xdropLastWhile(fn, xf) {
        return new XDropLastWhile(fn, xf);
    });
    const __default160 = _xdropLastWhile;
    const __default161 = _xdropLastWhile;
    const _xdropLastWhile1 = _xdropLastWhile;
    const _curry239 = _curry2;
    const _dispatchable10 = _dispatchable;
    var dropLastWhile1 = _curry2(_dispatchable([], _xdropLastWhile, dropLastWhile));
    const __default162 = dropLastWhile1;
    const __default163 = dropLastWhile1;
    const dropLastWhile2 = dropLastWhile1;
    function XDropRepeatsWith(pred, xf) {
        this.xf = xf;
        this.pred = pred;
        this.lastValue = undefined;
        this.seenFirstValue = false;
    }
    const _xfBase10 = __default2;
    XDropRepeatsWith.prototype['@@transducer/init'] = _xfBase10.init;
    XDropRepeatsWith.prototype['@@transducer/result'] = _xfBase10.result;
    XDropRepeatsWith.prototype['@@transducer/step'] = function(result, input1) {
        var sameAsLast = false;
        if (!this.seenFirstValue) {
            this.seenFirstValue = true;
        } else if (this.pred(this.lastValue, input1)) {
            sameAsLast = true;
        }
        this.lastValue = input1;
        return sameAsLast ? result : this.xf['@@transducer/step'](result, input1);
    };
    const _curry240 = _curry2;
    var _xdropRepeatsWith = _curry2(function _xdropRepeatsWith(pred, xf) {
        return new XDropRepeatsWith(pred, xf);
    });
    const __default164 = _xdropRepeatsWith;
    const __default165 = _xdropRepeatsWith;
    const _xdropRepeatsWith1 = _xdropRepeatsWith;
    const _xdropRepeatsWith2 = _xdropRepeatsWith;
    const _curry118 = _curry1;
    const _dispatchable11 = _dispatchable;
    const equals1 = equals;
    const _curry241 = _curry2;
    const _dispatchable12 = _dispatchable;
    const nth3 = nth;
    var last = nth(-1);
    const __default166 = last;
    const __default167 = last;
    const last1 = last;
    const last2 = last;
    var dropRepeatsWith = _curry2(_dispatchable([], _xdropRepeatsWith, function dropRepeatsWith(pred, list) {
        var result = [];
        var idx = 1;
        var len = list.length;
        if (len !== 0) {
            result[0] = list[0];
            while(idx < len){
                if (!pred(last(result), list[idx])) {
                    result[result.length] = list[idx];
                }
                idx += 1;
            }
        }
        return result;
    }));
    const __default168 = dropRepeatsWith;
    const __default169 = dropRepeatsWith;
    const dropRepeatsWith1 = dropRepeatsWith;
    const dropRepeatsWith2 = dropRepeatsWith;
    var dropRepeats = _curry1(_dispatchable([], _xdropRepeatsWith(equals), dropRepeatsWith(equals)));
    const __default170 = dropRepeats;
    const __default171 = dropRepeats;
    const dropRepeats1 = dropRepeats;
    function XDropWhile(f, xf) {
        this.xf = xf;
        this.f = f;
    }
    const _xfBase11 = __default2;
    XDropWhile.prototype['@@transducer/init'] = _xfBase11.init;
    XDropWhile.prototype['@@transducer/result'] = _xfBase11.result;
    XDropWhile.prototype['@@transducer/step'] = function(result, input1) {
        if (this.f) {
            if (this.f(input1)) {
                return result;
            }
            this.f = null;
        }
        return this.xf['@@transducer/step'](result, input1);
    };
    const _curry242 = _curry2;
    var _xdropWhile = _curry2(function _xdropWhile(f, xf) {
        return new XDropWhile(f, xf);
    });
    const __default172 = _xdropWhile;
    const __default173 = _xdropWhile;
    const _xdropWhile1 = _xdropWhile;
    const _curry243 = _curry2;
    const _dispatchable13 = _dispatchable;
    const slice4 = slice;
    var dropWhile = _curry2(_dispatchable([
        'dropWhile'
    ], _xdropWhile, function dropWhile(pred, xs) {
        var idx = 0;
        var len = xs.length;
        while(idx < len && pred(xs[idx])){
            idx += 1;
        }
        return slice(idx, Infinity, xs);
    }));
    const __default174 = dropWhile;
    const __default175 = dropWhile;
    const dropWhile1 = dropWhile;
    const _curry244 = _curry2;
    const _isFunction3 = _isFunction;
    const _curry245 = _curry2;
    var or = _curry2(function or(a, b) {
        return a || b;
    });
    const __default176 = or;
    const __default177 = or;
    const or1 = or;
    const or2 = or;
    var either = _curry2(function either(f, g) {
        return _isFunction(f) ? function _either() {
            return f.apply(this, arguments) || g.apply(this, arguments);
        } : lift(or)(f, g);
    });
    const __default178 = either;
    const __default179 = either;
    const either1 = either;
    function _isTypedArray(val) {
        var type1 = Object.prototype.toString.call(val);
        return type1 === '[object Uint8ClampedArray]' || type1 === '[object Int8Array]' || type1 === '[object Uint8Array]' || type1 === '[object Int16Array]' || type1 === '[object Uint16Array]' || type1 === '[object Int32Array]' || type1 === '[object Uint32Array]' || type1 === '[object Float32Array]' || type1 === '[object Float64Array]' || type1 === '[object BigInt64Array]' || type1 === '[object BigUint64Array]';
    }
    const __default180 = _isTypedArray;
    const __default181 = _isTypedArray;
    const _isTypedArray1 = _isTypedArray;
    const _curry119 = _curry1;
    const _isArray5 = __default1;
    const _isString2 = _isString;
    const _isObject1 = _isObject;
    const _isArguments1 = _isArguments;
    var empty = _curry1(function empty(x) {
        return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : __default1(x) ? [] : _isString(x) ? '' : _isObject(x) ? {
        } : _isArguments(x) ? function() {
            return arguments;
        }() : _isTypedArray(x) ? x.constructor.from('') : void 0;
    });
    const __default182 = empty;
    const __default183 = empty;
    const empty1 = empty;
    const empty2 = empty;
    const _curry246 = _curry2;
    const equals2 = equals;
    const _curry247 = _curry2;
    var takeLast = _curry2(function takeLast(n, xs) {
        return drop(n >= 0 ? xs.length - n : 0, xs);
    });
    const __default184 = takeLast;
    const __default185 = takeLast;
    const takeLast1 = takeLast;
    const takeLast2 = takeLast;
    var endsWith = _curry2(function(suffix, list) {
        return equals(takeLast(suffix.length, list), suffix);
    });
    const __default186 = endsWith;
    const __default187 = endsWith;
    const endsWith1 = endsWith;
    const _curry38 = _curry3;
    const equals3 = equals;
    var eqBy = _curry3(function eqBy(f, x, y) {
        return equals(f(x), f(y));
    });
    const __default188 = eqBy;
    const __default189 = eqBy;
    const eqBy1 = eqBy;
    const _curry39 = _curry3;
    const equals4 = equals;
    var eqProps = _curry3(function eqProps(prop8, obj1, obj2) {
        return equals(obj1[prop8], obj2[prop8]);
    });
    const __default190 = eqProps;
    const __default191 = eqProps;
    const eqProps1 = eqProps;
    const _curry248 = _curry2;
    const _isObject2 = _isObject;
    const _isArray6 = __default1;
    var evolve = _curry2(function evolve(transformations, object) {
        if (!_isObject(object) && !__default1(object)) {
            return object;
        }
        var result = object instanceof Array ? [] : {
        };
        var transformation, key, type1;
        for(key in object){
            transformation = transformations[key];
            type1 = typeof transformation;
            result[key] = type1 === 'function' ? transformation(object[key]) : transformation && type1 === 'object' ? evolve(transformation, object[key]) : object[key];
        }
        return result;
    });
    const __default192 = evolve;
    const __default193 = evolve;
    const evolve1 = evolve;
    function XFind(f, xf) {
        this.xf = xf;
        this.f = f;
        this.found = false;
    }
    const _xfBase12 = __default2;
    XFind.prototype['@@transducer/init'] = _xfBase12.init;
    XFind.prototype['@@transducer/result'] = function(result) {
        if (!this.found) {
            result = this.xf['@@transducer/step'](result, void 0);
        }
        return this.xf['@@transducer/result'](result);
    };
    const _reduced4 = _reduced;
    XFind.prototype['@@transducer/step'] = function(result, input1) {
        if (this.f(input1)) {
            this.found = true;
            result = _reduced4(this.xf['@@transducer/step'](result, input1));
        }
        return result;
    };
    const _curry249 = _curry2;
    var _xfind = _curry2(function _xfind(f, xf) {
        return new XFind(f, xf);
    });
    const __default194 = _xfind;
    const __default195 = _xfind;
    const _xfind1 = _xfind;
    const _curry250 = _curry2;
    const _dispatchable14 = _dispatchable;
    var find1 = _curry2(_dispatchable([
        'find'
    ], _xfind, function find1(fn, list) {
        var idx = 0;
        var len = list.length;
        while(idx < len){
            if (fn(list[idx])) {
                return list[idx];
            }
            idx += 1;
        }
    }));
    const __default196 = find1;
    const __default197 = find1;
    const find2 = find1;
    function XFindIndex(f, xf) {
        this.xf = xf;
        this.f = f;
        this.idx = -1;
        this.found = false;
    }
    const _xfBase13 = __default2;
    XFindIndex.prototype['@@transducer/init'] = _xfBase13.init;
    XFindIndex.prototype['@@transducer/result'] = function(result) {
        if (!this.found) {
            result = this.xf['@@transducer/step'](result, -1);
        }
        return this.xf['@@transducer/result'](result);
    };
    const _reduced5 = _reduced;
    XFindIndex.prototype['@@transducer/step'] = function(result, input1) {
        this.idx += 1;
        if (this.f(input1)) {
            this.found = true;
            result = _reduced5(this.xf['@@transducer/step'](result, this.idx));
        }
        return result;
    };
    const _curry251 = _curry2;
    var _xfindIndex = _curry2(function _xfindIndex(f, xf) {
        return new XFindIndex(f, xf);
    });
    const __default198 = _xfindIndex;
    const __default199 = _xfindIndex;
    const _xfindIndex1 = _xfindIndex;
    const _curry252 = _curry2;
    const _dispatchable15 = _dispatchable;
    var findIndex = _curry2(_dispatchable([], _xfindIndex, function findIndex(fn, list) {
        var idx = 0;
        var len = list.length;
        while(idx < len){
            if (fn(list[idx])) {
                return idx;
            }
            idx += 1;
        }
        return -1;
    }));
    const __default200 = findIndex;
    const __default201 = findIndex;
    const findIndex1 = findIndex;
    function XFindLast(f, xf) {
        this.xf = xf;
        this.f = f;
    }
    const _xfBase14 = __default2;
    XFindLast.prototype['@@transducer/init'] = _xfBase14.init;
    XFindLast.prototype['@@transducer/result'] = function(result) {
        return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.last));
    };
    XFindLast.prototype['@@transducer/step'] = function(result, input1) {
        if (this.f(input1)) {
            this.last = input1;
        }
        return result;
    };
    const _curry253 = _curry2;
    var _xfindLast = _curry2(function _xfindLast(f, xf) {
        return new XFindLast(f, xf);
    });
    const __default202 = _xfindLast;
    const __default203 = _xfindLast;
    const _xfindLast1 = _xfindLast;
    const _curry254 = _curry2;
    const _dispatchable16 = _dispatchable;
    var findLast = _curry2(_dispatchable([], _xfindLast, function findLast(fn, list) {
        var idx = list.length - 1;
        while(idx >= 0){
            if (fn(list[idx])) {
                return list[idx];
            }
            idx -= 1;
        }
    }));
    const __default204 = findLast;
    const __default205 = findLast;
    const findLast1 = findLast;
    function XFindLastIndex(f, xf) {
        this.xf = xf;
        this.f = f;
        this.idx = -1;
        this.lastIdx = -1;
    }
    const _xfBase15 = __default2;
    XFindLastIndex.prototype['@@transducer/init'] = _xfBase15.init;
    XFindLastIndex.prototype['@@transducer/result'] = function(result) {
        return this.xf['@@transducer/result'](this.xf['@@transducer/step'](result, this.lastIdx));
    };
    XFindLastIndex.prototype['@@transducer/step'] = function(result, input1) {
        this.idx += 1;
        if (this.f(input1)) {
            this.lastIdx = this.idx;
        }
        return result;
    };
    const _curry255 = _curry2;
    var _xfindLastIndex = _curry2(function _xfindLastIndex(f, xf) {
        return new XFindLastIndex(f, xf);
    });
    const __default206 = _xfindLastIndex;
    const __default207 = _xfindLastIndex;
    const _xfindLastIndex1 = _xfindLastIndex;
    const _curry256 = _curry2;
    const _dispatchable17 = _dispatchable;
    var findLastIndex = _curry2(_dispatchable([], _xfindLastIndex, function findLastIndex(fn, list) {
        var idx = list.length - 1;
        while(idx >= 0){
            if (fn(list[idx])) {
                return idx;
            }
            idx -= 1;
        }
        return -1;
    }));
    const __default208 = findLastIndex;
    const __default209 = findLastIndex;
    const findLastIndex1 = findLastIndex;
    const _curry120 = _curry1;
    const _makeFlat2 = _makeFlat;
    var flatten = _curry1(_makeFlat(true));
    const __default210 = flatten;
    const __default211 = flatten;
    const flatten1 = flatten;
    const _curry121 = _curry1;
    var flip = _curry1(function flip(fn) {
        return curryN(fn.length, function(a, b) {
            var args1 = Array.prototype.slice.call(arguments, 0);
            args1[0] = b;
            args1[1] = a;
            return fn.apply(this, args1);
        });
    });
    const __default212 = flip;
    const __default213 = flip;
    const flip1 = flip;
    const flip2 = flip;
    const flip3 = flip;
    const flip4 = flip;
    const _curry257 = _curry2;
    const _checkForMethod1 = _checkForMethod;
    var forEach = _curry2(_checkForMethod('forEach', function forEach(fn, list) {
        var len = list.length;
        var idx = 0;
        while(idx < len){
            fn(list[idx]);
            idx += 1;
        }
        return list;
    }));
    const __default214 = forEach;
    const __default215 = forEach;
    const forEach1 = forEach;
    const _curry258 = _curry2;
    const keys4 = keys;
    var forEachObjIndexed = _curry2(function forEachObjIndexed(fn, obj) {
        var keyList = keys(obj);
        var idx = 0;
        while(idx < keyList.length){
            var key = keyList[idx];
            fn(obj[key], key, obj);
            idx += 1;
        }
        return obj;
    });
    const __default216 = forEachObjIndexed;
    const __default217 = forEachObjIndexed;
    const forEachObjIndexed1 = forEachObjIndexed;
    const _curry122 = _curry1;
    var fromPairs = _curry1(function fromPairs(pairs) {
        var result = {
        };
        var idx = 0;
        while(idx < pairs.length){
            result[pairs[idx][0]] = pairs[idx][1];
            idx += 1;
        }
        return result;
    });
    const __default218 = fromPairs;
    const __default219 = fromPairs;
    const fromPairs1 = fromPairs;
    const _curry259 = _curry2;
    const _checkForMethod2 = _checkForMethod;
    var groupBy = _curry2(_checkForMethod('groupBy', reduceBy(function(acc, item) {
        if (acc == null) {
            acc = [];
        }
        acc.push(item);
        return acc;
    }, null)));
    const __default220 = groupBy;
    const __default221 = groupBy;
    const groupBy1 = groupBy;
    const _curry260 = _curry2;
    var groupWith = _curry2(function(fn, list) {
        var res = [];
        var idx = 0;
        var len = list.length;
        while(idx < len){
            var nextidx = idx + 1;
            while(nextidx < len && fn(list[nextidx - 1], list[nextidx])){
                nextidx += 1;
            }
            res.push(list.slice(idx, nextidx));
            idx = nextidx;
        }
        return res;
    });
    const __default222 = groupWith;
    const __default223 = groupWith;
    const groupWith1 = groupWith;
    const _curry261 = _curry2;
    var gt = _curry2(function gt(a, b) {
        return a > b;
    });
    const __default224 = gt;
    const __default225 = gt;
    const gt1 = gt;
    const _curry262 = _curry2;
    var gte = _curry2(function gte(a, b) {
        return a >= b;
    });
    const __default226 = gte;
    const __default227 = gte;
    const gte1 = gte;
    const _curry263 = _curry2;
    const _curry264 = _curry2;
    const isNil1 = isNil;
    const _has4 = _has;
    var hasPath = _curry2(function hasPath(_path, obj) {
        if (_path.length === 0 || isNil(obj)) {
            return false;
        }
        var val = obj;
        var idx = 0;
        while(idx < _path.length){
            if (!isNil(val) && _has(_path[idx], val)) {
                val = val[_path[idx]];
                idx += 1;
            } else {
                return false;
            }
        }
        return true;
    });
    const __default228 = hasPath;
    const __default229 = hasPath;
    const hasPath1 = hasPath;
    const hasPath2 = hasPath;
    var has = _curry2(function has(prop8, obj) {
        return hasPath([
            prop8
        ], obj);
    });
    const __default230 = has;
    const __default231 = has;
    const has1 = has;
    const _curry265 = _curry2;
    const isNil2 = isNil;
    var hasIn = _curry2(function hasIn(prop8, obj) {
        if (isNil(obj)) {
            return false;
        }
        return prop8 in obj;
    });
    const __default232 = hasIn;
    const __default233 = hasIn;
    const hasIn1 = hasIn;
    const _curry266 = _curry2;
    const _objectIs1 = __default4;
    var identical = _curry2(__default4);
    const __default234 = identical;
    const __default235 = identical;
    const identical1 = identical;
    const _curry310 = _curry3;
    var ifElse = _curry3(function ifElse(condition, onTrue, onFalse) {
        return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
            return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
        });
    });
    const __default236 = ifElse;
    const __default237 = ifElse;
    const ifElse1 = ifElse;
    var inc = add(1);
    const __default238 = inc;
    const __default239 = inc;
    const inc1 = inc;
    const _curry267 = _curry2;
    const _includes1 = _includes;
    var includes = _curry2(_includes);
    const __default240 = includes;
    const __default241 = includes;
    const includes1 = includes;
    var indexBy = reduceBy(function(acc, elem) {
        return elem;
    }, null);
    const __default242 = indexBy;
    const __default243 = indexBy;
    const indexBy1 = indexBy;
    const _curry268 = _curry2;
    const _isArray7 = __default1;
    const _indexOf1 = _indexOf;
    var indexOf = _curry2(function indexOf(target, xs) {
        return typeof xs.indexOf === 'function' && !__default1(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
    });
    const __default244 = indexOf;
    const __default245 = indexOf;
    const indexOf1 = indexOf;
    const slice5 = slice;
    var init = slice(0, -1);
    const __default246 = init;
    const __default247 = init;
    const init1 = init;
    const _curry311 = _curry3;
    const _filter1 = _filter;
    const _includesWith2 = _includesWith;
    var innerJoin = _curry3(function innerJoin(pred, xs, ys) {
        return _filter(function(x) {
            return _includesWith(pred, x, ys);
        }, xs);
    });
    const __default248 = innerJoin;
    const __default249 = innerJoin;
    const innerJoin1 = innerJoin;
    const _curry312 = _curry3;
    var insert = _curry3(function insert(idx, elt, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        var result = Array.prototype.slice.call(list, 0);
        result.splice(idx, 0, elt);
        return result;
    });
    const __default250 = insert;
    const __default251 = insert;
    const insert1 = insert;
    const _curry313 = _curry3;
    var insertAll = _curry3(function insertAll(idx, elts, list) {
        idx = idx < list.length && idx >= 0 ? idx : list.length;
        return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
    });
    const __default252 = insertAll;
    const __default253 = insertAll;
    const insertAll1 = insertAll;
    const _curry269 = _curry2;
    const _curry270 = _curry2;
    const _Set2 = _Set;
    var uniqBy = _curry2(function uniqBy(fn, list) {
        var set = new _Set();
        var result = [];
        var idx = 0;
        var appliedItem, item;
        while(idx < list.length){
            item = list[idx];
            appliedItem = fn(item);
            if (set.add(appliedItem)) {
                result.push(item);
            }
            idx += 1;
        }
        return result;
    });
    const __default254 = uniqBy;
    const __default255 = uniqBy;
    const uniqBy1 = uniqBy;
    const uniqBy2 = uniqBy;
    var uniq = uniqBy(identity);
    const __default256 = uniq;
    const __default257 = uniq;
    const uniq1 = uniq;
    const uniq2 = uniq;
    const uniq3 = uniq;
    const _filter2 = _filter;
    const _includes2 = _includes;
    var intersection = _curry2(function intersection(list1, list2) {
        var lookupList, filteredList;
        if (list1.length > list2.length) {
            lookupList = list1;
            filteredList = list2;
        } else {
            lookupList = list2;
            filteredList = list1;
        }
        return uniq(_filter(flip(_includes)(lookupList), filteredList));
    });
    const __default258 = intersection;
    const __default259 = intersection;
    const intersection1 = intersection;
    const _curry271 = _curry2;
    const _checkForMethod3 = _checkForMethod;
    var intersperse = _curry2(_checkForMethod('intersperse', function intersperse(separator, list) {
        var out = [];
        var idx = 0;
        var length = list.length;
        while(idx < length){
            if (idx === length - 1) {
                out.push(list[idx]);
            } else {
                out.push(list[idx], separator);
            }
            idx += 1;
        }
        return out;
    }));
    const __default260 = intersperse;
    const __default261 = intersperse;
    const intersperse1 = intersperse;
    const _identity2 = _identity;
    var _stepCatArray = {
        '@@transducer/init': Array,
        '@@transducer/step': function(xs, x) {
            xs.push(x);
            return xs;
        },
        '@@transducer/result': _identity
    };
    var _stepCatString = {
        '@@transducer/init': String,
        '@@transducer/step': function(a, b) {
            return a + b;
        },
        '@@transducer/result': _identity
    };
    const _objectAssign1 = __default5;
    const _isArrayLike2 = _isArrayLike;
    const _curry272 = _curry2;
    var objOf = _curry2(function objOf(key, val) {
        var obj = {
        };
        obj[key] = val;
        return obj;
    });
    const __default262 = objOf;
    const __default263 = objOf;
    const objOf1 = objOf;
    const objOf2 = objOf;
    var _stepCatObject = {
        '@@transducer/init': Object,
        '@@transducer/step': function(result, input1) {
            return __default5(result, _isArrayLike(input1) ? objOf(input1[0], input1[1]) : input1);
        },
        '@@transducer/result': _identity
    };
    const _isTransformer1 = _isTransformer;
    function _stepCat(obj) {
        if (_isTransformer(obj)) {
            return obj;
        }
        if (_isArrayLike(obj)) {
            return _stepCatArray;
        }
        if (typeof obj === 'string') {
            return _stepCatString;
        }
        if (typeof obj === 'object') {
            return _stepCatObject;
        }
        throw new Error('Cannot create transformer for ' + obj);
    }
    const __default264 = _stepCat;
    const __default265 = _stepCat;
    const _stepCat1 = _stepCat;
    const _curry314 = _curry3;
    const _isTransformer2 = _isTransformer;
    const _reduce8 = _reduce;
    const _clone3 = _clone;
    var into = _curry3(function into(acc, xf, list) {
        return _isTransformer(acc) ? _reduce(xf(acc), acc['@@transducer/init'](), list) : _reduce(xf(_stepCat(acc)), _clone(acc, [], [], false), list);
    });
    const __default266 = into;
    const __default267 = into;
    const into1 = into;
    const _curry123 = _curry1;
    const keys5 = keys;
    const _has5 = _has;
    var invert = _curry1(function invert(obj) {
        var props = keys(obj);
        var len = props.length;
        var idx = 0;
        var out = {
        };
        while(idx < len){
            var key = props[idx];
            var val = obj[key];
            var list = _has(val, out) ? out[val] : out[val] = [];
            list[list.length] = key;
            idx += 1;
        }
        return out;
    });
    const __default268 = invert;
    const __default269 = invert;
    const invert1 = invert;
    const _curry124 = _curry1;
    const keys6 = keys;
    var invertObj = _curry1(function invertObj(obj) {
        var props = keys(obj);
        var len = props.length;
        var idx = 0;
        var out = {
        };
        while(idx < len){
            var key = props[idx];
            out[obj[key]] = key;
            idx += 1;
        }
        return out;
    });
    const __default270 = invertObj;
    const __default271 = invertObj;
    const invertObj1 = invertObj;
    const _curry273 = _curry2;
    const _isFunction4 = _isFunction;
    const toString3 = toString1;
    var invoker = _curry2(function invoker(arity, method) {
        return curryN(arity + 1, function() {
            var target = arguments[arity];
            if (target != null && _isFunction(target[method])) {
                return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
            }
            throw new TypeError(toString1(target) + ' does not have a method named "' + method + '"');
        });
    });
    const __default272 = invoker;
    const __default273 = invoker;
    const invoker1 = invoker;
    const invoker2 = invoker;
    const invoker3 = invoker;
    const invoker4 = invoker;
    const invoker5 = invoker;
    const _curry274 = _curry2;
    var is = _curry2(function is(Ctor, val) {
        return val != null && val.constructor === Ctor || val instanceof Ctor;
    });
    const __default274 = is;
    const __default275 = is;
    const is1 = is;
    const is2 = is;
    const _curry125 = _curry1;
    const equals5 = equals;
    var isEmpty = _curry1(function isEmpty(x) {
        return x != null && equals(x, empty(x));
    });
    const __default276 = isEmpty;
    const __default277 = isEmpty;
    const isEmpty1 = isEmpty;
    var join2 = invoker(1, 'join');
    const __default278 = join2;
    const __default279 = join2;
    const join3 = join2;
    const _curry275 = _curry2;
    const reduce6 = reduce;
    const max5 = max;
    const _map2 = _map;
    var converge = _curry2(function converge(after, fns) {
        return curryN(reduce(max, 0, pluck('length', fns)), function() {
            var args1 = arguments;
            var context = this;
            return after.apply(context, _map(function(fn) {
                return fn.apply(context, args1);
            }, fns));
        });
    });
    const __default280 = converge;
    const __default281 = converge;
    const converge1 = converge;
    const converge2 = converge;
    const _curry126 = _curry1;
    var juxt = _curry1(function juxt(fns) {
        return converge(function() {
            return Array.prototype.slice.call(arguments, 0);
        }, fns);
    });
    const __default282 = juxt;
    const __default283 = juxt;
    const juxt1 = juxt;
    const juxt2 = juxt;
    const _curry127 = _curry1;
    var keysIn = _curry1(function keysIn(obj) {
        var prop8;
        var ks = [];
        for(prop8 in obj){
            ks[ks.length] = prop8;
        }
        return ks;
    });
    const __default284 = keysIn;
    const __default285 = keysIn;
    const keysIn1 = keysIn;
    const _curry276 = _curry2;
    const _isArray8 = __default1;
    const equals6 = equals;
    var lastIndexOf = _curry2(function lastIndexOf(target, xs) {
        if (typeof xs.lastIndexOf === 'function' && !__default1(xs)) {
            return xs.lastIndexOf(target);
        } else {
            var idx = xs.length - 1;
            while(idx >= 0){
                if (equals(xs[idx], target)) {
                    return idx;
                }
                idx -= 1;
            }
            return -1;
        }
    });
    const __default286 = lastIndexOf;
    const __default287 = lastIndexOf;
    const lastIndexOf1 = lastIndexOf;
    const _curry128 = _curry1;
    const _isNumber1 = _isNumber;
    var length = _curry1(function length(list) {
        return list != null && _isNumber(list.length) ? list.length : NaN;
    });
    const __default288 = length;
    const __default289 = length;
    const length1 = length;
    const length2 = length;
    const _curry277 = _curry2;
    var lens = _curry2(function lens(getter, setter) {
        return function(toFunctorFn) {
            return function(target) {
                return __default25(function(focus) {
                    return setter(focus, target);
                }, toFunctorFn(getter(target)));
            };
        };
    });
    const __default290 = lens;
    const __default291 = lens;
    const lens1 = lens;
    const lens2 = lens;
    const lens3 = lens;
    const lens4 = lens;
    const _curry129 = _curry1;
    const nth4 = nth;
    const _curry315 = _curry3;
    var update = _curry3(function update(idx, x, list) {
        return adjust(idx, always(x), list);
    });
    const __default292 = update;
    const __default293 = update;
    const update1 = update;
    const update2 = update;
    var lensIndex = _curry1(function lensIndex(n) {
        return lens(nth(n), update(n));
    });
    const __default294 = lensIndex;
    const __default295 = lensIndex;
    const lensIndex1 = lensIndex;
    const _curry130 = _curry1;
    const _curry278 = _curry2;
    const _curry279 = _curry2;
    const _isInteger4 = __default3;
    const nth5 = nth;
    var paths = _curry2(function paths(pathsArray, obj) {
        return pathsArray.map(function(paths1) {
            var val = obj;
            var idx = 0;
            var p;
            while(idx < paths1.length){
                if (val == null) {
                    return;
                }
                p = paths1[idx];
                val = _isInteger4(p) ? nth5(p, val) : val[p];
                idx += 1;
            }
            return val;
        });
    });
    const __default296 = paths;
    const __default297 = paths;
    const paths1 = paths;
    const paths2 = paths;
    var path1 = _curry2(function path1(pathAr, obj) {
        return paths([
            pathAr
        ], obj)[0];
    });
    const __default298 = path1;
    const __default299 = path1;
    const path2 = path1;
    const path3 = path1;
    const path4 = path1;
    const path5 = path1;
    const path6 = path1;
    const path7 = path1;
    const assocPath2 = assocPath;
    var lensPath = _curry1(function lensPath(p) {
        return lens(path1(p), assocPath(p));
    });
    const __default300 = lensPath;
    const __default301 = lensPath;
    const lensPath1 = lensPath;
    const _curry131 = _curry1;
    var lensProp = _curry1(function lensProp(k) {
        return lens(prop(k), assoc(k));
    });
    const __default302 = lensProp;
    const __default303 = lensProp;
    const lensProp1 = lensProp;
    const _curry280 = _curry2;
    var lt = _curry2(function lt(a, b) {
        return a < b;
    });
    const __default304 = lt;
    const __default305 = lt;
    const lt1 = lt;
    const _curry281 = _curry2;
    var lte = _curry2(function lte(a, b) {
        return a <= b;
    });
    const __default306 = lte;
    const __default307 = lte;
    const lte1 = lte;
    const _curry316 = _curry3;
    var mapAccum = _curry3(function mapAccum(fn, acc, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        var tuple = [
            acc
        ];
        while(idx < len){
            tuple = fn(tuple[0], list[idx]);
            result[idx] = tuple[1];
            idx += 1;
        }
        return [
            tuple[0],
            result
        ];
    });
    const __default308 = mapAccum;
    const __default309 = mapAccum;
    const mapAccum1 = mapAccum;
    const _curry317 = _curry3;
    var mapAccumRight = _curry3(function mapAccumRight(fn, acc, list) {
        var idx = list.length - 1;
        var result = [];
        var tuple = [
            acc
        ];
        while(idx >= 0){
            tuple = fn(tuple[0], list[idx]);
            result[idx] = tuple[1];
            idx -= 1;
        }
        return [
            tuple[0],
            result
        ];
    });
    const __default310 = mapAccumRight;
    const __default311 = mapAccumRight;
    const mapAccumRight1 = mapAccumRight;
    const _curry282 = _curry2;
    const _reduce9 = _reduce;
    const keys7 = keys;
    var mapObjIndexed = _curry2(function mapObjIndexed(fn, obj) {
        return _reduce(function(acc, key) {
            acc[key] = fn(obj[key], key, obj);
            return acc;
        }, {
        }, keys(obj));
    });
    const __default312 = mapObjIndexed;
    const __default313 = mapObjIndexed;
    const mapObjIndexed1 = mapObjIndexed;
    const _curry283 = _curry2;
    var match = _curry2(function match(rx, str) {
        return str.match(rx) || [];
    });
    const __default314 = match;
    const __default315 = match;
    const match1 = match;
    const _curry284 = _curry2;
    const _isInteger5 = __default3;
    var mathMod = _curry2(function mathMod(m, p) {
        if (!__default3(m)) {
            return NaN;
        }
        if (!__default3(p) || p < 1) {
            return NaN;
        }
        return (m % p + p) % p;
    });
    const __default316 = mathMod;
    const __default317 = mathMod;
    const mathMod1 = mathMod;
    const _curry318 = _curry3;
    var maxBy = _curry3(function maxBy(f, a, b) {
        return f(b) > f(a) ? b : a;
    });
    const __default318 = maxBy;
    const __default319 = maxBy;
    const maxBy1 = maxBy;
    const _curry132 = _curry1;
    const reduce7 = reduce;
    var sum = reduce(add, 0);
    const __default320 = sum;
    const __default321 = sum;
    const sum1 = sum;
    const sum2 = sum;
    var mean = _curry1(function mean(list) {
        return sum(list) / list.length;
    });
    const __default322 = mean;
    const __default323 = mean;
    const mean1 = mean;
    const mean2 = mean;
    const _curry133 = _curry1;
    var median = _curry1(function median(list) {
        var len = list.length;
        if (len === 0) {
            return NaN;
        }
        var width = 2 - len % 2;
        var idx = (len - width) / 2;
        return mean(Array.prototype.slice.call(list, 0).sort(function(a, b) {
            return a < b ? -1 : a > b ? 1 : 0;
        }).slice(idx, idx + width));
    });
    const __default324 = median;
    const __default325 = median;
    const median1 = median;
    const _curry285 = _curry2;
    const _arity5 = _arity;
    const _has6 = _has;
    var memoizeWith = _curry2(function memoizeWith(mFn, fn) {
        var cache = {
        };
        return _arity(fn.length, function() {
            var key = mFn.apply(this, arguments);
            if (!_has(key, cache)) {
                cache[key] = fn.apply(this, arguments);
            }
            return cache[key];
        });
    });
    const __default326 = memoizeWith;
    const __default327 = memoizeWith;
    const memoizeWith1 = memoizeWith;
    const _curry134 = _curry1;
    const _objectAssign2 = __default5;
    var mergeAll = _curry1(function mergeAll(list) {
        return __default5.apply(null, [
            {
            }
        ].concat(list));
    });
    const __default328 = mergeAll;
    const __default329 = mergeAll;
    const mergeAll1 = mergeAll;
    const _curry286 = _curry2;
    const mergeDeepWithKey1 = mergeDeepWithKey;
    var mergeDeepLeft = _curry2(function mergeDeepLeft(lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
            return lVal;
        }, lObj, rObj);
    });
    const __default330 = mergeDeepLeft;
    const __default331 = mergeDeepLeft;
    const mergeDeepLeft1 = mergeDeepLeft;
    const _curry287 = _curry2;
    const mergeDeepWithKey2 = mergeDeepWithKey;
    var mergeDeepRight = _curry2(function mergeDeepRight(lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
            return rVal;
        }, lObj, rObj);
    });
    const __default332 = mergeDeepRight;
    const __default333 = mergeDeepRight;
    const mergeDeepRight1 = mergeDeepRight;
    const _curry288 = _curry2;
    const __default334 = _curry2((f, o)=>(props)=>f.call(this, mergeDeepRight(o, props))
    );
    const __default335 = __default334;
    const partialObject = __default334;
    const mergeDeepRight2 = mergeDeepRight;
    const _curry319 = _curry3;
    const mergeDeepWithKey3 = mergeDeepWithKey;
    var mergeDeepWith = _curry3(function mergeDeepWith(fn, lObj, rObj) {
        return mergeDeepWithKey(function(k, lVal, rVal) {
            return fn(lVal, rVal);
        }, lObj, rObj);
    });
    const __default336 = mergeDeepWith;
    const __default337 = mergeDeepWith;
    const mergeDeepWith1 = mergeDeepWith;
    const _curry289 = _curry2;
    const _objectAssign3 = __default5;
    var mergeLeft = _curry2(function mergeLeft(l, r) {
        return __default5({
        }, r, l);
    });
    const __default338 = mergeLeft;
    const __default339 = mergeLeft;
    const mergeLeft1 = mergeLeft;
    const _curry290 = _curry2;
    const _objectAssign4 = __default5;
    var mergeRight = _curry2(function mergeRight(l, r) {
        return __default5({
        }, l, r);
    });
    const __default340 = mergeRight;
    const __default341 = mergeRight;
    const mergeRight1 = mergeRight;
    const _curry320 = _curry3;
    const mergeWithKey1 = mergeWithKey;
    var mergeWith = _curry3(function mergeWith(fn, l, r) {
        return mergeWithKey(function(_, _l, _r) {
            return fn(_l, _r);
        }, l, r);
    });
    const __default342 = mergeWith;
    const __default343 = mergeWith;
    const mergeWith1 = mergeWith;
    const _curry291 = _curry2;
    var min = _curry2(function min(a, b) {
        return b < a ? b : a;
    });
    const __default344 = min;
    const __default345 = min;
    const min1 = min;
    const _curry321 = _curry3;
    var minBy = _curry3(function minBy(f, a, b) {
        return f(b) < f(a) ? b : a;
    });
    const __default346 = minBy;
    const __default347 = minBy;
    const minBy1 = minBy;
    const _curry322 = _curry3;
    const _curry323 = _curry3;
    const _isObject3 = _isObject;
    const _isArray9 = __default1;
    const _has7 = _has;
    const _isInteger6 = __default3;
    const _isArray10 = __default1;
    function _modify(prop8, fn, obj) {
        if (__default3(prop8) && __default1(obj)) {
            var arr = [].concat(obj);
            arr[prop8] = fn(arr[prop8]);
            return arr;
        }
        var result = {
        };
        for(var p in obj){
            result[p] = obj[p];
        }
        result[prop8] = fn(result[prop8]);
        return result;
    }
    const __default348 = _modify;
    const __default349 = _modify;
    const _modify1 = _modify;
    const _assoc1 = _assoc;
    var modifyPath = _curry3(function modifyPath(path8, fn, object) {
        if (!_isObject(object) && !__default1(object) || path8.length === 0) {
            return object;
        }
        var idx = path8[0];
        if (!_has(idx, object)) {
            return object;
        }
        if (path8.length === 1) {
            return _modify(idx, fn, object);
        }
        var val = modifyPath(Array.prototype.slice.call(path8, 1), fn, object[idx]);
        if (val === object[idx]) {
            return object;
        }
        return _assoc(idx, val, object);
    });
    const __default350 = modifyPath;
    const __default351 = modifyPath;
    const modifyPath1 = modifyPath;
    const modifyPath2 = modifyPath;
    var modify = _curry3(function modify(prop8, fn, object) {
        return modifyPath([
            prop8
        ], fn, object);
    });
    const __default352 = modify;
    const __default353 = modify;
    const modify1 = modify;
    const _curry292 = _curry2;
    var modulo = _curry2(function modulo(a, b) {
        return a % b;
    });
    const __default354 = modulo;
    const __default355 = modulo;
    const modulo1 = modulo;
    const _curry324 = _curry3;
    var move = _curry3(function(from, to, list) {
        var length3 = list.length;
        var result = list.slice();
        var positiveFrom = from < 0 ? length3 + from : from;
        var positiveTo = to < 0 ? length3 + to : to;
        var item = result.splice(positiveFrom, 1);
        return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
    });
    const __default356 = move;
    const __default357 = move;
    const move1 = move;
    const _curry293 = _curry2;
    var multiply = _curry2(function multiply(a, b) {
        return a * b;
    });
    const __default358 = multiply;
    const __default359 = multiply;
    const multiply1 = multiply;
    const multiply2 = multiply;
    const _curry135 = _curry1;
    var negate = _curry1(function negate(n) {
        return -n;
    });
    const __default360 = negate;
    const __default361 = negate;
    const negate1 = negate;
    const _curry294 = _curry2;
    const _complement1 = _complement;
    var none = _curry2(function none(fn, input1) {
        return all(_complement(fn), input1);
    });
    const __default362 = none;
    const __default363 = none;
    const none1 = none;
    const _curry136 = _curry1;
    const nth6 = nth;
    var nthArg = _curry1(function nthArg(n) {
        var arity = n < 0 ? 1 : n + 1;
        return curryN(arity, function() {
            return nth(n, arguments);
        });
    });
    const __default364 = nthArg;
    const __default365 = nthArg;
    const nthArg1 = nthArg;
    const _curry325 = _curry3;
    var o = _curry3(function o(f, g, x) {
        return f(g(x));
    });
    const __default366 = o;
    const __default367 = o;
    const o1 = o;
    function _of(x) {
        return [
            x
        ];
    }
    const __default368 = _of;
    const __default369 = _of;
    const _of1 = _of;
    const _curry137 = _curry1;
    var of = _curry1(_of);
    const __default370 = of;
    const __default371 = of;
    const of1 = of;
    const _curry295 = _curry2;
    var omit = _curry2(function omit(names, obj) {
        var result = {
        };
        var index = {
        };
        var idx = 0;
        var len = names.length;
        while(idx < len){
            index[names[idx]] = 1;
            idx += 1;
        }
        for(var prop8 in obj){
            if (!index.hasOwnProperty(prop8)) {
                result[prop8] = obj[prop8];
            }
        }
        return result;
    });
    const __default372 = omit;
    const __default373 = omit;
    const omit1 = omit;
    const curryN18 = _curryN;
    var on = _curryN(4, [], function on(f, g, a, b) {
        return f(g(a), g(b));
    });
    const __default374 = on;
    const __default375 = on;
    const on1 = on;
    const _curry138 = _curry1;
    const _arity6 = _arity;
    var once = _curry1(function once(fn) {
        var called = false;
        var result;
        return _arity(fn.length, function() {
            if (called) {
                return result;
            }
            called = true;
            result = fn.apply(this, arguments);
            return result;
        });
    });
    const __default376 = once;
    const __default377 = once;
    const once1 = once;
    const _curry296 = _curry2;
    const _assertPromise1 = _assertPromise;
    var otherwise = _curry2(function otherwise(f, p) {
        _assertPromise('otherwise', p);
        return p.then(null, f);
    });
    const __default378 = otherwise;
    const __default379 = otherwise;
    const otherwise1 = otherwise;
    var Identity = function(x) {
        return {
            value: x,
            map: function(f) {
                return Identity(f(x));
            }
        };
    };
    const _curry326 = _curry3;
    var over = _curry3(function over(lens5, f, x) {
        return lens5(function(y) {
            return Identity(f(y));
        })(x).value;
    });
    const __default380 = over;
    const __default381 = over;
    const over1 = over;
    const over2 = over;
    const _curry297 = _curry2;
    var pair = _curry2(function pair(fst, snd) {
        return [
            fst,
            snd
        ];
    });
    const __default382 = pair;
    const __default383 = pair;
    const pair1 = pair;
    const _createPartialApplicator1 = _createPartialApplicator;
    const _concat5 = _concat;
    var partial = _createPartialApplicator(_concat);
    const __default384 = partial;
    const __default385 = partial;
    const partial1 = partial;
    const _createPartialApplicator2 = _createPartialApplicator;
    const _concat6 = _concat;
    var partialRight = _createPartialApplicator(flip(_concat));
    const __default386 = partialRight;
    const __default387 = partialRight;
    const partialRight1 = partialRight;
    const _curry298 = _curry2;
    const _dispatchable18 = _dispatchable;
    const _curry299 = _curry2;
    function XFilter(f, xf) {
        this.xf = xf;
        this.f = f;
    }
    const _xfBase16 = __default2;
    XFilter.prototype['@@transducer/init'] = _xfBase16.init;
    XFilter.prototype['@@transducer/result'] = _xfBase16.result;
    XFilter.prototype['@@transducer/step'] = function(result, input1) {
        return this.f(input1) ? this.xf['@@transducer/step'](result, input1) : result;
    };
    var _xfilter = _curry2(function _xfilter(f, xf) {
        return new XFilter(f, xf);
    });
    const __default388 = _xfilter;
    const __default389 = _xfilter;
    const _xfilter1 = _xfilter;
    const _isObject4 = _isObject;
    const _reduce10 = _reduce;
    const keys8 = keys;
    const _filter3 = _filter;
    var filter = _curry2(_dispatchable([
        'fantasy-land/filter',
        'filter'
    ], _xfilter, function(pred, filterable) {
        return _isObject(filterable) ? _reduce(function(acc, key) {
            if (pred(filterable[key])) {
                acc[key] = filterable[key];
            }
            return acc;
        }, {
        }, keys(filterable)) : _filter(pred, filterable);
    }));
    const __default390 = filter;
    const __default391 = filter;
    const filter1 = filter;
    const filter2 = filter;
    const filter3 = filter;
    const _curry2100 = _curry2;
    const _complement2 = _complement;
    var reject = _curry2(function reject(pred, filterable) {
        return filter(_complement(pred), filterable);
    });
    const __default392 = reject;
    const __default393 = reject;
    const reject1 = __default393;
    const reject2 = __default393;
    const reject3 = __default393;
    var partition = juxt([
        filter,
        __default393
    ]);
    const __default394 = partition;
    const __default395 = partition;
    const partition1 = partition;
    const _curry327 = _curry3;
    const equals7 = equals;
    var pathEq = _curry3(function pathEq(_path, val, obj) {
        return equals(path1(_path, obj), val);
    });
    const __default396 = pathEq;
    const __default397 = pathEq;
    const pathEq1 = pathEq;
    const _curry328 = _curry3;
    var pathOr = _curry3(function pathOr(d, p, obj) {
        return defaultTo(d, path1(p, obj));
    });
    const __default398 = pathOr;
    const __default399 = pathOr;
    const pathOr1 = pathOr;
    const _curry329 = _curry3;
    var pathSatisfies = _curry3(function pathSatisfies(pred, propPath, obj) {
        return pred(path1(propPath, obj));
    });
    const __default400 = pathSatisfies;
    const __default401 = pathSatisfies;
    const pathSatisfies1 = pathSatisfies;
    const _curry2101 = _curry2;
    var pick = _curry2(function pick(names, obj) {
        var result = {
        };
        var idx = 0;
        while(idx < names.length){
            if (names[idx] in obj) {
                result[names[idx]] = obj[names[idx]];
            }
            idx += 1;
        }
        return result;
    });
    const __default402 = pick;
    const __default403 = pick;
    const pick1 = pick;
    const _curry2102 = _curry2;
    var pickAll = _curry2(function pickAll(names, obj) {
        var result = {
        };
        var idx = 0;
        var len = names.length;
        while(idx < len){
            var name = names[idx];
            result[name] = obj[name];
            idx += 1;
        }
        return result;
    });
    const __default404 = pickAll;
    const __default405 = pickAll;
    const pickAll1 = pickAll;
    const pickAll2 = pickAll;
    const _curry2103 = _curry2;
    var pickBy = _curry2(function pickBy(test, obj) {
        var result = {
        };
        for(var prop8 in obj){
            if (test(obj[prop8], prop8, obj)) {
                result[prop8] = obj[prop8];
            }
        }
        return result;
    });
    const __default406 = pickBy;
    const __default407 = pickBy;
    const pickBy1 = pickBy;
    const reduce8 = reduce;
    var product = reduce(multiply, 1);
    const __default408 = product;
    const __default409 = product;
    const product1 = product;
    const _curry2104 = _curry2;
    var useWith = _curry2(function useWith(fn, transformers) {
        return curryN(transformers.length, function() {
            var args1 = [];
            var idx = 0;
            while(idx < transformers.length){
                args1.push(transformers[idx].call(this, arguments[idx]));
                idx += 1;
            }
            return fn.apply(this, args1.concat(Array.prototype.slice.call(arguments, transformers.length)));
        });
    });
    const __default410 = useWith;
    const __default411 = useWith;
    const useWith1 = useWith;
    const useWith2 = useWith;
    const _map3 = _map;
    var project = useWith(_map, [
        pickAll,
        identity
    ]);
    const __default412 = project;
    const __default413 = project;
    const project1 = project;
    function _promap(f, g, profunctor) {
        return function(x) {
            return g(profunctor(f(x)));
        };
    }
    const __default414 = _promap;
    const __default415 = _promap;
    const _promap1 = _promap;
    const _promap2 = _promap;
    function XPromap(f, g, xf) {
        this.xf = xf;
        this.f = f;
        this.g = g;
    }
    const _xfBase17 = __default2;
    XPromap.prototype['@@transducer/init'] = _xfBase17.init;
    XPromap.prototype['@@transducer/result'] = _xfBase17.result;
    XPromap.prototype['@@transducer/step'] = function(result, input1) {
        return this.xf['@@transducer/step'](result, _promap2(this.f, this.g, input1));
    };
    const _curry330 = _curry3;
    var _xpromap = _curry3(function _xpromap(f, g, xf) {
        return new XPromap(f, g, xf);
    });
    const __default416 = _xpromap;
    const __default417 = _xpromap;
    const _xpromap1 = _xpromap;
    const _curry331 = _curry3;
    const _dispatchable19 = _dispatchable;
    var promap = _curry3(_dispatchable([
        'fantasy-land/promap',
        'promap'
    ], _xpromap, _promap));
    const __default418 = promap;
    const __default419 = promap;
    const promap1 = promap;
    const _curry332 = _curry3;
    const equals8 = equals;
    var propEq = _curry3(function propEq(name, val, obj) {
        return equals(val, prop(name, obj));
    });
    const __default420 = propEq;
    const __default421 = propEq;
    const propEq1 = propEq;
    const _curry333 = _curry3;
    var propIs = _curry3(function propIs(type1, name, obj) {
        return is(type1, prop(name, obj));
    });
    const __default422 = propIs;
    const __default423 = propIs;
    const propIs1 = propIs;
    const _curry334 = _curry3;
    var propOr = _curry3(function propOr(val, p, obj) {
        return defaultTo(val, prop(p, obj));
    });
    const __default424 = propOr;
    const __default425 = propOr;
    const propOr1 = propOr;
    const _curry335 = _curry3;
    var propSatisfies = _curry3(function propSatisfies(pred, name, obj) {
        return pred(prop(name, obj));
    });
    const __default426 = propSatisfies;
    const __default427 = propSatisfies;
    const propSatisfies1 = propSatisfies;
    const _curry2105 = _curry2;
    var props = _curry2(function props(ps, obj) {
        return ps.map(function(p) {
            return path1([
                p
            ], obj);
        });
    });
    const __default428 = props;
    const __default429 = props;
    const props1 = props;
    const _curry2106 = _curry2;
    const _isNumber2 = _isNumber;
    var range = _curry2(function range(from, to) {
        if (!(_isNumber(from) && _isNumber(to))) {
            throw new TypeError('Both arguments to range must be numbers');
        }
        var result = [];
        var n = from;
        while(n < to){
            result.push(n);
            n += 1;
        }
        return result;
    });
    const __default430 = range;
    const __default431 = range;
    const range1 = range;
    const _curryN4 = _curryN;
    const _reduce11 = _reduce;
    const _reduced6 = _reduced;
    var reduceWhile = _curryN(4, [], function _reduceWhile(pred, fn, a, list) {
        return _reduce(function(acc, x) {
            return pred(acc, x) ? fn(acc, x) : _reduced(acc);
        }, a, list);
    });
    const __default432 = reduceWhile;
    const __default433 = reduceWhile;
    const reduceWhile1 = reduceWhile;
    const _curry139 = _curry1;
    const _reduced7 = _reduced;
    var reduced = _curry1(_reduced);
    const __default434 = reduced;
    const __default435 = reduced;
    const reduced1 = reduced;
    const _curry2107 = _curry2;
    const _curry2108 = _curry2;
    var times = _curry2(function times(fn, n) {
        var len = Number(n);
        var idx = 0;
        var list;
        if (len < 0 || isNaN(len)) {
            throw new RangeError('n must be a non-negative number');
        }
        list = new Array(len);
        while(idx < len){
            list[idx] = fn(idx);
            idx += 1;
        }
        return list;
    });
    const __default436 = times;
    const __default437 = times;
    const times1 = times;
    const times2 = times;
    var repeat = _curry2(function repeat(value2, n) {
        return times(always(value2), n);
    });
    const __default438 = repeat;
    const __default439 = repeat;
    const repeat1 = repeat;
    const _curry336 = _curry3;
    var replace = _curry3(function replace(regex, replacement, str) {
        return str.replace(regex, replacement);
    });
    const __default440 = replace;
    const __default441 = replace;
    const replace1 = replace;
    const _curry337 = _curry3;
    var scan = _curry3(function scan(fn, acc, list) {
        var idx = 0;
        var len = list.length;
        var result = [
            acc
        ];
        while(idx < len){
            acc = fn(acc, list[idx]);
            result[idx + 1] = acc;
            idx += 1;
        }
        return result;
    });
    const __default442 = scan;
    const __default443 = scan;
    const scan1 = scan;
    const _curry2109 = _curry2;
    const _concat7 = _concat;
    var prepend = _curry2(function prepend(el, list) {
        return _concat([
            el
        ], list);
    });
    const __default444 = prepend;
    const __default445 = prepend;
    const prepend1 = prepend;
    const prepend2 = prepend;
    const _curry338 = _curry3;
    var reduceRight = _curry3(function reduceRight(fn, acc, list) {
        var idx = list.length - 1;
        while(idx >= 0){
            acc = fn(list[idx], acc);
            idx -= 1;
        }
        return acc;
    });
    const __default446 = reduceRight;
    const __default447 = reduceRight;
    const reduceRight1 = reduceRight;
    const reduceRight2 = reduceRight;
    const _curry2110 = _curry2;
    const ap2 = ap;
    var sequence = _curry2(function sequence(of2, traversable) {
        return typeof traversable.sequence === 'function' ? traversable.sequence(of2) : reduceRight(function(x, acc) {
            return ap(__default25(prepend, x), acc);
        }, of2([]), traversable);
    });
    const __default448 = sequence;
    const __default449 = sequence;
    const sequence1 = sequence;
    const sequence2 = sequence;
    const _curry339 = _curry3;
    var set = _curry3(function set(lens5, v, x) {
        return over(lens5, always(v), x);
    });
    const __default450 = set;
    const __default451 = set;
    const set1 = set;
    const _curry2111 = _curry2;
    var sort = _curry2(function sort(comparator2, list) {
        return Array.prototype.slice.call(list, 0).sort(comparator2);
    });
    const __default452 = sort;
    const __default453 = sort;
    const sort1 = sort;
    const _curry2112 = _curry2;
    var sortBy = _curry2(function sortBy(fn, list) {
        return Array.prototype.slice.call(list, 0).sort(function(a, b) {
            var aa = fn(a);
            var bb = fn(b);
            return aa < bb ? -1 : aa > bb ? 1 : 0;
        });
    });
    const __default454 = sortBy;
    const __default455 = sortBy;
    const sortBy1 = sortBy;
    const _curry2113 = _curry2;
    var sortWith = _curry2(function sortWith(fns, list) {
        return Array.prototype.slice.call(list, 0).sort(function(a, b) {
            var result = 0;
            var i = 0;
            while(result === 0 && i < fns.length){
                result = fns[i](a, b);
                i += 1;
            }
            return result;
        });
    });
    const __default456 = sortWith;
    const __default457 = sortWith;
    const sortWith1 = sortWith;
    var split = invoker(1, 'split');
    const __default458 = split;
    const __default459 = split;
    const split1 = split;
    const _curry2114 = _curry2;
    const slice6 = slice;
    var splitAt = _curry2(function splitAt(index, array) {
        return [
            slice(0, index, array),
            slice(index, length(array), array)
        ];
    });
    const __default460 = splitAt;
    const __default461 = splitAt;
    const splitAt1 = splitAt;
    const _curry2115 = _curry2;
    const slice7 = slice;
    var splitEvery = _curry2(function splitEvery(n, list) {
        if (n <= 0) {
            throw new Error('First argument to splitEvery must be a positive integer');
        }
        var result = [];
        var idx = 0;
        while(idx < list.length){
            result.push(slice(idx, idx += n, list));
        }
        return result;
    });
    const __default462 = splitEvery;
    const __default463 = splitEvery;
    const splitEvery1 = splitEvery;
    const _curry2116 = _curry2;
    var splitWhen = _curry2(function splitWhen(pred, list) {
        var idx = 0;
        var len = list.length;
        var prefix = [];
        while(idx < len && !pred(list[idx])){
            prefix.push(list[idx]);
            idx += 1;
        }
        return [
            prefix,
            Array.prototype.slice.call(list, idx)
        ];
    });
    const __default464 = splitWhen;
    const __default465 = splitWhen;
    const splitWhen1 = splitWhen;
    const _curryN5 = _curryN;
    var splitWhenever = _curryN(2, [], function splitWhenever(pred, list) {
        var acc = [];
        var curr = [];
        for(var i = 0; i < list.length; i = i + 1){
            if (!pred(list[i])) {
                curr.push(list[i]);
            }
            if ((i < list.length - 1 && pred(list[i + 1]) || i === list.length - 1) && curr.length > 0) {
                acc.push(curr);
                curr = [];
            }
        }
        return acc;
    });
    const __default466 = splitWhenever;
    const __default467 = splitWhenever;
    const splitWhenever1 = splitWhenever;
    const _curry2117 = _curry2;
    const equals9 = equals;
    var startsWith = _curry2(function(prefix, list) {
        return equals(take(prefix.length, list), prefix);
    });
    const __default468 = startsWith;
    const __default469 = startsWith;
    const startsWith1 = startsWith;
    const _curry2118 = _curry2;
    var subtract = _curry2(function subtract(a, b) {
        return Number(a) - Number(b);
    });
    const __default470 = subtract;
    const __default471 = subtract;
    const subtract1 = subtract;
    const _curry2119 = _curry2;
    var symmetricDifference = _curry2(function symmetricDifference(list1, list2) {
        return concat(difference(list1, list2), difference(list2, list1));
    });
    const __default472 = symmetricDifference;
    const __default473 = symmetricDifference;
    const symmetricDifference1 = symmetricDifference;
    const _curry340 = _curry3;
    var symmetricDifferenceWith = _curry3(function symmetricDifferenceWith(pred, list1, list2) {
        return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
    });
    const __default474 = symmetricDifferenceWith;
    const __default475 = symmetricDifferenceWith;
    const symmetricDifferenceWith1 = symmetricDifferenceWith;
    const _curry2120 = _curry2;
    const slice8 = slice;
    var takeLastWhile = _curry2(function takeLastWhile(fn, xs) {
        var idx = xs.length - 1;
        while(idx >= 0 && fn(xs[idx])){
            idx -= 1;
        }
        return slice(idx + 1, Infinity, xs);
    });
    const __default476 = takeLastWhile;
    const __default477 = takeLastWhile;
    const takeLastWhile1 = takeLastWhile;
    function XTakeWhile(f, xf) {
        this.xf = xf;
        this.f = f;
    }
    const _xfBase18 = __default2;
    XTakeWhile.prototype['@@transducer/init'] = _xfBase18.init;
    XTakeWhile.prototype['@@transducer/result'] = _xfBase18.result;
    const _reduced8 = _reduced;
    XTakeWhile.prototype['@@transducer/step'] = function(result, input1) {
        return this.f(input1) ? this.xf['@@transducer/step'](result, input1) : _reduced8(result);
    };
    const _curry2121 = _curry2;
    var _xtakeWhile = _curry2(function _xtakeWhile(f, xf) {
        return new XTakeWhile(f, xf);
    });
    const __default478 = _xtakeWhile;
    const __default479 = _xtakeWhile;
    const _xtakeWhile1 = _xtakeWhile;
    const _curry2122 = _curry2;
    const _dispatchable20 = _dispatchable;
    const slice9 = slice;
    var takeWhile = _curry2(_dispatchable([
        'takeWhile'
    ], _xtakeWhile, function takeWhile(fn, xs) {
        var idx = 0;
        var len = xs.length;
        while(idx < len && fn(xs[idx])){
            idx += 1;
        }
        return slice(0, idx, xs);
    }));
    const __default480 = takeWhile;
    const __default481 = takeWhile;
    const takeWhile1 = takeWhile;
    function XTap(f, xf) {
        this.xf = xf;
        this.f = f;
    }
    const _xfBase19 = __default2;
    XTap.prototype['@@transducer/init'] = _xfBase19.init;
    XTap.prototype['@@transducer/result'] = _xfBase19.result;
    XTap.prototype['@@transducer/step'] = function(result, input1) {
        this.f(input1);
        return this.xf['@@transducer/step'](result, input1);
    };
    const _curry2123 = _curry2;
    var _xtap = _curry2(function _xtap(f, xf) {
        return new XTap(f, xf);
    });
    const __default482 = _xtap;
    const __default483 = _xtap;
    const _xtap1 = _xtap;
    const _curry2124 = _curry2;
    const _dispatchable21 = _dispatchable;
    var tap = _curry2(_dispatchable([], _xtap, function tap(fn, x) {
        fn(x);
        return x;
    }));
    const __default484 = tap;
    const __default485 = tap;
    const tap1 = tap;
    function _isRegExp(x) {
        return Object.prototype.toString.call(x) === '[object RegExp]';
    }
    const __default486 = _isRegExp;
    const __default487 = _isRegExp;
    const _isRegExp1 = _isRegExp;
    const _curry2125 = _curry2;
    const toString4 = toString1;
    const _cloneRegExp1 = _cloneRegExp;
    var test = _curry2(function test(pattern, str) {
        if (!_isRegExp(pattern)) {
            throw new TypeError('‘test’ requires a value of type RegExp as its first argument; received ' + toString1(pattern));
        }
        return _cloneRegExp(pattern).test(str);
    });
    const __default488 = test;
    const __default489 = test;
    const test1 = test;
    const _curry2126 = _curry2;
    const _assertPromise2 = _assertPromise;
    var andThen = _curry2(function andThen(f, p) {
        _assertPromise('andThen', p);
        return p.then(f);
    });
    const __default490 = andThen;
    const __default491 = andThen;
    const andThen1 = andThen;
    var toLower = invoker(0, 'toLowerCase');
    const __default492 = toLower;
    const __default493 = toLower;
    const toLower1 = toLower;
    const _curry140 = _curry1;
    const _has8 = _has;
    var toPairs = _curry1(function toPairs(obj) {
        var pairs = [];
        for(var prop8 in obj){
            if (_has(prop8, obj)) {
                pairs[pairs.length] = [
                    prop8,
                    obj[prop8]
                ];
            }
        }
        return pairs;
    });
    const __default494 = toPairs;
    const __default495 = toPairs;
    const toPairs1 = toPairs;
    const _curry141 = _curry1;
    var toPairsIn = _curry1(function toPairsIn(obj) {
        var pairs = [];
        for(var prop8 in obj){
            pairs[pairs.length] = [
                prop8,
                obj[prop8]
            ];
        }
        return pairs;
    });
    const __default496 = toPairsIn;
    const __default497 = toPairsIn;
    const toPairsIn1 = toPairsIn;
    var toUpper = invoker(0, 'toUpperCase');
    const __default498 = toUpper;
    const __default499 = toUpper;
    const toUpper1 = toUpper;
    function XWrap(fn) {
        this.f = fn;
    }
    XWrap.prototype['@@transducer/init'] = function() {
        throw new Error('init not implemented on XWrap');
    };
    XWrap.prototype['@@transducer/result'] = function(acc) {
        return acc;
    };
    XWrap.prototype['@@transducer/step'] = function(acc, x) {
        return this.f(acc, x);
    };
    function _xwrap1(fn) {
        return new XWrap(fn);
    }
    const __default500 = _xwrap1;
    const __default501 = _xwrap1;
    const _xwrap2 = _xwrap1;
    const _reduce12 = _reduce;
    var transduce = curryN(4, function transduce(xf, fn, acc, list) {
        return _reduce(xf(typeof fn === 'function' ? _xwrap1(fn) : fn), acc, list);
    });
    const __default502 = transduce;
    const __default503 = transduce;
    const transduce1 = transduce;
    const _curry142 = _curry1;
    var transpose = _curry1(function transpose(outerlist) {
        var i = 0;
        var result = [];
        while(i < outerlist.length){
            var innerlist = outerlist[i];
            var j = 0;
            while(j < innerlist.length){
                if (typeof result[j] === 'undefined') {
                    result[j] = [];
                }
                result[j].push(innerlist[j]);
                j += 1;
            }
            i += 1;
        }
        return result;
    });
    const __default504 = transpose;
    const __default505 = transpose;
    const transpose1 = transpose;
    const _curry341 = _curry3;
    var traverse = _curry3(function traverse(of2, f, traversable) {
        return typeof traversable['fantasy-land/traverse'] === 'function' ? traversable['fantasy-land/traverse'](f, of2) : typeof traversable.traverse === 'function' ? traversable.traverse(f, of2) : sequence(of2, __default25(f, traversable));
    });
    const __default506 = traverse;
    const __default507 = traverse;
    const traverse1 = traverse;
    var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
    var zeroWidth = '\u200b';
    var hasProtoTrim = typeof String.prototype.trim === 'function';
    const _curry143 = _curry1;
    var trim = !hasProtoTrim || (ws.trim() || !zeroWidth.trim()) ? _curry1(function trim(str) {
        var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
        var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
        return str.replace(beginRx, '').replace(endRx, '');
    }) : _curry1(function trim(str) {
        return str.trim();
    });
    const __default508 = trim;
    const __default509 = trim;
    const trim1 = trim;
    const _curry2127 = _curry2;
    const _arity7 = _arity;
    const _concat8 = _concat;
    var tryCatch = _curry2(function _tryCatch(tryer, catcher) {
        return _arity(tryer.length, function() {
            try {
                return tryer.apply(this, arguments);
            } catch (e) {
                return catcher.apply(this, _concat([
                    e
                ], arguments));
            }
        });
    });
    const __default510 = tryCatch;
    const __default511 = tryCatch;
    const tryCatch1 = tryCatch;
    const _curry144 = _curry1;
    var unapply = _curry1(function unapply(fn) {
        return function() {
            return fn(Array.prototype.slice.call(arguments, 0));
        };
    });
    const __default512 = unapply;
    const __default513 = unapply;
    const unapply1 = unapply;
    const _curry145 = _curry1;
    var unary = _curry1(function unary(fn) {
        return nAry(1, fn);
    });
    const __default514 = unary;
    const __default515 = unary;
    const unary1 = unary;
    const _curry2128 = _curry2;
    var uncurryN = _curry2(function uncurryN(depth, fn) {
        return curryN(depth, function() {
            var currentDepth = 1;
            var value2 = fn;
            var idx = 0;
            var endIdx;
            while(currentDepth <= depth && typeof value2 === 'function'){
                endIdx = currentDepth === depth ? arguments.length : idx + value2.length;
                value2 = value2.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
                currentDepth += 1;
                idx = endIdx;
            }
            return value2;
        });
    });
    const __default516 = uncurryN;
    const __default517 = uncurryN;
    const uncurryN1 = uncurryN;
    const _curry2129 = _curry2;
    var unfold = _curry2(function unfold(fn, seed) {
        var pair2 = fn(seed);
        var result = [];
        while(pair2 && pair2.length){
            result[result.length] = pair2[0];
            pair2 = fn(pair2[1]);
        }
        return result;
    });
    const __default518 = unfold;
    const __default519 = unfold;
    const unfold1 = unfold;
    const _curry2130 = _curry2;
    const _concat9 = _concat;
    var union = _curry2(compose(uniq, _concat));
    const __default520 = union;
    const __default521 = union;
    const union1 = union;
    const _curry342 = _curry3;
    const _curry2131 = _curry2;
    const _includesWith3 = _includesWith;
    var uniqWith = _curry2(function uniqWith(pred, list) {
        var idx = 0;
        var len = list.length;
        var result = [];
        var item;
        while(idx < len){
            item = list[idx];
            if (!_includesWith(pred, item, result)) {
                result[result.length] = item;
            }
            idx += 1;
        }
        return result;
    });
    const __default522 = uniqWith;
    const __default523 = uniqWith;
    const uniqWith1 = uniqWith;
    const uniqWith2 = uniqWith;
    const _concat10 = _concat;
    var unionWith = _curry3(function unionWith(pred, list1, list2) {
        return uniqWith(pred, _concat(list1, list2));
    });
    const __default524 = unionWith;
    const __default525 = unionWith;
    const unionWith1 = unionWith;
    const _curry343 = _curry3;
    var unless = _curry3(function unless(pred, whenFalseFn, x) {
        return pred(x) ? x : whenFalseFn(x);
    });
    const __default526 = unless;
    const __default527 = unless;
    const unless1 = unless;
    const _identity3 = _identity;
    var unnest = chain(_identity);
    const __default528 = unnest;
    const __default529 = unnest;
    const unnest1 = unnest;
    const _curry344 = _curry3;
    var until = _curry3(function until(pred, fn, init2) {
        var val = init2;
        while(!pred(val)){
            val = fn(val);
        }
        return val;
    });
    const __default530 = until;
    const __default531 = until;
    const until1 = until;
    const _curry146 = _curry1;
    var valuesIn = _curry1(function valuesIn(obj) {
        var prop8;
        var vs = [];
        for(prop8 in obj){
            vs[vs.length] = obj[prop8];
        }
        return vs;
    });
    const __default532 = valuesIn;
    const __default533 = valuesIn;
    const valuesIn1 = valuesIn;
    var Const = function(x) {
        return {
            value: x,
            'fantasy-land/map': function() {
                return this;
            }
        };
    };
    const _curry2132 = _curry2;
    var view = _curry2(function view(lens5, x) {
        return lens5(Const)(x).value;
    });
    const __default534 = view;
    const __default535 = view;
    const view1 = view;
    const _curry345 = _curry3;
    var when = _curry3(function when(pred, whenTrueFn, x) {
        return pred(x) ? whenTrueFn(x) : x;
    });
    const __default536 = when;
    const __default537 = when;
    const when1 = when;
    const _curry2133 = _curry2;
    const _has9 = _has;
    var where = _curry2(function where(spec, testObj) {
        for(var prop8 in spec){
            if (_has(prop8, spec) && !spec[prop8](testObj[prop8])) {
                return false;
            }
        }
        return true;
    });
    const __default538 = where;
    const __default539 = where;
    const where1 = where;
    const where2 = where;
    const _curry2134 = _curry2;
    const _has10 = _has;
    var whereAny = _curry2(function whereAny(spec, testObj) {
        for(var prop8 in spec){
            if (_has(prop8, spec) && spec[prop8](testObj[prop8])) {
                return true;
            }
        }
        return false;
    });
    const __default540 = whereAny;
    const __default541 = whereAny;
    const whereAny1 = whereAny;
    const _curry2135 = _curry2;
    const equals10 = equals;
    var whereEq = _curry2(function whereEq(spec, testObj) {
        return where(__default25(equals, spec), testObj);
    });
    const __default542 = whereEq;
    const __default543 = whereEq;
    const whereEq1 = whereEq;
    const _curry2136 = _curry2;
    const _includes3 = _includes;
    var without = _curry2(function(xs, list) {
        return __default393(flip(_includes)(xs), list);
    });
    const __default544 = without;
    const __default545 = without;
    const without1 = without;
    const _curry2137 = _curry2;
    var xor = _curry2(function xor(a, b) {
        return Boolean(!a ^ !b);
    });
    const __default546 = xor;
    const __default547 = xor;
    const xor1 = xor;
    const _curry2138 = _curry2;
    var xprod = _curry2(function xprod(a, b) {
        var idx = 0;
        var ilen = a.length;
        var j;
        var jlen = b.length;
        var result = [];
        while(idx < ilen){
            j = 0;
            while(j < jlen){
                result[result.length] = [
                    a[idx],
                    b[j]
                ];
                j += 1;
            }
            idx += 1;
        }
        return result;
    });
    const __default548 = xprod;
    const __default549 = xprod;
    const xprod1 = xprod;
    const _curry2139 = _curry2;
    var zip = _curry2(function zip(a, b) {
        var rv = [];
        var idx = 0;
        var len = Math.min(a.length, b.length);
        while(idx < len){
            rv[idx] = [
                a[idx],
                b[idx]
            ];
            idx += 1;
        }
        return rv;
    });
    const __default550 = zip;
    const __default551 = zip;
    const zip1 = zip;
    const _curry2140 = _curry2;
    var zipObj = _curry2(function zipObj(keys9, values3) {
        var idx = 0;
        var len = Math.min(keys9.length, values3.length);
        var out = {
        };
        while(idx < len){
            out[keys9[idx]] = values3[idx];
            idx += 1;
        }
        return out;
    });
    const __default552 = zipObj;
    const __default553 = zipObj;
    const zipObj1 = zipObj;
    const _curry346 = _curry3;
    var zipWith = _curry3(function zipWith(fn, a, b) {
        var rv = [];
        var idx = 0;
        var len = Math.min(a.length, b.length);
        while(idx < len){
            rv[idx] = fn(a[idx], b[idx]);
            idx += 1;
        }
        return rv;
    });
    const __default554 = zipWith;
    const __default555 = zipWith;
    const zipWith1 = zipWith;
    const _curry147 = _curry1;
    var thunkify = _curry1(function thunkify(fn) {
        return curryN(fn.length, function createThunk() {
            var fnArgs = arguments;
            return function invokeThunk() {
                return fn.apply(this, fnArgs);
            };
        });
    });
    const __default556 = thunkify;
    const __default557 = thunkify;
    const thunkify1 = thunkify;
    const __default558 = {
        '@@functional/placeholder': true
    };
    const __default559 = __default558;
    const __ = __default558;
    const ap3 = ap;
    const assocPath3 = assocPath;
    const bind1 = bind;
    const equals11 = equals;
    const isNil3 = isNil;
    const keys9 = keys;
    const max6 = max;
    const mergeDeepWithKey4 = mergeDeepWithKey;
    const mergeWithKey2 = mergeWithKey;
    const nth7 = nth;
    const reduce9 = reduce;
    const reverse3 = reverse;
    const slice10 = slice;
    const tail3 = tail;
    const toString5 = toString1;
    const type1 = type;
    return {
        F: F,
        T: T,
        __: __default558,
        add: add,
        addIndex: addIndex,
        adjust: adjust,
        all: all,
        allPass: allPass,
        always: always,
        and: and,
        any: any,
        anyPass: anyPass,
        ap: ap,
        aperture: aperture,
        append: append,
        apply: apply,
        applySpec: applySpec,
        applyTo: applyTo,
        ascend: ascend,
        assoc: assoc,
        assocPath: assocPath,
        binary: binary,
        bind: bind,
        both: both,
        call: call,
        chain: chain,
        clamp: clamp,
        clone: clone,
        collectBy: collectBy,
        comparator: comparator,
        complement: complement,
        compose: compose,
        composeWith: composeWith,
        concat: concat,
        cond: cond,
        construct: construct,
        constructN: constructN,
        converge: converge,
        countBy: countBy,
        curry: curry,
        curryN: curryN,
        dec: dec,
        defaultTo: defaultTo,
        descend: descend,
        difference: difference,
        differenceWith: differenceWith,
        dissoc: dissoc,
        dissocPath: dissocPath,
        divide: divide,
        drop: drop,
        dropLast: dropLast1,
        dropLastWhile: dropLastWhile1,
        dropRepeats: dropRepeats,
        dropRepeatsWith: dropRepeatsWith,
        dropWhile: dropWhile,
        either: either,
        empty: empty,
        endsWith: endsWith,
        eqBy: eqBy,
        eqProps: eqProps,
        equals: equals,
        evolve: evolve,
        filter: filter,
        find: find1,
        findIndex: findIndex,
        findLast: findLast,
        findLastIndex: findLastIndex,
        flatten: flatten,
        flip: flip,
        forEach: forEach,
        forEachObjIndexed: forEachObjIndexed,
        fromPairs: fromPairs,
        groupBy: groupBy,
        groupWith: groupWith,
        gt: gt,
        gte: gte,
        has: has,
        hasIn: hasIn,
        hasPath: hasPath,
        head: head,
        identical: identical,
        identity: identity,
        ifElse: ifElse,
        inc: inc,
        includes: includes,
        indexBy: indexBy,
        indexOf: indexOf,
        init: init,
        innerJoin: innerJoin,
        insert: insert,
        insertAll: insertAll,
        intersection: intersection,
        intersperse: intersperse,
        into: into,
        invert: invert,
        invertObj: invertObj,
        invoker: invoker,
        is: is,
        isEmpty: isEmpty,
        isNil: isNil,
        join: join2,
        juxt: juxt,
        keys: keys,
        keysIn: keysIn,
        last: last,
        lastIndexOf: lastIndexOf,
        length: length,
        lens: lens,
        lensIndex: lensIndex,
        lensPath: lensPath,
        lensProp: lensProp,
        lift: lift,
        liftN: liftN,
        lt: lt,
        lte: lte,
        map: __default25,
        mapAccum: mapAccum,
        mapAccumRight: mapAccumRight,
        mapObjIndexed: mapObjIndexed,
        match: match,
        mathMod: mathMod,
        max: max,
        maxBy: maxBy,
        mean: mean,
        median: median,
        memoizeWith: memoizeWith,
        mergeAll: mergeAll,
        mergeDeepLeft: mergeDeepLeft,
        mergeDeepRight: mergeDeepRight,
        mergeDeepWith: mergeDeepWith,
        mergeDeepWithKey: mergeDeepWithKey,
        mergeLeft: mergeLeft,
        mergeRight: mergeRight,
        mergeWith: mergeWith,
        mergeWithKey: mergeWithKey,
        min: min,
        minBy: minBy,
        modify: modify,
        modifyPath: modifyPath,
        modulo: modulo,
        move: move,
        multiply: multiply,
        nAry: nAry,
        partialObject: __default334,
        negate: negate,
        none: none,
        not: not,
        nth: nth,
        nthArg: nthArg,
        o: o,
        objOf: objOf,
        of: of,
        omit: omit,
        on: on,
        once: once,
        or: or,
        otherwise: otherwise,
        over: over,
        pair: pair,
        partial: partial,
        partialRight: partialRight,
        partition: partition,
        path: path1,
        paths: paths,
        pathEq: pathEq,
        pathOr: pathOr,
        pathSatisfies: pathSatisfies,
        pick: pick,
        pickAll: pickAll,
        pickBy: pickBy,
        pipe: pipe,
        pipeWith: pipeWith,
        pluck: pluck,
        prepend: prepend,
        product: product,
        project: project,
        promap: promap,
        prop: prop,
        propEq: propEq,
        propIs: propIs,
        propOr: propOr,
        propSatisfies: propSatisfies,
        props: props,
        range: range,
        reduce: reduce,
        reduceBy: reduceBy,
        reduceRight: reduceRight,
        reduceWhile: reduceWhile,
        reduced: reduced,
        reject: __default393,
        remove: remove,
        repeat: repeat,
        replace: replace,
        reverse: reverse,
        scan: scan,
        sequence: sequence,
        set: set,
        slice: slice,
        sort: sort,
        sortBy: sortBy,
        sortWith: sortWith,
        split: split,
        splitAt: splitAt,
        splitEvery: splitEvery,
        splitWhen: splitWhen,
        splitWhenever: splitWhenever,
        startsWith: startsWith,
        subtract: subtract,
        sum: sum,
        symmetricDifference: symmetricDifference,
        symmetricDifferenceWith: symmetricDifferenceWith,
        tail: tail,
        take: take,
        takeLast: takeLast,
        takeLastWhile: takeLastWhile,
        takeWhile: takeWhile,
        tap: tap,
        test: test,
        andThen: andThen,
        times: times,
        toLower: toLower,
        toPairs: toPairs,
        toPairsIn: toPairsIn,
        toString: toString1,
        toUpper: toUpper,
        transduce: transduce,
        transpose: transpose,
        traverse: traverse,
        trim: trim,
        tryCatch: tryCatch,
        type: type,
        unapply: unapply,
        unary: unary,
        uncurryN: uncurryN,
        unfold: unfold,
        union: union,
        unionWith: unionWith,
        uniq: uniq,
        uniqBy: uniqBy,
        uniqWith: uniqWith,
        unless: unless,
        unnest: unnest,
        until: until,
        update: update,
        useWith: useWith,
        values: values,
        valuesIn: valuesIn,
        view: view,
        when: when,
        where: where,
        whereAny: whereAny,
        whereEq: whereEq,
        without: without,
        xor: xor,
        xprod: xprod,
        zip: zip,
        zipObj: zipObj,
        zipWith: zipWith,
        thunkify: thunkify
    };
}();
function hasOrAdd(item, shouldAdd, set) {
    var type1 = typeof item;
    var prevSize, newSize;
    switch(type1){
        case 'string':
        case 'number':
            if (item === 0 && 1 / item === -Infinity) {
                if (set._items['-0']) {
                    return true;
                } else {
                    if (shouldAdd) {
                        set._items['-0'] = true;
                    }
                    return false;
                }
            }
            if (set._nativeSet !== null) {
                if (shouldAdd) {
                    prevSize = set._nativeSet.size;
                    set._nativeSet.add(item);
                    newSize = set._nativeSet.size;
                    return newSize === prevSize;
                } else {
                    return set._nativeSet.has(item);
                }
            } else {
                if (!(type1 in set._items)) {
                    if (shouldAdd) {
                        set._items[type1] = {
                        };
                        set._items[type1][item] = true;
                    }
                    return false;
                } else if (item in set._items[type1]) {
                    return true;
                } else {
                    if (shouldAdd) {
                        set._items[type1][item] = true;
                    }
                    return false;
                }
            }
        case 'boolean':
            if (type1 in set._items) {
                var bIdx = item ? 1 : 0;
                if (set._items[type1][bIdx]) {
                    return true;
                } else {
                    if (shouldAdd) {
                        set._items[type1][bIdx] = true;
                    }
                    return false;
                }
            } else {
                if (shouldAdd) {
                    set._items[type1] = item ? [
                        false,
                        true
                    ] : [
                        true,
                        false
                    ];
                }
                return false;
            }
        case 'function':
            if (set._nativeSet !== null) {
                if (shouldAdd) {
                    prevSize = set._nativeSet.size;
                    set._nativeSet.add(item);
                    newSize = set._nativeSet.size;
                    return newSize === prevSize;
                } else {
                    return set._nativeSet.has(item);
                }
            } else {
                if (!(type1 in set._items)) {
                    if (shouldAdd) {
                        set._items[type1] = [
                            item
                        ];
                    }
                    return false;
                }
                if (!_includes(item, set._items[type1])) {
                    if (shouldAdd) {
                        set._items[type1].push(item);
                    }
                    return false;
                }
                return true;
            }
        case 'undefined':
            if (set._items[type1]) {
                return true;
            } else {
                if (shouldAdd) {
                    set._items[type1] = true;
                }
                return false;
            }
        case 'object':
            if (item === null) {
                if (!set._items['null']) {
                    if (shouldAdd) {
                        set._items['null'] = true;
                    }
                    return false;
                }
                return true;
            }
        default:
            type1 = Object.prototype.toString.call(item);
            if (!(type1 in set._items)) {
                if (shouldAdd) {
                    set._items[type1] = [
                        item
                    ];
                }
                return false;
            }
            if (!_includes(item, set._items[type1])) {
                if (shouldAdd) {
                    set._items[type1].push(item);
                }
                return false;
            }
            return true;
    }
}
function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
    var a = _arrayFromIterator(aIterator);
    var b = _arrayFromIterator(bIterator);
    function eq(_a, _b) {
        return _equals(_a, _b, stackA.slice(), stackB.slice());
    }
    return !_includesWith(function(b1, aItem) {
        return !_includesWith(eq, aItem, b1);
    }, b, a);
}
const mergeDescriptions = (descriptions)=>mod4.uniq(descriptions.filter(Boolean)).join(`. `) || undefined
;
const mergeNames = (objects)=>objects.map((obj)=>obj.name
    ).join(`_`)
;
const mergeFieldType = (a, b)=>{
    if (mod4.equals(a, b)) {
        return a;
    }
    const fields = [
        a,
        b
    ];
    if (fields.some(mod3.isNonNullType)) {
        const nonRequired = fields.map((f)=>mod3.isNonNullType(f) ? f.ofType : f
        );
        const merged = mergeFieldType(...nonRequired);
        return fields.every(mod3.isNonNullType) ? mod3.GraphQLNonNull(merged) : merged;
    }
    if (fields.some(mod3.isListType)) {
        if (!fields.every(mod3.isListType)) {
            throw new Error([
                `Atempt to merge fields which are not compatible.`,
                `A: ${stringify1(a, {
                    maxDepth: 1
                })}`,
                `B: ${stringify1(b, {
                    maxDepth: 1
                })}`,
                `Cannot merge list and non-list.`, 
            ].join(`\n`));
        }
        return mod3.GraphQLList(mergeFieldType(a.ofType, b.ofType));
    }
    if (fields.some(isGQLObject)) {
        if (!fields.every(isGQLObject)) {
            throw new Error([
                `Atempt to merge object and non-object fields.`,
                `A: ${stringify1(a, {
                    maxDepth: 1
                })}`,
                `B: ${stringify1(b, {
                    maxDepth: 1
                })}`,
                `Cannot merge object and non-object.`, 
            ].join(`\n`));
        }
        const merginInputTypes = mod3.isInputObjectType(a);
        return merginInputTypes ? mergeObjects(fields) : new mod3.GraphQLUnionType({
            name: mergeNames(fields),
            types: fields
        });
    }
    if (!fields.every(mod3.isLeafType)) {
        throw new Error([
            `Expected type to be LeafType (Scalar or Enum) but got.`,
            `A: ${stringify1(a, {
                maxDepth: 1
            })}`,
            `B: ${stringify1(b, {
                maxDepth: 1
            })}`, 
        ].join(`\n`));
    }
    return mod3.GraphQLString;
};
const mergeFields = (a, b)=>({
        description: mergeDescriptions([
            a.description,
            b.description
        ]),
        type: mergeFieldType(a.type, b.type)
    })
;
const mergeTwoFieldsMap = mod4.mergeWith(mergeFields);
const mergeFieldsMap = (fieldsMap)=>fieldsMap.length === 1 ? fieldsMap[0] : fieldsMap.reduce(mergeTwoFieldsMap)
;
const mergeObjects = (objects, name)=>{
    if (objects.length === 0) {
        throw new Error(`mergeObjects require at least one object in input array`);
    }
    if (!objects.every(isGQLObject)) {
        throw new Error([
            `Currently only _objects_ (i.e. non-scalar and non-list) could be merged\n`,
            stringify1(objects, {
                maxDepth: 1
            }), 
        ].join(``));
    }
    const verifiedObjects = objects;
    if (verifiedObjects.length === 1) {
        console.warn(`Merging of single object just returns the single object.`, `Single schema composition indicates some error in your specification file.`);
        return verifiedObjects[0];
    }
    const fields = mergeFieldsMap(verifiedObjects.map((o)=>o.toConfig().fields
    ));
    const Clazz = Object.getPrototypeOf(verifiedObjects[0]).constructor;
    return new Clazz({
        description: mergeDescriptions(verifiedObjects.map((obj)=>obj.description
        )),
        fields,
        name: name || mergeNames(verifiedObjects)
    });
};
const isValidGraphQLName = RegExp.prototype.test.bind(/^[A-Za-z_]\w*$/);
const invalidTokensRe = /^[^A-Za-z_]|\W+(.)?/g;
const toValidGraphQLName = (name)=>name.replace(invalidTokensRe, (_match, charAfter)=>charAfter?.toUpperCase() || ``
    )
;
const BODY = `body`;
const httpMethods = [
    `delete`,
    `get`,
    `patch`,
    `post`,
    `put`, 
];
const createOneOf = (objects)=>({
        oneOf: objects
    })
;
const isSuccessStatusCode = (statusCode)=>statusCode.startsWith(`2`)
;
const emptySchemaObject = {
    type: "object",
    properties: {
        _: {
            type: "boolean"
        }
    }
};
const mediaJSON = /application\/json/i;
const graphqlCompliantMediaType = (obj)=>{
    if (!obj.content) {
        return {
            type: "boolean"
        };
    }
    const jsonResponse = Object.entries(obj.content).find(([mediaType])=>mediaJSON.test(mediaType)
    );
    if (!jsonResponse) {
        return {
            type: "string"
        };
    }
    const jsonResponseSchema = jsonResponse[1].schema;
    return !jsonResponseSchema || jsonResponseSchema.type === "object" && mod4.isEmpty(jsonResponseSchema.properties) ? emptySchemaObject : jsonResponseSchema;
};
const isOpenAPIV3Document = (fileContent)=>fileContent?.openapi?.startsWith?.(`3`)
;
const isAlgebraic = (schema1)=>Boolean(schema1.allOf || schema1.anyOf || schema1.oneOf)
;
const isEnum = (schema1)=>Boolean(schema1.enum)
;
const isList = (schema1)=>schema1.type === `array`
;
const isObject = (schema1)=>schema1.type === `object`
;
const isReference = (schema1)=>`$ref` in schema1
;
const isScalar = (schema1)=>{
    const { type: type1  } = schema1;
    return type1 === `boolean` || type1 === `integer` || type1 === `number` || type1 === `string`;
};
const lastJsonPointerPathSegment = (ref)=>mod4.last(JsonPointer1.decode(ref))
;
const resolveRef = (document, $ref)=>{
    const dereferenced = JsonPointer1.get(document, $ref);
    if (!dereferenced) {
        throw new Error(`Failed to dereference JSON pointer: "${$ref}"`);
    }
    return dereferenced;
};
const isValidGqlEnumValue = (value2)=>typeof value2 === "string" && isValidGraphQLName(value2)
;
const toValidTypeName = (title, ref, parentName)=>toValidGraphQLName(title || ref && lastJsonPointerPathSegment(ref) || parentName)
;
class GraphQLFurnace {
    cache = {
        enum: new Map(),
        input: new Map(),
        output: new Map(),
        parameter: new Map()
    };
    interfaceExtension = interfaceExtensionFactory();
    constructor(document, hooks){
        this.document = document;
        this.hooks = hooks;
    }
    dereference(input) {
        return this.dereferenceImpl(input);
    }
    dereferenceImpl(input, ref) {
        return isReference(input) ? this.dereferenceImpl(resolveRef(this.document, input.$ref), input.$ref) : ref ? [
            input,
            ref
        ] : [
            input
        ];
    }
    resolvePropertyName(objectName, propName) {
        if (isValidGraphQLName(propName)) return propName;
        const validName = toValidGraphQLName(propName);
        this.hooks.onPropertyRenamed?.(objectName, propName, validName);
        return validName;
    }
    toEnum(name, schema) {
        const cached = this.cache.enum.get(name);
        if (cached) return cached;
        const result = schema.enum.every(isValidGqlEnumValue) ? new mod3.GraphQLEnumType({
            name,
            values: schema.enum.reduce((acc, value2)=>{
                acc[value2] = {
                    value: value2
                };
                return acc;
            }, {
            })
        }) : mod3.GraphQLString;
        this.hooks.onEnumDistilled?.(name, schema);
        this.cache.enum.set(name, result);
        return result;
    }
    toLeafType(ref, schema, parentName) {
        if (isEnum(schema)) {
            return this.toEnum(toValidTypeName(schema.title, ref, parentName), schema);
        }
        if (isScalar(schema)) {
            switch(schema.type){
                case `boolean`:
                    return mod3.GraphQLBoolean;
                case `integer`:
                    return mod3.GraphQLInt;
                case `number`:
                    return mod3.GraphQLFloat;
                case `string`:
                    return mod3.GraphQLString;
            }
        }
        throw new Error(`Unsupported schema in "distillLeafType" function:\n      ${stringify1(schema, {
            maxDepth: 1
        })}`);
    }
    toInputType(schemaOrRef, parentName) {
        const [schema2, ref] = this.dereference(schemaOrRef);
        const cached = ref && this.cache.input.get(ref);
        if (cached) return cached;
        const result = this.toInputTypeDereferencedCached(ref, schema2, parentName);
        if (ref) this.cache.input.set(ref, result);
        return result;
    }
    toInputTypeDereferencedCached(ref, schema, parentName) {
        if (isAlgebraic(schema)) {
            const name = `${toValidTypeName(schema.title, ref, parentName)}Input`;
            const types1 = (schema.allOf || schema.anyOf || schema.oneOf).map((component, idx)=>this.toInputType(component, `${name}_${idx}`)
            );
            if (!types1.every(mod3.isInputObjectType)) {
                throw new Error([
                    `Sorry, algebraic types could be composed only from object types.`,
                    stringify1(schema, {
                        maxDepth: 2
                    }),
                    `Above schema is composed from non-object types.`, 
                ].join(`\n`));
            }
            return mergeObjects(types1, name);
        }
        if (isList(schema)) {
            return new mod3.GraphQLList(this.toInputType(schema.items, parentName));
        }
        if (isObject(schema)) {
            const name = `${toValidTypeName(schema.title, ref, parentName)}Input`;
            const { required  } = schema;
            return new mod3.GraphQLInputObjectType({
                description: schema.description,
                fields: Object.fromEntries(Object.entries(schema.properties).map(([propName, propSchema])=>{
                    const derefSchema = this.dereference(propSchema)[0];
                    const type1 = this.toInputType(propSchema, `${name}_${propName}`);
                    return [
                        this.resolvePropertyName(name, propName),
                        {
                            description: derefSchema.description,
                            type: required?.includes(propName) ? mod3.GraphQLNonNull(type1) : type1
                        }, 
                    ];
                })),
                name
            });
        }
        return this.toLeafType(ref, schema, parentName);
    }
    toOutputType(schemaOrRef, parentName) {
        const [schema2, ref] = this.dereference(schemaOrRef);
        const cached = ref && this.cache.output.get(ref);
        if (cached) return cached;
        const result = this.toOutputTypeDereferencedCached(ref, schema2, parentName);
        if (ref) this.cache.output.set(ref, result);
        return result;
    }
    toOutputTypeDereferencedCached(ref, schema, parentName) {
        if (isAlgebraic(schema)) {
            const name = toValidTypeName(schema.title, ref, parentName);
            const union = !schema.allOf;
            const types1 = (schema.allOf || schema.anyOf || schema.oneOf).map((component, idx)=>this.toOutputType(component, `${name}_${idx}`)
            );
            if (!types1.every(mod3.isObjectType)) {
                throw new Error([
                    `Sorry, algebraic types could be composed only from object types.`,
                    stringify1(schema, {
                        maxDepth: 2
                    }),
                    `Above schema is composed from non-object types.`, 
                ].join(`\n`));
            }
            if (union) {
                return new mod3.GraphQLUnionType({
                    description: schema.description,
                    name,
                    types: types1
                });
            }
            const intersection = mergeObjects(types1, name);
            (schema.allOf || schema.anyOf).forEach((component, idx)=>{
                if (isReference(component)) {
                    const interfaceObject = types1[idx];
                    this.interfaceExtension.addInterfaceConnection(interfaceObject, intersection);
                }
            });
            return intersection;
        }
        if (isList(schema)) {
            return new mod3.GraphQLList(this.toOutputType(schema.items, parentName));
        }
        if (isObject(schema)) {
            const name = toValidTypeName(schema.title, ref, parentName);
            const { required  } = schema;
            const objectType = new mod3.GraphQLObjectType({
                description: schema.description,
                fields: Object.fromEntries(Object.entries(schema.properties).map(([propName, propSchema])=>{
                    const derefSchema = this.dereference(propSchema)[0];
                    const type1 = propName === `id` && isScalar(derefSchema) ? mod3.GraphQLID : this.toOutputType(propSchema, `${name}_${propName}`);
                    return [
                        this.resolvePropertyName(name, propName),
                        {
                            description: derefSchema.description,
                            type: required?.includes(propName) ? mod3.GraphQLNonNull(type1) : type1
                        }, 
                    ];
                })),
                name
            });
            return objectType;
        }
        return this.toLeafType(ref, schema, parentName);
    }
    toArguments(operationId, requestBody, parameters) {
        const dereferencedBody = requestBody && this.dereference(requestBody)[0];
        return !dereferencedBody && mod4.isEmpty(parameters) ? undefined : [
            dereferencedBody && this.toArgument({
                in: BODY,
                name: BODY,
                schema: graphqlCompliantMediaType(dereferencedBody),
                required: dereferencedBody?.required
            }, operationId), 
        ].concat(parameters?.map((parameter)=>this.toArgument(parameter, operationId)
        )).filter(Boolean);
    }
    toArgument(parameterOrRef, parentName) {
        const [parameter, ref] = this.dereference(parameterOrRef);
        const cached = ref && this.cache.parameter.get(ref);
        if (cached) return cached;
        const result = this.toArgumentDereferencedAndCached(ref, parameter, parentName);
        if (ref) this.cache.parameter.set(ref, result);
        return result;
    }
    toArgumentDereferencedAndCached(_ref, parameter, parentName) {
        const { name , required =false  } = parameter;
        if (parameter.in !== BODY && name === BODY) {
            throw new Error(`Invalid parameter ${stringify1(parameter, {
                maxDepth: 1
            })},\n        \nOperation parameter MUST NOT have reserved name "${BODY}".`);
        }
        const type1 = this.toInputType(parameter.schema, `${parentName}_${name}`);
        return {
            description: parameter.description,
            in: parameter.in,
            required: Boolean(parameter.required),
            type: required ? mod3.GraphQLNonNull(type1) : type1,
            ...isValidGraphQLName(name) ? {
                name
            } : {
                name: toValidGraphQLName(name),
                originalName: name
            }
        };
    }
    processOperation(path, httpMethod, operation, parameters) {
        const { operationId , responses  } = operation;
        if (!operationId) {
            throw new Error(`OpenApi operation MUST contain "operationId".\n      ${stringify1(operation, {
                maxDepth: 1
            })}\n\nAbove operation miss "operationId" property.`);
        }
        if (!isValidGraphQLName(operationId)) {
            throw new Error(`OpenApi operationId MUST be a valid GraphQL name.\n      ${stringify1(operation, {
                maxDepth: 1
            })}\n\nAbove operation has invalid "operationId".`);
        }
        const groupedResponses = responses && Object.entries(responses).reduce((acc, [httpStatusCode, operation])=>{
            const key = isSuccessStatusCode(httpStatusCode) ? `success` : `error`;
            acc[key] = (acc[key] || []).concat(operation);
            return acc;
        }, {
        });
        if (mod4.isEmpty(groupedResponses?.success)) {
            throw new Error(`OpenApi operation MUST contain success response.\n      ${stringify1(operation, {
                maxDepth: 1
            })}\n\nAbove operation does not contain definition of success response.`);
        }
        const distilledArguments = this.toArguments(operationId, operation.requestBody, [].concat(parameters, operation.parameters).filter(Boolean));
        const successResponses = groupedResponses.success.map(mod4.compose(graphqlCompliantMediaType, mod4.head, this.dereference.bind(this)));
        const fieldConfig = {
            args: distilledArguments && distilledArguments.reduce((acc, { description , name , type: type1  })=>{
                acc[name] = {
                    description,
                    type: type1
                };
                return acc;
            }, {
            }),
            description: [
                operation.summary,
                operation.description
            ].filter(Boolean).join(`\n\n`),
            extensions: {
                distilledArguments
            },
            type: this.toOutputType(successResponses.length === 1 ? successResponses[0] : createOneOf(successResponses), operationId)
        };
        this.hooks.onOperationDistilled?.(path, httpMethod, operationId, fieldConfig, distilledArguments);
        return {
            fieldConfig,
            fieldName: operationId
        };
    }
    toGqlSchema() {
        const { Mutation , Query  } = Object.entries(this.document.paths).reduce((acc, [urlPath, pathItemObject])=>{
            if (pathItemObject) {
                const { parameters  } = pathItemObject;
                httpMethods.forEach((httpMethod)=>{
                    if (httpMethod in pathItemObject) {
                        const { fieldConfig , fieldName  } = this.processOperation(urlPath, httpMethod, pathItemObject[httpMethod], parameters);
                        acc[httpMethod === `get` ? `Query` : `Mutation`][fieldName] = fieldConfig;
                    }
                });
            }
            return acc;
        }, {
            Mutation: {
            },
            Query: {
            }
        });
        const schema2 = new mod3.GraphQLSchema({
            query: mod4.isEmpty(Query) ? this.toOutputType(emptySchemaObject, `Query`) : new mod3.GraphQLObjectType({
                name: `Query`,
                fields: Query
            }),
            mutation: mod4.isEmpty(Mutation) ? null : new mod3.GraphQLObjectType({
                name: `Mutation`,
                fields: Mutation
            })
        });
        return this.interfaceExtension.extendSchema(schema2);
    }
}
const oasPathParamsToColonParams = mod4.replace(/\/\{(\w+)\}(?=\/|$)/g, `/:$1`);
const getGraphQLTypeName = (outputType)=>outputType.ofType ? getGraphQLTypeName(outputType.ofType) : mod3.isScalarType(outputType) ? undefined : outputType.name
;
const getIntrospectionQueryResult = (schema2)=>{
    const document1 = mod3.parse(`\n  {\n    __schema {\n      types {\n        fields {\n          name\n          type {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                }\n              }\n            }\n          }\n        }\n        kind\n        name\n        possibleTypes {\n          name\n          fields(includeDeprecated: true) {\n            name\n          }\n        }\n      }\n    }\n  }\n`);
    return mod3.execute({
        document: document1,
        schema: schema2
    });
};
const getPossibleTypes = ({ data: { __schema: { types: types1  }  }  })=>{
    const byUniqPropetiesLengthDesc = (a, b)=>b.uniqProperties.length - a.uniqProperties.length
    ;
    const toName = ({ name  })=>name
    ;
    return types1.reduce((acc, { kind: kind2 , name , possibleTypes: possTypes  })=>{
        if (possTypes) {
            const withUniqProps = possTypes.map(({ fields , name: name1  })=>[
                    name1,
                    fields.map(toName)
                ]
            ).map(([name1, properties], idx, arr)=>{
                const otherTypesProperties = mod4.remove(idx, 1, arr).reduce((acc1, [, pNames])=>acc1.concat(pNames)
                , []);
                const uniqProperties = mod4.difference(properties, otherTypesProperties);
                return {
                    name: name1,
                    uniqProperties
                };
            });
            acc[name] = {
                kind: kind2,
                possibleTypes: withUniqProps.sort(byUniqPropetiesLengthDesc)
            };
        }
        return acc;
    }, {
    });
};
const unwrapOutputType = (type1)=>type1.kind === `OBJECT` || type1.kind === `UNION` ? type1 : type1.ofType ? unwrapOutputType(type1.ofType) : undefined
;
const getObjectsRelation = ({ data: { __schema: { types: types1  }  }  })=>{
    const ignoreObjectNameRe = /^(?:Mutation|Query|Subscription|__.+)$/;
    return types1.reduce((objectsRelation, type1)=>{
        if (type1.kind === `OBJECT` && !ignoreObjectNameRe.test(type1.name)) {
            const fieldsToTypenameMap = type1.fields.reduce((acc, child)=>{
                const childObjectType = unwrapOutputType(child.type);
                if (childObjectType) {
                    acc[child.name] = childObjectType.name;
                }
                return acc;
            }, {
            });
            if (!mod4.isEmpty(fieldsToTypenameMap)) {
                objectsRelation[type1.name] = fieldsToTypenameMap;
            }
        }
        return objectsRelation;
    }, {
    });
};
const refine = async (openApi)=>{
    if (!isOpenAPIV3Document(openApi)) {
        throw new Error(`File does not contain a valid OpenAPIV3 document:\n\n      ${stringify1(openApi, {
            maxDepth: 1
        })}`);
    }
    const enums = new Map();
    const objectsRename = {
    };
    const operations = [];
    const gqlSchema = new GraphQLFurnace(openApi, {
        onEnumDistilled (name, source) {
            enums.set(name, source.enum);
        },
        onPropertyRenamed (objectName, originalName, changedName) {
            (objectsRename[objectName] || (objectsRename[objectName] = {
            }))[originalName] = changedName;
        },
        onOperationDistilled (url, httpMethod, operationId, fieldConfig, parameters) {
            const nonBodyParameters = parameters?.reduce((acc, param)=>{
                if (param.in !== "body") {
                    acc.push({
                        in: param.in,
                        name: param.name,
                        originalName: param.originalName
                    });
                }
                return acc;
            }, []);
            operations.push({
                httpMethod,
                operationId,
                path: oasPathParamsToColonParams(url),
                responseType: getGraphQLTypeName(fieldConfig.type),
                parameters: mod4.isEmpty(nonBodyParameters) ? undefined : nonBodyParameters
            });
        }
    }).toGqlSchema();
    const introspectionResult = await getIntrospectionQueryResult(gqlSchema);
    return {
        apiArtifacts: {
            objectsRelation: getObjectsRelation(introspectionResult),
            objectsRename,
            operations,
            possibleTypes: getPossibleTypes(introspectionResult)
        },
        enums,
        openApi,
        gqlSchema
    };
};
const rsAstralRange = '\\ud800-\\udfff';
const rsComboMarksRange = '\\u0300-\\u036f';
const reComboHalfMarksRange = '\\ufe20-\\ufe2f';
const rsComboSymbolsRange = '\\u20d0-\\u20ff';
const rsComboMarksExtendedRange = '\\u1ab0-\\u1aff';
const rsComboMarksSupplementRange = '\\u1dc0-\\u1dff';
const rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange + rsComboMarksExtendedRange + rsComboMarksSupplementRange;
const rsDingbatRange = '\\u2700-\\u27bf';
const rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff';
const rsMathOpRange = '\\xac\\xb1\\xd7\\xf7';
const rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
const rsPunctuationRange = '\\u2000-\\u206f';
const rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000';
const rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
const rsVarRange = '\\ufe0e\\ufe0f';
const rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
const rsApos = "['\u2019]";
const rsBreak = `[${rsBreakRange}]`;
const rsCombo = `[${rsComboRange}]`;
const rsDigit = '\\d';
const rsDingbat = `[${rsDingbatRange}]`;
const rsLower = `[${rsLowerRange}]`;
const rsMisc = `[^${rsAstralRange}${rsBreakRange + rsDigit + rsDingbatRange + rsLowerRange + rsUpperRange}]`;
const rsFitz = '\\ud83c[\\udffb-\\udfff]';
const rsModifier = `(?:${rsCombo}|${rsFitz})`;
const rsNonAstral = `[^${rsAstralRange}]`;
const rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
const rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
const rsUpper = `[${rsUpperRange}]`;
const rsZWJ = '\\u200d';
const rsMiscLower = `(?:${rsLower}|${rsMisc})`;
const rsMiscUpper = `(?:${rsUpper}|${rsMisc})`;
const rsOptContrLower = `(?:${rsApos}(?:d|ll|m|re|s|t|ve))?`;
const rsOptContrUpper = `(?:${rsApos}(?:D|LL|M|RE|S|T|VE))?`;
const reOptMod = `${rsModifier}?`;
const rsOptVar = `[${rsVarRange}]?`;
const rsOptJoin = `(?:${rsZWJ}(?:${[
    rsNonAstral,
    rsRegional,
    rsSurrPair
].join('|')})${rsOptVar + reOptMod})*`;
const rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])';
const rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])';
const rsSeq = rsOptVar + reOptMod + rsOptJoin;
const rsEmoji = `(?:${[
    rsDingbat,
    rsRegional,
    rsSurrPair
].join('|')})${rsSeq}`;
const reUnicodeWords = RegExp([
    `${rsUpper}?${rsLower}+${rsOptContrLower}(?=${[
        rsBreak,
        rsUpper,
        '$'
    ].join('|')})`,
    `${rsMiscUpper}+${rsOptContrUpper}(?=${[
        rsBreak,
        rsUpper + rsMiscLower,
        '$'
    ].join('|')})`,
    `${rsUpper}?${rsMiscLower}+${rsOptContrLower}`,
    `${rsUpper}+${rsOptContrUpper}`,
    rsOrdUpper,
    rsOrdLower,
    `${rsDigit}+`,
    rsEmoji
].join('|'), 'g');
function unicodeWords(string) {
    return string.match(reUnicodeWords);
}
const hasUnicodeWord = RegExp.prototype.test.bind(/[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/);
const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
function asciiWords(string) {
    return string.match(reAsciiWord);
}
function words(string, pattern) {
    if (pattern === undefined) {
        const result = hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        return result || [];
    }
    return string.match(pattern) || [];
}
const toString2 = Object.prototype.toString;
function getTag(value2) {
    if (value2 == null) {
        return value2 === undefined ? '[object Undefined]' : '[object Null]';
    }
    return toString2.call(value2);
}
function isSymbol(value2) {
    const type1 = typeof value2;
    return type1 == 'symbol' || type1 === 'object' && value2 != null && getTag(value2) == '[object Symbol]';
}
const INFINITY = 1 / 0;
function toString3(value2) {
    if (value2 == null) {
        return '';
    }
    if (typeof value2 === 'string') {
        return value2;
    }
    if (Array.isArray(value2)) {
        return `${value2.map((other)=>other == null ? other : toString3(other)
        )}`;
    }
    if (isSymbol(value2)) {
        return value2.toString();
    }
    const result = `${value2}`;
    return result == '0' && 1 / value2 == -INFINITY ? '-0' : result;
}
const snakeCase = (string)=>words(toString3(string).replace(/['\u2019]/g, '')).reduce((result, word, index)=>result + (index ? '_' : '') + word.toLowerCase()
    , '')
;
const upperSnakeCase = mod4.compose(mod4.toUpper, snakeCase);
const printEnum = (name, values)=>`export enum ${name} {\n${values.map((v)=>`  ${upperSnakeCase(v)} = "${v}",`
    ).join(`\n`)}\n}`
;
const printEnums = (enums)=>Array.from(enums.entries()).map(([name, values])=>printEnum(name, values)
    ).join(`\n`)
;
const mod5 = function() {
    const noColor = globalThis.Deno?.noColor ?? true;
    let enabled = !noColor;
    function setColorEnabled(value2) {
        if (noColor) {
            return;
        }
        enabled = value2;
    }
    const setColorEnabled1 = setColorEnabled;
    function getColorEnabled() {
        return enabled;
    }
    const getColorEnabled1 = getColorEnabled;
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g")
        };
    }
    function run(str, code1) {
        return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
    }
    function reset(str) {
        return run(str, code([
            0
        ], 0));
    }
    const reset1 = reset;
    function bold(str) {
        return run(str, code([
            1
        ], 22));
    }
    const bold1 = bold;
    function dim(str) {
        return run(str, code([
            2
        ], 22));
    }
    const dim1 = dim;
    function italic(str) {
        return run(str, code([
            3
        ], 23));
    }
    const italic1 = italic;
    function underline(str) {
        return run(str, code([
            4
        ], 24));
    }
    const underline1 = underline;
    function inverse(str) {
        return run(str, code([
            7
        ], 27));
    }
    const inverse1 = inverse;
    function hidden(str) {
        return run(str, code([
            8
        ], 28));
    }
    const hidden1 = hidden;
    function strikethrough(str) {
        return run(str, code([
            9
        ], 29));
    }
    const strikethrough1 = strikethrough;
    function black(str) {
        return run(str, code([
            30
        ], 39));
    }
    const black1 = black;
    function red(str) {
        return run(str, code([
            31
        ], 39));
    }
    const red1 = red;
    function green(str) {
        return run(str, code([
            32
        ], 39));
    }
    const green1 = green;
    function yellow(str) {
        return run(str, code([
            33
        ], 39));
    }
    const yellow1 = yellow;
    function blue(str) {
        return run(str, code([
            34
        ], 39));
    }
    const blue1 = blue;
    function magenta(str) {
        return run(str, code([
            35
        ], 39));
    }
    const magenta1 = magenta;
    function cyan(str) {
        return run(str, code([
            36
        ], 39));
    }
    const cyan1 = cyan;
    function white(str) {
        return run(str, code([
            37
        ], 39));
    }
    const white1 = white;
    function gray(str) {
        return brightBlack(str);
    }
    const gray1 = gray;
    function brightBlack(str) {
        return run(str, code([
            90
        ], 39));
    }
    const brightBlack1 = brightBlack;
    function brightRed(str) {
        return run(str, code([
            91
        ], 39));
    }
    const brightRed1 = brightRed;
    function brightGreen(str) {
        return run(str, code([
            92
        ], 39));
    }
    const brightGreen1 = brightGreen;
    function brightYellow(str) {
        return run(str, code([
            93
        ], 39));
    }
    const brightYellow1 = brightYellow;
    function brightBlue(str) {
        return run(str, code([
            94
        ], 39));
    }
    const brightBlue1 = brightBlue;
    function brightMagenta(str) {
        return run(str, code([
            95
        ], 39));
    }
    const brightMagenta1 = brightMagenta;
    function brightCyan(str) {
        return run(str, code([
            96
        ], 39));
    }
    const brightCyan1 = brightCyan;
    function brightWhite(str) {
        return run(str, code([
            97
        ], 39));
    }
    const brightWhite1 = brightWhite;
    function bgBlack(str) {
        return run(str, code([
            40
        ], 49));
    }
    const bgBlack1 = bgBlack;
    function bgRed(str) {
        return run(str, code([
            41
        ], 49));
    }
    const bgRed1 = bgRed;
    function bgGreen(str) {
        return run(str, code([
            42
        ], 49));
    }
    const bgGreen1 = bgGreen;
    function bgYellow(str) {
        return run(str, code([
            43
        ], 49));
    }
    const bgYellow1 = bgYellow;
    function bgBlue(str) {
        return run(str, code([
            44
        ], 49));
    }
    const bgBlue1 = bgBlue;
    function bgMagenta(str) {
        return run(str, code([
            45
        ], 49));
    }
    const bgMagenta1 = bgMagenta;
    function bgCyan(str) {
        return run(str, code([
            46
        ], 49));
    }
    const bgCyan1 = bgCyan;
    function bgWhite(str) {
        return run(str, code([
            47
        ], 49));
    }
    const bgWhite1 = bgWhite;
    function bgBrightBlack(str) {
        return run(str, code([
            100
        ], 49));
    }
    const bgBrightBlack1 = bgBrightBlack;
    function bgBrightRed(str) {
        return run(str, code([
            101
        ], 49));
    }
    const bgBrightRed1 = bgBrightRed;
    function bgBrightGreen(str) {
        return run(str, code([
            102
        ], 49));
    }
    const bgBrightGreen1 = bgBrightGreen;
    function bgBrightYellow(str) {
        return run(str, code([
            103
        ], 49));
    }
    const bgBrightYellow1 = bgBrightYellow;
    function bgBrightBlue(str) {
        return run(str, code([
            104
        ], 49));
    }
    const bgBrightBlue1 = bgBrightBlue;
    function bgBrightMagenta(str) {
        return run(str, code([
            105
        ], 49));
    }
    const bgBrightMagenta1 = bgBrightMagenta;
    function bgBrightCyan(str) {
        return run(str, code([
            106
        ], 49));
    }
    const bgBrightCyan1 = bgBrightCyan;
    function bgBrightWhite(str) {
        return run(str, code([
            107
        ], 49));
    }
    const bgBrightWhite1 = bgBrightWhite;
    function clampAndTruncate(n, max1 = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max1), min));
    }
    function rgb8(str, color) {
        return run(str, code([
            38,
            5,
            clampAndTruncate(color)
        ], 39));
    }
    const rgb81 = rgb8;
    function bgRgb8(str, color) {
        return run(str, code([
            48,
            5,
            clampAndTruncate(color)
        ], 49));
    }
    const bgRgb81 = bgRgb8;
    function rgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([
                38,
                2,
                color >> 16 & 255,
                color >> 8 & 255,
                color & 255
            ], 39));
        }
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b), 
        ], 39));
    }
    const rgb241 = rgb24;
    function bgRgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([
                48,
                2,
                color >> 16 & 255,
                color >> 8 & 255,
                color & 255
            ], 49));
        }
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b), 
        ], 49));
    }
    const bgRgb241 = bgRgb24;
    const ANSI_PATTERN = new RegExp([
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
    ].join("|"), "g");
    function stripColor(string) {
        return string.replace(ANSI_PATTERN, "");
    }
    const stripColor1 = stripColor;
    return {
        setColorEnabled: setColorEnabled,
        getColorEnabled: getColorEnabled,
        reset: reset,
        bold: bold,
        dim: dim,
        italic: italic,
        underline: underline,
        inverse: inverse,
        hidden: hidden,
        strikethrough: strikethrough,
        black: black,
        red: red,
        green: green,
        yellow: yellow,
        blue: blue,
        magenta: magenta,
        cyan: cyan,
        white: white,
        gray: gray,
        brightBlack: brightBlack,
        brightRed: brightRed,
        brightGreen: brightGreen,
        brightYellow: brightYellow,
        brightBlue: brightBlue,
        brightMagenta: brightMagenta,
        brightCyan: brightCyan,
        brightWhite: brightWhite,
        bgBlack: bgBlack,
        bgRed: bgRed,
        bgGreen: bgGreen,
        bgYellow: bgYellow,
        bgBlue: bgBlue,
        bgMagenta: bgMagenta,
        bgCyan: bgCyan,
        bgWhite: bgWhite,
        bgBrightBlack: bgBrightBlack,
        bgBrightRed: bgBrightRed,
        bgBrightGreen: bgBrightGreen,
        bgBrightYellow: bgBrightYellow,
        bgBrightBlue: bgBrightBlue,
        bgBrightMagenta: bgBrightMagenta,
        bgBrightCyan: bgBrightCyan,
        bgBrightWhite: bgBrightWhite,
        rgb8: rgb8,
        bgRgb8: bgRgb8,
        rgb24: rgb24,
        bgRgb24: bgRgb24,
        stripColor: stripColor
    };
}();
const main1 = async ({ _: [specFile] , outputDir  }, { loadFile , writeTextFile  })=>{
    const writeOutputFile = (path2, data)=>{
        log(mod5.blue(`Writting file:\t${path2}`));
        return writeTextFile(path2, data);
    };
    log(mod5.blue(`Loading file:\t${specFile}`));
    const fileContent = await loadFile(specFile);
    const { apiArtifacts , enums , gqlSchema , openApi  } = await refine(fileContent);
    const writeApiArtifacts = (apiArtifacts1, outputDir1)=>writeOutputFile(join1(outputDir1, `apiArtifacts.json`), stringify1(apiArtifacts1, null, 2))
    ;
    const writeTsTypes = (enums1, outputDir1)=>writeOutputFile(join1(outputDir1, `tsTypes.ts`), printEnums(enums1))
    ;
    const writeGraphQLSchema = (gqlSchema1, outputDir1)=>writeOutputFile(join1(outputDir1, `schema.graphql`), mod3.printSchema(gqlSchema1))
    ;
    const writeOpenAPIJson = (oasDocument, outputDir1)=>writeOutputFile(join1(outputDir1, `openapi.json`), stringify1(oasDocument, null, 2))
    ;
    await Promise.all([
        writeApiArtifacts(apiArtifacts, outputDir),
        writeGraphQLSchema(gqlSchema, outputDir),
        writeOpenAPIJson(openApi, outputDir),
        writeTsTypes(enums, outputDir), 
    ]);
    log(mod5.green(`ALL DONE`));
};
export { main1 as main };
