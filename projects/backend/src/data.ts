import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as mysql from './mysql';
import * as dto from './shared/dto';
import * as industries from './shared/industries';

function readCompanyData(path: string): dto.Company[] {
    const data = fs.readFileSync(path, 'utf8');
    const records = parse(data);
    let fullDataCompaniesCount = 0;
    const companies: dto.Company[] = [];
    for (const record of records) {
        const edinetCode = record[0];
        const name = record[6];
        const industryName = record[10];
        const industryId = industries.getIndustryIdFromName(industryName);
        const securitiesCode = record[11];
        if (edinetCode && name && industryName && securitiesCode) {
            const company = new dto.Company(0, name, securitiesCode, edinetCode, industryId);
            companies.push(company);
            fullDataCompaniesCount++;
        }
    }
    console.log(
        `CSV data counts:${records.length} Full data companies counts:${fullDataCompaniesCount}`
    );
    return companies;
}

export async function createCompaniesFromCsvToDatabase(
    path: string,
    m: mysql.MySQL
): Promise<number> {
    const companies = readCompanyData(path);
    const createdCount = await m.createNonExistentCompanies(companies);
    console.log(`Created ${createdCount} companies.`);
    m.commit();
    return createdCount;
}
