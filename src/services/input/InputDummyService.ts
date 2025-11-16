import { AudioFormats } from "../../enums";
import InputServiceBase, { type InputService, InputResult } from "./InputServiceBase";

class InputDummyService extends InputServiceBase implements InputService {
    name = "Dummy Input";
    outputFormat = AudioFormats.WAV;

    prepareService(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), 100)
        })
    }

    async getInput(): Promise<InputResult> {
        const response = await fetch("/dummyAudioFile.mp3");
        const blob = await response.blob();
        const file = new File([blob], "dummyAudioFile.mp3", { type: blob.type });

        return new InputResult(this.outputFormat, file);
    }
}

export default InputDummyService;