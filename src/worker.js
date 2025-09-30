// src/worker.js

import { pipeline } from '@xenova/transformers';

class MyTranscriptionPipeline {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-small';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    // Rufe die Transkriptions-Pipeline ab (lädt sie beim ersten Mal)
    let transcriber = await MyTranscriptionPipeline.getInstance((x) => {
        // Sende Ladefortschritt-Updates an den Haupt-Thread
        self.postMessage(x);
    });

    // Führe die Transkription durch
    let output = await transcriber(event.data.audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
    });

    // Sende das finale Ergebnis zurück an den Haupt-Thread
    self.postMessage({
        status: 'complete',
        output: output,
    });
});