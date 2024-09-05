import React from 'react';
import { Dim } from './Dim';
import { Droppable } from '@hello-pangea/dnd';

export function DimPool(props) {
  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'rgba(207, 207, 207, 0.5)' : '',
    transition: 'background 0.35s ease',
  });
  const items = props.items
  return (
    <Droppable droppableId={props.id} direction={props.direction}>
      {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={
              ` ${props.metrics ? 'dim-pool-metrics' : ''} 
                ${props.vertical ? 'dim-pool-col' : 'dim-pool-row'} 
                dim-pool 
                ${props.classes ? props.classes : ''}` 
            }
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items ? items.map((el, i) => {
              return (
                <Dim
                  name={el}
                  key={el.toString()+i}
                  index={i}
                  metric={props.metrics ? true : false}
                  metrics={props.metricsAr}
                />
              )
            }) : ''}
            {provided.placeholder}
          </div>
        )}
    </Droppable>
  )
}