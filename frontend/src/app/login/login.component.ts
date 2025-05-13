import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';  // Importa el servicio de autenticación
import { Router } from '@angular/router';  // Para redirección
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router  // Inyectamos el router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);

          const payload = JSON.parse(atob(response.token.split('.')[1]));
          localStorage.setItem('user', JSON.stringify(payload));
          this.router.navigate(['/dashboard']);

          Swal.fire({
            icon: 'success',
            title: 'Login exitoso',
            text: '¡Bienvenido de nuevo!',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            toast: true,
          });
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error en el login',
            text: 'Credenciales incorrectas o error en el servidor. Intenta nuevamente.',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            toast: true,
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos.',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
    }
  }

}
