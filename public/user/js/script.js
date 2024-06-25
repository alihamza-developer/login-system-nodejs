// #region Sidebar links dropdown
$(document).on("click", ".sidebar .nav .nav-item.with-sub-menu > .nav-link", function (e) {
    e.preventDefault();
    let $li = $(this).parent();
    let $submenu = $li.find(".sub-menu");
    $submenu.slideToggle(300);
    $li.toggleClass("active", !$li.is(".active"));
});
// #endregion Sidebar links dropdown
// #region Sidebar links active
function activeSidebarLink() {
    let url = window.location.href.split("/").pop(),
        $li = $(`.sidebar .nav .nav-link[href="${url}"]`).parent();
    if ($li.parents(".nav-item").length > 0) {
        $li.parents(".nav-item").children('.nav-link').trigger("click");
    }
    $li.addClass("active");
}
activeSidebarLink();
// #endregion Sidebar links active