import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { data } from 'jquery';

@Injectable({
    providedIn: 'root'
})
export class EstadisticaService {
    public url = GLOBAL.url;
    public entrenarRegresionURl="https://modeloregresionfastapi.onrender.com/train";
    public extraerDatosURL="https://modeloregresionfastapi.onrender.com/refresh-data";

    constructor(private _http: HttpClient) { }

    getTotalVentas(filtro: string, agruparPorMes: boolean, token: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json', 'Autorization': token });
        return this._http.get(`${this.url}/estadisticas/total-ventas?filtro=${filtro}&agruparPorMes=${agruparPorMes}`, { headers });
    }

    getCantidadVentas(filtro: string, token: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json', 'Autorization': token });
        return this._http.get(`${this.url}/estadisticas/cantidad-ventas?filtro=${filtro}`, { headers });
    }

    getIngresosGenerados(filtro: string, token: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json', 'Autorization': token });
        return this._http.get(`${this.url}/estadisticas/ingresos?filtro=${filtro}`, { headers });
    }

    getProductosMasVendidos(limit: number, token: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json', 'Autorization': token });
        return this._http.get(`${this.url}/estadisticas/productos-mas-vendidos?limit=${limit}`, { headers });
    }

    getRegresionHistorica(): Observable<any> {

        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/regresion/historico`, { headers });
    }

    getRegresionMetricas(): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/regresion/metricas`, { headers });
    }

    getRegresionDashboard(): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/regresion/dashboard`, { headers });
    }

    regresionPredecir(data: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.post(`${this.url}/regresion/predecir`, data, { headers });
    }

    linealPredecir(data: any): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.post(`${this.url}/lineal/predicciones`, data, { headers });
    }


    extraerDatosRegresion(): Observable<any> {
       const  data = {}
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.post(`${this.extraerDatosURL}`,data, { headers });
    }

    entrenarModeloRegresion(): Observable<any> {
        const data = {}
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.post(`${this.entrenarRegresionURl}`, data, { headers });
    }


    getArbolAnalisi(): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/arbol/inventario/analisis`, { headers });
    }

    getArbolRecomendaciones(): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/arbol/inventario/recomendaciones`, { headers });
    }


    getSegmentacionResumen(): Observable<any> {
      const headers= new HttpHeaders({ 'Content-type': 'application/json' });
      return this._http.get(`${this.url}/segmentacion/segmentacion-resumen`, { headers });
    }


    getClientesNormalizados(): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/segmentacion/clientes-normalizados`, { headers });
    }

    getConsolidado(): Observable<any> {
        const headers = new HttpHeaders({ 'Content-type': 'application/json' });
        return this._http.get(`${this.url}/segmentacion/consolidado`, { headers });
    }









}
