import { Component } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RolService } from '../../../services/rol.service';
import { StorageService } from '../../../services/storage.service';


declare var $: any;
@Component({
  selector: 'app-index-usuario',
  templateUrl: './index-usuario.component.html',
  styleUrls: ['./index-usuario.component.css']
})
export class IndexUsuarioComponent  {

    public filtro = '';
    public token = this.storageService.getItem('token') || '';
    public user = JSON.parse(this.storageService.getItem('user') || '{}');
    public rolId =''
  public rol:any;
  public funcionalidades:any=[]
    public usuarios: Array<any> = [];
    public page=1
    public pageSize=3
    public btn_state_load=false
    public load_data=true

   constructor(private _usuarioService: UsuarioService,
    private rolservice: RolService,
    private _router:Router,
    private _route:ActivatedRoute,
    private storageService: StorageService
   ) {}

   ngOnInit(){
    this.cargarRoles()
    this.init_data('Todos');
    this._route.queryParams.subscribe(
      params=>{
        this.filtro=params['filter']
        if(this.filtro){
          this.init_data(this.filtro)
        }else{
          this.init_data('Todos');
        }


      }
    )
  }

    cargarRoles(){
      this.rolId=this.user.rol;
      this.rolservice.getRol(this.rolId,this.token).subscribe(
        response => {
          this.rol = response;
          this.funcionalidades=this.rol.funcionalidades

          console.log(this.rol)
          console.log(this.funcionalidades)
        }
      );
    }


  tienePermiso(permiso: string): boolean {
    return this.funcionalidades.some((funcionalidad: any) => funcionalidad.nombre === permiso);
  }

   init_data(filtro: any) {
    filtro=filtro.trim()
    if(filtro != 'Todos') this.filtro=filtro
    this.load_data=true
    this._usuarioService.getUsuarios(filtro, this.token).subscribe(
      response => {

        this.usuarios = response;
        this.load_data=false
      }
    );
   }

   filter() {
    if(this.filtro) {
      this._router.navigate(['/colaborador'],{queryParams:{filter:this.filtro}})
    } else {
      this._router.navigate(['/colaborador'])
    }
   }

   cambioEstado(id: any, estado: any) {
      this.btn_state_load=true
      this._usuarioService.cambioEstado(id, {estado: estado}, this.token).subscribe(
        response => {
          console.log(response);
          $('#state-' + id).modal('hide');
          this.init_data('Todos');
          this.btn_state_load=false
        }
      );
   }
}
