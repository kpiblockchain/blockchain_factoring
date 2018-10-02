import {Component, Inject, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import {Fak} from '../../model/fak.model'
import { IpfsService } from '../../util/ipfs.service';


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
  fakList = [];
  duplicates = {};

  constructor(private web3Service: Web3Service, private ipfsService: IpfsService) {
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
    let hashes = await deployedFakBlock.getFakByOwner(this.account);
    for(let i in hashes) {
      let hash = hashes[i];
      await this.addToList(deployedFakBlock, hash);
    }

    const events = deployedFakBlock.Create({});
    events.watch((err, result) => {
      console.log([result]);
      if(result.args.owner == this.account && ! this.duplicates.hasOwnProperty(result.args.fakHash)) {
        this.addToList(deployedFakBlock, result.args.fakHash);
      }
    });
  }

  async addToList(deployedFakBlock, hash: string) {
    let ipfsAdddr = await deployedFakBlock.getIpfsHash(hash);
    try {
      let encEata = await this.ipfsService.load(ipfsAdddr);
      let data = await this.decryptFak(encEata);
      this.fakList.push(data);
    } catch (e) {
      console.log(["TODO show error",e]);
    }
    this.duplicates[ipfsAdddr] = true;
  }

  getHash(fak: Fak) {
    var hash = this.web3Service.hash(fak.asString());
    return  `0x${hash.slice(0,6)}...${hash.slice(-4)}`
  }

  private async decryptFak(msg: string) {
    let j = await this.web3Service.decrypt(msg);
    let fak = new Fak();
    fak.init(j);
    return fak;
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

