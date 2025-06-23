import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionTiendaComponent } from './configuracion-tienda.component';

describe('ConfiguracionTiendaComponent', () => {
  let component: ConfiguracionTiendaComponent;
  let fixture: ComponentFixture<ConfiguracionTiendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfiguracionTiendaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfiguracionTiendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
