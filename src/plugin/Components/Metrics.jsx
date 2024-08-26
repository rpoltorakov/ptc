import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import Switch from "react-switch";

export const Metrics = (props) => {

  // const [checked, setChecked] = React.useState(false)
  
  // const handleChange = () => {

  //   setChecked(!checked)
  // }
  
  const handleClick = () => {
    console.log('clicked')
  }

  const uncheckedIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/></svg>
  )
  const checkedIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-240v-368L296-464l-56-56 240-240 240 240-56 56-144-144v368h-80Z"/></svg>
  )
  return (
  <>
    <div
      className={`metrics ${props.isOpened ? 'metrics-opened' : ''}`}
    >
      <div>
      <label>
        <span>Switch row/column</span>
        <Switch 
          onChange={props.handleChange} 
          checked={props.checked}
          uncheckedIcon={uncheckedIcon}
          checkedIcon={checkedIcon}
          onColor='#888'
          // width='60'
        />
      </label>
      </div>

      <button 
        className="metrics-add-button"
        onClick={handleClick}
      >+</button>
      {props.metrics.map((el, i) => <div key={'metrics'+i}>{el}</div>)}
    </div>
  </>)
}