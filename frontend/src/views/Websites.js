import React, { useEffect, useState } from "react";
import { Row, Input, InputGroupAddon, InputGroupText, InputGroup } from "reactstrap";
import AddNewBtn from "./AddNewBtn";
import WebsiteCard from "../components/WebsiteCard";
import AddEditModal from "../components/AddEditModal.js";
import { getWebsites, deleteWebsite, createWebsite, checkSite } from "../services/websites.api";
import Swal from "sweetalert2";
import { useAuth } from "../contexts/AuthContext";

function Websites() {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  useEffect(() => {
    loadWebsites();
  }, []);

  async function loadWebsites() {
    try {
      setLoading(true);
      const data = await getWebsites();
      setWebsites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(formData) {
    try {
      await createWebsite({
        url: formData.url,
        description: formData.description
      });

      toggleAddModal();
      await loadWebsites();

      Swal.fire({
        icon: "success",
        title: "وب سایت با موفقیت ایجاد شد",
        confirmButtonText: "باشه",
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

  async function handleCheck(id, status) {
    try {
      await checkSite(id, status);

      await loadWebsites();

      Swal.fire({
        icon: "success",
        title: "وب سایت با موفقیت بررسی شد",
        text: `وب سایت شما ${status == `up` ? ` فعال` : `غیرفعال`} است`,
        confirmButtonText: "باشه",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در بررسی وب سایت",
        text: "لطفا مجدد امتحان کنید",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "حذف وب‌سایت",
      text: "آیا از حذف این وب‌سایت مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteWebsite(id);
      setWebsites((prev) => prev.filter((w) => w.id !== id));

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

  const filteredWebsites = websites.filter(site => {
    if (statusFilter !== "ALL" && site.status !== statusFilter) return false;

    if (searchText.trim() !== "") {
      const text = searchText.trim().toLowerCase();
      const name = (site.name || site.title || "").trim().toLowerCase();
      const domain = (site.domain || site.url || "").trim().toLowerCase();

      if (!name.includes(text) && !domain.includes(text)) return false;
    }
    return true;
  });

  if (loading) return <p className="loading">در حال بارگذاری...</p>;
  if (error) return <p className="error-load">بارگزاری با مشکل مواجه شد</p>;

  return (
    <div className="content">
      {canEdit &&
        <AddNewBtn content="افزودن وب سایت جدید"
          id="addNewWebsite__btn"
          onClick={toggleAddModal}
        />}

      {canEdit &&
        <AddEditModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          type="site"
          name="وب سایت"
          onSave={handleAdd}
          isEditMode={false}
          itemData={null}
        />}

      <div className="filter-status" style={{ margin: "15px 0" }}>
        <label htmlFor="websiteStatusFilter" style={{ marginRight: "10px" }}>
          فیلتر وضعیت:
        </label>
        <select
          id="websiteStatusFilter"
          onChange={e => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="ALL">همه</option>
          <option value="up">فعال</option>
          <option value="down">غیرفعال</option>
        </select>

        <form>
          <InputGroup className="no-border search-bar">
            <Input type="text"
              placeholder="جستجو بر اساس نام یا URL..."
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
        {filteredWebsites.length > 0 ? (
          filteredWebsites.map(site => (
            <WebsiteCard key={site.id} site={site} onDelete={handleDelete} onCheck={handleCheck} />
          ))
        ) : (
          <div className="none-result__box">متاسفانه نتیجه‌ای یافت نشد</div>
        )}
      </Row>
    </div>
  );
}

export default Websites;
