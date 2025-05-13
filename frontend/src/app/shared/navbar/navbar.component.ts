import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})

export class NavbarComponent {
  username: string | null = null;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.username = this.getUsernameFromToken(token);
    }
  }

  getUsernameFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error al decodificar el token',
        text: 'No se pudo obtener la información del usuario.',
        confirmButtonText: 'Aceptar'
      });
      return null;

    }
  }

  // Método logout
  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);

      Swal.fire({
        icon: 'success',
        title: 'Desconexión exitosa',
        text: '¡Has cerrado sesión correctamente!',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar sesión',
        text: 'Hubo un problema al cerrar sesión. Intenta nuevamente.',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    }
  }
}
