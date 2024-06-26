export const industries: { [key: number]: string } = {
    1: '水産・農林業',
    2: '鉱業',
    3: '建設業',
    4: '食料品',
    5: '繊維製品',
    6: 'パルプ・紙',
    7: '化学',
    8: '医薬品',
    9: '石油・石炭製品',
    10: 'ゴム製品',
    11: 'ガラス・土石製品',
    12: '鉄鋼',
    13: '非鉄金属',
    14: '金属製品',
    15: '機械',
    16: '電気機器',
    17: '輸送用機器',
    18: '精密機器',
    19: 'その他製品',
    20: '電気・ガス業',
    21: '陸運業',
    22: '海運業',
    23: '空運業',
    24: '倉庫・運輸関連業',
    25: '情報・通信業',
    26: '卸売業',
    27: '小売業',
    28: '銀行業',
    29: '証券、商品先物取引業',
    30: '保険業',
    31: 'その他金融業',
    32: '不動産業',
    33: 'サービス業',
    99: 'その他',
};

export default industries;

export function getIndustryIdFromName(industryName: string): number {
    for (const [id, name] of Object.entries(industries)) {
        if (name === industryName) {
            return parseInt(id, 10);
        }
    }
    return 99;
}

export function getIndustryNameFromId(industryId: number): string {
    return industries[industryId] || 'その他';
}
