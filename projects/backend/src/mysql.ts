// MySQL へのアクセス用クラス
import * as mysqlx from '@mysql/xdevapi';
import * as dto from './shared/dto';

export class MySQL {
    private _host: string;
    private _port: number;
    private _user: string;
    private _password: string;
    private _database: string;

    private _session: mysqlx.Session | null;

    public constructor(
        host: string,
        user: string,
        password: string,
        database: string,
        port = 33060
    ) {
        this._host = host;
        this._port = port;
        this._user = user;
        this._password = password;
        this._database = database;

        this._session = null;
    }

    public async connect(): Promise<void> {
        const config = {
            host: this._host,
            port: this._port,
            user: this._user,
            password: this._password,
            schema: this._database,
        };
        await mysqlx.getSession(config).then((session) => {
            this._session = session;
        });
    }

    public async commit(): Promise<void> {
        if (this._session) {
            await this._session.commit();
        }
    }

    public async disconnect(): Promise<void> {
        if (this._session) {
            await this._session.close();
            this._session = null;
        }
    }

    public async executeQuery(query: string): Promise<mysqlx.SqlResult> {
        if (!this._session) {
            throw new Error('Cannot execute query. Session is not connected.');
        }

        const result = await this._session.sql(query).execute();

        return result;
    }

    public async fetchCompanies(): Promise<dto.Company[]> {
        if (!this._session) {
            throw new Error('The session is not connected.');
        }

        const query =
            'SELECT id, name, securities_code, edinet_code, industry_id FROM companies ORDER BY id';
        const result = await this.executeQuery(query);
        const items = result.fetchAll();
        const companies: dto.Company[] = [];
        for (const item of items) {
            const id = Number(item[0]);
            const name = item[1] as string;
            const securitiesCode = item[2] as string;
            const edinetCode = item[3] as string;
            const industryId = Number(item[4]);
            const company = new dto.Company(id, name, securitiesCode, edinetCode, industryId);
            companies.push(company);
        }

        return companies;
    }

    public async createCompany(
        name: string,
        securitiesCode: string,
        edinetCode: string,
        industryId: number
    ): Promise<number> {
        if (!this._session) {
            throw new Error('The session is not connected.');
        }

        const query = `INSERT INTO companies (name, securities_code, edinet_code, industry_id) VALUES ("${name}", "${securitiesCode}", "${edinetCode}", ${industryId})`;
        const result = await this.executeQuery(query);
        if (result.getAffectedItemsCount() == 1) {
            return result.getAutoIncrementValue() as number;
        } else {
            return 0;
        }
    }

    public async updateCompany(company: dto.Company): Promise<number> {
        if (!this._session) {
            throw new Error('The session is not connected.');
        }
        if (company.id == 0) {
            throw new Error('The company ID is not set.');
        }

        const companiesTable = this._session.getSchema(this._database).getTable('companies');
        const result = await companiesTable
            .update()
            .set('name', company.name)
            .set('securities_code', company.securitiesCode)
            .set('edinet_code', company.edinetCode)
            .set('industry_id', company.industryId)
            .where(`id = ${company.id}`)
            .execute();
        return result.getAffectedItemsCount() as number;
    }

    public async createNonExistentCompanies(companies: dto.Company[]): Promise<number> {
        if (!this._session) {
            throw new Error('The session is not connected.');
        }

        let createdCount = 0;
        const dbCompanies = await this.fetchCompanies();
        const dbCompaniesMap = new Map<string, dto.Company>();
        dbCompanies.forEach((c) => {
            dbCompaniesMap.set(c.edinetCode, c);
        });
        for (const company of companies) {
            const dbCompany = dbCompaniesMap.get(company.edinetCode);
            if (!dbCompany) {
                await this.createCompany(
                    company.name,
                    company.securitiesCode,
                    company.edinetCode,
                    company.industryId
                );
                createdCount++;
            }
        }
        return createdCount;
    }

    /*
    public async fetchMapImage(level: string, datetime: Date): Promise<Buffer | null> {
        if (!this._session) {
            throw new Error("The session is not connected.");
        }

        // 指定された日時において有効なマップデータのうち、最も最新のものを取得する。
        const dtStr = toDatetimeString(datetime);
        const query = `SELECT image FROM maps WHERE level = "${level}" AND valid_from <= "${dtStr}" AND enabled = TRUE ORDER BY valid_from DESC LIMIT 1`;
        const result = await this.executeQuery(query);
        const item = result.fetchOne();
        if (!item) {
            return null;
        }

        const buf = item[0] as Buffer;

        return buf;
    }

    private _createMapDataFromQueryResult(item: mysqlx.Scalar[]): FetchMapData {
        const id = Number(item[0]);
        const level = item[1] as string;
        const detail = item[2] as string;
        const lenx = Math.round(Number(item[3]));
        const lenz = Math.round(Number(item[4]));
        const x = Number(item[5]);
        const z = Number(item[6]);
        const validFrom = new Date(item[7] as string);
        const fetchMapData = new FetchMapData(id, level, detail, lenx, lenz, x, z, validFrom);
        return fetchMapData;
    }

    public async createMapData(mapData: FetchMapData): Promise<number> {
        if (!this._session) {
            throw new Error("The session is not connected.");
        }

        const query = `INSERT INTO maps (level, detail, lenx, lenz, x, z, image, valid_from, enabled) VALUES (` +
            `"${mapData.level}", "${mapData.detail}", ${mapData.lenx}, ${mapData.lenz}, ` +
            `${mapData.x}, ${mapData.z}, "", "${toDatetimeString(mapData.validFrom)}", TRUE` +
            `)`;
        const result = await this.executeQuery(query);
        if (result.getAffectedItemsCount() == 1) {
            return result.getAutoIncrementValue() as number;
        } else {
            return 0;
        }
    }

    public async updateMapData(id: number, mapData: FetchMapData): Promise<number> {
        if (!this._session) {
            throw new Error("The session is not connected.");
        }

        // id は mapData インスタンスにも設定されているが、念のため引数として明示的に指定させる。
        const query = `UPDATE maps SET ` +
            `level = "${mapData.level}", detail = "${mapData.detail}", lenx = ${mapData.lenx}, lenz = ${mapData.lenz}, ` +
            `x = ${mapData.x}, z = ${mapData.z}, valid_from = "${toDatetimeString(mapData.validFrom)}" ` +
            `WHERE id = ${id}`;
        const result = await this.executeQuery(query);

        return result.getAffectedItemsCount() as number;
    }

    public async updateMapImage(id: number, mapImage: Buffer): Promise<number> {
        if (!this._session) {
            throw new Error("The session is not connected.");
        }

        const mapsTable = this._session.getSchema("playlogviewer3").getTable("maps");
        const result = await mapsTable.update().set("image", mapImage).where(`id = ${id}`).execute();
        return result.getAffectedItemsCount() as number;
    }

    public async deleteMap(id: number): Promise<number> {
        if (!this._session) {
            throw new Error("The session is not connected.");
        }

        // 直接 delete するのは危険なので、すぐ戻せるよう enabled フラグを OFF にするだけにしておく
        const query = `Update maps SET enabled = FALSE WHERE id = ${id}`;
        const result = await this.executeQuery(query);

        return result.getAffectedItemsCount() as number;
    }

    public async deleteText(id: string): Promise<boolean> {
        if (!this._session) {
            throw new Error("The session is not connected.");
        }

        const query = `DELETE FROM texts WHERE id = "${id}"`;
        const result = await this.executeQuery(query);
        if (result.getAffectedItemsCount() == 1) {
            return true;
        } else {
            return false;
        }
    }
    */
}

/**
 * 日付インスタンスを MySQL の datetime 型の文字列に変換します。
 * フォーマットは "YYYY-MM-DD HH:mm:ss" です。但し、UTC の日時になります。
 * @param dt Date 型の日付インスタンス
 * @returns MySQL 用の datetime 型文字列(UTC)
 */
export function toDatetimeString(dt: Date): string {
    const year = padNumber(dt.getUTCFullYear(), 4);
    const month = padNumber(dt.getUTCMonth() + 1, 2);
    const date = padNumber(dt.getUTCDate(), 2);
    const hours = padNumber(dt.getUTCHours(), 2);
    const minutes = padNumber(dt.getUTCMinutes(), 2);
    const seconds = padNumber(dt.getUTCSeconds(), 2);
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

function padNumber(num: number, size: number): string {
    return num.toString().padStart(size, '0');
}
