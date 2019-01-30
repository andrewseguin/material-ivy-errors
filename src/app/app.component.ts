import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {take, map} from 'rxjs/operators';
import {UploadJson} from './upload-json/upload-json';
import {ParsedResult, flattenResults} from './util/flatten-results.js';
import {Observable, Subscription} from 'rxjs';

interface UploadedJson {
  id: string;
  name: string;
  json?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  uploadedJsonDocument = this.db.collection('uploadedJson');

  errors: ParsedResult[];
  filteredErrors: ParsedResult[];

  filter = new FormControl();

  name: string;

  loadingErrors: Subscription;

  uploadedJsonFiles: Observable<string[]>;

  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private storage: AngularFireStorage,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
    this.uploadedJsonFiles = this.db.collection<{name: string}>('uploadedJsonFiles').valueChanges()
        .pipe(map(values => {
          return values.map(v => v['name']).sort();
        }));
    this.route.queryParamMap.subscribe(queryParamMap => {
      const name = queryParamMap.get('name');
      if (name) {
        this.name = name;
        this.errors = [];
        this.storage.ref(name).getDownloadURL().pipe(take(1)).subscribe(url => {
          this.loadingErrors = this.http.get(url).subscribe(json => {
            this.errors = flattenResults(json as JSON).filter(r => r.value.status === 'FAILED');
            this.loadingErrors = null;
          });
        });
      } else {
        if (this.loadingErrors) {
          this.loadingErrors.unsubscribe();
          this.loadingErrors = null;
        }

        this.name = null;
        this.errors = null;
      }
    });
  }

  uploadJson() {
    this.dialog.open(UploadJson, {minWidth: '400px'}).afterClosed()
      .subscribe((name: string) => {
        if (name) {
          this.db.collection('uploadedJsonFiles').add({name});
          this.router.navigate(['.'], {queryParams: {name}});
        }
      });
  }
}
