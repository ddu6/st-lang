export declare type IdType = 'id' | 'ref-id' | 'href';
export declare function extractIdsWithTag(string: string): {
    value: string;
    tag: string;
    type: IdType;
    originalString: string;
}[];
export declare function extractIdsWithIndex(string: string): {
    value: string;
    index: number;
    type: "href" | "id" | "ref-id";
    originalString: string;
}[];
export declare function extractOrbitsWithTag(string: string): {
    value: string;
    tag: string;
}[];
