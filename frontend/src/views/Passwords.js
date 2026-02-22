import React, { useEffect, useState } from "react";
import { Row, Input, InputGroup, InputGroupText, InputGroupAddon } from "reactstrap";
import Swal from "sweetalert2";

import AddNewBtn from "./AddNewBtn";
import PasswordCard from "./../components/PasswordCard";
import AddEditModal from "./../components/AddEditModal";

import {
  getPasswords,
  deletePassword,
  createPassword,
  updatePassword,
} from "../services/password.api";
import { useAuth } from "../contexts/AuthContext";

function Passwords() {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
    if (editModalOpen) setSelectedItem(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getPasswords();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(formData) {
    try {
      await createPassword({
        label: formData.label,
        username: formData.username,
        password: formData.password,
        url: formData.url,
        notes: formData.notes,
      });

      toggleAddModal();
      await loadData();

      Swal.fire({
        icon: "success",
        title: "پسورد با موفقیت ایجاد شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "خطا در ایجاد پسورد",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleEdit(formData) {
    try {
      await updatePassword(selectedItem.id, {
        label: formData.label,
        username: formData.username,
        password: formData.password,
        url: formData.url,
        notes: formData.notes,
      });

      toggleEditModal();
      await loadData();

      Swal.fire({
        icon: "success",
        title: "پسورد با موفقیت ویرایش شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "خطا در ویرایش پسورد",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "حذف پسورد",
      text: "آیا از حذف این مورد مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deletePassword(id);
      setItems((prev) => prev.filter((i) => i.id !== id));

      Swal.fire({
        icon: "success",
        title: "حذف شد",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "حذف ناموفق",
        confirmButtonText: "متوجه شدم",
      });
    }
  }

  const filteredItems = items.filter((item) => {
    if (
      searchText.trim() &&
      !item.label?.toLowerCase().includes(searchText.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) return <p className="loading">در حال بارگذاری...</p>;
  if (error) return <p className="error-load">بارگزاری با مشکل مواجه شد</p>;

  return (
    <div className="content">
      {canEdit &&
        <AddNewBtn content="افزودن پسورد جدید" onClick={toggleAddModal} />
      }
      {canEdit &&
        <AddEditModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          type="password"
          name="پسورد"
          isEditMode={false}
          onSave={handleAdd}
          itemData={null}
        />}

        <AddEditModal
          isOpen={editModalOpen}
          toggle={toggleEditModal}
          type="password"
          name="پسورد"
          isEditMode={true}
          onSave={handleEdit}
          itemData={selectedItem}
        />

      <InputGroup className="no-border search-bar" style={{ margin: "15px 0" }}>
        <Input
          placeholder="جستجو بر اساس عنوان..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <InputGroupAddon addonType="append">
          <InputGroupText>
            <i className="nc-icon nc-zoom-split" />
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <Row>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <PasswordCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onViewEdit={(i) => {
                setSelectedItem(i);
                setEditModalOpen(true);
              }}
            />
          ))
        ) : (
          <div className="none-result__box">نتیجه‌ای یافت نشد</div>
        )}
      </Row>
    </div>
  );
}

export default Passwords;
