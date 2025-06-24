import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MovieDetailed } from '../interfaces/movie-detailed.interface';

@Component({
  selector: 'app-movie-detail-dialog',
  templateUrl: './movie-detail-dialog.component.html',
  styleUrls: ['./movie-detail-dialog.component.scss']
})
export class MovieDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MovieDetailed) {}
}
