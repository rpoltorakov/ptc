import React from "react";
import { Button, Card } from "antd";


export const MetricSQL = (props) => {
  const { 
    i, 
    metric,
    handleDelete,
    metrics
  } = props
  const handleDeleteButton = () => {
    handleDelete(i)
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '.35em', marginBottom:'0.5em' }}>
      <div
        style={{
          border: '1px solid #d9d9d9',
          padding: '0 11px 0',
          borderRadius: '0.25em',
          alignItems: 'center',
          lineHeight: '30px',
          flexGrow: 1,
        }}
        >
        {metric.label}
      </div>

      <div style={{ marginLeft: '1em'}}>
        <Button
          onClick={handleDeleteButton} 
          type="primary" 
          danger
          disabled={metrics.length === 1 ? true : false}
        > Delete </Button>
      </div>
    </div>
  )
}