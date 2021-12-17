export class Error404{
  private main: HTMLElement;
  constructor(_main: HTMLElement){ this.main = _main; this.Initial();}
  Initial(){
    this.main.innerHTML = `
    <section class="container-fluid mt-3">
      <div class="jumbotron bgMoradoMovistar">
        <h1 class="display-4">¡Error 404!</h1>
        <p class="lead">La página que estás buscando no existe, por favor intente nuevamente con una de las opciones del menú</p>
      </div>
    </section>
    `;
  }
}