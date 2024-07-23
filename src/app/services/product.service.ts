import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() { }

  private products: any[] = [
    { id: 1, name: 'Product 1', price: 10, description: 'Description 1' },
    { id: 2, name: 'Product 2', price: 20, description: 'Description 2' },
    { id: 3, name: 'Product 3', price: 30, description: 'Description 3' },
  ];

  getProducts(): Observable<any[]> {
    return of(this.products);
  }
}
