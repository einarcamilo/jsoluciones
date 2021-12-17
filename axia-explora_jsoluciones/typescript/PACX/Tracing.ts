import { SerializeData } from "../Utilities.js";
import { Action } from "./Actions.js";
import { Element } from "./Element.js";
import { IAction, IActionDetail, ITracings } from "./Interfaces.js";
import { Utilities } from "./Utilities.js";

export class Tracing{
  private states: string[]
  private tracing_list: ITracings[];
  private action: IAction;
  private util: Utilities;
  constructor(data:ITracings[], action: IAction, states: string[]){
    this.util = new Utilities();
    this.action = action;
    this.states = states;
    this.tracing_list = data;
  }
  async Get(){
    const div_ppal = document.getElementById("action-tracing") as HTMLDivElement;
    div_ppal.innerHTML = "";
    const response = await fetch("templates/PACX/tracing.html");
    if(response.status >= 200 && response.status <= 299){
      const html = await response.text();
      div_ppal.innerHTML = html;
      this.FillDataForm();
      this.DrawList();
    }
  }
  private FillDataForm(){
    const objElement = Element.getInstance();
    const form = document.getElementById("save-tracing") as HTMLElement;
    if(this.states[2] == this.states[this.action.State] ){ form.remove(); }
    else{
      const Observation = document.getElementById("tracing-observation") as HTMLTextAreaElement;
      Observation.value = "";
      const advance = document.getElementById("tracing-advance") as HTMLElement;
      advance.innerHTML = `
      <input class="form-control mandatory numbers-only" type="number" value="${this.action.Advance}" name="advance" max="100" min="0" placeholder="Advance" />
      <div class="input-group-prepend">
      <div class="input-group-text"><i class="fas fa-percent"></i></div>
      </div>
      `;
      form.innerHTML += `<input type="hidden" name="action_id" value="${this.action.Id}" />`;
      form.addEventListener("submit",(e)=>{this.Save(e)});
      this.states.forEach((value, index)=>{
        let val = index == 0 ? "" : index;
        let text = index == 0 ? "Seleccione" : value;
        $("#tracing-states").append(`<option value="${val}">${text}</option>`);
      });
      objElement.Causes.forEach(e => $("#tracing-cause").append(`<option value="${e.Id}">${e.Name}</option>`));
      $("#tracing-states").val(this.action.State);//TODO try to make it vanilla
      $("#tracing-cause").val(this.action.Cause);
    }
  }
  private DrawList(){
    const list = document.getElementById("tracing-list") as HTMLElement;
    list.innerHTML = this.tracing_list.map(t=>`
      <div class="row">
        <div class="col-1">
          <div class="rounded-circle h30 w30 lh30 text-uppercase telefonicaTitulo bgGris5 text-center">${t.Created_by.slice(0,2)}</div>
        </div>
        <div class="col-11">
          <p class="mb-0"><b>${t.Created.toString().slice(0,10)}</b> ${t.Observation}</p>
          <p class="mb-0 mt-1"><small class="text-muted"><b>Avance:</b> ${t.Advance}%&nbsp;&nbsp;<b>Estado:</b> ${this.states[t.State]}</small></p>
        </div>
        <div class="col-12"><hr /></div>
      </div>
    `).join('');
  }
  private async Save(e: Event){
    e.preventDefault();
    if(this.util.ValidateForm(e)){
      let data = SerializeData(e.target as HTMLFormElement);
      const APIUpdate = `${this.util.API}Action/Update`;
      const header = {
        headers:{
          'Authorization': localStorage.getItem("Token") || "",
          "Content-Type":" application/json"
        },
        method:'post',
        body: JSON.stringify(data)
      };
      let response = await fetch(APIUpdate, header);
      if(response.status >= 200 && response.status <= 299){
        let progress = document.getElementsByClassName("action-element selected")[0] as HTMLElement;
        let tracing: IActionDetail = await response.json();
        let action = Action.getInstance();
        let em = progress.getElementsByTagName("em")[0] as HTMLElement;
        let bar = progress.getElementsByClassName("progress-bar")[0] as HTMLElement;
        bar.style.width = `${tracing.Action.Advance}%`;
        bar.innerHTML = `${tracing.Action.Advance}%`;
        this.action = tracing.Action;
        this.tracing_list = tracing.Tracings;
        this.DrawList();
        action.UpdateMe(tracing);
        this.FillDataForm();
        if(tracing.Action.State==2){
          em.classList.remove("fa-check-square","fa-square", "far");
          em.classList.add('fa-check-double', 'textAzulMovistar', 'fas');
        }
      }
    }
  }
}