import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;
const MODEL_URL = "/wav2vec2-base-960h_dynamic.onnx"
const vocab = {
    "<pad>": 0,
    "<s>": 1,
    "</s>": 2,
    "<unk>": 3,
    "|": 4,
    "E": 5,
    "T": 6,
    "A": 7,
    "O": 8,
    "N": 9,
    "I": 10,
    "H": 11,
    "S": 12,
    "R": 13,
    "D": 14,
    "L": 15,
    "U": 16,
    "M": 17,
    "W": 18,
    "C": 19,
    "F": 20,
    "G": 21,
    "Y": 22,
    "P": 23,
    "B": 24,
    "V": 25,
    "K": 26,
    "'": 27,
    "X": 28,
    "J": 29,
    "Q": 30,
    "Z": 31
};


// Handle incoming messages
self.onmessage = async (event) => {
    const { type, input } = event.data;

    if (type === "init") {
        try {
            session = await ort.InferenceSession.create(MODEL_URL, {
                executionProviders: ["wasm"],
            });
            self.postMessage({ type: "init-done" });
        } catch (e) {
            self.postMessage({ type: "error", error: e });
        }
    }

    if (type === "run" && session) {
        try {
            const results = await transcribeFile(input);
            // results is a map of outputName -> Tensor
            self.postMessage({ type: "result", results: results });
        } catch (e) {
            self.postMessage({ type: "error", error: e });
        }
    }
};



async function transcribeFile(processedData: Float32Array<ArrayBuffer>): Promise<string> {
    const inputTensor = new ort.Tensor("float32", processedData, [1, processedData.length]);
    const results = await session!.run({ input_values: inputTensor });
    return await processLogits(results.logits);
}

function argmax(logits) {
    return logits.map(row => Array.from(row).indexOf(Math.max(...Array.from(row))));
}

function decodeCTC(indices: Array<number> | number): string {
    // convert indices to array if its a single value
    if (!Array.isArray(indices))
        indices = [indices];

    const vocabMap = Object.fromEntries(Object.entries(vocab).map(([k, v]) => [v, k]));
    let transcription = indices.map(i => vocabMap[i] || "").join("");

    // CTC-Decoding: remove duplicate characters
    transcription = transcription.replace(/(.)\1+/g, "$1");
    return transcription.replace(/_/g, " ").trim();
}

function reshapeLogits(logits, frames, vocabSize) {
    return Array.from({ length: frames }, (_, i) =>
        logits.slice(i * vocabSize, (i + 1) * vocabSize)
    );
}

function cleanTranscription(transcription: string): string {
    return transcription.replace(/<pad>/g, "").replace(/\|/g, " ").trim();
}

async function processLogits(logits): Promise<string> {
    const reshapedLogits = reshapeLogits(logits.cpuData, logits.dims[1], logits.dims[2]);
    const argmaxIndices = argmax(reshapedLogits);

    const rowTranscription = decodeCTC(argmaxIndices);
    const transcription = cleanTranscription(rowTranscription);

    return transcription;
}