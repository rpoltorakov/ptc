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
  handleMetricsChange,
  handleDelete,
  metricsActive,
  handleAddMetric
}) => {
  // console.log('metrics', metricsAggs, metricsFields)

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
        metricsActive[i] &&
        <MetricSelect 
          metricsFields={metricsFields}
          metricsAggs={metricsAggs}
          metrics={metrics}
          i={i}
          key={i+'metrics'}
          metricsFormData={metricsFormData}
          handleMetricsChange={handleMetricsChange}
          handleDelete={handleDelete}
        />
      ))}

      <Button
        onClick={handleAddMetric}
      > + </Button>
    </div>
  </>)
}