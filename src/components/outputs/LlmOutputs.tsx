import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContextProvider";
import { ServiceManager } from "../../services/ServiceManager";
import type { LlmResult } from "../../services/llm/LlmServiceBase";

function LlmOutputs() {
    const [llmResults, setLlmResults] = useState<LlmResult[]>([]);

    // react to output changes
    useEffect(() => {
        const sub = ServiceManager.instance.llmOutputs.subscribe(outputs => setLlmResults(outputs));
        return () => sub.unsubscribe();
    })

    return (
        <>
            <div className='flex flex-col  gap-2'>
                {llmResults.map(result => <li style={{ whiteSpace: "pre-line" }} key={result.timestamp}>{result.content}</li>).reverse()}
            </div>
        </>
    );
}

export default LlmOutputs