export declare type IdType = 'id' | 'ref-id' | 'href';
interface IdInfo {
    index: number;
    originalString: string;
    tag: string;
    type: IdType;
    value: string;
}
export declare function extractIds(string: string): IdInfo[];
interface OrbitInfo {
    tag: string;
    value: string;
}
export declare function extractOrbits(string: string): OrbitInfo[];
export {};
