import { TestBed } from '@angular/core/testing';

import { ConfigTiendaService } from './config-tienda.service';

describe('ConfigTiendaService', () => {
  let service: ConfigTiendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigTiendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
