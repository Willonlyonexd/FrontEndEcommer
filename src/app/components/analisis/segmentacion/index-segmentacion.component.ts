import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { EstadisticaService } from '../../../services/estadistica.service';
import Chart from 'chart.js/auto';

interface ClienteConsolidado {
  cantidadcompra: number;
  costo: number;
  idcliente: string;
  nombre: string;
  segmento: string;
  ultima_compra: string | null;
}

interface ResumenSegmentacion {
  last_update: string;
  segments: {[key: string]: number};
  success: boolean;
  total_customers: number;
}

@Component({
  selector: 'app-index-segmentacion',
  templateUrl: './index-segmentacion.component.html',
  styleUrls: ['./index-segmentacion.component.css']
})
export class IndexSegmentacionComponent implements OnInit, AfterViewInit {
  @ViewChild('graficoSegmentos') graficoSegmentosCanvas!: ElementRef<HTMLCanvasElement>;
  graficoSegmentos: Chart | null = null;

  clientesFiltrados: any[] = [];
  segmentos: string[] = [];
  segmentoSeleccionado: string = 'Todos';
  ordenColumna: string = '';
  ordenAscendente: boolean = true;
  clientesConsolidado: ClienteConsolidado[] = [];
  resumenSegmentacion: ResumenSegmentacion | null = null;

  // Propiedades para paginación
  itemsPorPagina: number = 10;
  paginaActual: number = 1;
  totalItems: number = 0;
  Math = Math;

  // Colores para los segmentos (consistentes con los de la tabla)
  coloresSegmentos: {[key: string]: string} = {
    'VIP': '#1e88e5',
    'Fieles': '#43a047',
    'Ocasionales': '#fb8c00',
    'Dormidos': '#e53935',
    'Sin segmento': '#757575'
  };

  constructor(
    private _estadisticaService: EstadisticaService
  ){}

  ngOnInit(): void {
    this.getSegmentacionResumen();
    this.getClientesNormalizado();
    this.getConsolidado();
  }

  ngAfterViewInit(): void {
    // Intentamos crear el gráfico después de que la vista se haya inicializado
    setTimeout(() => {
      if (this.resumenSegmentacion) {
        this.createChart();
      }
    }, 500);
  }

  getSegmentacionResumen(){
    this._estadisticaService.getSegmentacionResumen().subscribe(
      (response: any) => {
        console.log('resumen',response);
        this.resumenSegmentacion = response;

        // Si la vista ya está lista, creamos el gráfico
        if (this.graficoSegmentosCanvas) {
          this.createChart();
        }
      },
      error => {
        console.error("Error en la solicitud:", error);
      }
    )
  }

  createChart(): void {
    if (!this.resumenSegmentacion || !this.graficoSegmentosCanvas) return;

    // Destruir gráfico anterior si existe
    if (this.graficoSegmentos) {
      this.graficoSegmentos.destroy();
    }

    const ctx = this.graficoSegmentosCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const segmentData = this.resumenSegmentacion.segments;
    const labels = Object.keys(segmentData);
    const data = Object.values(segmentData);

    // Colores para cada segmento
    const backgroundColors = labels.map(label => this.coloresSegmentos[label] || '#cccccc');

    this.graficoSegmentos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('1)', '0.8)')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Distribución de Clientes por Segmento',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = Number(context.raw) || 0;
                const total = Number(context.chart.data.datasets[0].data.reduce((a, b) => Number(a) + Number(b), 0)) || 1;
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  getClientesNormalizado(){
    this._estadisticaService.getClientesNormalizados().subscribe(
      response => {
        console.log('normalizado',response);
      },
      error => {
        console.error("Error en la solicitud:", error);
      }
    )
  }

  getConsolidado(){
    this._estadisticaService.getConsolidado().subscribe(
      (response: ClienteConsolidado[]) => {
        console.log('consolidado',response);
        this.clientesConsolidado = response;

        // Ahora TypeScript sabe que segmento es una string
        this.segmentos = ['Todos', ...new Set(response.map(cliente => cliente.segmento))];

        this.aplicarFiltros();
      },
      error => {
        console.error("Error en la solicitud:", error);
      }
    )
  }

  // Método para cambiar el segmento seleccionado
  filtrarPorSegmento(segmento: string) {
    this.segmentoSeleccionado = segmento;
    this.paginaActual = 1; // Reiniciar la paginación
    this.aplicarFiltros();
  }

  // Método para ordenar por una columna
  ordenarPor(columna: string) {
    if (this.ordenColumna === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenColumna = columna;
      this.ordenAscendente = true;
    }
    this.aplicarFiltros();
  }

  // Método para cambiar de página
  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  // Método para aplicar filtros y ordenamiento
  aplicarFiltros() {
    // Filtrar por segmento
    let clientesFiltrados = this.clientesConsolidado;
    if (this.segmentoSeleccionado !== 'Todos') {
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        cliente.segmento === this.segmentoSeleccionado
      );
    }

    // Ordenar por columna
    if (this.ordenColumna) {
      clientesFiltrados.sort((a, b) => {
        const valorA = a[this.ordenColumna as keyof ClienteConsolidado];
        const valorB = b[this.ordenColumna as keyof ClienteConsolidado];

        if (typeof valorA === 'string' && typeof valorB === 'string') {
          return this.ordenAscendente
            ? valorA.localeCompare(valorB)
            : valorB.localeCompare(valorA);
        } else {
          return this.ordenAscendente
            ? (Number(valorA) || 0) - (Number(valorB) || 0)
            : (Number(valorB) || 0) - (Number(valorA) || 0);
        }
      });
    }

    this.totalItems = clientesFiltrados.length;
    this.clientesFiltrados = clientesFiltrados;
  }

  // Método para obtener los elementos de la página actual
  obtenerElementosPagina() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.clientesFiltrados.slice(inicio, fin);
  }

  // Método para obtener el número total de páginas
  get totalPaginas(): number {
    return Math.ceil(this.totalItems / this.itemsPorPagina);
  }

  // Método para generar el array de páginas para la navegación
  get paginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      if (
        i === 1 ||
        i === this.totalPaginas ||
        (i >= this.paginaActual - 1 && i <= this.paginaActual + 1)
      ) {
        paginas.push(i);
      } else if (i === this.paginaActual - 2 || i === this.paginaActual + 2) {
        paginas.push(-1); // Usaremos -1 para representar los "..."
      }
    }
    return [...new Set(paginas)]; // Eliminar duplicados
  }

  // Método para obtener el color según el segmento
  getSegmentoClass(segmento: string): string {
    switch (segmento) {
      case 'VIP': return 'segmento-vip';
      case 'Fieles': return 'segmento-fieles';
      case 'Ocasionales': return 'segmento-ocasionales';
      case 'Dormidos': return 'segmento-dormidos';
      case 'Sin segmento': return 'segmento-sin';
      default: return '';
    }
  }
}
