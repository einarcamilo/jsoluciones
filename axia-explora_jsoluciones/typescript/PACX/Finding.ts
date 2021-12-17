import { Action } from "./Actions.js";
import { SerializeData, ValidateNumber, ValidateText } from "../Utilities.js";
import { IFinding, IFindings } from "./Interfaces.js";
import { States } from "./States.js";
import { Utilities } from "./Utilities.js";
import { Element } from "./Element.js";
import { User } from "./User.js";

export class Finding{
  private util: Utilities;
  private Findings: IFinding[];
  private detail:HTMLElement;
  private fDate:HTMLElement;
  private fCreated:HTMLElement;
  private fState:HTMLElement;
  private fImpact:HTMLElement;
  private actions: Action;
  constructor(f: IFinding[]){
    this.Findings = f;
    this.util = new Utilities();
    this.detail = document.getElementById("finding-detail") as HTMLElement;
    this.fDate = document.getElementById("finding-date") as HTMLElement;
    this.fCreated = document.getElementById("finding-user")as HTMLElement;
    this.fState = document.getElementById("finding-state") as HTMLElement;
    this.fImpact = document.getElementById("finding-impact")as HTMLElement;
    this.actions = Action.getInstance();
  }
  
  async Draw(){
    document.getElementsByClassName("finding-list")[0].innerHTML += `
    ${this.Findings.map(f=>{
      let check = f.State == 2 ? `<em class="fas fa-check-double textAzulMovistar"></em>&nbsp;` : "";
      return `
      <div class="item-button finding-detail" data-id="${f.Id}">${check}${f.Name}</div>
    `;}).join("")}
    `;
    let list = document.getElementsByClassName("finding-detail");
    document.getElementById("finding-new")?.addEventListener("click",()=>this.ShowForm());
    Array.from(list).forEach(l => l.addEventListener("click",()=>{let i = l as HTMLElement;this.Get(Number(i.dataset.id))}));
  }
  async Save(e: Event){
    e.preventDefault();
    if(this.util.ValidateForm(e)){
      let obj = SerializeData(e.target as HTMLFormElement);
      let button = document.getElementById("finding-save-button") as HTMLButtonElement;
      button.disabled = true;
      try {
        let us = User.getInstance();
        let APISave = `${this.util.API}finding/new`;
        let header = {
          headers:{
            'Authorization': us.Token,//ValidateText(localStorage.getItem("Token")) || "",
            "Content-Type":" application/json"
          },
          method:'post',
          body: JSON.stringify(obj)
        };
        let response = await fetch(APISave,header);
        let finding: IFindings = await response.json();
        this.actions.SetData(finding.Actions);
        this.Detail(finding);
        let div = document.createElement("div");
        div.classList.add("item-button", "finding-detail", "selected");
        div.dataset.id = finding.Finding.Id.toString();
        div.innerText = finding.Finding.Name;
        let elements = document.getElementsByClassName("finding-detail");
        Array.from(elements).forEach(e=>e.classList.remove("selected"));
        document.getElementsByClassName("finding-list")[0].appendChild(div);
        let id = ValidateNumber(finding.Finding.Id);
        div.addEventListener("click",()=> {this.Get(id)});
        let form = document.getElementById("finding-form") as HTMLElement;
        form.classList.add("oculto");
        this.CleanForm();
      }
      catch(e){ console.error("Error Save Finding:" + e)}
    }
  }
  private ShowForm() {
    let date = document.getElementsByClassName("fecha")[0] as HTMLInputElement;
    let form = document.getElementById("finding-form") as HTMLElement;
    let actions = document.getElementById("actions-detail") as HTMLElement;
    let id = document.getElementById("Id") as HTMLInputElement;
    id.value = "";
    form.classList.remove("oculto");
    this.detail.innerHTML = "";
    actions.innerHTML = "";
    this.fState.textContent = States[1];
    this.fCreated.textContent = localStorage.getItem("Name");
    this.fDate.textContent = date.value;
    let elements = document.getElementsByClassName("finding-detail");
    Array.from(elements).forEach(e=>e.classList.remove("selected"));
  }
  async Get(id: number){
    try {
      let APIGet = `${this.util.API}Finding/Get/${id}`;
      let header = {
        headers:{
          'Authorization': localStorage.getItem("Token") || ""
        }
      };
      let response = await fetch(APIGet,header);//TODO: Create a Toasts bootstrap for errors
      let data: IFindings = await response.json();
      this.actions.SetData(data.Actions);
      let form = document.getElementById("finding-form") as HTMLElement;
      form.classList.add("oculto");
      let elements = document.getElementsByClassName("finding-detail");
      Array.from(elements).forEach(e => {
        let i = e as HTMLElement;
        if(Number(i.dataset.id) == id){ e.classList.add("selected"); }
        else{ e.classList.remove("selected"); }
      });
      await this.Detail(data);
    } catch (error) { console.error(error); }
  }
  private async Detail(data: IFindings){
    let ObjElement = Element.getInstance();
    let id = document.getElementById("Id") as HTMLInputElement;
    id.value = data.Finding.Id.toString();
    if(this.fDate == null){this.Set();}
    this.fDate.textContent = data.Finding.Identification_date.toString().slice(0,10);
    this.fImpact.textContent = data.Finding.Impact;
    this.fState.textContent = States[data.Finding.State] ;
    this.fCreated.textContent = data.Finding.Created_by;
    this.detail.innerHTML = `
     <p>${data.Finding.Description}</p>
     <p><strong>Causa raíz:</strong>&nbsp;${ObjElement.GetCause(data.Finding.Cause)?.Name}</p>
     <hr />
     <p>${data.Options.map(o=>o.Name).join(", ")}</p>
    `;
    await this.actions.Draw();
    if(States[data.Finding.State] == States[2]){ this.DeleteEdition(); }
  }
  private Set(){
    this.detail = document.getElementById("finding-detail") as HTMLElement;
    this.fDate = document.getElementById("finding-date") as HTMLElement;
    this.fCreated = document.getElementById("finding-user")as HTMLElement;
    this.fState = document.getElementById("finding-state") as HTMLElement;
    this.fImpact = document.getElementById("finding-impact")as HTMLElement;
  }
  private CleanForm(){
    let name = document.querySelector("[name='name']") as HTMLInputElement;
    let description = document.querySelector("[name='description']") as HTMLInputElement;
    let Identification_date = document.querySelector("[name='Identification_date']") as HTMLInputElement;
    let Impact = document.querySelector("[name='Impact']") as HTMLInputElement;
    let checks = document.getElementsByClassName("form-check-input") as HTMLCollectionOf<HTMLInputElement>;
    Array.from(checks).forEach(e => e.checked = false);
    name.value="";
    description.value = "";
    Identification_date.value="";
    Impact.value = "";
    let button = document.getElementById("finding-save-button") as HTMLButtonElement;
    button.disabled = false;
  }
  private DeleteEdition(){
    let form = document.getElementById("action-form") as HTMLDivElement;
    let button = document.getElementById("action-new") as HTMLDivElement;
    form.innerHTML= "";
    button.remove();
  }
}
