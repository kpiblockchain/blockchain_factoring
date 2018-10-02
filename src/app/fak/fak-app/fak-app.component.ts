import {Component, Inject, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import {IpfsService} from '../../util/ipfs.service';
import {Fak} from '../../model/fak.model'
import {MAT_DIALOG_DATA, MatDialog, MatSnackBar} from '@angular/material';



declare let require: any;
const fakblock_artifacts = require('../../../../build/contracts/FakBlock.json');


@Component({
  selector: 'fak-app',
  templateUrl: './fak-app.component.html',
  styleUrls: ['./fak-app.component.css']
})
export class FakAppComponent implements OnInit {
  FakBlock: any;
  loading: boolean;

  model_add = new Fak();
  model_check = new Fak();

  status = '';

  constructor(private web3Service: Web3Service, private ipfsService: IpfsService,
    private matSnackBar: MatSnackBar, public dialog: MatDialog) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.web3Service.artifactsToContract(fakblock_artifacts)
      .then((FakBlockAbstraction) => {
        this.FakBlock = FakBlockAbstraction;
      });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  async checkInvoice(fak: Fak) {
    if (!this.FakBlock) {
      this.setStatus('FakBlock is not loaded, unable to send transaction');
      return;
    }
    let account = await this.web3Service.getAccount();
    var h = this.web3Service.hash(fak.asString());
    
    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedMetaCoin = await this.FakBlock.deployed();
      const transaction = await deployedMetaCoin.getOwner(h);
      console.log([transaction]);
      if (this.web3Service.isAddress(transaction) && transaction !== "0x0000000000000000000000000000000000000000") {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: '600px',
          data: { 
            ok: false,
            title: 'Faktura istnieje już w systemie!',
            subtitle: `Kod faktury odpowiadający podanym przez Ciebie danym: ${h}`,
            text: `istnieje już w systemie. Taka faktura została już dodana przez użytkownika o adresie: ${transaction}`
          }
        });
      } else {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: '600px',
          data: { ok: true ,
            title: 'Faktura nie istnieje w systemie!',
            subtitle: `Kod faktury odpowiadający podanym przez Ciebie danym: ${h}`,
            text:`nie istnieje jeszcze w systemie.`
          }
        });
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  private async encryptFak(fak: Fak) {
    return await this.web3Service.encrypt(fak.asJsonString());
  }

  async sendInvoice(fak: Fak) {
    if (!this.FakBlock) {
      this.setStatus('FakBlock is not loaded, unable to send transaction');
      return;
    }
    let account = await this.web3Service.getAccount();
    if (!this.web3Service.isAddress(account)) {
      this.setStatus('Select yours account');
      return;
    }

    this.loading = true;
    var h = this.web3Service.hash(fak.asString());
    console.log('Sending hash:' + h);
    
    

    try {
      var encrypted = await this.encryptFak(fak);
    
      var ipfsHash = await this.ipfsService.save(encrypted);

      const deployedMetaCoin = await this.FakBlock.deployed();

      var transaction = await deployedMetaCoin.getOwner(h);
      if (this.web3Service.isAddress(transaction) && transaction !== "0x0000000000000000000000000000000000000000") {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: '600px',
          data: {
            ok: false, 
            title: 'Nie udało się dodać faktury!',
            subtitle: `Kod faktury odpowiadający podanym przez Ciebie danym: ${h}`,
            text:`istnieje już w systemie. Taka faktura została już dodana przez użytkownika o adresie:
            ${transaction}`
          }
        });
      } else {
        transaction = await deployedMetaCoin.createFack(h, ipfsHash, {from: account, gas: 1000000});
        if (transaction) {
          const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '600px',
            data: {
              ok: true,
              title: "Udało się dodać fakturę!",
              subtitle: `Dodałeś do systemu:`,
              fak: fak,
              text: `W systemie będzie ona występowała jako kod: ${h}`
            }
          });
        } else {
          const dialogRef = this.dialog.open(ConfirmationDialog, {
            width: '600px',
            data: {
              ok: false, 
              title: 'Nie udało się dodać faktury!',
              subtitle: `Kod faktury odpowiadający podanym przez Ciebie danym: ${h}`
            }
          });
        }
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
      this.loading = false;
    }
    this.loading = false;
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  styleUrls: ['./confirmation-dialog.component.css'],
  template: `<h2 mat-dialog-title [ngClass]="{'error': data.ok == false}">{{data.title?data.title:"ERROR"}}</h2>
  <mat-dialog-content>
    <div fxLayout="column" >
      <div class="subtitle">{{data.subtitle}}</div>
      <div class="fak" *ngIf="data.fak" fxLayout="column">
        <div>Faktura nr {{data.fak.invoiceNo}} z dnia {{data.fak.date|date:'d/M/yy'}}</div>
        <div fxLayout="row"><div>NIP faktoranta:</div><div fxFlex></div><div>{{data.fak.issuerId}}</div></div>
        <div fxLayout="row"><div>NIP płatnika:</div><div fxFlex></div><div>{{data.fak.payerId}}</div></div>
        <div fxLayout="row"><div>Wartość brutto:</div><div fxFlex></div><div>{{data.fak.amount}}</div></div>
      </div>
      <div>{{data.text}}</div>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-raised-button [mat-dialog-close]="true">OK</button>
  </mat-dialog-actions>`,
})
export class ConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
