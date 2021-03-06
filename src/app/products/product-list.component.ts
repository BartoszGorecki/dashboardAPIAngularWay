import { Component, ChangeDetectionStrategy } from "@angular/core";

import { EMPTY, BehaviorSubject, Observable, combineLatest } from "rxjs";

import { Product } from "./product";
import { ProductService } from "./product.service";
import { ProductCategoryService } from "../product-categories/product-category.service";
import { catchError, map } from "rxjs/operators";

@Component({
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = "Product List";
  errorMessage = "";
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithCRUD$,
    this.categorySelectedAction$
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter(product =>
        selectedCategoryId ? selectedCategoryId === product.categoryId : true
      )
    ),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  vm$ = combineLatest([this.products$, this.categories$]).pipe(
    map(([products, categories]) => ({ products, categories }))
  );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    this.productService.addNewProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

  onDelete(product: Product): void {
    this.productService.deleteProduct(product);
  }

  onUpdate(product: Product): void {
    this.productService.updateProduct(product);
  }
}
