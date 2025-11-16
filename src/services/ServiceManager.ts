import AsrBackendService from "./asr/AsrBackendService";
import AsrDummyService from "./asr/AsrDummyService";
import { InputResult, type InputService } from "./input/InputServiceBase";
import LlmBackendService from "./llm/LlmBackendService";
import LlmDummyService from "./llm/LlmDummyService";
import { PipelineComponentStates, type PipelineComponentStateEnum } from "../enums";
import { BehaviorSubject, scan, Subscription } from "rxjs";
import type { AsrResult, AsrService } from "./asr/AsrServiceBase";
import type { LlmResult, LlmService } from "./llm/LlmServiceBase";
import InputDummyService from "./input/InputDummyService";
import InputFileService from "./input/InputFileService";
import InputMicrophoneService from "./input/InputMicrophoneService";
import AsrWav2VecService from "./asr/AsrWav2VecService";
import WebLlmService from "./llm/WebLlmService";

export class ServiceManager {
    readonly inputServices: InputService[];
    readonly asrServices: AsrService[];
    readonly llmServices: LlmService[];

    inputService!: InputService;
    asrService!: AsrService;
    llmService!: LlmService;

    readonly inputState: BehaviorSubject<PipelineComponentStateEnum>;
    readonly asrState: BehaviorSubject<PipelineComponentStateEnum>;
    readonly llmState: BehaviorSubject<PipelineComponentStateEnum>;

    readonly inputOutputs: BehaviorSubject<any[]>;
    readonly asrOutputs: BehaviorSubject<AsrResult[]>;
    readonly llmOutputs: BehaviorSubject<LlmResult[]>;

    private inputStateSubscription: Subscription | null = null;
    private asrStateSubscription: Subscription | null = null;
    private llmStateSubscription: Subscription | null = null;
    private inputOutputsSubscription: Subscription | null = null;
    private asrOutputsSubscription: Subscription | null = null;
    private llmOutputsSubscription: Subscription | null = null;

    private static _instance: ServiceManager | null = null;
    public static get instance(): ServiceManager {
        if (ServiceManager._instance === null)
            ServiceManager._instance = new ServiceManager();

        return ServiceManager._instance;
    }


    private constructor() {

        // Add all ASR Services here
        this.asrServices = [
            new AsrDummyService(),
            new AsrBackendService(),
            new AsrWav2VecService(),
        ];

        // Add all LLM Services here
        this.llmServices = [
            new LlmDummyService(),
            new LlmBackendService(),
            new WebLlmService(),
        ];

        // Add all Input Services here
        this.inputServices = [
            new InputDummyService(),
            new InputFileService(),
            new InputMicrophoneService(),
        ]

        this.inputState = new BehaviorSubject<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);
        this.asrState = new BehaviorSubject<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);
        this.llmState = new BehaviorSubject<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);

        this.inputOutputs = new BehaviorSubject<any[]>([]);
        this.asrOutputs = new BehaviorSubject<AsrResult[]>([]);
        this.llmOutputs = new BehaviorSubject<LlmResult[]>([]);

        this.setInputService(this.inputServices[0]);
        this.setAsrService(this.asrServices[0]);
        this.setLlmService(this.llmServices[0]);
    }

    private setInputService(inputService: InputService) {
        this.inputStateSubscription?.unsubscribe()
        this.inputOutputsSubscription?.unsubscribe();

        this.inputStateSubscription = inputService.state
            .subscribe(state => this.inputState.next(state));
        this.inputOutputsSubscription = inputService.outputs
            .pipe(scan((prev: InputResult[], item) => prev.concat(item), []))
            .subscribe(output => this.inputOutputs.next(output));

        this.inputService = inputService;
        this.inputService.initialize();
    }

    private setAsrService(asrService: AsrService) {
        this.asrStateSubscription?.unsubscribe()
        this.asrOutputsSubscription?.unsubscribe()

        this.asrStateSubscription = asrService.state
            .subscribe(state => this.asrState.next(state));
        this.asrOutputsSubscription = asrService.outputs
            .pipe(scan((prev: AsrResult[], item) => prev.concat(item), []))
            .subscribe(outputs => this.asrOutputs.next(outputs));

        this.asrService = asrService;
        this.asrService.initialize();
    }

    private setLlmService(llmService: LlmService) {
        this.llmStateSubscription?.unsubscribe()
        this.llmOutputsSubscription?.unsubscribe();

        this.llmStateSubscription = llmService.state
            .subscribe(state => this.llmState.next(state));
        this.llmOutputsSubscription = llmService.outputs
            .pipe(scan((prev: LlmResult[], item) => prev.concat(item), []))
            .subscribe(output => this.llmOutputs.next(output));

        this.llmService = llmService;
        this.llmService.initialize();
    }

    setInputServiceByName(name: string) {
        let service = this.inputServices.find(s => s.name === name);
        if (service === undefined)
            throw new Error(`No Input service has name ${name}`);

        this.setInputService(service)
    }

    setAsrServiceByName(name: string) {
        let service = this.asrServices.find(s => s.name === name);
        if (service === undefined)
            throw new Error(`No ASR service has name ${name}`);

        this.setAsrService(service)
    }

    setLlmServiceByName(name: string) {
        let service = this.llmServices.find(s => s.name === name);
        if (service === undefined)
            throw new Error(`No LLM service has name ${name}`);

        this.setLlmService(service)
    }
}