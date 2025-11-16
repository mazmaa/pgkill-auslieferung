import PipelineComponent from "./PipelineComponent"
import LabelledContainer from "../LabelledContainer"
import { useAppContext, PipelineComponents } from "../../context/AppContextProvider"
import Xarrow from "react-xarrows";
import { ServiceManager } from "../../services/ServiceManager";
import { PipelineComponentStates, type PipelineComponentStateEnum } from "../../enums";
import { useEffect, useState } from "react";
import InputMicrophoneService from "../../services/input/InputMicrophoneService";
import MicrophoneControl from "../settings/MicrophoneControl";

function onRunPipeline() {
    ServiceManager.instance.llmService.output.subscribe(output => console.log(output));
}

function getMicrophoneInputService(): InputMicrophoneService {
    return ServiceManager.instance.inputServices.find(is => is instanceof InputMicrophoneService)!;
}

function Pipeline() {
    const appContext = useAppContext();
    const [inputState, setInputState] = useState<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);
    const [asrState, setAsrState] = useState<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);
    const [llmState, setLlmState] = useState<PipelineComponentStateEnum>(PipelineComponentStates.NOT_READY);

    // react to input state changes
    useEffect(() => {
        const sub = ServiceManager.instance.inputState.subscribe(state => setInputState(state));
        return () => sub.unsubscribe();
    })

    // react to asr state changes
    useEffect(() => {
        const sub = ServiceManager.instance.asrState.subscribe(state => setAsrState(state));
        return () => sub.unsubscribe();
    })

    // react to llm state changes
    useEffect(() => {
        const sub = ServiceManager.instance.llmState.subscribe(state => setLlmState(state));
        return () => sub.unsubscribe();
    })

    return (
        <>
            <LabelledContainer label={"Pipeline"}>
                <div className="flex flex-col gap-6">

                    <div className='flex flex-row  gap-24 justify-center'>

                        <PipelineComponent state={inputState}
                            label='Input'
                            content={"🎙"}
                            isSelected={appContext.selectedComponent === PipelineComponents.INPUT}
                            onClick={() => appContext.setSelectedComponent(PipelineComponents.INPUT)} />

                        <PipelineComponent state={asrState}
                            label='ASR'
                            content={"🎛️"}
                            isSelected={appContext.selectedComponent === PipelineComponents.ASR}
                            onClick={() => appContext.setSelectedComponent(PipelineComponents.ASR)} />

                        <PipelineComponent state={llmState}
                            label='LLM'
                            content={"🧠"}
                            isSelected={appContext.selectedComponent === PipelineComponents.LLM}
                            onClick={() => appContext.setSelectedComponent(PipelineComponents.LLM)} />

                        <Xarrow start="Input" end="ASR" color="black"></Xarrow>
                        <Xarrow start="ASR" end="LLM" color="black"></Xarrow>
                    </div>

                    <div className="flex flex-row gap-1">
                        <button onClick={onRunPipeline}>Run</button>
                        <MicrophoneControl microphoneService={getMicrophoneInputService()} />
                    </div>
                </div>
            </LabelledContainer>
        </>
    );
}

export default Pipeline