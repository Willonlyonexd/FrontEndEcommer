import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  public url=GLOBAL.url
  constructor(
    private _http:HttpClient
  ) { }

  createCategoria(data:any, token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.post(this.url+'/createCategoria',data,{headers:headers})
  }

  getCategorias(clasificacion:any, token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getCategorias/'+clasificacion,{headers:headers})
  }

  getSubcategorias(categoria_id: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', token);
    return this._http.get(this.url + '/getSubcategorias/' + categoria_id, { headers });
  }
  

  cambioEstadoCategoria(id:any,data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.put(this.url+'/cambioEstadoCategoria/'+id,data,{headers:headers})
  }

  getCategoria(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getCategoria/'+id,{headers:headers})
  }

  updateCategoria(id:any,data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.put(this.url+'/updateCategoria/'+id,data,{headers:headers})
  }

  createProducto(data:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Autorization':token})
    const formData=new FormData()
    formData.append('titulo',data.titulo)
    formData.append('descripcion',data.descripcion)
    formData.append('categoria',data.categoria)
    formData.append('subcategorias',data.subcategorias)
    formData.append('clasificacion',data.clasificacion)

    formData.append('etiquetas',JSON.stringify(data.etiquetas))
    formData.append('variaciones',JSON.stringify(data.variaciones))

    if(data.galeria.length >=1){
      formData.append('galeria',JSON.stringify(data.galeria))
      data.galeria.forEach((element:any) => {
        formData.append('files[]',element.imagen)
      })
    }

    return this._http.post(this.url+'/createProducto',formData,{headers:headers})
  }

  AddImagenProducto(data:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Autorization':token})
    const formData=new FormData()
    formData.append('titulo',data.titulo)
    formData.append('imagen',data.imagen)
    formData.append('producto',data.producto)
    return this._http.post(this.url+'/AddImagenProducto',formData,{headers:headers})
  }


  getProductos(filtro:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getProductos/'+filtro,{headers:headers})
  }

  cambioEstadoProducto(id:any,data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.put(this.url+'/cambioEstadoProducto/'+id,data,{headers:headers})
  }

  getProducto(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getProducto/'+id,{headers:headers})
  }

  getVariacionesProducto(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getVariacionesProducto/'+id,{headers:headers})
  }

  getGaleriaProducto(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getGaleriaProducto/'+id,{headers:headers})
  }

  updateProducto(id:any,data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.put(this.url+'/updateProducto/'+id,data,{headers:headers})
  }

  addVariacion(data:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.post(this.url+'/addVariacion',data,{headers:headers})
  }

  deleteVariacion(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.delete(this.url+'/deleteVariacion/'+id,{headers:headers})
  }

  deleteImagen(id:any,token:any):Observable<any>{
    let headers= new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.delete(this.url+'/deleteImagen/'+id,{headers:headers})
  }

  buscarProducto(filtro:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.get(this.url+'/buscarProducto/'+filtro,{headers:headers})
  }

  getAlmacenes(token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getAlmacenes',{headers:headers})
  }

  getCategoriasCupon(filtro:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getCategoriasCupon/'+filtro,{headers:headers})
  }

  getProductosCupon(filtro:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getProductosCupon/'+filtro,{headers:headers})
  }

  crearCupon(data:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.post(this.url+'/crearCupon',data,{headers:headers})
  }

  getCupones(codigo:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getCupones/'+codigo,{headers:headers})
  }

  getCupon(id:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getCupon/'+id,{headers:headers})
  }

  updateCupon(id:any,data:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.put(this.url+'/updateCupon/'+id,data,{headers:headers})
  }

  getDetallesCupon(id:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-Type':'application/json','Autorization':token})
    return this._http.get(this.url+'/getDetallesCupon/'+id,{headers:headers})
  }

  addDetalleCupon(data:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.post(this.url+'/addDetalleCupon',data,{headers:headers})
  }

  deleteCupon(id:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.delete(this.url+'/deleteCupon/'+id,{headers:headers})
  }

  updateVariacionPrecio(id:any,data:any,token:any):Observable<any>{
    const headers=new HttpHeaders({'Content-type':'application/json','Autorization':token})
    return this._http.put(this.url+'/updateVariacionPrecio/'+id,data,{headers:headers})
  }
}
