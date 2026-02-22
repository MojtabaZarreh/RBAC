import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label, FormGroup } from "reactstrap";

export default function AddItemModal({ isOpen, toggle, type, onSave, name }) {
  const initialData = {
    domain: { name: "", register: "", status: "Active", expiration_date: "", description: "" },
    server: { name: "", ip_address: "", location: "", expiration_date: "", description: "" },
    ssl: { name: "", issuer: "", expiration_date: "", description: "" },
    site: { url: "", description: "" },
    password: { label: "", username: "", password: "", url: "", notes: "" },
  };

  const [formData, setFormData] = useState({});
  useEffect(() => {
    setFormData(initialData[type] || {});
  }, [type, isOpen]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = () => {
    onSave(formData);
    // toggle();
    setFormData(initialData[type] || {});
  };

  const renderFields = () => {
    switch (type) {
      case "domain":
        return (
          <>
            <FormGroup>
              <Label>نام دامنه</Label>
              <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>ثبت‌کننده دامنه :
              </Label>
              <Input value={formData.register} onChange={(e) => handleChange("register", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>وضعیت</Label>
              <Input type="select" value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
                <option>فعال</option>
                <option>رزرو</option>
                <option>درحال انقضا</option>
                <option>منقضی شده</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>تاریخ انقضا</Label>
              <Input type="date" value={formData.expiration_date} onChange={(e) => handleChange("expiration_date", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input type="textarea" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
            </FormGroup>
          </>
        );
      case "server":
        return (
          <>
            <FormGroup>
              <Label>نام سرور</Label>
              <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>آدرس آی پی</Label>
              <Input value={formData.ip_address} onChange={(e) => handleChange("ip_address", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>مکان</Label>
              <Input value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>تاریخ انقضا</Label>
              <Input type="date" value={formData.expiration_date} onChange={(e) => handleChange("expiration_date", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input type="textarea" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
            </FormGroup>
          </>
        );
      case "ssl":
        return (
          <>
            <FormGroup>
              <Label>نام گواهی (دامنه)</Label>
              <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>صادر کننده</Label>
              <Input value={formData.issuer} onChange={(e) => handleChange("issuer", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>تاریخ انقضا</Label>
              <Input type="date" value={formData.expiration_date} onChange={(e) => handleChange("expiration_date", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input type="textarea" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
            </FormGroup>
          </>
        );
      case "site":
        return (
          <>
            <FormGroup>
              <Label>آدرس سایت</Label>
              <Input value={formData.url} onChange={(e) => handleChange("url", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>توضیحات</Label>
              <Input type="textarea" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
            </FormGroup>
          </>
        );
      case "password":
        return (
          <>
            <FormGroup>
              <Label>Label</Label>
              <Input value={formData.label} onChange={(e) => handleChange("label", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Username</Label>
              <Input value={formData.username} onChange={(e) => handleChange("username", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input type="text" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>URL</Label>
              <Input value={formData.url} onChange={(e) => handleChange("url", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Notes</Label>
              <Input type="textarea" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} />
            </FormGroup>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>افزودن {name}</ModalHeader>
      <ModalBody>{renderFields()}</ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          ذخیره
        </Button>
        <Button color="secondary" onClick={toggle}>
          لغو
        </Button>
      </ModalFooter>
    </Modal>
  );
}
