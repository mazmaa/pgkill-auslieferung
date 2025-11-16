import { PipelineComponentStates, type PipelineComponentStateEnum } from '../../enums';
import './StatusIndicator.css'

interface StatusIndicatorProps {
    state: PipelineComponentStateEnum
}

function StatusIndicator(props: StatusIndicatorProps) {
    let color = "";
    if (props.state === PipelineComponentStates.ERROR)
        color = "!bg-red-500";
    else if (props.state === PipelineComponentStates.READY || props.state === PipelineComponentStates.RUNNING)
        color = "!bg-green-500";

    let showGear = props.state === PipelineComponentStates.PREPARING || props.state === PipelineComponentStates.RUNNING;

    return (
        <>
            <span className={"dot ".concat(color)}>
                {showGear && <div className="gear-rotate"></div>}
            </span>
        </>
    );
};

export default StatusIndicator