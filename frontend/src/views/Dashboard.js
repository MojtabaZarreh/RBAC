import React, { useEffect, useState, useMemo } from "react";
import { Row } from "reactstrap";
import AddNewBtn from "./AddNewBtn";
import DomainCard from "../components/DomainCard.js";
import AddEditModal from "../components/AddEditModal";
import Swal from "sweetalert2";
import {
  getDomains,
  deleteDomain,
  createDomain,
  updateDomain,
} from "../services/domain.api";
import { Input, InputGroup, InputGroupText, InputGroupAddon } from "reactstrap";
import { expireDay } from "utils/pubVars.js";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const isEditMode = selectedDomain !== null;

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);

    if (editModalOpen) {
      setSelectedDomain(null);
    }
  };

  function getDomainStatus(domain) {
    if (!domain) return "Inactive";
    if (!domain.expiration_date) return domain.status || "Inactive";
    const expDate = new Date(domain.expiration_date);
    const today = new Date();
    if (expDate < today) return "Expired";
    if ((expDate - today) / (1000 * 60 * 60 * 24) <= expireDay)
      return "Expiring";
    return domain.status;
  }

  useEffect(() => {
    let isMounted = true;

    const loadDomainsSafe = async () => {
      try {
        if (isMounted) setLoading(true);

        const data = await getDomains();

        if (isMounted) {
          setDomains(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "خطا در دریافت دامنه‌ها");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDomainsSafe();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewEdit = (domain) => {
    setSelectedDomain(domain);
    setEditModalOpen(true);
  };

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "حذف دامنه",
      text: "آیا از حذف این دامنه مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDomain(id);
      setDomains((prev) => prev.filter((w) => w.id !== id));

      Swal.fire({
        icon: "success",
        title: "حذف شد",
        text: "دامنه با موفقیت حذف شد",

        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "حذف دامنه با مشکل مواجه شد",
        confirmButtonText: "متوجه شدم",
      });
    }
  }

  async function handleSave(formData, isEditing = false) {
    if (isEditing) {
      try {
        await updateDomain(formData.id, formData);

        setEditModalOpen(false);
        setSelectedDomain(null);

        setDomains((prev) =>
          prev.map((d) => (d.id === formData.id ? formData : d)),
        );

        Swal.fire({
          icon: "success",
          title: "دامنه با موفقیت ویرایش شد",
          confirmButtonText: "متوجه شدم",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "خطا در ویرایش دامنه",
          text: err.message || "خطا در ویرایش دامنه",
          confirmButtonText: "تلاش مجدد",
        });
      }
    } else {
      try {
        const newDomain = await createDomain({
          name: formData.name,
          register: formData.register,
          status: formData.status || "Active",
          expiration_date: formData.expiration_date || null,
          description: formData.description,
        });

        setDomains((prev) => [...prev, newDomain]);
        toggleAddModal();
        // await loadDomainsSafe();
        Swal.fire({
          icon: "success",
          title: "دامنه با موفقیت ایجاد شد",
          confirmButtonText: "متوجه     شدم",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "خطا در ایجاد دامنه",
          text: err.message || "اطلاعات وارد شده نا معتبر است",
          confirmButtonText: "تلاش مجدد",
        });
      }
    }
  }

  const filteredDomains = useMemo(() => {
    return domains
      .filter((domain) => {
        if (
          statusFilter !== "ALL" &&
          getDomainStatus(domain) !== statusFilter
        ) {
          return false;
        }
        if (searchText.trim() === "") return true;
        return domain.name.toLowerCase().includes(searchText.toLowerCase());
      })
      .sort((a, b) => {
        const statusA = getDomainStatus(a) === "Active" ? 0 : 1;
        const statusB = getDomainStatus(b) === "Active" ? 0 : 1;
        if (statusA !== statusB) return statusA - statusB;

        const dateA = a.expiration_date
          ? new Date(a.expiration_date).getTime()
          : Infinity;
        const dateB = b.expiration_date
          ? new Date(b.expiration_date).getTime()
          : Infinity;
        return dateA - dateB;
      });
  }, [domains, statusFilter, searchText]);

  if (loading) return <p className="loading">در حال بارگذاری...</p>;
  if (error) return <p className="error-load">بارگزاری با مشکل مواجه شد</p>;

  return (
    <div className="content">
      {(user.role === "admin" || user.role === "editor") && (
        <AddNewBtn
          content="افزودن دامنه جدید"
          id="addNewDomain__btn"
          onClick={toggleAddModal}
        />
      )}

      {(user.role === "admin" || user.role === "editor") && (
        <AddEditModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          type="domain"
          name="دامنه"
          onSave={handleSave}
          isEditMode={false}
          itemData={null}
        />
      )}

      {/* {(user.role === "admin" || user.role === "editor") && */}
      <AddEditModal
        isOpen={editModalOpen}
        toggle={toggleEditModal}
        type="domain"
        name="دامنه"
        onSave={handleSave}
        isEditMode={true}
        itemData={selectedDomain}
      />

      <div className="filter-status" style={{ margin: "15px 0" }}>
        <label htmlFor="domainStatusFilter" style={{ marginRight: "10px" }}>
          فیلتر وضعیت:
        </label>

        <select
          id="domainStatusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">همه</option>
          <option value="Expiring">درحال انقضا</option>
          <option value="Expired">منقضی شده</option>
          <option value="Parked">رزرو شده</option>
        </select>

        <form>
          <InputGroup className="no-border search-bar">
            <Input
              type="text"
              placeholder="جستجو بر اساس نام دامنه..."
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
        {filteredDomains.length > 0 ? (
          filteredDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onDelete={handleDelete}
              onViewEdit={handleViewEdit}
            />
          ))
        ) : (
          <div className="none-result__box">متاسفانه نتیجه‌ای یافت نشد</div>
        )}
      </Row>
    </div>
  );
}
