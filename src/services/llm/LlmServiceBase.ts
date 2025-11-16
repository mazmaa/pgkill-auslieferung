import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { ServiceManager } from "../ServiceManager";
import { type LlmOutputFormatEnum, type PipelineComponentStateEnum, PipelineComponentStates } from "../../enums";


export interface LlmService {
    name: string;
    outputFormat: LlmOutputFormatEnum;
    readonly output: Observable<string>;
    readonly outputs: ReplaySubject<LlmResult>;
    readonly state: BehaviorSubject<PipelineComponentStateEnum>;

    initialize(): Promise<any>;
    processTranscription(transcription: string): Promise<string>;
}

abstract class LlmServiceBase implements LlmService {

    readonly abstract name: string;
    abstract outputFormat: LlmOutputFormatEnum;

    abstract prepareService(): Promise<boolean>;
    abstract processTranscription(transcription: string): Promise<string>;

    readonly output: Observable<string>;
    readonly outputs: ReplaySubject<LlmResult>;
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
        this.outputs = new ReplaySubject<LlmResult>(5)

        this.output = new Observable((subscriber) => {
            ServiceManager.instance.asrService.output.subscribe({
                next: async (transcription) => {
                    try {
                        this.state.next(PipelineComponentStates.RUNNING);
                        const llmResult = await this.processTranscription(transcription);
                        this.state.next(PipelineComponentStates.READY);
                        this.outputs.next(new LlmResult(llmResult));
                        subscriber.next(llmResult);
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

export class LlmResult {
    timestamp: number;
    content: string;

    constructor(content: string) {
        this.content = content;
        this.timestamp = Date.now();
    }
}

export default LlmServiceBase;