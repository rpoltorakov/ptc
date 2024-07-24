import React, { useState } from "react"
import Draggable from "react-draggable";

// export function DraggableAttribute(props: any) {

// 	const [open, setOpen] = React.useState(false)
// 	const [filterText, setFilterText] = React.useState('')

// 	const toggleValue = (value: string) => {
// 		if (value in props.valueFilter) {
// 			props.removeValuesFromFilter(props.name, [value])
// 		} else {
// 			props.addValuesToFilter(props.name, [value]);
// 		}
// 	}

// 	const matchesFilter = (x: string) => {
// 		return x
//       .toLowerCase()
//       .trim()
//       .includes(filterText.toLowerCase().trim());
// 	}

// 	const selectOnly = (e: any, value: any) => {
//     e.stopPropagation();
//     props.setValuesInFilter(
//       props.name,
//       Object.keys(props.attrValues).filter(y => y !== value)
//     );
//   }

// 	const filtered = Object.keys(props.valueFilter).length !== 0
// 		? 'pvtFilteredAttribute'
// 		: ''
		
// 	return (
// 		<>
// 		<li data-id={props.name}>
// 			<span className={'pvtAttr ' + filtered}>
// 				{props.name}
// 				<span
// 					className="pvtTriangle"
// 				>
// 					{' '}
// 				</span>
// 			</span>
// 		</li>
// 		</>
// 	);
// }

export default function PivotTableUI(props: any) {

	const [zIndeces, setZIndeces] = useState({})
	const [maxZIndex, setMaxZIndex] = useState(1000)
	const [attrValues, setAttrValues] = useState({})
	const [materializedInput, setMaterializedInput] = useState([])

	React.useEffect(() => {
		materializeInput(props.data)
	}, [])
	
	const materializeInput = (nextData: any) => {
    if (this.state.data === nextData) {
      return;
    }
    const newState = {
      data: nextData,
      attrValues: {},
      materializedInput: [],
    };
    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.data,
      this.props.derivedAttributes,
      function(record) {
        newState.materializedInput.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in newState.attrValues)) {
            newState.attrValues[attr] = {};
            if (recordsProcessed > 0) {
              newState.attrValues[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in newState.attrValues) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in newState.attrValues[attr])) {
            newState.attrValues[attr][value] = 0;
          }
          newState.attrValues[attr][value]++;
        }
        recordsProcessed++;
      }
    );
    this.setState(newState);
  }
}