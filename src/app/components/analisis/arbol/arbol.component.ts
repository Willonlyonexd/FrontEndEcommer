
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { EstadisticaService } from '../../../services/estadistica.service';


@Component({
  selector: 'app-arbol',
  templateUrl: './arbol.component.html',
  styleUrl: './arbol.component.css'
})
export class ArbolComponent implements OnInit, AfterViewInit {

  loading = true;
  error: string | null = null;
  chartsInitialized = false;

  inventoryAnalysis: any = null;
  recommendations: any[] = [];

  distributionChart: any;
  recomendacionesChart: any;

  constructor(private estadisticaService: EstadisticaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Si ya tenemos los datos cuando se inicializa la vista, intentamos crear los gráficos
    if (!this.loading && !this.chartsInitialized) {
      this.inicializarGraficos();
    }
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;

    let analisisListo = false;
    let recomendacionesListo = false;

    this.estadisticaService.getArbolAnalisi().subscribe({
      next: (data) => {
        console.log('Análisis recibido:', data);
        this.inventoryAnalysis = data;

        analisisListo = true;
        if (recomendacionesListo) {
          this.finalizarCarga();
        }
      },
      error: (err) => {
        console.error('Error al cargar análisis:', err);
        this.error = 'Error al cargar los datos de análisis';
        this.loading = false;
      }
    });

    this.estadisticaService.getArbolRecomendaciones().subscribe({
      next: (data) => {
        console.log('Recomendaciones recibidas:', data);
        this.recommendations = data;

        recomendacionesListo = true;
        if (analisisListo) {
          this.finalizarCarga();
        }
      },
      error: (err) => {
        console.error('Error al cargar recomendaciones:', err);
        this.error = 'Error al cargar las recomendaciones';
        this.loading = false;
      }
    });
  }

  finalizarCarga(): void {
    this.loading = false;
    // Usar un timeout mayor para asegurar que el DOM está listo
    setTimeout(() => {
      this.inicializarGraficos();
    }, 300);
  }

  inicializarGraficos(): void {
    if (this.chartsInitialized) return;

    try {
      console.log('Inicializando gráficos...');

      if (this.inventoryAnalysis?.distribucion) {
        this.crearGraficoDistribucion();
      }

      if (this.recommendations?.length > 0) {
        this.crearGraficoRecomendaciones();
      }

      this.chartsInitialized = true;
    } catch (error) {
      console.error('Error al inicializar gráficos:', error);
    }
  }

  getDistribucionValue(key: string): number {
    if (!this.inventoryAnalysis || !this.inventoryAnalysis.distribucion) {
      return 0;
    }
    return this.inventoryAnalysis.distribucion[key] || 0;
  }

  hasProductosCriticos(): boolean {
    return this.inventoryAnalysis?.productos_criticos?.length > 0;
  }

  hasRecomendaciones(): boolean {
    return this.recommendations?.length > 0;
  }

  getNombreProducto(producto: any): string {
    if (!producto || !producto.nombre_completo) return 'N/A';
    const partes = producto.nombre_completo.split('(');
    return partes.length > 0 ? partes[0] : producto.nombre_completo;
  }

  formatearNumero(valor: number): string {
    if (valor === null || valor === undefined) return '0.00';
    return valor.toFixed(2);
  }

  crearGraficoDistribucion(): void {
    console.log('Creando gráfico de distribución...');
    if (!this.inventoryAnalysis?.distribucion) {
      console.warn('No hay datos de distribución');
      return;
    }

    const canvas = document.getElementById('distributionChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas para distribución no encontrado');
      return;
    }

    // Configurar dimensiones explícitamente
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D');
      return;
    }

    const labels = Object.keys(this.inventoryAnalysis.distribucion);
    const data = Object.values(this.inventoryAnalysis.distribucion);

    console.log('Datos de distribución:', { labels, data });

    const backgroundColors = labels.map(label => {
      switch(label) {
        case 'Crítico': return '#FF6384';
        case 'Alto': return '#FFCE56';
        case 'Bajo': return '#36A2EB';
        case 'Exceso': return '#4BC0C0';
        default: return '#9966FF';
      }
    });

    if (this.distributionChart) {
      this.distributionChart.destroy();
    }

    this.distributionChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Inventario por Estado',
            font: {
              size: 14
            }
          }
        }
      }
    });

    console.log('Gráfico de distribución creado');
  }

  crearGraficoRecomendaciones(): void {
    console.log('Creando gráfico de recomendaciones...');
    if (!this.recommendations || this.recommendations.length === 0) {
      console.warn('No hay datos de recomendaciones');
      return;
    }

    const canvas = document.getElementById('recomendacionesChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas para recomendaciones no encontrado');
      return;
    }

    // Configurar dimensiones explícitamente
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D');
      return;
    }

    // Limitar a 5 recomendaciones para visualización
    const recommendationsToShow = this.recommendations.slice(0, 5);

    const labels = recommendationsToShow.map(item =>
      item.nombre_completo ? item.nombre_completo.split(' ').slice(0, 2).join(' ') : 'Producto'
    );
    const cantidades = recommendationsToShow.map(item => item.cantidad_recomendada);

    console.log('Datos de recomendaciones:', { labels, cantidades });

    if (this.recomendacionesChart) {
      this.recomendacionesChart.destroy();
    }

    this.recomendacionesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad Recomendada',
          data: cantidades,
          backgroundColor: '#4BC0C0',
          borderColor: '#36A2EB',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Recomendaciones de Reposición'
          }
        }
      }
    });

    console.log('Gráfico de recomendaciones creado');
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Crítico': return 'badge bg-danger';
      case 'Alto': return 'badge bg-warning';
      case 'Bajo': return 'badge bg-info';
      case 'Exceso': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  getPrioridadText(prioridad: number): string {
    switch (prioridad) {
      case 1: return 'Alta';
      case 2: return 'Media';
      case 3: return 'Baja';
      default: return 'Desconocida';
    }
  }

  getPrioridadClass(prioridad: number): string {
    switch (prioridad) {
      case 1: return 'badge bg-danger';
      case 2: return 'badge bg-warning';
      case 3: return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }
}
