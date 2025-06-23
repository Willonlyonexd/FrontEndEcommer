import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { Chart, registerables } from 'chart.js/auto';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-ventas-dashboard',
  templateUrl: './ventas-dashboard.component.html',
  styleUrls: ['./ventas-dashboard.component.css']
})
export class VentasDashboardComponent implements OnInit, AfterViewInit {
  // Filtros de tiempo
  public filtroDiario: string = 'mes';  // 'mes', 'trimestre', 'anio', 'todos'
  public filtroMensual: string = 'anio'; // 'anio', 'todos'
  
  // Variables para almacenar datos
  ventasPorDia: any[] = [];
  ventasPorDiaFiltrado: any[] = [];
  ventasPorMes: any[] = [];
  ventasPorMesFiltrado: any[] = [];
  topProductos: any[] = [];
  topCategorias: any[] = [];
  ventasPorCategoria: any[] = [];
  
  // Variables para almacenar gráficos
  ventasDiariasChart: any;
  ventasMensualesChart: any;
  productosChart: any;
  productosMontosChart: any;
  categoriasChart: any;
  ventasPorCategoriaChart: any;

  // Estado de carga
  loading = {
    ventasDiarias: false,
    ventasMensuales: false,
    topProductos: false,
    topCategorias: false,
    ventasPorCategoria: false
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatosVentas();
  }
  
  ngAfterViewInit(): void {
    // Verificamos periódicamente si los elementos del DOM están listos
    const checkInterval = setInterval(() => {
      let allReady = true;
      
      if (this.ventasPorDia.length > 0 && document.getElementById('ventasDiariasChart')) {
        this.aplicarFiltroDiario(this.filtroDiario);
      } else if (this.ventasPorDia.length > 0) {
        allReady = false;
      }
      
      if (this.ventasPorMes.length > 0 && document.getElementById('ventasMensualesChart')) {
        this.aplicarFiltroMensual(this.filtroMensual);
      } else if (this.ventasPorMes.length > 0) {
        allReady = false;
      }
      
      if (this.topProductos.length > 0 && document.getElementById('topProductosChart')) {
        this.crearGraficoProductos();
      } else if (this.topProductos.length > 0) {
        allReady = false;
      }
      
      if (this.topCategorias.length > 0 && document.getElementById('topCategoriasChart')) {
        this.crearGraficoCategorias();
      } else if (this.topCategorias.length > 0) {
        allReady = false;
      }
      
      if (this.ventasPorCategoria.length > 0 && document.getElementById('ventasPorCategoriaChart')) {
        this.crearGraficoVentasPorCategoria();
      } else if (this.ventasPorCategoria.length > 0) {
        allReady = false;
      }
      
      if (allReady) {
        clearInterval(checkInterval);
      }
    }, 200); // Aumentamos el tiempo para asegurar que los elementos estén disponibles
    
    // Limpiamos el intervalo después de 10 segundos para evitar loops infinitos
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  // Método para cargar los datos de ventas
  cargarDatosVentas(): void {
    // Cargar ventas por día
    this.loading.ventasDiarias = true;
    this.dashboardService.getVentasPorDia().subscribe({
      next: (data) => {
        this.ventasPorDia = data;
        this.loading.ventasDiarias = false;
        this.aplicarFiltroDiario(this.filtroDiario);
      },
      error: (error) => {
        console.error('Error al obtener ventas por día:', error);
        this.loading.ventasDiarias = false;
      }
    });

    // Cargar ventas por mes
    this.loading.ventasMensuales = true;
    this.dashboardService.getVentasPorMes().subscribe({
      next: (data) => {
        this.ventasPorMes = data;
        this.loading.ventasMensuales = false;
        this.aplicarFiltroMensual(this.filtroMensual);
      },
      error: (error) => {
        console.error('Error al obtener ventas por mes:', error);
        this.loading.ventasMensuales = false;
      }
    });
    
    // Cargar top productos
    this.loading.topProductos = true;
    this.dashboardService.getTopProductos().subscribe({
      next: (data) => {
        this.topProductos = data;
        this.loading.topProductos = false;
        setTimeout(() => {
          this.crearGraficoProductos();
          this.crearGraficoProductosMontos();
        }, 300);
      },
      error: (error) => {
        console.error('Error al obtener top productos:', error);
        this.loading.topProductos = false;
      }
    });

    // Cargar top categorías
    this.loading.topCategorias = true;
    this.dashboardService.getTopCategorias().subscribe({
      next: (data) => {
        this.topCategorias = data;
        this.loading.topCategorias = false;
        setTimeout(() => {
          this.crearGraficoCategorias();
        }, 300);
      },
      error: (error) => {
        console.error('Error al obtener top categorías:', error);
        this.loading.topCategorias = false;
      }
    });
    
    // Cargar ventas por categoría
    this.loading.ventasPorCategoria = true;
    this.dashboardService.getVentasPorCategoria().subscribe({
      next: (data) => {
        this.ventasPorCategoria = data;
        this.loading.ventasPorCategoria = false;
        setTimeout(() => {
          this.crearGraficoVentasPorCategoria();
        }, 300);
      },
      error: (error) => {
        console.error('Error al obtener ventas por categoría:', error);
        this.loading.ventasPorCategoria = false;
      }
    });
  }
  
  // Métodos para filtrar datos según periodos
  aplicarFiltroDiario(filtro: string): void {
    this.filtroDiario = filtro;
    if (!this.ventasPorDia || this.ventasPorDia.length === 0) return;
    
    const ahora = new Date();
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const primerDiaTrimestre = new Date(ahora.getFullYear(), Math.floor(ahora.getMonth() / 3) * 3, 1);
    const primerDiaAnio = new Date(ahora.getFullYear(), 0, 1);
    
    switch (filtro) {
      case 'mes': // Este mes
        this.ventasPorDiaFiltrado = this.ventasPorDia.filter(item => {
          const fecha = new Date(item._id.year, item._id.month - 1, item._id.day);
          return fecha >= primerDiaMes;
        });
        break;
      case 'trimestre': // Últimos 3 meses
        this.ventasPorDiaFiltrado = this.ventasPorDia.filter(item => {
          const fecha = new Date(item._id.year, item._id.month - 1, item._id.day);
          return fecha >= primerDiaTrimestre;
        });
        break;
      case 'anio': // Este año
        this.ventasPorDiaFiltrado = this.ventasPorDia.filter(item => {
          const fecha = new Date(item._id.year, item._id.month - 1, item._id.day);
          return fecha >= primerDiaAnio;
        });
        break;
      case 'todos': // Todos
        this.ventasPorDiaFiltrado = [...this.ventasPorDia];
        break;
    }
    
    this.crearGraficoVentasDiarias();
  }
  
  aplicarFiltroMensual(filtro: string): void {
    this.filtroMensual = filtro;
    if (!this.ventasPorMes || this.ventasPorMes.length === 0) return;
    
    const ahora = new Date();
    
    switch (filtro) {
      case 'anio': // Este año
        this.ventasPorMesFiltrado = this.ventasPorMes.filter(item => {
          return item._id.year === ahora.getFullYear();
        });
        break;
      case 'todos': // Todos
        this.ventasPorMesFiltrado = [...this.ventasPorMes];
        break;
    }
    
    this.crearGraficoVentasMensuales();
  }
  
  // MÉTODOS PARA CREAR GRÁFICOS

  crearGraficoVentasDiarias(): void {
    if (!this.ventasPorDiaFiltrado || this.ventasPorDiaFiltrado.length === 0) return;

    const ctx = document.getElementById('ventasDiariasChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.ventasDiariasChart) {
      this.ventasDiariasChart.destroy();
    }

    try {
      const labels = this.ventasPorDiaFiltrado.map(item => 
        `${item._id.day}/${item._id.month}`
      );
      const montos = this.ventasPorDiaFiltrado.map(item => item.total_ventas);
      const pedidos = this.ventasPorDiaFiltrado.map(item => item.num_pedidos);

      this.ventasDiariasChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ventas Diarias ($)',
              data: montos,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1
            },
            {
              label: 'Número de Pedidos',
              data: pedidos,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Ventas ($)'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Número de Pedidos'
              }
            }
          }
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de ventas diarias:', error);
    }
  }

  crearGraficoVentasMensuales(): void {
    if (!this.ventasPorMesFiltrado || this.ventasPorMesFiltrado.length === 0) return;

    const ctx = document.getElementById('ventasMensualesChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.ventasMensualesChart) {
      this.ventasMensualesChart.destroy();
    }

    try {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const labels = this.ventasPorMesFiltrado.map(item => `${meses[item._id.month - 1]} ${item._id.year}`);
      const montos = this.ventasPorMesFiltrado.map(item => item.total_ventas);

      this.ventasMensualesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas Mensuales ($)',
            data: montos,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Ventas ($)'
              }
            }
          }
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de ventas mensuales:', error);
    }
  }

  crearGraficoProductos(): void {
    if (!this.topProductos || this.topProductos.length === 0) return;

    const ctx = document.getElementById('topProductosChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de top productos");
      return;
    }

    if (this.productosChart) {
      this.productosChart.destroy();
    }

    try {
      // Preparar datos para el gráfico de Unidades
      const labels = this.topProductos.map(item => this.acortarNombre(item.producto_nombre, 20));
      const unidades = this.topProductos.map(item => item.unidades);
      
      // Crear configuración para gráfico de unidades
      this.productosChart = new Chart(ctx, {
        type: 'bar', // Usar 'bar' normal que soporta todos los navegadores
        data: {
          labels: labels,
          datasets: [{
            label: 'Unidades Vendidas',
            data: unidades,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', // Para hacerlo horizontal
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: false,
              text: 'Unidades Vendidas'
            },
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Unidades: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Unidades'
              },
              beginAtZero: true
            },
            y: {
              title: {
                display: false
              }
            }
          }
        }
      });

      this.cdr.detectChanges();
      console.log("Gráfico de productos (unidades) creado con éxito");
    } catch (error) {
      console.error('Error al crear el gráfico de productos (unidades):', error);
    }
  }
  
  crearGraficoProductosMontos(): void {
    if (!this.topProductos || this.topProductos.length === 0) return;

    const ctx = document.getElementById('topProductosMontosChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de top productos (montos)");
      return;
    }

    if (this.productosMontosChart) {
      this.productosMontosChart.destroy();
    }

    try {
      // Preparar datos para el gráfico de Montos
      const labels = this.topProductos.map(item => this.acortarNombre(item.producto_nombre, 20));
      const montos = this.topProductos.map(item => item.monto);
      
      // Crear configuración para gráfico de montos
      this.productosMontosChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Monto ($)',
            data: montos,
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: false,
              text: 'Montos de Venta'
            },
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  return `Monto: ${value.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  })}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Monto ($)'
              },
              beginAtZero: true
            },
            y: {
              title: {
                display: false
              }
            }
          }
        }
      });

      this.cdr.detectChanges();
      console.log("Gráfico de productos (montos) creado con éxito");
    } catch (error) {
      console.error('Error al crear el gráfico de productos (montos):', error);
    }
  }

  crearGraficoCategorias(): void {
    const ctx = document.getElementById('topCategoriasChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de categorías");
      return;
    }

    if (!this.topCategorias || this.topCategorias.length === 0) {
      console.warn('No hay datos para crear el gráfico de categorías');
      return;
    }

    if (this.categoriasChart) {
      this.categoriasChart.destroy();
    }

    try {
      // Tomamos las 5 categorías con mayor monto para el gráfico
      const topCategoriasPorMonto = [...this.topCategorias]
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 5);
      
      const labels = topCategoriasPorMonto.map(item => item.categoria_nombre);
      const montos = topCategoriasPorMonto.map(item => item.monto);
      
      console.log('Creando gráfico de categorías con datos:', {labels, montos});

      const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ];

      this.categoriasChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Monto ($)',
            data: montos,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
            hoverOffset: 15
          }]
        },
        options: {
          cutout: '50%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            title: {
              display: true,
              text: 'Distribución de Ventas por Categoría',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const formattedValue = value.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  });
                  const dataset = context.dataset;
                  const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${formattedValue} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      
      console.log('Gráfico de categorías creado exitosamente');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de categorías:', error);
    }
  }

  crearGraficoVentasPorCategoria(): void {
    const ctx = document.getElementById('ventasPorCategoriaChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de ventas por categoría");
      return;
    }
    
    if (!this.ventasPorCategoria || this.ventasPorCategoria.length === 0) {
      console.warn('No hay datos para crear el gráfico de ventas por categoría');
      return;
    }

    if (this.ventasPorCategoriaChart) {
      this.ventasPorCategoriaChart.destroy();
    }

    try {
      // Obtener top 5 categorías por ventas totales
      const top5Categorias = [...this.ventasPorCategoria]
        .sort((a, b) => b.total_ventas - a.total_ventas)
        .slice(0, 5);
      
      // Preparar datos en formato adecuado para gráfico de barras
      const labels = top5Categorias.map(cat => this.acortarNombre(cat.categoria_nombre, 15));
      const ventasData = top5Categorias.map(cat => cat.total_ventas);
      const unidadesData = top5Categorias.map(cat => cat.unidades);
      
      // Colores para las barras
      const ventasColor = 'rgba(54, 162, 235, 0.7)';
      const unidadesColor = 'rgba(255, 99, 132, 0.7)';
      
      // Crear gráfico de barras agrupadas
      this.ventasPorCategoriaChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ventas ($)',
              data: ventasData,
              backgroundColor: ventasColor,
              borderColor: ventasColor.replace('0.7', '1'),
              borderWidth: 1,
              yAxisID: 'ventas'
            },
            {
              label: 'Unidades',
              data: unidadesData,
              backgroundColor: unidadesColor,
              borderColor: unidadesColor.replace('0.7', '1'),
              borderWidth: 1,
              yAxisID: 'unidades'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Top 5 Categorías por Ventas',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw as number;
                  
                  if (label.includes('Ventas')) {
                    return `${label}: ${value.toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    })}`;
                  } else {
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: false
              }
            },
            'ventas': {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Ventas ($)'
              },
              beginAtZero: true
            },
            'unidades': {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Unidades'
              },
              beginAtZero: true,
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
      
      console.log('Gráfico de ventas por categoría creado exitosamente');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de ventas por categoría:', error);
    }
  }

  // Método para calcular el porcentaje
  calcularPorcentaje(monto: number): string {
    if (!this.ventasPorCategoria || this.ventasPorCategoria.length === 0) return '0.0%';
    
    const total = this.ventasPorCategoria
      .map(categoria => categoria.total_ventas)
      .reduce((suma, actual) => suma + actual, 0);
    
    if (total === 0) return '0.0%';
    
    const porcentaje = (monto / total) * 100;
    return porcentaje.toFixed(1) + '%';
  }

  // Método auxiliar para acortar nombres largos en los gráficos
  acortarNombre(nombre: string, maxLength: number): string {
    return nombre.length > maxLength ? nombre.substring(0, maxLength) + '...' : nombre;
  }

  // Método auxiliar para formatear montos
  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }
}