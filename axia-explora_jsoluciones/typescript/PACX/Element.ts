import { IElement } from "./Interfaces.js";
import { Utilities } from "./Utilities.js";


export enum  TypesElement { Operations= "Operations", Channels= "Channels", Kpis="Kpis", Ally = "Ally", Regional = "Regional", Centers="Centers",Segments="Segments", Causes = "Causes" };
export class Element{
  Operations: IElement[] = new Array<IElement>();
  Channels: IElement[] = new Array<IElement>(); 
  Causes: IElement[] = new Array<IElement>(); 
  LocalAPI: string;
  util: Utilities;
  private static instance: Element;
  GetType(type:string){
    return type === "Centro de Experiencia" ? TypesElement.Centers : TypesElement.Segments;
  }
  private constructor(){
    this.util = new Utilities();
    this.LocalAPI = `${this.util.API}Elements/`;
  }
  static getInstance(){
    if(!Element.instance){
      Element.instance = new Element();
    }
    return Element.instance
  }
  async Initial() {
    try {
      let header = {headers:{
        'Authorization': localStorage.getItem("Token") || ""
      }};
      let responseOper = await fetch(`${this.LocalAPI}Index/${TypesElement.Operations}`, header);
      let responseChannel = await fetch(`${this.LocalAPI}Index/${TypesElement.Channels}`, header);
      let responseCauses = await fetch(`${this.LocalAPI}Index/${TypesElement.Causes}`, header);
      this.Operations = await responseOper.json();
      this.Channels = await responseChannel.json();
      this.Causes = await responseCauses.json();
    } catch (error) {
      console.error("Elements error", error);
    }
  }
  async DrawElements(){
    let channel = null || document.getElementById("channels_list");
    let operation = null || document.getElementById("operations_list");
    if(channel!==null){ this.ChannelsOptions(channel); }
    if(operation!==null){ operation.innerHTML = `<label class="textAzulMovistar" for="operation">Seleccione Operación</label>${this.SelectList("operation", this.Operations)}`; }
    this.util.ValidateMandatory();
  }
  async GetKpi(value:string = ""){
    try {
      if(value.length<=0){
        const channel = document.getElementById('channel') as HTMLSelectElement;
        value = channel.value;
      }
      let header = {headers:{
        'Authorization': localStorage.getItem("Token") || ""
      }};
      let responseKpi = await fetch(`${this.LocalAPI}Get/?types=${TypesElement.Kpis}&value=${value}`, header);
      return await responseKpi.json();
    } catch (error) {
      console.error("Elements error", error);
    }
  }
  SelectList(name: string, list:Array<IElement>, mandatory:boolean = true, text:string = "Seleccione"):string{
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
  GetCauses(){
    let select = this.SelectList("cause", this.Causes, true, "Seleccione causa raíz");
    return select;
  }
  GetCause(Id:number){
    let cause = this.Causes.find(c => c.Id == Id);
    return cause;
  }
  private async ChannelsOptions(channel: HTMLElement){
    let channels: string = this.Channels.length == 1 ?
      `<label class="textAzulMovistar" for="channel">Canal de gestión</label>
       <h5 class="textAzulMovistar mt-2">${this.Channels[0].Name}</h5>
       <input type="hidden" name="channel" id="channel" value="${this.Channels[0].Id}" />` :
      `<label class="textAzulMovistar" for="channel">Seleccione el canal de gestión</label>
      ${this.SelectList("channel",this.Channels)}
      `;
    channel.innerHTML = channels;
    if(this.Channels.length == 1){
      this.KpiOptions(String(this.Channels[0].Id));
      this.AllyOptions();
    }
    else{
      document.getElementById("channel")?.addEventListener("change",()=>{ 
        this.KpiOptions();
        this.AllyOptions();
      });
    }
  }
  private async KpiOptions(value: string =""){
    let kpi = null || document.getElementById("kpis_list");
    let KpiList: IElement[] = await this.GetKpi(value);
    if(kpi!==null){ 
      kpi.innerHTML = `<label class="textAzulMovistar" for="kpi">Seleccione el KPI</label>
        ${this.SelectList("kpi",KpiList)}`; 
      let kpiSelect = document.getElementById("kpi") as HTMLSelectElement;
      kpiSelect.addEventListener("change",(e)=>{
        let value = Number(kpiSelect.value);
        let description = KpiList.filter((k)=>k.Id==value)[0].Description;
        let ele = document.getElementsByClassName("feedback");
        Array.from(ele).forEach(r=>r.remove());
        let div = document.createElement("div");
        div.classList.add("feedback");
        div.textContent = description;
        kpiSelect.after(div);
      });
    }
    this.util.ValidateMandatory();
  }
  private async AllyOptions(){
    let values:IElement[] = new Array<IElement>();
    let channel = document.querySelector("#channel") as HTMLSelectElement;
    let label = "";
    if(channel.value.length>0 && channel != undefined){
      let option = parseInt(channel.value, 10) == 1 ? TypesElement.Regional : TypesElement.Ally;
      label = parseInt(channel.value, 10) == 1 ? TypesElement.Regional : "Aliado";
      values = await this.GetAllies(option);
    }
    let ally_list = null || document.getElementById("allys_list");
    if(ally_list !== null){
      ally_list.innerHTML = `
      <label class="textAzulMovistar" for="ally">Seleccione el ${label}</label>
      ${this.SelectList("ally", values, true)}
      `;
    }//TODO: Finish the selected options
    this.util.ValidateMandatory();
  }
  async GetAllies(option: TypesElement){
    let values:IElement[] = new Array<IElement>();
    try {
      let header = {headers:{
        'Authorization': localStorage.getItem("Token") || ""
      }};
      let responseAlly = await fetch(`${this.LocalAPI}Index/${option}`, header);
      values = await responseAlly.json();
    } catch (error) {
      console.error("Elements error", error);
    }
    return values;
  }
}