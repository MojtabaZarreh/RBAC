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
  Form,
} from "reactstrap";

export default function UserModal({
  isOpen,
  toggle,
  onSave,
  itemData,
  isEditMode,
}) {
  const initialData = useMemo(
    () => ({
      fullname: "",
      email: "",
      role: "editor",
      password: "",
    }),
    [],
  );

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && itemData) {
      setFormData({
        // ...itemData,
        // password: "",
        fullname: itemData.fullname || "",
        username: itemData.email || itemData.username,
        role: itemData.role || "editor",
        password: "",
      });
    } else {
      setFormData(initialData);
    }
  }, [isOpen, isEditMode, itemData, initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (isEditMode) {
      onSave(
        {
          username: formData.username,
          role: formData.role,
        },
        true,
      );
    } else {
      onSave(formData, false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>
        {isEditMode ? "ویرایش نقش کاربر" : "افزودن کاربر"}
      </ModalHeader>

      <ModalBody>
        <Form>
          {!isEditMode && (
            <>
              <FormGroup>
                <Label>نام و نام خانوادگی</Label>
                <Input
                  value={formData.fullname}
                  onChange={(e) => handleChange("fullname", e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>نام کاربری (ایمیل)</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>رمز عبور</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </FormGroup>
            </>
          )}

          <FormGroup>
            <Label>نقش کاربر</Label>
            <Input
              type="select"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
            >
              <option value="editor">ویرایشگر</option>
              <option value="viewer">تماشاکننده</option>
            </Input>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleSave}>
          {isEditMode ? "ذخیره تغییرات" : "افزودن کاربر"}
        </Button>
        <Button color="secondary" onClick={toggle}>
          لغو
        </Button>
      </ModalFooter>
    </Modal>
  );
}
