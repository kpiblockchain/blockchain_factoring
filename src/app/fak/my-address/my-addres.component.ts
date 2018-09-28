import {Component, Inject, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';

@Component({
  selector: 'my-addres',
  templateUrl: './my-addres.component.html',
})
export class MyAddresComponent implements OnInit {
  accounts: string[];
  account: string;

  constructor(private web3Service: Web3Service) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
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
}
