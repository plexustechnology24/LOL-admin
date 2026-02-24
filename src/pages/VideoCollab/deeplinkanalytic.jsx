import React, { useEffect, useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCircleExclamation, faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import Badge from "../../components/ui/badge/Badge";

import lock from "../../assest/lock.svg";

const DeepLinkAnalytics = () => {
    const [activeTab, setActiveTab] = useState("analytics");
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const dateFilterRef = useRef(null);

    // Date related states
    const today = new Date();
    const [dateRange, setDateRange] = useState([today, today]);
    const [startDate, endDate] = dateRange;

    // Date filter type state
    const [dateFilterType, setDateFilterType] = useState('thisMonth');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    const getWeekRange = (weeksAgo = 0) => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - (weeksAgo * 7));

        const dayOfWeek = currentDate.getDay(); // 0 for Sunday
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - dayOfWeek); // Start of the week (Sunday)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // End of the week (Saturday)

        // Return day names instead of dates
        return "Sunday to Saturday";
    };

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    // Correctly get last month by checking if we need to go to previous year
    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setDate(1); // Go to first day of current month
    lastMonthDate.setDate(0); // Go to last day of previous month
    const lastMonth = lastMonthDate.toLocaleString('default', { month: 'long' });
    const lastMonthYear = lastMonthDate.getFullYear();

    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'thisWeek', label: `This Week (${getWeekRange()})` },
        { value: 'lastWeek', label: `Last Week (${getWeekRange(1)})` },
        { value: 'thisMonth', label: `This Month (${currentMonth} ${currentYear})` },
        { value: 'lastMonth', label: `Last Month (${lastMonth} ${lastMonthYear})` },
        { value: 'thisYear', label: `This Year (${currentYear})` },
        { value: 'lastYear', label: `Last Year (${currentYear - 1})` },
        { value: 'lifetime', label: 'Lifetime' },
        { value: 'custom', label: 'Custom Range' }
    ];

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dateFilterRef.current &&
                !dateFilterRef.current.contains(event.target)
            ) {
                setShowDateFilter(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Function to get date range based on selected option
    const getDateRangeByType = (type) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = [new Date(today), new Date(today)];

        switch (type) {
            case 'lifetime':
                const lifetimeStart = new Date(2024, 0, 1); // Jan 1, 2024
                result[0] = lifetimeStart;
                result[1] = today; // current date
                break;

            case 'today':
                // Already set to today
                break;

            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                result[0] = yesterday;
                result[1] = yesterday;
                break;

            case 'thisWeek':
                const startOfWeek = new Date(today);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
                startOfWeek.setDate(diff);
                result[0] = startOfWeek;
                break;

            case 'lastWeek':
                const lastWeekEnd = new Date(today);
                const lastWeekDay = lastWeekEnd.getDay();
                const lastWeekEndDiff = lastWeekEnd.getDate() - lastWeekDay + (lastWeekDay === 0 ? -6 : 1) - 1;
                lastWeekEnd.setDate(lastWeekEndDiff);

                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekStart.getDate() - 6);

                result[0] = lastWeekStart;
                result[1] = lastWeekEnd;
                break;

            case 'thisMonth':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                result[0] = startOfMonth;
                break;

            case 'lastMonth':
                const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                result[0] = startOfLastMonth;
                result[1] = endOfLastMonth;
                break;

            case 'thisYear':
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                result[0] = startOfYear;
                break;

            case 'lastYear':
                const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
                const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
                result[0] = startOfLastYear;
                result[1] = endOfLastYear;
                break;

            case 'custom':
                // Use the existing dateRange state
                return dateRange;

            default:
                break;
        }

        return result;
    };

    // Function to handle date range type selection
    const handleDateFilterTypeChange = (type) => {
        setDateFilterType(type);

        if (type === 'custom') {
            setShowCustomDatePicker(true);
        } else {
            setShowCustomDatePicker(false);
            const newDateRange = getDateRangeByType(type);
            setDateRange(newDateRange);
        }
    };

    // Format date for API
    const formatDateForAPI = (date) => {
        if (!date) return "";

        // Create a new date object to avoid modifying the original
        const adjustedDate = new Date(date);

        // Get year, month, and day components
        const year = adjustedDate.getFullYear();
        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(adjustedDate.getDate()).padStart(2, '0');

        // Format as YYYY-MM-DD
        return `${year}-${month}-${day}`;
    };

    const fetchData = async () => {
        setIsLoading(true);

        // Get date range based on the selected filter type
        const [filterStart, filterEnd] = getDateRangeByType(dateFilterType);

        // Only include date parameters if they're not null (for lifetime option)
        const requestBody = {};
        if (filterStart) {
            requestBody.since = formatDateForAPI(filterStart);
        }
        if (filterEnd) {
            requestBody.until = formatDateForAPI(filterEnd);
        }

        try {
            const response = await fetch('https://api.lolcards.link/api/analytics/deeplink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();
            setFilteredData(result.data || []);
            setShowDateFilter(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get human-readable date range description
    const getDateRangeDescription = () => {
        switch (dateFilterType) {
            case 'lifetime':
                return 'Lifetime';
            case 'today':
                return 'Today';
            case 'yesterday':
                return 'Yesterday';
            case 'thisWeek':
                return 'This Week';
            case 'lastWeek':
                return 'Last Week';
            case 'thisMonth':
                return 'This Month';
            case 'lastMonth':
                return 'Last Month';
            case 'thisYear':
                return 'This Year';
            case 'lastYear':
                return 'Last Year';
            case 'custom':
                return `${formatDate(startDate)} - ${formatDate(endDate)}`;
            default:
                return '';
        }
    };

    // Pagination configuration
    const itemsPerPage = 15;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // ====================================== deeplink ============================
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [source, setsource] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProtected, setIsProtected] = useState(false);

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setsource('');
                setId(undefined);
                setIsProtected(false);
                setIsLocked(false);
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://api.lolcards.link/api/analytics/read')
            .then((res) => {
                setData(res.data.data.reverse());
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    useEffect(() => {
        getData();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!source) newErrors.source = 'Source is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If the item is protected, show warning but allow source update
        if (isProtected) {
            toast.warn("This DeepLink is protected. Only the source can be updated.");
        }

        // Validate input
        if (!validate()) return;

        // Create payload with conditional lock update
        const payload = {
            source: source,
            ...(isProtected ? {} : { lock: isLocked }) // Only include lock if not protected
        };

        try {
            setIsSubmitting(true);

            // Check if it's an update or create request
            const request = id !== undefined
                ? axios.patch(`https://api.lolcards.link/api/analytics/update/${id}`, payload)
                : axios.post('https://api.lolcards.link/api/analytics/create', payload);

            const res = await request;

            // Reset form
            setsource('');
            setId(undefined);
            setIsLocked(false);
            setIsProtected(false);
            getData();
            toast.success(res.data.message);
            toggleModal('add');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        if (!isSubmitting) {
            setsource(item.source);
            setId(item._id);

            // Check if this item is locked
            const isLockedItem = item.lock === true;
            setIsProtected(isLockedItem);
            setIsLocked(isLockedItem);

            toggleModal('edit');
        }
    };

    const handleDelete = async (sourceId, isLocked) => {
        // Check if this item is locked
        if (isLocked) {
            toast.warn("This DeepLink is protected and cannot be deleted.");
            return;
        }

        if (!isSubmitting && window.confirm("Are you sure you want to delete this deeplink?")) {
            try {
                setIsSubmitting(true);
                const res = await axios.delete(`https://api.lolcards.link/api/analytics/delete/${sourceId}`);
                getData();
                toast.success(res.data.message);
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (loading) return (
        <div
            style={{
                height: '80vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: "hidden"
            }}
        >
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800" style={{ borderTop: "2px solid #FA5054" }}></div>
            </div>
        </div>
    );

    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success("URL copied to clipboard!");
            })
            .catch(() => {
                alert("No URL to copy!");
            });
    };

    // total number get
    const totalAndroidViews = currentItems.reduce((total, item) => total + (item.androidView || 0), 0);
    const totalAndroidInstall = currentItems.reduce((total, item) => total + (item.androidInstall || 0), 0);
    const totalIosViews = currentItems.reduce((total, item) => total + (item.iosView || 0), 0);
    const totalIosInstall = currentItems.reduce((total, item) => total + (item.iosInstall || 0), 0);

    return (
        <div>
            <PageBreadcrumb pageTitle="Influencer Video Collaboration" />

            {/* Tab Buttons */}
            <div className="flex rounded-lg mb-6 w-full bg-gray-100 gap-5 ps-3 dark:bg-gray-800">
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "analytics"
                        ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("analytics")}
                >
                    DeepLink Analytics
                </button>
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "deeplink"
                        ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("deeplink")}
                >
                    DeepLinks
                </button>
            </div>

            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        {activeTab === "analytics" && (
                            <div className="flex align-middle justify-between flex-wrap gap-3">
                                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                                    Search Filters
                                </h3>

                                <div className="flex items-center space-x-3 flex-wrap">
                                    {/* Date Filter Button */}
                                    <div className="relative" ref={dateFilterRef}>
                                        <button
                                            className="inline-flex items-center gap-2 w-80 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 mb-4"
                                            onClick={() => setShowDateFilter(!showDateFilter)}
                                        >
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                            <span>Date Filter: {getDateRangeDescription()}</span>
                                        </button>

                                        {showDateFilter && (
                                            <div className="absolute right-0 mt-0 z-999 bg-white shadow-lg rounded-lg px-5 pb-5 border dark:border-gray-700 dark:bg-gray-800 w-[600px]">
                                                <div className="pt-5 flex gap-4" >
                                                    {/* Date range preset options */}
                                                    <div className="mb-4 w-1/2">
                                                        <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Select Range</h4>
                                                        <div className="space-y-2">
                                                            {dateRangeOptions.map(option => (
                                                                <div
                                                                    key={option.value}
                                                                    className={`cursor-pointer p-2 rounded flex items-center dark:text-gray-400 ${dateFilterType === option.value ? 'bg-gradient-to-r from-[#FA5054]/20 to-[#FD684B]/20 border-l-4 border-[#FA5054] dark:bg-gradient-to-r dark:from-[#FA5054]/30 dark:to-[#FD684B]/30 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                                    onClick={() => handleDateFilterTypeChange(option.value)}
                                                                >
                                                                    <div className={`w-4 h-4 rounded-full mr-2 border ${dateFilterType === option.value ? 'border-[#FA5054] bg-[#FA5054]' : 'border-gray-400'}`}>
                                                                        {dateFilterType === option.value && (
                                                                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-[3px]"></div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-sm">{option.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Custom date picker (only shown when 'Custom' is selected) */}
                                                    {showCustomDatePicker && (
                                                        <div className="mb-4">
                                                            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Custom Range</h4>
                                                            <DatePicker
                                                                selectsRange={true}
                                                                startDate={startDate}
                                                                endDate={endDate}
                                                                onChange={(update) => {
                                                                    setDateRange(update);
                                                                }}
                                                                isClearable={false}
                                                                placeholderText="Select date range"
                                                                className="p-2 border rounded w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mx-3 flex justify-between gap-3">
                                                    <Button
                                                        className="w-1/2 py-2 px-4 dark:bg-transparent dark:text-gray-400 border dark:border-gray-400 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                                        onClick={() => {
                                                            setDateFilterType('today');
                                                            setDateRange([today, today]);
                                                            setShowDateFilter(false);
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        className="w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200"
                                                        style={{ background: "linear-gradient(135deg, #FA5054 0%, #FD684B 100%)" }}
                                                        onClick={() => {
                                                            fetchData();
                                                            setShowDateFilter(false);
                                                        }}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add DeepLink Button - only show when DeepLink tab is active */}
                        {activeTab === "deeplink" && (
                            <div className="flex justify-end items-center px-4 border-gray-200 dark:border-gray-800">
                                <div className="flex flex-wrap gap-3 align-middle justify-end ms-auto">
                                    <Button
                                        onClick={() => toggleModal('add')}
                                        className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                        style={{ background: "linear-gradient(135deg, #FA5054 0%, #FD684B 100%)" }}
                                        disabled={isSubmitting}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add New DeepLink
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Body - Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div className="p-4 border-gray-100 dark:border-gray-800 pt-1 sm:px-6 overflow-auto">
                            <h1 className="dark:text-white/90 my-6 font-semibold text-lg">DeepLink Analytics:</h1>
                            <div className="flex gap-4">
                                <div className=" w-1/2">
                                    <p className="text-lg py-2 bg-blue-50 rounded-xl text-center my-4">Android</p>
                                    <div className="h-[130px]">
                                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                                            <Table>
                                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                    <TableRow className="text-center">
                                                        <TableCell isHeader className={`py-4 font-medium text-gray-500 border-r h-20 w-[330px] border-gray-200 dark:border-gray-700`}>Source</TableCell>
                                                        <TableCell isHeader className="py-4 font-medium text-gray-500 border-r border-gray-200 dark:border-gray-700">Android View</TableCell>
                                                        <TableCell isHeader className="py-4 font-medium text-gray-500 border-r border-gray-200 dark:border-gray-700">Android Install</TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                                    {isLoading ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">
                                                                <Spinner animation="border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </Spinner>
                                                            </td>
                                                        </tr>
                                                    ) : currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                                        </tr>
                                                    ) : (
                                                        currentItems.map((item, index) => {
                                                            if (index >= 1) {
                                                                return null; // skip first organic row
                                                            }

                                                            return (
                                                                <TableRow key={item._id} className="w-72">
                                                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                                        <div
                                                                            className={`text-center border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400 ${item.delete
                                                                                ? "border-red-500 border-l-[3px]"
                                                                                : "border-green-500 border-l-[3px]"
                                                                                }`}
                                                                        >
                                                                            {item.sourceid}
                                                                        </div>
                                                                    </TableCell>

                                                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400">
                                                                        {item.sourceid === "organic" ? "-" : item.androidView}
                                                                    </TableCell>

                                                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400">
                                                                        {item.androidInstall}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })

                                                    )}

                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    <div className="space-y-6 rounded-lg xl:border dark:border-gray-800 my-10">
                                        <Table>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">
                                                            <Spinner animation="border" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </Spinner>
                                                        </td>
                                                    </tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                                    </tr>
                                                ) : (
                                                    currentItems.map((item, index) => {
                                                        if (index === 0 && item.sourceid === "organic") {
                                                            return null; // skip first organic row
                                                        }

                                                        return (
                                                            <TableRow key={item._id}>
                                                                <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 w-[330px]">
                                                                    <div
                                                                        className={`text-center border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400 ${item.delete
                                                                            ? "border-red-500 border-l-[3px]"
                                                                            : "border-green-500 border-l-[3px]"
                                                                            }`}
                                                                    >
                                                                        {item.sourceid}
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400">
                                                                    {item.sourceid === "organic" ? "-" : item.androidView}
                                                                </TableCell>

                                                                <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400">
                                                                    {item.androidInstall}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                                <tr>
                                                    <td className="px-5 py-5 bg-[#f0f6ff] dark:bg-gray-600 border border-slate-300  dark:border-gray-700 text-xl font-semibold dark:text-black text-blue-600">Total</td>
                                                    <td className="px-5 py-5 bg-[#f0f6ff] dark:bg-gray-600 border border-slate-300 dark:border-gray-700 text-xl font-semibold dark:text-black text-blue-600">{totalAndroidViews}</td>
                                                    <td className="px-5 py-5 bg-[#f0f6ff] dark:bg-gray-600 border border-slate-300 dark:border-gray-700 text-xl font-semibold dark:text-black text-blue-600">{totalAndroidInstall}</td>                                            </tr>

                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="w-1/2">
                                    <p className="text-lg py-2 bg-blue-50 rounded-xl text-center my-4">IOS</p>
                                    <div className="h-[130px]">
                                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                                            <Table>
                                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                    <TableRow className="text-center">
                                                        <TableCell isHeader className="py-4 px-6 font-medium text-gray-500 border-r border-gray-200 dark:border-gray-700 h-20 w-[330px]">Source</TableCell>
                                                        <TableCell isHeader className="py-4 px-6 font-medium text-gray-500 border-r border-gray-200 dark:border-gray-700">iOS View</TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                                    {isLoading ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">
                                                                <Spinner animation="border" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </Spinner>
                                                            </td>
                                                        </tr>
                                                    ) : currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                                        </tr>
                                                    ) : (
                                                        currentItems.map((item, index) => {
                                                            if (index >= 1) {
                                                                return null; // skip rendering
                                                            }

                                                            return (
                                                                <TableRow key={item._id}>
                                                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 w-[330px]">
                                                                        <div
                                                                            className={`text-center dark:border-gray-700 py-3 dark:text-gray-400 border-red-500 border-l-[3px]`}
                                                                        >
                                                                            -
                                                                        </div>
                                                                    </TableCell>

                                                                    <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400">
                                                                        -
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })

                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                    </div>

                                    <div className="space-y-6 rounded-lg xl:border dark:border-gray-800 my-10">
                                        <Table>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                                {isLoading ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">
                                                            <Spinner animation="border" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </Spinner>
                                                        </td>
                                                    </tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                                    </tr>
                                                ) : (
                                                    currentItems.map((item, index) => {
                                                        if (index === 0 && item.sourceid === "organic") {
                                                            return null; // skip rendering
                                                        }

                                                        return (
                                                            <TableRow key={item._id}>
                                                                <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 w-[330px]">
                                                                    <div
                                                                        className={`text-center border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400 ${item.delete
                                                                            ? "border-red-500 border-l-[3px]"
                                                                            : "border-green-500 border-l-[3px]"
                                                                            }`}
                                                                    >
                                                                        {item.sourceid}
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3 dark:text-gray-400">
                                                                    {item.sourceid === "organic" ? "-" : item.iosView}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })

                                                )}
                                                <tr>
                                                    <td className="px-5 py-5 bg-[#f0f6ff] dark:bg-gray-600 border border-slate-300  dark:border-gray-700 text-xl font-semibold dark:text-black text-blue-600">Total</td>
                                                    <td className="px-5 py-5 bg-[#f0f6ff] dark:bg-gray-600 border border-slate-300 dark:border-gray-700 text-xl font-semibold dark:text-black text-blue-600">{totalIosViews}</td>
                                                </tr>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card Body - DeepLink Tab */}
                    {activeTab === "deeplink" && (
                        <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                            <h1 className="dark:text-white/90 mb-6 font-semibold text-lg">DeepLinks:</h1>
                            <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="py-4 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-500">Source</TableCell>
                                            <TableCell isHeader className="py-4 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-500">DeepLink</TableCell>
                                            <TableCell isHeader className="py-4 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-500">Date</TableCell>
                                            <TableCell isHeader className="py-4 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-500">Status</TableCell>
                                            <TableCell isHeader className="py-4 border-r border-gray-200 dark:border-gray-700 font-medium text-gray-500">Actions</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                        {data.length > 0 ? (
                                            data.map((item) => (
                                                <TableRow key={item._id}>
                                                    <TableCell className="py-3 border-r border-gray-200 dark:border-gray-700 px-2 dark:text-gray-400">
                                                        {item.source}
                                                    </TableCell>
                                                    <TableCell className="py-3 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 flex items-center justify-center gap-4">
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline break-words transition-colors duration-200"
                                                        >
                                                            {item.link}
                                                        </a>
                                                        <button
                                                            className="text-gray-600 hover:text-[#FA5054] transition-colors duration-200"
                                                            onClick={() => handleCopyToClipboard(item.link)}
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="py-3 border-r border-gray-200 dark:border-gray-700 px-2 dark:text-gray-400">
                                                        {new Date(item.createdAt).toLocaleDateString('en-GB')}
                                                    </TableCell>
                                                    <TableCell className="py-3 border-r border-gray-200 dark:border-gray-700 px-2 dark:text-gray-400">
                                                        <Badge
                                                            size="md"
                                                            className="text-center ps-7"
                                                            color={item.lock ? "warning" : "success"}
                                                            style={{
                                                                backgroundColor: item.lock ? "#F59E0B" : "#10B981",
                                                                color: "white"
                                                            }}
                                                        >
                                                            {item.lock ? "Protected" : "Editable"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-3 border-r border-gray-200 dark:border-gray-700 px-2">
                                                        <div className="flex gap-4 justify-center">
                                                            <button
                                                                className={`transition-colors duration-200 ${item.lock
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-blue-500 hover:text-blue-700"
                                                                    }`}
                                                                onClick={() => !item.lock && handleEdit(item)}
                                                                disabled={isSubmitting || item.lock}
                                                                title={item.lock ? "This DeepLink is protected and cannot be fully edited" : "Edit DeepLink"}
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                className={`transition-colors duration-200 ${item.lock
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-red-600 hover:text-red-800"
                                                                    }`}
                                                                onClick={() => !item.lock && handleDelete(item._id, item.lock)}
                                                                disabled={isSubmitting || item.lock}
                                                                title={item.lock ? "This DeepLink is protected and cannot be deleted" : "Delete DeepLink"}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                            </tr>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {visible && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center">
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && toggleModal()}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300">
                        {/* Header */}
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold flex items-center">
                                {id ? "Edit DeepLink" : "Add New DeepLink"}
                                {isProtected && (
                                    <span className="ml-2 flex items-center text-amber-600">
                                        <img
                                            src={lock}
                                            alt="Protected"
                                            className="w-5 h-5 mr-1"
                                        />
                                        <span className="text-sm font-normal">(Protected)</span>
                                    </span>
                                )}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                {/* Protected Notice */}
                                {isProtected && (
                                    <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400 dark:bg-amber-900/20">
                                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                                            <FontAwesomeIcon icon={faCircleExclamation} className="mr-2" />
                                            This DeepLink is protected. Only the source can be updated. Protection status cannot be changed.
                                        </p>
                                    </div>
                                )}

                                {/* Source Input */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Source
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="source"
                                        className={`w-full py-2 px-3 border rounded dark:bg-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-[#FA5054] focus:border-[#FA5054] transition-colors duration-200 ${errors.source
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                            }`}
                                        placeholder="Enter source"
                                        value={source}
                                        onChange={(e) => setsource(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.source && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.source}
                                        </p>
                                    )}
                                </div>

                                {/* Lock Checkbox - Only show if not protected */}
                                {!isProtected && (
                                    <div className="flex items-center mb-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id="lock"
                                                name="lock"
                                                disabled={isSubmitting}
                                                checked={isLocked}
                                                onChange={(e) => setIsLocked(e.target.checked)}
                                                className="peer hidden"
                                            />
                                            <div className={`w-4 h-4 border-2 rounded cursor-pointer flex items-center justify-center transition-colors duration-200 ${isLocked
                                                ? 'border-[#FA5054] bg-[#FA5054]'
                                                : 'border-gray-300 hover:border-[#FA5054]'
                                                }`}>
                                                {isLocked && (
                                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="flex items-center">
                                                <img
                                                    src={lock}
                                                    alt="Lock"
                                                    className="w-5 h-5 pe-2"
                                                />
                                                Protect this DeepLink
                                                <span className="ml-2 text-xs text-gray-500">(Cannot be modified and deleted if protected)</span>
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => toggleModal()}
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200 ${isSubmitting
                                            ? 'bg-gray-400'
                                            : 'hover:opacity-90'
                                            }`}
                                        style={{
                                            background: isSubmitting
                                                ? '#9CA3AF'
                                                : 'linear-gradient(135deg, #FA5054 0%, #FD684B 100%)'
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            id ? 'Update' : 'Submit'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default DeepLinkAnalytics;