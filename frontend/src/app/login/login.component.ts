import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';  // Importa el servicio de autenticación
import { Router } from '@angular/router';  // Para redirección

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
          console.log('Deberias ser renviado?:');
          const user = JSON.parse(localStorage.getItem('user') || '{}'); // Si no existe 'user', se asigna un objeto vacío
console.log('Usuario almacenado en localStorage:', user);
          // Redirigir a otra página dependiendo del rol
          if (payload.role === 'Administrador' || payload.role === 'Jefe de departamento') {
            console.log('Deberias ser dashboard:');
            this.router.navigate(['/dashboard']);
          } else {
            console.log('Deberias ser user-home:');
            this.router.navigate(['/user-home']);
          }
        },
        error: (error) => {
          console.error('Error en el login:', error);
          // Muestra un mensaje de error si el login falla
          alert('Credenciales incorrectas o error en el servidor. Intenta nuevamente.');
        }
      });
    }
}

}
