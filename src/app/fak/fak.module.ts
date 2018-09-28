import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UtilModule} from '../util/util.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatButtonModule,
  MatCardModule, MatDatepickerModule, MatDialogModule,
  MatFormFieldModule,
  MatInputModule, MatNativeDateModule, MatProgressBarModule,
  MatSnackBarModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {ConfirmationDialog, FakAppComponent} from './fak-app/fak-app.component';
import {MyAddresComponent} from './my-address/my-addres.component';
import {FakFormComponent} from './fak-form/fak-form.component';
import {FakListComponent} from './fak-list/fak-list.component'

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
    UtilModule,
    FlexLayoutModule
  ],
  entryComponents: [ConfirmationDialog],
  declarations: [MyAddresComponent, FakAppComponent, FakFormComponent, FakListComponent, ConfirmationDialog],
  exports: [MyAddresComponent, FakAppComponent, FakFormComponent]
})
export class FakModule {
}
