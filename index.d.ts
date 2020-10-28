import { Task, SingleObject, FileZiperAndUploaderType } from './types/index';
export declare class FileZiperAndUploader implements FileZiperAndUploaderType {
    task: Task;
    compilerList: Task;
    allList: Task;
    constructor(options: Task | SingleObject);
    createFolder: (compilation: any, opt: SingleObject, totalZipName: string[]) => Promise<string>;
    apply(compiler: any): void;
    zipEntireFolder(compilation: any, opt: Task | SingleObject): Promise<string>;
    send(zipPath: string, opt: SingleObject): Promise<string>;
}
