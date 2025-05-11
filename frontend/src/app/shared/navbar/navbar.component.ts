import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
    console.log('Usuario desconectado');
  }
}
