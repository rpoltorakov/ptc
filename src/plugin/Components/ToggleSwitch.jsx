import React, { useState, ChangeEvent } from "react";
import { styled } from '@superset-ui/core';

export default function ToggleSwitch() { 
  const [switchState, setSwitchState] = useState(true);  
  
  function handleOnChange(e) {
    setSwitchState(!switchState);
  }
  
  const StyledLabel = styled.label`  
    cursor: pointer;  
    text-indent: -9999px;  
    width: 250px;  
    height: 125px;  
    background: ${({ checked }) => (checked ? 'green' :  'gray')};  
    display: block;  
    border-radius: 100px;  
    position: relative;
    
    &:after {    
    content: "";    
    position: absolute;    
    left: ${({ checked }) => (checked ? "14px" : "calc(55% - 5px)")};    top: 12px;    
    width: 100px;    
    height: 100px;    
    background: #fff;    
    border-radius: 90px;    
    transition: 0.3s;  
  }`;
  return (    
    <StyledLabel htmlFor="checkboxMetric" checked={switchState}> 
      <input 
        id="checkboxMetric"
        type="checkbox"
        checked={switchState}
        onChange={handleOnChange} />    
    </StyledLabel>
  );
}