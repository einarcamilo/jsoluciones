import { ActualDate, CompareDate, SerializeData, slideDown, slideUp, UpdateOthers, ValidateText } from "../Utilities.js";
import { Element } from "./Element.js";
import { IActionDetail } from "./Interfaces.js";
import { Tracing } from "./Tracing.js";
import { User } from "./User.js";
import { Utilities } from "./Utilities.js";

export class Action{
  private states: string[] =["","Abierto","Cerrado","En gestión"];
  private util:Utilities;
  private users: User;
  private action_list: IActionDetail[] = new Array<IActionDetail>();
  private static instance: Action;
  public static getInstance(): Action{
    if(!Action.instance){ Action.instance = new Action(); }
    return Action.instance;
  }
  constructor(){
    this.util = new Utilities();
    this.users = User.getInstance();
  }
  async Draw(){
    try {
      let id = document.getElementById("Id") as HTMLInputElement;
      let div = document.getElementById("actions-detail") as HTMLElement;
      let response = await fetch("templates/PACX/actions.html");
      if(response.status>=200&&response.status<=299){
        let html = await response.text();
        div.innerHTML = html;
        let action_new = document.getElementById("action-new") as HTMLElement;
        this.util.ValidateMandatory();
        let auto = document.getElementById("autocomplete") as HTMLInputElement;
        auto.addEventListener("keyup",()=>{ this.users.GetResponsables(); });
        let updates = document.getElementsByClassName("fill-other");
        Array.from(updates).forEach(u => u.addEventListener("keyup", e => UpdateOthers(e)));
        let form = document.getElementById("create-actions") as HTMLFormElement;
        form.addEventListener("submit",(e)=>{this.Save(e);})
        let finding_id = document.getElementById("finding_id") as HTMLInputElement;
        finding_id.value = id.value;
        this.DrawList();
        action_new.addEventListener("click",(e)=>{ this.PrepareNew(); });
      }
    } catch (error) {
      console.error("Load actions", error);
    }
  }
  UpdateMe(action: IActionDetail){
    let idx = this.action_list.findIndex(n => n.Action.Id == action.Action.Id);
    this.action_list[idx] = action;
  }
  SetData(action: IActionDetail[]){ this.action_list = action == null ? [] : action; }
  private async Save(e: Event) {
    e.preventDefault();
    let auto = document.getElementById("autocomplete") as HTMLInputElement;
    let data = SerializeData(e.target as HTMLFormElement);
    if(typeof data.responsables == "undefined"){
      auto.classList.add("is-invalid");
    }
    else if(this.util.ValidateForm(e)){
      auto.classList.remove("is-invalid");
      try {
        let APISave = `${this.util.API}Action/Index`;
        let header = {
          headers:{
            'Authorization': localStorage.getItem("Token") || "",
            "Content-Type":" application/json"
          },
          method:'post',
          body: JSON.stringify(data)
        };
        let response = await fetch(APISave, header);
        if(response.status>=200 && response.status<=299){
          let json = await response.json();
          this.action_list.push(json);
          this.DrawList();
          this.CleanForm();
        }
      }
      catch(e){ console.error("Error Save Actions:" + e)}
    }
    
  }
  private CleanForm() {
    const textarea = document.getElementsByName("Observation")[0] as HTMLInputElement;
    const Initial_date = document.getElementsByName("Initial_date")[0] as HTMLInputElement;
    const Commitment_date = document.getElementsByName("Commitment_date")[0] as HTMLInputElement;
    const advance = document.getElementsByName("advance")[0] as HTMLInputElement;
    const auto = document.getElementById("autocomplete") as HTMLInputElement;
    const action_state = document.getElementById("action-state") as HTMLElement;
    const action_initial_date = document.getElementById("action-initial-date") as HTMLElement;
    const action_commitment_date = document.getElementById("action-commitment-date") as HTMLElement;
    const action_users = document.getElementById("action-users") as HTMLElement;
    const responsable_list = document.getElementById("responsable-list") as HTMLElement;
    if(typeof textarea != "undefined"){
      textarea.value = "";
      Initial_date.value = "";
      Commitment_date.value = "";
      advance.value = "";
      auto.value = "";
      responsable_list.innerHTML = "";
    }
    action_state.innerHTML = this.states[1];
    action_initial_date.innerHTML = "";
    action_commitment_date.innerHTML = "";
    action_users.innerHTML = "";
    let list = document.getElementsByClassName("action-element");
    Array.from(list).forEach((e)=>e.classList.remove("selected"));
    let fas = document.getElementsByClassName("fa-check-square")[0];
    if(typeof fas != "undefined"){
      fas.classList.add("fa-square");
      fas.classList.remove("fa-check-square");
    }
  }
  private DrawList(){
    const div = document.getElementById("actions-list") as HTMLDivElement;
    div.innerHTML = "";
    this.action_list.forEach((a)=>{
      let initial = a.Action.State == 2 ? a.Action.Close_date.toString() : ActualDate();
      let resultCompare = CompareDate(a.Action.Commitment_date.toString(), initial);
      let bgBar = resultCompare == 1 ? "bg-success" : resultCompare == 0 ? "bg-warning" : "bg-danger";
      let icon = a.Action.State == 2 ? `<em class="fas fa-check-double textAzulMovistar"></em>` : `<em class="far fa-square"></em>`;
      div.innerHTML += `
      <div class="action-element rounded hand row pt-1 pb-1 mb-1" data-id="${a.Action.Id}">
        <div class="col-8 text-justify">
          ${icon}&nbsp;
          ${(a.Action.Observation.length>=100)?a.Action.Observation.substr(0,90)+"...":a.Action.Observation}
        </div>
        <div class="col">
          <div class="progress">
            <div class="progress-bar text-center ${bgBar}" role="progressbar" style="width: ${a.Action.Advance}%;" aria-valuenow="${a.Action.Advance}" aria-valuemin="0" aria-valuemax="100">${a.Action.Advance}%</div>
          </div>
        </div>
      </div>`
    });
    let list = document.getElementsByClassName("action-element");
    Array.from(list).forEach((e)=>{
      let i = e as HTMLElement;
      e.addEventListener("click", d => {
        this.CleanForm();
        this.DrawDetail(i.dataset.id as string, e);
      });
    });
  }
  DrawDetail(Id: string, e: globalThis.Element) {
    const objElement = Element.getInstance();
    e.classList.toggle("selected");
    let element = e.getElementsByClassName("fa-square")[0];
    if(typeof element !== "undefined"){
      element.classList.add("fa-check-square");
      element.classList.remove("fa-square");
    }
    const result = this.action_list.filter(a => a.Action.Id == Number(Id))[0];
    const action_form = document.getElementById("action-form") as HTMLElement;
    const action_detail = document.getElementById("action-detail") as HTMLElement;
    const action_state = document.getElementById("action-state") as HTMLElement;
    const action_initial_date = document.getElementById("action-initial-date") as HTMLElement;
    const action_commitment_date = document.getElementById("action-commitment-date") as HTMLElement;
    const action_users = document.getElementById("action-users") as HTMLElement;
    const responsable_list = document.getElementById("responsable-list") as HTMLElement;
    action_detail.innerHTML = `
     <p class="text-justify">${result.Action.Observation}</p>
     <p class="text-justify"><strong>Causa Raiz:</strong> ${objElement.GetCause(result.Action.Cause)?.Name}</p>
     <p class="mb-0"><small class="text-muted"><b>Avance:</b> ${result.Action.Advance}%&nbsp;&nbsp;<b>Estado:</b> ${this.states[result.Action.State]}</small></p>
     <p class="mb-0 mt-1"><small class="textAzulMovistar"><b>Creado:</b> ${result.Action.Created.toString().slice(0,10)}&nbsp;&nbsp;<b>Creado por:</b> ${result.Action.Created_by}</small></p>
    `;
    action_state.innerHTML = this.states[result.Action.State];
    action_initial_date.innerHTML = result.Action.Initial_date.toString().slice(0,10);
    action_commitment_date.innerHTML = result.Action.Commitment_date.toString().slice(0,10);
    action_users.innerHTML = result.Responsables.map(r => r==null?"":`<p class="mb-0">${r.Name}</p>`).join("");
    if(responsable_list!=null){responsable_list.innerHTML = "";}
    slideUp(action_form);
    const tracing = new Tracing(result.Tracings, result.Action, this.states);
    tracing.Get();
  } 
  private PrepareNew(){
    this.CleanForm();
    const action_form = document.getElementById("action-form") as HTMLElement;
    const action_detail = document.getElementById("action-detail") as HTMLElement;
    const action_tracing = document.getElementById("action-tracing") as HTMLElement;
    action_detail.innerHTML = "";
    action_tracing.innerHTML = "";
    slideDown(action_form);
  }
  async GetByState(state: number){
    try {
      let API = `${this.util.API}Action/Get/${state}`;
      let header = { headers: { 'Authorization': localStorage.getItem("Token") || "" } };
      let response = await fetch(API, header);
      return await response.json();
    } catch (error) {
      
    }
  }
}