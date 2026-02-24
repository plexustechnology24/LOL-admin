import React, { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import { faCalendarAlt, } from "@fortawesome/free-regular-svg-icons";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import CustomToast from "./toast";

const WebOverview = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [societies, setSocieties] = useState([]);
    const [colleges, setColleges] = useState([]);
    const searchContainerRef = useRef(null);
    const [isSocietyOpen, setIsSocietyOpen] = useState(false);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [isStateOpen, setIsStateOpen] = useState(false);
    const [isCollegeOpen, setIsCollegeOpen] = useState(false);
    const stateRef = useRef(null);
    const collegeRef = useRef(null);

    // Add refs for the dropdowns
    const societyRef = useRef(null);
    const countryRef = useRef(null);
    const cityRef = useRef(null);
    const [filters, setFilters] = useState({
        city: '',
        state: '',
        country: '',
        society: '',
        collage: ''  // Add this
    });
    const getUniqueStates = () => getUniqueValues('state');



    // Search handler
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // First apply date filtering to allData
        let dateFiltered = [...allData];
        const [filterStart, filterEnd] = getDateRangeByType(dateFilterType);

        // Apply date filter if both start and end dates are selected (and not null for lifetime)
        if (filterStart !== null && filterEnd !== null) {
            const startOfDay = new Date(filterStart);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(filterEnd);
            endOfDay.setHours(23, 59, 59, 999);

            dateFiltered = dateFiltered.filter((item) => {
                const itemDate = new Date(item.Date);
                return itemDate >= startOfDay && itemDate <= endOfDay;
            });
        }

        // Then apply search term filtering on top of date filtering (search both URL and category)
        const searchFiltered = value.trim() === ''
            ? dateFiltered
            : dateFiltered.filter(item =>
                item.url.toLowerCase().includes(value.toLowerCase()) ||
                (item.category && item.category.toLowerCase().includes(value.toLowerCase()))
            );

        setFilteredData(searchFiltered);
        setCurrentPage(1); // Reset to first page on search
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        applyFilters();
    };


    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const hideToast = () => {
        setToast({ show: false, message: '', type: 'success' });
    };

    const handleClearAll = () => {
        setSearchTerm('');
        setDateFilterType('today');
        setDateRange([today, today]);
        setShowCustomDatePicker(false);
        setFilters({
            city: '',
            state: '',
            country: '',
            society: '',
            collage: ''
        });
    };

    const getUniqueValues = (field) => {
        const values = [...new Set(
            allData
                .map(item => item[field])
                .filter(value => value && value.trim() !== '')
        )].sort();
        return values;
    };

    const getUniqueCities = () => getUniqueValues('city');
    const getUniqueCountries = () => getUniqueValues('country');

    // ======================== Date filter ===============================================
    const [dateFilterType, setDateFilterType] = useState('today');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const today = new Date();
    const [dateRange, setDateRange] = useState([today, today]);
    const [allData, setAllData] = useState([]);
    const [startDate, endDate] = dateRange;
    const dateFilterRef = useRef(null);

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

    // Function to get date range based on selected option
    const getDateRangeByType = (type) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = [new Date(today), new Date(today)];

        switch (type) {
            case 'lifetime':
                return [null, null];
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

    // Fetch data with sorting and filtering
    const fetchData = async () => {
        setIsLoading(true);

        try {
            // Demo API call
            const demoResponse = await fetch('https://api.lolcards.link/api/analytics/demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const demoData = await demoResponse.json();
            const responseData = demoData.data || [];

            // Sort data by date in descending order (latest first)
            const sortedData = responseData.sort((a, b) => {
                const dateA = new Date(a.Date || 0);
                const dateB = new Date(b.Date || 0);
                return dateB - dateA;
            });

            // Store the complete dataset in allData
            setAllData(sortedData);

            // Don't set filteredData here - let applyFilters handle it

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        fetchData();
    }, []);


    // Apply filters including date filtering
    const applyFilters = useCallback(() => {
        let filtered = [...allData];

        // Get the correct date range based on the filter type
        const [filterStart, filterEnd] = getDateRangeByType(dateFilterType);

        // Apply date filter if both start and end dates are selected (and not null for lifetime)
        if (filterStart !== null && filterEnd !== null) {
            const startOfDay = new Date(filterStart);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(filterEnd);
            endOfDay.setHours(23, 59, 59, 999);

            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.Date);
                return itemDate >= startOfDay && itemDate <= endOfDay;
            });
        }

        // Apply search term filter
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(item =>
                (item.url && item.url.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.username && item.username.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply dropdown filters
        if (filters.society) {
            filtered = filtered.filter(item => item.society === filters.society);
        }

        if (filters.collage) {
            filtered = filtered.filter(item => item.collage === filters.collage);
        }

        if (filters.country) {
            filtered = filtered.filter(item => item.country === filters.country);
        }

        if (filters.state) {
            filtered = filtered.filter(item => item.state === filters.state);
        }

        if (filters.city) {
            filtered = filtered.filter(item => item.city === filters.city);
        }

        // Set the filtered data
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [allData, dateFilterType, searchTerm, filters]);


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

    // Get date range description
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (societyRef.current && !societyRef.current.contains(event.target)) {
                setIsSocietyOpen(false);
            }
            if (collegeRef.current && !collegeRef.current.contains(event.target)) {
                setIsCollegeOpen(false);
            }
            if (countryRef.current && !countryRef.current.contains(event.target)) {
                setIsCountryOpen(false);
            }
            if (stateRef.current && !stateRef.current.contains(event.target)) {
                setIsStateOpen(false);
            }
            if (cityRef.current && !cityRef.current.contains(event.target)) {
                setIsCityOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Effect to apply filters when data or filter type changes
    useEffect(() => {
        if (allData.length > 0) {
            applyFilters();
        }
    }, [allData, dateFilterType, searchTerm, filters, applyFilters]);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
                setShowDateFilter(false);
            }
        };

        if (showDateFilter) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDateFilter]);

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const extractUniqueValues = useCallback(() => {
        const uniqueSocieties = [...new Set(
            allData
                .map(item => item.society)
                .filter(society => society && society.trim() !== '')
        )].sort();

        const uniqueColleges = [...new Set(
            allData
                .map(item => item.collage)
                .filter(collage => collage && collage.trim() !== '')
        )].sort();

        setSocieties(uniqueSocieties);
        setColleges(uniqueColleges);
    }, [allData]);


    useEffect(() => {
        if (allData.length > 0) {
            extractUniqueValues();
        }
    }, [allData, extractUniqueValues]);


    return (
        <div>
            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "800px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        <div className="flex align-middle justify-between flex-wrap gap-3">
                            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                                Search Filters
                            </h3>
                        </div>

                        {/* Five Dropdown Filters */}
                        <div className="flex justify-between items-center flex-wrap gap-4 pt-6">
                            <div className="flex gap-4 flex-wrap">
                                {/* Country Dropdown */}
                                <div className="relative min-w-[200px]" ref={countryRef}>
                                    <button
                                        onClick={() => setIsCountryOpen(!isCountryOpen)}
                                        className="w-full h-11 px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-50 dark:hover:bg-white/[0.03] text-sm text-left flex items-center justify-between"
                                    >
                                        <span className={filters.country ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                                            {filters.country || "All Countries"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isCountryOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setFilters({ ...filters, country: '', state: '', city: '' });
                                                    setIsCountryOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.country === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All Countries
                                            </button>
                                            {getUniqueCountries().map((country, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setFilters({ ...filters, country: country, state: '', city: '' });
                                                        setIsCountryOpen(false);
                                                    }}
                                                    className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.country === country ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* State Dropdown */}
                                <div className="relative min-w-[200px]" ref={stateRef}>
                                    <button
                                        onClick={() => setIsStateOpen(!isStateOpen)}
                                        // disabled={!filters.country}
                                        className={`w-full h-11 px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none text-sm text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer`}
                                    >
                                        <span className={filters.state ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                                            {filters.state || "All States"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isStateOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isStateOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setFilters({ ...filters, state: '', city: '' });
                                                    setIsStateOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.state === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All States
                                            </button>
                                            {getUniqueStates()
                                                .filter(state => {
                                                    const item = allData.find(d => d.state === state);
                                                    return item;
                                                })
                                                .map((state, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setFilters({ ...filters, state: state, city: '' });
                                                            setIsStateOpen(false);
                                                        }}
                                                        className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.state === state ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                    >
                                                        {state}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* City Dropdown */}
                                <div className="relative min-w-[200px]" ref={cityRef}>
                                    <button
                                        onClick={() => setIsCityOpen(!isCityOpen)}
                                        // disabled={!filters.state}
                                        className={`w-full h-11 px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none text-sm text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer}`}
                                    >
                                        <span className={filters.city ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                                            {filters.city || "All Cities"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isCityOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isCityOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setFilters({ ...filters, city: '' });
                                                    setIsCityOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.city === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All Cities
                                            </button>
                                            {getUniqueCities()
                                                .filter(city => {
                                                    const item = allData.find(d => d.city === city);
                                                    return item;
                                                })
                                                .map((city, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setFilters({ ...filters, city: city });
                                                            setIsCityOpen(false);
                                                        }}
                                                        className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.city === city ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center flex-wrap gap-4 pt-6">
                            <div className="flex gap-4 flex-wrap">
                                {/* Society Dropdown */}
                                <div className="relative min-w-[200px]" ref={societyRef}>
                                    <button
                                        onClick={() => setIsSocietyOpen(!isSocietyOpen)}
                                        className="w-full h-11 px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-50 dark:hover:bg-white/[0.03] text-sm text-left flex items-center justify-between"
                                    >
                                        <span className={filters.society ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                                            {filters.society || "All Societies"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isSocietyOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isSocietyOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setFilters({ ...filters, society: '' });
                                                    setIsSocietyOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.society === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All Societies
                                            </button>
                                            {societies.map((society, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setFilters({ ...filters, society: society });
                                                        setIsSocietyOpen(false);
                                                    }}
                                                    className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.society === society ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                >
                                                    {society}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* College Dropdown */}
                                <div className="relative min-w-[200px]" ref={collegeRef}>
                                    <button
                                        onClick={() => setIsCollegeOpen(!isCollegeOpen)}
                                        className="w-full h-11 px-4 py-2.5 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-50 dark:hover:bg-white/[0.03] text-sm text-left flex items-center justify-between"
                                    >
                                        <span className={filters.collage ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                                            {filters.collage || "All Colleges"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isCollegeOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isCollegeOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setFilters({ ...filters, collage: '' });
                                                    setIsCollegeOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.collage === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All Colleges
                                            </button>
                                            {colleges.map((college, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setFilters({ ...filters, collage: college });
                                                        setIsCollegeOpen(false);
                                                    }}
                                                    className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${filters.collage === college ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                >
                                                    {college}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex align-middle justify-between flex-wrap gap-3 pt-6">
                            <div className="flex justify-between items-center flex-wrap pe-4 gap-4">
                                {/* Search Box */}
                                <div ref={searchContainerRef} className="relative">
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <div className="relative display: flex align-middle justify-center">
                                            <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                                                <svg
                                                    className="fill-gray-500 dark:fill-gray-400"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                                        fill=""
                                                    />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Search by name, username, link & category..."
                                                aria-label="Search"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-md text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 focus: outline-none bg-none px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                                                onClick={searchTerm ? handleClearSearch : undefined}
                                                style={{ cursor: searchTerm ? "pointer" : "default" }}
                                            >
                                                <FontAwesomeIcon icon={searchTerm ? faTimes : ""} />
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Date filter dropdown - Keep your existing date filter code */}
                                <div className="relative" ref={dateFilterRef}>
                                    <button
                                        className="inline-flex items-center gap-2 w-80 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                                        onClick={() => setShowDateFilter(!showDateFilter)}
                                    >
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        <span>Date Filter: {getDateRangeDescription()}</span>
                                    </button>
                                    {/* Keep your existing date filter dropdown content */}
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
                    </div>

                    <div className="flex items-center mt-5 px-10 justify-between">
                        {/* Left side: Clear All */}
                        <div>
                            {(searchTerm || dateFilterType !== 'today' || Object.values(filters).some(f => f !== '')) && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-md text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors duration-200"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Chart Overview Section */}
                    <div className="px-6 py-6">
                        {filteredData.length === 0 ? (
                            // No Data Found State
                            <div className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-gray-400 dark:text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                    No Data Found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                                    We couldn't find any results matching your current filters. Try adjusting your search criteria or date range.
                                </p>
                                {(searchTerm || dateFilterType !== 'today' || Object.values(filters).some(f => f !== '')) && (
                                    <button
                                        onClick={handleClearAll}
                                        className="px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg"
                                        style={{ background: "linear-gradient(135deg, #FA5054 0%, #FD684B 100%)" }}
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            // Data Overview with Charts
                            <>
                                {/* Stats Cards */}
                                <div className="w-1/2 mx-auto mt-15 ">
                                    {/* Total Items Card */}
                                    <div className="flex-1 text-center mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mx-auto">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                            {filteredData.length}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {toast.show && (
                <CustomToast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}

        </div>
    );
};

export default WebOverview;