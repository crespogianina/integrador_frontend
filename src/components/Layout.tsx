import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
