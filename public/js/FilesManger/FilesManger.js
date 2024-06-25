class FilesManager {
    constructor() {
        this.FN = fn;
        this.files = [];
        this.fileId = 0;
        this.fileInputId = 0;
        this.icons = {
            'pdf': '<i class="far fa-file-pdf"></i>',
            'docx': '<i class="far fa-file-alt"></i>',
            'zip': '<i class="far fa-file-archive"></i>',
            'mp4': '<i class="far fa-file-video"></i>',
            'default': '<i class="far fa-file"></i>',
        };
    }
    // Init 
    init() {
        let self = this;
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
            let $parent = $(this).parents(".file-input-group");
            let fileInput = $(this);

            if ($parent.length) {
                settingsData.forEach(item => {
                    item.key = item.key.replace(/\_/g, "-");
                    $parent.attr(`data-${item.key}`, item.value);
                });
            } else fileInput = $(this).clone();// Clone input if HTML is not there

            // Set id
            fileInput.attr("input-id", ++self.fileInputId);
            // Required Attributes
            if (this.hasAttribute("required")) {
                fileInput.removeAttr("required");
                fileInput.attr("data-required", true);
            }

            // If HTML is already there
            if ($parent.length) return true;

            // Set New HTML of fn file input
            let filesInfoHtml = `<div class="files-data"><p class="p-2">No File Selected</p></div>`,
                filesLength = "s";
            // Check if not is multiple
            if (!this.hasAttribute("multiple")) filesInfoHtml = filesLength = '';

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
    // Get Files
    get(type, data) {
        let self = this;
        switch (type) {
            case "singleFile":
                return this.files.find(file => file.id === data);
            case "files":
                data = data.toString();
                let filesIds = data.split(","),
                    files = [];
                // Get files by id
                filesIds.forEach(id => {
                    self.files.forEach(file => {
                        if (file.id == id) files.push(file);
                    });
                });
                return files;
            case "inputFiles":
                let inputId = data,
                    inputFiles = [];
                self.files.forEach(file => {
                    if (file.inputId == inputId)
                        inputFiles.push(file);
                });
                return inputFiles;
            case "fileIcon":
                let filename = data,
                    ext = filename.split(".").pop().toLowerCase(),
                    icon = ext in this.icons ? this.icons[ext] : this.icons['default'],
                    imageExt = ['jpg', 'jpeg', 'png', 'gif'],
                    index = imageExt.indexOf(ext);
                if (index > -1)
                    if (imageExt[index]) icon = "image";

                return icon;
            default:
                break;
        }
    }
    // Set Files
    set(type, data = {}) {
        if (type === "filesData") {
            let $input = $(data),
                $parent = $input.parents(".file-input-group"),
                txt = "Drop/Paste Files here to upload",
                files = this.get("inputFiles", $input.attr("input-id")),
                filesLength = files.length;

            if (filesLength) {
                txt = `${filesLength} file${filesLength > 1 ? "s" : ""} selected`;
                if (!$input.hasAttr("multiple")) txt = files[0].name;
            }

            $parent.find(".files-name").val(txt);

            // Set Files names
            let $filesDropdown = $parent.find(".files-data");
            if (!$filesDropdown.length) return true;
            if (!$filesDropdown.hasClass("active"))
                $filesDropdown.addClass("active"); // Show Files Dropdown
            files.forEach(file => {
                let isFileExists = false;
                if ($filesDropdown.length) {
                    $filesDropdown.find("p").remove();
                }
                $filesDropdown.find(`.file[data-id="${file.id}"]`).each(function () {
                    isFileExists = true;
                });

                if (isFileExists) return true;

                let icon = this.get("fileIcon", file.name),
                    maxFileName = $input.attr("data-max-filename"),
                    fileName = file.name.length > maxFileName ? file.name.substring(0, maxFileName) + "..." : file.name;
                if (icon == "image") {
                    let imageSrc = URL.createObjectURL(file);
                    icon = `<img src="${imageSrc}" class="icon-image" alt="${fileName}">`;
                }

                $filesDropdown.append(`
                    <div class="file" data-id="${file.id}">
                        <i class="fas fa-times file-remove-btn"></i>
                        <div class="file-content">
                            <div class="icon mt-3">
                                ${icon}
                            </div>
                            <span class="file-name">${fileName}</span>
                        </div>
                    </div>
                `);
            });

            if (!filesLength) $filesDropdown.removeClass('active');
        } else if (type === "files") {
            // Some Variables
            let { element, files } = data,
                $parent = $(element).parents(".file-input-group"),
                $fileInput = $parent.find(".file-input"),
                fileInputId = $fileInput.attr("input-id");

            if (!$parent.length) return false;

            // Delete old files
            if (!$fileInput.hasAttr("multiple")) this.delete("inputFiles", fileInputId);

            // Append new files
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                file.id = ++this.fileId;
                file.inputId = fileInputId;
                this.files.push(file);
            }

            // Show files data on element
            this.set("filesData", $fileInput);
            this.FN._handle($fileInput, null);
        }
    }
    // Delete Files
    delete(type, data = {}) {
        let self = this;
        if (type === "inputFiles") {
            let inputsIds = [];
            if (typeof data === "string") inputsIds = [data];
            else if ($(data).length) {
                let $element = $(data);
                if ($element.tagName() !== "input") $element = $element.find(".file-input");
                $element.each(function () {
                    if ($element.hasClass("file-input")) inputsIds.push($(this).attr("input-id"));
                });
            }

            // Get file id for delete
            let deletedFiles = [];
            inputsIds.forEach(inputId => {
                self.files.forEach((file, i) => {
                    if (file.inputId == inputId) deletedFiles.push(file.id);
                });
            });

            deletedFiles.forEach(fileId => {
                self.delete("file", fileId);
            });

            inputsIds.forEach(function (inputId) {
                $(`.file-input[input-id="${inputId}"]`).each(function () {
                    self.set("filesData", $(this));
                });
            });
        } else if (type === "file") {
            let fileId = data;
            self.files.forEach((file, i) => {
                if (file.id == fileId) self.files.splice(i, 1);
            });
        }
    }
}
