import React from 'react';
import PropTypes from 'prop-types';

function AddButton(props) {
  return <button className={"add-button " + props.extraClasses} onClick={() => props.action()}>Add +</button>
}

AddButton.propTypes = {

}

export default AddButton;
