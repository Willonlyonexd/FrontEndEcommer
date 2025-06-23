import { Component } from '@angular/core';
import { PagoService } from '../../services/pago.service';
import { loadStripe ,Stripe} from '@stripe/stripe-js';



@Component({
  selector: 'app-pago',
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export class PagoComponent {

  stripePromise= loadStripe('pk_test_51Rc7VHRwN7D13OU4bzDt0uYl16WPVCrxYVpL21E9Zt4Rzgjuc4AsFnCnwLeJraRAT7wK1Eh8fUJN3T8mDLdmTfn4007NHPqwRg');
  clientSecret: string | null = null;

  constructor(private pagoService: PagoService) {}


 pagar() {
    console.log('Iniciando pago...'); // Log inicial

    // 1. Llama a tu backend para crear el PaymentIntent
    this.pagoService.crearPago({ monto: 5000, moneda: 'usd' }).subscribe(
      async (res) => {
      console.log('Respuesta del backend:', res); // Log respuesta backend
      this.clientSecret = res.client_secret || res.clientSecret;
      console.log('Client Secret recibido:', this.clientSecret);

      // 2. Monta Stripe Elements
      const stripe = await this.stripePromise;
      console.log('Stripe cargado:', stripe !== null);
      if (!stripe || !this.clientSecret) {
        console.error('Stripe no está cargado o falta el clientSecret');
        return;
      }

      const elements = stripe.elements();
      const card = elements.create('card');
      card.mount('#card-element');
      console.log('Stripe Element montado');

      // 3. Maneja el submit del formulario
      const form = document.getElementById('payment-form');
      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Formulario enviado, procesando pago...');
        const { error, paymentIntent } = await stripe.confirmCardPayment(this.clientSecret!, {
          payment_method: { card }
        });
        if (error) {
          console.error('Error al confirmar el pago:', error.message);
          alert(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          console.log('¡Pago realizado correctamente!', paymentIntent);
          alert('¡Pago realizado correctamente!');
        }
      });
    }, err => {
      console.error('Error comunicándose con el backend:', err);
    });
  }
}
