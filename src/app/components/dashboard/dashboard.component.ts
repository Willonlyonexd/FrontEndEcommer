import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'ventas'; // Tab activo por defecto
  public userName: string = 'Willonlyonexd';
  public currentDate: string = '2025-06-20 01:42:30';
  
  constructor() { }

  ngOnInit(): void {
    // Configuración inicial
    this.updateDateTime();
  }

  // Cambiar tab activo
  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  // Actualizar fecha y hora
  updateDateTime(): void {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    
    this.currentDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}