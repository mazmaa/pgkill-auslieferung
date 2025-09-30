// src/App.jsx
import { useState } from 'react';
import { pipeline } from '@xenova/transformers';

// --- Singleton Instanz-Cache für Whisper ---
// Sorgt dafür, dass das Modell nur einmal heruntergeladen wird (für Caching).
let whisperInstance = null;

class PipelineManager {
    static async getWhisper(progressCallback) {
        if (whisperInstance === null) {
            // Speichere das Promise des Ladevorgangs.
            // Der Ladevorgang startet hier.
            whisperInstance = pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
                progress_callback: progressCallback,
            });
        }
        return whisperInstance; // Gibt das Promise zurück (das resolved, wenn das Modell bereit ist)
    }
}

// Funktion zur Konvertierung einer Audio-Datei in das erforderliche Format
async function prepareAudioForTranscription(file) {
    try {
        // AudioContext erstellen und Audio dekodieren
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileArrayBuffer = await file.arrayBuffer();
        
        console.log("Audio-Datei als ArrayBuffer geladen:", fileArrayBuffer.byteLength, "Bytes");
        
        // Audio dekodieren
        const audioBuffer = await audioContext.decodeAudioData(fileArrayBuffer);
        
        console.log("Audio dekodiert:", {
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            numberOfChannels: audioBuffer.numberOfChannels
        });
        
        // Audio auf Mono konvertieren (erster Kanal)
        const audioData = audioBuffer.getChannelData(0);
        
        return {
            array: audioData,
            sampling_rate: audioBuffer.sampleRate
        };
    } catch (error) {
        console.error("Fehler bei Audio-Vorbereitung:", error);
        throw new Error(`Audio-Konvertierung fehlgeschlagen: ${error.message}`);
    }
}

function App() {
    // === States ===
    const [file, setFile] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState({ message: 'Bereit. Bitte Audiodatei auswählen.', type: 'info' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setTranscript('');
            setStatus({ 
                message: `Datei "${selectedFile.name}" (${(selectedFile.size/1024/1024).toFixed(2)} MB) ausgewählt. Bereit zum Transkribieren.`, 
                type: 'info' 
            });
            console.log("Ausgewählte Datei:", selectedFile);
        }
    };

    const handleTranscribe = async () => {
        if (!file) return;

        setIsProcessing(true);
        setTranscript('');
        setStatus({ message: 'Transkription wird vorbereitet...', type: 'info' });

        try {
            // 1. Modell laden
            setStatus({ message: 'Lade Whisper ASR-Modell...', type: 'info' });
            const transcriber = await PipelineManager.getWhisper((p) => {
                setProgress(Math.round(p.progress));
            });
            
            // 2. Audio vorbereiten
            setStatus({ message: 'Bereite Audiodatei vor...', type: 'info' });
            const audioData = await prepareAudioForTranscription(file);
            
            // 3. Transkription durchführen
            setStatus({ message: 'Transkription läuft...', type: 'info' });
            console.log("Starte Transkription mit Daten:", {
                sampleRate: audioData.sampling_rate,
                dataLength: audioData.array.length
            });
            
            const transcriptResult = await transcriber(audioData, { 
                chunk_length_s: 10,  // Kürzere Chunks für bessere Verarbeitung 
                stride_length_s: 1,  // Kürzerer Stride für bessere Überlappung
                return_timestamps: false,
                task: "transcribe",
                // Normalisierung aktivieren
                normalize: true
            });
            
            // 4. Debugging und Extrahieren des Textes
            console.log("Transkriptions-Ergebnisobjekt:", transcriptResult);
            console.log("Typ des Ergebnisses:", typeof transcriptResult);
            console.log("Keys des Ergebnisobjekts:", Object.keys(transcriptResult));
            
            let extractedText = '';
            
            if (typeof transcriptResult === 'string') {
                extractedText = transcriptResult;
            } else if (transcriptResult && typeof transcriptResult === 'object') {
                extractedText = transcriptResult.text || 
                             transcriptResult.transcript || 
                             (transcriptResult.results && transcriptResult.results[0]?.transcript) ||
                             JSON.stringify(transcriptResult);
            }
            
            console.log("Extrahierter Text:", extractedText);
            
            // 5. Ergebnis setzen
            if (extractedText && extractedText.trim() !== '') {
                setTranscript(extractedText);
                setStatus({ message: 'Transkription erfolgreich abgeschlossen!', type: 'success' });
            } else {
                setTranscript('');
                setStatus({ 
                    message: 'Keine Sprache erkannt oder Transkription fehlgeschlagen. Versuchen Sie eine andere Audiodatei oder prüfen Sie die Qualität.',
                    type: 'warning'
                });
            }
        } catch (error) {
            console.error("Verarbeitungsfehler:", error);
            setStatus({ 
                message: `Ein Fehler ist aufgetreten: ${error.message}. Überprüfen Sie die Konsole für weitere Details.`, 
                type: 'danger' 
            });
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <header className="text-center mb-4">
                <h1 className="display-5 fw-bold">PG-KILL ASR PoC</h1>
                <p className="lead text-muted">Transkription direkt im Browser (ASR Only)</p>
            </header>
            <main>
                <div className="card shadow-sm mb-4">
                    <div className="card-header"><h5 className="mb-0">1. Transkribieren</h5></div>
                    <div className="card-body">
                        <input type="file" className="form-control mb-3" accept="audio/*" onChange={handleFileChange} disabled={isProcessing} />
                        <div className="d-grid">
                            <button className="btn btn-primary btn-lg" onClick={handleTranscribe} disabled={!file || isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Transkribiere...
                                    </>
                                ) : ( 'Transkription starten' )}
                            </button>
                        </div>
                        {/* Fortschrittsanzeige wird bei jedem Klick neu angezeigt, falls noch nicht geladen */}
                        {isProcessing && (
                            <div className="mt-3">
                                <p className="mb-1 text-center text-muted">{status.message}</p>
                                <div className="progress" style={{ height: '10px' }}>
                                    <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" 
                                        style={{ width: `${progress}%` }}>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className={`alert alert-${status.type}`} role="alert">
                    <strong>Status:</strong> {status.message}
                </div>

                <div className="row g-4">
                    <div className="col-12">
                        <div className="card shadow-sm"><div className="card-header"><h5 className="mb-0">2. Transkript</h5></div>
                            <div className="card-body">
                                <textarea 
                                    className="form-control" 
                                    value={transcript} 
                                    readOnly 
                                    placeholder="Das Transkript wird hier angezeigt..."
                                    style={{ minHeight: "150px" }}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;