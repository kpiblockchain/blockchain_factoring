import {Injectable} from '@angular/core';
import {Buffer} from 'buffer';
import {decode, encode} from 'bs58'
import * as IPFS from 'ipfs-api';

@Injectable()
export class IpfsService {
    private ipfs: any;

    constructor() {
        this.ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    }

    public async save(data: string): Promise<string> {
        return this.ipfs.add(new Buffer(data)).then((multihash) => {
            const decoded = decode(multihash[0].hash);
            console.log({hash: multihash[0].hash, decoded: decoded})
            return `0x${Buffer.from(decoded.slice(2)).toString('hex')}`;
        });
    }

    public async load(digest: string): Promise<string> {
        const hashBytes = Buffer.from('1220'+digest.slice(2), 'hex');
        const cid = encode(hashBytes);
        console.log({hash: cid, decoded: hashBytes})
        return this.ipfs.get(cid).then((data) => {
            return data[0].content.toString();
        });
    } 
 
}
 