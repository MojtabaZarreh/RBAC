import React, { useState, useEffect } from "react";
import FinancialCard from "./../components/FinacialCard";
import AddNewBtn from "./AddNewBtn.js";
import {
  getFinancials,
  deleteFinancial,
  updateFinancial,
  createFinancial,
} from "../services/finacial.api";
import {
  Row,
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
} from "reactstrap";
import AddEditModal from "../components/AddEditModal";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";

export default function FinancialList() {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [searchText, setSearchText] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFinancial, setSelectedFinancial] = useState(null);
  const isEditMode = selectedFinancial !== null;

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);

    if (editModalOpen) {
      setSelectedFinancial(null);
    }
  };

  useEffect(() => {
    loadFinacial();
  }, []);

  async function loadFinacial() {
    try {
      setLoading(true);
      const data = await getFinancials();
      setFinancials(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(formData) {
    try {
      const fd = new FormData();

      fd.append("subject", formData.subject);
      fd.append("description", formData.description);
      if (formData.record_date) {
        fd.append("record_date", formData.record_date.toString());
      }

      if (formData.attachment && formData.attachment.length > 0) {
        [...formData.attachment].forEach((file) => {
          fd.append("files", file);
        });
      }
      for (let pair of fd.entries()) {
      }
      await createFinancial(fd);

      toggleAddModal();
      await loadFinacial();

      Swal.fire({
        icon: "success",
        title: "مورد مالی با موفقیت ایجاد شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطا در ایجاد مورد مالی",
        text: "اطلاعات نامعتبر است",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleEdit(formData) {
    try {
      const fd = new FormData();

      fd.append("subject", formData.subject);
      fd.append("description", formData.description);
      if (formData.record_date) {
        fd.append("record_date", formData.record_date);
      }

      if (formData.attachment && formData.attachment.length > 0) {
        [...formData.attachment].forEach((file) => {
          fd.append("files", file);
        });
      }

      await updateFinancial(selectedFinancial.id, fd);

      toggleEditModal();
      await loadFinacial();

      Swal.fire({
        icon: "success",
        title: "مورد مالی با موفقیت ویرایش شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطا در ویرایش سرور",
        text: "اطلاعات نامعتبر است",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "حذف مورد مالی",
      text: "آیا از حذف این مورد مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteFinancial(id);
      setFinancials((prev) => prev.filter((w) => w.id !== id));

      Swal.fire({
        icon: "success",
        title: "حذف شد",
        text: "موردمالی با موفقیت حذف شد",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "موردمالی با مشکل مواجه شد",
        confirmButtonText: "متوجه شدم",
      });
    }
  }

  const filteredFinacial = [...financials]
    .filter((finacial) => {
      if (
        searchText.trim() !== "" &&
        !finacial.subject?.toLowerCase().includes(searchText.toLowerCase())
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      if (statusFilter === "LATEST") {
        return new Date(b.record_date) - new Date(a.record_date);
      }

      if (statusFilter === "OLDEST") {
        return new Date(a.record_date) - new Date(b.record_date);
      }

      return 0;
    });

  const onViewEdit = (server) => {
    setSelectedFinancial(server);
    setEditModalOpen(true);
  };

  if (loading) return <p className="loading">در حال بارگذاری...</p>;
  if (error) return <p className="error-load">بارگزاری با مشکل مواجه شد</p>;

  return (
    <div className="content">
      {canEdit && (
        <AddNewBtn
          content="افزودن مورد مالی جدید"
          id="addNewFinacial__btn"
          onClick={toggleAddModal}
        />
      )}

      {canEdit && (
        <AddEditModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          type="finacial"
          name="مالی"
          isEditMode={false}
          onSave={handleAdd}
          itemData={null}
        />
      )}

      <AddEditModal
        isOpen={editModalOpen}
        toggle={toggleEditModal}
        type="finacial"
        name="مالی"
        onSave={handleEdit}
        isEditMode={true}
        itemData={selectedFinancial}
      />

      <div className="filter-status" style={{ margin: "15px 0" }}>
        <label htmlFor="serverStatusFilter" style={{ marginRight: "10px" }}>
          فیلتر وضعیت:
        </label>
        <select
          id="financialDateFilter"
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="ALL">همه</option>
          <option value="LATEST">آخرین مورد مالی</option>
          <option value="OLDEST">اولین مورد مالی</option>
        </select>
        <form>
          <InputGroup className="no-border search-bar">
            <Input
              type="text"
              placeholder="جستجو بر اساس نام مالی..."
              style={{
                width: "250px",
                display: "inline-block",
                marginRight: "10px",
                fontFamily: "isans",
              }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <InputGroupAddon addonType="append">
              <InputGroupText>
                <i className="nc-icon nc-zoom-split" />
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>

      <Row>
        {filteredFinacial.length > 0 ? (
          filteredFinacial.map((finacial) => (
            <FinancialCard
              key={finacial.id}
              finacial={finacial}
              // status={getFinacialStatus(finacial)}
              onDelete={handleDelete}
              onViewEdit={onViewEdit}
            />
          ))
        ) : (
          <div className="none-result__box">متاسفانه نتیجه‌ای یافت نشد</div>
        )}
      </Row>
    </div>
  );
}
