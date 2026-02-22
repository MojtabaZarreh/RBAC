import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormGroup,
} from "reactstrap";
import { toPersianDate, formatToISODate } from "utils/dateUtils";
import { useAuth } from "../contexts/AuthContext";

const API_MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export default function DomainModal({
  isOpen,
  toggle,
  type,
  onSave,
  name,
  itemData,
  isEditMode,
}) {
  const initialData = useMemo(
    () => ({
      domain: {
        id: null,
        name: "",
        register: "",
        status: "Active",
        expiration_date: "",
        description: "",
      },
    }),
    [],
  );

  const [formData, setFormData] = useState(initialData.domain);
  const { user } = useAuth();
  const canEdit = user.role == "admin" || user.role == "editor";
  console.log(canEdit);
  const [recordDateInput, setRecordDateInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && itemData) {
        const dataToLoad = {
          ...itemData,
          expiration_date: formatDateForInput(itemData.expiration_date),
        };
        setFormData(dataToLoad);
      } else {
        setFormData(initialData.domain);
      }
    }
  }, [isOpen, itemData, isEditMode, initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const MAX_FILE_SIZE_MB = 10;
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

  const [fileErrors, setFileErrors] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        errors.push(`حجم فایل "${file.name}" بیشتر از 10 مگابایت است`);
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`فرمت فایل "${file.name}" مجاز نیست (فقط PNG, JPG, PDF)`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachment: [...(prev.attachment || []), ...validFiles],
      }));
    }
    setFileErrors(errors);
  };

  const removeFile = (index) => {
    const newFiles = formData.attachment.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, attachment: newFiles }));
  };

  const handleSave = () => {
    if (isEditMode) {
      onSave(formData, true);
    } else {
      onSave(formData);
    }
  };

  let title = "";
  if (isEditMode) {
    if (user.role === "admin" || user.role === "editor") {
      title = `ویرایش ${name}`;
    } else {
      title = `مشاهده ${name}`;
    }
  } else {
    title = "افزودن";
  }

  const renderFields = () => {
    switch (type) {
      case "domain":
        return (
          <>
            <FormGroup>
              <Label>نام دامنه</Label>
              <Input
                disabled={!canEdit}
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>ثبت‌کننده دامنه</Label>
              <Input
                value={formData.register || ""}
                onChange={(e) => handleChange("register", e.target.value)}
                disabled={!canEdit}
              />
            </FormGroup>
            <FormGroup>
              <Label>وضعیت</Label>
              <Input
                type="select"
                value={formData.status || "Active"}
                onChange={(e) => handleChange("status", e.target.value)}
                disabled={!canEdit}
              >
                <option value="Active">فعال</option>
                <option value="Parked">رزرو شده</option>
                <option value="Expiring">درحال انقضا</option>
                <option value="Expired">منقضی شده</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>تاریخ انقضا</Label>
              <Input
                type="date"
                value={formData.expiration_date || ""}
                onChange={(e) =>
                  handleChange("expiration_date", e.target.value)
                }
                disabled={!canEdit}
              />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input
                type="textarea"
                disabled={!canEdit}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>
          </>
        );
      case "server":
        return (
          <>
            <FormGroup>
              <Label>نام سرور</Label>
              <Input
                value={formData.name}
                disabled={!canEdit}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>آدرس آی پی</Label>
              <Input
                value={formData.ip_address || ""}
                disabled={!canEdit}
                onChange={(e) => handleChange("ip_address", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>مکان</Label>
              <Input
                value={formData.location}
                disabled={!canEdit}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>تاریخ انقضا</Label>
              <Input
                type="date"
                disabled={!canEdit}
                value={formData.expiration_date}
                onChange={(e) =>
                  handleChange("expiration_date", e.target.value)
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input
                type="textarea"
                disabled={!canEdit}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>
          </>
        );
      case "ssl":
        return (
          <>
            <FormGroup>
              <Label>نام گواهی (دامنه)</Label>
              <Input
                disabled={!canEdit}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>صادر کننده</Label>
              <Input
                disabled={!canEdit}
                value={formData.issuer}
                onChange={(e) => handleChange("issuer", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>تاریخ انقضا</Label>
              <Input
                disabled={!canEdit}
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  handleChange("expiration_date", e.target.value)
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input
                disabled={!canEdit}
                type="textarea"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>
          </>
        );
      case "site":
        return (
          <>
            <FormGroup>
              <Label>آدرس سایت</Label>
              <Input
                disabled={!canEdit}
                value={formData.url}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input
                disabled={!canEdit}
                type="textarea"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>
          </>
        );
      case "finacial":
        return (
          <>
            <FormGroup>
              <Label>عنوان</Label>
              <Input
                disabled={!canEdit}
                type="text"
                value={formData.subject || ""}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>تاریخ</Label>
              <Input
                type="text"
                value={formData.record_date}
                placeholder="مثلا: ۱۴۰۴/۰۳/۱۲"
                onChange={(e) => {
                  const val = e.target.value;
                  setRecordDateInput(val);
                  handleChange("record_date", val);
                }}
              />
            </FormGroup>

            <FormGroup>
              <Label>پیوست ها</Label>
              {canEdit && (
                <Input
                  type="file"
                  visiblity={!canEdit}
                  multiple
                  onChange={handleFileChange}
                />
              )}
              {fileErrors.length > 0 && (
                <div style={{ color: "red", marginTop: "5px" }}>
                  {fileErrors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}

              {formData.attachment && formData.attachment.length > 0 && (
                <div style={{ textAlign: "right", marginTop: "10px" }}>
                  {formData.attachment.map((file, index) => {
                    const fileUrl = `${API_MEDIA_URL}${file.name || file}`;
                    const fileName =
                      file.name || decodeURIComponent(file.split("/").pop());

                    return (
                      <div key={index} style={{ marginBottom: "5px" }}>
                        {isEditMode ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {`مشاهده فایل ${index + 1}`}
                          </a>
                        ) : (
                          <span>{fileName}</span>
                        )}
                        {canEdit && (
                          <Button
                            onClick={() => removeFile(index)}
                            color="danger"
                            size="sm"
                            className="removeBtn"
                            style={{ marginLeft: "5px" }}
                          >
                            حذف
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <Label>توضیحات</Label>
              <Input
                disabled={!canEdit}
                type="textarea"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormGroup>
          </>
        );
      case "password":
        return (
          <>
            <FormGroup>
              <Label>عنوان</Label>
              <Input
                disabled={!canEdit}
                value={formData.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>نام کاربری</Label>
              <Input
                disabled={!canEdit}
                value={formData.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>رمز عبور</Label>
              <Input
                disabled={!canEdit}
                type="text"
                value={formData.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>آدرس</Label>
              <Input
                disabled={!canEdit}
                value={formData.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>توضیحات</Label>
              <Input
                disabled={!canEdit}
                type="textarea"
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </FormGroup>
          </>
        );
      default:
        return <p>نوع آیتم نامشخص است.</p>;
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{renderFields()}</ModalBody>
      <ModalFooter>
        {canEdit && (
          <>
            <Button color="primary" onClick={handleSave}>
              {isEditMode ? "ذخیره تغییرات" : "افزودن"}
            </Button>
            <Button color="secondary" onClick={toggle}>
              لغو
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
