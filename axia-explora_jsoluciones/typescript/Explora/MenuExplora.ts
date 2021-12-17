export interface IMenuExplora{
  Id: number;
  Name: string;
  Icon: string;
  Type: string;
  Url: string;
  Order: number;
  Active: boolean;
}
export interface ISite{
  Abbreviation: string;
  Id: number;
  Name: string;
  Operation: string;
  Route: string;
}
export interface MenuItem
{
  Id:number;
  Name:string;
  Url:string;
}
export interface MenuList
{
  Operation: string;
  Items: Array<MenuItem>;
}
export interface MenuDetail extends MenuItem{
  Operation:string;
  Description:string;
}
export interface MenuPrincipal
{
  Name: string;
  List: MenuDetail[];
}
export class MenuExplora{
  private Menu: IMenuExplora[];
  private MenuLeft: ISite[];
  private MenuPrincipal: MenuPrincipal[];
  constructor(){
    this.Menu = new Array<IMenuExplora>();
    this.MenuLeft = new Array<ISite>();
    this.MenuPrincipal = new Array<MenuPrincipal>();
    this.Get();
  }
  Get() {
    $.ajax({
      url: '../Aplicaciones2/api/MenuExplora/Get', cache:!1, type:'get', dataType:'json',
      success: data => { this.Menu = data; }, complete: ()=>this.Draw()
    });
    $.ajax({
      url: '..//Aplicaciones/api/Sites/Productive', cache:!1, type:'get', dataType:'json',
      success: data => { this.MenuLeft = data; }, complete: ()=>this.DrawLeft()
    });
  }
  DrawLeft(): void {
    $('#menuVertical').empty();
    let htm = "";
    for(var icon of this.MenuLeft){
      htm += "<div class='btn-aside mb-1' data-toggle='tooltip' data-placement='right' title='" +  icon.Name + "' data-action='" + icon.Route + "'><img src='img/" + icon.Abbreviation + ".png' alt=''></div>";
    }
    $('#menuVertical').html(htm);
    $('[data-toggle="tooltip"]').tooltip();
  }
  Draw(): void {
    $('#accesosDirectos').empty();
    let htm = "";
    for(var icon of this.Menu){
      htm += "<div class='btn-identity me-1' data-toggle='tooltip' data-placement='bottom' title='" +  icon.Name + "' data-title='" +  icon.Name + "' data-type='" + icon.Type + "' data-action='" + icon.Url + "' style='display: inline-block;'><img src='" + icon.Icon + "' alt=''></div>";
    }
    $('#accesosDirectos').html(htm);
    $('[data-toggle="tooltip"]').tooltip();
  }
  OpenModals(type: string, url: string, title: string){
    let content: MenuList[] = new Array<MenuList>();
    if(type == "externo"){
      window.open(url);
    }
    else{
      $.ajax({
        url:url,cache:!1,async:!1,dataType:'json',type:'get',
        success:function(d){ content = d; }});
      let nav = $("<nav/>");
      let htm_tab = "<div class='nav nav-tabs' role='tablist'>";
      let htm_cont = "<div class='tab-content'>";
      let i = 0, claseActiva = 'active', claseCActiva = 'show active';
      for(let link of content){
        if(i != 0){ claseActiva = ''; claseCActiva = ''; }
        htm_tab += "<a class='nav-item nav-link " + claseActiva + "' data-toggle='tab' role='tab' href='#contDirect" + link.Operation + "'>" + link.Operation + "</a>";
        htm_cont += "<div class='tab-pane fade border border-top-0 rounded-bottom p-2 " + claseCActiva + "' role='tabpanel' id='contDirect" + link.Operation + "'><div class='d-flex'><div class='flex-fill'>";
        let cant = link.Items.length;
        let k = 1;
        for(let content of link.Items){
          htm_cont += "<div class='f13'><a href='" + content.Url + "' target='_blank'>" + content.Name + "</a></div>";
          if(k == Math.ceil(cant / 2) && cant > 20){
            htm_cont += "</div><div class='flex-fill'>";
          }
          k++;
        }
        htm_cont += "</div></div></div>";
        i++;
      }
      htm_tab += "</div>";
      htm_cont += "</div>";
      nav.append(htm_tab + htm_cont);
      $('#contenidoAccesoDirecto').find('.modal-header').html("<h3 class='modal-title'>" + title + "</h3><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>");
      $('#contenidoAccesoDirecto').find('.modal-body').html("<nav>" + htm_tab + htm_cont + "</nav>");
      $('#contenidoAccesoDirecto').modal('show');
    }
  }
  GetMain(){
    if(this.MenuPrincipal.length<=0){
      $.ajax({
        url: '../Aplicaciones2/api/MenuExplora/Main', type:'get', dataType: 'json',
        success: info => this.MenuPrincipal = info, complete: () =>  {this.DrawMain(); setTimeout(()=>this.MenuPrincipal=new Array<MenuPrincipal>(),300000)}
      });
    }
    else{ this.DrawMain(); }
  }
  DrawMain(){
    $(".main-menu").empty();
    let left = "", right = "", idItem = 0;
    for(let menu of this.MenuPrincipal){
      left += `
        <a  class="nav-link" id="v-pills-main-${idItem}-tab" data-toggle="pill" data-target="#v-pills-main-${idItem}" href="#v-pills-main-${idItem}" type="button" role="tab" aria-controls="v-pills-main-${idItem}" aria-selected="true">${menu.Name}</a>
      `;
      right += `
        <div class="tab-pane fade show" id="v-pills-main-${idItem}" role="tabpanel" aria-labelledby="v-pills-main-${idItem}-tab">
        <div class="d-flex">
      `;
      let cont = 1;
      let fillLeft = "<div class='flex-fill'>", fillRight = "<div class='flex-fill'>";
      for(let item of menu.List){
        let icon = item.Operation=="Convergente"?`<i class="textAzulMovistar icon-fija"></i><i class="textAzulMovistar icon-movil"></i>&nbsp`:`<i class="textAzulMovistar icon-${item.Operation.toLocaleLowerCase()}"></i>&nbsp;`;
        if(cont%2==0){
          fillRight += `<div class="btn-aside" data-action="${item.Url}">${icon}${item.Name}</div>`;
        }
        else{
          fillLeft += `<div class="btn-aside" data-action="${item.Url}">${icon}${item.Name}</div>`;
        }
        cont++;
      }
      right += fillLeft + "</div>" + fillRight +"</div></div></div>";
      idItem++;
    }
    $(".main-menu").html(`
    <div class="d-flex align-items-start">
      <div class="nav col-3 flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
      ${left}
      </div>
      <div class="tab-content col-9" id="v-pills-tabContent">
      ${right}
      </div>
    </div>
    `).slideDown();
  }
}