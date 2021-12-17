import { OptionsExplora } from "./OptionsExplora.js";
let Option = new OptionsExplora();
$(document).on('ready', () => {
    Option.Initial();
    $(document).on('click', '.btn-home-initial', () => {
        $("#buscador, .main-menu, .main-detail, .main-pilas,.main-historico").empty();
        Option.Initial();
    });
    $(document).on('click', '.btn-see-more', function () {
        let id = $(this).data("id");
        Option.DetailPilas(id, true, 0);
    });
    $(document).on('click', '.btn-back-elements', () => { Option.PrincipalPilas(); });
    $(document).on('click', '.btn-close-banner', () => { $('#bannerRotativo').slideUp(); });
    $(document).on('click', '.btn-history', () => {
        $("#buscador, .main-detail, .main-pilas").slideUp();
        $("#buscador, .main-menu, .main-detail, .main-pilas").empty();
        $(".main-historico").show();
        Option.HistoricalPilas();
    });
    $(document).on('click', '.btn-anchoring', function () {
        let element = $(this);
        Option.AnchoringElement(element);
    });
    $(document).on("click", '.btn-send-answer', () => { Option.SendAnswer(); });
    $(document).on('click', '.item-pilas-historico', function () {
        let old = $(this).data("old");
        let id = $(this).data("id");
        $('.contenidos, .main-menu').empty().show();
        $("#buscador").hide();
        Option.DetailPilas(id, false, old);
    });
    $(document).on('click', '.btn-identity', function () {
        let type = $(this).data("type");
        let url = $(this).data("action");
        let title = $(this).data("title");
        Option.DeployModalMenu(type, url, title);
    });
    $(document).on('click', '.btn-aside', function () {
        var url = $(this).data("action");
        window.open(url);
    });
    $(document).on("click", '.btn-menu-superior', function () {
        let self = $(this);
        $('.contenidos').show();
        $(".main-menu, .main-detail").empty();
        $("#buscador, .main-detail, .main-historico, .main-pilas").slideUp();
        if (!self.hasClass('open')) {
            Option.MenuPrincipal();
        }
        else {
            Option.ReturnInitial();
        }
        $(self).toggleClass('open');
    });
    $(document).on('keyup', ".autocomplete-searcher", function () {
        let value = GetVal($(this).val());
        if (value.toString().length > 3) {
            $(".main-menu,.main-pilas,.main-historico").empty().hide();
            $("#buscador").show();
            Option.SearchElements(value);
        }
    });
    $(document).on("click", '.btn-more-pilas', function () { Option.MorePilas(); });
    function GetVal(value) {
        if (typeof value === undefined) {
            return "";
        }
        else
            return value;
    }
});
