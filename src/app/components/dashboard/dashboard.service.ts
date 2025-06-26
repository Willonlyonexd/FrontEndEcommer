import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StorageService } from '../../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://oyster-app-jxtab.ondigitalocean.app'; // URL de la API FastAPI
  public tenantId = this._storage.getItem('tenant') || '' // ID del tenant por defecto


  constructor(private http: HttpClient,
    private _storage: StorageService
  ) {
    console.log('API URL configurada:', this.apiUrl);
  }

  // Método para manejar errores
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Error de conexión a la red:', error);
    } else {
      console.error(`Error del servidor ${error.status}:`, error.error);
    }
    return throwError(() => new Error(`Error en la solicitud. Por favor, intenta de nuevo más tarde.`));
  }

  // ----- MÉTODOS PARA VENTAS -----

  // 1. Evolución de ventas por día
  getVentasPorDia(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando datos de ventas por día para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/ventas/evolucion/dia`, { params })
      .pipe(
        tap(data => console.log('Datos recibidos de ventas por día:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 2. Evolución de ventas por mes
  getVentasPorMes(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando datos de ventas por mes para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/ventas/evolucion/mes`, { params })
      .pipe(
        tap(data => console.log('Datos recibidos de ventas por mes:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 3. Top productos vendidos
  getTopProductos(tenant: string = this.tenantId, limit: number = 10): Observable<any[]> {
    console.log(`Solicitando top ${limit} productos para tenant: ${tenant}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/ventas/top_productos`, { params })
      .pipe(
        tap(data => console.log('Datos recibidos de top productos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 4. Top categorías vendidas
  getTopCategorias(tenant: string = this.tenantId, limit: number = 10): Observable<any[]> {
    console.log(`Solicitando top ${limit} categorías para tenant: ${tenant}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/ventas/top_categorias`, { params })
      .pipe(
        tap(data => console.log('Datos recibidos de top categorías:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 5. Ventas por categoría
  getVentasPorCategoria(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando ventas por categoría para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/ventas/ventas_por_categoria`, { params })
      .pipe(
        tap(data => console.log('Datos recibidos de ventas por categoría:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // ----- MÉTODOS PARA PRODUCTOS -----
  // 1. Distribución de productos por categoría
  getDistribucionPorCategoria(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando distribución de productos por categoría para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/productos/distribucion-por-categoria`, { params })
      .pipe(
        tap(data => console.log('Datos de distribución por categoría recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 2. Stock por categoría
  getStockPorCategoria(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando stock por categoría para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/productos/stock-por-categoria`, { params })
      .pipe(
        tap(data => console.log('Datos de stock por categoría recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 3. Productos sin stock
  getProductosSinStock(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando productos sin stock para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/productos/productos-sin-stock`, { params })
      .pipe(
        tap(data => console.log('Datos de productos sin stock recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 4. Productos recién agregados
  getProductosRecienAgregados(limit: number = 10, tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando productos recién agregados para tenant: ${tenant}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/productos/productos-recien-agregados`, { params })
      .pipe(
        tap(data => console.log('Datos de productos recién agregados recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 5. Productos con sobrestock
  getProductosConSobrestock(umbral: number = 450, tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando productos con sobrestock (umbral: ${umbral}) para tenant: ${tenant}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('umbral', umbral.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/productos/productos-sobre-stock`, { params })
      .pipe(
        tap(data => console.log('Datos de productos con sobrestock recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // ----- MÉTODOS PARA CLIENTES -----

  // ----- MÉTODOS PARA CLIENTES -----

  // 1. Clientes nuevos por mes
  getClientesNuevosPorMes(tenant: string = this.tenantId): Observable<any[]> {
    console.log(`Solicitando clientes nuevos por mes para tenant: ${tenant}`);
    const params = new HttpParams().set('tenant', tenant);
    return this.http.get<any[]>(`${this.apiUrl}/kpi/clientes/nuevos-por-mes`, { params })
      .pipe(
        tap(data => console.log('Datos de clientes nuevos por mes recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 2. Top clientes por compras
  getTopClientes(tenant: string = this.tenantId, limit: number = 10): Observable<any[]> {
    console.log(`Solicitando top ${limit} clientes para tenant: ${tenant}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/clientes/top-clientes`, { params })
      .pipe(
        tap(data => console.log('Datos de top clientes recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 3. Clientes activos e inactivos por mes
  getClientesActivosInactivosPorMes(tenant: string = this.tenantId, meses: number = 12): Observable<any[]> {
    console.log(`Solicitando clientes activos e inactivos por mes para tenant: ${tenant}, últimos ${meses} meses`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('meses', meses.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/clientes/activos-inactivos-por-mes`, { params })
      .pipe(
        tap(data => console.log('Datos de clientes activos e inactivos por mes recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 4. Frecuencia de compra por cliente
  getFrecuenciaCompraClientes(tenant: string = this.tenantId, limit: number = 200): Observable<any[]> {
    console.log(`Solicitando frecuencia de compra por cliente para tenant: ${tenant}, límite: ${limit}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/clientes/frecuencia-compra`, { params })
      .pipe(
        tap(data => console.log('Datos de frecuencia de compra por cliente recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }

  // 5. Clientes inactivos por tiempo
  getClientesInactivos(dias: number = 30, tenant: string = this.tenantId, limit: number = 30): Observable<any[]> {
    console.log(`Solicitando clientes inactivos por ${dias} días para tenant: ${tenant}, límite: ${limit}`);
    let params = new HttpParams()
      .set('tenant', tenant)
      .set('dias', dias.toString())
      .set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/kpi/clientes/inactivos-por-tiempo`, { params })
      .pipe(
        tap(data => console.log('Datos de clientes inactivos recibidos:', data.length, 'registros')),
        catchError(this.handleError)
      );
  }


}
