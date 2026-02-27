import React, { useEffect, useState, useRef } from "react";
import { FaChartBar, FaArrowUp, FaArrowDown, FaTimes, FaPlus, FaShareAlt, FaGlobe, FaCalendarAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCalendarAlt as faCalendarAltSolid } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "react-bootstrap";

const CategoryManagement = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [average, setAverage] = useState({ share: 0, open: 0 });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
    const [createModal, setCreateModal] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [inputError, setInputError] = useState('');
    const [alertModal, setAlertModal] = useState({ show: false, message: '', title: 'Alert' });
    const categories = [
        "V2hvVGFsa2lu",
        "UGljIFJvYXN0",
        "QW5ub3kgZnVuIENhcmQ=",
        "RW1vdGlvbg==",
        "Q29uZmVzc2lvbg==",
        "UXVlc3Rpb24=",
        "SG90bmVzcw==",
        "RnJpZW5k",
        "Q3J1c2g=",
        "TG92ZQ==",
        "Um9hc3Q=",
        "Qmx1ZmY=",
        "Q2hhbGxlbmdl",
        "SGVhdmVuSGVsbA=="
    ];
    const categoryQuestionCount = {
        "V2hvVGFsa2lu": "1 ques",
        "UGljIFJvYXN0": "2 ques",
        "QW5ub3kgZnVuIENhcmQ=": "3 ques",
        "RW1vdGlvbg==": "4 ques",
        "Q29uZmVzc2lvbg==": "5 ques",
        "UXVlc3Rpb24=": "5 ques",
        "SG90bmVzcw==": "6 ques",
        "RnJpZW5k": "7 ques",
        "Q3J1c2g=": "7 ques",
        "TG92ZQ==": "7 ques",
        "Um9hc3Q=": "8 ques",
        "Qmx1ZmY=": "9 ques",
        "Q2hhbGxlbmdl": "10 ques",
        "SGVhdmVuSGVsbA==": "11 ques"
    };
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Date Filter States
    const today = new Date();
    const [dateRange, setDateRange] = useState([today, today]);
    const [startDate, endDate] = dateRange;
    const [dateFilterType, setDateFilterType] = useState('thisMonth');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const dateFilterRef = useRef(null);

    // Refs for modal containers to detect clicks outside
    const createModalRef = useRef(null);
    const deleteModalRef = useRef(null);

    // Date filter helper functions
    const getWeekRange = (weeksAgo = 0) => {
        return "Sunday to Saturday";
    };

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setDate(1);
    lastMonthDate.setDate(0);
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

    const getDateRangeByType = (type) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = [new Date(today), new Date(today)];

        switch (type) {
            case 'lifetime':
                const startOfYear1 = new Date(today.getFullYear(), 0, 1);
                result[0] = startOfYear1;
                break;
            case 'today':
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
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
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
                return dateRange;
            default:
                break;
        }
        return result;
    };

    const formatDateForAPI = (date) => {
        if (!date) return "";
        const adjustedDate = new Date(date);
        const year = adjustedDate.getFullYear();
        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
        const day = String(adjustedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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

    // Base64 validation function
    const isValidBase64 = (str) => {
        if (!str || str.length === 0) return false;
        try {
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (!base64Regex.test(str)) return false;
            const decoded = atob(str);
            const reencoded = btoa(decoded);
            return reencoded === str;
        } catch (e) {
            return false;
        }
    };

    const handleCategoryNameChange = (value) => {
        setCategoryName(value);
        if (value.trim() === '') {
            setInputError('');
            return;
        }
        if (!isValidBase64(value)) {
            setInputError('Only base64 encoded text is allowed. Please enter valid encoded text.');
        } else {
            setInputError('');
        }
    };

    // Handle click outside modals
    const handleClickOutside = (event) => {
        if (createModalRef.current && !createModalRef.current.contains(event.target)) {
            closeCreateModal();
        }
        if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
            closeDeleteModal();
        }
        if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
            setShowDateFilter(false);
        }
    };

    useEffect(() => {
        if (createModal || deleteModal.isOpen || showDateFilter) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [createModal, deleteModal.isOpen, showDateFilter]);

    const decodeBase64 = (str) => {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return str;
        }
    };

    const getData = async () => {
        try {
            setLoading(true);
            const [filterStart, filterEnd] = getDateRangeByType(dateFilterType);

            const requestBody = {};
            if (filterStart) {
                requestBody.since = formatDateForAPI(filterStart);
            }
            if (filterEnd) {
                requestBody.until = formatDateForAPI(filterEnd);
            }

            const response = await fetch('https://api.lolcards.link/api/admin/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch data');
            }

            let categoryData = result.data || [];
            categoryData = categoryData.filter(item => !item.delete);

            const sortedData = categoryData.sort(
                (a, b) => (b.share || 0) - (a.share || 0)
            );
            setData(sortedData);

            const totalShare = categoryData.reduce(
                (sum, item) => sum + (item.share || 0),
                0
            );
            const avgShare = categoryData.length > 0 ? (totalShare / categoryData.length) : 0;

            const totalOpen = categoryData.reduce(
                (sum, item) => sum + (item.open || 0),
                0
            );
            const avgOpen = categoryData.length > 0 ? (totalOpen / categoryData.length) : 0;

            setAverage({ share: avgShare.toFixed(2), open: avgOpen.toFixed(2) });
            setShowDateFilter(false);
        } catch (err) {
            console.error(err);
            // alert("Failed to fetch data.");
            setAlertModal({ show: true, title: "Error", message: "API failed! Please try again" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!categoryName.trim()) {
            // alert("Category name is required.");
            setAlertModal({ show: true, title: "Error", message: "Category name is required." });
            return;
        }

        if (!isValidBase64(categoryName)) {
            // alert("Please enter a valid base64 encoded category name.");
            setAlertModal({ show: true, title: "Error", message: "Please enter a valid base64 encoded category name." });
            return;
        }

        try {
            const response = await fetch('https://api.lolcards.link/api/admin/category/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categoryname: categoryName
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create category');
            }

            // alert("Category created successfully!");
            toast.success("Category created successfully!");
            setCreateModal(false);
            setCategoryName('');
            setInputError('');
            getData();
        } catch (err) {
            console.error(err);
            // alert(err.message || "Failed to create category.");
            toast.error(err.message || "Failed to create category.");
        }
    };

    const openDeleteModal = (category) => {
        setDeleteModal({ isOpen: true, category });
        setConfirmationInput('');
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, category: null });
        setConfirmationInput('');
    };

    const openCreateModal = () => {
        setCreateModal(true);
        setCategoryName('');
        setInputError('');
    };

    const closeCreateModal = () => {
        setCreateModal(false);
        setCategoryName('');
        setInputError('');
    };

    const handleDelete = async () => {
        const { category } = deleteModal;
        const expectedName = category.category || '';

        if (confirmationInput !== expectedName) {
            // alert("Category name doesn't match. Please try again.");
            toast.error("Category name doesn't match. Please try again.");
            return;
        }

        try {
            const response = await fetch(`https://api.lolcards.link/api/admin/category/delete/${category._id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete category');
            }

            // alert("Category deleted successfully!");
            toast.success("Category deleted successfully!");
            closeDeleteModal();
            getData();
        } catch (err) {
            console.error(err);
            // alert("Failed to delete category.");
            toast.error("Failed to delete category.");
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedIndex(index);
                setTimeout(() => setCopiedIndex(null), 1500);
                // alert('Copied to clipboard!');
                toast.success('Copied to clipboard!');
            })
            .catch(err => console.error("Failed to copy:", err));
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: "hidden" }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div className="p-4">
            <PageBreadcrumb pageTitle="Que & Web Monitoring" />

            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                {/* Date Filter Button */}
                <div className="relative" ref={dateFilterRef}>
                    <button
                        className="inline-flex items-center w-80 gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        onClick={() => setShowDateFilter(!showDateFilter)}
                    >
                        <FontAwesomeIcon icon={faCalendarAltSolid} />
                        <span>Date Filter: {getDateRangeDescription()}</span>
                    </button>

                    {showDateFilter && (
                        <div className="absolute left-0 mt-2 z-50 bg-white shadow-lg rounded-lg px-5 pb-5 border w-[600px]">
                            <div className="pt-5 flex gap-4">
                                <div className="mb-4 w-1/2">
                                    <h4 className="font-medium mb-2 text-gray-700">Select Range</h4>
                                    <div className="space-y-2">
                                        {dateRangeOptions.map(option => (
                                            <div
                                                key={option.value}
                                                className={`cursor-pointer p-2 rounded flex items-center ${dateFilterType === option.value
                                                    ? 'bg-gradient-to-r from-[#FA5054]/20 to-[#FD684B]/20 border-l-4 border-[#FA5054]'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                                onClick={() => handleDateFilterTypeChange(option.value)}
                                            >
                                                <div className={`w-4 h-4 rounded-full mr-2 border ${dateFilterType === option.value
                                                    ? 'border-[#FA5054] bg-[#FA5054]'
                                                    : 'border-gray-400'
                                                    }`}>
                                                    {dateFilterType === option.value && (
                                                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-[3px]"></div>
                                                    )}
                                                </div>
                                                <span className="text-sm">{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {showCustomDatePicker && (
                                    <div className="mb-4">
                                        <h4 className="font-medium mb-2 text-gray-700">Custom Range</h4>
                                        <DatePicker
                                            selectsRange={true}
                                            startDate={startDate}
                                            endDate={endDate}
                                            onChange={(update) => {
                                                setDateRange(update);
                                            }}
                                            maxDate={new Date()}
                                            isClearable={false}
                                            placeholderText="Select date range"
                                            className="p-2 border rounded w-full"
                                            inline
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mx-3 flex justify-between gap-3">
                                <Button
                                    type="button" // Prevents form submission
                                    className="w-1/2 py-2 px-4 border bg-gray-100 text-black rounded-lg hover:bg-gray-200"
                                    onClick={() => {
                                        setDateFilterType('today');
                                        setDateRange([today, today]);
                                        setShowDateFilter(false);
                                        getData();
                                    }}
                                >
                                    Clear
                                </Button>

                                <Button
                                    className="w-1/2 py-2 px-4 text-white rounded-lg"
                                    style={{ background: "linear-gradient(135deg, #FA5054 0%, #FD684B 100%)" }}
                                    onClick={() => {
                                        // If only start date is selected, set end date to start date before getData
                                        if (dateFilterType === 'custom' && startDate && !endDate) {
                                            const updatedRange = [startDate, startDate];
                                            setDateRange(updatedRange);
                                            getData();
                                        } else {
                                            getData();
                                        }
                                    }}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Category Button */}
                <button
                    onClick={openCreateModal}
                    className="bg-[#FA4B56] text-white px-4 py-2 rounded-lg hover:bg-[#e63946] transition flex items-center gap-2"
                >
                    <FaPlus size={16} />
                    Add Category
                </button>
            </div>

            <div className="mb-5 border p-3 rounded-lg bg-blue-50 border-blue-100">
                <div className="flex gap-2">
                    <h3 className="mb-2">Notes:</h3>
                    <p className="text-gray-600">You can add multiple categories for monitoring</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            style={{ display: "flex", alignItems: "center", flex: "1 0 21%", minWidth: "120px", fontSize: "14px" }}
                            className="text-gray-600 mt-2"
                        >
                            <span style={{ margin: "0 8px", fontSize: "35px" }}>•</span>
                            <span>{category}</span>
                            <button
                                onClick={() => handleCopy(category, index)}
                                style={{ marginLeft: "6px", padding: "4px 6px", color: "black", border: "none", cursor: "pointer" }}
                            >
                                <FontAwesomeIcon icon={faCopy} className="text-gray-600" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12">
                    <FaChartBar size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No categories found</p>
                    <p className="text-gray-400">Add your first category to get started</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item) => {
                        const categoryShare = item.share || 0;
                        const categoryOpen = item.open || 0;
                        const categoryName = item.category || '';
                        const decodedName = decodeBase64(categoryName);
                        const isShareHigh = categoryShare >= average.share;
                        const isOpenHigh = categoryOpen >= average.open;

                        return (
                            <div key={item._id} className="border border-gray-200 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FaChartBar className="text-[#FA4B56] flex-shrink-0" size={20} />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 truncate" title={decodedName}>
                                                {decodedName} <span className="text-[#FA4B56]">{categoryQuestionCount[categoryName] && `(${categoryQuestionCount[categoryName]})`}</span>
                                            </h3>
                                            <p className="text-xs text-gray-400 truncate" title={categoryName}>
                                                {categoryName}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openDeleteModal(item)}
                                        title="Delete Category"
                                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition ml-2"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-md" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg ${isShareHigh ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FaShareAlt className="text-gray-700 flex-shrink-0" size={18} />
                                                <span className="text-sm font-semibold text-gray-700">Share Category</span>
                                            </div>
                                            {isShareHigh ? (
                                                <FaArrowUp className="text-green-500 animate-bounce" size={16} />
                                            ) : (
                                                <FaArrowDown className="text-red-500 animate-pulse" size={16} />
                                            )}
                                        </div>
                                        <p className={`text-3xl font-bold mt-2 ${isShareHigh ? 'text-green-600' : 'text-red-600'}`}>
                                            {categoryShare}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${isOpenHigh ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FaGlobe className="text-gray-700 flex-shrink-0" size={18} />
                                                <span className="text-sm font-semibold text-gray-700">Open Category</span>
                                            </div>
                                            {isOpenHigh ? (
                                                <FaArrowUp className="text-green-500 animate-bounce" size={16} />
                                            ) : (
                                                <FaArrowDown className="text-red-500 animate-pulse" size={16} />
                                            )}
                                        </div>
                                        <p className={`text-3xl font-bold mt-2 ${isOpenHigh ? 'text-green-600' : 'text-red-600'}`}>
                                            {categoryOpen}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {createModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div ref={createModalRef} className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Add Category</h2>
                            <button onClick={closeCreateModal} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name (Base64 Encoded):
                            </label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(e) => handleCategoryNameChange(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${inputError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#FA4B56]'
                                    }`}
                                placeholder="Enter base64 encoded category name"
                                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                            />
                            {inputError && <p className="text-red-500 text-xs mt-1">{inputError}</p>}
                            {categoryName && isValidBase64(categoryName) && (
                                <p className="text-green-600 text-xs mt-1">Preview: {decodeBase64(categoryName)}</p>
                            )}
                        </div>

                        <div className="flex gap-3 w-100 justify-center">
                            <button
                                onClick={closeCreateModal}
                                className="px-4 py-2 w-1/2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!categoryName.trim() || !isValidBase64(categoryName)}
                                className={`px-4 py-2 w-1/2 text-white rounded-md transition ${categoryName.trim() && isValidBase64(categoryName)
                                    ? 'bg-[#FA4B56] hover:bg-[#e63946]'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Add Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div ref={deleteModalRef} className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Delete Category</h2>
                            <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to delete the category "{decodeBase64(deleteModal.category?.category || '')}"?
                            </p>
                            <p className="text-sm text-red-600 mb-4">
                                This action cannot be undone. Please type the exact encoded category name to confirm.
                            </p>

                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type "{(deleteModal.category?.category || '')}" to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmationInput}
                                    onChange={(e) => setConfirmationInput(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Enter encoded category name"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 w-100 justify-center">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 w-1/2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                // disabled={confirmationInput !== (deleteModal.category?.category || '')}
                                className={`px-4 py-2 w-1/2 text-white rounded-md transition bg-red-500 hover:bg-red-600`}
                            >
                                Delete Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {alertModal.show && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[99999]"
                    onClick={() => setAlertModal({ show: false, message: "", title: "Alert" })}
                >
                    <div
                        className="bg-white rounded-2xl p-6 m-3 text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] max-w-[400px] w-[90%]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* <h5 className="mb-3 text-dark font-bold">{alertModal.title}</h5> */}
                        <p className="mb-4 text-black">{alertModal.message}</p>

                        <button
                            className="px-5 py-2 font-semibold text-white rounded-full"
                            style={{ backgroundColor: "#F55152" }}
                            onClick={() => setAlertModal({ show: false, message: "", title: "Alert" })}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}


            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default CategoryManagement;