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
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
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
    this.getReservations();
    // Actualizar las reservaciones cada 10 segundos
    this.pollingInterval = setInterval(() => {
      this.getReservations();
    }, 10000);
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
    this.loading = true;

    if (token) {
      this.historyService.getReservationHistory(folio, token).subscribe({
        next: (data: any) => {
          this.history = data;
          this.errorMessage = '';
          this.loading = false;
        },
        error: (err: any) => {
          this.history = [];  // Limpiamos el historial en caso de error
          this.errorMessage = 'Hubo un problema al obtener el historial.';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.errorMessage = 'No se encontró un token válido.';
    }
  }

  openHistoryModal(reservation: any) {
    const folio = reservation.folio;
    const token = localStorage.getItem('token');

    if (token) {
      this.historyService.getReservationHistory(folio, token).subscribe({
        next: (data: any) => {
          if (data && data.error) {
            Swal.fire({
              icon: 'info',
              title: 'No se encontraron registros',
              text: data.error,
            });
          } else {
            this.history = data;
            const modalElement = document.getElementById('historyModal');
            if (modalElement) {
              const modal = new bootstrap.Modal(modalElement);
              modal.show();
            }
          }
        },
        error: (err) => {
          if (err.status === 404) {
            Swal.fire({
              icon: 'info',
              title: 'No se encontraron registros',
              text: 'No hay historial para este folio.',
            });
          } else {
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
          this.loading = false;
        },
        error: (err: any) => {
          //hubo error al obtener las reservaciones
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      //No encontró un token válido
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
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: `Folio ${folio} restaurado`,
                  text: `Estado anterior: ${previousStatus}`,
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true
                });
              },
              error: () => {
                Swal.fire('Error', 'No se pudo restaurar el estado anterior.', 'error');
              }
            });
          }
        });
      },
      error: (err) => {
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

  formatTo12Hour(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minuteStr} ${ampm}`;
  }

  pageSize = 7;
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.reservations.length / this.pageSize);
  }

  totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  paginatedReservations(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reservations.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }


}
