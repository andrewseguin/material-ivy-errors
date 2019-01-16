import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {ErrorCount} from './error-count/error-count';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableModule, MatPaginatorModule, MatSortModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    ErrorCount,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
