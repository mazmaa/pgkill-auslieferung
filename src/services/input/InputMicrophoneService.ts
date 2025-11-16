import { BehaviorSubject } from "rxjs";
import { AudioFormats } from "../../enums";
import InputServiceBase, { InputResult } from "./InputServiceBase";

class InputMicrophoneService extends InputServiceBase {
    name = "Microphone Input";
    outputFormat = AudioFormats.WAV;

    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private recordedChunks: Blob[] = [];
    private recordingResolve: ((result: InputResult) => void) | null = null;

    // Observable for recording state changes
    readonly isRecording: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    async prepareService(): Promise<boolean> {
        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            return true;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            return false;
        }
    }

    async getInput(): Promise<InputResult> {

        if (!this.stream)
            throw new Error('Microphone not initialized');


        this.startRecording();

        return new Promise((resolve) => {
            this.recordingResolve = resolve;
        });
    }

    private startRecording(): void {
        if (!this.stream || this.isRecording.value) {
            return;
        }

        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            const result = new InputResult(AudioFormats.WAV, blob);

            this.isRecording.next(false);

            if (this.recordingResolve) {
                this.recordingResolve(result);
                this.recordingResolve = null;
            }
        };

        this.mediaRecorder.start();
        this.isRecording.next(true);
    }

    stopRecording(): void {
        if (this.mediaRecorder && this.isRecording.value) {
            this.mediaRecorder.stop();
        }
    }

    cleanup(): void {
        this.stopRecording();
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isRecording.next(false);
    }
}

export default InputMicrophoneService;