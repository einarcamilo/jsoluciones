import { Banner } from "./Banner.js";
import { MenuExplora } from "./MenuExplora.js";
import { Pilas } from "./Pilas.js";
import { Users } from "./Users.js";
import { Evaluation } from "./Evaluation.js";
import { Searcher } from "./Search.js";
export class OptionsExplora {
    constructor() {
        this.User = new Users();
        this.Banner = new Banner();
        this.Pilas = new Pilas();
        this.Evaluations = new Evaluation();
        this.MenuExplora = new MenuExplora();
        this.Search = new Searcher();
    }
    Initial() {
        this.Pilas.GetExplora(this.User.user.usuario);
        this.ReturnInitial();
    }
    DetailPilas(id, exist, old = 0) {
        this.Pilas.GetById(id, exist, old);
    }
    PrincipalPilas() {
        $(".main-details").empty();
        this.ReturnInitial();
    }
    HistoricalPilas() {
        this.Pilas.GetHistorical();
    }
    SendAnswer() {
        let id = $('.btn-send-answer').data("id_pilas");
        let result = this.Evaluations.SendAnswer(id);
        this.Pilas.CheckRead(id, result);
    }
    AnchoringElement(element) {
        let id = $(element).data("id");
        let value = parseInt($(element).data("value"), 10);
        value = value == 0 ? 1 : 0;
        if (this.Pilas.Anchoring(id, value)) {
            this.OrderAnchored(element, value);
        }
    }
    DeployModalMenu(type, url, title) {
        this.MenuExplora.OpenModals(type, url, title);
    }
    MenuPrincipal() {
        this.MenuExplora.GetMain();
    }
    SearchElements(value) {
        this.Search.Get(value);
    }
    MorePilas() {
        $(".btn-more-pilas").prop('disabled', true);
        $(".btn-more-pilas").append("&nbsp;&nbsp;<i class='fas fa-spinner fa-spin'></i>");
        let quantity = $(".btn-more-pilas").data('quantity');
        this.Pilas.GetExplora(this.User.user.usuario, quantity);
    }
    ReturnInitial() {
        let buscador = $(".main-buscador").html();
        let historico = $(".main-historico").html();
        if (buscador.length > 0) {
            $(".main-buscador").slideDown();
        }
        else if (historico.length > 0) {
            $(".main-historico").slideDown();
        }
        else {
            $(".main-pilas").slideDown();
        }
    }
    OrderAnchored(element, value) {
        let text = value == 0 ? "Desanclar este elemento" : "Anclar este elemento";
        $(element).attr({
            "data-value": value,
            "data-bs-original-title": text,
            "aria-label": text
        }).toggleClass("btn-anchoring-active btn-anchoring-inactive");
        let card = $(element).closest('.element-pilas').html();
        let initial = 0, breaking = 0;
        $(".main-pilas").find('.element-pilas').each(function () {
            if (initial == 1) {
                $(this).find(".btn-anchoring").attr({
                    "data-value": 1,
                    "data-bs-original-title": "Anclar este elemento",
                    "aria-label": "Anclar este elemento"
                }).addClass("btn-anchoring-inactive").removeClass("btn-anchoring-active");
            }
            if ($(this).find(".btn-anchoring").hasClass("btn-anchoring-active")) {
                initial++;
            }
            if (breaking == 3) {
                return false;
            }
            breaking++;
        });
        $(element).closest('.element-pilas').remove();
        $(".main-pilas").find('.element-pilas').first().before(`<div class="col-4 element-pilas">${card}</div>`);
    }
}
