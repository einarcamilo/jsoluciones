export interface AnswerDTO{
  Id: number;
  Name: string;
  Correct: boolean;
  Question_id: number;
}
export interface QuestionDTO{
  Id: number
  Name: string;
  Approved: number
  Pilas_id: number
}
export interface QuestionForm{
  Question: QuestionDTO;
  Answers: AnswerDTO[];
}
export interface ReadRequest{
  Id: number;
  User: string|null;
  Question: QuestionForm;
}
export class Evaluation{
  
  SendAnswer(idPilas: number){
    let self = this;
    let idQ = $('.btn-send-answer').data("id");
    let json = this.SetData(idQ, idPilas);
    let response = 0;
    $.ajax({
      type: "post",
      url: "../Aplicaciones2/api/PilasExplora/Lectura",
      dataType: "json", async: false,
      data: JSON.stringify(json),
      contentType: "application/json; charset=utf-8",
      beforeSend: ()=>{ $("#question").empty().html("<h1 class='text-center textMoradoMovistar mt-5'><i class='fas fa-spinner fa-spin'></i></h1>"); },
      success: function (data) {
        response = data.Status;
        if(data.Status == 0){
          self.DrawNewQuestion(data.Question);
        }
        else{
          self.DrawResponse();
        }
      }
    });
    return response;
  }
  DrawQuestion(question: QuestionForm, id: number){
    let htm = "<div class='text-primary f18'><b>Evaluación del elemento actual</b></div>";
    htm += "<div class='mb-1'><b>" + question.Question.Name + "</b></div>";
    for(let ans of question.Answers){
      htm += "<div><input type='radio' data-id='" + ans.Id + "' name='answers' id='ans" + ans.Id + "'> <label for='ans" + ans.Id + "'>" + ans.Name + "</label></div>";
    }
    htm += "<div><button class='btn btn-success btn-sm btn-send-answer' data-id_pilas='" + id + "' data-id='" + question.Question.Id + "'><i class='fa fa-paper-plane'></i> Enviar respuesta</button></div>";
    $('#question').html(htm);
  }
  DrawResponse(){
    $('#question').empty();
    let htm = "<div class='alert alert-success'><i class='fa fa-check'></i> Has finalizado la lectura para este elemento de manera correcta</div>";
    $('#question').html(htm);
  }
  private SetData(idQ: number, idPilas: number): ReadRequest{
    let idA;
    let json: ReadRequest =  {
      Id: idPilas,
      User: localStorage.getItem("user"),
      Question:{
        Question: {
          Id: idQ,
          Name: $('.btn-send-answer').closest("#question").find(".mb-1 > b").text(),
          Approved: 0,
          Pilas_id: idPilas
        },
        Answers:[]
      }
    }
    $("input[name|='answers']").each(function(){
      let $this = $(this);
      let correct = false;
      idA = $this.data("id");
      let name = $this.siblings("label").text();
      if($this.is(":checked")){
        correct = true;
      }
      let answer: AnswerDTO = { Id: idA, Name: name, Correct: correct, Question_id:0 };
      json.Question.Answers = [...json.Question.Answers, answer];
    });
    return json;
  }
  private DrawNewQuestion(question: QuestionForm | any){
    $('#question').empty();
    let htm = "<div class='alert alert-danger mt-2'><i class='fa fa-hand-paper'></i> La pregunta anterior no fue contestada correctamente. ";
    htm += "Por favor intenta nuevamente.</div>";
    htm += "<div class='text-primary f18'><b>Evaluación del elemento actual</b></div>";
    htm += "<div class='mb-1'><b>" + question.Question.Name + "</b></div>";
    for(let ans of question.Answers){
      htm += "<div><input type='radio' data-id='" + ans.Id + "' name='answers' id='ans" + ans.Id + "'> <label for='ans" + ans.Id + "'>" + ans.Name + "</label></div>";
    }
    htm += "<div><button class='btn btn-success btn-sm btn-send-answer' data-id_pilas='" + question.Question.Pilas_id + "' data-id='" + question.Question.Id + "'><i class='fa fa-paper-plane'></i> Enviar respuesta</button></div>";
    $('#question').html(htm);
  }
}