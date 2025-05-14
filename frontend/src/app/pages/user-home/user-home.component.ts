import { Component, OnInit } from '@angular/core';
import { NavbarUserComponent } from '../../shared/navbar-user/navbar-user.component';
import { VenueService } from '../../services/venue/venue.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [NavbarUserComponent, CommonModule, FormsModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss'
})
export class UserHomeComponent implements OnInit {
  reservationsByDate: any[] = [];
  venues: any[] = [];
  selectedVenue: any;

  today: string = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // mañana
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  minDate: string = this.today;
  availableSlots: any[] = [];

  constructor(
    private venueService: VenueService,
    private reservationsService: ReservationService
  ) {}

  ngOnInit(): void {
    this.venueService.getAllVenues().subscribe(
      (data) => {
        this.venues = data;
        this.selectedVenue = this.venues[0];
        this.loadReservations();

        setInterval(() => this.loadReservations(), 10000);
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar lugares',
          text: 'No se pudieron obtener los lugares. Intenta nuevamente más tarde.',
          confirmButtonText: 'Aceptar'
        });
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
        Swal.fire({
          icon: 'error',
          title: 'Error al obtener reservas',
          text: 'No se pudieron obtener las reservas. Intenta nuevamente más tarde.',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  calculateAvailableSlots() {
    const startOfDay = 8 * 60; // 08:00
    const endOfDay = 19 * 60;  // 19:00
    let previousEndTime = startOfDay;
    this.availableSlots = [];

    for (let reservation of this.reservationsByDate) {
      const start = this.timeToMinutes(reservation.start_time);
      const end = this.timeToMinutes(reservation.end_time);

      if (start > previousEndTime) {
        this.availableSlots.push({
          start: this.minutesToTime(previousEndTime),
          end: this.minutesToTime(start),
          status: 'Disponible'
        });
      }

      this.availableSlots.push({
        start: reservation.start_time,
        end: reservation.end_time,
        status: reservation.status
      });

      previousEndTime = end;
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
    const minute = minuteStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }
}
