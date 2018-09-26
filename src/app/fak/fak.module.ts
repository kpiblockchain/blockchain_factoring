import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmationDialog, FakSenderComponent} from './fak-sender/fak-sender.component';
import {UtilModule} from '../util/util.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {
  MatButtonModule,
  MatCardModule, MatDatepickerModule, MatDialogModule,
  MatFormFieldModule,
  MatInputModule, MatNativeDateModule, MatProgressBarModule,
  MatSnackBarModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    UtilModule
  ],
  entryComponents: [ConfirmationDialog],
  declarations: [FakSenderComponent, ConfirmationDialog],
  exports: [FakSenderComponent]
})
export class FakModule {
}
