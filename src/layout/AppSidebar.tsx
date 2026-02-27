import React, { useEffect, useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";

import logo from "../assest/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faGlobe,
  faChartPie,
  faBell,
  faMoneyBill1,
  faImagePortrait,
  faMobile,
  faPencil,
  faFaceGrinStars,
  faFire,
  faHourglass,
  faHeart,
  faHandshake,
  faMask,
  faTrophy,
  faMessage,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <FontAwesomeIcon icon={faMoneyBill1} />,
    name: "Premium Plan",
    path: "/premium",
  },
  {
    icon: <FontAwesomeIcon icon={faPencil} />,
    name: "Hint Funny Content",
    path: "/hint/content",
  },
  {
    icon: <FontAwesomeIcon icon={faHandshake} />,
    name: "Collab",
    path: "/collab",
  },
  {
    icon: <FontAwesomeIcon icon={faHourglass} />,
    name: "Temporary",
    path: "/temp",
  },
];

const questionItems: NavItem[] = [
  {
    icon: <FontAwesomeIcon icon={faImagePortrait} />,
    name: "Annoy Funny CardBg (3 Ques)",
    path: "/cardBg",
  },
  {
    name: "Emotion (4 Ques)",
    icon: <FontAwesomeIcon icon={faFaceGrinStars} />,
    subItems: [
      { name: "CardBg", path: "/emotion/cardBg" },
      { name: "Emoji", path: "/emotion/emoji" },
      { name: "Content", path: "/emotion/content" },
    ],
  },
  {
    name: "Hotness (6 Ques)",
    icon: <FontAwesomeIcon icon={faFire} />,
    subItems: [
      { name: "Category", path: "/hotness/category" },
      { name: "CardBg", path: "/hotness/cardBg" },
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faHeart} />,
    name: "Friends or Love or Crush CardBg (7 Ques)",
    path: "/friend/cardBg",
  },
  {
    icon: <FontAwesomeIcon icon={faMask} />,
    name: "Bluff CardBg (9 Ques)",
    path: "/bluff/cardBg",
  },
  {
    icon: <FontAwesomeIcon icon={faTrophy} />,
    name: "Challenge Content (10 Ques)",
    path: "/challenge/content",
  },
  {
    name: "Heaven Hell (11 Ques)",
    icon: <FontAwesomeIcon icon={faFire} />,
    subItems: [
      { name: "CardBg", path: "/heaven-hell/cardBg" },
      { name: "Content", path: "/heaven-hell/content" },
    ],
  },
  {
    icon: <FontAwesomeIcon icon={faClock} />,
    name: "Coming Soon",
    path: "/coming-soon",
  },
];

const notificationItems: NavItem[] = [
  {
    icon: <FontAwesomeIcon icon={faGlobe} />,
    name: "Push Notification",
    path: "/push-notification",
  },
  {
    icon: <FontAwesomeIcon icon={faBell} />,
    name: "Auto Notification",
    path: "/auto-notification",
  },
  {
    icon: <FontAwesomeIcon icon={faMessage} />,
    name: "Auto Message Notification",
    path: "/message",
  },
];

const analyticsItems: NavItem[] = [
  {
    icon: <FontAwesomeIcon icon={faMobile} />,
    name: "Device Control (Block & Delete) & Testing Urls",
    path: "/device",
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} />,
    name: "Que & Web Monitoring",
    path: "/monitoring",
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} />,
    name: "Influencer Video Collaboration",
    path: "/video-collaboration",
  },
  {
    icon: <FontAwesomeIcon icon={faChartPie} />,
    name: "Influencer Share Link Story Collaboration",
    path: "/story-collaboration",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "analytics" | "question" | "notification";
    index: number;
  } | null>(null);

  const [openSections, setOpenSections] = useState<{
    general: boolean;
    question: boolean;
    notification: boolean;
    analytics: boolean;
  }>({
    general: true,
    question: false,
    notification: false,
    analytics: false,
  });

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Auto-open submenu based on active route
  useEffect(() => {
    let submenuMatched = false;
    (["main", "analytics", "question", "notification"] as const).forEach((menuType) => {
      const items =
        menuType === "main"
          ? navItems
          : menuType === "analytics"
          ? analyticsItems
          : menuType === "question"
          ? questionItems
          : notificationItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  // Measure submenu heights when opened
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "analytics" | "question" | "notification"
  ) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // ✅ Simple toggle — no height measurement needed for sections
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "analytics" | "question" | "notification"
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // ✅ Reusable section renderer to avoid repetition
  const renderSection = (
    key: keyof typeof openSections,
    label: string,
    items: NavItem[],
    menuType: "main" | "analytics" | "question" | "notification"
  ) => (
    <div>
      <button
        onClick={() => toggleSection(key)}
        className={`mb-4 w-full text-xs uppercase flex items-center leading-[20px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-between"
        }`}
      >
        {isExpanded || isHovered || isMobileOpen ? (
          <>
            <span>{label}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                openSections[key] ? "rotate-180" : ""
              }`}
            />
          </>
        ) : (
          <HorizontaLDots />
        )}
      </button>

      {/* ✅ Using maxHeight instead of height — no measurement needed */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: openSections[key] ? "1000px" : "0px",
        }}
      >
        {renderMenuItems(items, menuType)}
      </div>
    </div>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[260px]"
            : isHovered
            ? "w-[260px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="mx-auto">
          <img src={logo} alt="Logo" width={100} />
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {renderSection("general", "General", navItems, "main")}
            {renderSection("question", "Question", questionItems, "question")}
            {renderSection("notification", "Notification", notificationItems, "notification")}
            {renderSection("analytics", "Analytics", analyticsItems, "analytics")}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;