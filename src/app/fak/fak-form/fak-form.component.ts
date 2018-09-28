import {Component, Input} from '@angular/core';
import {Fak} from '../../model/fak.model'
import {FormControl} from '@angular/forms';

@Component({
  selector: 'fak-form',
  templateUrl: './fak-form.component.html',
})
export class FakFormComponent {
    @Input() model: Fak;
}
