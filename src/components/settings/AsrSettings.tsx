import { useState } from "react";
import { ServiceManager } from "../../services/ServiceManager";

function AsrSettings() {
    const [asrService, setAsrService] = useState(ServiceManager.instance.asrService.name);

    return (
        <>
            <label>
                Pick an ASR Model:
                <select className="bg-gray-100 border-1 border-gray-400 rounded-sm px-2 mx-2"
                    value={asrService}
                    onChange={event => {
                        ServiceManager.instance.setAsrServiceByName(event.target.value)
                        setAsrService(event.target.value);
                    }}>

                    {ServiceManager.instance.asrServices.map(asrService =>
                        <option value={asrService.name} key={asrService.name}>{asrService.name}</option>
                    )}

                </select>
            </label>
        </>
    );
}

export default AsrSettings