export class Home{
  private main: HTMLElement;
  constructor(_main: HTMLElement){ this.main = _main; }
  Initial(){
    this.main.innerHTML = `
    <section class="container-fluid mt-3">
      <div class="jumbotron">
        <h1 class="display-4">¡Bienvenida, bienvenido, bienvenide!</h1>
        <p class="lead">Aplicativo de planes de acción</p>
        <hr class="my-4">
        <p>Seleccione una opción en el menu principal para inicial.</p>
      </div>
    </section>
    `;
  }
}