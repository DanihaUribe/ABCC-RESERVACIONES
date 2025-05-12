import { Component, Input, OnInit } from '@angular/core';
import { NavbarUserComponent } from '../../shared/navbar-user/navbar-user.component';
import { VenueService } from '../../services/venue/venue.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-home',
  imports: [NavbarUserComponent,CommonModule, FormsModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss'
})
export class UserHomeComponent implements OnInit {

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

  availableSlots: any[] = []; // Para almacenar los intervalos disponibles

  constructor(
    private venueService: VenueService,
    private reservationsService: ReservationService
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
        console.log('PRIMER DISPONIBLE:',reservationStartTime,'>', previousEndTime);
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
      console.log('hay espacio libre despues de la ultima reserva!',previousEndTime, '<',endOfDay );
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



}
