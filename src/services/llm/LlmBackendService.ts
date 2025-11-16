import { executeSchedule } from "rxjs/internal/util/executeSchedule";
import { LlmOutputFormats } from "../../enums";
import LlmServiceBase, { type LlmService } from "./LlmServiceBase";
import { errorContext } from "rxjs/internal/util/errorContext";

const apiTestUrl = "http://localhost:5000/test"
const apiAskUrl = "http://localhost:5000/ask"

class LlmBackendService extends LlmServiceBase implements LlmService {
    name = "Backend LLM";
    outputFormat = LlmOutputFormats.PLAIN_TEXT;

    async prepareService(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch(apiTestUrl)
                .then(response => resolve(true), reason => reject(reason));
        });
    }

    async processTranscription(transcription: string): Promise<string> {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "input": `create a 5 sentence summary of the following text:\n${transcription}` }),
        };

        return new Promise((resolve, reject) => {
            fetch(apiAskUrl, requestOptions)
                .then(response => {
                    if (!response.ok)
                        throw new Error(`Response status: ${response.status}`);

                    response.json()
                        .then(obj => resolve(obj.response), reason => reject(reason));
                }).catch(error => console.error(error));
        });
    }
}

export default LlmBackendService;