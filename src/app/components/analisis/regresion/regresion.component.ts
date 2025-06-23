import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EstadisticaService } from '../../../services/estadistica.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-regresion',
  templateUrl: './regresion.component.html',
  styleUrls: ['./regresion.component.css']
})
export class RegresionComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef | undefined;
  chart: any;

  public tenantId: string = '6852dbf5c4a6f8d1a81074f6';
  public historial: any[] = [];
  public predicciones: any[] = [];
  public diasPrediccion: number = 7;

  constructor(private estadisticaService: EstadisticaService) {}

  ngOnInit(): void {
    this.obtenerPredicciones();
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

  cambiarDias(dias: number): void {
    this.diasPrediccion = dias;
    this.obtenerPredicciones();
  }

  dibujarGrafico(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas?.nativeElement.getContext('2d');

    // Filtrar historial de los últimos 60 días
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
