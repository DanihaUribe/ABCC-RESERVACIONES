// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation/reservation.service';
import { HistoryService } from '../../services/history/history.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as bootstrap from 'bootstrap';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Asegúrate de marcarlo como standalone
  imports: [CommonModule, FormsModule, NavbarComponent ],  // Aquí importas CommonModule
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, OnDestroy {
  reservations: any[] = [];
  history: any[] = [];
  loading = true;
  errorMessage: string = '';
  private pollingInterval: any;
  username: string | null = null;
  
  constructor(
    private router: Router,
    private reservationService: ReservationService,
    private historyService: HistoryService,
  ) { }

  ngOnInit(): void {
    this.getReservations(); // Obtener las reservaciones inicialmente
    // Actualizar las reservaciones cada 10 segundos
    this.pollingInterval = setInterval(() => {
      this.getReservations();
    }, 10000); // 10000ms = 10 segundos
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }



 getHistoryByFolio(reservation: any) {
  const folio = reservation.folio;
  const token = localStorage.getItem('token');
  console.log(`Requesting URL: http://localhost:3000/api/change-history/${folio}`);
  
  this.loading = true;  // Iniciamos la carga

  if (token) {
    this.historyService.getReservationHistory(folio, token).subscribe({
      next: (data: any) => {
        this.history = data;  // Asignamos los datos de la respuesta de la API
        this.errorMessage = '';  // Limpiamos cualquier mensaje de error previo
        this.loading = false;  // Terminamos la carga
      },
      error: (err: any) => {
        console.error('Error al obtener el historial de la reservación', err);
        this.history = [];  // Limpiamos el historial en caso de error
        this.errorMessage = 'Hubo un problema al obtener el historial.';  // Mensaje de error
        this.loading = false;  // Terminamos la carga
      }
    });
  } else {
    this.loading = false;
    console.log('No token found');
    this.errorMessage = 'No se encontró un token válido.';  // Mensaje si no hay token
  }
}

openHistoryModal(reservation: any) {
  console.log('abrir');
  const folio = reservation.folio;
  const token = localStorage.getItem('token');

  if (token) {
    console.log('if');
    this.historyService.getReservationHistory(folio, token).subscribe({
      next: (data: any) => {
        // Si la API devuelve un error (código 400), mostramos el SweetAlert
        if (data && data.error) {
          console.log('if sweet alert');
          Swal.fire({
            icon: 'info',
            title: 'No se encontraron registros',
            text: data.error,  // Mostramos el error de la API
          });
        } else {
          console.log('data');
          this.history = data;

          // Mostrar el modal si no hay error
          const modalElement = document.getElementById('historyModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        }
      },
      error: (err) => {
        console.log('error');
        console.error('Error al obtener el historial', err.status);
        // Aquí puedes manejar otros tipos de errores si la respuesta no es un 400
        if (err.status === 404) {
          Swal.fire({
            icon: 'info',
            title: 'No se encontraron registros',
            text: 'No hay historial para este folio.',
          });
        } else {
          // Para otros errores puedes personalizar el mensaje
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener el historial.',
          });
        }
      }
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Token no encontrado',
      text: 'No se encontró un token válido.',
    });
  }
}


  getReservations() {
    const token = localStorage.getItem('token');
    if (token) {
      this.reservationService.getReservations(token).subscribe({
        next: (data: any) => {
          this.reservations = data; // Asignar los nuevos datos
          this.loading = false; // Detener carga si se obtuvo correctamente
        },
        error: (err: any) => {
          console.error('Error al obtener las reservaciones', err);
          this.loading = false; // Detener carga si hay error
        }
      });
    } else {
      this.loading = false;
      console.log('No token found');
    }
  }

  // Método para cambiar el estado de la reservación
  onStatusChange(reservation: any, newStatus: string) {
    const previousStatus = reservation.status;
    const folio = reservation.folio;
    const token = localStorage.getItem('token') || '';

    this.reservationService.updateReservationStatus(folio, newStatus, token).subscribe({
      next: () => {
        reservation.status = newStatus; // Actualiza localmente el estado

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Deshacer',
          cancelButtonText: 'Cerrar',
          timer: 4000,
          timerProgressBar: true,
          customClass: {
            popup: 'colored-toast'
          }
        });

        Toast.fire({
          icon: 'success',
          title: `${folio} ha cambiado a "${newStatus}"`
        }).then((result) => {
          if (result.isConfirmed) {
            // Si se hace "Deshacer", restaurar el estado anterior
            reservation.status = previousStatus;
            this.reservationService.updateReservationStatus(folio, previousStatus, token).subscribe({
              next: () => console.log(`Folio ${folio} restaurado a estado anterior: ${previousStatus}`),
              error: (err) => {
                console.error(`Error restaurando folio ${folio}:`, err);
                Swal.fire('Error', 'No se pudo restaurar el estado anterior.', 'error');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error(`Error actualizando folio ${folio}:`, err);
        Swal.fire('Error', 'No se pudo actualizar el estado en el servidor.', 'error');
      }
    });
  }



goToEdit(reservation: any) {
  this.router.navigate(['/edit-reservation'], {
    queryParams: {
      folio: reservation.folio
    }
  });
}
}
