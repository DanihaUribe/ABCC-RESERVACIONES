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
      console.error('Error al decodificar el token', e);
      return null;

    }
  }

// Método logout
logout() {
  try {
    // Eliminar los items de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirigir a la página de login
    this.router.navigate(['/login']);
    console.log('Usuario desconectado');

    // Notificación de éxito con SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Desconexión exitosa',
      text: '¡Has cerrado sesión correctamente!',
      position: 'top-end', // Posición en la esquina superior derecha
      showConfirmButton: false, // Eliminar el botón de confirmación
      timer: 3000, // Desaparece después de 3 segundos
      toast: true, // Activar modo toast
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);

    // Notificación de error con SweetAlert en caso de fallo
    Swal.fire({
      icon: 'error',
      title: 'Error al cerrar sesión',
      text: 'Hubo un problema al cerrar sesión. Intenta nuevamente.',
      position: 'top-end', // Posición en la esquina superior derecha
      showConfirmButton: false, // Eliminar el botón de confirmación
      timer: 3000, // Desaparece después de 3 segundos
      toast: true, // Activar modo toast
    });
  }
}
}
