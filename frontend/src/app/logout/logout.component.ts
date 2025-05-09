import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {

  constructor (private router: Router) {}

  logout() {
    //eliminar el token y el usuario del localstorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
    console.log('Usuario desconectado');
  }
  
}
