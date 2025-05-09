import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';  // URL de tu backend

  constructor(private http: HttpClient) { }

  // Cambiar la firma de la función login para que reciba un solo objeto
  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        catchError((error) => {
          // Aquí puedes manejar el error como quieras
          console.error('Error en la autenticación:', error);
          throw error;  // Vuelve a lanzar el error para que lo maneje el componente
        })
      );
  }
}
