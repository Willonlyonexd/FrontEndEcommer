import { Component } from '@angular/core';
import { GLOBAL } from '../../../services/GLOBAL';
import { ActivatedRoute, Router } from '@angular/router';
import { RolService } from '../../../services/rol.service';
import { VentaService } from '../../../services/ventas.service';
declare var $:any
import * as fs from 'file-saver';
import { Workbook } from 'exceljs';
declare var toastr: any
declare var moment:any
@Component({
  selector: 'app-index-ventas',
  templateUrl: './index-ventas.component.html',
  styleUrl: './index-ventas.component.css'
})
export class IndexVentasComponent {
  public loadData:boolean=true
    public ventas:Array<any>=[]
    public page=1
    public pageSize=3
    public url=GLOBAL.url
    public token=localStorage.getItem('token')||''
    public IniciarFecha:any=''
    public FinalFecha:any=''

    public user = JSON.parse(localStorage.getItem('user') || '{}');
    public rolId =''
    public rol:any;
    public funcionalidades:any=[]
    public detallesExcel:Array<any>=[]


    constructor(
        private route:ActivatedRoute,
        private router:Router,
        private ventasService:VentaService,
        private rolservice: RolService,
      ){}


      ngOnInit(){
        setTimeout(()=>{
          $("#kt_daterangepicker_1").daterangepicker();

          $("#kt_daterangepicker_1").daterangepicker({
            opens: 'left'
          }, (start:any, end:any, label:any) => {
            let start_date = moment(start).format('YYYY-MM-DD')
            let end_date = moment(end).format('YYYY-MM-DD')

            this.router.navigate(['/ventas'],{queryParams:{ IniciarFecha:start_date, FinalFecha:end_date }})
          } );

        },50)
        this.cargarRoles()
        this.route.queryParams.subscribe((params:any)=>{
          if(params.IniciarFecha && params.FinalFecha){
            this.IniciarFecha=params.IniciarFecha
            this.FinalFecha=params.FinalFecha
          }else{
            this.IniciarFecha=moment().startOf('month').format('YYYY-MM-DD')
            this.FinalFecha=moment().endOf('month').format('YYYY-MM-DD')
          }
          this.setFecha()
        })

}

cargarRoles(){
  this.rolId=this.user.rol;
  this.rolservice.getRol(this.rolId,this.token).subscribe(
    response => {
      this.rol = response;
      this.funcionalidades=this.rol.funcionalidades
    }
  );
}

tienePermiso(permiso: string): boolean {
  return this.funcionalidades.some((funcionalidad: any) => funcionalidad.nombre === permiso);
}
setFecha(){

  setTimeout(()=>{
    $("#kt_daterangepicker_1").data('daterangepicker').setStartDate(new Date(this.IniciarFecha+'T00:00:00'))
  $("#kt_daterangepicker_1").data('daterangepicker').setEndDate(new Date(this.FinalFecha+'T00:00:00'))
  },50)

  this.filtroVentas()
}

filtroVentas(){
  let inicio=moment(this.IniciarFecha).format('YYYY-MM-DD')
  let fin=moment(this.FinalFecha).format('YYYY-MM-DD')
  this.loadData=true
  this.ventasService.getVentas(inicio,fin,this.token).subscribe(response=>{
    console.log(response)
    this.ventas=response.data

    this.ventas.forEach((venta,idx) => {

        this.detallesExcel.push({
          cliente:venta.cliente.email,
          total:venta.total

        })
      })
      console.log(this.detallesExcel)
    this.loadData=false
  })
}


 descargarExcel(){
    let workbook = new Workbook();
let worksheet = workbook.addWorksheet("Unidades");

worksheet.addRow(undefined);
for (let x1 of this.detallesExcel){
  let x2=Object.keys(x1);

  let temp=[]
  for(let y of x2){
    temp.push(x1[y])
  }
  worksheet.addRow(temp)
}

//GENERAR EXCEL
let fname='ventas'

worksheet.columns = [
  { header: 'Cliente', key: 'col1', width: 35},
  { header: 'Total', key: 'col2', width: 20 },

]as any;

workbook.xlsx.writeBuffer().then((data:any) => {
  let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  fs.saveAs(blob, fname+'.xlsx');
});
  }



}
