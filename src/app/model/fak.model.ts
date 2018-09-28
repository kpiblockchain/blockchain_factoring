export class Fak {
    issuerId: string;
    payerId: string;
    invoiceNo: string;
    date: Date;
    amount: number;

    asString():string {
        return this.issuerId+'|'
        +this.payerId + '|'
        +this.invoiceNo + '|'
        +this.date + '|'
        +this.amount;
    }

    asJsonString(): string {
        return JSON.stringify({i:this.issuerId, p:this.payerId, n:this.invoiceNo, d:this.date, a:this.amount});
    }

    init(jstr: string) {
        let o = JSON.parse(jstr);
        this.issuerId = o.i;
        this.payerId = o.p;
        this.invoiceNo = o.n;
        this.date = o.d;
        this.amount = o.a;
    }

}