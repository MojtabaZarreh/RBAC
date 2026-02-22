import React, { useState } from "react";
import AddEditModal from "../components/AddEditModal.js";

export default function MyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState("domain");

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleAdd = (data) => {
    console.log("New item:", data);
  };

  return (
    <>
      <button onClick={() => { setType("domain"); toggleModal(); }}>افزودن دامنه</button>
      <button onClick={() => { setType("server"); toggleModal(); }}>افزودن سرور</button>
      <AddEditModal isOpen={modalOpen} toggle={toggleModal} type={type} onSave={handleAdd} />
    </>
  );
}
