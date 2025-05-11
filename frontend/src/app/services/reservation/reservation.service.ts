// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/api/reservations'; // URL de tu API

  constructor(private http: HttpClient) {}

  // Método para obtener las reservaciones
  getReservations(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.apiUrl, { headers });
  }
  getByFolioReservations(folio: string) {
    const url = `${this.apiUrl}/${folio}`;
    return this.http.get(url);
  }


  updateReservationStatus(folio: string, status: string, token: string) {
    const url = `${this.apiUrl}/${folio}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(url, { status }, { headers });
  }

  getByDateAndVenue(venue: string, date: string) {
    const url = `${this.apiUrl}/fecha/${venue}/${date}`;
    return this.http.get<any>(url); // <-- usar la URL correcta
  }


}
