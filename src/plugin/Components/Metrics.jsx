import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import Switch from "react-switch";
import { checkedIcon, uncheckedIcon } from "./styles";
import { MetricSelect } from "./MetricSelect";
import { Button, Space } from "antd";

export const Metrics = ({
  isOpened, 
  handleChange, 
  checked, 
  metrics, 
  metricsAggs, 
  metricsFields, 
  metricsFormData,
  handleMetricsChange
}) => {
  const handleClick = () => {
    handleChange()
  }
  return (
  <>
    <div
      className={`metrics ${isOpened ? 'metrics-opened' : ''}`}
    >
      <div>
      <label>
        <Switch 
          onChange={handleChange} 
          checked={checked}
          uncheckedIcon={uncheckedIcon}
          checkedIcon={checkedIcon}
          onColor='#888'
        />
      </label>
      </div>

      {metrics.map((metric, i) => (
        <MetricSelect 
          metricsFields={metricsFields}
          metricsAggs={metricsAggs} 
          metrics={metrics} 
          i={i} 
          key={i+'metrics'}
          metricsFormData={metricsFormData}
          handleMetricsChange={handleMetricsChange}
        />
      ))}

      <Button> + </Button>
    </div>
  </>)
}