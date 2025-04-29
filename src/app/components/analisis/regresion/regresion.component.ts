import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EstadisticaService } from '../../../services/estadistica.service';
import Chart from 'chart.js/auto';
import { ChartDataset } from 'chart.js';

@Component({
  selector: 'app-regresion',
  templateUrl: './regresion.component.html',
  styleUrl: './regresion.component.css'
})
export class RegresionComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef | undefined;
  chart: any;

  public meses: number = 2;
  public datosHistoricos: any[] = [];
  public predicciones: any[] = [];
  public totalEsperado: number = 0;
  public mesesPredichos: number = 0;

  loadingHistorico: boolean = false;
  loadingPrediccion: boolean = false;
  error: string | null = null;

  constructor(private regresionService: EstadisticaService) {}

  ngOnInit(): void {
    this.extraerDatosRegresion();
  }

  ngAfterViewInit() {
    // Inicializar el canvas después de que el DOM esté listo
    setTimeout(() => {
      if (this.chartCanvas && this.chartCanvas.nativeElement) {
        this.inicializarGraficoVacio();
      }
    }, 100);
  }

  inicializarGraficoVacio() {
    const ctx = this.chartCanvas?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas.');
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ventas (Bs)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          }
        }
      }
    });
  }

  extraerDatosRegresion() {
    this.loadingHistorico = true;
    this.error = null;

    this.regresionService.extraerDatosRegresion().subscribe({
      next: (response) => {
        console.log('Datos de regresión extraídos:', response);
        this.loadingHistorico = false;
        this.entrenarRegresion();
      },
      error: (error) => {
        console.error('Error al extraer los datos de regresión:', error);
        this.error = 'Error al extraer los datos de regresión';
        this.loadingHistorico = false;
      }
    });
  }

  entrenarRegresion() {
    this.loadingHistorico = true;
    this.error = null;

    this.regresionService.extraerDatosRegresion().subscribe({
      next: (response) => {
        console.log('Datos de regresión entrenados:', response);
        this.loadingHistorico = false;
        this.getRegresionHistorica();
      },
      error: (error) => {
        console.error('Error al entrenar la regresión:', error);
        this.error = 'Error al entrenar la regresión';
        this.loadingHistorico = false;
      }
    });
  }

  getRegresionHistorica() {
    this.loadingHistorico = true;
    this.error = null;

    this.regresionService.getRegresionHistorica().subscribe({
      next: (response) => {
        this.datosHistoricos = response.historical_data || [];
        this.actualizarGraficoHistorico();
        this.loadingHistorico = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos de regresión histórica:', error);
        this.error = 'Error al cargar datos históricos';
        this.loadingHistorico = false;
      }
    });
  }

  regresionPredecir() {
    this.loadingPrediccion = true;
    this.error = null;

    const data = {
      meses: this.meses
    };

    this.regresionService.regresionPredecir(data).subscribe({
      next: (response) => {
        this.predicciones = response.predicciones || [];
        this.totalEsperado = response.total_esperado || 0;
        this.mesesPredichos = response.meses_predichos || 0;

        this.actualizarGraficoConPredicciones();
        this.loadingPrediccion = false;
      },
      error: (error) => {
        console.error('Error al predecir con regresión:', error);
        this.error = 'Error al generar predicciones';
        this.loadingPrediccion = false;
      }
    });
  }

  actualizarMeses(nuevoValor: number) {
    this.meses = nuevoValor;
    this.regresionPredecir();
  }

  actualizarGraficoHistorico() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('El canvas no está disponible');
      return;
    }

    // Si ya existe un gráfico, destruirlo
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se puede obtener el contexto 2D del canvas');
      return;
    }

    const labels = this.datosHistoricos.map(item => `${item.nombre_mes} ${item.año}`);
    const datos = this.datosHistoricos.map(item => item.ventas);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Histórico',
            data: datos,
            borderColor: 'rgba(51, 102, 204, 1)',
            backgroundColor: 'rgba(51, 102, 204, 0.1)',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ventas (Bs)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          }
        }
      }
    });
  }

  actualizarGraficoConPredicciones() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement || !this.chart) {
      console.error('Canvas o gráfico no disponible');
      return;
    }

    // Destruir el gráfico anterior
    this.chart.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    // Unir datos históricos y predicciones para el eje X
    const labelsHistoricos = this.datosHistoricos.map(item => `${item.nombre_mes} ${item.año}`);
    const labelsPredicciones = this.predicciones.map(item => `${item.nombre_mes} ${item.anio}`);

    // Obtener el último punto de datos históricos para unir con las predicciones
    const ultimoDatoHistorico = this.datosHistoricos.length > 0
      ? this.datosHistoricos[this.datosHistoricos.length - 1]
      : null;
    // Crear datasets
    const datasets: ChartDataset<'line'>[] = [

      {
        label: 'Histórico',
        data: [...this.datosHistoricos.map(item => item.ventas), ...Array(labelsPredicciones.length).fill(null)],
        borderColor: 'rgba(51, 102, 204, 1)',
        backgroundColor: 'rgba(51, 102, 204, 0.1)',
        tension: 0.4,
        spanGaps: true
      }
    ];

    // Añadir predicciones solo si hay datos
    if (this.predicciones.length > 0) {
      // Datos pesimistas
      const datosPesimistas = Array(labelsHistoricos.length).fill(null);
      // Si hay un punto de unión, añadirlo
      if (ultimoDatoHistorico) {
        datosPesimistas[datosPesimistas.length - 1] = ultimoDatoHistorico.ventas;
      }
      datasets.push({
        label: 'Pesimista',
        data: [...datosPesimistas, ...this.predicciones.map(item => item.prediccion_pesimista)],
        borderColor: 'rgba(220, 57, 18, 1)',
        borderDash: [5, 5] as number[],
        tension: 0.4,
        spanGaps: true
      });

      // Datos esperados
      const datosEsperados = Array(labelsHistoricos.length).fill(null);
      if (ultimoDatoHistorico) {
        datosEsperados[datosEsperados.length - 1] = ultimoDatoHistorico.ventas;
      }
      datasets.push({
        label: 'Esperado',
        data: [...datosEsperados, ...this.predicciones.map(item => item.prediccion_esperada)],
        borderColor: 'rgba(255, 153, 0, 1)',
        tension: 0.4,
        spanGaps: true
      });

      // Datos optimistas
      const datosOptimistas = Array(labelsHistoricos.length).fill(null);
      if (ultimoDatoHistorico) {
        datosOptimistas[datosOptimistas.length - 1] = ultimoDatoHistorico.ventas;
      }
      datasets.push({
        label: 'Optimista',
        data: [...datosOptimistas, ...this.predicciones.map(item => item.prediccion_optimista)],
        borderColor: 'rgba(16, 150, 24, 1)',
        borderDash: [6, 3],
        tension: 0.4,
        spanGaps: true
      });
    }

    // Crear nuevo gráfico
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labelsHistoricos, ...labelsPredicciones],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ventas (Bs)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          }
        }
      }
    });
  }

  // Para debugging
  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
