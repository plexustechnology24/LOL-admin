import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import WebAnalytics from "./Webanalytics";
import WebOverview from "./webOverview";

const Main = () => {

    const [activeTab, setActiveTab] = useState("link");


    return (
        <div>
            <PageBreadcrumb pageTitle="Influencer Story Collaboration" />

            {/* Tab Buttons */}
            <div className="flex rounded-lg mb-6 w-full bg-gray-100 gap-5 ps-3 dark:bg-gray-800">
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "link"
                            ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("link")}
                >
                    Influencer Analytics Link
                </button>

                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "overview"
                            ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("overview")}
                >
                    Influencer Analytics Overview
                </button>
            </div>

            {/* Link Tab */}
            {activeTab === "link" && (
                <WebAnalytics />
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <WebOverview />
            )}
        </div>

    );
};

export default Main;