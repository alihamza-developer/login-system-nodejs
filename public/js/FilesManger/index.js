/*
    😎😎😎😎😎😎😎 Awesome Code Writen by Ali Hamza
    Expected HTML Format
    *Static Classes*: ['file-input-group','files-data','file-input'] // Don't changable classes

    Note:
        You can write css whatever you want for this

    <div class="file-input-group">
        <div class="files-data"></div>

        <label class="btn">
            <i for="files" class="fa fa-file"></i> 
            <input type="file" data-max-filename="{MAX_FILENAME_LENGTH}" class="file-input d-none" multiple id="files">
        </label>

    </div>
*/

// Init Files Manager
const filesManager = new FilesManager();
// Add event listeners
$(document).on("change", ".file-input", function () {
    filesManager.set('files', {
        element: this,
        files: this.files,
    });
    $(this).val('');
});
// Remove File
$(document).on("click", '.file-input-group .file .file-remove-btn', function () {
    let $parent = $(this).parents(".file-input-group"),
        $file = $(this).parents(".file"),
        fileId = $file.data("id"),
        $fileInput = $parent.find(".file-input");

    filesManager.delete("file", fileId);
    $file.remove();
    filesManager.set("filesData", $fileInput);
});
// On Paste
$(document).on("paste", ".file-input-group .files-name", function (e) {
    let inputGroup = $(this).parents(".file-input-group");
    let items = e.originalEvent.clipboardData.items;
    let fileInput = inputGroup.find(`input[type='file'].file-input`);
    if (fileInput.length < 1) return true;
    let files = [];
    if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            let file = items[i].getAsFile();
            if (file) files.push(file);
        }
    }
    filesManager.set('files', {
        element: fileInput,
        files: files
    })
});
// Drag and Drop
$(document).on("dragenter dragover", ".file-input-group", function (e) {
    e.preventDefault();
    let data = e.originalEvent.dataTransfer;
    if (data.types && (data.types.indexOf ? data.types.indexOf('Files') != -1 : data.types.contains('Files'))) {
        $(this).addClass("dragover");
    }
});
// On Drop File/Files
$(document).on("drop", ".file-input-group", function (e) {
    e.preventDefault();
    $(this).removeClass("dragover");
    let dt = e.originalEvent.dataTransfer;
    let files = dt.files;
    let inputGroup = $(this);
    let fileInput = inputGroup.find(`input[type='file'].file-input`);
    if (fileInput.length < 1) return true;
    filesManager.set("files", {
        element: fileInput,
        files: files
    });
});
// On Drag Leave
$(document).on("dragleave", ".file-input-group", function (e) {
    e.preventDefault();
    $(this).removeClass("dragover");
});
