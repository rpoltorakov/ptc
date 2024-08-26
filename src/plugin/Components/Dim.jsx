import React from 'react'
import { Draggable } from '@hello-pangea/dnd'

export function Dim(props) {
  return (
    <Draggable draggableId={props.name} index={props.index}>
      {(provided, snapshot) => (
        <div
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`dim-elem ${props.metric || props.metrics.includes(props.name) ? 'dim-metric' : ''}`}
        >
          {props.name}
        </div>
      )}
    </Draggable>
  )
}