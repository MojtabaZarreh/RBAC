import React, { useEffect, useState } from "react";
import {
  Row,
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
} from "reactstrap";

import AddNewBtn from "./AddNewBtn.js";
import ServersCard from "../components/ServersCard.js";
import {
  getServers,
  deleteServer,
  createServer,
  updateServer,
} from "../services/server.api.js";
import AddEditModal from "../components/AddEditModal.js";
import Swal from "sweetalert2";
import { expireDay } from "utils/pubVars.js";
import { useAuth } from "../contexts/AuthContext.js";

function getServerStatus(server) {
  if (!server?.expiration_date) return "Unknown";

  const exp = new Date(server.expiration_date);
  const today = new Date();
  const diffDays = (exp - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "Expired";
  if (diffDays <= expireDay) return "Expiring";

  return "Valid";
}

function Servers() {
  const { user } = useAuth();
  const canEdit = user.role === "admin" || user.role === "editor";
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const isEditMode = selectedServer !== null;

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);

    if (editModalOpen) {
      setSelectedServer(null);
    }
  };
  useEffect(() => {
    loadServers();
  }, []);

  async function loadServers() {
    try {
      setLoading(true);
      const data = await getServers();
      setServers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(formData) {
    try {
      await createServer({
        name: formData.name,
        ip_address: formData.ip_address,
        location: formData.location,
        expiration_date: formData.expiration_date || null,
        description: formData.description,
      });

      toggleAddModal();
      await loadServers();

      Swal.fire({
        icon: "success",
        title: "سرور با موفقیت ایجاد شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطا در ایجاد سرور",
        text: "اطلاعات نامعتبر است",
        confirmButtonText: "تلاش مجدد",
      });
    }
  }

  async function handleEdit(formData) {
    try {
      await updateServer(selectedServer.id, {
        name: formData.name,
        ip_address: formData.ip_address,
        location: formData.location,
        expiration_date: formData.expiration_date || null,
        description: formData.description,
      });

      toggleEditModal();
      await loadServers();

      Swal.fire({
        icon: "success",
        title: "سرور با موفقیت ویرایش شد",
        confirmButtonText: "متوجه شدم",
      });
    } catch (err) {
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
      title: "حذف سرور",
      text: "آیا از حذف این سرور مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "انصراف",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteServer(id);
      setServers((prev) => prev.filter((w) => w.id !== id));

      Swal.fire({
        icon: "success",
        title: "حذف شد",
        text: "سرور با موفقیت حذف شد",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "حذف سرور با مشکل مواجه شد",
        confirmButtonText: "متوجه شدم",
      });
    }
  }

  const filteredServers = servers.filter((server) => {
    if (
      statusFilter !== "ALL" &&
      getServerStatus(server) !== statusFilter
    )
      return false;

    if (
      searchText.trim() !== "" &&
      !server.name?.toLowerCase().includes(searchText.toLowerCase())
    )
      return false;

    return true;
  });

  const onViewEdit = (server) => {
    setSelectedServer(server);
    setEditModalOpen(true);
  };

  if (loading) return <p className="loading">در حال بارگذاری...</p>;
  if (error) return <p className="error-load">بارگزاری با مشکل مواجه شد</p>;

  return (
    <div className="content">
      {canEdit &&
        <AddNewBtn
          content="افزودن سرور جدید"
          id="addNewServer__btn"
          onClick={toggleAddModal}
        />}

      {canEdit &&
        <AddEditModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          type="server"
          name="سرور"
          isEditMode={false}
          onSave={handleAdd}
          itemData={null}
        />}

        <AddEditModal
          isOpen={editModalOpen}
          toggle={toggleEditModal}
          type="server"
          name="سرور"
          onSave={handleEdit}
          isEditMode={true}
          itemData={selectedServer}
        />

      <div className="filter-status" style={{ margin: "15px 0" }}>
        <label htmlFor="serverStatusFilter" style={{ marginRight: "10px" }}>
          فیلتر وضعیت:
        </label>
        <select
          id="serverStatusFilter"
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="ALL">همه</option>
          <option value="Expiring">درحال انقضا</option>
          <option value="Expired">منقضی شده</option>
        </select>

        <form>
          <InputGroup className="no-border search-bar">
            <Input
              type="text"
              placeholder="جستجو بر اساس نام سرور..."
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
        {filteredServers.length > 0 ? (
          filteredServers.map((server) => (
            <ServersCard
              key={server.id}
              server={server}
              status={getServerStatus(server)}
              onDelete={handleDelete}
              onViewEdit={onViewEdit}
            />
          ))
        ) : (
          <div className="none-result__box">
            متاسفانه نتیجه‌ای یافت نشد
          </div>
        )}
      </Row>
    </div>
  );
}

export default Servers;
