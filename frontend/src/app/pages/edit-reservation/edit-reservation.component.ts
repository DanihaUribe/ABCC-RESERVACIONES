import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue/venue.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './edit-reservation.component.html',
  styleUrl: './edit-reservation.component.scss'
})
export class EditReservationComponent implements OnInit {
  reservations: any[] = [];
  reservationsByDate: any[] = [];
  venues: any[] = [];
  selectedVenue: any;
  today: string = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  availableSlots: any[] = [];
  folioActual: string = '';
  reservationToEdit: any = null;
  loading: boolean = true;
  originalReservation: any = null;


  constructor(
    private route: ActivatedRoute,
    private venueService: VenueService,
    private reservationsService: ReservationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const folio = params.get('folio');
      if (!folio) {
        if (!folio) {
          Swal.fire({
            icon: 'error',
            title: 'Folio no proporcionado',
            text: 'No se especificó un folio en la URL.',
            confirmButtonText: 'Aceptar'
          });
          this.loading = false;
          return;
        }
        this.loading = false;
        return;
      }

      this.folioActual = folio;

      this.reservationsService.getByFolioReservations(folio).subscribe(
        (reservation: any) => {
          // Guardamos una copia original de la reserva
          this.reservationToEdit = reservation;
          this.originalReservation = { ...reservation }; // Copia profunda para comparación posterior

          this.today = this.formatDateForInput(reservation.reservation_date);

          this.venueService.getAllVenues().subscribe(
            (venues) => {
              this.venues = venues;
              this.selectedVenue = this.venues.find(v => v.venue_id === reservation.venue_id);
              this.loadReservations();
              this.loading = false;
            },
            (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Error al cargar lugares',
                text: 'No se pudieron obtener los lugares. Intenta nuevamente más tarde.',
                confirmButtonText: 'Aceptar'
              });
              this.loading = false;
            }
          );

        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error obtener la reserva por folio',
            text: 'No se pudo obtener la reserva. Intenta nuevamente más tarde.',
            confirmButtonText: 'Aceptar'
          });
          this.loading = false;
        }
      );
    });
  }
  formatDateForInput(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const paddedHrs = hrs.toString().padStart(2, '0');
    const paddedMins = mins.toString().padStart(2, '0');
    return `${paddedHrs}:${paddedMins}`;
  }

  loadReservations() {
    if (this.selectedVenue) {
      this.reservationsService.getByDateAndVenue(this.selectedVenue.venue_id, this.today).subscribe(
        (data) => {
          this.reservationsByDate = data;
          this.calculateAvailableSlots();
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error obtener la reserva',
            text: 'No se pudo obtener la reserva. Intenta nuevamente más tarde.',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    }
    this.validateTimeRange();
  }

  calculateAvailableSlots() {
    const startOfDay = 8 * 60;
    const endOfDay = 19 * 60;
    let previousEndTime = startOfDay;
    this.availableSlots = [];

    for (let reservation of this.reservationsByDate) {
      const reservationStartTime = this.timeToMinutes(reservation.start_time);
      const reservationEndTime = this.timeToMinutes(reservation.end_time);

      if (reservationStartTime > previousEndTime) {
        this.availableSlots.push({
          start: this.minutesToTime(previousEndTime),
          end: this.minutesToTime(reservationStartTime),
          status: 'Disponible'
        });
      }

      this.availableSlots.push({
        start: reservation.start_time,
        end: reservation.end_time,
        status: reservation.status,
        folio: reservation.folio
      });

      previousEndTime = reservationEndTime;
    }

    if (previousEndTime < endOfDay) {
      this.availableSlots.push({
        start: this.minutesToTime(previousEndTime),
        end: this.minutesToTime(endOfDay),
        status: 'Disponible'
      });
    }
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  }

  formatTo12Hour(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minuteStr} ${ampm}`;
  }

  timeInvalid: boolean = false;
  duration: number = 0;

  validateTimeRange() {
    const minTime = this.timeToMinutes('08:00');
    const maxTime = this.timeToMinutes('19:00');

    const start = this.timeToMinutes(this.reservationToEdit.start_time);
    const end = this.timeToMinutes(this.reservationToEdit.end_time);

    this.timeInvalid = start < minTime || end > maxTime || start >= end;
    this.duration = end - start;
  }

  cancelReservation(): void {
    Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'Esta acción cambiará el estado a "Cancelada".',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token') || '';
        const folio = this.reservationToEdit.folio;
        const status = 'Cancelada';

        // Llamar al servicio para cancelar la reserva
        this.reservationsService.updateReservationStatus(folio, status, token).subscribe({
          next: (response) => {
            this.reservationToEdit.status = 'Cancelada';
            Swal.fire('Cancelada', 'La reserva ha sido cancelada con éxito.', 'success')
              .then(() => {
                this.router.navigate(['/dashboard']);
              });
          },
          error: (error) => {
            if (error.status === 403) {
              Swal.fire('Acceso denegado', 'Solo los administradores pueden cancelar una reservación.', 'warning');
            } else {
              Swal.fire('Error', 'No se pudo cancelar la reserva.', 'error');
            }
          }
        });
      }
    });
  }

  saveReservationEdits() {
    const token = localStorage.getItem('token') || '';
    const folio = this.reservationToEdit.folio;
    const data = {
      start_time: this.reservationToEdit.start_time,
      end_time: this.reservationToEdit.end_time,
      reservation_date: this.today, // Aquí estás pasando la fecha seleccionada
      venue_id: this.selectedVenue.venue_id // Aquí pasas el lugar seleccionado

    };

    this.reservationsService.updateReservation(folio, data, token).subscribe({
      next: (res) => {
        // Mostrar alerta de éxito con SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Reserva actualizada con éxito',
          text: 'La reserva se ha actualizado correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          // Recargar la página para que se carguen los datos actualizados
          window.location.reload();
        });
      },
      error: (err) => {
        // Si el error es debido a la disponibilidad del espacio
        if (err?.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Espacio no disponible',
            text: 'El espacio no está disponible en ese horario. Intente con otro horario.',
            confirmButtonText: 'Cerrar'
          });
        } else if (err?.status === 400) {
          // Error de solicitud incorrecta, como horas incorrectas
          Swal.fire({
            icon: 'error',
            title: 'Hora de inicio incorrecta',
            text: 'La hora de inicio debe ser menor que la hora de fin. Verifique la hora y vuelva a intentarlo.',
            confirmButtonText: 'Cerrar'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: 'Hubo un problema al actualizar la reservación. Intente nuevamente más tarde.',
            confirmButtonText: 'Cerrar'
          });
        }
      }
    });
  }

}
