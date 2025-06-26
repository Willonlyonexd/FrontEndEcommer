import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DashboardService } from '../dashboard.service';
import { Chart, registerables } from 'chart.js/auto';
import { GLOBAL } from '../../../services/GLOBAL';

// Registrar componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-productos-dashboard',
  templateUrl: './productos-dashboard.component.html',
  styleUrls: ['./productos-dashboard.component.css']
})
export class ProductosDashboardComponent implements OnInit, AfterViewInit {
  // Flag para verificar si estamos en navegador
  private isBrowser: boolean;

  // Variables para almacenar datos
  distribucionPorCategoria: any[] = [];
  stockPorCategoria: any[] = [];
  productosSinStock: any[] = [];
  productosRecienAgregados: any[] = [];
  productosConSobrestock: any[] = [];

  public url= GLOBAL.url;
  // Estadísticas generales
  totalProductos: number = 0;
  totalSinStock: number = 0;
  totalSobrestock: number = 0;
  totalCategorias: number = 0;

  // Estados de carga
  loading = {
    distribucion: false,
    stock: false,
    sinStock: false,
    recienAgregados: false,
    sobrestock: false
  };

  // Gráficos
  distribucionChart: any;
  stockChart: any;
  sobrestockChart: any;

  // Filtros
  filtroCategoria: string = 'todas';
  categorias: string[] = [];
  umbralSobrestock: number = 450;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.cargarDatosProductos();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Verificamos periódicamente si los elementos del DOM están listos
    const checkInterval = setInterval(() => {
      let allReady = true;

      if (this.distribucionPorCategoria.length > 0 && document.getElementById('distribucionChart')) {
        this.crearGraficoDistribucion();
      } else if (this.distribucionPorCategoria.length > 0) {
        allReady = false;
      }

      if (this.stockPorCategoria.length > 0 && document.getElementById('stockChart')) {
        this.crearGraficoStock();
      } else if (this.stockPorCategoria.length > 0) {
        allReady = false;
      }

      if (this.productosConSobrestock.length > 0 && document.getElementById('sobrestockChart')) {
        this.crearGraficoSobrestock();
      } else if (this.productosConSobrestock.length > 0) {
        allReady = false;
      }

      if (allReady) {
        clearInterval(checkInterval);
      }
    }, 200);

    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  // Método para cargar todos los datos de productos
  cargarDatosProductos(): void {
    // 1. Cargar distribución por categoría
    this.loading.distribucion = true;
    this.dashboardService.getDistribucionPorCategoria().subscribe({
      next: (data) => {
        this.distribucionPorCategoria = data;
        this.totalProductos = this.distribucionPorCategoria.reduce((sum, item) => sum + item.cantidad, 0);
        this.totalCategorias = this.distribucionPorCategoria.length;
        this.categorias = this.distribucionPorCategoria.map(item => item.categoria);
        this.loading.distribucion = false;
        if (this.isBrowser) {
          setTimeout(() => this.crearGraficoDistribucion(), 300);
        }
      },
      error: (error) => {
        console.error('Error al obtener distribución por categoría:', error);
        this.loading.distribucion = false;
      }
    });

    // 2. Cargar stock por categoría
    this.loading.stock = true;
    this.dashboardService.getStockPorCategoria().subscribe({
      next: (data) => {
        this.stockPorCategoria = data;
        this.loading.stock = false;
        if (this.isBrowser) {
          setTimeout(() => this.crearGraficoStock(), 300);
        }
      },
      error: (error) => {
        console.error('Error al obtener stock por categoría:', error);
        this.loading.stock = false;
      }
    });

    // 3. Cargar productos sin stock
    this.loading.sinStock = true;
    this.dashboardService.getProductosSinStock().subscribe({
      next: (data) => {
        this.productosSinStock = data;
        this.totalSinStock = this.productosSinStock.length;
        this.loading.sinStock = false;
      },
      error: (error) => {
        console.error('Error al obtener productos sin stock:', error);
        this.loading.sinStock = false;
      }
    });

    // 4. Cargar productos recién agregados
    this.loading.recienAgregados = true;
    this.dashboardService.getProductosRecienAgregados(10).subscribe({
      next: (data) => {
        this.productosRecienAgregados = data;
        this.loading.recienAgregados = false;
      },
      error: (error) => {
        console.error('Error al obtener productos recién agregados:', error);
        this.loading.recienAgregados = false;
      }
    });

    // 5. Cargar productos con sobrestock
    this.loading.sobrestock = true;
    this.dashboardService.getProductosConSobrestock(this.umbralSobrestock).subscribe({
      next: (data) => {
        this.productosConSobrestock = data;
        this.totalSobrestock = this.productosConSobrestock.length;
        this.loading.sobrestock = false;
        if (this.isBrowser) {
          setTimeout(() => this.crearGraficoSobrestock(), 300);
        }
      },
      error: (error) => {
        console.error('Error al obtener productos con sobrestock:', error);
        this.loading.sobrestock = false;
      }
    });
  }

  // Método para aplicar filtros
  aplicarFiltro(): void {
    if (this.isBrowser) {
      // Refrescar gráficos con filtros
      this.crearGraficoDistribucion();
      this.crearGraficoStock();
      this.crearGraficoSobrestock();
    }
  }

  // Método para actualizar umbral de sobrestock
  actualizarUmbralSobrestock(): void {
    if (this.umbralSobrestock < 1) {
      this.umbralSobrestock = 1;
    }

    this.loading.sobrestock = true;
    this.dashboardService.getProductosConSobrestock(this.umbralSobrestock).subscribe({
      next: (data) => {
        this.productosConSobrestock = data;
        this.totalSobrestock = this.productosConSobrestock.length;
        this.loading.sobrestock = false;
        if (this.isBrowser) {
          this.crearGraficoSobrestock();
        }
      },
      error: (error) => {
        console.error('Error al obtener productos con sobrestock:', error);
        this.loading.sobrestock = false;
      }
    });
  }

  // MÉTODOS PARA CREAR GRÁFICOS

  crearGraficoDistribucion(): void {
    if (!this.isBrowser || !this.distribucionPorCategoria || this.distribucionPorCategoria.length === 0) return;

    const ctx = document.getElementById('distribucionChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de distribución");
      return;
    }

    if (this.distribucionChart) {
      this.distribucionChart.destroy();
    }

    try {
      // Filtrar por categoría si es necesario
      let datosFiltrados = this.distribucionPorCategoria;
      if (this.filtroCategoria !== 'todas') {
        datosFiltrados = this.distribucionPorCategoria.filter(item =>
          item.categoria === this.filtroCategoria
        );
      }

      // Ordenar de mayor a menor
      datosFiltrados = datosFiltrados.sort((a, b) => b.cantidad - a.cantidad);

      // Limitar a 15 categorías si hay más para mejor visualización
      if (datosFiltrados.length > 15) {
        datosFiltrados = datosFiltrados.slice(0, 15);
      }

      const labels = datosFiltrados.map(item => this.acortarNombre(item.categoria, 25));
      const datos = datosFiltrados.map(item => item.cantidad);

      // Generar colores distintos para cada barra
      // Usar colores fijos para garantizar colores diferentes
const fixedColors = [
  'rgba(255, 99, 132, 0.7)',   // Rojo
  'rgba(54, 162, 235, 0.7)',   // Azul
  'rgba(255, 206, 86, 0.7)',   // Amarillo
  'rgba(75, 192, 192, 0.7)',   // Verde azulado
  'rgba(153, 102, 255, 0.7)',  // Púrpura
  'rgba(255, 159, 64, 0.7)',   // Naranja
  'rgba(199, 199, 199, 0.7)',  // Gris
  'rgba(83, 102, 255, 0.7)',   // Azul índigo
  'rgba(255, 99, 255, 0.7)',   // Rosa
  'rgba(138, 220, 118, 0.7)',  // Verde lima
  'rgba(220, 76, 100, 0.7)',   // Rojo oscuro
  'rgba(45, 135, 187, 0.7)',   // Azul oscuro
  'rgba(230, 180, 80, 0.7)',   // Amarillo oscuro
  'rgba(50, 168, 168, 0.7)',   // Verde azulado oscuro
  'rgba(130, 80, 220, 0.7)'    // Púrpura oscuro
];

// Asegurar que hay suficientes colores para todos los datos
const backgroundColors = labels.map((_, i) => fixedColors[i % fixedColors.length]);

      this.distribucionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de Productos',
            data: datos,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Distribución de Productos por Categoría',
              font: {
                size: 16
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Productos: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Productos'
              }
            },
            y: {
              ticks: {
                autoSkip: false
              }
            }
          }
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de distribución:', error);
    }
  }

  crearGraficoStock(): void {
    if (!this.isBrowser || !this.stockPorCategoria || this.stockPorCategoria.length === 0) return;

    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de stock");
      return;
    }

    if (this.stockChart) {
      this.stockChart.destroy();
    }

    try {
      // Filtrar por categoría si es necesario
      let datosFiltrados = this.stockPorCategoria;
      if (this.filtroCategoria !== 'todas') {
        datosFiltrados = this.stockPorCategoria.filter(item =>
          item.categoria === this.filtroCategoria
        );
      }

      // Separar categorías con stock positivo y negativo
      const categoriasPositivas = datosFiltrados.filter(item => item.stock_total >= 0);
      const categoriasNegativas = datosFiltrados.filter(item => item.stock_total < 0);

      // Ordenar de mayor a menor (en valor absoluto para negativos)
      categoriasPositivas.sort((a, b) => b.stock_total - a.stock_total);
      categoriasNegativas.sort((a, b) => a.stock_total - b.stock_total);

      // Tomar las top 10 categorías positivas para el gráfico de pie
      const topCategoriasPositivas = categoriasPositivas.slice(0, 10);

      // Si hay más de 10, agrupar el resto en "Otras"
      if (categoriasPositivas.length > 10) {
        const otrasCategoriasStock = categoriasPositivas.slice(10).reduce(
          (sum, item) => sum + item.stock_total, 0
        );

        if (otrasCategoriasStock > 0) {
          topCategoriasPositivas.push({
            categoria: 'Otras Categorías',
            stock_total: otrasCategoriasStock
          });
        }
      }

      const labels = topCategoriasPositivas.map(item => this.acortarNombre(item.categoria, 20));
      const datos = topCategoriasPositivas.map(item => item.stock_total);

      // Crear colores para cada segmento del pie
      // Usar colores fijos para garantizar colores diferentes
const fixedColors = [
  'rgba(255, 99, 132, 0.7)',   // Rojo
  'rgba(54, 162, 235, 0.7)',   // Azul
  'rgba(255, 206, 86, 0.7)',   // Amarillo
  'rgba(75, 192, 192, 0.7)',   // Verde azulado
  'rgba(153, 102, 255, 0.7)',  // Púrpura
  'rgba(255, 159, 64, 0.7)',   // Naranja
  'rgba(199, 199, 199, 0.7)',  // Gris
  'rgba(83, 102, 255, 0.7)',   // Azul índigo
  'rgba(255, 99, 255, 0.7)',   // Rosa
  'rgba(138, 220, 118, 0.7)',  // Verde lima
  'rgba(13, 119, 219, 0.7)',   // Rojo oscuro
  'rgba(45, 135, 187, 0.7)',   // Azul oscuro
  'rgba(230, 180, 80, 0.7)',   // Amarillo oscuro
  'rgba(50, 168, 168, 0.7)',   // Verde azulado oscuro
  'rgba(130, 80, 220, 0.7)'    // Púrpura oscuro
];

// Asegurar que hay suficientes colores para todos los datos
const backgroundColors = labels.map((_, i) => fixedColors[i % fixedColors.length]);

      this.stockChart = new Chart(ctx, {
        type: 'pie', // Cambiado a pie como solicitado
        data: {
          labels: labels,
          datasets: [{
            label: 'Stock Total',
            data: datos,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Stock Actual por Categoría',
              font: {
                size: 16
              }
            },
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  const dataset = context.dataset;
                  const total = dataset.data.reduce((acc: number, current: number) => acc + current, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value.toLocaleString()} unidades (${percentage}%)`;
                }
              }
            }
          }
        }
      });

      // Si hay categorías con stock negativo, mostrar una alerta
      if (categoriasNegativas.length > 0) {
        const alertElement = document.getElementById('stockNegativoAlert');
        if (alertElement) {
          alertElement.classList.remove('d-none');
          alertElement.textContent = `¡Atención! Hay ${categoriasNegativas.length} categorías con stock negativo.`;
        }
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de stock:', error);
    }
  }

  crearGraficoSobrestock(): void {
    if (!this.isBrowser || !this.productosConSobrestock || this.productosConSobrestock.length === 0) return;

    const ctx = document.getElementById('sobrestockChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de productos con sobrestock");
      return;
    }

    if (this.sobrestockChart) {
      this.sobrestockChart.destroy();
    }

    try {
      // Ordenar por stock (de mayor a menor)
      let datosFiltrados = [...this.productosConSobrestock].sort((a, b) => b.stock_total - a.stock_total);

      // Tomar los 10 productos con más stock
      datosFiltrados = datosFiltrados.slice(0, 10);

      const labels = datosFiltrados.map(item => this.acortarNombre(item.producto, 20));
      const datos = datosFiltrados.map(item => item.stock_total);

      // Generar tonos de azul
      const backgroundColors = this.generateColorGradient(datos.length, 'blue');

      this.sobrestockChart = new Chart(ctx, {
        type: 'bar', // Gráfico vertical como solicitado
        data: {
          labels: labels,
          datasets: [{
            label: 'Unidades en Stock',
            data: datos,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Top 10 Productos con Más Stock (>=${this.umbralSobrestock} u.)`,
              font: {
                size: 16
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  return `Stock: ${value.toLocaleString()} unidades`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Unidades en Stock'
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de productos con sobrestock:', error);
    }
  }

  // Método auxiliar para acortar nombres largos
  acortarNombre(nombre: string, maxLength: number): string {
    return nombre.length > maxLength ? nombre.substring(0, maxLength) + '...' : nombre;
  }

  // Método para generar degradados de colores para las gráficas
  generateColorGradient(steps: number, baseColor: string): string[] {
    const colors: string[] = [];

    // Si se solicita múltiples colores
    if (baseColor === 'multi') {
      const baseColors = [
        [255, 99, 132],   // Rojo
        [54, 162, 235],   // Azul
        [255, 206, 86],   // Amarillo
        [75, 192, 192],   // Verde azulado
        [153, 102, 255],  // Púrpura
        [255, 159, 64],   // Naranja
        [199, 199, 199],  // Gris
        [83, 102, 255],   // Azul índigo
        [255, 99, 255],   // Rosa
        [138, 220, 118]   // Verde lima
      ];

      for (let i = 0; i < steps; i++) {
        const colorIndex = i % baseColors.length;
        const [r, g, b] = baseColors[colorIndex];
        // Agregar variación para evitar colores exactamente iguales
        const variacion = i >= baseColors.length ? 0.7 + (i / steps) * 0.3 : 1;

        colors.push(`rgba(${Math.min(255, Math.round(r * variacion))}, ${Math.min(255, Math.round(g * variacion))}, ${Math.min(255, Math.round(b * variacion))}, 0.7)`);
      }

      return colors;
    }

    // Si se solicita un solo color base con variaciones
    let baseRed = 0;
    let baseGreen = 0;
    let baseBlue = 0;

    // Definir el color base
    switch (baseColor) {
      case 'blue':
        baseRed = 54;
        baseGreen = 162;
        baseBlue = 235;
        break;
      case 'red':
        baseRed = 255;
        baseGreen = 99;
        baseBlue = 132;
        break;
      case 'green':
        baseRed = 75;
        baseGreen = 192;
        baseBlue = 75;
        break;
      default:
        baseRed = 54;
        baseGreen = 162;
        baseBlue = 235;
    }

    for (let i = 0; i < steps; i++) {
      // Variar ligeramente el color base para cada elemento
      const factor = 0.7 + (i / steps) * 0.3; // Factor de variación entre 0.7 y 1.0

      const red = Math.min(255, Math.round(baseRed * factor));
      const green = Math.min(255, Math.round(baseGreen * factor));
      const blue = Math.min(255, Math.round(baseBlue * factor));

      colors.push(`rgba(${red}, ${green}, ${blue}, 0.7)`);
    }

    return colors;
  }

  // Formato para fechas
  formatDate(dateStr: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Generador de ID única para imagenes
  generateImageId(productId: string): string {
    return `img_${productId.substring(productId.length - 6)}`;
  }

  // Método para decidir el color de la etiqueta
  getBadgeClass(label: string): string {
    if (!label) return 'badge bg-secondary';

    switch (label.toLowerCase()) {
      case 'nuevo':
        return 'badge bg-success';
      case 'oferta':
        return 'badge bg-danger';
      case 'destacado':
        return 'badge bg-primary';
      case 'exclusivo':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  }

  // Método para decidir el nivel de alerta según el stock
  getStockAlertLevel(stock: number): string {
    if (stock < -500) return 'text-danger fw-bold';
    if (stock < -200) return 'text-danger';
    if (stock < 0) return 'text-warning';
    return 'text-success';
  }
}
