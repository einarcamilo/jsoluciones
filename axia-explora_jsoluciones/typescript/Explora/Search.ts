export interface ISearcher
{
  Id: number;
  Name: string;
  Url: string;
  Description: string;
  Operation: string;
}
export interface ISearcherResponse
{
  Type: string;
  Items: ISearcher[];
}
export class Searcher {
  private Search: ISearcherResponse[];
  private requests: any[] = [];
  constructor() {
    this.Search = new Array<ISearcherResponse>();
  }
  Get(value:string){
    this.CancelRequests();
    this.requests.push(
      $.ajax({
        url: "../Aplicaciones2/api/Buscador/List/" + value, dataType: 'json',
        success: info => this.Search = info, complete: ()=> this.Draw(),
        beforeSend: () => {$("#buscador").empty().html(`<h1 class='text-center textMoradoMovistar mt-5'><i class='fas fa-spinner fa-spin'></i></h1>`);}
      })//,
      /*$.ajax({
        url: "../Aplicaciones2/api/PilasOld/Autocomplete/" + value, dataType: 'json',
        success: info => this.DrawOld(info)
      })*/
    );
  }
  Draw(): void {
    let left = "", right = "", active = "active", show = "show", cont = 0;   
    for(let search of this.Search){
      if(search.Items.length>0){
        right += this.DetailList(search, active, show, cont);
        left += `<a 
            class="nav-link ${active}" 
            id="v-pills-search-${cont}-tab" 
            data-toggle="pill" 
            data-target="#v-pills-search-${cont}"
            role="tab" 
            aria-controls="v-pills-search-${cont}" aria-selected="true">
            ${search.Type}</a>`;
        cont++;
        active = "";
        show = "";
      }
    }    
    let results = `
    <div class="d-flex align-items-start">
      <div class="nav flex-column col-2 nav-pills me-3 menu-search" id="v-pill-tab" role="tablist" aria-orientation="vertical">
       ${left}
      </div>
      <div class="tab-content col-10 content-search" id="v-pill-tabContent">
        ${right}
      </div>
    </div>
    `;
    $("#buscador").empty().html(results);
    $(".contenidos").slideUp();
  }
  private DetailList(searcher: ISearcherResponse, active: string, show: string, cont: number){
    let right = `<div class="tab-pane fade ${show} ${active}" id="v-pills-search-${cont}" role="tabpanel" aria-labelledby="v-pills-search-${cont}-tab">`;
    for(let item of searcher.Items){
      let class_type = (searcher.Type.indexOf('Pilas')>=0) ? "item-pilas-historico" : "btn-aside";
      let old = (searcher.Type.indexOf('ante')>=0) ? "1" : "0";
      right += `
      <div class="${class_type} item-search" data-id="${item.Id}" data-action="${this.FormatUrl(item.Url, false)}" data-old="${old}">
        <p><small class="text-muted">${this.FormatUrl(item.Url,true)}</small></p>
        <h6 class="textAzulMovistar">${item.Name}</h6>
        <p>${item.Description}</p>
      </div>
      `;
    }
    right += "</div>";
    return right;
  }
  private FormatUrl(Url: string, remove: boolean){
    let value = remove ? "" : "user=" + localStorage.getItem("user");
    return Url.replace("user=", value);
  }
  private CancelRequests(){
    for(let i in this.requests){ this.requests[i].abort(); }
  }
  private DrawOld(searcher: ISearcher[]){
    $(".loading-pilas").removeClass();
    let value: ISearcherResponse = {
      Type: "Pilas antes",
      Items: searcher
    };
    let right = this.DetailList(value,"","",31415);
    $(".content-search").append(right);
  }
}