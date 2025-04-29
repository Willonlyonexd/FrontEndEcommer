import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EstadisticaService } from '../../../services/estadistica.service';
import { ProductoService } from '../../../services/producto.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-lineal',
  templateUrl: './lineal.component.html',
  styleUrl: './lineal.component.css'
})
export class LinealComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef | undefined;
  chart: any;

  loadingPrediccion: boolean = false;
  loadingCategorias: boolean = false;
  error: string | null = null;

  // Autenticación
  public token: string | null = localStorage.getItem('token');

  // Datos de entrada
  public meses: number = 2;
  public categorias: any[] = [];
  public categoriaSeleccionada: string = '';
  public selectedMesIndex: number = 0;

  // Respuesta de predicción
  public nombreCategoria: string = '';
  public ultimaFecha: string = '';
  public predicciones: any[] = [];
  public productosPorMes: any[] = [];
  public metricas: any = {};

  constructor(
    private linealService: EstadisticaService,
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.getCategorias();
  }

  ngAfterViewInit() {
    console.log('¿Canvas disponible?', this.chartCanvas?.nativeElement);

    // Retrasar la inicialización para asegurar que el DOM está listo
    setTimeout(() => {
      if (this.chartCanvas && this.chartCanvas.nativeElement) {
        console.log('Canvas encontrado después del timeout');
        this.inicializarGraficoVacio();
      } else {
        console.error('Canvas sigue sin encontrarse después del timeout');
      }
    }, 200);
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
              text: 'Unidades'
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

  getCategorias() {
    this.loadingCategorias = true;
    this.error = null;

    this.productoService.getCategoriasAll(this.token).subscribe({
      next: (response) => {
        this.categorias = response.data || [];
        console.log('Categorías:', this.categorias);
        if (this.categorias.length > 0) {
          this.categoriaSeleccionada = this.categorias[0]._id;
        }
        this.loadingCategorias = false;
      },
      error: (error) => {
        console.error('Error al obtener categorías:', error);
        this.error = 'Error al cargar las categorías';
        this.loadingCategorias = false;
      }
    });
  }

  actualizarMeses(nuevoValor: number) {
    this.meses = nuevoValor;
    if (this.categoriaSeleccionada) {
      this.linealPredecir();
    }
  }

  linealPredecir() {
    if (!this.categoriaSeleccionada) {
      this.error = 'Debe seleccionar una categoría';
      return;
    }

    this.loadingPrediccion = true;
    this.error = null;

    const data = {
      categoria_id: this.categoriaSeleccionada,
      meses: this.meses,
      incluir_grafico: true
    };

    this.linealService.linealPredecir(data).subscribe({
      next: (response) => {
        console.log('Respuesta de predicción lineal:', response);
        this.nombreCategoria = response.categoria;
        this.ultimaFecha = response.ultima_fecha;
        this.predicciones = response.predicciones || [];
        this.productosPorMes = response.productos_por_mes || [];
        this.metricas = response.metricas || {};

        // Actualizar gráfico con los nuevos datos
        this.actualizarGrafico(response.datos_ngx_charts || []);
        this.loadingPrediccion = false;
      },
      error: (error) => {
        console.error('Error al obtener predicción lineal:', error);
        this.error = 'Error al generar la predicción lineal';
        this.loadingPrediccion = false;
      }
    });
  }

  actualizarGrafico(datos: any[]) {
    console.log('Datos recibidos para gráfico:', datos);

    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('El canvas no está disponible');
      return;
    }


    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se puede obtener el contexto 2D del canvas');
      return;
    }

    const meses = datos.map(d => d.nombre);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Histórico',
            data: datos.map(d => d.historico),
            borderColor: 'rgba(51, 102, 204, 1)',
            tension: 0.4,
            spanGaps: true // Importante: Esto permite que las líneas continúen aunque haya valores null
          },
          {
            label: 'Predicción',
            data: datos.map(d => d.prediccion),
            borderColor: 'rgba(220, 57, 18, 1)',
            borderDash: [5, 5],
            tension: 0.4,
            spanGaps: true
          },
          {
            label: 'Rango Inferior',
            data: datos.map(d => d.rango_inferior),
            borderColor: 'rgba(255, 153, 0, 1)',
            borderDash: [2, 2],
            tension: 0.4,
            spanGaps: true
          },
          {
            label: 'Rango Superior',
            data: datos.map(d => d.rango_superior),
            borderColor: 'rgba(16, 150, 24, 1)',
            borderDash: [6, 3],
            tension: 0.4,
            spanGaps: true
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
              text: 'Unidades'
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

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  formatearNumero(valor: number): string {
    return valor ? valor.toFixed(2) : '0.00';
  }
}
