import {NgModule} from '@angular/core';
import {ContextList} from './context-list';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [ContextList],
  entryComponents: [ContextList],
  exports: [ContextList]
})
export class ContextListModule { }
