import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly serviceId = 'service_5ywh0u6';
  private readonly templateId = 'template_b4bmyyq';
  private readonly publicKey = 'h6dBM6md9bpksTlWa';
  constructor() {
     emailjs.init(this.publicKey);
   }


  async sendContactForm(formData: ContactFormData): Promise<void> {
    // Mapear los valores del subject a texto legible
    const subjectMap: { [key: string]: string } = {
      'demo': 'Solicitar una demostración',
      'pricing': 'Consulta sobre precios',
      'technical': 'Soporte técnico',
      'partnership': 'Alianza comercial',
      'other': 'Otro'
    };

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      company: formData.company || 'No especificada',
      phone: formData.phone,
      subject: formData.subject,
      subject_text: subjectMap[formData.subject] || formData.subject,
      message: formData.message,
      current_date: new Date().toLocaleString('es-ES', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    try {
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      if (response.status === 200) {
        console.log('Email enviado exitosamente:', response);
      } else {
        throw new Error('Error en el envío del email');
      }
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error('No se pudo enviar el mensaje. Por favor, intenta nuevamente.');
    }
  }
}
