import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.html',
})
export class Turnos implements OnInit {
  turnos: any[] = [];
  peliculas: any[] = []; 
  showModal = false;
  confirmModal = false;

  nuevoTurno: any = {
    peliculaId: null,
    sala: '',
    inicio: '',
    fin: '',
    precio: 0,
    idioma: 'DOB',
    formato: 'D2',
    aforo: 0,
  };

  editando = false;
  turnoSeleccionado: any = null;

  confirmMessage = '';
  accionConfirmada: (() => void) | null = null;

  backendError = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarPeliculas();
    this.cargarTurnos();
  }
getPeliculasActivasConTurnos(): any[] {
  return this.peliculas.filter(p => p.estado === 'ACTIVO');
}
  cargarPeliculas() {
    this.http
      .get<any[]>('http://localhost:3000/api/peliculas/all')
      .subscribe((res) => (this.peliculas = res));
  }

  cargarTurnos() {
    this.http.get<any[]>('http://localhost:3000/api/turnos').subscribe((res) => {
      this.turnos = res.map((t) => ({
        ...t,
        pelicula: this.peliculas.find((p) => p.id === t.peliculaId),
      }));
    });
  }

  abrirModal(turno?: any) {
    this.showModal = true;
    this.editando = !!turno;
    this.turnoSeleccionado = turno || null;

    this.nuevoTurno = turno
      ? { ...turno }
      : {
          peliculaId: null,
          sala: '',
          inicio: '',
          fin: '',
          precio: 0,
          idioma: 'DOB',
          formato: 'D2',
          aforo: 0,
        };
  }

  cerrarModal() {
    this.showModal = false;
    this.editando = false;
    this.turnoSeleccionado = null;
    this.backendError = '';
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

  guardar() {
    if (!this.nuevoTurno.peliculaId) {
      this.backendError = 'Seleccione una película';
      return;
    }
    if (!this.nuevoTurno.sala) {
      this.backendError = 'Ingrese la sala';
      return;
    }
    if (!this.nuevoTurno.inicio || !this.nuevoTurno.fin) {
      this.backendError = 'Fechas requeridas';
      return;
    }

    const data = {
      ...this.nuevoTurno,
      inicio: new Date(this.nuevoTurno.inicio).toISOString(),
      fin: new Date(this.nuevoTurno.fin).toISOString(),
    };

    if (this.editando) {
      this.abrirConfirmacion('¿Guardar cambios en este turno?', () => {
        this.http
          .put(`http://localhost:3000/api/turnos/${this.turnoSeleccionado.id}`, data)
          .subscribe({
            next: () => {
              this.cargarTurnos();
              this.cerrarModal();
            },
            error: (err) => (this.backendError = err.error.message || 'Error al guardar'),
          });
      });
    } else {
      this.http.post('http://localhost:3000/api/turnos', data).subscribe({
        next: () => {
          this.cargarTurnos();
          this.cerrarModal();
        },
        error: (err) => (this.backendError = err.error.message || 'Error al guardar'),
      });
    }
  }
getPeliculasConTurnos(): any[] {
  return this.getPeliculasActivasConTurnos();
}

  getTurnosPorPelicula(peliculaId: any): any[] {
    return this.turnos.filter((turno) => turno.peliculaId === peliculaId);
  }
  eliminar(id: number) {
    this.abrirConfirmacion('⚠️ ¿Seguro que deseas eliminar este turno?', () => {
      this.http
        .delete(`http://localhost:3000/api/turnos/${id}`)
        .subscribe(() => this.cargarTurnos());
    });
  }
}
