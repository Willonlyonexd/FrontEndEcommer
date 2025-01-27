import { Component } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

declare var toastr:any
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {


  public usuario:any={
    email:'',
    password:''
  }
  token: any;
  public bloqueo = 0;
  
  constructor(
    private _usuarioServices: UsuarioService,
    private _router: Router
  ){}

  ngOnInit() {
    const blockStart = localStorage.getItem('blockStart');
    if (blockStart) {
      const blockTime = parseInt(blockStart, 10); 
      const currentTime = new Date().getTime();
      const elapsed = currentTime - blockTime;
      if (elapsed < 3600000) {
        this.bloqueo = 3;
      } else {
        localStorage.removeItem('blockStart');
        this.bloqueo = 0;
      }
    }
  }

  login() {
    
    if (this.bloqueo === 3) {
      const blockStart = localStorage.getItem('blockStart');
      if (blockStart) {
        const blockTime = parseInt(blockStart, 10);
        const currentTime = new Date().getTime();
        const elapsed = currentTime - blockTime;

        if (elapsed < 3600000) {
          toastr.error('Has excedido el número de intentos. Debes esperar 1 hora para volver a intentar.');
          return;
        } else {
         
          localStorage.removeItem('blockStart');
          this.bloqueo = 0;
        }
      }
    }

  
    if (!this.usuario.email) {
      toastr.error('El campo Registro es requerido');
      return;
    }

    if (!this.usuario.password) {
      toastr.error('El campo password es requerido');
      return;
    }

    this._usuarioServices.login(this.usuario).subscribe(
      (response: any) => {
        console.log(response);

        if (response.message === 'la contraseña es incorrecta') {
          this.bloqueo++;
          toastr.error('Contraseña incorrecta, intento ' + this.bloqueo + ' de 3');

          if (this.bloqueo === 3) {
            localStorage.setItem('blockStart', new Date().getTime().toString());
            toastr.error('Has alcanzado el máximo de intentos. Bloqueado por 1 hora.');
          }

        } else {
          
          if (response.data !== undefined) {
            localStorage.setItem('token', response.jwt);
            localStorage.setItem('user', JSON.stringify(response.data));
            toastr.success('Inicio de sesión exitoso');
            this._router.navigate(['/dashboard']);
            this.bloqueo = 0; 
          } else {
            
            toastr.error(response.message);
          }
        }
      },
      (error: any) => {
        toastr.error('Ocurrió un error al intentar iniciar sesión');
        console.error(error);
      }
    );
  }
}
