var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SerializeData, ValidateText } from "../Utilities.js";
import { Error404 } from "./Error404.js";
import { Utilities } from "./Utilities.js";
export class User {
    constructor() {
        this.LocalAPI = "";
        this.controller = new AbortController();
        this.Token = "";
        this.util = new Utilities();
        this.LocalAPI = `${this.util.APIASP}usuarios/Profile.asp`;
        this.main = document.getElementsByTagName("main")[0];
        this.PATH = new Array();
    }
    static getInstance() {
        if (!User.instance) {
            User.instance = new User();
        }
        return User.instance;
    }
    Navigate() {
        switch (this.PATH[1]) {
            case undefined:
                this.Index();
                break;
            case "create":
                this.New();
                break;
            case "edit":
                this.Edit(this.PATH[2]);
                break;
            default:
                let error = new Error404(this.main);
                break;
        }
    }
    GetUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.LocalAPI);
                const data = yield response.json();
                const getToken = yield fetch(`${this.util.API}auth/index?user=${data.User}&profile=${data.Profile}`);
                const token = yield getToken.json();
                localStorage.setItem("User", data.User);
                localStorage.setItem("Profile", data.Profile);
                localStorage.setItem("Name", data.Name);
                localStorage.setItem("Mail", data.Mail);
                if (token !== null) {
                    localStorage.setItem("Token", "Basic " + btoa(`${data.User}:${token.Token}`));
                    this.Token = "Basic " + btoa(`${data.User}:${token.Token}`);
                }
                else {
                    this.Token = token;
                }
            }
            catch (error) {
                console.error("User error", error);
            }
        });
    }
    GetResponsables() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.controller.abort;
            }
            catch (e) {
                console.info("Canceled");
            }
            try {
                const auto = document.getElementById("autocomplete");
                const name = ValidateText(auto.value);
                if (name.length >= 3) {
                    const div = document.getElementById("users-auto-list");
                    div === null || div === void 0 ? void 0 : div.remove();
                    const ally = (_a = document.getElementById("AllyName")) === null || _a === void 0 ? void 0 : _a.dataset.value;
                    const response = yield fetch(`${this.util.API}Users/Get?name=${name}&ally=${ally}`, {
                        signal: this.controller.signal,
                        headers: {
                            'Authorization': localStorage.getItem("Token") || ""
                        }
                    });
                    const json = yield response.json();
                    this.DrawList(json);
                }
            }
            catch (error) {
            }
        });
    }
    DrawList(value) {
        var _a;
        const list = document.getElementById("responsable-list");
        const accion_user = document.getElementsByClassName("accion-users")[0];
        const auto = document.getElementById("autocomplete");
        let divList;
        const exist = document.getElementById("users-auto-list");
        divList = exist !== null ? divList = exist : document.createElement("div");
        divList.setAttribute("id", "users-auto-list");
        divList.setAttribute("class", "auto-list rounded shadow-sm");
        (_a = auto === null || auto === void 0 ? void 0 : auto.parentNode) === null || _a === void 0 ? void 0 : _a.appendChild(divList);
        for (let item of value) {
            const auto_item = document.createElement("div");
            auto_item.innerHTML = `
      <p class="mb-0"><strong>Nombre:</strong>&nbsp;${item.Name}</p>
      <p class="mb-0">${item.Profile}</p>
      `;
            auto_item.setAttribute("data-value", item.User);
            auto_item.setAttribute("data-name", item.Name);
            divList.appendChild(auto_item);
            auto_item.addEventListener("click", function () {
                let data = this.dataset.value || "";
                let name = this.dataset.name || "";
                let value = parseInt(data.toString()) === 0;
                if (!value) {
                    list.innerHTML += `<input type="checkbox" checked name="responsables" id="${data}" value="${data}" />`;
                    const p = document.createElement("p");
                    p.setAttribute("id", `p_${data}`);
                    p.setAttribute("class", "mb-0");
                    p.innerHTML = `${name}&nbsp;<em class="fas fa-minus-square"></em>`;
                    accion_user.appendChild(p);
                    p.addEventListener("click", () => {
                        var _a, _b;
                        (_a = document.getElementById(data)) === null || _a === void 0 ? void 0 : _a.remove();
                        (_b = document.getElementById("p_" + data)) === null || _b === void 0 ? void 0 : _b.remove();
                    });
                }
                divList.remove();
                auto.value = "";
            });
        }
    }
    Index() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const route = localStorage.getItem("Profile") == "Procesos" ? "users" : "noaccess";
                const APIGet = `templates/pacx/${route}.html`;
                const response = yield fetch(APIGet);
                const html = yield response.text();
                this.main.innerHTML = html;
                if (route != "noaccess") {
                    this.GetAll();
                }
            }
            catch (error) {
            }
        });
    }
    New() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let route = localStorage.getItem("Profile") == "Procesos" ? "users_new" : "noaccess";
                let APIGet = `templates/pacx/${route}.html`;
                let response = yield fetch(APIGet);
                let html = yield response.text();
                this.main.innerHTML = html;
                const form = document.getElementById("users-new");
                if (form !== null) {
                    this.util.ValidateMandatory();
                    form.addEventListener("submit", (e) => { this.Save(e); });
                }
            }
            catch (error) {
            }
        });
    }
    Save(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            let data = SerializeData(e.target);
            if (this.util.ValidateForm(e)) {
                const APISave = `${this.util.API}Users/Create`;
                const header = {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || "",
                        "Content-Type": " application/json"
                    },
                    method: 'post',
                    body: JSON.stringify(data)
                };
                const response = yield fetch(APISave, header);
                const status = response.status;
                if (status === 201) {
                    const aHref = document.getElementById("clic_return");
                    aHref.click();
                }
            }
        });
    }
    GetAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const APIGet = `${this.util.API}Users/GetAll`;
                const header = {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    }
                };
                const response = yield fetch(APIGet, header);
                const users = yield response.json();
                this.ListAll(users);
            }
            catch (error) {
            }
        });
    }
    ListAll(users) {
        const div = document.getElementById("list-users");
        div.append(`
      <ul class="list-group">
        <li class="list-group-item active">
          <div class="row">
            <div class="col-2">Usuario</div>
            <div class="col-4">Nombre</div>
            <div class="col-3">Correo</div>
            <div class="col-2">Perfil</div>
            <div class="col-1">Acciones</div>
          </div>
        </li>
        ${users.map(u => `
        <li class="list-group-item for-filter" data-name="${u.Name}" data-user="${u.User}">
          <div class="row">
            <div class="col-2">${u.User}</div>
            <div class="col-4">${u.Name}</div>
            <div class="col-3">${u.Mail}</div>
            <div class="col-2">${u.Profile}</div>
            <div class="col-1">
              <a class="btn btn-warning btn-sm" href="#/Users/Edit/${u.Id}"><em class="fas fa-user-edit"></em></a>
            </div>
          </div>
        </li>
        `).join("")}
      </ul>
    `);
        const auto = document.getElementById("search_user");
        auto.addEventListener("keyup", () => { this.FilterList(); });
    }
    Edit(val) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(val);
            if (!isNaN(id)) {
                try {
                    let route = localStorage.getItem("Profile") == "Procesos" ? "users_edit" : "noaccess";
                    let APIGet = `templates/pacx/${route}.html`;
                    let response = yield fetch(APIGet);
                    let html = yield response.text();
                    this.main.innerHTML = html;
                    if (route != "noaccess") {
                        this.Get(id);
                        const form = document.getElementById("users-edit");
                        form.addEventListener("submit", (e) => { this.Update(e); });
                    }
                }
                catch (error) {
                    new Error404(this.main);
                }
            }
            else {
                new Error404(this.main);
            }
        });
    }
    Get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const APIGet = `${this.util.API}/Users/Edit/${id}`;
                const header = { headers: { 'Authorization': localStorage.getItem("Token") || "" } };
                const response = yield fetch(APIGet, header);
                const status = response.status;
                if (status === 204) {
                    new Error404(this.main);
                }
                else {
                    const user = yield response.json();
                    const user_id = document.getElementById("user_id");
                    const User = document.getElementById("User");
                    const UserSpan = document.getElementById("user_name");
                    const Name = document.getElementById("Name");
                    const Mail = document.getElementById("Mail");
                    const Profile = document.getElementById("Profile");
                    const radio_active = document.getElementById("radio_active");
                    const radio_inactive = document.getElementById("radio_inactive");
                    user_id.value = user.Id.toString();
                    Name.value = user.Name;
                    Mail.value = user.Mail;
                    User.value = user.User;
                    UserSpan.textContent = user.User;
                    Profile.value = user.Profile;
                    if (user.Active) {
                        radio_active.checked = true;
                    }
                    else {
                        radio_inactive.checked = true;
                    }
                }
            }
            catch (error) {
                console.error(error);
                new Error404(this.main);
            }
        });
    }
    Update(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            let data = SerializeData(e.target);
            if (this.util.ValidateForm(e)) {
                const APISave = `${this.util.API}Users/Edit`;
                const header = {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || "",
                        "Content-Type": " application/json"
                    },
                    method: 'post',
                    body: JSON.stringify(data)
                };
                const response = yield fetch(APISave, header);
                const status = response.status;
                if (status === 201) {
                    const aHref = document.getElementById("clic_return");
                    aHref.click();
                }
            }
        });
    }
    FilterList() {
        const auto = document.getElementById("search_user");
        const value = auto.value.toLowerCase();
        const list = document.getElementsByClassName("for-filter");
        Array.from(list).forEach(e => {
            let item = e;
            let name = item.dataset.name;
            let user = item.dataset.user;
            if (name.toLowerCase().indexOf(value) >= 0 || user.toLowerCase().indexOf(value) >= 0) {
                item.classList.remove("oculto");
            }
            else {
                item.classList.add("oculto");
            }
        });
    }
}
