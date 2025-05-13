// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = 'http://localhost:3000/api/change-history';

  constructor(private http: HttpClient) {}

  getReservationHistory(folio: string, token: string) {
    const url = `${this.apiUrl}/${folio}`; 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(url, { headers });
  }
}
