import { AudioFormats, type AudioFormatEnum } from "../../enums";
import InputServiceBase, { InputResult } from "./InputServiceBase";

class InputFileService extends InputServiceBase {
    name = "File Input";
    outputFormat = AudioFormats.MP3;
    file: File | null = null;

    async prepareService(): Promise<boolean> {
        return !!this.file;
    }

    async getInput(): Promise<InputResult> {
        return new InputResult(AudioFormats.MP3, this.file)
    }
}

export default InputFileService;