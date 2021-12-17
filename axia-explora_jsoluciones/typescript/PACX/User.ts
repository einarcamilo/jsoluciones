import { SerializeData, ValidateText } from "../Utilities.js";
import { Error404 } from "./Error404.js";
import { IUser } from "./Interfaces.js";
import { Utilities } from "./Utilities.js";

export class User{
  private LocalAPI: string = "";
  private util: Utilities;
  private controller = new AbortController();
  Token: string;
  private static instance: User;
  private main: HTMLElement;
  PATH: string[];
  public static getInstance(): User{
    if(!User.instance){ User.instance = new User(); }
    return User.instance;
  }
  constructor(){
    this.Token = "";
    this.util = new Utilities();
    this.LocalAPI = `${this.util.APIASP}usuarios/Profile.asp`;
    this.main = document.getElementsByTagName("main")[0] as HTMLElement;
    this.PATH = new Array<string>();
  }
  Navigate(){
    switch (this.PATH[1]) {
      case undefined: this.Index(); break;
      case "create": this.New(); break;
      case "edit" : this.Edit(this.PATH[2]); break;
      default: let error = new Error404(this.main); break;
    }
  }
  async GetUser() {
    
    try {
      const response = await fetch(this.LocalAPI);
      const data = await response.json();
      const getToken = await fetch(`${this.util.API}auth/index?user=${data.User}&profile=${data.Profile}`);
      const token = await getToken.json();
      localStorage.setItem("User", data.User);
      localStorage.setItem("Profile", data.Profile);
      localStorage.setItem("Name", data.Name);
      localStorage.setItem("Mail", data.Mail);
      if(token !== null){ 
        localStorage.setItem("Token", "Basic " +btoa(`${data.User}:${token.Token}`) );
        this.Token = "Basic " +btoa(`${data.User}:${token.Token}`);
      }
      else{ this.Token = token; }
    } catch (error) {
      console.error("User error", error);
    }
  }
  async GetResponsables(){
    try{ this.controller.abort; }catch(e){ console.info("Canceled"); }
    try {
      const auto = document.getElementById("autocomplete") as HTMLInputElement;
      const name: string = ValidateText(auto.value);
      if(name.length >= 3){
        const div = document.getElementById("users-auto-list");
        div?.remove();
        const ally = document.getElementById("AllyName")?.dataset.value;
        const response = await fetch(`${this.util.API}Users/Get?name=${name}&ally=${ally}`,{
          signal: this.controller.signal,
          headers:{
            'Authorization': localStorage.getItem("Token") || ""
          }
        });
        const json = await response.json();
        this.DrawList(json);
      }
    } catch (error) {
      
    }
  }
  private DrawList(value: any[]){
    const list = document.getElementById("responsable-list") as HTMLElement;
    const accion_user = document.getElementsByClassName("accion-users")[0] as HTMLElement;
    const auto = document.getElementById("autocomplete") as HTMLInputElement;
    let divList: HTMLElement;
    const exist = document.getElementById("users-auto-list");
    divList = exist!==null ? divList = exist as HTMLElement : document.createElement("div");
    divList.setAttribute("id", "users-auto-list");
    divList.setAttribute("class", "auto-list rounded shadow-sm");
    auto?.parentNode?.appendChild(divList);
    for(let item of value){
      const auto_item = document.createElement("div");
      auto_item.innerHTML = `
      <p class="mb-0"><strong>Nombre:</strong>&nbsp;${item.Name}</p>
      <p class="mb-0">${item.Profile}</p>
      `;
      auto_item.setAttribute("data-value",item.User);
      auto_item.setAttribute("data-name",item.Name);
      divList.appendChild(auto_item);
      auto_item.addEventListener("click",function(){
        let data = this.dataset.value || "";
        let name = this.dataset.name || "";
        let value = parseInt(data.toString())===0;
        if(!value){
          list.innerHTML += `<input type="checkbox" checked name="responsables" id="${data}" value="${data}" />`;
          const p = document.createElement("p");
          p.setAttribute("id", `p_${data}`);
          p.setAttribute("class","mb-0");
          p.innerHTML = `${name}&nbsp;<em class="fas fa-minus-square"></em>`;
          accion_user.appendChild(p);
          p.addEventListener("click",()=>{
            document.getElementById(data)?.remove();
            document.getElementById("p_"+data)?.remove();
          });
        }
        divList.remove();
        auto.value = "";
      });
    }
  }
  private async Index(){
    try {
      const route = localStorage.getItem("Profile") == "Procesos" ? "users" : "noaccess";
      const APIGet = `templates/pacx/${route}.html`;
      const response = await fetch(APIGet);
      const html = await response.text();
      this.main.innerHTML = html;
      if(route != "noaccess"){this.GetAll();}
    } catch (error) {
      
    }
  }
  private async New(){
    try {
      let route = localStorage.getItem("Profile") == "Procesos" ? "users_new" : "noaccess";
      let APIGet = `templates/pacx/${route}.html`;
      let response = await fetch(APIGet);
      let html = await response.text();
      this.main.innerHTML = html;
      const form = document.getElementById("users-new");
      if(form !== null){
        this.util.ValidateMandatory();
        form.addEventListener("submit", (e)=>{this.Save(e)});
      }
    } catch (error) {
      
    }
  }
  private async Save(e: Event) {
    e.preventDefault();
    let data = SerializeData(e.target as HTMLFormElement);
    if(this.util.ValidateForm(e)){
      const APISave = `${this.util.API}Users/Create`;
      const header = {
        headers:{
          'Authorization': localStorage.getItem("Token") || "",
          "Content-Type":" application/json"
        },
        method:'post',
        body: JSON.stringify(data)
      };
      const response = await fetch(APISave, header);
      const status = response.status;
      if(status === 201){
        const aHref = document.getElementById("clic_return") as HTMLLinkElement;
        aHref.click();
      }
    }
  }
  private async GetAll(){
    try {
      const APIGet = `${this.util.API}Users/GetAll`;
      const header = {
        headers:{
          'Authorization': localStorage.getItem("Token") || ""
        }
      };
      const response = await fetch(APIGet, header);
      const users: IUser[] = await response.json();
      this.ListAll(users);
    } catch (error) {
      
    }
  }
  private ListAll(users: IUser[]){
    const div = document.getElementById("list-users") as HTMLDivElement;
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
    const auto = document.getElementById("search_user") as HTMLInputElement;
    auto.addEventListener("keyup",()=>{ this.FilterList(); })
  }
  private async Edit(val: any){
    const id = Number(val);
    if(!isNaN(id)){
      try {
        let route = localStorage.getItem("Profile") == "Procesos" ? "users_edit" : "noaccess";
        let APIGet = `templates/pacx/${route}.html`;
        let response = await fetch(APIGet);
        let html = await response.text();
        this.main.innerHTML = html;
        if(route != "noaccess"){
          this.Get(id);
          const form = document.getElementById("users-edit") as HTMLFormElement;
          form.addEventListener("submit", (e)=> {this.Update(e)});
        }
      } catch (error) {
        new Error404(this.main);
      }
    }
    else{ new Error404(this.main); }
  }
  private async Get(id: number){
    try {
      const APIGet = `${this.util.API}/Users/Edit/${id}`;
      const header = { headers: {'Authorization': localStorage.getItem("Token") || ""} };
      const response = await fetch(APIGet, header);
      const status = response.status;
      if(status === 204){ new Error404(this.main); }
      else{
        const user : IUser = await response.json();
        const user_id = document.getElementById("user_id") as HTMLInputElement;
        const User = document.getElementById("User") as HTMLInputElement;
        const UserSpan = document.getElementById("user_name") as HTMLSpanElement;
        const Name = document.getElementById("Name") as HTMLInputElement;
        const Mail = document.getElementById("Mail") as HTMLInputElement;
        const Profile = document.getElementById("Profile") as HTMLSelectElement;
        const radio_active = document.getElementById("radio_active") as HTMLInputElement;
        const radio_inactive = document.getElementById("radio_inactive") as HTMLInputElement;
        user_id.value = user.Id.toString();
        Name.value = user.Name;
        Mail.value = user.Mail;
        User.value = user.User;
        UserSpan.textContent = user.User;
        Profile.value = user.Profile;
        if(user.Active){ radio_active.checked = true; }
        else{ radio_inactive.checked = true; }
      }
    } catch (error) { console.error(error); new Error404(this.main);  }
  }
  private async Update(e: Event) {
    e.preventDefault();
    let data = SerializeData(e.target as HTMLFormElement);
    if(this.util.ValidateForm(e)){
      const APISave = `${this.util.API}Users/Edit`;
      const header = {
        headers:{
          'Authorization': localStorage.getItem("Token") || "",
          "Content-Type":" application/json"
        },
        method:'post',
        body: JSON.stringify(data)
      };
      const response = await fetch(APISave, header);
      const status = response.status;
      if(status === 201){
        const aHref = document.getElementById("clic_return") as HTMLLinkElement;
        aHref.click();
      }
    }
  }
  private FilterList(){
    const auto = document.getElementById("search_user") as HTMLInputElement;
    const value = auto.value.toLowerCase();
    const list = document.getElementsByClassName("for-filter");
    Array.from(list).forEach(e=>{
      let item = e as HTMLElement;
      let name = item.dataset.name as string;
      let user = item.dataset.user as string;
      if(name.toLowerCase().indexOf(value) >= 0 || user.toLowerCase().indexOf(value) >=0){ item.classList.remove("oculto"); }
      else{ item.classList.add("oculto"); }
    });
  }
}