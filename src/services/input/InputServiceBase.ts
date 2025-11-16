import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { PipelineComponentStates, type AudioFormatEnum, type PipelineComponentStateEnum } from "../../enums";

export interface InputService {
    name: string;
    outputFormat: AudioFormatEnum;
    readonly output: Observable<InputResult>;
    readonly outputs: ReplaySubject<InputResult>;
    readonly state: BehaviorSubject<PipelineComponentStateEnum>;

    initialize(): Promise<any>;
    getInput(): Promise<InputResult>;
}

abstract class InputServiceBase implements InputService {
    abstract name: string;
    abstract outputFormat: AudioFormatEnum;

    abstract prepareService(): Promise<boolean>;
    abstract getInput(): Promise<InputResult>;

    readonly output: Observable<InputResult>;
    readonly outputs: ReplaySubject<InputResult>;
    readonly state: BehaviorSubject<PipelineComponentStateEnum>;


    initialize(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.state.next(PipelineComponentStates.PREPARING);
            this.prepareService()
                .then(result => {
                    this.state.next(result === true ? PipelineComponentStates.READY : PipelineComponentStates.ERROR);
                    resolve(result);
                }, reason => {
                    this.state.next(PipelineComponentStates.ERROR);
                    throw new Error(reason);
                })
                .catch(reason => {
                    this.state.next(PipelineComponentStates.ERROR)
                    throw new Error(reason);
                });
        });
    }

    constructor() {
        this.state = new BehaviorSubject<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);
        this.outputs = new ReplaySubject<InputResult>(5);

        this.output = new Observable((subscriber) => {
            this.state.next(PipelineComponentStates.RUNNING);
            this.getInput()
                .then(result => {
                    this.state.next(PipelineComponentStates.READY);
                    this.outputs.next(result);
                    subscriber.next(result);
                }, reason => {
                    this.state.next(PipelineComponentStates.ERROR);
                    subscriber.error(reason);
                })
                .catch(reason => {
                    this.state.next(PipelineComponentStates.ERROR)
                    subscriber.error(reason);
                })
        });
    }
}

export class InputResult {
    format: AudioFormatEnum;
    data: any;
    timestamp: number;

    constructor(format: AudioFormatEnum, data: any) {
        this.format = format;
        this.data = data;
        this.timestamp = Date.now();
    }
}

export default InputServiceBase;