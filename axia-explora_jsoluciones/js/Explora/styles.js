let StatisticsPilas = [] , StatisticsError = [];
let StatisticsEvaluation;
let HTMLStatistics = `<ul class="nav nav-tabs" id="tabStatics" role="tablist">
<li class="nav-item" role="presentation">
  <a class="nav-link active" id="statistics-pilas-tab" data-toggle="tab" href="#statistics-pilas" role="tab" aria-controls="statistics-pilas" aria-selected="true">
    <i class="fas fa-spinner fa-spin delete-statistic-pilas"></i>&nbsp;Pilas
  </a>
</li>
<li class="nav-item" role="presentation">
  <a class="nav-link" id="statistics-ec-tab" data-toggle="tab" href="#statistics-ec" role="tab" aria-controls="statistics-ec" aria-selected="false">
    <i class="fas fa-spinner fa-spin delete-statistic-ec"></i>&nbsp;Error crítico
  </a>
</li>
</ul>
<div class="tab-content" id="tabContentStaticsFull">
  <div class="tab-pane pt-3 pb-3 fade show active container border border-top-0 rounded-bottom" id="statistics-pilas" role="tabpanel" aria-labelledby="statistics-pilas-tab"></div>
  <div class="tab-pane pt-3 pb-3 fade container border border-top-0 rounded-bottom" id="statistics-ec" role="tabpanel" aria-labelledby="statistics-ec-tab"></div>
</div>`;
$(document).on('ready', ()=>{
  $(document).on("click", '.btn-stats', function(){ 
    let user = localStorage.getItem("user");
    Get(user);
    $(".main-details, .main-buscador,.main-historico, .main-menu").empty().hide();
  });
  $(document).on('focus',"#dateStatistics", function(){
    $("#dateStatistics").datepicker({
      changeMonth: true, changeYear: true, dateFormat: "yy-mm-dd", minDate: '2021-04-01',
      onSelect: function(){
        $(".detail-statistics").empty().html(HTMLStatistics);
        let user = localStorage.getItem("user");
        DrawAll(user);
      }
    });
  });
});
function Get(user){
  $(".main-pilas").empty().html(`
  <div class="col-2 offset-10 mt-3">
    <div class="input-group mb-3">
      <input type="text" class="form-control" readonly="readonly" id="dateStatistics" value="${ActualDate()}">
      <div class="input-group-append">
        <span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-day"></i></span>
      </div>
    </div>
  </div>
  <div class="detail-statistics">${HTMLStatistics}</div>
  `).show();
  DrawAll(user);
}
function DrawAll(user){
  GetPilas(user);
  GetEvaluation(user);
  GetError(user);
}
function GetPilas(user){
  DrawTabsPilas();
  let date = $("#dateStatistics").val();
  $.ajax({
    url: '../Aplicaciones2/api/Estadistica/Pilas/?id=' + user + '&date=' + date, dataType: 'json',
    success: info => StatisticsPilas = info, complete: () => DrawPilasFull()
  });
}
function GetEvaluation(user){
  let date = $("#dateStatistics").val();
  $.ajax({
    url: '../Aplicaciones2/api/Estadistica/Evaluacion/?id=' + user + '&date=' + date, dataType: 'json',
    success: info => StatisticsEvaluation = info, complete: () => DrawEvaluation()
  });
}
function GetError(user){
  let date = $("#dateStatistics").val();
  $.ajax({
    url: '../Aplicaciones2/api/Estadistica/ErrorCritico/?id=' + user + '&date=' + date, dataType: 'json',
    success: info => StatisticsError = info, complete: () => DrawError()
  });
}
function DrawTabsPilas(){
  let pestannas = `
  <ul class="nav nav-tabs mt-3" id="tabStaticsPilas" role="tablist">
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
      <a class="nav-link" id="macro-tab" data-toggle="tab" href="#macro" role="tab" aria-controls="macro" aria-selected="false">Mi aliado</a>
    </li>
  </ul>
  <div class="tab-content" id="tabContentStatics">
    <div class="tab-pane fade show active container border border-top-0 rounded-bottom" id="mine" role="tabpanel" aria-labelledby="mine-tab">
      <div class="row">
        <div class="col-4" id="mineDay"></div>
        <div class="col-4" id="mineWeek"></div>
        <div class="col-4" id="mineMonth"></div>
      </div>
    </div>
    <div class="tab-pane fade container border border-top-0 rounded-bottom" id="group" role="tabpanel" aria-labelledby="group-tab">
      <div class="row">
        <div class="col-4" id="groupDay"></div>
        <div class="col-4" id="groupWeek"></div>
        <div class="col-4" id="groupMonth"></div>
      </div>
    </div>
    <div class="tab-pane fade container border border-top-0 rounded-bottom" id="segment" role="tabpanel" aria-labelledby="segment-tab">
      <div class="row">
        <div class="col-4" id="segmentDay"></div>
        <div class="col-4" id="segmentWeek"></div>
        <div class="col-4" id="segmentMonth"></div>
      </div>
    </div>
    <div class="tab-pane fade container border border-top-0 rounded-bottom" id="macro" role="tabpanel" aria-labelledby="macro-tab">
      <div class="row">
        <div class="col-4" id="macroDay"></div>
        <div class="col-4" id="macroWeek"></div>
        <div class="col-4" id="macroMonth"></div>
      </div>
    </div>
  </div>
  <div id="detail-statistics-evaluation" class=" container mt-3"></div>
  `;
  $("#statistics-pilas").empty().html(pestannas);
}
function DrawPilasFull(){
  DrawPilasDetail("mine");
  DrawPilasDetail("group");
  DrawPilasDetail("segment");
  DrawPilasDetail("macro");
  $(".delete-statistic-pilas").remove();
}
function DrawPilasDetail(type){
  let actualDate = $("#dateStatistics").val();
  let week = 0, month = 0, day = 0,
    dOnTime = 0, dOffTime = 0, dUnread = 0,
    wOnTime = 0, wOffTime = 0, wUnread = 0,
    mOnTime = 0, mOffTime = 0, mUnread = 0;
  for(let pilas of StatisticsPilas){
    for(let statistic of pilas.Statistics){
      month++;
      mOffTime += statistic.Details.filter(d => d.Type == type)[0].OffTime;
      mOnTime += statistic.Details.filter(d => d.Type == type)[0].OnTime;
      mUnread += statistic.Details.filter(d => d.Type == type)[0].Unread;
      if(pilas.ActualWeek == pilas.Week){ 
        wOffTime += statistic.Details.filter(d => d.Type == type)[0].OffTime;
        wOnTime += statistic.Details.filter(d => d.Type == type)[0].OnTime;
        wUnread += statistic.Details.filter(d => d.Type == type)[0].Unread;
        week++; 
      }
      if(pilas.Day.toString().replace("T00:00:00","") == actualDate){ 
        dOffTime += statistic.Details.filter(d => d.Type == type)[0].OffTime;
        dOnTime += statistic.Details.filter(d => d.Type == type)[0].OnTime;
        dUnread += statistic.Details.filter(d => d.Type == type)[0].Unread;
        day++; 
      }
    }
  }
  PieVariableGraphicPilas( type + "Day","Día",[dOnTime, dOffTime, dUnread ]);
  PieVariableGraphicPilas( type + "Week","Semana",[wOnTime, wOffTime, wUnread ]);
  PieVariableGraphicPilas( type + "Month","Mes",[mOnTime, mOffTime, mUnread ]);
}
function DrawEvaluation(){
  let value = StatisticsEvaluation.Attempts === 0 ? 0 : Math.round((StatisticsEvaluation.Successful * 100) / StatisticsEvaluation.Attempts);
  $("#detail-statistics-evaluation").empty().html(`
    <h5>Resultado de tu última evaluación</h5>
    <div class="row">
      <div class="col-2">
        <section>
          <h6 class="mb-0"><small>Intentos</small></h6>
          <h1>${StatisticsEvaluation.Attempts}</h1>
        </section>
        <section>
          <h6 class="mb-0"><small>Correctos</small></h6>
          <h1>${StatisticsEvaluation.Successful}</h1>
        </section>
      </div>
      <div class="col-2" id="pie-evaluation"></div>
      <div class="col-2"><h1 class="textAzulMovistar" style="font-size: 5.5rem;">${value}%</h1></div>
    </div>
  `);
  PieGraphic("pie-evaluation", value,'Correcta','Incorrecta',['#63b331','#ddd']);
}
function DrawError(){
  let ecn = StatisticsError.filter(s => s.Type=="ecn");
  let ecuf = StatisticsError.filter(s => s.Type=="ecuf");
  let total = StatisticsError.filter(s => s.Type=="total");
  let monitoring = `<h4 class="textAzulMovistar">${total.length} Monitoreos</h4>`;
  for(let t of total){
    let iconECN = (ecn.filter(e => e.Evaluation == t.Evaluation).length>0)?'<i class="fas fa-store-slash"></i>&nbsp;':'';
    let iconECUF = (ecuf.filter(e => e.Evaluation == t.Evaluation).length>0)?'<i class="fas fa-user-slash"></i>&nbsp;':'';
    let all = iconECN + iconECUF;
    let color = (all.length<=0) ? "textVerdeMovistar" : "textFucsia" ;
    let iconColor = (all.length<=0) ? '<i class="fas fa-check-double"></i>&nbsp;' : '' ;
    monitoring += `
      <div class="detail-monitoring ${color}" data-id="${t.Evaluation}">
        ${t.Evaluation}&nbsp;${iconECN}${iconECUF}${iconColor}
      </div>`;
  }
  $("#statistics-ec").empty().html(`
  <div class="row">
    <div class="col-5" id="detail-ecuf"></div>
    <div class="col-5" id="detail-ecn"></div>
    <div class="col-2" style="min-height: 400px;">${monitoring}</div>
    <div class="col-12" id="consider"></div>
  </div>
  `);
  if(total.length>0){
    let value = Math.round((ecuf.length / total.length) * 100);
    PieGraphic('detail-ecuf', value, "ECUF", "Monitoreos", ['#e9426e','#63b331']);
    value = Math.round((ecn.length / total.length) * 100);
    PieGraphic('detail-ecn', value, "ECN", "Monitoreos", ['#e9426e','#63b331']);
  }
  $(".delete-statistic-ec").remove();
}
function ActualDate() {
  let fecha = new Date()
  let anno = fecha.getFullYear();
  let mes = fecha.getMonth() + 1;
  let dia = '' + fecha.getDate();
  mes = (mes < 10) ? ("0" + mes) : mes;
  dia = (dia.length < 2) ? ("0" + dia) : dia;
  let fechaFinal = anno + "-" + mes + "-" + dia;
  return fechaFinal;
}
function PieVariableGraphicPilas(container, title, values){
  Highcharts.chart(container, {
    chart:{type:'variablepie'},
    title:{text:title},
    colors: ['#63b331','#ed6939','#e9426e'],
    tooltip: {
      headerFormat: '',
      pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
          'Cantidad <b>{point.y}</b><br/>'
    },
    series:[{
      innerSize:'35%',
      zMin:0,
      data:[
        { name:'A tiempo', y:values[0], z:2 },
        { name:'Fuera de tiempo', y:values[1], z:1 },
        { name:'No leidos', y:values[2], z:0.8 }
      ]
    }]
  });
}
function PieGraphic(container, value, point1, point2, colors){
  let rest = 100 - value;
  Highcharts.chart(container,{
    chart:{type:'variablepie'},
    title:{text:''},
    colors: colors,
    tooltip: {
      pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    plotOptions: {
      pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
      }
    },
    series:[{
      innerSize:'0%',
      zMin:0,
      data:[
        {name:point1, y:value, z:1},
        {name:point2, y:rest, z:1},
      ]
    }]
  });
}