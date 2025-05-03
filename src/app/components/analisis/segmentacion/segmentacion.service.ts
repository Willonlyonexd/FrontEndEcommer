import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SegmentacionService {
  private baseUrl = 'http://localhost:3000/segmentation';

  constructor(private http: HttpClient) {}

  getStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/status`);
  }

  runSegmentacion(): Observable<any> {
    return this.http.post(`${this.baseUrl}/run`, {});
  }

  checkNewData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-new-data`);
  }

  getClienteSegmento(clienteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/${clienteId}`);
  }

  getClientesSegmentados(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes`);
  }
}
