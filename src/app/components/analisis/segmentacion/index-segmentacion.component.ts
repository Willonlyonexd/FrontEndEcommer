import { Component, OnInit } from '@angular/core';
import { SegmentacionService } from './segmentacion.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-index-segmentacion',
  templateUrl: './index-segmentacion.component.html',
  styleUrls: ['./index-segmentacion.component.css']
})
export class IndexSegmentacionComponent implements OnInit {
  pieData: any[] = [];
  bubbleData: any[] = [];
  totalClientes: number = 0;
  lastUpdate: string = '';
  puedeReentrenar = false;
  cargando = false;
  cargandoClientes = false;
  cargandoResumen = false;


  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2980b9', '#27ae60', '#f39c12', '#8e44ad']
  };
  

  constructor(private segmentacionService: SegmentacionService) {}

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarClientes();
    this.verificarDatosNuevos();
  }

  cargarResumen() {
    this.cargandoResumen = true;
    this.segmentacionService.getStatus().subscribe(res => {
      this.pieData = Object.entries(res.segments).map(([segmento, count]) => ({
        name: segmento,
        value: count
      }));
      this.totalClientes = res.total_customers;
      this.lastUpdate = res.last_update;
      this.cargandoResumen = false;
    });
  }

  cargarClientes() {
    this.cargandoClientes = true;
    this.segmentacionService.getClientesSegmentados().subscribe(res => {
      this.bubbleData = [];
  
      const agrupados: { [key: string]: any[] } = {};
      res.clientes.forEach((cli: any) => {
        if (!agrupados[cli.segmento]) agrupados[cli.segmento] = [];
        agrupados[cli.segmento].push({
          name: cli.cliente_id,
          x: cli.recencia_dias,
          y: cli.total_gastado,
          r: Math.abs(cli.num_compras) + 1
        });
      });
  
      for (const segmento in agrupados) {
        this.bubbleData.push({
          name: segmento,
          series: agrupados[segmento]
        });
      }
  
      this.cargandoClientes = false;
    });
  }

  verificarDatosNuevos() {
    this.segmentacionService.checkNewData().subscribe(res => {
      this.puedeReentrenar = res.should_train;
    });
  }

  recalcular() {
    if (!this.puedeReentrenar) return;
    this.cargando = true;
    this.segmentacionService.runSegmentacion().subscribe(res => {
      this.cargarResumen();
      this.cargarClientes();
      this.verificarDatosNuevos();
      this.cargando = false;
    });
  }
}
