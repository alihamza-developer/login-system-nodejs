fn._file = {
    files: [],
    fileId: 0,
    fileInputId: 0,
    get: function (type, data) {
        switch (type) {
            case "singleFile":
                return this.files.find(file => file.id === data);
                break
            case "files":
                data = data.toString();
                let filesIds = data.split(","),
                    files = [];
                filesIds.forEach(id => {
                    this.files.forEach(file => {
                        if (file.id == id) {
                            files.push(file);
                        }
                    })
                });
                return files;
                break;
            case "inputFiles":
                let inputId = data,
                    inputFiles = [];
                this.files.forEach(file => {
                    if (file.inputId == inputId)
                        inputFiles.push(file);
                });
                return inputFiles;
                break;
            case "fileIcon":
                let filename = data,
                    ext = filename.split(".").pop().toLowerCase(),
                    icon = ext in this.icons ? this.icons[ext] : this.icons['default'],
                    imageExt = ['jpg', 'jpeg', 'png', 'gif'];
                index = imageExt.indexOf(ext);
                if (index > -1) {
                    if (imageExt[index]) {
                        icon = "image";
                    }
                }

                return icon;
                break;
            default:
                break;
        }
    },
    icons: {
        'pdf': '<i class="far fa-file-pdf"></i>',
        'docx': '<i class="far fa-file-alt"></i>',
        'zip': '<i class="far fa-file-archive"></i>',
        'mp4': '<i class="far fa-file-video"></i>',
        'default': '<i class="far fa-file"></i>',
    },
    set: function (type, data = {}) {
        if (type === "filesData") {
            let $input = $(data),
                $parent = $input.parents(".file-input-group"),
                txt = "Drop/Paste Files here to upload",
                files = this.get("inputFiles", $input.attr("input-id")),
                filesLength = files.length;

            if (filesLength) {
                txt = `${filesLength} file${filesLength > 1 ? "s" : ""} selected`;
                if (!$input.hasAttr("multiple"))
                    txt = files[0].name;
            }
            $parent.find(".files-name").val(txt);
            // Set Files names
            let $filesDropdown = $parent.find(".files-data");
            if (!$filesDropdown.length) return true;
            // $filesDropdown.html(``);
            files.forEach(file => {
                let isFileExists = false;
                if ($filesDropdown.length) {
                    $filesDropdown.find("p").remove()
                }
                $filesDropdown.find(`.file[data-id="${file.id}"]`).each(function () {
                    isFileExists = true;
                })
                if (isFileExists) return true;

                let filename = file.name,
                    icon = this.get("fileIcon", file.name),
                    size = bytesToSize(file.size),
                    maxFileName = $parent.data("maxFileName"),
                    fileName = file.name.length > maxFileName ? file.name.substring(0, maxFileName) + "..." : file.name;

                if (icon == "image") {
                    let imageSrc = URL.createObjectURL(file);
                    icon = `<div class="icon-image" style="background-image: url('${imageSrc}')"></div>`;
                }
                $filesDropdown.append(`
                <div class="file" data-id="${file.id}">
                <div class="file-content">
                <span class="file-name">${fileName}</span>
                    <div class="icon mt-3">
                        ${icon}
                    </div>
                    <i class="fas fa-times file-remove-btn"></i>
                    <a class="download-btn btn">Download</a>
                    </div>
                </div>`);
            });
            if (!filesLength) $filesDropdown.html(`<p class="p-2">No File Selected</p>`);
        } else if (type === "files") {
            // Some Variables
            let { element, files } = data,
                $parent = $(element).parents(".file-input-group"),
                $fileInput = $parent.find(".file-input"),
                fileInputId = $fileInput.attr("input-id");
            if (!$parent.length) return false;
            // Delete old files
            if (!$fileInput.hasAttr("multiple"))
                this.delete("inputFiles", fileInputId);
            // Append new files
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                file.id = ++fn._file.fileId;
                file.inputId = fileInputId;
                fn._file.files.push(file);
            }
            // Show files data on element
            this.set("filesData", $fileInput);
            fn._handle($fileInput, null, "change");
        }
    },
    // Delete
    delete: function (type, data = {}) {
        if (type === "inputFiles") {
            let inputsIds = [];
            if (typeof data === "string")
                inputsIds = [data];
            else if ($(data).length) {
                let $element = $(data);
                if ($element.tagName() !== "input")
                    $element = $element.find(".file-input");
                $element.each(function () {
                    if ($element.hasClass("file-input"))
                        inputsIds.push($(this).attr("input-id"));
                });

            }

            // Get file id for delete
            let deletedFiles = [];
            inputsIds.forEach(inputId => {
                this.files.forEach((file, i) => {
                    if (file.inputId == inputId)
                        deletedFiles.push(file.id);
                });
            });

            deletedFiles.forEach(fileId => {
                this.delete("file", fileId);
            });
            inputsIds.forEach(function (inputId) {
                $(`.file-input[input-id="${inputId}"]`).each(function () {
                    fn._file.set("filesData", $(this));
                });
            });
        } else if (type === "file") {
            let fileId = data;
            this.files.forEach((file, i) => {
                if (file.id == fileId) {
                    this.files.splice(i, 1);
                }
            });
        }
    },
    initFileSystem: function () {
        $(`input[type="file"].file-input:not([input-id])`).each(function () {
            // Settings
            let settings = $(this).dataVal("settings", "{}"),
                settingsData = [];
            if (isJson(settings)) {
                settings = JSON.parse(settings);
                for (let key in settings) {
                    let value = settings[key];
                    value = JSON.stringify(value);
                    key = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    settingsData.push({
                        key: key,
                        value: value
                    });
                }
            }
            // If HTML is already there
            let $parent = $(this).parents(".file-input-group"),
                fileInput = $(this);
            if ($parent.length) {
                settingsData.forEach(item => {
                    item.key = item.key.replace(/\_/g, "-");
                    $parent.attr(`data-${item.key}`, item.value);
                });
            } else {
                // Clone input if html is not there
                fileInput = $(this).clone();
            }
            // Set id
            fileInput.attr("input-id", ++fn._file.fileInputId);
            // Required Attributes
            if (this.hasAttribute("required")) {
                fileInput.removeAttr("required");
                fileInput.attr("data-required", true);
            }
            // If html already there
            if ($parent.length) return true;
            // Set New HTML of fn file input
            let filesInfoHtml = `<div class="files-data"><p class="p-2">No File Selected</p></div>`,
                filesLength = "s";

            if (!this.hasAttribute("multiple")) {
                filesInfoHtml = ``;
                filesLength = ``;
            }
            fileInput = fileInput.get(0).outerHTML;

            settingsData = settingsData.map(item => `data-${item.key}="${item.value}"`).join(' ');
            $(`<div class="input-group file-input-group" ${settingsData}>
                <input class="form-control files-name" title="Drop/Paste File${filesLength} here to upload" placeholder="Upload File${filesLength}" readonly>
                <label class="input-group-txt" title="Click here to select file${filesLength}">
                    <span><i class="fas fa-folder"></i></span>
                    ${fileInput}
                </label>
                ${filesInfoHtml}
            </div>`).insertBefore($(this));
            $(this).remove();
        });
    }
};
fn._file.initFileSystem();
// show files numbers
$(document).on("change", ".file-input", function () {
    fn._file.set('files', {
        element: this,
        files: this.files,
    });
    $(this).val('');
});
// Remove File
$(document).on("click", '.file-input-group .file .file-remove-btn', function () {
    let $parent = $(this).parents(".file-input-group"),
        fileId = $(this).parents(".file").data("id"),
        $fileInput = $parent.find(".file-input");
    fn._file.delete("file", fileId);
    $(this).parents(".file").remove();
    fn._file.set("filesData", $fileInput);
});
// On Paste
$(document).on("paste", ".file-input-group .files-name", function (e) {
    let inputGroup = $(this).parents(".file-input-group"),
        items = e.originalEvent.clipboardData.items,
        fileInput = inputGroup.find(`input[type='file'].file-input`);
    if (fileInput.length < 1) return true;
    let files = [];
    if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            let file = items[i].getAsFile();
            if (file) files.push(file);
        }
    }
    fn._file.set('files', {
        element: fileInput,
        files: files
    })
});
// On Drag over/start
$(document).on("dragenter dragover", ".file-input-group", function (e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    if (data.types && (data.types.indexOf ? data.types.indexOf('Files') != -1 : data.types.contains('Files'))) {
        $(this).addClass("dragover");
    }
});
$(document).on("drop", ".file-input-group", function (e) {
    e.preventDefault();
    $(this).removeClass("dragover");
    let dt = e.originalEvent.dataTransfer;
    let files = dt.files;

    let inputGroup = $(this),
        fileInput = inputGroup.find(`input[type='file'].file-input`);
    if (fileInput.length < 1) return true;

    fn._file.set("files", {
        element: fileInput,
        files: files
    });
});
// On Drag leave
$(document).on("dragleave", ".file-input-group", function (e) {
    e.preventDefault();
    $(this).removeClass("dragover");
});