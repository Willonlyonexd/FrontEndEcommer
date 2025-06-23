import { Component } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RolService } from '../../../services/rol.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PagoService } from '../../../services/pago.service';
declare var toastr: any;
declare var Swal: any;

@Component({
  selector: 'app-create-tenent',
  templateUrl: './create-tenent.component.html',
  styleUrl: './create-tenent.component.css'
})
export class CreateTenentComponent {
  public empresa: any = {};
  public tipo: number = 0;
  public btn_load = false;
  public roles: Array<any> = [];
  public acceptTerms = false;
  public showValidation = false;
  public showPassword = false;

  public planSeleccionado: any = {};
  public stripePromise = loadStripe('pk_test_51Rc7VHRwN7D13OU4bzDt0uYl16WPVCrxYVpL21E9Zt4Rzgjuc4AsFnCnwLeJraRAT7wK1Eh8fUJN3T8mDLdmTfn4007NHPqwRg');
  public clientSecret: string | null = null;
  public stripe: Stripe | null = null;
  public card: any = null;

  public planes = [
    {
      id: 1,
      nombre: 'Startup',
      precio: 99,
      descripcion: 'La mejor opción para startups',
      caracteristicas: [
        'Hasta 10 Usuarios Activos',
        'Hasta 30 Integraciones de Proyectos',
        'Plataforma de Analytics Básica',
        'Proyectos Ilimitados'
      ]
    },
    {
      id: 2,
      nombre: 'Negocio',
      precio: 199,
      descripcion: 'La mejor opción para negocios',
      caracteristicas: [
        'Hasta 50 Usuarios Activos',
        'Hasta 100 Integraciones de Proyectos',
        'Plataforma de Analytics Avanzada',
        'Proyectos Ilimitados'
      ]
    },
    {
      id: 3,
      nombre: 'Empresa',
      precio: 999,
      descripcion: 'La mejor opción para empresas',
      caracteristicas: [
        'Usuarios Ilimitados',
        'Integraciones Ilimitadas',
        'Plataforma de Analytics Enterprise',
        'Soporte Prioritario 24/7'
      ]
    }
  ];

  constructor(
    private _usuarioService: UsuarioService,
    private _rolService: RolService,
    private _router: Router,
    private _pagoService: PagoService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      const tipoStr = params['tipo'].replace(/[{}]/g, '');
      if (!isNaN(tipoStr)) {
        this.tipo = +tipoStr;
        this.planSeleccionado = this.planes.find(plan => plan.id === this.tipo) || this.planes[0];
        console.log('Plan seleccionado:', this.planSeleccionado);
      } else {
        console.error('Tipo no es un número:', tipoStr);
      }
    });

    this._rolService.getFuncionalidades().subscribe(
      response => {
        if (response.data != undefined) {
          this.roles = response.data;
          console.log(this.roles);
        }
      }
    );

    await this.inicializarStripeYCrearPaymentIntent();
  }


  isFormValid(): boolean {
    return !!(
      this.empresa.nombreTienda?.trim() &&
      this.empresa.nombres?.trim() &&
      this.empresa.apellidos?.trim() &&
      this.empresa.email?.trim() &&
      this.empresa.password?.trim() &&
      this.acceptTerms
    );
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  private recordTermsAcceptance() {
    const termsData = {
      email: this.empresa.email,
      termsVersion: '1.0',
      acceptedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      planId: this.tipo
    };

    console.log('Términos aceptados:', termsData);


  }

  async inicializarStripeYCrearPaymentIntent() {
    try {
      console.log('Inicializando Stripe...');
      this.stripe = await this.stripePromise;

      if (this.stripe) {
        console.log('Stripe cargado correctamente');

        const monto = this.planSeleccionado.precio * 100;
        console.log('Creando PaymentIntent para monto:', monto);

        this._pagoService.crearPago({ monto: monto, moneda: 'usd' }).subscribe(
          async (res) => {
            console.log('PaymentIntent creado:', res);
            this.clientSecret = res.client_secret || res.clientSecret;

            if (this.clientSecret) {
              const elements = this.stripe!.elements();
              this.card = elements.create('card', {
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1e1e2e',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: '500',
                    lineHeight: '1.5',
                    '::placeholder': {
                      color: '#64748b',
                      fontWeight: '400',
                    },
                    iconColor: '#667eea',
                  },
                  invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444',
                  },
                  complete: {
                    color: '#10b981',
                    iconColor: '#10b981',
                  },
                },
                hidePostalCode: true,
              });

              this.card.mount('#card-element');
              console.log('Stripe Elements montado en #card-element');

              this.card.on('change', (event: any) => {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                  displayError!.innerHTML = `
                    <div class="d-flex align-items-center">
                      <i class="ki-duotone ki-cross-circle fs-5 text-danger me-2">
                        <span class="path1"></span>
                        <span class="path2"></span>
                      </i>
                      <span>${event.error.message}</span>
                    </div>
                  `;
                } else {
                  displayError!.textContent = '';
                }
              });
            }
          },
          (err) => {
            console.error('Error al crear PaymentIntent:', err);
          }
        );
      }
    } catch (error) {
      console.error('Error al inicializar Stripe:', error);
    }
  }

  async registrarYPagar() {
    this.showValidation = true;

    if (!this.isFormValid()) {
      if (!this.acceptTerms) {
        Swal.fire({
          icon: 'warning',
          title: '¡Términos requeridos!',
          html: `
            <div class="text-start">
              <p class="mb-4">Debes aceptar nuestros Términos y Condiciones para continuar.</p>
              <div class="d-flex justify-content-center">
                <a href="/terminos" target="_blank" class="btn btn-sm btn-outline-primary me-2">
                  <i class="ki-duotone ki-document fs-5 me-1">
                    <span class="path1"></span>
                    <span class="path2"></span>
                  </i>
                  Ver Términos
                </a>
                <a href="/politica" target="_blank" class="btn btn-sm btn-outline-info">
                  <i class="ki-duotone ki-shield-tick fs-5 me-1">
                    <span class="path1"></span>
                    <span class="path2"></span>
                  </i>
                  Ver Privacidad
                </a>
              </div>
            </div>
          `,
          confirmButtonText: 'Entendido',
          customClass: {
            popup: 'swal2-popup-custom'
          }
        });
        return;
      }

      toastr.error("Por favor completa todos los campos requeridos");
      return;
    }

    this.btn_load = true;

    try {
      if (this.stripe && this.clientSecret && this.card) {
        console.log('Procesando pago...');

        const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
          payment_method: {
            card: this.card,
            billing_details: {
              name: `${this.empresa.nombres} ${this.empresa.apellidos}`,
              email: this.empresa.email,
            }
          }
        });

        if (error) {
          console.error('Error en el pago:', error.message);
          toastr.error('Error en el pago: ' + error.message);
          this.btn_load = false;
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          console.log('¡Pago realizado correctamente!', paymentIntent);


          this.recordTermsAcceptance();
          this.empresa.terms_version = '1.0';
          this.empresa.tipo= this.tipo;
          console.log('Registrando usuario:', this.empresa);
          this._usuarioService.createTenant(this.empresa).subscribe(
            response => {
              console.log(response);
              if (response.data != undefined) {
                this.btn_load = false;

                Swal.fire({
                  icon: 'success',
                  title: '¡Registro Exitoso!',
                  html: `
                    <div class="text-center">
                      <div class="mb-4">
                        <i class="ki-duotone ki-check-circle fs-4x text-success mb-3">
                          <span class="path1"></span>
                          <span class="path2"></span>
                        </i>
                      </div>
                      <p class="mb-3">Tu cuenta ha sido creada exitosamente</p>
                      <p class="text-muted">Redirigiendo al dashboard...</p>
                    </div>
                  `,
                  timer: 3000,
                  timerProgressBar: true,
                  showConfirmButton: false,
                  allowOutsideClick: false
                }).then(() => {
                  this._router.navigate(['/dashboard']);
                });
              } else {
                this.btn_load = false;
                toastr.error('Error al registrar el usuario');
              }
            },
            error => {
              this.btn_load = false;
              toastr.error('Error al registrar el usuario');
              console.error(error);
            }
          );
        }
      } else {
        toastr.error('Error: Stripe no está inicializado correctamente');
        this.btn_load = false;
      }
    } catch (error) {
      console.error('Error en el proceso:', error);
      toastr.error('Error en el proceso de registro y pago');
      this.btn_load = false;
    }
  }
}
