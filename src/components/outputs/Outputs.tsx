import { PipelineComponents, useAppContext } from "../../context/AppContextProvider";
import LabelledContainer from "../LabelledContainer"
import AsrOutputs from "./AsrOutputs";
import LlmOutputs from "./LlmOutputs";
import InputOutputs from "./InputOutputs";

function Outputs() {
    const appContext = useAppContext();
    return (
        <>
            <LabelledContainer label={"Outputs"}>
                {(appContext.selectedComponent === PipelineComponents.ASR) && <AsrOutputs />}
                {(appContext.selectedComponent === PipelineComponents.LLM) && <LlmOutputs />}
                {(appContext.selectedComponent === PipelineComponents.INPUT) && <InputOutputs />}
            </LabelledContainer>
        </>
    );
}

export default Outputs