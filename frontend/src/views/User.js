// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Button,
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   CardTitle,
//   FormGroup,
//   Form,
//   Input,
//   Row,
//   Col,
// } from "reactstrap";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import UserModal from "components/UserModal";
// import {
//   createUser,
//   getMe,
//   getUsers,
//   updateAdminProfile,
//   updateUserProfile,
//   editUserRoleByAdmin,
//   deleteUserRoleByAdmin,
// } from "../services/user.api";
// import AddNewBtn from "./AddNewBtn";
// import Swal from "sweetalert2";
// import CompanyLogo from "./../components/CompanyLogo";
// import { useCompanyLogo } from "../hooks/useCompanyLogo";
// import { useAuth } from "../contexts/AuthContext";
// import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
// import Avatar from "./../components/Avatar/Avatar";
// import { Navigate } from "react-router-dom";
// function User() {
//   const { user } = useAuth();
//   const isAdmin = user.role == "admin";
//   const role = user?.role;
//   const [error, setError] = useState("");
//   const [me, setMe] = useState(null);
//   // const { setLogo } = useCompanyLogo();
//   // const { logo: companyLogo } = useCompanyLogo();
//   const [loadingMe, setLoadingMe] = useState(true);
//   const [profileForm, setProfileForm] = useState({
//     fullname: "",
//     email: "",
//     city: "",
//     company: "",
//     password: "",
//     logo: null,
//     logoPreview: "",
//   });
//   const { logo: companyLogo, setLogo } = useCompanyLogo();

//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const USERS_PER_PAGE = 3;
//   let permissions = {
//     canViewUsers: true,
//     canCRUDUser: role === "admin",
//     canDeleteUser: role === "admin",
//     canEditUsers: role === "admin",
//     canEditProfile: true,
//     canEditCompanyInfo: role === "admin",
//     canEditCity: role === "admin",
//     canEditLogo: role === "admin",
//   };

//   const [userModalOpen, setUserModalOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);

//   const sortedUsers = useMemo(() => {
//     return [...users].sort((a, b) => {
//       if (a.role === "admin" && b.role !== "admin") return -1;
//       if (a.role !== "admin" && b.role === "admin") return 1;
//       return 0;
//     });
//   }, [users]);

//   const filteredUsers = useMemo(() => {
//     return sortedUsers.filter(
//       (user) =>
//         user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
//     );
//   }, [sortedUsers, searchTerm]);

//   const paginatedUsers = useMemo(() => {
//     const start = (currentPage - 1) * USERS_PER_PAGE;
//     const end = start + USERS_PER_PAGE;
//     return filteredUsers.slice(start, end);
//   }, [filteredUsers, currentPage]);

//   const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   const addUser = (newUser) => setUsers([...users, newUser]);
//   const updateUser = (updatedUser) =>
//     setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

//   const deleteUser = async (username) => {
//     Swal.fire({
//       title: "آیااز حذف کاربر مطمئن هستید؟",
//       text: "این عملیات قابل بازگشت نیست!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "بله، حذف شود",
//       cancelButtonText: "خیر",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const res = await deleteUserRoleByAdmin(username);
//           setUsers((prev) => prev.filter((u) => u.username !== username));
//           Swal.fire({
//             title: "موفق!",
//             text: "کاربر با موفقیت حذف شد",
//             icon: "success",
//           });
//         } catch {
//           Swal.fire({
//             title: "خطا در حذف کاربر",
//             text: "عملیات حذف انجام نشد",
//             icon: "error",
//           });
//         }
//       }
//     });
//   };

//   const editUserRole = async (user) => {
//     console.log(user);

//     setEditingUser(user);
//     setUserModalOpen(true);
//   };

//   useEffect(() => {
//     const fetchMe = async () => {
//       try {
//         const res = await getMe();
//         setMe(res.data || res);
//       } catch (err) {
//         console.error(err);
//         setError("خطا در دریافت اطلاعات کاربر");
//       } finally {
//         setLoadingMe(false);
//       }
//     };

//     fetchMe();
//   }, []);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await getUsers();
//         setUsers(res.data || res);
//       } catch (err) {
//         console.error(err);
//         setError("خطا در دریافت لیست کاربران");
//       } finally {
//         setLoadingUsers(false);
//       }
//     };

//     if (permissions.canViewUsers) {
//       fetchUsers();
//     }
//   }, []);

//   useEffect(() => {
//     if (!me) return;
//     setProfileForm((prev) => ({
//       ...prev,
//       fullname: me.fullname || "",
//       email: me.email || "",
//       city: me.city || "",
//       company: me.company || "",
//       // logoPreview: me.logo
//       //   ? `${process.env.REACT_APP_MEDIA_URL}${me.logo}`
//       //   : companyLogo || "",
//     }));
//   }, [me, companyLogo]);

//   useEffect(() => {
//     if (!profileForm.logoPreview && companyLogo) {
//       setProfileForm((prev) => ({
//         ...prev,
//         logoPreview: companyLogo,
//       }));
//     }
//   }, [companyLogo]);

//   useEffect(() => {
//     return () => {
//       if (
//         profileForm.logoPreview &&
//         profileForm.logoPreview.startsWith("blob:")
//       ) {
//         URL.revokeObjectURL(profileForm.logoPreview);
//       }
//     };
//   }, [profileForm.logoPreview]);

//   useEffect(() => {
//   if (currentPage > totalPages && totalPages > 0) {
//     setCurrentPage(totalPages);
//   }
// }, [totalPages, currentPage]);

//   const handleSaveUser = async (data, isEdit) => {
//     console.log(data);

//     try {
//       if (isEdit) {
//         await editUserRoleByAdmin(data.username, data.role);

//         setUsers((prev) =>
//           prev.map((u) =>
//             u.username === data.username ? { ...u, role: data.role } : u,
//           ),
//         );

//         Swal.fire({
//           icon: "success",
//           title: "موفق",
//           text: "نقش کاربر با موفقیت تغییر کرد",
//         });

//         setUserModalOpen(false);
//         setEditingUser(null);
//       } else {
//         await createUser(data.fullname, data.email, data.password, data.role);

//         setUsers((prev) => [
//           ...prev,
//           {
//             fullname: data.fullname,
//             email: data.email,
//             username : data.email,
//             role: data.role
//           },
//         ]);

//         Swal.fire({
//           icon: "success",
//           title: "کاربر ایجاد شد",
//         });

//         setUserModalOpen(false);
//       }
//     } catch (err) {
//       console.error(err);
//       Swal.fire({
//         icon: "error",
//         title: "خطا",
//         text: "عملیات انجام نشد",
//       });
//     }
//   };

//   const handleProfileSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (isAdmin) {
//         // ADMIN → FormData
//         const formData = new FormData();
//         formData.append("fullname", profileForm.fullname);
//         formData.append("username", profileForm.email);
//         formData.append("city", profileForm.city);
//         formData.append("company", profileForm.company);

//         if (profileForm.password) {
//           formData.append("password", profileForm.password);
//         }

//         if (profileForm.logo) {
//           formData.append("logo", profileForm.logo);
//         }

//         const res = await updateAdminProfile(formData);

//         if (res?.logo) {
//           const finalLogo = res.logo.startsWith("http")
//             ? res.logo
//             : `${process.env.REACT_APP_MEDIA_URL}${res.logo}`;

//           setLogo(finalLogo);
//         }
//       } else {
//         // USER → json
//         const payload = {
//           fullname: profileForm.fullname,
//           password: profileForm.password || undefined,
//         };
//         await updateUserProfile(payload);
//       }

//       Swal.fire({
//         icon: "success",
//         title: "اطلاعات با موفقیت ویرایش شد",
//         confirmButtonText: "متوجه شدم",
//       }).then(() => {
//         window.location.reload();
//       });
//     } catch (err) {
//       console.error(err);
//       Swal.fire({
//         icon: "error",
//         title: "خطا در ویرایش اطلاعات",
//         text: "اطلاعات به درستی وارد نشده است.",
//         confirmButtonText: "تلاش مجدد",
//       });
//     }
//   };

//   return (
//     <>
//       <div className="content">
//         {error && <p className="error-load">{error}</p>}
//         <Row>
//           <Col md="4">
//             <Card className="card-user">
//               <div className="image">
//                 <img alt="..." src={require("assets/img/damir-bosnjak.jpg")} />
//               </div>
//               <CardBody>
//                 <div className="author">
//                   <a onClick={(e) => e.preventDefault()}>
//                     <Avatar name={me?.fullname} size={80} />
//                     {loadingMe ? (
//                       <p className="text-center">در حال بارگذاری...</p>
//                     ) : (
//                       me && (
//                         <>
//                           <h5 className="title">{me.fullname}</h5>
//                           <p className="description">{me.email}</p>
//                         </>
//                       )
//                     )}
//                   </a>
//                   <p className="description text-center">
//                     {me?.role === "admin"
//                       ? "مدیر سیستم"
//                       : me?.role === "editor"
//                         ? "ویرایشگر"
//                         : "کاربرعادی"}
//                   </p>
//                 </div>
//               </CardBody>
//               <CardFooter>
//                 <hr />
//               </CardFooter>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle tag="h4">لیست کاربران</CardTitle>
//                 <Input
//                   type="text"
//                   placeholder="جستجو بر اساس نام یا ایمیل..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="mb-3"
//                 />
//                 {permissions.canCRUDUser && (
//                   <AddNewBtn
//                     content="افزودن کاربر جدید"
//                     onClick={() => {
//                       setEditingUser(null);
//                       setUserModalOpen(true);
//                     }}
//                   />
//                 )}
//               </CardHeader>
//               <CardBody>
//                 <UserModal
//                   isOpen={userModalOpen}
//                   toggle={() => setUserModalOpen(false)}
//                   onSave={handleSaveUser}
//                   itemData={editingUser}
//                   isEditMode={!!editingUser}
//                 />
//                 {loadingUsers ? (
//                   <p className="text-center">در حال بارگذاری کاربران...</p>
//                 ) : paginatedUsers.length === 0 ? (
//                   <p className="text-center text-muted">کاربری یافت نشد</p>
//                 ) : (
//                   <ul className="list-unstyled team-members">
//                     {paginatedUsers.map((user) => (
//                       <li key={user.id}>
//                         <Row className="userShow-box">
//                           <div className="user-info">
//                             <div className="avatar">
//                               <Avatar name={user.fullname} size={40} />
//                             </div>
//                             <div className="user-name">
//                               {user.fullname}
//                               <br />
//                               <span
//                                 className={
//                                   user.role === "admin"
//                                     ? "text-success fw-bold"
//                                     : "text-muted"
//                                 }
//                               >
//                                 <small>
//                                   {user.role === "admin"
//                                     ? "مدیر"
//                                     : user.role === "editor"
//                                       ? "ویرایشگر"
//                                       : "کاربر عادی"}
//                                 </small>
//                               </span>
//                             </div>
//                           </div>

//                           {permissions.canCRUDUser && (
//                             <div className="text-right">
//                               <Button
//                                 size="sm"
//                                 // disabled={user.username === me.username}
//                                 onClick={() => editUserRole(user)}
//                               >
//                                 ویرایش
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 color="danger"
//                                 onClick={() => deleteUser(user.username)}
//                               >
//                                 حذف
//                               </Button>
//                             </div>
//                           )}
//                         </Row>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//                 {totalPages > 1 && (
//                   <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
//                     {/* Previous */}
//                     <Button
//                       size="sm"
//                       color="light"
//                       disabled={currentPage === 1}
//                       onClick={() => setCurrentPage((p) => p - 1)}
//                       className="d-flex align-items-center justify-content-center"
//                       style={{ width: 36, height: 22 }}
//                     >
//                       <FaChevronRight />
//                     </Button>

//                     {/* Page Info */}
//                     <span
//                       className="align-self-center text-muted"
//                       style={{ fontSize: "12px", padding: "0 0.5rem" }}
//                     >
//                       صفحه {currentPage} از {totalPages}
//                     </span>

//                     {/* Next */}
//                     <Button
//                       size="sm"
//                       color="light"
//                       disabled={currentPage === totalPages}
//                       onClick={() => setCurrentPage((p) => p + 1)}
//                       className="d-flex align-items-center justify-content-center"
//                       style={{ width: 36, height: 22 }}
//                     >
//                       <FaChevronLeft />
//                     </Button>
//                   </div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//           <Col md="8">
//             <Card className="card-user">
//               <CardHeader>
//                 <CardTitle tag="h5">ویرایش پروفایل</CardTitle>
//               </CardHeader>
//               <CardBody>
//                 <Form onSubmit={handleProfileSubmit}>
//                   <Row>
//                     <Col className="pr-1" md="5">
//                       <FormGroup>
//                         <label>نام شرکت</label>
//                         <Input
//                           disabled={!permissions.canEditCompanyInfo}
//                           value={profileForm.company}
//                           onChange={(e) =>
//                             setProfileForm({
//                               ...profileForm,
//                               company: e.target.value,
//                             })
//                           }
//                           type="text"
//                         />
//                       </FormGroup>
//                     </Col>
//                     <Col className="pr-1" md="5">
//                       <FormGroup>
//                         <label>نام و نام خانوادگی</label>
//                         <Input
//                           value={profileForm.fullname}
//                           onChange={(e) =>
//                             setProfileForm({
//                               ...profileForm,
//                               fullname: e.target.value,
//                             })
//                           }
//                           type="text"
//                         />
//                       </FormGroup>
//                     </Col>
//                     <Col className="px-1" md="3">
//                       <FormGroup>
//                         <label> نام کاربری(ایمیل)</label>
//                         <Input
//                           value={profileForm.email}
//                           onChange={(e) =>
//                             setProfileForm({
//                               ...profileForm,
//                               email: e.target.value,
//                             })
//                           }
//                           type="email"
//                           disabled
//                         />
//                       </FormGroup>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col className="pr-1" md="4">
//                       <FormGroup style={{ position: "relative" }}>
//                         <label>رمز عبور</label>
//                         <Input
//                           value={profileForm.password}
//                           onChange={(e) =>
//                             setProfileForm({
//                               ...profileForm,
//                               password: e.target.value,
//                             })
//                           }
//                           type={showNewPassword ? "text" : "password"}
//                           className="password-input"
//                           style={{ paddingLeft: "40px" }}
//                         />
//                         <span
//                           onClick={() => setShowNewPassword(!showNewPassword)}
//                           style={{
//                             position: "absolute",
//                             left: "10px",
//                             top: "70%",
//                             transform: "translateY(-50%)",
//                             cursor: "pointer",
//                             color: "#555",
//                           }}
//                         >
//                           {showNewPassword ? <FaEyeSlash /> : <FaEye />}
//                         </span>
//                       </FormGroup>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col className="pr-1" md="4">
//                       <FormGroup>
//                         <label>لوگوی شرکت</label>

//                         <div className="logo-upload-wrapper">
//                           <label
//                             htmlFor="logo-upload"
//                             className="logo-upload-box"
//                           >
//                             {profileForm.logoPreview ? (
//                               <CompanyLogo
//                                 src={profileForm.logoPreview || profileForm.logo}
//                                 size={100}
//                               />
//                             ) : (
//                               <div className="logo-placeholder">
//                                 <span>📷</span>
//                                 <p>انتخاب لوگو</p>
//                               </div>
//                             )}
//                           </label>

//                           <input
//                             id="logo-upload"
//                             disabled={!permissions.canEditCompanyInfo}
//                             type="file"
//                             accept="image/*"
//                             hidden
//                             onChange={(e) => {
//                               const file = e.target.files[0];
//                               if (!file) return;

//                               const previewUrl = URL.createObjectURL(file);

//                               setProfileForm((prev) => ({
//                                 ...prev,
//                                 logo: file,
//                                 logoPreview: previewUrl,
//                               }));
//                               setLogo(previewUrl);
//                             }}
//                           />
//                         </div>
//                       </FormGroup>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col className="pr-1" md="4">
//                       <FormGroup>
//                         <label>شهر</label>
//                         <Input
//                           disabled={!permissions.canEditCompanyInfo}
//                           value={profileForm.city}
//                           onChange={(e) =>
//                             setProfileForm({
//                               ...profileForm,
//                               city: e.target.value,
//                             })
//                           }
//                           type="text"
//                         />
//                       </FormGroup>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <div className="update ml-auto mr-auto">
//                       <Button
//                         className="btn-round"
//                         color="primary"
//                         type="submit"
//                       >
//                         ویرایش اطلاعات
//                       </Button>
//                     </div>
//                   </Row>
//                 </Form>
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </>
//   );
// }

// export default User;

// // import React, { useState, useEffect, useMemo } from "react";
// // import {
// //   Button,
// //   Card,
// //   CardHeader,
// //   CardBody,
// //   CardFooter,
// //   CardTitle,
// //   FormGroup,
// //   Form,
// //   Input,
// //   Row,
// //   Col,
// // } from "reactstrap";
// // import { FaEye, FaEyeSlash } from "react-icons/fa";
// // import UserModal from "components/UserModal";
// // import {
// //   createUser,
// //   getMe,
// //   getUsers,
// //   updateAdminProfile,
// //   updateUserProfile,
// //   editUserRoleByAdmin,
// //   deleteUserRoleByAdmin,
// // } from "../services/user.api";
// // import AddNewBtn from "./AddNewBtn";
// // import Swal from "sweetalert2";
// // import CompanyLogo from "./../components/CompanyLogo";
// // import { useCompanyLogo } from "../hooks/useCompanyLogo";
// // import { useAuth } from "../contexts/AuthContext";
// // import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
// // import Avatar from "./../components/Avatar/Avatar";

// // function User() {
// //   const { user } = useAuth();
// //   const isAdmin = user.role == "admin";
// //   const role = user?.role;
// //   const [error, setError] = useState("");
// //   const [me, setMe] = useState(null);
  
// //   const [loadingMe, setLoadingMe] = useState(true);
  
// //   // State برای فرم پروفایل
// //   const [profileForm, setProfileForm] = useState({
// //     fullname: "",
// //     email: "",
// //     city: "",
// //     company: "",
// //     password: "",
// //     logo: null, // فایل انتخاب شده (File Object)
// //     logoPreview: "", // آدرس نمایشی (یا لینک سرور یا Blob موقت)
// //   });

// //   // استفاده از کانتکست لوگو
// //   const { logo: companyLogo, setLogo } = useCompanyLogo();

// //   const [showNewPassword, setShowNewPassword] = useState(false);
// //   const [users, setUsers] = useState([]);
// //   const [loadingUsers, setLoadingUsers] = useState(true);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [currentPage, setCurrentPage] = useState(1);

// //   const USERS_PER_PAGE = 3;
// //   let permissions = {
// //     canViewUsers: true,
// //     canCRUDUser: role === "admin",
// //     canDeleteUser: role === "admin",
// //     canEditUsers: role === "admin",
// //     canEditProfile: true,
// //     canEditCompanyInfo: role === "admin",
// //     canEditCity: role === "admin",
// //     canEditLogo: role === "admin",
// //   };

// //   const [userModalOpen, setUserModalOpen] = useState(false);
// //   const [editingUser, setEditingUser] = useState(null);

// //   // --- Sort & Pagination Logic ---
// //   const sortedUsers = useMemo(() => {
// //     return [...users].sort((a, b) => {
// //       if (a.role === "admin" && b.role !== "admin") return -1;
// //       if (a.role !== "admin" && b.role === "admin") return 1;
// //       return 0;
// //     });
// //   }, [users]);

// //   const filteredUsers = useMemo(() => {
// //     return sortedUsers.filter(
// //       (user) =>
// //         user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
// //     );
// //   }, [sortedUsers, searchTerm]);

// //   const paginatedUsers = useMemo(() => {
// //     const start = (currentPage - 1) * USERS_PER_PAGE;
// //     const end = start + USERS_PER_PAGE;
// //     return filteredUsers.slice(start, end);
// //   }, [filteredUsers, currentPage]);

// //   const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  
// //   useEffect(() => {
// //     setCurrentPage(1);
// //   }, [searchTerm]);

// //   useEffect(() => {
// //     if (currentPage > totalPages && totalPages > 0) {
// //       setCurrentPage(totalPages);
// //     }
// //   }, [totalPages, currentPage]);

// //   // --- Handlers for User Management ---
// //   const deleteUser = async (username) => {
// //     Swal.fire({
// //       title: "آیااز حذف کاربر مطمئن هستید؟",
// //       text: "این عملیات قابل بازگشت نیست!",
// //       icon: "warning",
// //       showCancelButton: true,
// //       confirmButtonText: "بله، حذف شود",
// //       cancelButtonText: "خیر",
// //     }).then(async (result) => {
// //       if (result.isConfirmed) {
// //         try {
// //           await deleteUserRoleByAdmin(username);
// //           setUsers((prev) => prev.filter((u) => u.username !== username));
// //           Swal.fire({
// //             title: "موفق!",
// //             text: "کاربر با موفقیت حذف شد",
// //             icon: "success",
// //           });
// //         } catch {
// //           Swal.fire({
// //             title: "خطا در حذف کاربر",
// //             text: "عملیات حذف انجام نشد",
// //             icon: "error",
// //           });
// //         }
// //       }
// //     });
// //   };

// //   const editUserRole = async (user) => {
// //     setEditingUser(user);
// //     setUserModalOpen(true);
// //   };

// //   const handleSaveUser = async (data, isEdit) => {
// //     try {
// //       if (isEdit) {
// //         await editUserRoleByAdmin(data.username, data.role);
// //         setUsers((prev) =>
// //           prev.map((u) =>
// //             u.username === data.username ? { ...u, role: data.role } : u,
// //           ),
// //         );
// //         Swal.fire({
// //           icon: "success",
// //           title: "موفق",
// //           text: "نقش کاربر با موفقیت تغییر کرد",
// //         });
// //         setUserModalOpen(false);
// //         setEditingUser(null);
// //       } else {
// //         await createUser(data.fullname, data.email, data.password, data.role);
// //         setUsers((prev) => [
// //           ...prev,
// //           {
// //             fullname: data.fullname,
// //             email: data.email,
// //             role: data.role,
// //             id: Date.now(),
// //           },
// //         ]);
// //         Swal.fire({
// //           icon: "success",
// //           title: "کاربر ایجاد شد",
// //         });
// //         setUserModalOpen(false);
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       Swal.fire({
// //         icon: "error",
// //         title: "خطا",
// //         text: "عملیات انجام نشد",
// //       });
// //     }
// //   };

// //   // --- Data Fetching ---
// //   useEffect(() => {
// //     const fetchMe = async () => {
// //       try {
// //         const res = await getMe();
// //         setMe(res.data || res);
// //       } catch (err) {
// //         console.error(err);
// //         setError("خطا در دریافت اطلاعات کاربر");
// //       } finally {
// //         setLoadingMe(false);
// //       }
// //     };
// //     fetchMe();
// //   }, []);

// //   useEffect(() => {
// //     const fetchUsers = async () => {
// //       try {
// //         const res = await getUsers();
// //         setUsers(res.data || res);
// //       } catch (err) {
// //         console.error(err);
// //         setError("خطا در دریافت لیست کاربران");
// //       } finally {
// //         setLoadingUsers(false);
// //       }
// //     };
// //     if (permissions.canViewUsers) {
// //       fetchUsers();
// //     }
// //   }, []);

// //   // --- Profile Form Sync ---
// //   // پر کردن فرم با اطلاعات کاربر
// //   useEffect(() => {
// //     if (!me) return;
// //     setProfileForm((prev) => ({
// //       ...prev,
// //       fullname: me.fullname || "",
// //       email: me.email || "",
// //       city: me.city || "",
// //       company: me.company || "",
// //     }));
// //   }, [me]);

// //   // همگام سازی پیش‌نمایش لوگو با لوگوی فعلی شرکت (فقط اگر کاربر فایل جدیدی انتخاب نکرده باشد)
// //   // این بخش باعث می‌شود وقتی کاربر وارد صفحه می‌شود یا منصرف شده و برمی‌گردد، لوگوی اصلی را ببیند
// //   useEffect(() => {
// //     if (companyLogo && !profileForm.logo) {
// //       setProfileForm((prev) => ({
// //         ...prev,
// //         logoPreview: companyLogo,
// //       }));
// //     }
// //   }, [companyLogo, profileForm.logo]);

// //   // پاکسازی حافظه Blob هنگام Unmount یا تغییر عکس جدید
// //   useEffect(() => {
// //     return () => {
// //       if (
// //         profileForm.logoPreview &&
// //         profileForm.logoPreview.startsWith("blob:")
// //       ) {
// //         URL.revokeObjectURL(profileForm.logoPreview);
// //       }
// //     };
// //   }, [profileForm.logoPreview]);

// //   // --- Profile Submit Handler ---
// //   const handleProfileSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       if (isAdmin) {
// //         const formData = new FormData();
// //         formData.append("fullname", profileForm.fullname);
// //         formData.append("username", profileForm.email);
// //         formData.append("city", profileForm.city);
// //         formData.append("company", profileForm.company);

// //         if (profileForm.password) {
// //           formData.append("password", profileForm.password);
// //         }

// //         if (profileForm.logo) {
// //           formData.append("logo", profileForm.logo);
// //         }

// //         const res = await updateAdminProfile(formData);

// //         // وقتی آپدیت موفق بود، حالا Context سراسری را آپدیت می‌کنیم
// //         if (res?.logo) {
// //           const finalLogo = res.logo.startsWith("http")
// //             ? res.logo
// //             : `${process.env.REACT_APP_MEDIA_URL}${res.logo}`;

// //           // 1. آپدیت سایدبار و کل اپلیکیشن
// //           setLogo(finalLogo); 
          
// //           // 2. فیکس کردن پیش‌نمایش فرم روی لینک نهایی و پاک کردن فایل موقت
// //           setProfileForm(prev => ({
// //             ...prev,
// //             logo: null, // ریست کردن فایل
// //             logoPreview: finalLogo // ست کردن لینک واقعی
// //           }));
// //         }
// //       } else {
// //         const payload = {
// //           fullname: profileForm.fullname,
// //           password: profileForm.password || undefined,
// //         };
// //         await updateUserProfile(payload);
// //       }

// //       Swal.fire({
// //         icon: "success",
// //         title: "اطلاعات با موفقیت ویرایش شد",
// //         confirmButtonText: "متوجه شدم",
// //       }).then(() => {
// //         // اختیاری: اگر نیاز به ریلود کامل نیست، این خط را می‌توان برداشت
// //         // window.location.reload(); 
// //       });
// //     } catch (err) {
// //       console.error(err);
// //       Swal.fire({
// //         icon: "error",
// //         title: "خطا در ویرایش اطلاعات",
// //         text: "اطلاعات به درستی وارد نشده است.",
// //         confirmButtonText: "تلاش مجدد",
// //       });
// //     }
// //   };

// //   return (
// //     <>
// //       <div className="content">
// //         {error && <p className="error-load">{error}</p>}
// //         <Row>
// //           <Col md="4">
// //             <Card className="card-user">
// //               <div className="image">
// //                 <img alt="..." src={require("assets/img/damir-bosnjak.jpg")} />
// //               </div>
// //               <CardBody>
// //                 <div className="author">
// //                   <a onClick={(e) => e.preventDefault()}>
// //                     <Avatar name={me?.fullname} size={80} />
// //                     {loadingMe ? (
// //                       <p className="text-center">در حال بارگذاری...</p>
// //                     ) : (
// //                       me && (
// //                         <>
// //                           <h5 className="title">{me.fullname}</h5>
// //                           <p className="description">{me.email}</p>
// //                         </>
// //                       )
// //                     )}
// //                   </a>
// //                   <p className="description text-center">
// //                     {me?.role === "admin"
// //                       ? "مدیر سیستم"
// //                       : me?.role === "editor"
// //                         ? "ویرایشگر"
// //                         : "کاربرعادی"}
// //                   </p>
// //                 </div>
// //               </CardBody>
// //               <CardFooter>
// //                 <hr />
// //               </CardFooter>
// //             </Card>
// //             <Card>
// //               <CardHeader>
// //                 <CardTitle tag="h4">لیست کاربران</CardTitle>
// //                 <Input
// //                   type="text"
// //                   placeholder="جستجو بر اساس نام یا ایمیل..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="mb-3"
// //                 />
// //                 {permissions.canCRUDUser && (
// //                   <AddNewBtn
// //                     content="افزودن کاربر جدید"
// //                     onClick={() => {
// //                       setEditingUser(null);
// //                       setUserModalOpen(true);
// //                     }}
// //                   />
// //                 )}
// //               </CardHeader>
// //               <CardBody>
// //                 <UserModal
// //                   isOpen={userModalOpen}
// //                   toggle={() => setUserModalOpen(false)}
// //                   onSave={handleSaveUser}
// //                   itemData={editingUser}
// //                   isEditMode={!!editingUser}
// //                 />
// //                 {loadingUsers ? (
// //                   <p className="text-center">در حال بارگذاری کاربران...</p>
// //                 ) : paginatedUsers.length === 0 ? (
// //                   <p className="text-center text-muted">کاربری یافت نشد</p>
// //                 ) : (
// //                   <ul className="list-unstyled team-members">
// //                     {paginatedUsers.map((user) => (
// //                       <li key={user.id}>
// //                         <Row className="userShow-box">
// //                           <div className="user-info">
// //                             <div className="avatar">
// //                               <Avatar name={user.fullname} size={40} />
// //                             </div>
// //                             <div className="user-name">
// //                               {user.fullname}
// //                               <br />
// //                               <span
// //                                 className={
// //                                   user.role === "admin"
// //                                     ? "text-success fw-bold"
// //                                     : "text-muted"
// //                                 }
// //                               >
// //                                 <small>
// //                                   {user.role === "admin"
// //                                     ? "مدیر"
// //                                     : user.role === "editor"
// //                                       ? "ویرایشگر"
// //                                       : "کاربر عادی"}
// //                                 </small>
// //                               </span>
// //                             </div>
// //                           </div>

// //                           {permissions.canCRUDUser && (
// //                             <div className="text-right">
// //                               <Button
// //                                 size="sm"
// //                                 onClick={() => editUserRole(user)}
// //                               >
// //                                 ویرایش
// //                               </Button>
// //                               <Button
// //                                 size="sm"
// //                                 color="danger"
// //                                 onClick={() => deleteUser(user.username)}
// //                               >
// //                                 حذف
// //                               </Button>
// //                             </div>
// //                           )}
// //                         </Row>
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 )}
// //                 {totalPages > 1 && (
// //                   <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
// //                     <Button
// //                       size="sm"
// //                       color="light"
// //                       disabled={currentPage === 1}
// //                       onClick={() => setCurrentPage((p) => p - 1)}
// //                       className="d-flex align-items-center justify-content-center"
// //                       style={{ width: 36, height: 22 }}
// //                     >
// //                       <FaChevronRight />
// //                     </Button>
// //                     <span
// //                       className="align-self-center text-muted"
// //                       style={{ fontSize: "12px", padding: "0 0.5rem" }}
// //                     >
// //                       صفحه {currentPage} از {totalPages}
// //                     </span>
// //                     <Button
// //                       size="sm"
// //                       color="light"
// //                       disabled={currentPage === totalPages}
// //                       onClick={() => setCurrentPage((p) => p + 1)}
// //                       className="d-flex align-items-center justify-content-center"
// //                       style={{ width: 36, height: 22 }}
// //                     >
// //                       <FaChevronLeft />
// //                     </Button>
// //                   </div>
// //                 )}
// //               </CardBody>
// //             </Card>
// //           </Col>
// //           <Col md="8">
// //             <Card className="card-user">
// //               <CardHeader>
// //                 <CardTitle tag="h5">ویرایش پروفایل</CardTitle>
// //               </CardHeader>
// //               <CardBody>
// //                 <Form onSubmit={handleProfileSubmit}>
// //                   <Row>
// //                     <Col className="pr-1" md="5">
// //                       <FormGroup>
// //                         <label>نام شرکت</label>
// //                         <Input
// //                           disabled={!permissions.canEditCompanyInfo}
// //                           value={profileForm.company}
// //                           onChange={(e) =>
// //                             setProfileForm({
// //                               ...profileForm,
// //                               company: e.target.value,
// //                             })
// //                           }
// //                           type="text"
// //                         />
// //                       </FormGroup>
// //                     </Col>
// //                     <Col className="pr-1" md="5">
// //                       <FormGroup>
// //                         <label>نام و نام خانوادگی</label>
// //                         <Input
// //                           value={profileForm.fullname}
// //                           onChange={(e) =>
// //                             setProfileForm({
// //                               ...profileForm,
// //                               fullname: e.target.value,
// //                             })
// //                           }
// //                           type="text"
// //                         />
// //                       </FormGroup>
// //                     </Col>
// //                     <Col className="px-1" md="3">
// //                       <FormGroup>
// //                         <label> نام کاربری(ایمیل)</label>
// //                         <Input
// //                           value={profileForm.email}
// //                           onChange={(e) =>
// //                             setProfileForm({
// //                               ...profileForm,
// //                               email: e.target.value,
// //                             })
// //                           }
// //                           type="email"
// //                           disabled
// //                         />
// //                       </FormGroup>
// //                     </Col>
// //                   </Row>
// //                   <Row>
// //                     <Col className="pr-1" md="4">
// //                       <FormGroup style={{ position: "relative" }}>
// //                         <label>رمز عبور</label>
// //                         <Input
// //                           value={profileForm.password}
// //                           onChange={(e) =>
// //                             setProfileForm({
// //                               ...profileForm,
// //                               password: e.target.value,
// //                             })
// //                           }
// //                           type={showNewPassword ? "text" : "password"}
// //                           className="password-input"
// //                           style={{ paddingLeft: "40px" }}
// //                         />
// //                         <span
// //                           onClick={() => setShowNewPassword(!showNewPassword)}
// //                           style={{
// //                             position: "absolute",
// //                             left: "10px",
// //                             top: "70%",
// //                             transform: "translateY(-50%)",
// //                             cursor: "pointer",
// //                             color: "#555",
// //                           }}
// //                         >
// //                           {showNewPassword ? <FaEyeSlash /> : <FaEye />}
// //                         </span>
// //                       </FormGroup>
// //                     </Col>
// //                   </Row>
// //                   <Row>
// //                     <Col className="pr-1" md="4">
// //                       <FormGroup>
// //                         <label>لوگوی شرکت</label>

// //                         <div className="logo-upload-wrapper">
// //                           <label
// //                             htmlFor="logo-upload"
// //                             className="logo-upload-box"
// //                           >
// //                             {/* نمایش پیش نمایش محلی یا لوگوی شرکت */}
// //                             {profileForm.logoPreview ? (
// //                               <CompanyLogo
// //                                 src={profileForm.logoPreview}
// //                                 size={100}
// //                               />
// //                             ) : (
// //                               <div className="logo-placeholder">
// //                                 <span>📷</span>
// //                                 <p>انتخاب لوگو</p>
// //                               </div>
// //                             )}
// //                           </label>

// //                           <input
// //                             id="logo-upload"
// //                             disabled={!permissions.canEditCompanyInfo}
// //                             type="file"
// //                             accept="image/*"
// //                             hidden
// //                             onChange={(e) => {
// //                               const file = e.target.files[0];
// //                               if (!file) return;

// //                               const previewUrl = URL.createObjectURL(file);

// //                               // فقط استیت محلی فرم را آپدیت کن، نه کانتکست سراسری را
// //                               setProfileForm((prev) => ({
// //                                 ...prev,
// //                                 logo: file,
// //                                 logoPreview: previewUrl,
// //                               }));
                            
// //                             }}
// //                           />
// //                         </div>
// //                       </FormGroup>
// //                     </Col>
// //                   </Row>
// //                   <Row>
// //                     <Col className="pr-1" md="4">
// //                       <FormGroup>
// //                         <label>شهر</label>
// //                         <Input
// //                           disabled={!permissions.canEditCompanyInfo}
// //                           value={profileForm.city}
// //                           onChange={(e) =>
// //                             setProfileForm({
// //                               ...profileForm,
// //                               city: e.target.value,
// //                             })
// //                           }
// //                           type="text"
// //                         />
// //                       </FormGroup>
// //                     </Col>
// //                   </Row>
// //                   <Row>
// //                     <div className="update ml-auto mr-auto">
// //                       <Button
// //                         className="btn-round"
// //                         color="primary"
// //                         type="submit"
// //                       >
// //                         ویرایش اطلاعات
// //                       </Button>
// //                     </div>
// //                   </Row>
// //                 </Form>
// //               </CardBody>
// //             </Card>
// //           </Col>
// //         </Row>
// //       </div>
// //     </>
// //   );
// // }

// // export default User;

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
} from "reactstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import UserModal from "components/UserModal";
import {
  createUser,
  getMe,
  getUsers,
  updateAdminProfile,
  updateUserProfile,
  editUserRoleByAdmin,
  deleteUserRoleByAdmin,
} from "../services/user.api";
import AddNewBtn from "./AddNewBtn";
import Swal from "sweetalert2";
import CompanyLogo from "./../components/CompanyLogo";
import { useCompanyLogo } from "../hooks/useCompanyLogo";
import { useAuth } from "../contexts/AuthContext";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import Avatar from "./../components/Avatar/Avatar";

function User() {
  const { user } = useAuth();
  const isAdmin = user.role == "admin";
  const role = user?.role;
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  
  const [loadingMe, setLoadingMe] = useState(true);
  
  const [profileForm, setProfileForm] = useState({
    fullname: "",
    email: "",
    city: "",
    company: "",
    password: "",
    logo: null,
    logoPreview: "", 
  });

  const { logo: companyLogo, setLogo } = useCompanyLogo();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 3;
  let permissions = {
    canViewUsers: true,
    canCRUDUser: role === "admin",
    canDeleteUser: role === "admin",
    canEditUsers: role === "admin",
    canEditProfile: true,
    canEditCompanyInfo: role === "admin",
    canEditCity: role === "admin",
    canEditLogo: role === "admin",
  };

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- Sort & Pagination Logic ---
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return 0;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(
      (user) =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [sortedUsers, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const deleteUser = async (username) => {
    Swal.fire({
      title: "آیااز حذف کاربر مطمئن هستید؟",
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود",
      cancelButtonText: "خیر",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUserRoleByAdmin(username);
          setUsers((prev) => prev.filter((u) => u.username !== username));
          Swal.fire({
            title: "موفق!",
            text: "کاربر با موفقیت حذف شد",
            icon: "success",
          });
        } catch {
          Swal.fire({
            title: "خطا در حذف کاربر",
            text: "عملیات حذف انجام نشد",
            icon: "error",
          });
        }
      }
    });
  };

  const editUserRole = async (user) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (data, isEdit) => {
    try {
      if (isEdit) {
        await editUserRoleByAdmin(data.username, data.role);
        setUsers((prev) =>
          prev.map((u) =>
            u.username === data.username ? { ...u, role: data.role } : u,
          ),
        );
        Swal.fire({
          icon: "success",
          title: "موفق",
          text: "نقش کاربر با موفقیت تغییر کرد",
        });
        setUserModalOpen(false);
        setEditingUser(null);
      } else {
        await createUser(data.fullname, data.email, data.password, data.role);
        setUsers((prev) => [
          ...prev,
          {
            fullname: data.fullname,
            email: data.email,
            role: data.role,
            username : data.email,
            id: Date.now(),
          },
        ]);
        Swal.fire({
          icon: "success",
          title: "کاربر ایجاد شد",
        });
        setUserModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "عملیات انجام نشد",
      });
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await getMe();
        setMe(res.data || res);
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت اطلاعات کاربر");
      } finally {
        setLoadingMe(false);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.data || res);
      } catch (err) {
        console.error(err);
        setError("خطا در دریافت لیست کاربران");
      } finally {
        setLoadingUsers(false);
      }
    };
    if (permissions.canViewUsers) {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    setProfileForm((prev) => ({
      ...prev,
      fullname: me.fullname || "",
      email: me.email || "",
      city: me.city || "",
      company: me.company || "",
    }));
  }, [me]);

  useEffect(() => {
    if (companyLogo && !profileForm.logo) {
      setProfileForm((prev) => ({
        ...prev,
        logoPreview: companyLogo,
      }));
    }
  }, [companyLogo, profileForm.logo]);

  useEffect(() => {
    return () => {
      if (
        profileForm.logoPreview &&
        profileForm.logoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(profileForm.logoPreview);
      }
    };
  }, [profileForm.logoPreview]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isAdmin) {
        const formData = new FormData();
        formData.append("fullname", profileForm.fullname);
        formData.append("username", profileForm.email);
        formData.append("city", profileForm.city);
        formData.append("company", profileForm.company);

        if (profileForm.password) {
          formData.append("password", profileForm.password);
        }

        if (profileForm.logo) {
          formData.append("logo", profileForm.logo);
        }

        const res = await updateAdminProfile(formData);

        if (res?.logo) {
          const finalLogo = res.logo.startsWith("http")
            ? res.logo
            : `${process.env.REACT_APP_MEDIA_URL}${res.logo}`;

          setLogo(finalLogo); 
          
          setProfileForm(prev => ({
            ...prev,
            logo: null, 
            logoPreview: finalLogo 
          }));
        }
      } else {
        const payload = {
          fullname: profileForm.fullname,
          password: profileForm.password || undefined,
        };
        await updateUserProfile(payload);
      }

      Swal.fire({
        icon: "success",
        title: "اطلاعات با موفقیت ویرایش شد",
        confirmButtonText: "متوجه شدم",
      }).then(() => {
        window.location.reload(); 
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "خطا در ویرایش اطلاعات",
        text: "اطلاعات به درستی وارد نشده است.",
        confirmButtonText: "تلاش مجدد",
      });
    }
  };

  return (
    <>
      <div className="content">
        {error && <p className="error-load">{error}</p>}
        <Row>
          <Col md="4">
            <Card className="card-user">
              <div className="image">
                <img alt="..." src={require("assets/img/damir-bosnjak.jpg")} />
              </div>
              <CardBody>
                <div className="author">
                  <a onClick={(e) => e.preventDefault()}>
                    <Avatar name={me?.fullname} size={80} />
                    {loadingMe ? (
                      <p className="text-center">در حال بارگذاری...</p>
                    ) : (
                      me && (
                        <>
                          <h5 className="title">{me.fullname}</h5>
                          <p className="description">{me.email}</p>
                        </>
                      )
                    )}
                  </a>
                  <p className="description text-center">
                    {me?.role === "admin"
                      ? "مدیر سیستم"
                      : me?.role === "editor"
                        ? "ویرایشگر"
                        : "کاربرعادی"}
                  </p>
                </div>
              </CardBody>
              <CardFooter>
                <hr />
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">لیست کاربران</CardTitle>
                <Input
                  type="text"
                  placeholder="جستجو بر اساس نام یا ایمیل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-3"
                />
                {permissions.canCRUDUser && (
                  <AddNewBtn
                    content="افزودن کاربر جدید"
                    onClick={() => {
                      setEditingUser(null);
                      setUserModalOpen(true);
                    }}
                  />
                )}
              </CardHeader>
              <CardBody>
                <UserModal
                  isOpen={userModalOpen}
                  toggle={() => setUserModalOpen(false)}
                  onSave={handleSaveUser}
                  itemData={editingUser}
                  isEditMode={!!editingUser}
                />
                {loadingUsers ? (
                  <p className="text-center">در حال بارگذاری کاربران...</p>
                ) : paginatedUsers.length === 0 ? (
                  <p className="text-center text-muted">کاربری یافت نشد</p>
                ) : (
                  <ul className="list-unstyled team-members">
                    {paginatedUsers.map((user) => (
                      <li key={user.id}>
                        <Row className="userShow-box">
                          <div className="user-info">
                            <div className="avatar">
                              <Avatar name={user.fullname} size={40} />
                            </div>
                            <div className="user-name">
                              {user.fullname}
                              <br />
                              <span
                                className={
                                  user.role === "admin"
                                    ? "text-success fw-bold"
                                    : "text-muted"
                                }
                              >
                                <small>
                                  {user.role === "admin"
                                    ? "مدیر"
                                    : user.role === "editor"
                                      ? "ویرایشگر"
                                      : "کاربر عادی"}
                                </small>
                              </span>
                            </div>
                          </div>

                          {permissions.canCRUDUser && user.role !== "admin" && (
                            <div className="text-right">

                              <Button
                                size="sm"
                                onClick={() => editUserRole(user)}
                              >
                                ویرایش
                              </Button>    
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => deleteUser(user.username)}
                              >
                                حذف
                              </Button>
                            </div>
                          )}
                        </Row>
                      </li>
                    ))}
                  </ul>
                )}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
                    <Button
                      size="sm"
                      color="light"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 22 }}
                    >
                      <FaChevronRight />
                    </Button>
                    <span
                      className="align-self-center text-muted"
                      style={{ fontSize: "12px", padding: "0 0.5rem" }}
                    >
                      صفحه {currentPage} از {totalPages}
                    </span>
                    <Button
                      size="sm"
                      color="light"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 22 }}
                    >
                      <FaChevronLeft />
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col md="8">
            <Card className="card-user">
              <CardHeader>
                <CardTitle tag="h5">ویرایش پروفایل</CardTitle>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleProfileSubmit}>
                  <Row>
                    <Col className="pr-1" md="5">
                      <FormGroup>
                        <label>نام شرکت</label>
                        <Input
                          disabled={!permissions.canEditCompanyInfo}
                          value={profileForm.company}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              company: e.target.value,
                            })
                          }
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pr-1" md="5">
                      <FormGroup>
                        <label>نام و نام خانوادگی</label>
                        <Input
                          value={profileForm.fullname}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              fullname: e.target.value,
                            })
                          }
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="3">
                      <FormGroup>
                        <label> نام کاربری(ایمیل)</label>
                        <Input
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                          type="email"
                          disabled
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup style={{ position: "relative" }}>
                        <label>رمز عبور</label>
                        <Input
                          value={profileForm.password}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              password: e.target.value,
                            })
                          }
                          type={showNewPassword ? "text" : "password"}
                          className="password-input"
                          style={{ paddingLeft: "40px" }}
                        />
                        <span
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "70%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#555",
                          }}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup>
                        <label>لوگوی شرکت</label>

                        <div className="logo-upload-wrapper">
                          <label
                            htmlFor="logo-upload"
                            className="logo-upload-box"
                          >
                            {profileForm.logoPreview ? (
                              <CompanyLogo
                                src={profileForm.logoPreview}
                                size={100}
                              />
                            ) : (
                              <div className="logo-placeholder">
                                <span>📷</span>
                                <p>انتخاب لوگو</p>
                              </div>
                            )}
                          </label>

                          <input
                            id="logo-upload"
                            disabled={!permissions.canEditCompanyInfo}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              const previewUrl = URL.createObjectURL(file);

                              setProfileForm((prev) => ({
                                ...prev,
                                logo: file,
                                logoPreview: previewUrl,
                              }));                       
                           }}
                          />
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup>
                        <label>شهر</label>
                        <Input
                          disabled={!permissions.canEditCompanyInfo}
                          value={profileForm.city}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              city: e.target.value,
                            })
                          }
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <div className="update ml-auto mr-auto">
                      <Button
                        className="btn-round"
                        color="primary"
                        type="submit"
                      >
                        ویرایش اطلاعات
                      </Button>
                    </div>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default User;
