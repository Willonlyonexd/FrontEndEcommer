import { Component, OnInit } from '@angular/core';
import { ConfigTiendaService } from '../../services/config-tienda.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-configuracion-tienda',
  templateUrl: './configuracion-tienda.component.html',
  styleUrls: ['./configuracion-tienda.component.css']
})
export class ConfiguracionTiendaComponent implements OnInit {
  // Variables comunes
  public activeTab: string = 'logo';
  public token: string;
  public url: string;
  public mensaje: string = '';
  public tipoMensaje: string = '';

  // Variables para el logo
  public logoActual: string = '';
  public previewLogo: any = null;
  public logoFile: File | null = null;
  public isLoading: boolean = false;

  // Variables para el banner
  public bannerActual: string = '';
  public previewBanner: any = null;
  public bannerFile: File | null = null;
  public isLoadingBanner: boolean = false;

  // Variables para contacto
  public contacto: any = {
    telefono: '',
    email: '',
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    tiktok: ''
  };
  public isLoadingContacto: boolean = false;

  constructor(
    private _configTiendaService: ConfigTiendaService,
    private storageService: StorageService
  ) {
    this.token = this.storageService.getItem('token') || '';
    this.url = this._configTiendaService.url;
  }

  ngOnInit(): void {
    this.cargarLogoActual();
    this.cargarBannerActual();
    this.cargarContacto();
  }

  // Cambiar entre pestañas
  changeTab(tab: string) {
    this.activeTab = tab;
  }

  // Métodos para el Logo (existentes)...
  cargarLogoActual() {
    this.isLoading = true;
    this._configTiendaService.getConfigTienda(this.token).subscribe(
      response => {
        if (response.logo) {
          this.logoActual = this.url + '/getLogo/' + response.logo;
          this.previewLogo = this.logoActual;
        }
        this.isLoading = false;
      },
      error => {
        console.error(error);
        this.mostrarMensaje('Error al cargar el logo', 'error');
        this.isLoading = false;
      }
    );
  }

  onLogoChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validamos tipo de archivo
      if (!file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
        this.mostrarMensaje('Solo se permiten archivos de imagen (jpg, png, gif)', 'error');
        return;
      }

      // Validamos tamaño
      if (file.size > 2 * 1024 * 1024) {
        this.mostrarMensaje('El archivo es demasiado grande. Máximo 2MB', 'error');
        return;
      }

      // Guardamos el archivo para subirlo después
      this.logoFile = file;

      // Mostramos una previsualización
      const reader = new FileReader();
      reader.onload = e => this.previewLogo = reader.result;
      reader.readAsDataURL(file);
    }
  }

  guardarLogo() {
    if (!this.logoFile) {
      this.mostrarMensaje('No has seleccionado ninguna imagen', 'error');
      return;
    }

    this.isLoading = true;

    const data = {
      logo: this.logoFile
    };

    this._configTiendaService.updateLogo(data, this.token).subscribe(
      response => {
        if (response.success) {
          // Actualizamos el logo actual con el nuevo
          this.logoActual = this.url + '/getLogo/' + response.logo;
          this.previewLogo = this.logoActual;
          this.logoFile = null;
          this.mostrarMensaje('Logo actualizado correctamente', 'success');
        } else {
          this.mostrarMensaje('Error al actualizar el logo', 'error');
        }
        this.isLoading = false;
      },
      error => {
        console.error(error);
        this.mostrarMensaje('Error al actualizar el logo', 'error');
        this.isLoading = false;
      }
    );
  }

  cancelarLogo() {
    // Volvemos al logo actual
    this.previewLogo = this.logoActual;
    this.logoFile = null;
    this.mensaje = '';
  }

  // Métodos para el Banner (existentes)...
  cargarBannerActual() {
    this.isLoadingBanner = true;
    this._configTiendaService.getBanner(this.token).subscribe(
      response => {
        if (response.banner) {
          this.bannerActual = this.url + '/getBanner/' + response.banner;
          this.previewBanner = this.bannerActual;
        }
        this.isLoadingBanner = false;
      },
      error => {
        console.error(error);
        this.mostrarMensaje('Error al cargar el banner', 'error');
        this.isLoadingBanner = false;
      }
    );
  }

  onBannerChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validamos tipo de archivo
      if (!file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
        this.mostrarMensaje('Solo se permiten archivos de imagen (jpg, png, gif)', 'error');
        return;
      }

      // Validamos tamaño (un poco más grande para el banner)
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarMensaje('El archivo es demasiado grande. Máximo 5MB', 'error');
        return;
      }

      // Guardamos el archivo para subirlo después
      this.bannerFile = file;

      // Mostramos una previsualización
      const reader = new FileReader();
      reader.onload = e => this.previewBanner = reader.result;
      reader.readAsDataURL(file);
    }
  }

  guardarBanner() {
    if (!this.bannerFile) {
      this.mostrarMensaje('No has seleccionado ninguna imagen', 'error');
      return;
    }

    this.isLoadingBanner = true;

    const data = {
      banner: this.bannerFile
    };

    this._configTiendaService.updateBanner(data, this.token).subscribe(
      response => {
        if (response.success) {
          // Actualizamos el banner actual con el nuevo
          this.bannerActual = this.url + '/getBanner/' + response.banner;
          this.previewBanner = this.bannerActual;
          this.bannerFile = null;
          this.mostrarMensaje('Banner actualizado correctamente', 'success');
        } else {
          this.mostrarMensaje('Error al actualizar el banner', 'error');
        }
        this.isLoadingBanner = false;
      },
      error => {
        console.error(error);
        this.mostrarMensaje('Error al actualizar el banner', 'error');
        this.isLoadingBanner = false;
      }
    );
  }

  cancelarBanner() {
    // Volvemos al banner actual
    this.previewBanner = this.bannerActual;
    this.bannerFile = null;
    this.mensaje = '';
  }

  // Nuevos métodos para contacto
  cargarContacto() {
    this.isLoadingContacto = true;
    this._configTiendaService.getContacto(this.token).subscribe(
      response => {
        if (response.contacto) {
          this.contacto = response.contacto;
        }
        this.isLoadingContacto = false;
      },
      error => {
        console.error(error);
        this.mostrarMensaje('Error al cargar la información de contacto', 'error');
        this.isLoadingContacto = false;
      }
    );
  }

  guardarContacto() {
    this.isLoadingContacto = true;

    this._configTiendaService.updateContacto(this.contacto, this.token).subscribe(
      response => {
        if (response.success) {
          this.contacto = response.contacto;
          this.mostrarMensaje('Información de contacto actualizada correctamente', 'success');
        } else {
          this.mostrarMensaje('Error al actualizar la información de contacto', 'error');
        }
        this.isLoadingContacto = false;
      },
      error => {
        console.error(error);
        this.mostrarMensaje('Error al actualizar la información de contacto', 'error');
        this.isLoadingContacto = false;
      }
    );
  }

  // Función común para mensajes
  mostrarMensaje(mensaje: string, tipo: string) {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}
