import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import appRootPath from "app-root-path";
import bcrypt from 'bcrypt';
import multer from 'multer';
let DEFAULT_UPLOAD_PATH = "./public/images/uploads/";
const SALT_ROUNDS = 10;

// Is Json
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Add Slashes
function addSlashes(str) {
    return str.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}
// Get Ext
function getExt(src, type = false) {
    if (type == 'blob') {
        src = src.split('/').pop();
        src = src.split(';')[0];
        return src;
    }
    let ext = src.split('/').pop();
    return ext.split('.').pop();
}
// Check if is Object Empty
function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
}
// Create Random Key
function createKey(len) {
    let chars = "adeh9i8jklw6xo4bcmnp5q2rs3tu1fgv7yz0ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        key = "";
    for (let i = 0; i < len; i++) {
        key += chars[Math.floor(Math.random() * ((chars.length - 1) + 1))];
    }
    return key;
}
// Generate File Name
function generateName(len, ext, dir = '') {
    let name = createKey(len);

    ext = trim(ext, '.');

    name = `${name}.${ext}`;

    if (fs.existsSync(path.join(appRootPath.path, dir, name))) {
        return generateName(len, ext, dir);
    }
    return name;
}
// Escape HTML
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
// Decode HTML
function decodeHtml(text) {
    if (typeof (text) !== "string") return false;
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) { return map[m]; });
}
// Check if is Object
function isObject(obj) {
    return (typeof obj === "object" && obj !== null && !Array.isArray(obj))
}
// Get Obj Val
function objVal(obj, key, defaultValue = false) {
    return (obj[key] !== undefined) ? obj[key] : defaultValue;
}
// Merge Path
function mergePath(...paths) {
    let url = '';
    paths.forEach(path => {
        path = trim(path);
        path = trim(path, '/');
        if (path.length) url += `/${path}`;
    });
    url = trim(url, '/');
    return url;
}
// Trim Function
function trim(str, charlist) {
    let whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u200b', '\u2028', '\u2029', '\u3000'].join('')
    let l = 0
    let i = 0
    str += ''
    if (charlist) {
        whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
    }
    l = str.length
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i)
            break
        }
    }
    l = str.length
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1)
            break
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
}
// HTML Special Chars Decode
function htmlspecialcharsDecode(text) {
    if (typeof (text) !== "string") return false;
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) { return map[m]; });
}
// Check if is image file
function isImageFile(filename) {
    let allowedExt = ['jpg', 'png', 'jpeg', 'gif', 'jfif'];
    let ext = filename.split('.').pop().toLowerCase();
    if (allowedExt.includes(ext)) {
        return true;
    } else {
        return false;
    }
}


function isFile(item) {
    return item instanceof File;
}

// Success function 
function success(data, res, options = {}) {
    let jsonData = {
        status: 'success',
        data: data,
        ...options
    };
    res.end(JSON.stringify(jsonData));
}
// Error function
function error(data, res, options = {}) {
    return res.end(JSON.stringify({
        status: 'error',
        data: data,
        ...options
    }));
}
// Month Date
function monthDate(date) {
    let options = { year: 'numeric', month: 'long', day: '2-digit' },
        dateTime = new Date(date),
        finalDate = dateTime.toLocaleDateString('en-US', options);
    return finalDate;
}

//#region Password Hash
function passwordHash(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

function passwordVerify(password, hash) {
    return bcrypt.compareSync(password, hash);
}

//#endregion Password Hash 

function timestamp() {
    return Math.floor(Date.now() / 1000);
}


//#region Multer

// Set Upload Path
function setUploadPath(newPath) {
    DEFAULT_UPLOAD_PATH = newPath;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DEFAULT_UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, generateName(10, path.extname(file.originalname)));
    },
});

const Multer = multer({ storage });
//#endregion Multer 

// SVG Function
function svgIcon(name, size = 14, color = '#fff', height = false) {
    let svgPath = path.join(appRootPath.path, 'public/images/icons', `${name}.svg`),
        svg = fs.readFileSync(svgPath, 'utf8');
    svg = svg.replace('<svg ', `<svg fill="${color}" width="${size}" height="${height || size}"`);
    return svg;
}

export {
    // Multer
    setUploadPath,
    Multer,
    // Fns 
    isJson,
    addSlashes,
    isObjectEmpty,
    createKey,
    escapeHtml,
    decodeHtml,
    isObject,
    objVal,
    mergePath,
    trim,
    htmlspecialcharsDecode,
    generateName,
    isImageFile,
    isFile,
    getExt,
    success,
    error,
    passwordHash,
    passwordVerify,
    timestamp,
    monthDate,
    svgIcon
};