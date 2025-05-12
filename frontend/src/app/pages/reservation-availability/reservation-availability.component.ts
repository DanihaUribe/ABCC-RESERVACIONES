import { Component, Input, OnInit } from '@angular/core';
import { VenueService } from '../../services/venue/venue.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarUserComponent } from '../../shared/navbar-user/navbar-user.component';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-reservation-availability',
  imports: [CommonModule, FormsModule, NavbarUserComponent],
  templateUrl: './reservation-availability.component.html',
  styleUrl: './reservation-availability.component.scss'
})

export class ReservationAvailabilityComponent implements OnInit {
  reservations: any[] = [];
  reservationsByDate: any[] = [];
  venues: any[] = [];
  selectedVenue: any;
  today: string = new Date().toISOString().split('T')[0];

  availableSlots: any[] = []; // Para almacenar los intervalos disponibles
  startTime: string = '';
  endTime: string = '';
  applicantName: string = '';
  reservationDescription: string = '';





  constructor(
    private venueService: VenueService,
    private reservationsService: ReservationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.venueService.getAllVenues().subscribe(
      (data) => {
        this.venues = data;
        this.selectedVenue = this.venues[0];

        this.loadReservations();
        console.log('termino de cargar la info');
      },
      (error) => {
        console.error('Error al obtener los lugares:', error);
      }
    );
  }

  loadReservations() {
    this.reservationsService.getByDateAndVenue(this.selectedVenue.venue_id, this.today).subscribe(
      (data) => {
        this.reservationsByDate = data;
        this.calculateAvailableSlots();
      },
      (error) => {
        console.error('Error al obtener reservas:', error);
      }
    );
  }

  // Función para calcular los intervalos disponibles entre las reservas
  calculateAvailableSlots() {
    const startOfDay = 8 * 60; // 480 minutos (8:00 a.m.)
    const endOfDay = 19 * 60; // 1140 minutos (7:00 p.m.)
    let previousEndTime = startOfDay; // Hora de fin de la última reserva procesada (inicia a las 8 AM)

    this.availableSlots = []; // Limpiar los intervalos anteriores

    // Iterar por las reservas y encontrar intervalos libres, al llegar al final se sale
    console.log('BUSCANDO INTERVALOS');
    for (let i = 0; i < this.reservationsByDate.length; i++) {

      const reservation = this.reservationsByDate[i];
      const reservationStartTime = this.timeToMinutes(reservation.start_time);
      const reservationEndTime = this.timeToMinutes(reservation.end_time);

      // si nuestra primera reserva no es a las 8, no sera  menor por lo que entrara
      //de ser a las 8 se lo salta
      if (reservationStartTime > previousEndTime) {
        console.log('PRIMER DISPONIBLE:', reservationStartTime, '>', previousEndTime);
        this.availableSlots.push({
          start: this.minutesToTime(previousEndTime),
          end: this.minutesToTime(reservationStartTime),
          status: 'Disponible'
        });
      }

      // añadimos la reserva que ya sabemos es la siguiente
      console.log('RESERVA actual');
      this.availableSlots.push({
        start: reservation.start_time,
        end: reservation.end_time,
        status: reservation.status
      });

      previousEndTime = reservationEndTime; // Actualizamos la hora de finalización de la última reserva
    }

    // Verificar si hay espacio libre después de la última reserva
    if (previousEndTime < endOfDay) {
      console.log('hay espacio libre despues de la ultima reserva!', previousEndTime, '<', endOfDay);
      this.availableSlots.push({
        start: this.minutesToTime(previousEndTime),
        end: this.minutesToTime(endOfDay),
        status: 'Disponible'
      });
    }

    console.log('-');
  }

  // Función para convertir hora en formato HH:MM:SS a minutos
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    return hours * 60 + minutes;
  }

  // Función para convertir minutos a hora en formato HH:MM:SS
  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  }

  formatTo12Hour(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    hour = hour ? hour : 12; // 0 => 12

    return `${hour}:${minute} ${ampm}`;
  }

  //CAMBIOS POR TIPO

  editReservation() {
    // Lógica para editar la reserva
    console.log('Editando reserva:');
  }








  steps: string[] = ['Paso 1', 'Paso 2', 'Paso 3', 'Paso 4'];
  currentStep: number = 0;

  goToStep(index: number) {
    this.currentStep = index;
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }


  getDuration(): string {
    if (!this.startTime || !this.endTime) return '';

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return 'Hora inválida';

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}min`;
  }


  isTimeValid(): boolean {
    if (!this.startTime || !this.endTime) return false;

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const start = startHour + startMinute / 60;
    const end = endHour + endMinute / 60;

    return (
      start >= 8 &&
      end <= 19 &&
      start < end
    );
  }
  isFormValid(): boolean {
    return this.getValidationMessage() === null;
  }

  getValidationMessage(): string | null {
    if (!this.applicantName?.trim()) return 'El nombre del solicitante es obligatorio.';
    if (!this.selectedVenue) return 'Debes seleccionar un lugar.';
    if (!this.today) return 'La fecha es obligatoria.';
    if (!this.startTime) return 'La hora de inicio es obligatoria.';
    if (!this.endTime) return 'La hora de fin es obligatoria.';
    if (!this.getDuration()) return 'La duración es inválida.';
    if (!this.isTimeValid()) return 'El horario debe ser entre 8:00 a.m. y 7:00 p.m. y la hora de inicio debe ser menor a la de fin.';
    if (!this.reservationDescription?.trim()) return 'La descripción es obligatoria.';

    return null; // Todo está bien
  }

  makeReservation() {

    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto o inválido',
        text: 'Revisa que todos los campos estén llenos y las horas sean válidas (entre 8:00 a.m. y 7:00 p.m.)',
      });
      return;
    }
    const reservation = {
      requesterName: this.applicantName?.trim(),
      venueId: this.selectedVenue?.venue_id,
      reservationDate: this.today,
      startTime: this.startTime?.trim(),
      endTime: this.endTime?.trim(),
      description: this.reservationDescription?.trim()
    };

    this.reservationsService.createReservation(reservation).subscribe({
      next: (res) => {
        const folio = res?.folio || res?.id || ''; // depende del backend, ajusta aquí si el folio viene con otro nombre

        Swal.fire({
          title: 'Reservación Exitosa',
          text: 'Puedes revisar el estado de tu reservación con el folio generado.',
          icon: 'success',
          confirmButtonText: 'Ver Estado'
        }).then(() => {
          this.router.navigate(['/user-search-folio'], {
            queryParams: { folio }
          });
        });
      },
      error: (err) => {
        if (err.status === 409) {
          Swal.fire({
            title: 'No Disponible',
            text: 'El espacio no está disponible en ese horario.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al crear la reservación.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }



}
