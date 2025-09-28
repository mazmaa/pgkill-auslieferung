import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { systemPrompt } from './systemPrompt.js';

function App() {
  // === State Management ===
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ message: 'Bitte API-Key eingeben und eine Datei auswählen.', type: 'info' });
  const [transcript, setTranscript] = useState('');
  const [llmOutput, setLlmOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // === Hilfsfunktion: Datei in Base64 umwandeln ===
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  // === Hauptfunktion: Audio verarbeiten ===
  const handleProcessAudio = async () => {
    if (!apiKey) {
      setStatus({ message: 'Fehler: Bitte geben Sie einen Google API Key ein.', type: 'danger' });
      return;
    }
    if (!file) {
      setStatus({ message: 'Fehler: Bitte wählen Sie eine Audiodatei aus.', type: 'danger' });
      return;
    }

    setIsLoading(true);
    setTranscript('');
    setLlmOutput('');
    setStatus({ message: 'Initialisiere Gemini...', type: 'info' });

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      setStatus({ message: 'Lade Audiodatei hoch und verarbeite sie... (Dies kann einige Zeit dauern)', type: 'info' });
      
      const audioPart = await fileToGenerativePart(file);

      const prompt = `${systemPrompt}\n\nAnalysiere die folgende Audiodatei:`;

      const result = await model.generateContent([prompt, audioPart]);
      const responseText = result.response.text();
      
      // Antwort aufteilen in Transkript und Analyse
      const parts = responseText.split('---');
      const generatedTranscript = parts[0]?.replace('TRANSCRIPT:', '').trim() || 'Transkript konnte nicht extrahiert werden.';
      const generatedLlmOutput = parts[1]?.trim() || 'Analyse konnte nicht extrahiert werden.';

      setTranscript(generatedTranscript);
      setLlmOutput(generatedLlmOutput);
      setStatus({ message: 'Verarbeitung erfolgreich abgeschlossen!', type: 'success' });

    } catch (error) {
      console.error("API Error:", error);
      setStatus({ message: `Ein Fehler ist aufgetreten: ${error.message}`, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  // === UI Rendering ===
  return (
    <div className="container mt-4 mb-5">
      <header className="text-center mb-4">
        <h1 className="display-5 fw-bold">PG-KILL Simple Frontend</h1>
        <p className="lead text-muted">Audio-Analyse direkt im Browser mit der Gemini API</p>
      </header>

      <main>
        {/* Konfiguration */}
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">1. Konfiguration</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="apiKey" className="form-label">Google API Key</label>
                <input
                  type="password"
                  id="apiKey"
                  className="form-control"
                  placeholder="Geben Sie Ihren Gemini API Key ein"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="audioFile" className="form-label">Audiodatei</label>
                <input
                  type="file"
                  id="audioFile"
                  className="form-control"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aktion & Status */}
        <div className="d-grid gap-2 mb-4">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleProcessAudio} 
            disabled={isLoading || !file || !apiKey}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Verarbeite...
              </>
            ) : (
              'Audio verarbeiten'
            )}
          </button>
        </div>
        
        <div className={`alert alert-${status.type}`} role="alert">
          <strong>Status:</strong> {status.message}
        </div>

        {/* Ergebnisse */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Transkript</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  value={transcript}
                  readOnly
                  placeholder="Das Transkript wird hier angezeigt..."
                ></textarea>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm">
               <div className="card-header">
                <h5 className="mb-0">LLM Analyse</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  value={llmOutput}
                  readOnly
                  placeholder="Die LLM-Analyse wird hier angezeigt..."
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