import { Component } from '@angular/core';
import { ContactFormData, EmailService } from '../../services/email.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
      isLoading = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';

  constructor(private emailService: EmailService) {}

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extraer datos del formulario
    const contactData: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      consent: !!formData.get('consent')
    };

    // Validaciones básicas
    if (!this.validateForm(contactData)) {
      return;
    }

    this.isLoading = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    try {
      await this.emailService.sendContactForm(contactData);

      // Mostrar mensaje de éxito
      this.showSuccessMessage = true;
      form.reset();

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.showErrorMessage = true;

      // Ocultar mensaje de error después de 5 segundos
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 5000);

    } finally {
      this.isLoading = false;
    }
  }

  private validateForm(data: ContactFormData): boolean {
    // Validar campos requeridos
    if (!data.name || !data.email || !data.phone || !data.subject || !data.message) {
      alert('Por favor, completa todos los campos obligatorios.');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      alert('Por favor, ingresa un email válido.');
      return false;
    }

    // Validar consentimiento
    if (!data.consent) {
      alert('Debes aceptar los términos y condiciones para continuar.');
      return false;
    }

    return true;
  }
}
