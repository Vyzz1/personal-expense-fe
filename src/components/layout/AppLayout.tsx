import { Layout, Menu, Button, theme, Dropdown, Avatar, Drawer, Grid } from "antd";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LogOut,
  Menu as MenuIcon,
  User,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { AppstoreOutlined, DashboardOutlined, TransactionOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { location } = useRouterState();
  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  // Auto-close mobile menu when changing routes
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined size={18} />,
      label: <Link to="/">Dashboard</Link>,
    },
     {
      key: "/transaction",
      icon: <TransactionOutlined size={18} />,
      label: <Link to="/transaction">Transactions</Link>,
    },
    {
      key: "/category",
      icon: <AppstoreOutlined size={18} />,
      label: <Link to="/category">Categories</Link>,
    },
    {
      key: "/about",
      icon: <User size={18} />,
      label: <Link to="/about">About</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: <Link to="/about">Profile</Link>,
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: <Link to="/logout">Logout</Link>,
      danger: true,
    },
  ];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
            PE
          </div>
          {(!collapsed || isMobile) && <span className="whitespace-nowrap truncate">Personal Expense</span>}
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="mt-3 border-r-0 text-[14px]"
      />
    </>
  );

  return (
    <Layout className="min-h-screen">
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          className="!bg-white border-r border-gray-200 shadow-sm z-20"
        >
          {sidebarContent}
        </Sider>
      )}

      {/* MOBILE DRAWER */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        width={260}
      >
        <div className="h-full flex flex-col bg-white">
          {sidebarContent}
        </div>
      </Drawer>

      <Layout>
        {/* HEADER */}
        <Header className="!bg-white px-4 flex justify-between items-center border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <Button
            type="text"
            icon={<MenuIcon size={20} className="text-gray-600" />}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className="hover:bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full"
          />

          {/* USER */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              <Avatar className="bg-gradient-to-r from-blue-500 to-indigo-500">
                U
              </Avatar>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                User
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </Dropdown>
        </Header>

        {/* CONTENT */}
        <Content className="m-6">
          <div
            className="bg-white p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-112px)]"
            style={{ borderRadius: borderRadiusLG }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};