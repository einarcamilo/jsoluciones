var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { States } from "./States.js";
import { Action } from "./Actions.js";
import { Finding } from "./Finding.js";
import { Error404 } from "./Error404.js";
import { Utilities } from "./Utilities.js";
import { Element, TypesElement } from "./Element.js";
import { ActualDate, CompareDate, UpdateOthers } from "../Utilities.js";
export class Plan {
    constructor(path, main) {
        this.util = new Utilities();
        this.PATH = path;
        this.main = main;
        this.elements = Element.getInstance();
        this.dates = new Array();
        this.Months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    }
    Navigate() {
        switch (this.PATH[1]) {
            case undefined:
                this.New();
                break;
            case "lista":
                this.List();
                break;
            case "acciones":
                this.Actions();
                break;
            default:
                let error = new Error404(this.main);
                break;
        }
    }
    Actions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let APIGet = `templates/pacx/pending_actions.html`;
                let response = yield fetch(APIGet);
                let html = yield response.text();
                this.main.innerHTML = html;
                yield this.DrawTableActions();
                let states = document.getElementsByClassName("option-states");
                Array.from(states).forEach(o => o.addEventListener("click", () => {
                    var hidden = document.getElementById("state-form");
                    let state = o;
                    hidden.value = Number(state.dataset.value).toString();
                    Array.from(states).forEach(e => e.classList.remove("selected"));
                    o.classList.add("selected");
                    this.DrawTableActions();
                }));
            }
            catch (error) {
            }
        });
    }
    DrawTableActions() {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = document.getElementById("result-statistics");
            detail.innerHTML = "";
            let divState = document.getElementsByClassName("option-states selected")[0];
            let state = Number(divState.dataset.value);
            let obj = Action.getInstance();
            let actions = yield obj.GetByState(state);
            if (actions.length <= 0) {
                detail.innerHTML = `
      <div class="jumbotron jumbotron-fluid">
        <div class="container">
          <h1 class="display-4">No hay acciones ${divState.innerText}</h1>
          <p class="lead">Para la selecci??n realizada no existen acciones, favor valide e intente nuevamente.</p>
        </div>
      </div>
      `;
            }
            else {
                const thead = `
      <thead>
        <tr>
          <th>Acci??n</th>
          <th>Avance</th>
          <th>Fecha inicio</th>
          <th>Fecha compromiso</th>
          <th>Fecha cierre</th>
          <th>Responsables</th>
          <th>Estado</th>
          <th>Seguimientos</th>
        </tr>
      </thead>
      `;
                const tbody = `
      <tbody>
      ${actions.map(a => {
                    let initial = a.Action.State == 2 ? a.Action.Close_date.toString() : ActualDate();
                    let resultCompare = CompareDate(a.Action.Commitment_date.toString(), initial);
                    let bgBar = resultCompare == 1 ? "success" : resultCompare == 0 ? "warning" : "danger";
                    let icon = a.Action.State == 2 ? `<em class="fas fa-check-double textAzulMovistar"></em>` : `<em class="far"></em>`;
                    return `
        <tr 
            data-affectation="${a.Complements.Affectation_id}"
            data-finding="${a.Complements.Finding_id}"
            data-action="${a.Action.Id}"
            class="border-left-${bgBar} hand detail-action-element">
          <td class="border-left-${bgBar}">${icon}${a.Action.Observation}</td>
          <td><span class="badge badge-${bgBar} badge-pill">${a.Action.Advance}%</span></td>
          <td class="col-1">${a.Action.Initial_date.toString().slice(0, 10)}</td>
          <td class="col-1">${a.Action.Commitment_date.toString().slice(0, 10)}</td>
          <td class="col-1">${a.Action.Close_date.toString().slice(0, 10)}</td>
          <td>${a.Responsables.map(r => (r == null) ? "" : r.Name).join(", ")}</td>
          <td>${States[a.Action.State]}</td>
          <td>
            <ul class="list-group">
            ${a.Tracings.map(t => `
              <li class="list-group-item list-group-item-action">
                <p class="mb-0"><b>${t.Created.toString().slice(0, 10)}</b> ${t.Observation}</p>
                <p class="mb-0 mt-1"><small class="text-muted"><b>Avance:</b> ${t.Advance}%&nbsp;&nbsp;<b>Estado:</b> ${States[t.State]}</small></p>
              </li>
            `).join("")}
            </ul>
          </td>
        </tr>
      `;
                }).join("")}
      </tbody>
      `;
                detail.append(`<table class="table table-hover table-striped">${thead}${tbody}</table>`);
            }
            const actionsDIV = document.getElementsByClassName("detail-action-element");
            Array.from(actionsDIV).forEach(action => { action.addEventListener("click", e => this.DetailAction(action)); });
        });
    }
    GetDates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cont = 0;
                let divYear = document.getElementById("year-container");
                let year = document.createElement("select");
                year.classList.add("custom-select");
                year.id = "year-select";
                let APIGet = `${this.util.API}plan/Dates`;
                let header = {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    }
                };
                let response = yield fetch(APIGet, header);
                this.dates = yield response.json();
                this.dates.forEach(d => {
                    const opt = document.createElement("option");
                    opt.value = d.Year.toString();
                    opt.text = d.Year.toString();
                    year.appendChild(opt);
                    if (cont == 0) {
                        this.SelectMonths(d.Year);
                    }
                    cont++;
                });
                divYear.appendChild(year);
                let yearValue = this.util.NumbersOnlyValidate(year);
                year.addEventListener("change", (e) => { this.SelectMonths(yearValue); this.GetPlanes(); });
            }
            catch (error) {
                new Error(error);
            }
        });
    }
    SelectMonths(year) {
        let divMonths = document.getElementById("months-container");
        let Months = document.createElement("select");
        let selected = this.dates.filter(d => d.Year == year)[0];
        divMonths.innerHTML = "";
        const date = new Date();
        const actualMonth = date.getMonth() + 1;
        Months.classList.add("custom-select");
        Months.id = "months-select";
        selected.Months.forEach(m => {
            const op = document.createElement("option");
            op.value = m.toString();
            op.text = this.Months[m];
            op.selected = actualMonth == m;
            Months.appendChild(op);
        });
        divMonths.appendChild(Months);
        Months.addEventListener("change", () => { this.GetPlanes(); });
    }
    List() {
        return __awaiter(this, void 0, void 0, function* () {
            //let profile = localStorage.getItem("Profile");//TODO Menu by profile better for API
            try {
                let APIGet = `templates/pacx/pending.html`;
                let response = yield fetch(APIGet);
                let html = yield response.text();
                this.main.innerHTML = html;
                yield this.GetDates();
                let options = document.getElementsByClassName("option-list");
                let filter = document.getElementById("for_filter");
                for (let i of this.elements.Channels) {
                    let list = i.Id == 1 ? "ce" : "call";
                    let text = i.Id == 1 ? "Regional" : "Aliado";
                    let value = i.Id == 1 ? "Regional" : "Ally";
                    filter.innerHTML += `
        <div class="border rounded option-element option-list" id="list-${list}" data-value="${value}">Por ${text}</div>
        `;
                }
                Array.from(options).forEach(o => {
                    o.addEventListener("click", () => {
                        Array.from(options).forEach(e => e.classList.remove("selected"));
                        o.classList.add("selected");
                        this.FillElements();
                    });
                });
                let states = document.getElementsByClassName("option-states");
                Array.from(states).forEach(o => o.addEventListener("click", () => {
                    Array.from(states).forEach(e => e.classList.remove("selected"));
                    o.classList.add("selected");
                    this.GetPlanes();
                }));
            }
            catch (error) {
                new Error(error);
            }
        });
    }
    FillElements() {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = document.getElementById("result-statistics");
            detail.innerHTML = "";
            let elements;
            const option = document.getElementsByClassName("option-list selected")[0];
            const div = document.getElementById("option-details");
            div.innerHTML = "";
            if (typeof option != "undefined") {
                const value = option.dataset.value;
                if (value == TypesElement.Kpis) {
                    elements = yield this.elements.GetKpi("all");
                }
                else {
                    elements = yield this.elements.GetAllies(value == TypesElement.Ally ? TypesElement.Ally : TypesElement.Regional);
                }
                elements.forEach(e => {
                    const element = document.createElement("div");
                    element.classList.add("option-detail-item", "border", "rounded", "col-3", "option-element");
                    element.dataset.value = (value == TypesElement.Kpis) ? e.Id.toString() : e.Name;
                    element.innerText = e.Name;
                    element.addEventListener("click", (ev) => { this.FilterOptions(ev); });
                    div.appendChild(element);
                });
            }
        });
    }
    FilterOptions(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const detail = document.getElementById("result-statistics");
            detail.innerHTML = "";
            let selected = document.getElementsByClassName("option-detail-item selected")[0];
            if (typeof selected != "undefined") {
                selected.classList.remove("selected");
            }
            let self = ev.target;
            self.classList.add("selected");
            let channel = document.getElementsByClassName("option-list selected")[0];
            if (channel.dataset.value != TypesElement.Kpis) {
                let type = channel.dataset.value == TypesElement.Regional ? TypesElement.Centers : TypesElement.Segments;
                let allies = yield this.elements.GetAllies(type);
                const divFileter = document.getElementById("option-allies");
                divFileter.classList.add("pt-3");
                let selectText = this.elements.SelectList("option-detail-select", allies, false, "Seleccione para filtrar");
                divFileter.innerHTML = selectText;
                const select = document.getElementById("option-detail-select");
                select.addEventListener("change", () => this.FilterDetail());
            }
            this.GetPlanes();
        });
    }
    New() {
        this.main.innerHTML = `
     <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-body bgGris1">
              <form id="affectation">
                <div class="form-row">
                  <div class="form-group col" id="operations_list"></div>
                  <div class="form-group col" id="channels_list"></div>
                  <div class="form-group col" id="kpis_list">
                    <label class="textAzulMovistar" for="kpi">Seleccione el KPI</label>
                    <select class="custom-select mandatory"><option value="">Seleccione canal</option></select>
                  </div>
                  <div class="form-group col" id="allys_list">
                    <label class="textAzulMovistar" for="kpi">Seleccione el <span class="text-ally"></span></label>
                    <select class="custom-select mandatory"><option value="">Seleccione canal</option></select>
                  </div>
                  <div class="from-group col-2">
                    <button type="submit" id="button" class="btn btn-sm btn-light" style="margin-top:35px">
                    <em class="fas fa-save"></em>&nbsp;&nbsp;Crear hallazgo
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
        this.elements.DrawElements();
        let form = document.getElementById("affectation");
        form.addEventListener("submit", (e) => { this.SaveAffectation(e); });
    }
    SaveAffectation(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            if (this.util.ValidateForm(e)) {
                let form = e.target;
                let obj = {};
                const data = new FormData(form);
                for (let i of data) {
                    obj[i[0]] = i[1];
                }
                try {
                    let APISave = `${this.util.API}plan/new`;
                    let header = {
                        headers: {
                            'Authorization': localStorage.getItem("Token") || "",
                            "Content-Type": " application/json"
                        },
                        method: 'post',
                        body: JSON.stringify(obj)
                    };
                    const response = yield fetch(APISave, header);
                    if (response.status >= 200 && response.status <= 299) {
                        this.planList = (yield response.json());
                        this.ShowDetail();
                    }
                    else if (response.status == 401) {
                        console.error("Unauthorize");
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }
        });
    }
    GetAffectation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let APIGet = `${this.util.API}plan/get/${id}`;
                let header = { headers: { 'Authorization': localStorage.getItem("Token") || "" } };
                const response = yield fetch(APIGet, header);
                if (response.status >= 200 && response.status <= 299) {
                    this.planList = (yield response.json());
                    yield this.ShowDetail();
                }
            }
            catch (error) {
            }
        });
    }
    ShowDetail() {
        return __awaiter(this, void 0, void 0, function* () {
            const modal = document.getElementById("DetailContents");
            let response = yield fetch("templates/PACX/findings.html");
            let html = yield response.text();
            modal.getElementsByClassName("modal-body")[0].innerHTML = html;
            modal.getElementsByClassName("modal-title")[0].innerHTML = `<em class="fas fa-book"></em>&nbsp;${this.planList.Affectation.Kpi} - ${this.planList.Affectation.Operation} - <span id="AllyName" data-value="${this.planList.Affectation.Ally}">${this.planList.Affectation.Ally}</span>`;
            modal.getElementsByClassName("options-list")[0].innerHTML = `
    ${this.planList.Options.map(e => `
    <div class="form-group col-3 border-bottom">
      <div class="form-check">
       <input class="form-check-input mandatory" name="options" type="checkbox" value="${e.Id}" id="invalidCheck_${e.Id}">
       <label class="form-check-label" for="invalidCheck_${e.Id}">
         ${e.Name}
       </label>
      </div>
     </div>
     `).join("")}`;
            let form = document.getElementById("new-finding");
            $("#DetailContents").modal('show');
            let date = modal.getElementsByClassName("fecha")[0];
            let fDate = document.getElementById("finding-date");
            let fCreated = document.getElementById("finding-user");
            let Affectation = document.getElementById("Affectation_id");
            let Channel = document.getElementById("Channel_id");
            let Cause = document.getElementById("cause");
            Cause.innerHTML = this.elements.GetCauses();
            Channel.value = this.elements.GetType(this.planList.Affectation.Channel);
            Affectation.value = this.planList.Affectation.Id.toString();
            date.value = ActualDate();
            fDate.textContent = ActualDate();
            fCreated.textContent = localStorage.getItem("Name");
            let updates = document.getElementsByClassName("fill-other");
            Array.from(updates).forEach(u => u.addEventListener("keyup", e => UpdateOthers(e)));
            this.util.ValidateMandatory();
            let findings = new Finding(this.planList.Findings);
            yield findings.Draw();
            form.addEventListener("submit", (e) => { findings.Save(e); });
            $('[data-toggle="tooltip"]').tooltip();
        });
    }
    GetPlanes() {
        return __awaiter(this, void 0, void 0, function* () {
            const year = document.getElementById("year-select");
            const month = document.getElementById("months-select");
            const option = document.getElementsByClassName("option-list selected")[0];
            const detail = document.getElementsByClassName("option-detail-item selected")[0];
            const state = document.getElementsByClassName("option-states selected")[0];
            const statistics = document.getElementById("result-statistics");
            statistics.innerHTML = "";
            if (typeof detail != "undefined") {
                const value = option.dataset.value;
                const value_detail = detail.dataset.value;
                const data = {
                    Year: year.value,
                    Month: month.value,
                    State: state.dataset.value,
                    Kpi: (value == TypesElement.Kpis) ? value_detail : 0,
                    Ally: (value == TypesElement.Kpis) ? "" : value_detail
                };
                try {
                    let APIFilters = `${this.util.API}plan/Filters`;
                    let header = {
                        headers: {
                            'Authorization': localStorage.getItem("Token") || "",
                            "Content-Type": " application/json"
                        },
                        method: 'post',
                        body: JSON.stringify(data)
                    };
                    let response = yield fetch(APIFilters, header);
                    let json = yield response.json();
                    this.DrawTable(json, value, data);
                }
                catch (error) {
                }
            }
        });
    }
    DrawTable(plans, value, data) {
        const detail = document.getElementById("result-statistics");
        if (plans.length <= 0) {
            detail.innerHTML = `
      <div class="jumbotron jumbotron-fluid">
        <div class="container">
          <h1 class="display-4">No se encuentran planes</h1>
          <p class="lead">Para la selecci??n realizada no existen planes de acci??n, favor valide e intente nuevamente.</p>
        </div>
      </div>
      `;
        }
        else {
            const text_head = value == TypesElement.Kpis ? "Aliado/Regional" : "KPI";
            const thead = `
      <thead>
        <tr>
          <th>${text_head}<br/>&nbsp;</th>
          <th>Operaci??n<br/>&nbsp;</th>
          <th class="d-flex w-100 justify-content-between">Hallazgo
            <form action="/soluciones/searchers/views/pacx/DownloadAffectations.asp" method="post">
              <input type="hidden" name="year" value="${data.Year}" />
              <input type="hidden" name="month" value="${data.Month}" />
              <input type="hidden" name="state" value="${data.State}" />
              <input type="hidden" name="kpi" value="${data.Kpi}" />
              <input type="hidden" name="ally" value="${data.Ally}" />
              <button class="btn btn-success"><em class="fas fa-save"></em>&nbsp;Descarga</button>
            </form>
          </th>
        </tr>
      </thead>
      `;
            const tbody = `
      <tbody>
      ${plans.map(plan => `
        <tr>
          <th>${value == TypesElement.Kpis ? plan.Affectation.Ally : plan.Affectation.Kpi}</th>
          <td>${plan.Affectation.Operation}</td>
          <td>
            <ul class="list-group">
            ${plan.Findings.map(finding => `<li class="list-group-item list-group-item-action" data-filter="${finding.Options.map(o => `[${o.Id}]`).join(" ")}">
                <div class="row">
                  <div class="col-6 detail-finding-element hand"
                        data-affectation="${plan.Affectation.Id}"
                        data-finding="${finding.Finding.Id}">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">${finding.Finding.Name}</h5>
                      <small class="text-muted">${finding.Finding.Identification_date.toString().slice(0, 10)}</small>
                    </div>
                    <p class="mb-1">${finding.Finding.Description}</p>
                    <small class="text-muted">${finding.Finding.Created_by}</small>
                  </div>
                  <div class="col-6">
                  <ul class="list-group">
                  ${finding.Actions.map(action => {
                let initial = action.Action.State == 2 ? action.Action.Close_date.toString() : ActualDate();
                let resultCompare = CompareDate(action.Action.Commitment_date.toString(), initial);
                let bgBar = resultCompare == 1 ? "success" : resultCompare == 0 ? "warning" : "danger";
                let icon = action.Action.State == 2 ? `<em class="fas fa-check-double textAzulMovistar"></em>` : `<em class="far"></em>`;
                return `
                    <li 
                    data-affectation="${plan.Affectation.Id}"
                    data-finding="${finding.Finding.Id}"
                    data-action="${action.Action.Id}"
                    class="detail-action-element hand list-group-item d-flex justify-content-between align-items-center border-left-${bgBar}">
                      <span>${icon}&nbsp;${action.Action.Observation.slice(0, 30)}...</span>
                      <span class="badge badge-${bgBar} badge-pill">${action.Action.Advance}%</span>
                    </li>
                    `;
            }).join("")}
                  </ul>
                  </div>
                </div>
              </li>`).join("")}
            </ul>
          </td>
        </tr>
      `).join("")}
      </tbody>
      `;
            detail.append(`<table class="table table-hover table-striped">${thead}${tbody}</table>`);
            const actions = document.getElementsByClassName("detail-action-element");
            Array.from(actions).forEach(action => { action.addEventListener("click", e => this.DetailAction(action)); });
            const findings = document.getElementsByClassName("detail-finding-element");
            Array.from(findings).forEach(finding => { finding.addEventListener("click", e => this.DetailFinding(finding)); });
        }
    }
    DetailFinding(finding) {
        return __awaiter(this, void 0, void 0, function* () {
            let element = finding;
            yield this.GetAffectation(Number(element.dataset.affectation));
            let findings = new Finding(this.planList.Findings);
            yield findings.Get(Number(element.dataset.finding));
        });
    }
    DetailAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionObj = Action.getInstance();
            let element = action;
            yield this.DetailFinding(action);
            let actionsDIV = document.getElementsByClassName("action-element");
            let id = Number(element.dataset.action);
            Array.from(actionsDIV).forEach((e) => {
                let act = e;
                if (act.dataset.id == id.toString()) {
                    actionObj.DrawDetail(id.toString(), e);
                }
            });
        });
    }
    FilterDetail() {
        const select = document.getElementById("option-detail-select");
        const findingsHide = document.getElementsByClassName("list-group-item-action oculto");
        Array.from(findingsHide).forEach(f => f.classList.remove("oculto"));
        let id = select.value;
        if (id.length > 0) {
            const findings = document.getElementsByClassName("list-group-item-action");
            Array.from(findings).forEach(f => {
                const self = f;
                const values = self.dataset.filter;
                if (values.indexOf("[" + id + "]") < 0) {
                    self.classList.add("oculto");
                }
            });
        }
    }
}
