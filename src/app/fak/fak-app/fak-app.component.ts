import {Component, Inject, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
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

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar, public dialog: MatDialog) {
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
        const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: true, text: `invoice(${h}) owned by: ${transaction} ${transaction == account? "(You)": ""}` }});
      } else {
        const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: true , text: `no invoice (${h})`}});
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  private async encryptFak(fak: Fak) {
    return await this.web3Service.encrypt(fak.asJsonString());
  }

  private async decryptFak(msg: string) {
    let j = await this.web3Service.decrypt(msg);
    let fak = new Fak();
    fak.init(j);
    return fak;
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
    var encrypted = await this.encryptFak(fak);
    var decrypted = await this.decryptFak(encrypted);
    console.log('Encrypted fak:' + encrypted + decrypted)

    try {
      const deployedMetaCoin = await this.FakBlock.deployed();

      var transaction = await deployedMetaCoin.getOwner(h);
      if (this.web3Service.isAddress(transaction) && transaction !== "0x0000000000000000000000000000000000000000") {
        const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: false, text: `invoice(${h}) owned by: ${transaction}` }});
      } else {
        transaction = await deployedMetaCoin.createFack(h, '021', {from: account, gas: 1000000});
        if (transaction) {
          const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: true, text: "success" }});
        } else {
          const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: false, text: "error" }});
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
  template: `<h2 mat-dialog-title>{{data.ok?"OK":"ERROR"}}</h2>
  <mat-dialog-content>{{data.text}}</mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button [mat-dialog-close]="true">OK</button>
  </mat-dialog-actions>`,
})
export class ConfirmationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
