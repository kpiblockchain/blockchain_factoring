import {Component, Inject, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import {Fak} from '../../model/fak.model'


declare let require: any;
const fakblock_artifacts = require('../../../../build/contracts/FakBlock.json');

@Component({
  selector: 'fak-list',
  templateUrl: './fak-list.component.html',
  styleUrls: ['./fak-list.component.css']
})
export class FakListComponent implements OnInit {
  accounts: string[];
  account: string;
  FakBlock: any;
  loading: boolean;

  hashes: string[];

  constructor(private web3Service: Web3Service) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    this.web3Service.artifactsToContract(fakblock_artifacts)
      .then((FakBlockAbstraction) => {
        this.FakBlock = FakBlockAbstraction;
      });

    this.watchAccount();
  }

  async initList() {
    if (!this.FakBlock) {
      return;
    }
    const deployedFakBlock = await this.FakBlock.deployed();
    this.hashes = await deployedFakBlock.getFakByOwner(this.account);

    console.log(this);
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      if(accounts.length > 0) {
        this.account = accounts[0];
        this.initList();
      }
    });
  }

  
}

