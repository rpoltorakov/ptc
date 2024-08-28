import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import Switch from "react-switch";
import { checkedIcon, uncheckedIcon } from "./styles";
import { MetricSelect } from "./MetricSelect";
import { Button, Space } from "antd";

export const Metrics = ({ isOpened, handleChange, checked, metrics }) => {
  const handleClick = () => {
    console.log('clicked')
  }
  const options = [
    { value: 'count', label: 'count' },
    { value: 'SUM(job)', label: 'SUM(job)' }
  ]
  
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

      {metrics.map((metric, i) => <MetricSelect metrics={metrics} i={i} key={i+'metrics'}/>)}

      <Button> + </Button>
      {/* {props.metrics.map((el, i) => <div key={'metrics'+i}>{el}</div>)} */}
    </div>
  </>)
}