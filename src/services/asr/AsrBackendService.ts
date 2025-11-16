import { AudioFormats } from "../../enums";
import type { InputResult } from "../input/InputServiceBase";
import AsrServiceBase, { type AsrService } from "./AsrServiceBase";

const apiTestUrl = "http://localhost:5000/test"
const apiTranscribeUrl = "http://localhost:5000/transcribe"

class AsrBackendService extends AsrServiceBase implements AsrService {
    name = "Backend ASR";
    supportedFormats = [AudioFormats.MP3, AudioFormats.WAV];

    async prepareService(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch(apiTestUrl)
                .then(response => resolve(true), reason => reject(reason));
        });
    }
    async transcribeFile(file: InputResult): Promise<string> {
        if (file.format !== AudioFormats.MP3)
            throw new Error(`${this.name} only supports formats ${this.supportedFormats.join(", ")}`);

        const formData = new FormData();
        formData.append("file", file.data);

        return new Promise((resolve, reject) => {
            fetch(apiTranscribeUrl, {
                method: "POST",
                body: formData
            }).then(response => {
                if (!response.ok)
                    throw new Error(`Response status: ${response.status}`);

                response.json()
                    .then(obj => resolve(obj.transcript), reason => reject(reason));
            }).catch(error => console.error(error));
        })
    }
    async transcribeChunk(chunk: InputResult): Promise<string> {
        throw new Error("Method not implemented.");
    }

}

export default AsrBackendService;