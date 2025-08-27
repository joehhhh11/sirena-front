import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './peliculas.html',
})
export class Peliculas implements OnInit {
  peliculas: any[] = [];
  showModal = false;
  confirmModal = false;
  showTurnoModal = false;
  Math = Math;
  nuevaPelicula: any = {};
  nuevoTurno: any = {};
  peliculaSeleccionada: any = null;
  turnosPelicula: any[] = [];

  backendError = '';
  backendErrorTurno = '';
  editando = false;

  confirmMessage = '';
  accionConfirmada: (() => void) | null = null;

  search = '';
  filtroGenero = '';
  filtroEstado = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  page = 1;
  pageSize = 5;
  totalPeliculas = 0;
  totalPaginas = 0;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarPeliculas();
  }

  cargarPeliculas() {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());

    if (this.search) params = params.set('search', this.search);
    if (this.filtroGenero) params = params.set('genero', this.filtroGenero);
    if (this.filtroEstado) params = params.set('estado', this.filtroEstado);
    if (this.filtroFechaDesde) params = params.set('fechaDesde', this.filtroFechaDesde);
    if (this.filtroFechaHasta) params = params.set('fechaHasta', this.filtroFechaHasta);

    this.http.get<any>('http://localhost:3000/api/peliculas', { params }).subscribe((res) => {
      this.peliculas = res.items;
      this.totalPeliculas = res.total;
      this.totalPaginas = Math.ceil(this.totalPeliculas / this.pageSize);
    });
  }

  aplicarFiltros() {
    this.page = 1;
    this.cargarPeliculas();
  }

  cambiarPagina(delta: number) {
    const totalPages = Math.ceil(this.totalPeliculas / this.pageSize);
    this.page = Math.min(Math.max(this.page + delta, 1), totalPages);
    this.cargarPeliculas();
  }

  abrirModal(pelicula?: any) {
    this.showModal = true;
    this.editando = !!pelicula;
    this.peliculaSeleccionada = pelicula || null;

    this.nuevaPelicula = pelicula
      ? { ...pelicula, genero: pelicula.genero.join(',') }
      : {
          titulo: '',
          sinopsis: '',
          duracionMin: 0,
          clasificacion: '',
          genero: '',
          fechaEstreno: '',
        };
  }

  cerrarModal() {
    this.showModal = false;
    this.editando = false;
    this.peliculaSeleccionada = null;
    this.backendError = '';
  }

  guardar() {
    if (!this.nuevaPelicula.titulo.trim()) {
      this.backendError = 'El título es obligatorio.';
      return;
    }
    if (this.nuevaPelicula.duracionMin <= 0) {
      this.backendError = 'La duración debe ser mayor a 0.';
      return;
    }

    const data = {
      ...this.nuevaPelicula,
      genero: this.nuevaPelicula.genero.split(',').map((g: string) => g.trim()),
    };

    const request = this.editando
      ? this.http.put(`http://localhost:3000/api/peliculas/${this.peliculaSeleccionada.id}`, data)
      : this.http.post('http://localhost:3000/api/peliculas', data);

    request.subscribe({
      next: () => {
        this.cargarPeliculas();
        this.cerrarModal();
      },
      error: (err) => (this.backendError = err.error.message || 'Error al guardar'),
    });
  }

  eliminar(id: number) {
    this.abrirConfirmacion('⚠️ ¿Seguro que deseas eliminar esta película?', () => {
      this.http
        .delete(`http://localhost:3000/api/peliculas/${id}`)
        .subscribe(() => this.cargarPeliculas());
    });
  }

 
  asignarTurno(pelicula: any) {
    this.showTurnoModal = true;
    this.peliculaSeleccionada = pelicula;
    this.nuevoTurno = {
      peliculaId: pelicula.id,
      sala: '',
      inicio: '',
      fin: '',
      precio: 0,
      idioma: 'DOB',
      formato: 'D2',
      aforo: 0,
    };
    this.cargarTurnosDePelicula(pelicula.id);
  }

  cerrarTurnoModal() {
    this.showTurnoModal = false;
    this.nuevoTurno = {};
    this.turnosPelicula = [];
    this.backendErrorTurno = '';
  }

  cargarTurnosDePelicula(peliculaId: number) {
    this.http
      .get<any[]>(`http://localhost:3000/api/turnos?peliculaId=${peliculaId}`)
      .subscribe((res) => (this.turnosPelicula = res));
  }

  guardarTurno() {
    if (!this.nuevoTurno.sala || !this.nuevoTurno.inicio || !this.nuevoTurno.fin) {
      this.backendErrorTurno = 'Todos los campos son obligatorios';
      return;
    }

    const inicioISO = new Date(this.nuevoTurno.inicio).toISOString();
    const finISO = new Date(this.nuevoTurno.fin).toISOString();

    const solape = this.turnosPelicula.some(
      (t) =>
        t.sala === this.nuevoTurno.sala &&
        new Date(inicioISO) < new Date(t.fin) &&
        new Date(finISO) > new Date(t.inicio)
    );

    if (solape) {
      this.backendErrorTurno = 'El turno se solapa con otro existente';
      return;
    }

    const data = { ...this.nuevoTurno, inicio: inicioISO, fin: finISO };

    this.http.post('http://localhost:3000/api/turnos', data).subscribe({
      next: () => {
        this.cargarTurnosDePelicula(this.peliculaSeleccionada.id);
        this.nuevoTurno = {};
        this.backendErrorTurno = '';
      },
      error: (err) => (this.backendErrorTurno = err.error.message || 'Error al crear turno'),
    });
  }

  editarTurno(turno: any) {
    this.nuevoTurno = { ...turno };
  }

  eliminarTurno(id: number) {
    if (confirm('⚠️ ¿Seguro que deseas eliminar este turno?')) {
      this.http
        .delete(`http://localhost:3000/api/turnos/${id}`)
        .subscribe(() => this.cargarTurnosDePelicula(this.peliculaSeleccionada.id));
    }
  }

  esSolapado(turno: any): boolean {
    if (
      !this.nuevoTurno ||
      !this.nuevoTurno.sala ||
      !this.nuevoTurno.inicio ||
      !this.nuevoTurno.fin
    ) {
      return false;
    }
    const inicioNuevo = new Date(this.nuevoTurno.inicio).getTime();
    const finNuevo = new Date(this.nuevoTurno.fin).getTime();
    const inicioExistente = new Date(turno.inicio).getTime();
    const finExistente = new Date(turno.fin).getTime();

    return (
      this.nuevoTurno.sala === turno.sala &&
      inicioNuevo < finExistente &&
      finNuevo > inicioExistente
    );
  }

  abrirConfirmacion(mensaje: string, accion: () => void) {
    this.confirmMessage = mensaje;
    this.accionConfirmada = accion;
    this.confirmModal = true;
  }

  confirmar() {
    if (this.accionConfirmada) this.accionConfirmada();
    this.cerrarConfirmacion();
  }

  cerrarConfirmacion() {
    this.confirmModal = false;
    this.accionConfirmada = null;
  }
}
