import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EstadisticaService } from '../../../services/estadistica.service';
import Chart from 'chart.js/auto';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-regresion',
  templateUrl: './regresion.component.html',
  styleUrls: ['./regresion.component.css']
})
export class RegresionComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef | undefined;
  chart: any;

  public tenantId= this._storage.getItem('tenant') || ''; // ID del tenant por defecto
  public historial: any[] = [];
  public predicciones: any[] = [];
  public ventasRecientes: any[] = [];
  public diasPrediccion: number = 7;
   tenant='6852dbf5c4a6f8d1a81074f6'
   mostrarMensajeDeNoDatos: boolean = false;

  // Simulaciones para acompañar visualmente
  public resumenModelo = {
    historial_usado_dias: 30,
    dias_proyectados: this.diasPrediccion,
    max_venta_predicha: 688.59,
    min_venta_predicha: 26.07,
    fecha_max: '2025-07-01',
    fecha_min: '2025-07-16'
  };

  public alertaTendencia = {
    alerta: true,
    detalle: 'Tendencia en últimos 7 días: -542.7',
    desde: '2025-07-10',
    hasta: '2025-07-16'
  };

  constructor(private estadisticaService: EstadisticaService,
    private _storage: StorageService
  ) {}

  ngOnInit(): void {
     if(this.tenantId== this.tenant){
         this.obtenerPredicciones();
    this.obtenerVentasRecientes();
    }else{
      this.mostrarMensajeDeNoDatos = true;
      console.warn('El tenant no es válido o no tiene datos disponibles.');
    }

  }

  obtenerPredicciones(): void {
    const data = {
      tenant_id: this.tenantId,
      dias_historial: 30,
      dias_prediccion: this.diasPrediccion
    };

    this.estadisticaService.predecirSerieTemporal(data).subscribe({
      next: (resp) => {
        this.historial = (resp.historial || []).filter((item: any) => item.venta_total > 0);
        this.predicciones = resp.predicciones || [];
        this.dibujarGrafico();
      },
      error: (err) => {
        console.error('Error obteniendo predicciones:', err);
      }
    });
  }

  obtenerVentasRecientes(): void {
    const data = {
      tenant_id: this.tenantId,
      dias_historial: 30,
      dias_prediccion: this.diasPrediccion
    };

    this.estadisticaService.obtenerVentasRecientes(data).subscribe({
      next: (resp) => {
        this.ventasRecientes = resp || [];
      },
      error: (err) => {
        console.error('Error al obtener ventas recientes:', err);
      }
    });
  }

  cambiarDias(dias: number): void {
    this.diasPrediccion = dias;
    this.obtenerPredicciones();
    this.obtenerVentasRecientes();
  }
public mostrarRecomendacion = true;
public mensajeRecomendacion = 'Las ventas muestran una tendencia descendente. Considera lanzar una campaña de reactivación.';

cerrarRecomendacion(): void {
  this.mostrarRecomendacion = false;
}

getColorPorTotal(total: number): string {
  if (total < 800) {
    return 'total-amarillo';
  } else if (total >= 800 && total <= 1200) {
    return 'total-verde';
  } else {
    return 'total-azul';
  }
}


  dibujarGrafico(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas?.nativeElement.getContext('2d');

    const hace60dias = new Date();
    hace60dias.setDate(hace60dias.getDate() - 60);

    const historialFiltrado = this.historial.filter(item => {
      const fecha = new Date(item.fecha);
      return fecha >= hace60dias;
    });

    const labelsHistorial = historialFiltrado.map(item => item.fecha);
    const datosHistorial = historialFiltrado.map(item => item.venta_total);

    const labelsPrediccion = this.predicciones.map(item => item.fecha);
    const datosPrediccion = this.predicciones.map(item => Math.max(item.venta_total_predicho, 0));

    const ultimoValor = datosHistorial[datosHistorial.length - 1];
    const datosPrediccionConUnion = [ultimoValor, ...datosPrediccion];



    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labelsHistorial, ...labelsPrediccion],
        datasets: [
          {
            label: 'Historial',
            data: [...datosHistorial, ...Array(labelsPrediccion.length).fill(null)],
            borderColor: 'blue',
            fill: false,
            tension: 0.4
          },
          {
            label: 'Predicción',
            data: [...Array(datosHistorial.length - 1).fill(null), ...datosPrediccionConUnion],
            borderColor: 'orange',
            borderDash: [5, 5],
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Ventas (Bs)' }
          },
          x: {
            title: { display: true, text: 'Fecha' }
          }
        }
      }
    });


  }

}
