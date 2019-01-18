import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatRippleModule, MatSortModule, MatTableModule, MatButtonModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {environment} from 'src/environments/environment';
import {AppComponent} from './app.component';
import {ErrorCount} from './error-count/error-count';
import {UploadJsonModule} from './upload-json/upload-json.module';

@NgModule({
  declarations: [
    AppComponent,
    ErrorCount,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    HttpClientModule,
    MatDialogModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    MatRippleModule,
    UploadJsonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
