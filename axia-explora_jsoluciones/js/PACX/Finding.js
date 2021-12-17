var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Action } from "./Actions.js";
import { SerializeData, ValidateNumber } from "../Utilities.js";
import { States } from "./States.js";
import { Utilities } from "./Utilities.js";
import { Element } from "./Element.js";
import { User } from "./User.js";
export class Finding {
    constructor(f) {
        this.Findings = f;
        this.util = new Utilities();
        this.detail = document.getElementById("finding-detail");
        this.fDate = document.getElementById("finding-date");
        this.fCreated = document.getElementById("finding-user");
        this.fState = document.getElementById("finding-state");
        this.fImpact = document.getElementById("finding-impact");
        this.actions = Action.getInstance();
    }
    Draw() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            document.getElementsByClassName("finding-list")[0].innerHTML += `
    ${this.Findings.map(f => {
                let check = f.State == 2 ? `<em class="fas fa-check-double textAzulMovistar"></em>&nbsp;` : "";
                return `
      <div class="item-button finding-detail" data-id="${f.Id}">${check}${f.Name}</div>
    `;
            }).join("")}
    `;
            let list = document.getElementsByClassName("finding-detail");
            (_a = document.getElementById("finding-new")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => this.ShowForm());
            Array.from(list).forEach(l => l.addEventListener("click", () => { let i = l; this.Get(Number(i.dataset.id)); }));
        });
    }
    Save(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            if (this.util.ValidateForm(e)) {
                let obj = SerializeData(e.target);
                let button = document.getElementById("finding-save-button");
                button.disabled = true;
                try {
                    let us = User.getInstance();
                    let APISave = `${this.util.API}finding/new`;
                    let header = {
                        headers: {
                            'Authorization': us.Token,
                            "Content-Type": " application/json"
                        },
                        method: 'post',
                        body: JSON.stringify(obj)
                    };
                    let response = yield fetch(APISave, header);
                    let finding = yield response.json();
                    this.actions.SetData(finding.Actions);
                    this.Detail(finding);
                    let div = document.createElement("div");
                    div.classList.add("item-button", "finding-detail", "selected");
                    div.dataset.id = finding.Finding.Id.toString();
                    div.innerText = finding.Finding.Name;
                    let elements = document.getElementsByClassName("finding-detail");
                    Array.from(elements).forEach(e => e.classList.remove("selected"));
                    document.getElementsByClassName("finding-list")[0].appendChild(div);
                    let id = ValidateNumber(finding.Finding.Id);
                    div.addEventListener("click", () => { this.Get(id); });
                    let form = document.getElementById("finding-form");
                    form.classList.add("oculto");
                    this.CleanForm();
                }
                catch (e) {
                    console.error("Error Save Finding:" + e);
                }
            }
        });
    }
    ShowForm() {
        let date = document.getElementsByClassName("fecha")[0];
        let form = document.getElementById("finding-form");
        let actions = document.getElementById("actions-detail");
        let id = document.getElementById("Id");
        id.value = "";
        form.classList.remove("oculto");
        this.detail.innerHTML = "";
        actions.innerHTML = "";
        this.fState.textContent = States[1];
        this.fCreated.textContent = localStorage.getItem("Name");
        this.fDate.textContent = date.value;
        let elements = document.getElementsByClassName("finding-detail");
        Array.from(elements).forEach(e => e.classList.remove("selected"));
    }
    Get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let APIGet = `${this.util.API}Finding/Get/${id}`;
                let header = {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    }
                };
                let response = yield fetch(APIGet, header); //TODO: Create a Toasts bootstrap for errors
                let data = yield response.json();
                this.actions.SetData(data.Actions);
                let form = document.getElementById("finding-form");
                form.classList.add("oculto");
                let elements = document.getElementsByClassName("finding-detail");
                Array.from(elements).forEach(e => {
                    let i = e;
                    if (Number(i.dataset.id) == id) {
                        e.classList.add("selected");
                    }
                    else {
                        e.classList.remove("selected");
                    }
                });
                yield this.Detail(data);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    Detail(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let ObjElement = Element.getInstance();
            let id = document.getElementById("Id");
            id.value = data.Finding.Id.toString();
            if (this.fDate == null) {
                this.Set();
            }
            this.fDate.textContent = data.Finding.Identification_date.toString().slice(0, 10);
            this.fImpact.textContent = data.Finding.Impact;
            this.fState.textContent = States[data.Finding.State];
            this.fCreated.textContent = data.Finding.Created_by;
            this.detail.innerHTML = `
     <p>${data.Finding.Description}</p>
     <p><strong>Causa raíz:</strong>&nbsp;${(_a = ObjElement.GetCause(data.Finding.Cause)) === null || _a === void 0 ? void 0 : _a.Name}</p>
     <hr />
     <p>${data.Options.map(o => o.Name).join(", ")}</p>
    `;
            yield this.actions.Draw();
            if (States[data.Finding.State] == States[2]) {
                this.DeleteEdition();
            }
        });
    }
    Set() {
        this.detail = document.getElementById("finding-detail");
        this.fDate = document.getElementById("finding-date");
        this.fCreated = document.getElementById("finding-user");
        this.fState = document.getElementById("finding-state");
        this.fImpact = document.getElementById("finding-impact");
    }
    CleanForm() {
        let name = document.querySelector("[name='name']");
        let description = document.querySelector("[name='description']");
        let Identification_date = document.querySelector("[name='Identification_date']");
        let Impact = document.querySelector("[name='Impact']");
        let checks = document.getElementsByClassName("form-check-input");
        Array.from(checks).forEach(e => e.checked = false);
        name.value = "";
        description.value = "";
        Identification_date.value = "";
        Impact.value = "";
        let button = document.getElementById("finding-save-button");
        button.disabled = false;
    }
    DeleteEdition() {
        let form = document.getElementById("action-form");
        let button = document.getElementById("action-new");
        form.innerHTML = "";
        button.remove();
    }
}
