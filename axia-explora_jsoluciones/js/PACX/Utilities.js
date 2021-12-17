export class Utilities {
    constructor() {
        this.APIASP = "/service/";
        this.API = "/Aplicaciones1/api/";
    }
    ValidateMandatory() {
        let mandatory = document.getElementsByClassName("mandatory");
        let numbers = document.getElementsByClassName("numbers-only");
        Array.from(mandatory).forEach(m => {
            let type = m;
            if (type.classList.contains("mail")) {
                m.addEventListener("keyup", () => this.ValidateMail(type));
            }
            if (type.type === "checkbox") {
                m.addEventListener("change", () => this.ValidateCheck(type));
            }
            else {
                m.addEventListener("blur", () => this.Validate(m));
            }
        });
        Array.from(numbers).forEach(n => n.addEventListener("keyup", () => this.NumbersOnly(n)));
    }
    ValidateForm(e) {
        e.preventDefault();
        let form = e.target;
        let elements = form.getElementsByClassName("mandatory");
        let flag = 0;
        Array.from(elements).forEach(e => { if (!this.Validate(e)) {flag++;} });
        return flag <= 0;
    }
    Validate(m) {
        const tag = m.tagName;
        const type = m;
        let flag = true;
        if (tag === "SELECT") {
            flag = this.ValidateSelect(m);
        }
        else if (type.type === "checkbox") {
            flag = this.ValidateCheck(type);
        }
        else if (tag === "INPUT" || tag === "TEXTAREA") {
            flag = this.ValidateInput(m);
        }
        return flag;
    }
    ValidateSelect(select) {
        if (select.value.length <= 0) {
            select.classList.add("is-invalid");
            return false;
        }
        else {
            select.classList.remove("is-invalid");
            return true;
        }
    }
    ValidateInput(input) {
        let check = false;
        if (input.value.length <= 0) {
            input.classList.add("is-invalid");
        }
        else if (input.classList.contains("numbers-only") && isNaN(Number(input.value))) {
            input.classList.add("is-invalid");
        }
        else if (input.classList.contains("mail")) {
            check = this.ValidateMail(input);
        }
        else {
            input.classList.remove("is-invalid");
            check = true;
        }
        return check;
    }
    NumbersOnly(input) {
        let num = Number(input.value.replace(/\./g, ''));
        if (!isNaN(num)) {
            let format = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1');
            format = format.split('').reverse().join('').replace(/^[\.]/, '');
            input.value = format;
        }
        else {
            input.value = input.value.replace(/[^\d\.]*/g, '');
        }
    }
    NumbersOnlyValidate(input) {
        let num = Number(input.value.replace(/\./g, ''));
        if (!isNaN(num)) {
            let format = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1');
            format = format.split('').reverse().join('').replace(/^[\.]/, '');
            return Number(format);
        }
        else {
            return Number(input.value.replace(/[^\d\.]*/g, ''));
        }
    }
    ValidateCheck(input) {
        let flag = false;
        let name = input.name;
        let checksInputs = document.getElementsByName(name);
        let cant = 0;
        let div = input.closest("div.row");
        checksInputs.forEach(c => { if (c.checked) {cant++; }});

        if (cant > 0) {
            div.classList.remove("border", "border-danger", "rounded");
            flag = true;
        }
        else {
            div.classList.add("border", "border-danger", "rounded");
        }
        return flag;
    }
    ValidateMail(input) {
        let flag = false;
        const validator = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (validator.test(String(input.value).toLowerCase())) {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
            flag = true;
        }
        else {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
        }
        return flag;
    }
}
