export class Company {
    public id: number;
    public name: string;
    public securitiesCode: string;
    public edinetCode: string;
    public industryId: number;
    public constructor(
        id: number,
        name: string,
        securitiesCode: string,
        edinetCode: string,
        industryId: number
    ) {
        this.id = id;
        this.name = name;
        this.securitiesCode = securitiesCode;
        this.edinetCode = edinetCode;
        this.industryId = industryId;
    }
}
