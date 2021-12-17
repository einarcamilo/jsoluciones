export class Utilities {
    DateFromJson(date) {
        let re = /-?\d+/;
        let m = re.exec(date) || [];
        return this.FormatDate(parseInt(m[0]));
    }
    FormatDate(date) {
        let d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        return [year, month, day].join('-');
    }
    ActualDate() {
        let fecha = new Date();
        let anno = fecha.getFullYear();
        let mes = '' + fecha.getMonth() + 1;
        let dia = '' + fecha.getDate();
        mes = (mes.length < 2) ? ("0" + mes) : mes;
        dia = (dia.length < 2) ? ("0" + dia) : dia;
        let fechaFinal = anno + "-" + mes + "-" + dia;
        return fechaFinal;
    }
    OrderImg(container) {
        $("." + container).find('img').each(function () {
            $(this).removeAttr("width height").addClass("img-fluid");
            let src = $(this).attr("src");
            if (src != undefined) {
                if (src.indexOf("libs/imagePilas/") == 0)
                    $(this).attr({ src: "http://iagregado/intranetva/datagrid/dbgrid/pilas_online/" + src });
            }
        });
    }
}
