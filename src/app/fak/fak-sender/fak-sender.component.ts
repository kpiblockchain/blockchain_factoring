import {Component, Inject, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import {MAT_DIALOG_DATA, MatDialog, MatSnackBar} from '@angular/material';
import {FormControl} from '@angular/forms';


declare let require: any;
const fakblock_artifacts = require('../../../../build/contracts/FakBlock.json');

@Component({
  selector: 'app-fak-sender',
  templateUrl: './fak-sender.component.html',
  styleUrls: ['./fak-sender.component.css']
})
export class FakSenderComponent implements OnInit {
  accounts: string[];
  account: string;
  FakBlock: any;
  loading: boolean;

  model = {
    issuerId: '',
    payerId: '',
    invoiceNo: '',
    date: new FormControl(new Date()),
    amount: 0.0,
  };

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

    this.watchAccount();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      if(accounts.length > 0) {
        this.account = accounts[0];
      }
    });
  }


  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  async checkInvoice() {
    if (!this.FakBlock) {
      this.setStatus('FakBlock is not loaded, unable to send transaction');
      return;
    }

    var h = this.web3Service.hash(this.model.issuerId+'|'
      +this.model.payerId + '|'
      +this.model.invoiceNo + '|'
      +this.model.date + '|'
      +this.model.amount
    );
    console.log('Sending:' + h);
    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedMetaCoin = await this.FakBlock.deployed();
      const transaction = await deployedMetaCoin.getOwner(h);
      console.log([transaction]);
      if (this.web3Service.isAddress(transaction) && transaction !== "0x0000000000000000000000000000000000000000") {
        const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: true, text: `invoice(${h}) owned by: ${transaction} ${transaction == this.account? "(You)": ""}` }});
      } else {
        const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: true , text: `no invoice (${h})`}});
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async sendInvoice() {
    if (!this.FakBlock) {
      this.setStatus('FakBlock is not loaded, unable to send transaction');
      return;
    }
    this.loading = true;
    var h = this.web3Service.hash(this.model.issuerId+'|'
      +this.model.payerId + '|'
      +this.model.invoiceNo + '|'
      +this.model.date + '|'
      +this.model.amount
    );
    console.log('Sending:' + h);

  try {
      const deployedMetaCoin = await this.FakBlock.deployed();

      var transaction = await deployedMetaCoin.getOwner(h);
      if (this.web3Service.isAddress(transaction) && transaction !== "0x0000000000000000000000000000000000000000") {
        const dialogRef = this.dialog.open(ConfirmationDialog, {data: { ok: false, text: `invoice(${h}) owned by: ${transaction}` }});
      } else {
        transaction = await deployedMetaCoin.createFack(h, {from: this.accounts[0], gas: 100000});
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
