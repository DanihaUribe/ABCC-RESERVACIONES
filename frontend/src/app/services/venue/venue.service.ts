import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VenueService {

  private apiUrl = 'http://localhost:3000/api/venues';

  constructor(private http: HttpClient) { }

  getAllVenues(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}