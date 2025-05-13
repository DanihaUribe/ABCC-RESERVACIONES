import { Component } from '@angular/core';
import { ReservationService } from '../../services/reservation/reservation.service';
import Swal from 'sweetalert2';
import { NavbarUserComponent } from '../../shared/navbar-user/navbar-user.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-find-folio-user',
  imports: [NavbarUserComponent, CommonModule, FormsModule],
  templateUrl: './find-folio-user.component.html',
  styleUrls: ['./find-folio-user.component.scss']
})
export class FindFolioUserComponent {
  folio: string = '';
  foundReservation: any = null; // Variable para almacenar la reserva encontrada

  constructor(
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const folioUrl = params['folio'];
      if (folioUrl) {
        this.folio = folioUrl;
        this.buscarReserva(); // Dispara la búsqueda automáticamente

      }
    });
  }



  buscarReserva() {
    if (!this.folio.trim()) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Folio vacío',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      return;
    }

    this.reservationService.getByFolioForUsers(this.folio).subscribe({
      next: (reserva: any) => {
        console.log('Reserva recibida:', reserva);  // Log para depuración
        this.foundReservation = reserva; // Guardamos la reserva encontrada

        if (reserva.status === 'Cancelada') {
          // Simulamos que no se encontró
          this.foundReservation = null;
          Swal.fire('No encontrada', 'La reservación no existe o ha sido cancelada por un administrador.', 'warning');
        } else {
          this.foundReservation = reserva; // Guardamos la reserva encontrada si no está cancelada
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Encontrada',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        }

        // Llamar a descargarPDF automáticamente después de un pequeño delay para asegurar que el DOM esté actualizado
        setTimeout(() => {
          this.cdr.detectChanges(); // Detectar cambios para asegurar que el DOM esté listo
          this.descargarPDF(); // Generar PDF
        }, 500); // Puedes ajustar el tiempo si es necesario

      },
      error: (err) => {
        console.error('Error al buscar la reserva:', err);  // Log del error
        this.foundReservation = null; // Reiniciamos la variable en caso de error

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'No encontrada',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
    });
  }

  descargarPDF() {
    const element = document.getElementById('reservaPDF');
    if (!element) return;

    const options = {
      margin: 0.5,
      filename: `reserva_${this.foundReservation.folio}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const html2pdfFn = (window as any).html2pdf || (window as any).html2pdf?.default;
    if (typeof html2pdfFn !== 'function') {
      alert('html2pdf no está disponible');
      return;
    }
    html2pdfFn().from(element).set(options).save();
  }
}
