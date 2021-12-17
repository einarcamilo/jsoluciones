$(document).on('focus',".fecha", function()  {
    PickerDate($(this));
  }
);
function PickerDate(element){
  let max = $(element).data('max');
  let min = $(element).data('min');
  min = (typeof min != "undefined") ? '0' : '-1y';
  max = (typeof max != "undefined") ? '0' : '+1y';
  $(element).datepicker({
    changeMonth: true,
    changeYear: true,
    minDate: min,
    maxDate: max,
    dateFormat: "yy-mm-dd",
    onSelect: function (date){
      if($(element).hasClass("fill-other")){
        let target = $(element).data('target');
        $("."+target).text(date);
      }
      if($(element).hasClass("mandatory")){ValidatePicker(element);}
    }
  });
}
function ValidatePicker(input){
  if($(input).val().length<=0){
    $(input).addClass("is-invalid");
  }
  else{
    $(input).removeClass("is-invalid");
  }
}