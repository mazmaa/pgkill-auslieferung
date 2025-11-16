import AsrServiceBase, { type AsrService } from "./AsrServiceBase";
import { AudioFormats } from "../../enums";
import type { InputResult } from "../input/InputServiceBase";

class AsrDummyService extends AsrServiceBase implements AsrService {

    name = "Dummy ASR";
    supportedFormats = [AudioFormats.MP3, AudioFormats.WAV];

    prepareService(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), 1700)
        })
    }

    transcribeFile(file: InputResult): Promise<string> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(`transcript of ${file}`), 1000);
        })
    }

    transcribeChunk(chunk: InputResult): Promise<string> {
        throw new Error("Method not implemented.");
    }
}

export default AsrDummyService;