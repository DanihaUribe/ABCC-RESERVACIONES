import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth/auth.service';  // Importa el servicio de autenticación
import { Router } from '@angular/router';  // Para redirección
import Swal from 'sweetalert2';  // Importar SweetAlert2

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
          console.log('Login exitoso:', response);

          // Aquí puedes guardar el token en el localStorage
          localStorage.setItem('token', response.token);

          // Decodificar el token si es necesario
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          localStorage.setItem('user', JSON.stringify(payload));

          console.log('Usuario almacenado en localStorage:', payload);

          // Redirigir a otra página dependiendo del rol
          if (payload.role === 'Administrador' || payload.role === 'Jefe de departamento') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/user-home']);
          }

          // Mostrar notificación tipo toast de éxito en la esquina superior derecha
          Swal.fire({
            icon: 'success',
            title: 'Login exitoso',
            text: '¡Bienvenido de nuevo!',
            position: 'top-end', // Configurar la posición a la esquina superior derecha
            showConfirmButton: false, // Eliminar el botón de confirmación
            timer: 3000, // Desaparece después de 3 segundos
            toast: true, // Activar modo toast
          });
        },
        error: (error) => {
          console.error('Error en el login:', error);
          // Mostrar notificación tipo toast de error en la esquina superior derecha
          Swal.fire({
            icon: 'error',
            title: 'Error en el login',
            text: 'Credenciales incorrectas o error en el servidor. Intenta nuevamente.',
            position: 'top-end', // Configurar la posición a la esquina superior derecha
            showConfirmButton: false, // Eliminar el botón de confirmación
            timer: 3000, // Desaparece después de 3 segundos
            toast: true, // Activar modo toast
          });
        }
      });
    } else {
      // Si el formulario no es válido, muestra una notificación de advertencia tipo toast
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos.',
        position: 'top-end', // Configurar la posición a la esquina superior derecha
        showConfirmButton: false, // Eliminar el botón de confirmación
        timer: 3000, // Desaparece después de 3 segundos
        toast: true, // Activar modo toast
      });
    }
}

}
