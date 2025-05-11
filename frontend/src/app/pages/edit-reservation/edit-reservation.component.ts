import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue/venue.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

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
  today: string = new Date().toISOString().split('T')[0];
  availableSlots: any[] = [];
  folioActual: string = '';
  reservationToEdit: any = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private venueService: VenueService,
    private reservationsService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const folio = params.get('folio');
      if (!folio) {
        console.error('No se proporcionó un folio en la URL.');
        this.loading = false;
        return;
      }

      this.folioActual = folio;

      this.reservationsService.getByFolioReservations(folio).subscribe(
        (reservation: any) => {
          this.reservationToEdit = reservation;
          this.today = this.formatDateForInput(reservation.reservation_date);

          this.venueService.getAllVenues().subscribe(
            (venues) => {
              this.venues = venues;
              this.selectedVenue = this.venues.find(v => v.venue_id === reservation.venue_id);
              this.loadReservations();
              this.loading = false;
            },
            (error) => {
              console.error('Error al obtener los lugares:', error);
              this.loading = false;
            }
          );
        },
        (error) => {
          console.error('Error al obtener la reserva por folio:', error);
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

  loadReservations() {
    if (this.selectedVenue) {
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
        status: reservation.status
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
}
