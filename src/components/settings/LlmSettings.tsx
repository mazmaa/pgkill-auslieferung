import { useState } from "react";
import { ServiceManager } from "../../services/ServiceManager";

function LlmSettings() {
    const [LlmService, setLlmService] = useState(ServiceManager.instance.llmService.name);

    return (
        <>
            <label>
                Pick an LLM Model:
                <select className="bg-gray-100 border-1 border-gray-400 rounded-sm px-2 mx-2"
                    value={LlmService}
                    onChange={event => {
                        ServiceManager.instance.setLlmServiceByName(event.target.value);
                        setLlmService(event.target.value);
                    }}>

                    {ServiceManager.instance.llmServices.map(llmService =>
                        <option value={llmService.name} key={llmService.name}>{llmService.name}</option>
                    )}

                </select>
            </label>
        </>
    );
}

export default LlmSettings