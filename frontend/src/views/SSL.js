import React, { useEffect, useState } from "react";
import { Row, Input, InputGroupAddon, InputGroupText, InputGroup } from "reactstrap";
import AddNewBtn from "./AddNewBtn";
import SSLCard from "../components/SSLCard";
import { getSSLCertificates, deleteSSL, createSSL, updateSSL, } from "../services/ssl.api";
import AddEditModal from "../components/AddEditModal.js";
import Swal from "sweetalert2";
import { expireDay } from "utils/pubVars.js";
import { useAuth } from "../contexts/AuthContext";

function getSSLStatus(ssl) {
  if (!ssl?.expiration_date) return "Unknown";

  const exp = new Date(ssl.expiration_date);
  const today = new Date();
  const diffDays = (exp - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";
  if (diffDays <= expireDay) return "Expiring";
  return "Valid";
}

function SSL() {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);

  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedSSL, setSelectedSSL] = useState(null);

  const isEditMode = selectedSSL !== null;

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);

    if (editModalOpen) {
      setSelectedSSL(null);
    }
  };
  useEffect(() => {
    loadSSL();
  }, []);

  async function loadSSL() {
    try {
      setLoading(true);
      const data = await getSSLCertificates();
      setCerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(formData) {
    try {
      await createSSL({
        name: formData.name,
        issuer: formData.issuer,
        expiration_date: formData.expiration_date,
        description: formData.description
      });

      toggleAddModal();
      await loadSSL();

      Swal.fire({
        icon: "success",
        title: "SSL با موفقیت ایجاد شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در ایجاد وب سایت",
        text: "اطلاعات به درستی وارد نشده است.",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleEdit(formData) {
    try {
      await updateSSL(selectedSSL.id, {
        name: formData.name,
        issuer: formData.issuer,
        expiration_date: formData.expiration_date || null,
        description: formData.description
      });

      toggleEditModal();
      await loadSSL();

      Swal.fire({
        icon: "success",
        title: "SSL با موفقیت ویرایش شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در ویرایش SSL",
        text: "اطلاعات نامعتبر است",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }


  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "حذف ssl",
      text: "آیا از حذف این ssl مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteSSL(id);
      setCerts((prev) => prev.filter((w) => w.id !== id));

      Swal.fire({
        icon: "success",
        title: "حذف شد",
        text: "وب‌سایت با موفقیت حذف شد",

        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "حذف وب‌سایت با مشکل مواجه شد",
        confirmButtonText: "متوجه شدم",
      });
    }
  }

  const filteredCerts = certs.filter(ssl => {
    if (statusFilter !== "ALL" && getSSLStatus(ssl) !== statusFilter) return false;

    if (
      searchText.trim() !== "" &&
      !(
        (ssl.name && ssl.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (ssl.domain && ssl.domain.toLowerCase().includes(searchText.toLowerCase()))
      )
    )
      return false;
    return true;
  });

  const onViewEdit = (ssl) => {
    setSelectedSSL(ssl);
    setEditModalOpen(true);
  };

  if (loading) return <p className="loading">در حال بارگذاری...</p>;
  if (error) return <p className="error-load">بارگزاری با مشکل مواجه شد</p>;

  return (
    <div className="content">
      {canEdit &&
        <AddNewBtn content="افزودن SSL جدید" id="addNewSSL__btn"
          onClick={toggleAddModal}
        />}

      {canEdit &&
        <AddEditModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          type="ssl"
          name="ssl"
          isEditMode={false}
          onSave={handleAdd}
          itemData={null}
        />}

        <AddEditModal
          isOpen={editModalOpen}
          toggle={toggleEditModal}
          type="ssl"
          name="ssl"
          onSave={handleEdit}
          isEditMode={true}
          itemData={selectedSSL}
        />

      <div className="filter-status" style={{ margin: "15px 0" }}>
        <label htmlFor="sslStatusFilter" style={{ marginRight: "10px" }}>
          فیلتر وضعیت:
        </label>
        <select
          id="sslStatusFilter"
          onChange={e => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="ALL">همه</option>
          <option value="Expiring">در حال انقضا</option>
          <option value="Expired">منقضی شده</option>
        </select>

        <form>
          <InputGroup className="no-border search-bar">
            <Input type="text"
              placeholder="جستجو بر اساس نام یا SSL..."
              style={{ width: "250px", display: "inline-block", marginRight: "10px", fontFamily: "isans" }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)} />
            <InputGroupAddon addonType="append">
              <InputGroupText>
                <i className="nc-icon nc-zoom-split" />
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>

      <Row>
        {filteredCerts.length > 0 ? (
          filteredCerts.map(ssl => (
            <SSLCard
              key={ssl.id}
              ssl={ssl}
              status={getSSLStatus(ssl)}
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

export default SSL;
