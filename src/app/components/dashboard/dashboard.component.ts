import { Component, OnInit } from '@angular/core';
import Chart, { ChartType } from 'chart.js/auto';
import { EstadisticaService } from '../../services/estadistica.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public token = localStorage.getItem('token'); // Recupera el token
  totalVentas: any[] = []; // Ahora es un array para manejar datos agrupados por mes
  cantidadVentas: number = 0;
  detalleVentasPorEstado: any[] = []; // Detalle por estado
  ingresosGenerados: number = 0;
  detalleIngresosPorProducto: any[] = []; // Detalle por producto
  productosMasVendidos: any[] = [];



  constructor(private estadisticaService: EstadisticaService) { }

  ngOnInit(): void {
    console.log(this.token)
    this.loadStatistics();
  }

  async loadStatistics() {
    try {
      const filtro = 'todos'; // Filtro dinámico para estadísticas
      const agruparPorMes = true; // Activar agrupación por mes para total de ventas

      // Llamadas a la API en paralelo
      const [ventas, cantidad, ingresos, productos] = await Promise.all([
        this.estadisticaService.getTotalVentas(filtro, agruparPorMes, this.token).toPromise(),
        this.estadisticaService.getCantidadVentas(filtro, this.token).toPromise(),
        this.estadisticaService.getIngresosGenerados(filtro, this.token).toPromise(),
        this.estadisticaService.getProductosMasVendidos(5, this.token).toPromise(), // Obtiene los 5 productos más vendidos
      ]);

      // Asignación de datos con valores seguros
      this.totalVentas = ventas || [];
      this.cantidadVentas = cantidad?.totalVentas || 0;
      this.detalleVentasPorEstado = cantidad?.detallePorEstado || [];
      this.ingresosGenerados = ingresos?.ingresos || 0;
      this.detalleIngresosPorProducto = ingresos?.detallePorProducto || [];
      this.productosMasVendidos = productos || [];

      this.loadCharts();
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  loadCharts() {
    // Total Ventas por Mes
    const meses = this.totalVentas.map(v => this.getNombreMes(v.mes));
    const ventasTotales = this.totalVentas.map(v => v.total);
    this.createChart('totalVentasChart', 'bar', meses, ventasTotales, "Total Ventas", "rgba(255, 99, 132, 0.5)");


    // Cantidad de Ventas por Estado (Simplificado en la leyenda, detallado en el tooltip)
    const estados = this.detalleVentasPorEstado.map(v => v.estado);
    const cantidades = this.detalleVentasPorEstado.map(v => v.cantidad);
    this.createChart('cantidadVentasChart', 'doughnut', estados, cantidades, "Ventas por Estado", ["#ff6384", "#36a2eb", "#ffce56"], null, true, this.detalleVentasPorEstado);


    // Ingresos Generados por Producto
    const productosIngresos = this.detalleIngresosPorProducto.map(p => p._id);
    const ingresosTotales = this.detalleIngresosPorProducto.map(p => p.ingresos);
    this.createChart('ingresosGeneradosChart', 'line', productosIngresos, ingresosTotales, "Ingresos por Producto", "rgba(75, 192, 192, 1)", "rgba(75, 192, 192, 0.2)");

    // Productos Más Vendidos
    if (this.productosMasVendidos.length > 0) {
      this.createChart(
        'productosMasVendidosChart',
        'pie',
        this.productosMasVendidos.map(p => `${p.producto} - ${p.totalVendidos} vendidos ($${p.totalGenerado})`),
        this.productosMasVendidos.map(p => p.totalVendidos),
        "Producto Más Vendido",
        ["#ff6384", "#36a2eb", "#ffce56"]
      );
    }
  }

  createChart(
    elementId: string,
    type: ChartType,
    labels: string[],
    data: number[],
    label: string,
    bgColor: any,
    borderColor: any = null,
    customTooltip: boolean = false,
    detalleData: any[] = []
  ) {
    const canvasElement = document.getElementById(elementId) as HTMLCanvasElement;
    if (!canvasElement) return;

    new Chart(canvasElement, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: bgColor,
          borderColor: borderColor || bgColor,
          borderWidth: borderColor ? 1 : 0
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                if (customTooltip && detalleData.length > 0) {
                  const index = context.dataIndex;
                  const detalle = detalleData[index];
                  return `${detalle.estado}: ${detalle.cantidad} ventas (${detalle.mes} ${detalle.anio})`;
                }
                return `${context.label}: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }


  getNombreMes(numeroMes: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[numeroMes - 1];
  }
}
