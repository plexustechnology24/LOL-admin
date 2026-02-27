import React, { useEffect, useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";

import logo from "../assest/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faGlobe, faChartPie, faBell, faMoneyBill1, faImagePortrait, faMobile, faPencil, faFaceGrinStars, faFire, faHourglass, faHeart, faHandshake, faMask, faTrophy, faMessage } from "@fortawesome/free-solid-svg-icons";

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

// 🔹 New question nav items
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
      { name: "CardBg", path: "/emotion/cardBg", pro: false },
      { name: "Emoji", path: "/emotion/emoji", pro: false },
      { name: "Content", path: "/emotion/content", pro: false },
    ],
  },
  {
    name: "Hotness (6 Ques)",
    icon: <FontAwesomeIcon icon={faFire} />,
    subItems: [
      { name: "Category", path: "/hotness/category", pro: false },
      { name: "CardBg", path: "/hotness/cardBg", pro: false },
    ],
  },
  {
    name: "Friends or Love or Crush (7 Ques)",
    icon: <FontAwesomeIcon icon={faHeart} />,
    subItems: [
      { name: "CardBg", path: "/friend/cardBg", pro: false },
    ],
  },
  {
    name: "Bluff (9 Ques)",
    icon: <FontAwesomeIcon icon={faMask} />,
    subItems: [
      { name: "CardBg", path: "/bluff/cardBg", pro: false },
    ],
  },
  {
    name: "Challenge (10 Ques)",
    icon: <FontAwesomeIcon icon={faTrophy} />,
    subItems: [
      { name: "Content", path: "/challenge/content", pro: false },
    ],
  },
  {
    name: "Heaven Hell (11 Ques)",
    icon: <FontAwesomeIcon icon={faFire} />,
    subItems: [
      { name: "CardBg", path: "/heaven-hell/cardBg", pro: false },
      { name: "Content", path: "/heaven-hell/content", pro: false },
    ],
  },
];

// 🔹 New notification nav items
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

// 🔹 New analytics nav items
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

  // 🔹 New state for section dropdowns
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
  const [sectionHeight, setSectionHeight] = useState<Record<string, number>>({});

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "analytics", "question", "notification"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : menuType === "analytics" ? analyticsItems : menuType === "question" ? questionItems : notificationItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "analytics" | "question" | "notification",
                index,
              });
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

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // 🔹 Update section heights when they open/close
  useEffect(() => {
    Object.keys(openSections).forEach((sectionKey) => {
      if (sectionRefs.current[sectionKey]) {
        setSectionHeight((prevHeights) => ({
          ...prevHeights,
          [sectionKey]: sectionRefs.current[sectionKey]?.scrollHeight || 0,
        }));
      }
    });
  }, [openSections, openSubmenu, isExpanded, isHovered, isMobileOpen]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "analytics" | "question" | "notification"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // 🔹 Toggle section dropdown
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "analytics" | "question" | "notification") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`${openSubmenu?.type === menuType && openSubmenu?.index === index
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
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
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
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
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
                  openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
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

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
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
        className={`py-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/" className="mx-auto">
          <>
            <img src={logo} alt="Logo" width={100} />
          </>
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* 🔹 General Section */}
            <div>
              <button
                onClick={() => toggleSection("general")}
                className={`mb-4 w-full text-xs uppercase flex items-center leading-[20px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-between"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <>
                    <span>General</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${openSections.general ? "rotate-180" : ""
                        }`}
                    />
                  </>
                ) : (
                  <HorizontaLDots />
                )}
              </button>
              <div
                ref={(el) => {
                  sectionRefs.current["general"] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: openSections.general
                    ? `${sectionHeight["general"]}px`
                    : "0px",
                }}
              >
                {renderMenuItems(navItems, "main")}
              </div>
            </div>

            {/* 🔹 Question Section */}
            <div>
              <button
                onClick={() => toggleSection("question")}
                className={`mb-4 w-full text-xs uppercase flex items-center leading-[20px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-between"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <>
                    <span>Question</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${openSections.question ? "rotate-180" : ""
                        }`}
                    />
                  </>
                ) : (
                  <HorizontaLDots />
                )}
              </button>
              <div
                ref={(el) => {
                  sectionRefs.current["question"] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: openSections.question
                    ? `${sectionHeight["question"]}px`
                    : "0px",
                }}
              >
                {renderMenuItems(questionItems, "question")}
              </div>
            </div>

            {/* 🔹 Notification Section */}
            <div>
              <button
                onClick={() => toggleSection("notification")}
                className={`mb-4 w-full text-xs uppercase flex items-center leading-[20px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-between"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <>
                    <span>Notification</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${openSections.notification ? "rotate-180" : ""
                        }`}
                    />
                  </>
                ) : (
                  <HorizontaLDots />
                )}
              </button>
              <div
                ref={(el) => {
                  sectionRefs.current["notification"] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: openSections.notification
                    ? `${sectionHeight["notification"]}px`
                    : "0px",
                }}
              >
                {renderMenuItems(notificationItems, "notification")}
              </div>
            </div>

            {/* 🔹 Analytics Section */}
            <div>
              <button
                onClick={() => toggleSection("analytics")}
                className={`mb-4 w-full text-xs uppercase flex items-center leading-[20px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-between"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <>
                    <span>Analytics</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${openSections.analytics ? "rotate-180" : ""
                        }`}
                    />
                  </>
                ) : (
                  <HorizontaLDots />
                )}
              </button>
              <div
                ref={(el) => {
                  sectionRefs.current["analytics"] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: openSections.analytics
                    ? `${sectionHeight["analytics"]}px`
                    : "0px",
                }}
              >
                {renderMenuItems(analyticsItems, "analytics")}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;