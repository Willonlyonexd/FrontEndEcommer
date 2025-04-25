import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IndexUsuarioComponent } from './components/usuarios/index-usuario/index-usuario.component';
import { CreateUsuarioComponent } from './components/usuarios/create-usuario/create-usuario.component';
import { EditUsuarioComponent } from './components/usuarios/edit-usuario/edit-usuario.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { IndexCategoriaComponent } from './components/categorias/index-categoria/index-categoria.component';
import { CreateCategoriaComponent } from './components/categorias/create-categoria/create-categoria.component';
import { EditCategoriaComponent } from './components/categorias/edit-categoria/edit-categoria.component';
import { IndexProductoComponent } from './components/productos/index-producto/index-producto.component';
import { CreateProductoComponent } from './components/productos/create-producto/create-producto.component';
import { EditProductoComponent } from './components/productos/edit-producto/edit-producto.component';
import { IndexRolComponent } from './components/roles/index-rol/index-rol.component';
import { CreateRolComponent } from './components/roles/create-rol/create-rol.component';
import { EditRolComponent } from './components/roles/edit-rol/edit-rol.component';
import { IndexIngresosComponent } from './components/ingresos/index-ingresos/index-ingresos.component';
import { CreateIngresosComponent } from './components/ingresos/create-ingresos/create-ingresos.component';
import { DetalleIngresosComponent } from './components/ingresos/detalle-ingresos/detalle-ingresos.component';
import { IndexInventarioComponent } from './components/inventario/index-inventario/index-inventario.component';
import { DetalleInventarioComponent } from './components/inventario/detalle-inventario/detalle-inventario.component';
import { CreateTenentComponent } from './components/tenent/create-tenent/create-tenent.component';
import { SuscripcionComponent } from './components/tenent/suscripcion/suscripcion.component';
import { IndexVentasComponent } from './components/ventas/index-ventas/index-ventas.component';
import { DetallesVentasComponent } from './components/ventas/detalles-ventas/detalles-ventas.component';
import { IndexProveedorComponent } from './components/proveedor/index-proveedor/index-proveedor.component';
import { CreateProveedorComponent } from './components/proveedor/create-proveedor/create-proveedor.component';
import { IndexAlmacenComponent } from './components/almacen/index-almacen/index-almacen.component';
import { CreateAlmacenComponent } from './components/almacen/create-almacen/create-almacen.component';
import { IndexCuponComponent } from './components/cupon/index-cupon/index-cupon.component';
import { CreateCuponComponent } from './components/cupon/create-cupon/create-cupon.component';
import { EditCuponComponent } from './components/cupon/edit-cupon/edit-cupon.component';
import { EgresoCreateComponent } from './components/egresos/egreso-create/egreso-create.component';
import { EgresoDetallesComponent } from './components/egresos/egreso-detalles/egreso-detalles.component';
import { IndexReporteComponent } from './components/reporte/index-reporte/index-reporte.component';
import { AnalisisComponent } from './components/analisis/analisis.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'suscripcion', component: SuscripcionComponent },
  { path: 'crear/:tipo', component: CreateTenentComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  { path: 'analisis', component: AnalisisComponent },


  { path: 'colaborador', component: IndexUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'colaborador/create', component: CreateUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'colaborador/edit/:id', component: EditUsuarioComponent, canActivate: [AuthGuard] },

  { path: 'categoria/create', component: CreateCategoriaComponent, canActivate: [AuthGuard] },
  { path: 'categoria', component: IndexCategoriaComponent, canActivate: [AuthGuard] },
  { path: 'categoria/:clasificacion', component: IndexCategoriaComponent, canActivate: [AuthGuard] },
  { path: 'categoria/edit/:id', component: EditCategoriaComponent, canActivate: [AuthGuard] },

  { path: 'producto', component: IndexProductoComponent, canActivate: [AuthGuard] },
  { path: 'producto/create', component: CreateProductoComponent, canActivate: [AuthGuard] },
  { path: 'producto/edit/:id', component: EditProductoComponent, canActivate: [AuthGuard] },

  { path: 'rol', component: IndexRolComponent, canActivate: [AuthGuard] },
  { path: 'rol/create', component: CreateRolComponent, canActivate: [AuthGuard] },
  { path: 'rol/edit/:id', component: EditRolComponent, canActivate: [AuthGuard] },

  { path: 'ingresos', component: IndexIngresosComponent, canActivate: [AuthGuard] },
  { path: 'ingresos/create', component: CreateIngresosComponent, canActivate: [AuthGuard] },
  { path: 'ingresos/detalles/:id', component: DetalleIngresosComponent, canActivate: [AuthGuard] },

  { path: 'inventario', component: IndexInventarioComponent, canActivate: [AuthGuard] },
  { path: 'inventario/detalles/:id', component: DetalleInventarioComponent, canActivate: [AuthGuard] },

  { path: 'ventas', component: IndexVentasComponent, canActivate: [AuthGuard] },
  { path: 'ventas/detalles/:id', component: DetallesVentasComponent, canActivate: [AuthGuard] },

  { path: 'proveedor', component: IndexProveedorComponent, canActivate: [AuthGuard] },
  { path: 'proveedor/create', component: CreateProveedorComponent, canActivate: [AuthGuard] },

  { path: 'almacen', component: IndexAlmacenComponent, canActivate: [AuthGuard] },
  { path: 'almacen/create', component: CreateAlmacenComponent, canActivate: [AuthGuard] },

  { path: 'cupon', component: IndexCuponComponent, canActivate: [AuthGuard] },
  { path: 'cupon/create', component: CreateCuponComponent, canActivate: [AuthGuard] },
  { path: 'cupon/edit/:id', component: EditCuponComponent, canActivate: [AuthGuard] },

  { path: 'reporte', component: IndexReporteComponent, canActivate: [AuthGuard] },

  { path: 'egresos/create', component: EgresoCreateComponent, canActivate: [AuthGuard] },
  { path: 'egresos/detalles/:id', component: EgresoDetallesComponent, canActivate: [AuthGuard] },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
