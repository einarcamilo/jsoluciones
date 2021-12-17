const ActualDate = () => {
    let fecha = new Date();
    let anno = fecha.getFullYear();
    let month = fecha.getMonth() + 1;
    let mes = '' + month;
    let dia = '' + fecha.getDate();
    mes = (mes.length < 2) ? ("0" + mes) : mes;
    dia = (dia.length < 2) ? ("0" + dia) : dia;
    let fechaFinal = anno + "-" + mes + "-" + dia;
    return fechaFinal;
};
const UpdateOthers = (e) => {
    let element = e.target;
    let target = element.dataset.target;
    let value = element.value;
    let _class = document.getElementsByClassName(target);
    Array.from(_class).forEach(c => c.textContent = value);
};
const DateFromJson = (date) => {
    let re = /-?\d+/;
    let m = re.exec(date) || [];
    return FormatDate(parseInt(m[0]));
};
const FormatDate = (date) => {
    let d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [year, month, day].join('-');
};
const SerializeData = (form) => {
    let several = new Array();
    let obj = {};
    const data = new FormData(form);
    for (let i of data) {
        let element = document.getElementsByName(i[0])[0];
        let tag = element.type;
        if (tag === "checkbox") {
            several.push(i[0]);
        }
    }
    for (let i of data) {
        if (several.indexOf(i[0]) >= 0) {
            if (typeof obj[i[0]] === "undefined") {
                obj[i[0]] = new Array();
            }
            obj[i[0]].push(i[1]);
        }
        else {
            obj[i[0]] = i[1];
        }
    }
    obj["created_by"] = localStorage.getItem("User");
    return obj;
};
const slideUp = (target, duration = 500) => {
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    //target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = "0";
    target.style.paddingTop = "0";
    target.style.paddingBottom = "0";
    target.style.marginTop = "0";
    target.style.marginBottom = "0";
    window.setTimeout(() => {
        target.style.display = 'none';
        target.style.removeProperty('height');
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
    }, duration);
};
const slideDown = (target, duration = 500) => {
    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;
    if (display === 'none')
        display = 'block';
    target.style.display = display;
    let height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = "0";
    target.style.paddingTop = "0";
    target.style.paddingBottom = "0";
    target.style.marginTop = "0";
    target.style.marginBottom = "0";
    //target.offsetHeight;
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout(() => {
        target.style.removeProperty('height');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
    }, duration);
};
const SlideToggle = (target, duration = 500) => {
    if (window.getComputedStyle(target).display === 'none') {
        return slideDown(target, duration);
    }
    else {
        return slideUp(target, duration);
    }
};
const CompareDate = (date, actual) => {
    let date_only = date.slice(0, 10);
    let actual_only = actual.slice(0, 10);
    let date_array = date_only.split('-');
    let actual_array = actual_only.split('-');
    let dateDate = new Date(Number(date_array[0]), (Number(date_array[1]) - 1), Number(date_array[2]));
    let actualDate = new Date(Number(actual_array[0]), (Number(actual_array[1]) - 1), Number(actual_array[2]));
    return dateDate > actualDate ? 1 : dateDate >= actualDate ? 0 : -1;
};
const ValidateNumber = (value) => {
    let num = Number(value);
    if (!isNaN(num)) {
        let format = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1');
        format = format.split('').reverse().join('').replace(/^[\.]/, '');
        return Number(format);
    }
    else {
        return Number(value.replace(/[^\d\.]*/g, ''));
    }
};
const ValidateText = (value) => {
    const reg = new RegExp(/[^a-z0-9]/gi);
    let valid = value.replace(reg, "");
    return isNaN(valid) ? valid : "";
};
export { ActualDate, UpdateOthers, DateFromJson, SerializeData, SlideToggle, slideUp, slideDown, CompareDate, ValidateNumber, ValidateText };
