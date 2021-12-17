var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SerializeData } from "../Utilities.js";
import { Action } from "./Actions.js";
import { Element } from "./Element.js";
import { Utilities } from "./Utilities.js";
export class Tracing {
    constructor(data, action, states) {
        this.util = new Utilities();
        this.action = action;
        this.states = states;
        this.tracing_list = data;
    }
    Get() {
        return __awaiter(this, void 0, void 0, function* () {
            const div_ppal = document.getElementById("action-tracing");
            div_ppal.innerHTML = "";
            const response = yield fetch("templates/PACX/tracing.html");
            if (response.status >= 200 && response.status <= 299) {
                const html = yield response.text();
                div_ppal.innerHTML = html;
                this.FillDataForm();
                this.DrawList();
            }
        });
    }
    FillDataForm() {
        const objElement = Element.getInstance();
        const form = document.getElementById("save-tracing");
        if (this.states[2] == this.states[this.action.State]) {
            form.remove();
        }
        else {
            const Observation = document.getElementById("tracing-observation");
            Observation.value = "";
            const advance = document.getElementById("tracing-advance");
            advance.innerHTML = `
      <input class="form-control mandatory numbers-only" type="number" value="${this.action.Advance}" name="advance" max="100" min="0" placeholder="Advance" />
      <div class="input-group-prepend">
      <div class="input-group-text"><i class="fas fa-percent"></i></div>
      </div>
      `;
            form.innerHTML += `<input type="hidden" name="action_id" value="${this.action.Id}" />`;
            form.addEventListener("submit", (e) => { this.Save(e); });
            this.states.forEach((value, index) => {
                let val = index == 0 ? "" : index;
                let text = index == 0 ? "Seleccione" : value;
                $("#tracing-states").append(`<option value="${val}">${text}</option>`);
            });
            objElement.Causes.forEach(e => $("#tracing-cause").append(`<option value="${e.Id}">${e.Name}</option>`));
            $("#tracing-states").val(this.action.State); //TODO try to make it vanilla
            $("#tracing-cause").val(this.action.Cause);
        }
    }
    DrawList() {
        const list = document.getElementById("tracing-list");
        list.innerHTML = this.tracing_list.map(t => `
      <div class="row">
        <div class="col-1">
          <div class="rounded-circle h30 w30 lh30 text-uppercase telefonicaTitulo bgGris5 text-center">${t.Created_by.slice(0, 2)}</div>
        </div>
        <div class="col-11">
          <p class="mb-0"><b>${t.Created.toString().slice(0, 10)}</b> ${t.Observation}</p>
          <p class="mb-0 mt-1"><small class="text-muted"><b>Avance:</b> ${t.Advance}%&nbsp;&nbsp;<b>Estado:</b> ${this.states[t.State]}</small></p>
        </div>
        <div class="col-12"><hr /></div>
      </div>
    `).join('');
    }
    Save(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            if (this.util.ValidateForm(e)) {
                let data = SerializeData(e.target);
                const APIUpdate = `${this.util.API}Action/Update`;
                const header = {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || "",
                        "Content-Type": " application/json"
                    },
                    method: 'post',
                    body: JSON.stringify(data)
                };
                let response = yield fetch(APIUpdate, header);
                if (response.status >= 200 && response.status <= 299) {
                    let progress = document.getElementsByClassName("action-element selected")[0];
                    let tracing = yield response.json();
                    let action = Action.getInstance();
                    let em = progress.getElementsByTagName("em")[0];
                    let bar = progress.getElementsByClassName("progress-bar")[0];
                    bar.style.width = `${tracing.Action.Advance}%`;
                    bar.innerHTML = `${tracing.Action.Advance}%`;
                    this.action = tracing.Action;
                    this.tracing_list = tracing.Tracings;
                    this.DrawList();
                    action.UpdateMe(tracing);
                    this.FillDataForm();
                    if (tracing.Action.State == 2) {
                        em.classList.remove("fa-check-square", "fa-square", "far");
                        em.classList.add('fa-check-double', 'textAzulMovistar', 'fas');
                    }
                }
            }
        });
    }
}
