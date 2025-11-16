import AsrServiceBase, { type AsrService } from "./AsrServiceBase";
import { AudioFormats } from "../../enums";
import type { InputResult } from "../input/InputServiceBase";
import WebWorkerWrapper from "../WebWorkerWrapper";


class AsrWav2VecService extends AsrServiceBase implements AsrService {

    name = "wav2vec-base-960h";
    supportedFormats = [AudioFormats.MP3, AudioFormats.WAV];

    SAMPLE_RATE = 16000;
    AUDIO_LEN_S = 6

    worker = new WebWorkerWrapper("src/services/webworker/Wav2VecWebWorker.ts");

    async prepareService(): Promise<boolean> {
        return await this.worker.initialize();
    }

    async transcribeFile(file: InputResult): Promise<string> {
        if (this.worker.initialized === false)
            throw new Error(`Cannot run inference on model \"${this.name}\" because webworker is not initialized`);

        // preprocess here because web workers dont support AudioContext
        const preProcessedInput = await this.preProcessAudioFile(file.data);
        const transcription = await this.worker.runInference(preProcessedInput);
        return transcription;
    }


    transcribeChunk(chunk: InputResult): Promise<string> {
        throw new Error("Method not implemented.");
    }

    async preProcessAudioFile(file: File) {
        const audioContext = new AudioContext();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Resampling auf SAMPLE_RATE & Kürzen auf AUDIO_LEN_S Sekunden
        const resampledBuffer = await this.resampleAudio(audioBuffer, this.SAMPLE_RATE, audioBuffer.duration);
        const processedData = resampledBuffer.getChannelData(0);
        return processedData;
        return processedData.slice(0, this.SAMPLE_RATE * this.AUDIO_LEN_S);
    }

    async resampleAudio(audioBuffer: AudioBuffer, targetSampleRate: number, targetDuration: number) {
        const offlineCtx = new OfflineAudioContext(
            1, targetSampleRate * targetDuration, targetSampleRate
        );
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start();
        return await offlineCtx.startRendering();
    }
}

export default AsrWav2VecService;