import { styled } from '@superset-ui/core'

export const Styles = styled.div<PivotTableCStylesProps>`
  .app-ptc {
    padding: 4em;
    text-align: center;
    background-color: #282c34;
    overflow: scroll;
    color: white;
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
    border: 1px solid white;
    border-collapse: collapse;
  }

  td {
    border: 1px solid white;
  }

  .wrapper {
    width: 90%;
    padding: 0 1em;
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
    border: 2px solid gray;
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
    width: 90%;
  }

  .dim-elem {
    margin: 0.5em;
    border: 1px solid gray;
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
    border: 2px solid red;
    width: 10em;
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    position: absolute;
    top: 2em;
    left: 2em;
    min-height: 10em;
    background-color: #3e4148;
    z-index: 10;
    transition: opacity .1s linear;
    opacity: 0;
    visibility: hidden;
  }

  .metrics-opened {
    opacity: 1;
    visibility: visible;
  }

  .metrics-add-button {
    cursor: pointer;
    color: black;
  }

  .metric {
    width: 8em !important;
    border: 2px solid blue;
  }
  
  .tdv {
    color: white;
  }
`;