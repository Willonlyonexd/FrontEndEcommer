import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';

@Injectable({
  providedIn: 'root'
})
export class ConfigTiendaService {
 public url = GLOBAL.url;

  constructor(private _http: HttpClient) { }


 getConfigTienda(token: any): Observable<any> {
    const headers = new HttpHeaders({'Content-type': 'application/json', 'Autorization': token});
    return this._http.get(this.url + '/logo', {headers: headers});
  }

  updateLogo(data: any, token: any): Observable<any> {
    const headers = new HttpHeaders({'Autorization': token});
    const formData = new FormData();
    formData.append('logo', data.logo);
    return this._http.post(this.url + '/logo', formData, {headers: headers});
  }

  // Nuevos métodos para el banner (simple, como el logo)
  getBanner(token: any): Observable<any> {
    const headers = new HttpHeaders({'Content-type': 'application/json', 'Autorization': token});
    return this._http.get(this.url + '/banner', {headers: headers});
  }

  updateBanner(data: any, token: any): Observable<any> {
    const headers = new HttpHeaders({'Autorization': token});
    const formData = new FormData();
    formData.append('banner', data.banner);
    return this._http.post(this.url + '/banner', formData, {headers: headers});
  }

    getContacto(token: any): Observable<any> {
    const headers = new HttpHeaders({'Content-type': 'application/json', 'Autorization': token});
    return this._http.get(this.url + '/contacto', {headers: headers});
  }

  updateContacto(data: any, token: any): Observable<any> {
    const headers = new HttpHeaders({'Content-type': 'application/json', 'Autorization': token});
    return this._http.post(this.url + '/contacto', data, {headers: headers});
  }

}
