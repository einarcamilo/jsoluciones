export interface User{
  centro: string;
  macrosegmento: string;
  negocio: string;
  nombre: string;
  segmento: string;
  type: string;
  usuario: string;
}
export class Users{
  public user: User;
  constructor(){ 
    this.user = {
      usuario: "",
      centro:"",
      macrosegmento:"",
      negocio:"",
      nombre:"",
      segmento:"",
      type:""
    };
    this.Get();
  }
  Get(){
    let self = this;
    $.ajax({
      url: '../service/mig/usuario.asp', dataType: 'json', cache: false, async: false,
      beforeSend: () => { localStorage.clear(); },
      success: (info) => { self.user = info; }, complete:() => {
        let nombre = String(self.user.nombre).split(" ");
        $('#UserName').html("¡Hola " + nombre[0] + "!");
        localStorage.setItem("user", self.user.usuario);
      }
    });
  }
}