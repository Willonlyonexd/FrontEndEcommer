import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public url=GLOBAL.url
  constructor(
    private  _http: HttpClient,
    private storageService: StorageService
  ) {}

  createTenant(data:any):Observable<any>{
    return this._http.post(this.url+'/createTenant',data)
  }

  createUsuario(data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.post(this.url+'/createUsuario',data,{headers:headers})
  }

  getUsuarios(filtro:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getUsuarios/'+filtro,{headers:headers})
  }

  login(data:any):Observable<any>{
    let headers= new HttpHeaders().set('Content-Type','application/json')
    return this._http.post(this.url+'/login',data,{headers:headers})
  }


  cambioEstado(id:any,data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.put(this.url+'/cambioEstado/'+id,data,{headers:headers})
  }

  getUsuario(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getUsuario/'+id,{headers:headers})
  }


  updateUsuario(id:any,data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.put(this.url+'/updateUsuario/'+id,data,{headers:headers})
  }
  EstaAutenticado(){
    try {
      if (typeof localStorage !== 'undefined') {
        const token:any = this.storageService.getItem('token');
        console.log("token",token);
        const helper= new JwtHelperService();
        const decode=helper.decodeToken(token);

        console.log(decode);
        if(!token){
          localStorage.clear();
          return false;
        }
        if(!decode || decode ==undefined){
          localStorage.clear();
          return false;
        }

        if(helper.isTokenExpired(token)){
          localStorage.clear();
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      localStorage.clear();
      return false;
    }
    return true;
  }
}
