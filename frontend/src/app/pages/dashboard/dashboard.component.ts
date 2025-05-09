// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service'; 
import { Observable } from 'rxjs';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Asegúrate de marcarlo como standalone
  imports: [CommonModule],  // Aquí importas CommonModule
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  reservations: any[] = []; // Array para almacenar las reservaciones
  loading = true; // Para mostrar mensaje de carga

  constructor(
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Llamar al servicio para obtener las reservaciones
      this.reservationService.getReservations(token).subscribe({
        next: (data: any) => {  // Definir el tipo de 'data'
          this.reservations = data;  // Asignar datos de reservaciones
          this.loading = false;  // Ocultar mensaje de carga
        },
        error: (err: any) => {  // Definir el tipo de 'err'
          console.error('Error al obtener las reservaciones', err);
          this.loading = false;  // Detener carga si hay error
        }
      });
    } else {
      this.loading = false;
      console.log('No token found');
    }
  }

  logout() {
    // Eliminar el token y el usuario del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    console.log('Usuario desconectado');
  }
}
