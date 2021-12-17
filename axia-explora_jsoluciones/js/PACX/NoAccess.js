export class NoAccess {
    constructor(_main) { this.main = _main; this.Initial(); }
    Initial() {
        this.main.innerHTML = `
    <section class="container-fluid mt-3">
      <div class="jumbotron bgMoradoMovistar">
        <h1 class="display-4">¡Sin permisos!</h1>
        <p class="lead">No posee permisos para consultar la página. Comuníquese con el administrador.</p>
      </div>
    </section>
    `;
    }
}
