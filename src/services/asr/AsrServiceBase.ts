import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { ServiceManager } from "../ServiceManager";
import { PipelineComponentStates, type AudioFormatEnum, type PipelineComponentStateEnum } from "../../enums";
import type { InputResult } from "../input/InputServiceBase";


export interface AsrService {
    name: string;
    supportedFormats: Array<AudioFormatEnum>;
    readonly output: Observable<string>;
    readonly outputs: ReplaySubject<AsrResult>;
    readonly state: BehaviorSubject<PipelineComponentStateEnum>;

    initialize(): Promise<boolean>;
    transcribeFile(file: InputResult): Promise<string>;
    transcribeChunk(chunk: InputResult): Promise<string>;
}

abstract class AsrServiceBase implements AsrService {

    abstract name: string;
    abstract supportedFormats: Array<AudioFormatEnum>;

    abstract prepareService(): Promise<boolean>;
    abstract transcribeFile(file: InputResult): Promise<string>;
    abstract transcribeChunk(chunk: InputResult): Promise<string>;

    readonly output: Observable<string>;
    readonly outputs: ReplaySubject<AsrResult>;
    readonly state: BehaviorSubject<PipelineComponentStateEnum>;


    initialize(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.state.next(PipelineComponentStates.PREPARING);
            this.prepareService()
                .then(result => {
                    this.state.next(result === true ? PipelineComponentStates.READY : PipelineComponentStates.ERROR);
                    resolve(result);
                })
                .catch(reason => {
                    this.state.next(PipelineComponentStates.ERROR)
                    throw new Error(reason);
                });
        });
    }

    constructor() {
        this.state = new BehaviorSubject<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);
        this.outputs = new ReplaySubject<AsrResult>(5);

        this.output = new Observable((subscriber) => {
            ServiceManager.instance.inputService.output.subscribe({
                next: async (audio) => {
                    try {
                        this.state.next(PipelineComponentStates.RUNNING);
                        const transcription = await this.transcribeFile(audio);
                        this.state.next(PipelineComponentStates.READY);
                        this.outputs.next(new AsrResult(transcription))
                        subscriber.next(transcription);
                    } catch (error) {
                        this.state.next(PipelineComponentStates.ERROR);
                        subscriber.error(error);
                    }
                },
                error: (e) => {
                    subscriber.error(e);
                }
            });
        });
    }
}

export class AsrResult {
    timestamp: number;
    content: string;

    constructor(content: string) {
        this.content = content;
        this.timestamp = Date.now();
    }
}

export default AsrServiceBase;