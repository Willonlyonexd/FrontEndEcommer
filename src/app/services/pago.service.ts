import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  url=GLOBAL.url;

  constructor( private _http: HttpClient) {}


  crearPago(data:any):Observable<any>{
    return this._http.post(this.url+'/crearPago',data);
  }

}
