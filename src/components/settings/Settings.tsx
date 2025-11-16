import { PipelineComponents, useAppContext } from "../../context/AppContextProvider";
import LabelledContainer from "../LabelledContainer"
import AsrSettings from "./AsrSettings";
import InputSettings from "./InputSettings";
import LlmSettings from "./LlmSettings";

function Settings() {
    const appContext = useAppContext();
    return (
        <>
            <LabelledContainer label={"Settings"}>
                {(appContext.selectedComponent === PipelineComponents.ASR) && <AsrSettings />}
                {(appContext.selectedComponent === PipelineComponents.LLM) && <LlmSettings />}
                {(appContext.selectedComponent === PipelineComponents.INPUT) && <InputSettings />}
            </LabelledContainer>
        </>
    );
}

export default Settings