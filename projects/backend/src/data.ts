import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

export class Data {
    public static readCompanyData(path: string): void {
        const data = fs.readFileSync(path, 'utf8');
        const records = parse(data);
        console.log(`CSV data counts:${records.length}`);
        const companies: Company[] = [];
        for (const record of records) {
            const edinetCode = record[0];
            const name = record[6];
            const industryName = record[10];
            const securitiesCode = record[11];
            if (edinetCode && name && industryName && securitiesCode) {
                const company = new Company(name, securitiesCode, edinetCode, industryName);
                companies.push(company);
            }
        }
        console.log(`Company counts:${companies.length}`);
    }
}

class Company {
    public name: string;
    public securitiesCode: string;
    public edinetCode: string;
    public industryName: string;

    public constructor(
        name: string,
        securitiesCode: string,
        edinetCode: string,
        industryName: string
    ) {
        this.name = name;
        this.securitiesCode = securitiesCode;
        this.edinetCode = edinetCode;
        this.industryName = industryName;
    }
}
