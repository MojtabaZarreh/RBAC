import React from "react";

const AddNewBtn = ({ id, content, onClick }) => {
  return (
    <div className="add-new_box">
      <button
        className="add-new"
        id={id}
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    </div>
  );
};

export default AddNewBtn;

