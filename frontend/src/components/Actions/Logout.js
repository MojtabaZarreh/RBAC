import Swal from "sweetalert2";
import { logout as logoutApi } from "../../services/auth.api";

const handleLogout = async ({ logout }) => {
  try {

    await Swal.fire({
      icon: "success",
      title: "خروج موفق",
      text: "شما با موفقیت خارج شدید",
      timer: 1500,
      showConfirmButton: false,
    });

    localStorage.removeItem("api_token");
    
    if(logout) logout();

    window.location.href = "/auth"; 

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "خطا",
      text: "مشکلی در خروج از حساب پیش آمد",
    });
  }
};

export default handleLogout;
