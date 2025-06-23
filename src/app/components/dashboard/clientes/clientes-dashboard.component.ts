import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DashboardService } from '../dashboard.service';
import { Chart, registerables } from 'chart.js/auto';
import { formatDate } from '@angular/common';

// Registrar componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-clientes-dashboard',
  templateUrl: './clientes-dashboard.component.html',
  styleUrls: ['./clientes-dashboard.component.css']
})
export class ClientesDashboardComponent implements OnInit, AfterViewInit {
  // Flag para verificar si estamos en navegador
  private isBrowser: boolean;

  // Variables para almacenar datos
  clientesNuevosPorMes: any[] = [];
  topClientes: any[] = [];
  clientesActivosInactivos: any[] = [];
  frecuenciaCompraClientes: any[] = [];
  clientesInactivos: any[] = [];

  // Estadísticas generales
  totalClientes: number = 0;
  clientesActivos: number = 0;
  clientesInactivosTotal: number = 0;
  nuevosClientesMesActual: number = 0;
  tasaRetencion: number = 0;
  
  // Para filtrado de tabla de frecuencia
  filtroFrecuencia: string = '';
  clientesFiltrados: any[] = [];
  
  // Período para clientes inactivos
  diasInactividad: number = 30;
  
  // Estados de carga
  loading = {
    nuevos: false,
    top: false,
    activosInactivos: false,
    frecuencia: false,
    inactivos: false
  };
  
  // Gráficos
  nuevosClientesChart: any;
  activosInactivosChart: any;
  topClientesChart: any;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.cargarDatosClientes();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Verificamos periódicamente si los elementos del DOM están listos
    const checkInterval = setInterval(() => {
      let allReady = true;
      
      if (this.clientesNuevosPorMes.length > 0 && document.getElementById('nuevosClientesChart')) {
        this.crearGraficoNuevosClientes();
      } else if (this.clientesNuevosPorMes.length > 0) {
        allReady = false;
      }
      
      if (this.clientesActivosInactivos.length > 0 && document.getElementById('activosInactivosChart')) {
        this.crearGraficoActivosInactivos();
      } else if (this.clientesActivosInactivos.length > 0) {
        allReady = false;
      }
      
      if (this.topClientes.length > 0 && document.getElementById('topClientesChart')) {
        this.crearGraficoTopClientes();
      } else if (this.topClientes.length > 0) {
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

  // Método para cargar todos los datos de clientes
  cargarDatosClientes(): void {
    // 1. Cargar clientes nuevos por mes
    this.loading.nuevos = true;
    this.dashboardService.getClientesNuevosPorMes().subscribe({
      next: (data) => {
        this.clientesNuevosPorMes = data;
        
        // Obtener nuevos clientes del mes actual
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1; // getMonth es base 0
        const añoActual = fechaActual.getFullYear();
        
        const clientesMesActual = this.clientesNuevosPorMes.find(item => 
          item._id.month === mesActual && item._id.year === añoActual
        );
        
        this.nuevosClientesMesActual = clientesMesActual ? clientesMesActual.nuevos_clientes : 0;
        
        this.loading.nuevos = false;
        if (this.isBrowser) {
          setTimeout(() => this.crearGraficoNuevosClientes(), 300);
        }
      },
      error: (error) => {
        console.error('Error al obtener clientes nuevos por mes:', error);
        this.loading.nuevos = false;
      }
    });
    
    // 2. Cargar top clientes
    this.loading.top = true;
    this.dashboardService.getTopClientes().subscribe({
      next: (data) => {
        this.topClientes = data;
        this.loading.top = false;
        if (this.isBrowser) {
          setTimeout(() => this.crearGraficoTopClientes(), 300);
        }
      },
      error: (error) => {
        console.error('Error al obtener top clientes:', error);
        this.loading.top = false;
      }
    });
    
    // 3. Cargar clientes activos vs inactivos por mes
    this.loading.activosInactivos = true;
    this.dashboardService.getClientesActivosInactivosPorMes().subscribe({
      next: (data) => {
        this.clientesActivosInactivos = data;
        
        // Calcular total de clientes del último mes disponible
        if (this.clientesActivosInactivos.length > 0) {
          const ultimoMes = this.clientesActivosInactivos[this.clientesActivosInactivos.length - 1];
          this.clientesActivos = ultimoMes.activos;
          this.clientesInactivosTotal = ultimoMes.inactivos;
          this.totalClientes = ultimoMes.activos + ultimoMes.inactivos;
          
          // Calcular tasa de retención (clientes activos / total clientes)
          this.tasaRetencion = this.totalClientes > 0 ? 
            Math.round((this.clientesActivos / this.totalClientes) * 100) : 0;
        }
        
        this.loading.activosInactivos = false;
        if (this.isBrowser) {
          setTimeout(() => this.crearGraficoActivosInactivos(), 300);
        }
      },
      error: (error) => {
        console.error('Error al obtener clientes activos e inactivos por mes:', error);
        this.loading.activosInactivos = false;
      }
    });
    
    // 4. Cargar frecuencia de compra por cliente
    this.loading.frecuencia = true;
    this.dashboardService.getFrecuenciaCompraClientes().subscribe({
      next: (data) => {
        this.frecuenciaCompraClientes = data;
        this.clientesFiltrados = [...this.frecuenciaCompraClientes];
        this.loading.frecuencia = false;
      },
      error: (error) => {
        console.error('Error al obtener frecuencia de compra de clientes:', error);
        this.loading.frecuencia = false;
      }
    });
    
    // 5. Cargar clientes inactivos
    this.cargarClientesInactivos();
  }

  // Método para cargar clientes inactivos según los días seleccionados
  cargarClientesInactivos(): void {
    this.loading.inactivos = true;
    this.dashboardService.getClientesInactivos(this.diasInactividad).subscribe({
      next: (data) => {
        this.clientesInactivos = data;
        this.loading.inactivos = false;
      },
      error: (error) => {
        console.error(`Error al obtener clientes inactivos de ${this.diasInactividad} días:`, error);
        this.loading.inactivos = false;
      }
    });
  }

  // Actualizar período de inactividad
  actualizarPeriodoInactividad(): void {
    if (this.diasInactividad < 1) {
      this.diasInactividad = 1;
    }
    this.cargarClientesInactivos();
  }

  // Filtrar tabla de frecuencia de compra
  filtrarClientes(): void {
    if (!this.filtroFrecuencia) {
      this.clientesFiltrados = [...this.frecuenciaCompraClientes];
      return;
    }
    
    const filtro = this.filtroFrecuencia.toLowerCase();
    this.clientesFiltrados = this.frecuenciaCompraClientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(filtro)
    );
  }
  
  // Ordenar tabla de frecuencia de compra
  ordenarPor(campo: string): void {
    this.clientesFiltrados = [...this.clientesFiltrados].sort((a, b) => {
      if (campo === 'nombre') {
        return a.nombre.localeCompare(b.nombre);
      } else if (campo === 'num_compras') {
        return b.num_compras - a.num_compras;
      } else if (campo === 'primera_compra') {
        return new Date(a.primera_compra).getTime() - new Date(b.primera_compra).getTime();
      } else if (campo === 'ultima_compra') {
        return new Date(b.ultima_compra).getTime() - new Date(a.ultima_compra).getTime();
      }
      return 0;
    });
  }

  // MÉTODOS PARA CREAR GRÁFICOS
  
  crearGraficoNuevosClientes(): void {
    if (!this.isBrowser || !this.clientesNuevosPorMes || this.clientesNuevosPorMes.length === 0) return;
    
    const ctx = document.getElementById('nuevosClientesChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de nuevos clientes");
      return;
    }
    
    if (this.nuevosClientesChart) {
      this.nuevosClientesChart.destroy();
    }
    
    try {
      // Ordenar datos cronológicamente
      const datosOrdenados = [...this.clientesNuevosPorMes].sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      });
      
      const labels = datosOrdenados.map(item => `${item.mes_nombre} ${item._id.year}`);
      const datos = datosOrdenados.map(item => item.nuevos_clientes);
      
      // Crear colores con degradado
      const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(75, 192, 192, 0.8)');
      gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');
      
      this.nuevosClientesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nuevos Clientes',
            data: datos,
            backgroundColor: gradient,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Evolución de Nuevos Clientes por Mes',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Nuevos clientes: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Nuevos Clientes'
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
      console.error('Error al crear el gráfico de nuevos clientes:', error);
    }
  }
  
  crearGraficoActivosInactivos(): void {
    if (!this.isBrowser || !this.clientesActivosInactivos || this.clientesActivosInactivos.length === 0) return;
    
    const ctx = document.getElementById('activosInactivosChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de clientes activos e inactivos");
      return;
    }
    
    if (this.activosInactivosChart) {
      this.activosInactivosChart.destroy();
    }
    
    try {
      // Ordenar datos cronológicamente
      const datosOrdenados = [...this.clientesActivosInactivos].sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        return a.mes - b.mes;
      });
      
      const labels = datosOrdenados.map(item => `${item.mes_nombre} ${item.anio}`);
      const datosActivos = datosOrdenados.map(item => item.activos);
      const datosInactivos = datosOrdenados.map(item => item.inactivos);
      
      this.activosInactivosChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Clientes Activos',
              data: datosActivos,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointBackgroundColor: 'rgba(54, 162, 235, 1)',
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Clientes Inactivos',
              data: datosInactivos,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointBackgroundColor: 'rgba(255, 99, 132, 1)',
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Clientes Activos vs. Inactivos por Mes',
              font: {
                size: 16
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Clientes'
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
      console.error('Error al crear el gráfico de clientes activos e inactivos:', error);
    }
  }
  //..............
  crearGraficoTopClientes(): void {
    if (!this.isBrowser || !this.topClientes || this.topClientes.length === 0) return;
    
    const ctx = document.getElementById('topClientesChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error("No se encontró el canvas para el gráfico de top clientes");
      return;
    }
    
    if (this.topClientesChart) {
      this.topClientesChart.destroy();
    }
    
    try {
      // Ordenar por compras totales (de mayor a menor)
      const datosOrdenados = [...this.topClientes].sort((a, b) => b.total_compras - a.total_compras);
      
      const labels = datosOrdenados.map(item => this.acortarNombre(item.nombre, 20));
      const datosCompras = datosOrdenados.map(item => item.total_compras);
      const datosNumCompras = datosOrdenados.map(item => item.num_compras);
      
      // Usar colores fijos para cada cliente
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
        'rgba(138, 220, 118, 0.7)'   // Verde lima
      ];
      
      // Asegurar que hay suficientes colores
      const backgroundColors = labels.map((_, i) => fixedColors[i % fixedColors.length]);
      
      this.topClientesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Compras ($)',
            data: datosCompras,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            title: {
              display: true,
              text: 'Top 10 Clientes por Volumen de Compras',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const index = context.dataIndex;
                  const value = context.raw as number;
                  return [
                    `Total: ${value.toLocaleString('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    })}`,
                    `Compras: ${datosNumCompras[index]}`
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Compras ($)'
              }
            }
          }
        }
      });
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al crear el gráfico de top clientes:', error);
    }
  }
  // Método auxiliar para acortar nombres largos
  acortarNombre(nombre: string, maxLength: number): string {
    return nombre.length > maxLength ? nombre.substring(0, maxLength) + '...' : nombre;
  }

  // Formato para fechas
  formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    
    try {
      const fecha = new Date(fechaStr);
      return formatDate(fecha, 'dd MMM yyyy', 'es-MX');
    } catch (error) {
      return fechaStr;
    }
  }

  // Generar clases de alerta según la fecha de última compra
  getClaseFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    
    try {
      const fechaUltimaCompra = new Date(fechaStr);
      const fechaActual = new Date();
      const diferenciaDias = Math.floor((fechaActual.getTime() - fechaUltimaCompra.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diferenciaDias > 60) return 'text-danger';
      if (diferenciaDias > 30) return 'text-warning';
      return 'text-success';
    } catch {
      return '';
    }
  }

  // Método para generar un ID para el elemento de correo electrónico basado en el ID del cliente
  generateMailtoId(clientId: string): string {
    return `mailto-${clientId.substring(clientId.length - 6)}`;
  }
}