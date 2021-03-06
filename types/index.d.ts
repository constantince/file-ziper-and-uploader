export interface SingleObject {
    url: string;
    zipName: string;
    target: RegExp | 'all';
    token?: 'auth7yttx8nh0';
    operator?: string;
    version?: string;
}
export declare type Comp<T = void> = {
    (compilation: any, callback: () => T): T;
};
export declare type ZiperAll<T, U> = {
    (compilation: any, opt: T): U;
};
export declare type Task = SingleObject[];
export interface FileZiperAndUploaderType {
    task: Task;
    compilerList: Task;
    allList: Task;
    zipEntireFolder: ZiperAll<Task | SingleObject, Promise<string>>;
    send: (zipPath: string, opt: SingleObject) => Promise<string>;
    apply: (compiler: any) => void;
    createFolder: (compilation: any, opt: SingleObject, totalZipName: string[]) => Promise<string>;
}
