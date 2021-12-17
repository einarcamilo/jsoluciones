var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Utilities } from "../PACX/Utilities.js";
import { Error404 } from "./Error404.js";
import { Home } from "./Home.js";
import { NoAccess } from "./NoAccess.js";
import { Plan } from "./Plan.js";
import { User } from "./User.js";
export class Menu {
    constructor() {
        this.GetHash = () => location.hash.slice(1).toLocaleLowerCase().slice(1).split("/") || '/';
        this.util = new Utilities();
        this.LocalAPI = `${this.util.API}MenuPACX/`;
        this.menuHTML = null || document.getElementById("main-nav");
    }
    Get() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let menu = yield fetch(`${this.LocalAPI}Get`, {
                    headers: {
                        'Authorization': localStorage.getItem("Token") || ""
                    }
                });
                return yield menu.json();
            }
            catch (error) {
                console.error("User error", error);
            }
        });
    }
    Draw() {
        return __awaiter(this, void 0, void 0, function* () {
            let list = yield this.Get();
            if (this.menuHTML !== null) {
                this.menuHTML.innerHTML = `
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <div class="navbar-nav">
            ${list.map(l => `<li class="nav-item"><a class="nav-link navigation" href="#/${l.Action}">${l.Name}</a></li>`).join("")}
            <li class="nav-item"><a class="nav-link navigation" href="#/Users">Usuarios</a></li>
          </div>
        </div>
        `;
            }
        });
    }
    Valid(dir) {
        if (dir[0] == "") {
            return true;
        }
        let flag = false;
        let nav = document.getElementsByClassName("navigation");
        Array.from(nav).forEach(n => {
            let link = n;
            let href = link.href.slice(link.href.indexOf("#")).replace("#/", "").split("/");
            if (dir[0].toLowerCase() == href[0].toLowerCase()) {
                flag = true;
            }
            // if(dir.length == href.length){
            //   console.log(href);
            //   console.log(dir[0].toLowerCase()+ "=="+ href[0].toLowerCase());
            //   console.log(dir[1].toLowerCase()+ "=="+ href[1].toLowerCase());
            //   if(dir.length == 1){ 
            // }
            //}
        });
        return flag;
    }
    Navigate() {
        return __awaiter(this, void 0, void 0, function* () {
            let dir = this.GetHash();
            let main = document.getElementsByTagName("main")[0];
            let user = User.getInstance();
            if (localStorage.getItem("Profile") == "Analista") {
                dir[0] = "noaccess";
            }
            else if (!this.Valid(dir)) {
                dir[0] = "noaccess";
            }
            switch (dir[0]) {
                case "":
                    let home = new Home(main);
                    home.Initial();
                    break;
                case "plan":
                    let plan = new Plan(dir, main);
                    plan.Navigate();
                    break;
                case "users":
                    user.PATH = dir;
                    user.Navigate();
                    break;
                case "noaccess":
                    new NoAccess(main);
                    break;
                default:
                    let error = new Error404(main);
                    break;
            }
        });
    }
}
