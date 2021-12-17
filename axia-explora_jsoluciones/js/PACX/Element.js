var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Utilities } from "./Utilities.js";
export var TypesElement;
(function (TypesElement) {
    TypesElement["Operations"] = "Operations";
    TypesElement["Channels"] = "Channels";
    TypesElement["Kpis"] = "Kpis";
    TypesElement["Ally"] = "Ally";
    TypesElement["Regional"] = "Regional";
    TypesElement["Centers"] = "Centers";
    TypesElement["Segments"] = "Segments";
    TypesElement["Causes"] = "Causes";
})(TypesElement || (TypesElement = {}));
;
export class Element {
    constructor() {
        this.Operations = new Array();
        this.Channels = new Array();
        this.Causes = new Array();
        this.util = new Utilities();
        this.LocalAPI = `${this.util.API}Elements/`;
    }
    GetType(type) {
        return type === "Centro de Experiencia" ? TypesElement.Centers : TypesElement.Segments;
    }
    static getInstance() {
        if (!Element.instance) {
            Element.instance = new Element();
        }
        return Element.instance;
    }
    Initial() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let header = { headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    } };
                let responseOper = yield fetch(`${this.LocalAPI}Index/${TypesElement.Operations}`, header);
                let responseChannel = yield fetch(`${this.LocalAPI}Index/${TypesElement.Channels}`, header);
                let responseCauses = yield fetch(`${this.LocalAPI}Index/${TypesElement.Causes}`, header);
                this.Operations = yield responseOper.json();
                this.Channels = yield responseChannel.json();
                this.Causes = yield responseCauses.json();
            }
            catch (error) {
                console.error("Elements error", error);
            }
        });
    }
    DrawElements() {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = null || document.getElementById("channels_list");
            let operation = null || document.getElementById("operations_list");
            if (channel !== null) {
                yield this.ChannelsOptions(channel);
            }
            if (operation !== null) {
                operation.innerHTML = `<label class="textAzulMovistar" for="operation">Seleccione Operación</label>${this.SelectList("operation", this.Operations)}`;
            }
                yield this.util.ValidateMandatory();
        });
    }
    GetKpi(value = "") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (value.length <= 0) {
                    const channel = document.getElementById('channel');
                    value = channel.value;
                }
                let header = { headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    } };
                let responseKpi = yield fetch(`${this.LocalAPI}Get/?types=${TypesElement.Kpis}&value=${value}`, header);
                return yield responseKpi.json();
            }
            catch (error) {
                console.error("Elements error", error);
            }
        });
    }
    SelectList(name, list, mandatory = true, text = "Seleccione") {
        let _class = mandatory ? "mandatory" : "";
        let required = mandatory ? "required" : "";
        let select = `
    <select ${required} class="custom-select ${_class}" name="${name}" id="${name}">
      <option value="">${text}</option>
      ${list.map(l => `<option value="${l.Id}">${l.Name}</option>`).join("")}
    </select>
    `;
        return select;
    }
    GetCauses() {
        let select = this.SelectList("cause", this.Causes, true, "Seleccione causa raíz");
        return select;
    }
    GetCause(Id) {
        let cause = this.Causes.find(c => c.Id == Id);
        return cause;
    }
    ChannelsOptions(channel) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let channels = this.Channels.length == 1 ?
                `<label class="textAzulMovistar" for="channel">Canal de gestión</label>
                 <h5 class="textAzulMovistar mt-2">${this.Channels[0].Name}</h5>
                 <input type="hidden" name="channel" id="channel" value="${this.Channels[0].Id}" />` :
                `<label class="textAzulMovistar" for="channel">Seleccione el canal de gestión</label>
                 ${this.SelectList("channel", this.Channels)}
      `;
            channel.innerHTML = channels;
            if (this.Channels.length == 1) {
                yield this.KpiOptions(String(this.Channels[0].Id));
                yield this.AllyOptions();
            }
            else {
                (_a = document.getElementById("channel")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", () => {
                    yield this.KpiOptions();
                    yield this.AllyOptions();
                });
            }
        });
    }
    KpiOptions(value = "") {
        return __awaiter(this, void 0, void 0, function* () {
            let kpi = null || document.getElementById("kpis_list");
            let KpiList = yield this.GetKpi(value);
            if (kpi !== null) {
                kpi.innerHTML = `<label class="textAzulMovistar" for="kpi">Seleccione el KPI</label>
        ${this.SelectList("kpi", KpiList)}`;
                let kpiSelect = document.getElementById("kpi");
                kpiSelect.addEventListener("change", (e) => {
                    let value = Number(kpiSelect.value);
                    let description = KpiList.filter((k) => k.Id == value)[0].Description;
                    let ele = document.getElementsByClassName("feedback");
                    Array.from(ele).forEach(r => r.remove());
                    let div = document.createElement("div");
                    div.classList.add("feedback");
                    div.textContent = description;
                    kpiSelect.after(div);
                });
            }
            this.util.ValidateMandatory();
        });
    }
    AllyOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            let values = new Array();
            let channel = document.querySelector("#channel");
            let label = "";
            if (channel.value.length > 0 && channel != undefined) {
                let option = parseInt(channel.value, 10) == 1 ? TypesElement.Regional : TypesElement.Ally;
                label = parseInt(channel.value, 10) == 1 ? TypesElement.Regional : "Aliado";
                values = yield this.GetAllies(option);
            }
            let ally_list = null || document.getElementById("allys_list");
            if (ally_list !== null) {
                ally_list.innerHTML = `
      <label class="textAzulMovistar" for="ally">Seleccione el ${label}</label>
      ${this.SelectList("ally", values, true)}
      `;
            } //TODO: Finish the selected options
            this.util.ValidateMandatory();
        });
    }
    GetAllies(option) {
        return __awaiter(this, void 0, void 0, function* () {
            let values = new Array();
            try {
                let header = { headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    } };
                let responseAlly = yield fetch(`${this.LocalAPI}Index/${option}`, header);
                values = yield responseAlly.json();
            }
            catch (error) {
                console.error("Elements error", error);
            }
            return values;
        });
    }
}
