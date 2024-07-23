import { TestBed } from '@angular/core/testing';

import { CantizaService } from './cantiza.service';

describe('CantizaService', () => {
  let service: CantizaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CantizaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
