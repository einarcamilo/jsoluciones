import { Utilities } from "./Utilities.js";
export class Statistic {
    constructor() {
        this.StatisticsPilas = new Array();
        this.Util = new Utilities();
    }
    Get() {
        let user = localStorage.getItem("user");
        this.GetPilas(user);
    }
    GetPilas(user) {
        $.ajax({
            url: '../Aplicaciones2/api/Estadistica/Pilas/' + user, dataType: 'json',
            success: info => this.StatisticsPilas = info, complete: () => this.Draw(),
            beforeSend: () => { $(".main-pilas").empty().html(`<h1 class='text-center textMoradoMovistar mt-5'><i class='fas fa-spinner fa-spin'></i></h1>`); }
        });
    }
    Draw() {
        let pestannas = `
    <ul class="nav nav-tabs mt-3" id="tabStatics" role="tablist">
      <li class="nav-item" role="presentation">
        <a class="nav-link active" id="mine-tab" data-toggle="tab" href="#mine" role="tab" aria-controls="mine" aria-selected="true">Mi gestión</a>
      </li>
      <li class="nav-item" role="presentation">
        <a class="nav-link" id="group-tab" data-toggle="tab" href="#group" role="tab" aria-controls="group" aria-selected="false">Mi grupo</a>
      </li>
      <li class="nav-item" role="presentation">
        <a class="nav-link" id="segment-tab" data-toggle="tab" href="#segment" role="tab" aria-controls="segment" aria-selected="false">Mi segmento</a>
      </li>
      <li class="nav-item" role="presentation">
        <a class="nav-link" id="ally-tab" data-toggle="tab" href="#ally" role="tab" aria-controls="ally" aria-selected="false">Mi aliado</a>
      </li>
    </ul>
    `;
        let content = `
    <div class="tab-content" id="tabContentStatics">
      ${this.DrawPilasMine()}
    </div>
    `;
        $(".main-pilas").empty().html(`${pestannas}${content}`);
    }
    DrawPilasMine() {
        let actualDate = this.Util.ActualDate();
        let week = 0, month = 0, day = 0, dOnTime = 0, dOffTime = 0, dUnread = 0, wOnTime = 0, wOffTime = 0, wUnread = 0, mOnTime = 0, mOffTime = 0, mUnread = 0;
        for (let pilas of this.StatisticsPilas) {
            for (let statistic of pilas.Statistics) {
                month++;
                mOffTime += statistic.Details.filter(d => d.Type == "mine")[0].OffTime;
                mOnTime += statistic.Details.filter(d => d.Type == "mine")[0].OnTime;
                mUnread += statistic.Details.filter(d => d.Type == "mine")[0].Unread;
                if (pilas.ActualWeek == pilas.Week) {
                    wOffTime += statistic.Details.filter(d => d.Type == "mine")[0].OffTime;
                    wOnTime += statistic.Details.filter(d => d.Type == "mine")[0].OnTime;
                    wUnread += statistic.Details.filter(d => d.Type == "mine")[0].Unread;
                    week++;
                }
                if (pilas.Day.toString().replace("T00:00:00", "") == actualDate) {
                    dOffTime += statistic.Details.filter(d => d.Type == "mine")[0].OffTime;
                    dOnTime += statistic.Details.filter(d => d.Type == "mine")[0].OnTime;
                    dUnread += statistic.Details.filter(d => d.Type == "mine")[0].Unread;
                    day++;
                }
            }
        }
        let html = `<div class="tab-pane fade show active container" id="mine" role="tabpanel" aria-labelledby="mine-tab">
      <div class="row">
        <div class="col-4">
          Q Día ${day}<br>
          Q Ontime ${dOnTime}<br>
          Q Offtime ${dOffTime}<br>
          Q Unread ${dUnread}<br>
        
        </div>
        <div class="col-4">
          Q Semana ${week}<br>
          Q Ontime ${wOnTime}<br>
          Q Offtime ${wOffTime}<br>
          Q Unread ${wUnread}<br>
        </div>
        <div class="col-4">
          Q Mes ${month}<br>
          Q Ontime ${mOnTime}<br>
          Q Offtime ${mOffTime}<br>
          Q Unread ${mUnread}<br>
        </div>
      <div>
    </div>`;
        return html;
    }
    //DrawPilasGroup() { }
    //DrawPilasSegment() { }
    //DrawPilasAlly() { }
}
