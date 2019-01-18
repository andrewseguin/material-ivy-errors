import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {UploadJson} from './upload-json/upload-json';
import {ParsedResult, flattenResults} from './util/flatten-results.js';

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

  loading = false;

  constructor(private cd: ChangeDetectorRef,
              private db: AngularFirestore,
              private http: HttpClient,
              private storage: AngularFireStorage,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
    this.route.queryParamMap.subscribe(queryParamMap => {
      const name = queryParamMap.get('name');
      if (name) {
        this.name = name;
        this.storage.ref(name).getDownloadURL().pipe(take(1)).subscribe(url => {
          this.loading = true;
          this.http.get(url).subscribe(json => {
            this.errors = flattenResults(json as JSON).filter(r => r.value.status === 'FAILED');
            this.loading = false;
          });
        });
      }
    });
  }

  uploadJson() {
    this.dialog.open(UploadJson, {minWidth: '400px'}).afterClosed()
      .subscribe((name: string) => {
        if (name) {
          this.router.navigate(['.'], {queryParams: {name}});
        }
      });
  }
}
