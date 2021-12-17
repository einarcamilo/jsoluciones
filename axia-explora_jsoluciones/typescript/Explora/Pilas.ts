import { Evaluation, QuestionForm } from "./Evaluation.js";
import { Utilities } from "./Utilities.js";

export interface ReferencesDTO{
  Responsables: string;
  Segments: string[];
  Process: string[];
  Channels: string[];
}
export interface PilasDTO{
  Id: number;
  Date: string;
  Begins: Date;
  Title: string;
  Resume: string;
  Content: string;
  Status: number;
  Validity: string;
  Anchored: number;
  Operation: string;
  Priority: number;
  Url: string;
  References: ReferencesDTO;
  Question: QuestionForm;
}
export class Pilas{
  pilas: Array<PilasDTO>;
  private limitElements:number;
  private Eval: Evaluation;
  private Util: Utilities;
  constructor(){ 
    this.pilas = new Array<PilasDTO>(); 
    this.limitElements = 9;
    this.Eval = new Evaluation();
    this.Util = new Utilities();
  }

  //#region Explora
  GetExplora(user: string, quantity: number = 0){
    if(quantity===0){ $('.main-pilas').empty(); }
    $.ajax({
      url:'../Aplicaciones2/api/PilasExplora/?user=' + user + '&quantity=' + quantity,cache:!1,type:'get',
      dataType:'json', success: info => { this.pilas = info; }, complete: () => { this.DrawExplora(quantity + 9); }
    });
  }
  DrawExplora(quantity: number){
    $(".main-pilas").find('.main-more').remove();
    if(this.pilas.length<=0){ 
      $(".main-pilas").append(
        `<div class="main-more row">
          <div class="col-6 text-center offset-3">
            <h3>¡No hay más elementos a mostrar!</h3>
            <span class="text-muted">Intente en el hístorico</span>
          </div>
        </div>`
      );
      return true; 
    }
    let kItems = 1;
    let HTML = $("<div/>");
    let preHtml = quantity<=9?"<div class='col-12'><div class='card'><div class='card-header' style='font-family:TelefonicaHand'><div class='d-flex'><div class='mr-1 bar-icons'>Convenciones:</div><div class='mr-1 bar-icons'>Fija <img src='img/hiconFijaActive.png' alt=''><img src='img/hiconMovilInactive.png' alt=''></div><div class='mr-1 bar-icons'>Movil <img src='img/hiconFijaInactive.png' alt=''><img src='img/hiconMovilActive.png' alt=''></div><div class='mr-1 bar-icons'>Convergente <img src='img/hiconFijaActive.png' alt=''><img src='img/hiconMovilActive.png' alt=''></div><div class='flex-fill bar-icons'>Pilas anclado <img src='img/hiconAttachActive.png' data-value='0' alt=''> (Se pueden anclar máximo 2 pilas)</div><div class='bar-icons'><img src='img/iconStar.png' alt=''> Pilas prioritario</div></div></div></div></div>":"";
    for(let pilas of this.pilas){
      if(kItems <= this.limitElements){
        let htm = $('<div/>');
        htm.addClass("col-4 element-pilas");
        let textHtml = "<div class='card'><div class='card-header'>";
        textHtml += "<div class='icons-header'>";
        let hIcon = this.VerifyOperation(pilas.Operation);
        textHtml += "<div class='" + hIcon[0] + "'></div>";
        textHtml += "<div class='" + hIcon[1] + "'></div>";
        
        if(pilas.Anchored == 1)
          textHtml += "<div data-toggle='tooltip' title='Desanclar este elemento' data-value='0' alt='' data-id='" + pilas.Id + "' class='btn-anchoring btn-anchoring-active'></div>"
        else
          textHtml += "<div data-toggle='tooltip' title='Desanclar este elemento' data-value='0' alt='' data-id='" + pilas.Id + "' class='btn-anchoring btn-anchoring-inactive'></div>"

        textHtml += "</div><div class='f12 text-info'>" + pilas.Date + "</div>";
        textHtml += "<table><tr>"
        if(pilas.Priority == 1){
          textHtml += "<td><img src='img/iconStar.png' alt=''></td>";
        }
        textHtml += "<td><b>" + pilas.Title + "</b></td></tr></table></div><div class='card-body'>";
        textHtml += "<div class='mb-2'>" + pilas.Resume + "</div>";
        textHtml += "<hr style='color:rgb(200,200,200);margin:0;padding:0;'>"
        textHtml += "<div class='d-flex mt-2'><div class='flex-fill'>";

        if(pilas.Status == 0)
          textHtml += "<img src='img/iconNoLeido.png' alt=''> No leído</div>";
        else if(pilas.Status == 1)
          textHtml += "<img src='img/iconLeido.png' alt=''> Leído a tiempo</div>";
        else
          textHtml += "<img src='img/iconFueraTiempo.png' alt=''> Leído fuera de tiempo</div>";
        textHtml += "<div class='flex-fill text-right'><button data-id='" + pilas.Id + "' class='btn btn-sm btn-primary btn-see-more'>ver más</button></div></div>";
        htm.html(textHtml);
        HTML.append(htm)
        //-------------------------------------
      }
      kItems++;
    }
    HTML.prepend(preHtml);
    HTML.addClass("row mt-2");
    $('.main-pilas').append(HTML);
    $(".main-pilas").append(
      `<div class="main-more row">
        <div class="col-2 offset-5">
          <button class="btn btn-secondary btn-more-pilas btn-block" data-quantity="${quantity}">Ver más</button>
        </div>
      </div>`
    );
  }
  GetById(id: number, exist: boolean, old: number){
    if(exist){
      let pilas = this.pilas.filter(p => p.Id === id);
      if(pilas.length>0){ this.DrawDetail(pilas[0]); }
      else{this.GetNew(id);}
    }
    else{
      if(old == 1){ this.GetOld(id); }
      else{this.GetNew(id);}
    }
  }
  private GetNew(id: number) {
    $.ajax({
      url:'../Aplicaciones2/api/PilasExplora/ById/', type:"get",dataType:'json',
      success: info => { this.DrawDetail(info) }, data: { id: id, user: localStorage.getItem("user") }
    });
  }
  DrawDetail(pilas: PilasDTO){
    $('.main-details').empty().show(); 
    let textHtml = this.TextHtml(pilas);
    let HTML = $("<div/>");
    let htm = $('<div/>');
    htm.addClass("col");
    htm.html(textHtml);
    HTML.append(htm)
    HTML.addClass("row mt-2");
    $('.main-details').append(HTML);
    if(pilas.Status == 0)
      this.Eval.DrawQuestion(pilas.Question, pilas.Id);
    else
      this.Eval.DrawResponse();
    $(".main-pilas, .main-menu, .main-historico,.main-buscador").hide();
    this.Util.OrderImg("main-details");
  }
  GetHistorical(){
    let JsonHistorico: any;
    $.ajax({
      url:'../Aplicaciones2/api/PilasExplora/Historicals',
      type:'get',dataType:'json',
      beforeSend: ()=>{ $('.main-historico').empty().html("<h1 class='text-center textMoradoMovistar mt-5'><i class='fas fa-spinner fa-spin'></i></h1>"); },
      success: function(data){
        JsonHistorico = data;
        JsonHistorico.reverse();
      }, complete: ()=>{
        let htm = "<div class='row mt-2'><div class='col'>";
        htm += "<div class='f18'><b>Histórico de Pilas</b></div>";
        htm += "</div></div>";
        let htmlBoxHistory = this.HTMLHistorical(JsonHistorico);
        $('.main-historico').empty().append(htm);
        $('.main-historico').append(htmlBoxHistory);
        this.HTMLHistoricalInternal(JsonHistorico);
        this.HTMLHistoricalWeeks(JsonHistorico);
        this.HTMLHistoricalContent(JsonHistorico);
      }
    });
  }
  Anchoring(id: number, value: number){
    let response = false;
    let json =  {
      "Id": id,
      "User": localStorage.getItem("user"),
      "Anchored": (value == 1) ? true : false
    };
    $.ajax({
      type: "post", url: "../Aplicaciones2/api/PilasExplora/Anclar", async: false,
      dataType: "json", data: JSON.stringify(json), contentType: "application/json; charset=utf-8",
      success: function (info) { response = info.Success }
    });
    return response;
  }
  private GetOld(id: number){
    $.ajax({
      url:'http://iagregado/intranetva/datagrid/dbgrid/pilas_online/read.php?id=' + id,
      type:'get',dataType:'json',
      success: data => {
        this.DrawDetail(data);
      }
    });
  }
  private HTMLHistorical(JsonHistorico: any){
    let htmlHistorico = $("<div/>");
    let htmlNav = $("<nav/>");
    let htmlTabs = $("<div/>");
    let htmlContents = $("<div/>");
    htmlTabs.addClass('nav nav-tabs').attr({"id":"dTabs","role":"tablist"});
    htmlNav.append(htmlTabs);
    htmlContents.addClass('tab-content');
    let textYear = "";
    for(let pilas of JsonHistorico){
      let yy = pilas.Year;
      if(textYear != yy){
        let tab = $("<a/>");
        let cont = $("<div/>");
        tab.addClass('nav-item nav-link').attr({"data-toggle":"tab","role":"tab","href":"#cont" + yy,"id":"dTab" + yy});
        cont.addClass('tab-pane fade p-2').attr({"id":"cont" + yy,"role":"tabpanel"});
        if(yy == (new Date).getFullYear()){
          tab.addClass('active');
          cont.addClass('show active');
        }
        tab.html(yy);
        cont.html(yy + " - Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugit quos recusandae, labore rerum deserunt fugiat praesentium a velit eius at.");
        htmlTabs.prepend(tab);
        htmlContents.append(cont);
        textYear = yy;
      }
    }
    htmlHistorico.append(htmlNav).append(htmlContents);
    return htmlHistorico;
  }
  private HTMLHistoricalInternal(JsonHistorico: any){
    let textYear = "", textMonth = "";
    let htmlCollapses: any;
    let htm;
    for(let pilas of JsonHistorico){
     let yy = pilas.Year;
     if(textYear == ""){
       textYear = yy;
       htmlCollapses = $("<div/>");
       htmlCollapses.attr('id','accordion' + textYear);
      }
      else if(textYear != yy){
        $("#cont" + textYear).html(htmlCollapses);
        textYear = yy;
        htmlCollapses = $("<div/>");
        htmlCollapses.attr('id','accordion' + textYear);
      }
      for(let months of pilas.Months){
        let mm = months.Name;
        if(textMonth != mm){
          htm = $("<div/>");
          htm.addClass('card');
          htm.html("<div class='card-header'><h5 class='mb-0'><button class='btn btn-link btn-sm' data-toggle='collapse' data-target='#" + mm + yy + "'>" + mm + "</button></h5></div><div id='" + mm + yy + "' class='collapse' data-parent='#accordion" + textYear + "'><div class='card-body' id='content_" + mm + yy + "'></div></div>");
          htmlCollapses.prepend(htm);
          textMonth = mm;
        }
      }
    }
    $("#cont" + textYear).html(htmlCollapses);
  }
  private HTMLHistoricalWeeks(JsonHistorico: any){
    let yy, mm, ww;
    for(let pilas of JsonHistorico){
      yy = pilas.Year;
      for(let months of pilas.Months){
        mm = months.Name;
        let navWeek  = $("<nav/>");
        let divNav = $("<div/>");
        let tabContent = $("<div>");
        tabContent.addClass('tab-content');
        for(let weeks of months.Weeks){
          ww = weeks.Week;
          let linkWeek = $("<a/>");
          let tabPane = $("<div/>");
          divNav.addClass('nav nav-tabs').attr({"role":"tablist"});
          linkWeek.addClass('nav-item nav-link').attr({"data-toggle":"tab","role":"tab","href":"#cont_Semana" + ww + mm + yy});
          linkWeek.html("Semana " + ww);
          tabPane.addClass('tab-pane fade').attr({"role":"tabpanel","id":"cont_Semana" + ww + mm + yy});
          divNav.append(linkWeek);
          tabContent.append(tabPane);
        }
        navWeek.append(divNav);
        $('#content_' + mm + yy).append(navWeek);
        $('#content_' + mm + yy).append(tabContent);
      }
    }
  }
  private HTMLHistoricalContent(JsonHistorico: any){
    let yy, mm, ww;
    for(let pilas of JsonHistorico){
      yy = pilas.Year;
      for(let months of pilas.Months){
        mm = months.Name;
        for(let weeks of months.Weeks){
          ww = weeks.Week;
          for(let item of weeks.Pilas){
            let htmlElement = "<div class='item-pilas-historico' data-old='" + item.Old + "' data-id='" + item.Id + "'><table><tr>";
            if(item.Operation == "Convergente"){
              htmlElement += "<td><img src='explora/public/imgs/hiconFijaActive.png' alt='' />";
              htmlElement += "<img src='explora/public/imgs/hiconMovilActive.png' alt='' /></td>";
            }
            else if(item.Operation == "Fija"){
              htmlElement += "<td><img src='explora/public/imgs/hiconFijaActive.png' alt='' />";
              htmlElement += "<img src='explora/public/imgs/hiconMovilInactive.png' alt='' /></td>";      
            }
            else{
              htmlElement += "<td><img src='explora/public/imgs/hiconFijaInactive.png' alt='' />";
              htmlElement += "<img src='explora/public/imgs/hiconMovilActive.png' alt='' /></td>";
            }
            htmlElement += "<td><span class='f12'>" + item.Url + "</span><br>";
            htmlElement += "<b class='18 text-primary'>" + item.Title + "</b><br>";
            htmlElement += "<span class='f12'>" + item.Published + "</span></td></tr></table></div>";
            $('#cont_Semana' + ww + mm + yy).append(htmlElement);
          }
        }
      }
    }
  }
  CheckRead(id: number, status: number){
    this.pilas.filter(p => p.Id === id)[0].Status = status;
  }
  //#endregion
  //#region Sites
  GetSite(process_id:number, user: string){
    $.ajax({
      url: '../Aplicaciones2/api/PilasExplora/Process', dataType: 'json',
      data:{ id: process_id, user: user },
      success: info => { this.pilas = info; }
    });
  }
  DrawSite(){
    let html = "";
    let cont = 0;
    for(let p of this.pilas){
      html += `
      <div class="row border-bottom mb-2 goto-pilas cursor" data-id="${p.Id}">
        <div class="col-12 textGris8 f7">${this.DateLong(p.Date.toString())}</div>
        <div class="col-12 f9"><b class="long-text" data-size="41">${p.Title}</b></div>
        <div class="col-12 textGris8 f8"><i class="fas fa-chevron-down fa-rotate-45"></i>&nbsp;${p.Resume}</div>
      </div>
      `;
      cont++;
      if(cont>5){ break; }
    }
    $(".latest-pilas").empty().html(`<div class="row cursor colapsable-content">
        <div class="col textAzulMovistar"><i class="fas fa-minus f7"></i> Últimos pilas</div>
      </div>
      <div>${html}</div>`);
  }
  DateLong(date: string) {
    let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre','Noviembre','Diciembre'];
    let d = new Date(date),
      month = months[d.getMonth()],
      year = d.getFullYear(),
      day = (d.getDate()<10)?"0"+d.getDate():d.getDate();
    return `${month} ${day} de ${year}`;
  }
  //#endregion
  //#region Generals
  Detail(id: number, user: string){
    let pilas = this.pilas.filter(p => p.Id == id)[0];
    let textHtml = this.TextHtml(pilas);
    let main = $('main').find('.col-9').first();
    $(main).find('.container').first().slideUp();
    $(main).append("<div class='container to-delete'></div>");
    let HTML = $("<div/>");
    let htm = $('<div/>');
    htm.addClass("col");
    htm.html(textHtml);
    HTML.append(htm)
    HTML.addClass("row mt-2");
    $('.to-delete').append(HTML);
    if(pilas.Status == 0)
      this.Eval.DrawQuestion(pilas.Question, pilas.Id);
    else
      this.Eval.DrawResponse();
  }
  VerifyOperation(neg: string){
    if(neg == "Fija")
      return ["hiconFijaActive ", "hiconMovilInactive "];
    else if(neg == "Móvil")
      return ["hiconFijaInactive ", "hiconMovilActive "];
    else
      return ["hiconFijaActive ", "hiconMovilActive "];
  } 
  TextHtml(pilas: PilasDTO):string{
    let textHtml = "<button class='btn btn-light btn-sm btn-back-elements mb-1'><i class='fa fa-caret-left'></i> volver</button>";
    textHtml += "<div class='card'><div class='card-header'>";
    textHtml += "<div class='icons-header'>";
    let hIcon = this.VerifyOperation(pilas.Operation);
    textHtml += "<div class='mr-1 textGris5 user-name' ><i class='fa fa-user'></i> " + localStorage.getItem("user") + "</div>";
    textHtml += "<div class='" + hIcon[0] + "'></div>";
    textHtml += "<div class='" + hIcon[1] + "'></div>";
    textHtml += "</div><div class='f12 text-info'>" + pilas.Date + "</div>";
    textHtml += "<table><tr>";
    if(pilas.Priority == 1){
      textHtml += "<td><img src='../soluciones/img/iconStar.png' alt=''></td>";
    }
    textHtml += "<td><div class='f25'><b>" + pilas.Title + "</b></div></td></tr></table>"
    textHtml += "<div class='f12 textGris5'>" + pilas.Url + "</div></div><div class='card-body'>";
    textHtml += "<div class='mb-2 d-flex'><div class='flex-grow-0 p-1' style='border-right:1px solid rgb(200,200,200);'>" + pilas.Content + "</div>";
    //Seccion Referencias del pilas
    textHtml += "<div class='p-1 text-center col-3'>";
    textHtml += "<div class='mb-2 text-info'><b>Responsable(s)</b><br>";
    textHtml += "<span class='text-secondary'>" + pilas.References.Responsables + "</span></div>";
    textHtml += "<div class='mb-2 text-info'><b>Segmento(s)</b><br>";
    textHtml += "<span class='text-secondary'>" + pilas.References.Segments + "</span></div>";
    textHtml += "<div class='mb-2 text-info'><b>Proceso(s)</b><br>";
    textHtml += "<span class='text-secondary'>" + pilas.References.Process + "</span></div>";
    textHtml += "<div class='mb-2 text-info'><b>Canal(es)</b><br>";
    textHtml += "<span class='text-secondary'>" + pilas.References.Channels + "</span></div>";
    //Fin seccion Referencias del pilas
    textHtml += "</div></div>";
    textHtml += "<hr style='color:rgb(200,200,200);margin:0;padding:0;'>"
    textHtml += "<div id='question'></div>";
    textHtml += "</div></div>";
    return textHtml;
  }
  CheckAnswer(id:number,status:number){
    this.pilas.filter(p => p.Id === id)[0].Status = status;
  }
  //#endregion
}