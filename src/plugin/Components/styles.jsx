import { styled } from '@superset-ui/core'
import React from "react";

export const Styles = styled.div<PivotTableCStylesProps>`
  .app-ptc {
    padding: 4em;
    text-align: center;
    background-color: #ffffff;
    overflow: scroll;
    color: #222429;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: ${({ theme }) => theme.gridUnit * 2}px;
    height: ${({height}) => height}px;
  }
  .ptc-wrapper {
  
  }
  
  .table-pvc {
    margin: 0;
    width: 100%;
    border: 1px solid #c0c0c0;
    border-collapse: collapse;
  }

  td {
    border: 1px solid #c0c0c0;
  }

  .tableWrapper {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    gap: 2em;
    position: relative;
  }

  .pools {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 100%;
  }

  .dim-pool {
    background: #fbfbfb;
    border: 2px solid #c0c0c0;
    display: flex;
    justify-content: flex-start;
  }

  .dim-pool-col {
    flex-direction: column;
    width: 8em;
  }
  .dim-pool-row {
    flex-direction: row;
    width: 100%;
  }

  .dim-pool-metrics {
    border-color: #107AB0;
  }

  .dim-pool-big {
    margin-bottom: 1em;
    min-height: 4em;
  }

  .dim-elem {
    margin: 0.5em;
    border: 1px solid #c0c0c0;
    border-radius: 2px;
    padding:  0.5em 1.5em;
    cursor: grab;
    word-wrap: break-word;
  }

  .dim-metric {
    border-color: #107AB0;
  }

  .colss {
    display: flex;
    flex-direction: row;
    gap: 2em;
  }

  .metrics-button {
    cursor: pointer;
    border: 2px solid blue;
    width: 8em;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .metrics {
    border: 2px solid #cecece;
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    padding: 1em;
    min-height: 10em;
    background-color: #ffffff;
    z-index: 10;
    transition: opacity .1s linear;
    
  }

  .metrics-opened {
    opacity: 1;
    visibility: visible;

    opacity: 0;
    visibility: hidden;
    position: absolute;
    top: 4em;
    left: 4em;
  }

  .metrics-add-button {
    cursor: pointer;
    color: black;
  }

  .metric {
    width: 8em;
    border: 2px solid blue;
  }
  
  .tdv {
    color: #222429;
  }

  .tdv-total {
    font-weight: bold;
  }
  
  .subtotals-menu {
    display: flex;
    flex-direction: column;
  }

  .subtotals-menu-row {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }
  .table > thead > tr > th {
    border-bottom: 1px solid #c0c0c0;
  }
`;


export const uncheckedIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/></svg>
)
export const checkedIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-240v-368L296-464l-56-56 240-240 240 240-56 56-144-144v368h-80Z"/></svg>
)

export const UncheckedIconC = () => {
  // return (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/></svg>)
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}

export const CheckedIconC = () => {
  // return (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-240v-368L296-464l-56-56 240-240 240 240-56 56-144-144v368h-80Z"/></svg>)
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}