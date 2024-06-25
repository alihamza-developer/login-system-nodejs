// Has attribute
$.fn.hasAttr = function (attrName) {
    let attr = false;
    if ($(this).length > 0) {
        if ($(this).get(0).hasAttribute(attrName)) attr = true;
    }
    return attr;
}
// Get data attribute value
$.fn.dataVal = function (dataName, defaultValue = false) {
    let attrVal = defaultValue;
    if ($(this).hasAttr("data-" + dataName)) {
        attrVal = $(this).attr("data-" + dataName);
    }
    return attrVal;
}
// dnone jquery Display toggle
$.fn.dnone = function (toggle = true) {
    if (toggle) {
        $(this).addClass("d-none");
    } else {
        $(this).removeClass("d-none");
    }
}
// Bootstrap Tooltips
function bsTooltips() {
    if (!$.isFunction($.fn.tooltip)) return false;
    $('[title]:not([data-toggle="popover"],.no-tooltip').tooltip({
        trigger: 'hover'
    });
    $('[title]:not([data-toggle="popover"],.no-tooltip').on("click", function () {
        $(".tooltip").remove();
    });
    $('[title]:not([data-toggle="popover"])').on("click", function () {
        $(".tooltip").remove();
    });
    $("[data-toggle='popover']:not('.clickable')").popover({ trigger: "hover" });
    $(".clickable[data-toggle='popover']").popover({
        container: 'body'
    });
}

// Get all attributes for element
$.fn.attrs = function () {
    let attrs = {};
    if (!$(this).length) return attrs;
    $.each(this.attributes, function () {
        if (this.specified) {
            attrs[this.name] = this.value;
        }
    });
    return attrs;
}
// Get tag name of jqueyr elememnt
$.fn.tagName = function () {
    return $(this).get(0).tagName.toLowerCase();
}
// Get Input type
$.fn.inputType = function () {
    let tag = $(this).tagName(),
        type = tag;
    if (tag === "input") {
        if (["checkbox", "radio"].includes($(this).attr("type"))) {
            type = $(this).attr("type")
        } else if ($(this).attr("type") == "file") {
            type = "file";
        }
    }
    return type;
}
// Check if checked
$.fn.isChecked = function () {
    return $(this).is(":checked");
}
// Get Selector of element
jQuery.fn.extend({
    getPath: function () {
        var pathes = [];

        this.each(function (index, element) {
            var path, $node = jQuery(element);

            while ($node.length) {
                var realNode = $node.get(0), name = realNode.localName;
                if (!name) { break; }

                name = name.toLowerCase();
                var parent = $node.parent();
                var sameTagSiblings = parent.children(name);

                if (sameTagSiblings.length > 1) {
                    var allSiblings = parent.children();
                    var index = allSiblings.index(realNode) + 1;
                    if (index > 0) {
                        name += ':nth-child(' + index + ')';
                    }
                }

                path = name + (path ? ' > ' + path : '');
                $node = parent;
            }

            pathes.push(path);
        });

        return pathes.join(',');
    }
});
// Check if file
const isFile = data => data.lastModified && data.size;
// Ajax function
fn.ajax = (url, data = {}, success = null, error = null, options = {}) => {
    let isContainFile = false;
    let formData = new FormData();
    for (let key in data) {
        let value = data[key];
        // Check if is file
        if (Array.isArray(value)) {
            if (value.length) {
                if (isFile(value[0])) {
                    Array.from(value).forEach(file => {
                        formData.append(`${key}[]`, file);
                    });
                    isContainFile = true;
                    continue;
                }
            }
        } else if (isFile(value)) {
            isContainFile = true;
        }
        formData.append(key, value);
    }
    if (isContainFile)
        data = formData;
    let type = options.type || "POST",
        dataType = options.dataType || "json",
        settings = {
            url,
            type,
            dataType,
            data: data,
        };
    if (success) settings.success = success;
    if (error) settings.error = error;
    if (isContainFile) {
        settings.cache = false;
        settings.processData = false;
        settings.contentType = false;
    }
    $.ajax(settings);
}
$.fn.addClassOneTime = function (className) {
    if ($(this).hasClass(className)) return false;
    $(this).addClass(className);
}