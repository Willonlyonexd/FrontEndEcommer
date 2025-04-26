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
  cargandoGeneral = true; // 👈 NUEVO, unificado

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2980b9', '#27ae60', '#f39c12', '#8e44ad']
  };

  constructor(private segmentacionService: SegmentacionService) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargandoGeneral = true;

    Promise.all([
      this.cargarResumen(),
      this.cargarClientes(),
      this.verificarDatosNuevos()
    ]).then(() => {
      this.cargandoGeneral = false;
    }).catch(() => {
      this.cargandoGeneral = false;
      // Aquí podrías manejar errores con un toast bonito si quieres
      console.log("lastUpdate:", this.lastUpdate);

    });
  }

  cargarResumen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.segmentacionService.getStatus().subscribe({
        next: res => {
          this.pieData = Object.entries(res.segments).map(([segmento, count]) => ({
            name: segmento,
            value: count
          }));
          this.totalClientes = res.total_customers;
          this.lastUpdate = res.last_update;
          console.log("🕒 lastUpdate (raw):", this.lastUpdate);
          console.log("🕒 parsed:", new Date(this.lastUpdate));

          resolve();
        },
        error: err => reject(err)
      });
    });
  }

  cargarClientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.segmentacionService.getClientesSegmentados().subscribe({
        next: res => {
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

          this.bubbleData = Object.entries(agrupados).map(([segmento, series]) => ({
            name: segmento,
            series
          }));

          resolve();
        },
        error: err => reject(err)
      });
    });
  }

  verificarDatosNuevos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.segmentacionService.checkNewData().subscribe({
        next: res => {
          this.puedeReentrenar = res.should_train;
          resolve();
        },
        error: err => reject(err)
      });
    });
  }

  recalcular(): void {
    if (!this.puedeReentrenar) return;

    this.cargandoGeneral = true;
    this.segmentacionService.runSegmentacion().subscribe({
      next: res => {
        this.cargarTodo();
      },
      error: err => {
        this.cargandoGeneral = false;
        // Aquí puedes manejar error si quieres
      }
    });
  }
}
