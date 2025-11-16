import { LlmOutputFormats } from "../../enums";
import LlmServiceBase, { type LlmService } from "./LlmServiceBase";

class LlmDummyService extends LlmServiceBase implements LlmService {

    name = "Dummy LLM";
    outputFormat = LlmOutputFormats.PLAIN_TEXT;

    prepareService(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), 1000)
        })
    }

    processTranscription(transcription: string): Promise<string> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(`llm result of ${transcription}`), 2000);
        })
    }
}

export default LlmDummyService;