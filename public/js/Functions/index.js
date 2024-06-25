// Callback Functions
const fn = {
    // callbacks
    cb: {},
    // call before
    bc: {},
    _has: function (elem, attrName) {
        let hasCallback = false;
        elem = $(elem);
        if (elem.hasAttr("data-" + attrName)) {
            let callbackName = $(elem).attr("data-" + attrName);
            if (callbackName in this) {
                hasCallback = callbackName;
            }
        }
        return hasCallback;
    },
    _handle: function (elem, parameter = null, attrName = "callback") {
        let callback = $(elem).dataVal(attrName),
            valid = true,
            types = { "callback": "cb", "callbefore": "bc" },
            type = types[attrName] || "fn";

        if (callback) {
            let fns = type === "fn" ? this : this[type];
            if (parameter !== null)
                valid = fns[callback](elem, parameter);
            else
                valid = fns[callback](elem);
        } else {
            callback = $(elem).dataVal(attrName);
            if (callback) {
                console.error('Uncaught TypeError: fn.' + type + '.' + callback + ' is not a function');
                valid = false;
            }
        }
        return valid;
    }
}