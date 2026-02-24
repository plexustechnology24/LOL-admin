import React, { useCallback, useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTimes, faTrash, faV } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css";
import { faCalendarAlt, faCopy, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { Button, Col, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import axios from "axios";
import CustomToast from "./toast";
import CountryStateCityDropdown from "./Countrycitydropdown";

const WebAnalytics = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [societies, setSocieties] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [showNewSociety, setShowNewSociety] = useState(false);
    const [showNewCollege, setShowNewCollege] = useState(false);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [recentCountries, setRecentCountries] = useState([]);
    const [recentCities, setRecentCities] = useState([]);
    const searchContainerRef = useRef(null);
    const [isSocietyOpen, setIsSocietyOpen] = useState(false);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [states, setStates] = useState([]);
    const [recentStates, setRecentStates] = useState([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [stateSearch, setStateSearch] = useState('');
    const [isStateOpen, setIsStateOpen] = useState(false);
    const [isCollegeOpen, setIsCollegeOpen] = useState(false);
    const stateRef = useRef(null);
    const collegeRef = useRef(null);
    const tableTopRef = useRef(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);



    const [editData, setEditData] = useState({
        url: '',
        name: '',
        username: '',
        society: '',
        collage: '',
        country: '',
        state: '',  // ADD THIS
        city: ''
    });

    // Add refs for the dropdowns
    const societyRef = useRef(null);
    const countryRef = useRef(null);
    const cityRef = useRef(null);

    // New state for URL creation modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [urlData, setUrlData] = useState({
        url: '',
        name: '',
        username: '',
        society: '',
        collage: '',
        country: '',
        state: '',  // ADD THIS
        city: ''
    });
    const [filters, setFilters] = useState({
        city: '',
        state: '',
        country: '',
        society: '',
        collage: ''  // Add this
    });
    const [urlErrors, setUrlErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countData, setCountData] = useState({});
    const [isDetailsVisible, setIsDetailsVisible] = useState({});  // Track visibility per row
    const getUniqueStates = () => getUniqueValues('state');

    const handleEyeClick = (itemId, itemUrl) => {

    const nextVisibility = !isDetailsVisible[itemId];

    // Update visibility
    setIsDetailsVisible(prev => ({
        ...prev,
        [itemId]: nextVisibility
    }));

    // Only call API when opening
    if (nextVisibility) {
        axios.post('https://api.lolcards.link/api/analytics/web', {
            pageLocation: itemUrl,
        })
        .then((response) => {
            console.log("API RESPONSE:", response.data); // 👈 debug log

            const data = response.data;

            if (data.status === 1) {
                setCountData(prev => ({
                    ...prev,
                    [itemId]: {
                        views: data.views || 0,
                        sendcards: data.sendcards || 0,
                        resendcards: data.resendcards || 0,
                        webredirects: data.webredirects || 0,
                    },
                }));
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
    }
};


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

    // Validation function
    const validateUrlForm = () => {
        const errors = {};

        // URL validation (only required field)
        if (!urlData.url.trim()) {
            errors.url = 'URL is required';
        } else if (!/^https:\/\/.+/.test(urlData.url)) {
            errors.url = 'URL must start with https://';
        }

        setUrlErrors(errors);
        return Object.keys(errors).length === 0;
    };



    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    // Replace existing toast functions with these:
    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const hideToast = () => {
        setToast({ show: false, message: '', type: 'success' });
    };

    // Replace existing toast calls, for example:
    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                showToast("Copied to clipboard!");
            })
            .catch(() => {
                showToast("No data to copy!", 'error');
            });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditData({
            url: item.url || '',
            name: item.name || '',
            username: item.username || '',
            society: item.society || '',
            collage: item.collage || '',
            country: item.country || '',
            state: item.state || '',  // ADD THIS
            city: item.city || ''
        });
        setShowEditModal(true);

        // If country exists, fetch states for that country
        if (item.country) {
            fetchStates(item.country);

            // If state also exists, fetch cities for that state
            if (item.state) {
                fetchCities(item.country, item.state);
            }
        }
    };

    // Handle Edit Submit
    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        if (!editData.url.trim()) {
            setUrlErrors({ url: 'URL is required' });
            return;
        }

        if (!/^https:\/\/.+/.test(editData.url)) {
            setUrlErrors({ url: 'URL must start with https://' });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ShareURL: editData.url,
                name: editData.name?.trim() || "",
                username: editData.username?.trim() || "",
                society: editData.society?.trim() || "",
                collage: editData.collage?.trim() || "",
                country: editData.country?.trim() || "",
                state: editData.state?.trim() || "",  // ADD THIS
                city: editData.city?.trim() || ""
            };

            await axios.patch(`https://api.lolcards.link/api/analytics/web/update/${editingItem._id}`, payload);

            showToast("URL Updated Successfully");

            // Save to recent selections
            if (editData.country) saveRecentCountry(editData.country);
            if (editData.state) saveRecentState(editData.state);  // ADD THIS
            if (editData.city) saveRecentCity(editData.city);

            setShowEditModal(false);
            setEditingItem(null);
            setEditData({
                url: '',
                name: '',
                username: '',
                society: '',
                collage: '',
                country: '',
                state: '',  // ADD THIS
                city: ''
            });
            setUrlErrors({});
            setCountrySearch('');
            setStateSearch('');  // ADD THIS
            setCitySearch('');

            fetchData();
        } catch (error) {
            console.error(error);
            const errorMessage = error?.response?.data?.message || "An error occurred. Please try again.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitUrl = async (e) => {
        e.preventDefault();

        if (!validateUrlForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ShareURL: urlData.url,
                name: urlData.name?.trim() || "",
                username: urlData.username?.trim() || "",
                society: urlData.society?.trim() || "",
                collage: urlData.collage?.trim() || "",
                country: urlData.country?.trim() || "",
                state: urlData.state?.trim() || "",  // ADD THIS
                city: urlData.city?.trim() || ""
            };

           await axios.post('https://api.lolcards.link/api/analytics/web/create', payload);

            showToast("URL Added Successfully");

            // Save to recent selections
            if (urlData.country) saveRecentCountry(urlData.country);
            if (urlData.state) saveRecentState(urlData.state);  // ADD THIS
            if (urlData.city) saveRecentCity(urlData.city);

            setShowCreateModal(false);
            setUrlData({
                url: '',
                name: '',
                username: '',
                society: '',
                collage: '',
                country: '',
                state: '',  // ADD THIS
                city: ''
            });
            setUrlErrors({});
            setCountrySearch('');
            setStateSearch('');  // ADD THIS
            setCitySearch('');

            fetchData();
        } catch (error) {
            console.error(error);
            const errorMessage = error?.response?.data?.message || "An error occurred. Please try again.";
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pagination configuration
    const totalItems = filteredData.length;
    const itemsPerPage = 15;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

    useEffect(() => {
        if (urlData.state && urlData.country) {
            fetchCities(urlData.country, urlData.state);
        } else {
            setCities([]);
            setUrlData(prev => ({ ...prev, city: '' }));
        }
    }, [urlData.state]);

    useEffect(() => {
        if (editData.country) {
            fetchStates(editData.country);
        } else {
            setStates([]);
            setCities([]);
            setEditData(prev => ({ ...prev, state: '', city: '' }));
        }
    }, [editData.country]);

    useEffect(() => {
        if (editData.state && editData.country) {
            fetchCities(editData.country, editData.state);
        } else {
            setCities([]);
            setEditData(prev => ({ ...prev, city: '' }));
        }
    }, [editData.state]);

    useEffect(() => {
        // Load recent countries
        const storedCountries = sessionStorage.getItem('recentCountries');
        if (storedCountries) {
            try {
                setRecentCountries(JSON.parse(storedCountries));
            } catch (e) {
                console.error('Error parsing recent countries:', e);
            }
        }

        // Load recent states
        const storedStates = sessionStorage.getItem('recentStates');
        if (storedStates) {
            try {
                setRecentStates(JSON.parse(storedStates));
            } catch (e) {
                console.error('Error parsing recent states:', e);
            }
        }

        // Load recent cities
        const storedCities = sessionStorage.getItem('recentCities');
        if (storedCities) {
            try {
                setRecentCities(JSON.parse(storedCities));
            } catch (e) {
                console.error('Error parsing recent cities:', e);
            }
        }
    }, []);

    const saveRecentCountry = (countryName) => {
        if (!countryName || !countryName.trim()) return;
        const updated = [countryName, ...recentCountries.filter(c => c !== countryName)].slice(0, 5);
        setRecentCountries(updated);
        sessionStorage.setItem('recentCountries', JSON.stringify(updated));
    };

    const saveRecentState = (stateName) => {
        if (!stateName || !stateName.trim()) return;
        const updated = [stateName, ...recentStates.filter(s => s !== stateName)].slice(0, 5);
        setRecentStates(updated);
        sessionStorage.setItem('recentStates', JSON.stringify(updated));
    };

    const saveRecentCity = (cityName) => {
        if (!cityName || !cityName.trim()) return;
        const updated = [cityName, ...recentCities.filter(c => c !== cityName)].slice(0, 5);
        setRecentCities(updated);
        sessionStorage.setItem('recentCities', JSON.stringify(updated));
    };


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

        // Only scroll if it's not the initial load
        if (!isInitialLoad) {
            setTimeout(() => {
                if (tableTopRef.current) {
                    tableTopRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }, 100);
        }
    }, [allData, dateFilterType, searchTerm, filters, isInitialLoad]);


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
            // Set isInitialLoad to false after first render
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
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

    useEffect(() => {
        if (showCreateModal || showEditModal) {
            // Push a new state when modal opens
            window.history.pushState(null, '', window.location.href);

            const handlePopState = (event) => {
                event.preventDefault();
                // Close the modal instead of going back
                if (showEditModal) {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setEditData({
                        url: '',
                        name: '',
                        username: '',
                        society: '',
                        collage: '',
                        country: '',
                        state: '',
                        city: ''
                    });
                    setUrlErrors({});
                    setShowNewSociety(false);
                    setShowNewCollege(false);
                    setCountrySearch('');
                    setCitySearch('');
                    setStateSearch('');
                }
                if (showCreateModal) {
                    setShowCreateModal(false);
                    setUrlData({
                        url: '',
                        name: '',
                        username: '',
                        society: '',
                        collage: '',
                        country: '',
                        city: '',
                        state: ''
                    });
                    setUrlErrors({});
                    setShowNewSociety(false);
                    setShowNewCollege(false);
                    setCountrySearch('');
                    setCitySearch('');
                    setStateSearch('');
                }
                // Push state again to stay on the same page
                window.history.pushState(null, '', window.location.href);
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [showCreateModal, showEditModal]);

    // Handle Escape key to close modals
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                if (showEditModal && !isSubmitting) {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setEditData({
                        url: '',
                        name: '',
                        username: '',
                        society: '',
                        collage: '',
                        country: '',
                        city: '',
                        state: ''
                    });
                    setUrlErrors({});
                    setShowNewSociety(false);
                    setShowNewCollege(false);
                    setCountrySearch('');
                    setCitySearch('');
                    setStateSearch('');
                }
                if (showCreateModal && !isSubmitting) {
                    setShowCreateModal(false);
                    setUrlData({
                        url: '',
                        name: '',
                        username: '',
                        society: '',
                        collage: '',
                        country: '',
                        city: '',
                        state: ''
                    });
                    setUrlErrors({});
                    setShowNewSociety(false);
                    setShowNewCollege(false);
                    setCountrySearch('');
                    setCitySearch('');
                    setStateSearch('');
                }
            }
        };

        if (showCreateModal || showEditModal) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showCreateModal, showEditModal, isSubmitting]);

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchCountries();
    }, []);

    // Add this useEffect to fetch cities when country changes
    useEffect(() => {
        if (urlData.country) {
            fetchStates(urlData.country);
        } else {
            setStates([]);
            setCities([]);
            setUrlData(prev => ({ ...prev, state: '', city: '' }));
        }
    }, [urlData.country]);

    // Add these fetch functions
    const fetchCountries = async () => {
        setLoadingCountries(true);
        try {
            const response = await axios.get(
                'https://restcountries.com/v3.1/all?fields=name,cca2',
                { timeout: 15000 }
            );

            const countryList = response.data
                .filter(country => country.cca2) // ✅ avoid undefined codes
                .map(country => ({
                    name: country.name.common,
                    code: country.cca2
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setCountries(countryList);
        } catch (error) {
            console.error('Error fetching countries:', error?.message);
            showToast('Failed to load countries', 'error');
        } finally {
            setLoadingCountries(false);
        }
    };


    const fetchStates = async (countryName) => {
        setLoadingStates(true);
        try {
            const response = await axios.post(
                'https://countriesnow.space/api/v0.1/countries/states',
                { country: countryName },
                { timeout: 15000 }
            );

            if (response.data.error || !response.data.data || !response.data.data.states || response.data.data.states.length === 0) {
                console.log('No states available for this country');
                setStates([]);
                // Don't show error toast, just set empty states
            } else {
                const stateList = response.data.data.states
                    .map(s => ({
                        name: s.name || s.state_name || s,
                        code: s.state_code || ''
                    }))
                    .filter(s => s.name) // Remove any undefined/null names
                    .sort((a, b) => a.name.localeCompare(b.name));

                setStates(stateList);
            }
        } catch (error) {
            console.error('Error fetching states:', error?.message);
            setStates([]);
            // Don't show error toast for API failures
        } finally {
            setLoadingStates(false);
        }
    };

    const fetchCities = async (countryName, stateName) => {
        setLoadingCities(true);
        try {
            const response = await axios.post(
                'https://countriesnow.space/api/v0.1/countries/state/cities',
                {
                    country: countryName,
                    state: stateName
                },
                { timeout: 15000 }
            );

            if (response.data.error || !response.data.data || response.data.data.length === 0) {
                console.log('No cities available for this state');
                setCities([]);
            } else {
                const cityList = response.data.data
                    .filter(city => city && city.trim() !== '') // Remove empty cities
                    .sort();
                setCities(cityList);
            }
        } catch (error) {
            console.error('Error fetching cities:', error?.message);
            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };

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

    const handleAddNewSociety = (newSociety) => {
        if (newSociety.trim()) {
            // Check if society already exists
            if (!societies.includes(newSociety.trim())) {
                setSocieties([...societies, newSociety.trim()].sort());
                showToast('Society added successfully');
            }
            setUrlData({ ...urlData, society: newSociety.trim() });
            setShowNewSociety(false);
        }
    };

    const handleAddNewCollege = (newCollege) => {
        if (newCollege.trim()) {
            // Check if college already exists
            if (!colleges.includes(newCollege.trim())) {
                setColleges([...colleges, newCollege.trim()].sort());
                showToast('College added successfully');
            }
            setUrlData({ ...urlData, collage: newCollege.trim() });
            setShowNewCollege(false);
        }
    };

    useEffect(() => {
        if (allData.length > 0) {
            extractUniqueValues();
        }
    }, [allData, extractUniqueValues]);

    const handleDelete = (itemId) => {
        console.log(itemId);

        if (window.confirm("Are you sure you want to delete this Link?")) {
            axios.delete(`https://api.lolcards.link/api/analytics/web/delete/${itemId}`)
                .then((res) => {
                    // Remove the deleted item from both allData and filteredData immediately
                    setAllData(prevData => prevData.filter(item => item._id !== itemId));
                    setFilteredData(prevData => prevData.filter(item => item._id !== itemId));

                    showToast("Link Deleted Successfully");
                })
                .catch((err) => {
                    console.error(err);
                    showToast("Please try again.", 'error');
                });
        }
    };

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
                        <Row className="flex justify-between items-start">
                            <Col xs={10} className="w-[75%]">
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
                            </Col>
                            <Col xs={2} className="w-[25%] pt-6">
                                <div className="flex-1 text-center mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                   

                                    <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                        {filteredData.length}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                </div>
                            </Col>
                        </Row>

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

                    <div ref={tableTopRef}></div>

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

                        {/* Right side: Add URL */}
                        <div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(true);
                                    setUrlData({ url: '', name: '', username: '', society: '', collage: '', country: '', state: '', city: '' });
                                    setUrlErrors({});
                                }}
                                className="bg-[#FA5054] text-white py-2 px-8 rounded-lg flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Add URL
                            </button>
                        </div>
                    </div>


                    {/* Card Body - Analytics Tab */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <style>{`
            .expanded-row {
                animation: slideDown 0.3s ease-in-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .eye-button {
                transition: all 0.2s ease-in-out;
            }
            
            .eye-button:hover {
                transform: scale(1.1);
            }
        `}</style>


                            <Table style={{ marginTop: '0px' }}>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="text-center">
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Date</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-[170px]">Link</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Category</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Name</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Username</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Society</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Collage</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">City</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">
                                            State
                                        </TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Country</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Visibility</TableCell>
                                        <TableCell isHeader className="py-2 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={13} className="text-center pt-5 pb-4 dark:text-gray-400">Loading....</td>
                                        </tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={13} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                        </tr>
                                    ) : (
                                        currentItems.map((item, index) => (
                                            <React.Fragment key={item._id}>
                                                {/* Main Row */}
                                                <TableRow>
                                                    <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        {indexOfFirstItem + index + 1}
                                                    </TableCell>
                                                    <TableCell className="px-2 py-2 text-[14px] dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.Date ? new Date(item.Date).toLocaleDateString('en-GB') : '-'}
                                                    </TableCell>
                                                    <div className="flex items-center justify-center gap-5 mx-auto py-2 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400"
                                                        style={{
                                                            minWidth: "170px",
                                                            width: "170px",
                                                            maxWidth: "170px",
                                                            wordBreak: "break-word",
                                                            overflowWrap: "break-word",
                                                            whiteSpace: "normal",
                                                            minHeight: "80px",
                                                            lineHeight: "16px",
                                                            fontSize: "14px"
                                                        }}>
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ display: "block", wordBreak: "break-word" }}
                                                            className="text-blue-500 hover:underline break-words"
                                                        >
                                                            {item.url}
                                                        </a>
                                                        <button
                                                            className="text-gray-600 hover:text-gray-800"
                                                            onClick={() => handleCopyToClipboard(item.url)}
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </div>
                                                    <TableCell className="text-center py-2 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <span className="truncate text-[14px]">{item.category}</span>
                                                            <button
                                                                className="text-gray-600 hover:text-gray-800"
                                                                onClick={() => handleCopyToClipboard(item.category)}
                                                                title="Copy"
                                                            >
                                                                <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.name || '-'}
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.username || '-'}
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.society || '-'}
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.collage || '-'}
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.city || '-'}
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.state || '-'}
                                                    </TableCell>

                                                    <TableCell className="px-2 py-2 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                                        {item.country || '-'}
                                                    </TableCell>

                                                    <TableCell className="text-center py-2 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        <button
                                                            onClick={() => handleEyeClick(item._id, item.url)}
                                                            className="eye-button flex items-center justify-center w-9 h-9 mx-auto rounded-full bg-[#E7E7FF] text-[#696CFF] focus:outline-none transition-all duration-200 ease-in-out"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={isDetailsVisible[item._id] ? faEye : faEyeSlash}
                                                                className="text-[16px]"
                                                            />
                                                        </button>
                                                    </TableCell>

                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                        <div className="flex align-middle justify-center gap-4 h-full">
                                                            {/* Edit Button */}
                                                            <button
                                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                onClick={() => handleEdit(item)}
                                                                title="Edit"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                            </button>

                                                            {/* Delete Button */}
                                                            <button
                                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                                onClick={() => handleDelete(item._id)}
                                                                title="Delete"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Statistics Row */}
                                                {isDetailsVisible[item._id] && (
                                                    <tr className="expanded-row bg-gray-50 dark:bg-gray-900/50">
                                                        <td colSpan={13} className="px-6 py-2">
                                                            <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
                                                                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                                    <div className="text-2xl font-bold text-[#696CFF] mb-1">
                                                                        {countData[item._id]?.views || '0'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Link Opens
                                                                    </div>
                                                                </div>

                                                                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                                                        {countData[item._id]?.sendcards || '0'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Complete
                                                                    </div>
                                                                </div>

                                                                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                                                        {countData[item._id]?.resendcards || '0'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Another Message
                                                                    </div>
                                                                </div>

                                                                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                                    <div className="text-2xl font-bold text-orange-600 mb-1">
                                                                        {countData[item._id]?.webredirects || '0'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Web to App
                                                                    </div>
                                                                </div>

                                                                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                                    <div className="text-2xl font-bold text-purple-600 mb-1">
                                                                        {item?.install || '0'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                        App Install
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for creating URL remains the same */}
            {showCreateModal && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-auto">
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && setShowCreateModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300">
                        {/* Header */}
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">
                                Add New URL
                            </h3>
                        </div>

                        {/* Body */}
                        {/* Modal Body */}
                        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleSubmitUrl}>
                                {/* URL Input - Required */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        URL
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full py-2 px-3 border rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${urlErrors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Enter URL (e.g., https://example.com)"
                                        value={urlData.url}
                                        onChange={(e) => {
                                            if (urlErrors.url) {
                                                setUrlErrors({});
                                            }
                                            setUrlData({ ...urlData, url: e.target.value });
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    {urlErrors.url && (
                                        <p className="text-red-500 text-sm mt-1">{urlErrors.url}</p>
                                    )}
                                </div>

                                {/* Name Input - Optional */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                        placeholder="Enter name (optional)"
                                        value={urlData.name}
                                        onChange={(e) => setUrlData({ ...urlData, name: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Username Input - Optional */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Username</label>
                                    <input
                                        type="text"
                                        className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                        placeholder="Enter username (optional)"
                                        value={urlData.username}
                                        onChange={(e) => setUrlData({ ...urlData, username: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Society Dropdown with Add New - Optional */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Society</label>

                                    {!showNewSociety && societies.length > 0 ? (
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                value={urlData.society || ""}
                                                onChange={(e) => {
                                                    if (e.target.value === "__add_new__") {
                                                        setShowNewSociety(true);
                                                    } else {
                                                        setUrlData({ ...urlData, society: e.target.value });
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <option value="" disabled>Select society (optional)</option>

                                                {societies.map((society, index) => (
                                                    <option key={index} value={society}>
                                                        {society}
                                                    </option>
                                                ))}

                                                <option value="__add_new__" className="text-[#FA5054] font-medium">
                                                    + Add New Society
                                                </option>
                                            </select>

                                            {/* REMOVE */}
                                            {urlData.society && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUrlData({ ...urlData, society: "" });
                                                        setShowNewSociety(false);
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                placeholder="Enter new society name"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleAddNewSociety(e.target.value);
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            />

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const input = e.target.previousSibling;
                                                    handleAddNewSociety(input.value);
                                                }}
                                                className="px-4 py-2 bg-[#FA5054] text-white rounded hover:bg-[#e94448]"
                                                disabled={isSubmitting}
                                            >
                                                Add
                                            </button>

                                            {/* REMOVE */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUrlData({ ...urlData, society: "" });
                                                    setShowNewSociety(false);
                                                }}
                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                                disabled={isSubmitting}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>


                                {/* College Dropdown with Add New - Optional */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">College</label>

                                    {!showNewCollege && colleges.length > 0 ? (
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                value={urlData.collage || ""}
                                                onChange={(e) => {
                                                    if (e.target.value === "__add_new__") {
                                                        setShowNewCollege(true);
                                                    } else {
                                                        setUrlData({ ...urlData, collage: e.target.value });
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <option value="" disabled>Select college (optional)</option>

                                                {colleges.map((college, index) => (
                                                    <option key={index} value={college}>
                                                        {college}
                                                    </option>
                                                ))}

                                                <option value="__add_new__" className="text-[#FA5054] font-medium">
                                                    + Add New College
                                                </option>
                                            </select>

                                            {/* REMOVE */}
                                            {urlData.collage && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUrlData({ ...urlData, collage: "" });
                                                        setShowNewCollege(false);
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                placeholder="Enter new college name"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleAddNewCollege(e.target.value);
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            />

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const input = e.target.previousSibling;
                                                    handleAddNewCollege(input.value);
                                                }}
                                                className="px-4 py-2 bg-[#FA5054] text-white rounded hover:bg-[#e94448]"
                                                disabled={isSubmitting}
                                            >
                                                Add
                                            </button>

                                            {/* REMOVE */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUrlData({ ...urlData, collage: "" });
                                                    setShowNewCollege(false);
                                                }}
                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                                disabled={isSubmitting}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>


                                {/* Country Dropdown */}
                                <CountryStateCityDropdown
                                    label="Country"
                                    type="country"
                                    value={urlData.country}
                                    searchValue={countrySearch}
                                    onSearchChange={setCountrySearch}
                                    onChange={(selectedCountry) => {
                                        setUrlData({ ...urlData, country: selectedCountry, state: '', city: '' });
                                        setStateSearch('');
                                        setCitySearch('');
                                    }}
                                    options={countries}
                                    recentOptions={recentCountries}
                                    disabled={isSubmitting || loadingCountries}
                                    loading={loadingCountries}
                                    placeholder="Search or select country..."
                                    onRemove={() => {
                                        setUrlData({ ...urlData, country: '', state: '', city: '' });
                                        setCountrySearch('');
                                        setStateSearch('');
                                        setCitySearch('');
                                    }}
                                    storageKey="recentCountries"
                                />

                                {/* State Dropdown - Only shown if country is selected */}
                                {urlData.country && (
                                    <CountryStateCityDropdown
                                        label="State"
                                        type="state"
                                        value={urlData.state}
                                        searchValue={stateSearch}
                                        onSearchChange={setStateSearch}
                                        onChange={(selectedState) => {
                                            setUrlData({ ...urlData, state: selectedState, city: '' });
                                            setCitySearch('');
                                            saveRecentState(selectedState);
                                        }}
                                        options={states}
                                        recentOptions={recentStates}
                                        disabled={isSubmitting || loadingStates}
                                        loading={loadingStates}
                                        placeholder={
                                            loadingStates
                                                ? "Loading states..."
                                                : states.length === 0
                                                    ? "No states available for this country"
                                                    : "Search or select state..."
                                        }
                                        contextInfo={`(in ${urlData.country})`}
                                        onRemove={() => {
                                            setUrlData({ ...urlData, state: '', city: '' });
                                            setStateSearch('');
                                            setCitySearch('');
                                            setCities([]);
                                        }}
                                        storageKey="recentStates"
                                        noOptionsMessage={`No states found for ${urlData.country}. You can skip this field.`}
                                    />
                                )}

                                {/* City Dropdown - Only shown if state is selected */}
                                {urlData.state && (
                                    <CountryStateCityDropdown
                                        label="City"
                                        type="city"
                                        value={urlData.city}
                                        searchValue={citySearch}
                                        onSearchChange={setCitySearch}
                                        onChange={(selectedCity) => {
                                            setUrlData({ ...urlData, city: selectedCity });
                                            saveRecentCity(selectedCity);
                                        }}
                                        options={cities}
                                        recentOptions={recentCities}
                                        disabled={isSubmitting || loadingCities}
                                        loading={loadingCities}
                                        placeholder={
                                            loadingCities
                                                ? "Loading cities..."
                                                : cities.length === 0
                                                    ? "No cities available for this state"
                                                    : "Search or select city..."
                                        }
                                        contextInfo={`(in ${urlData.state}, ${urlData.country})`}
                                        onRemove={() => {
                                            setUrlData({ ...urlData, city: '' });
                                            setCitySearch('');
                                        }}
                                        storageKey="recentCities"
                                        noOptionsMessage={`No cities found for ${urlData.state}. You can skip this field.`}
                                    />
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setUrlData({
                                                url: '',
                                                name: '',
                                                username: '',
                                                society: '',
                                                collage: '',
                                                country: '',
                                                city: ''
                                            });
                                            setUrlErrors({});
                                            setShowNewSociety(false);
                                            setShowNewCollege(false);
                                            setCountrySearch('');
                                            setCitySearch('');
                                        }}
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FA5054] hover:bg-[#e94448]'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Creating...</span>
                                            </div>
                                        ) : (
                                            'Create'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-auto">
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && setShowEditModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300">
                        {/* Header */}
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">
                                Edit URL
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleSubmitEdit}>
                                {/* URL Input - Required */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        URL
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`w-full py-2 px-3 border rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${urlErrors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                        placeholder="Enter URL (e.g., https://example.com)"
                                        value={editData.url}
                                        onChange={(e) => {
                                            if (urlErrors.url) {
                                                setUrlErrors({});
                                            }
                                            setEditData({ ...editData, url: e.target.value });
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    {urlErrors.url && (
                                        <p className="text-red-500 text-sm mt-1">{urlErrors.url}</p>
                                    )}
                                </div>

                                {/* Name Input */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                        placeholder="Enter name (optional)"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Username Input */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Username</label>
                                    <input
                                        type="text"
                                        className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                        placeholder="Enter username (optional)"
                                        value={editData.username}
                                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Society Dropdown with Add New */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Society</label>

                                    {!showNewSociety && societies.length > 0 ? (
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                value={editData.society || ""}
                                                onChange={(e) => {
                                                    if (e.target.value === "__add_new__") {
                                                        setShowNewSociety(true);
                                                    } else {
                                                        setEditData({ ...editData, society: e.target.value });
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <option value="" disabled>
                                                    Select society (optional)
                                                </option>

                                                {societies.map((society, index) => (
                                                    <option key={index} value={society}>
                                                        {society}
                                                    </option>
                                                ))}

                                                <option value="__add_new__" className="text-[#FA5054] font-medium">
                                                    + Add New Society
                                                </option>
                                            </select>

                                            {/* REMOVE BUTTON */}
                                            {editData.society && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditData({ ...editData, society: "" });
                                                        setShowNewSociety(false);
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                placeholder="Enter new society name"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const newSociety = e.target.value.trim();
                                                        if (newSociety) {
                                                            if (!societies.includes(newSociety)) {
                                                                setSocieties([...societies, newSociety].sort());
                                                                showToast("Society added successfully");
                                                            }
                                                            setEditData({ ...editData, society: newSociety });
                                                            setShowNewSociety(false);
                                                        }
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            />

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const input = e.target.previousSibling;
                                                    const newSociety = input.value.trim();
                                                    if (newSociety) {
                                                        if (!societies.includes(newSociety)) {
                                                            setSocieties([...societies, newSociety].sort());
                                                            showToast("Society added successfully");
                                                        }
                                                        setEditData({ ...editData, society: newSociety });
                                                        setShowNewSociety(false);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-[#FA5054] text-white rounded hover:bg-[#e94448] transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                Add
                                            </button>

                                            {/* REMOVE (CLEAR VALUE) */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditData({ ...editData, society: "" });
                                                    setShowNewSociety(false);
                                                }}
                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>


                                {/* College Dropdown with Add New */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">College</label>

                                    {!showNewCollege && colleges.length > 0 ? (
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                value={editData.collage || ""}
                                                onChange={(e) => {
                                                    if (e.target.value === "__add_new__") {
                                                        setShowNewCollege(true);
                                                    } else {
                                                        setEditData({ ...editData, collage: e.target.value });
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <option value="" disabled>
                                                    Select college (optional)
                                                </option>

                                                {colleges.map((college, index) => (
                                                    <option key={index} value={college}>
                                                        {college}
                                                    </option>
                                                ))}

                                                <option value="__add_new__" className="text-[#FA5054] font-medium">
                                                    + Add New College
                                                </option>
                                            </select>

                                            {/* REMOVE BUTTON */}
                                            {editData.collage && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditData({ ...editData, collage: "" });
                                                        setShowNewCollege(false);
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                    disabled={isSubmitting}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                                                placeholder="Enter new college name"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const newCollege = e.target.value.trim();
                                                        if (newCollege) {
                                                            if (!colleges.includes(newCollege)) {
                                                                setColleges([...colleges, newCollege].sort());
                                                                showToast("College added successfully");
                                                            }
                                                            setEditData({ ...editData, collage: newCollege });
                                                            setShowNewCollege(false);
                                                        }
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            />

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const input = e.target.previousSibling;
                                                    const newCollege = input.value.trim();
                                                    if (newCollege) {
                                                        if (!colleges.includes(newCollege)) {
                                                            setColleges([...colleges, newCollege].sort());
                                                            showToast("College added successfully");
                                                        }
                                                        setEditData({ ...editData, collage: newCollege });
                                                        setShowNewCollege(false);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-[#FA5054] text-white rounded hover:bg-[#e94448] transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                Add
                                            </button>

                                            {/* CANCEL / REMOVE */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditData({ ...editData, collage: "" });
                                                    setShowNewCollege(false);
                                                }}
                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>


                                {/* Country Dropdown */}
                                <CountryStateCityDropdown
                                    label="Country"
                                    type="country"
                                    value={editData.country}
                                    searchValue={countrySearch}
                                    onSearchChange={setCountrySearch}
                                    onChange={(selectedCountry) => {
                                        setEditData({ ...editData, country: selectedCountry, state: '', city: '' });
                                        setStateSearch('');
                                        setCitySearch('');
                                        if (selectedCountry) {
                                            fetchStates(selectedCountry);
                                        }
                                    }}
                                    options={countries}
                                    recentOptions={recentCountries}
                                    disabled={isSubmitting || loadingCountries}
                                    loading={loadingCountries}
                                    placeholder="Search or select country..."
                                    onRemove={() => {
                                        setEditData({ ...editData, country: '', state: '', city: '' });
                                        setCountrySearch('');
                                        setStateSearch('');
                                        setCitySearch('');
                                        setStates([]);
                                        setCities([]);
                                    }}
                                    storageKey="recentCountries"
                                />

                                {/* State Dropdown - Only shown if country is selected */}
                                {editData.country && (
                                    <CountryStateCityDropdown
                                        label="State"
                                        type="state"
                                        value={editData.state}
                                        searchValue={stateSearch}
                                        onSearchChange={setStateSearch}
                                        onChange={(selectedState) => {
                                            setEditData({ ...editData, state: selectedState, city: '' });
                                            setCitySearch('');
                                            if (selectedState) {
                                                fetchCities(editData.country, selectedState);
                                            }
                                        }}
                                        options={states}
                                        recentOptions={recentStates}
                                        disabled={isSubmitting || loadingStates}
                                        loading={loadingStates}
                                        placeholder="Search or select state..."
                                        contextInfo={`(in ${editData.country})`}
                                        onRemove={() => {
                                            setEditData({ ...editData, state: '', city: '' });
                                            setStateSearch('');
                                            setCitySearch('');
                                            setCities([]);
                                        }}
                                        storageKey="recentStates"
                                    />
                                )}

                                {/* City Dropdown - Only shown if state is selected */}
                                {editData.state && (
                                    <CountryStateCityDropdown
                                        label="City"
                                        type="city"
                                        value={editData.city}
                                        searchValue={citySearch}
                                        onSearchChange={setCitySearch}
                                        onChange={(selectedCity) => {
                                            setEditData({ ...editData, city: selectedCity });
                                        }}
                                        options={cities}
                                        recentOptions={recentCities}
                                        disabled={isSubmitting || loadingCities}
                                        loading={loadingCities}
                                        placeholder="Search or select city..."
                                        contextInfo={`(in ${editData.state}, ${editData.country})`}
                                        onRemove={() => {
                                            setEditData({ ...editData, city: '' });
                                            setCitySearch('');
                                        }}
                                        storageKey="recentCities"
                                    />
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingItem(null);
                                            setEditData({
                                                url: '',
                                                name: '',
                                                username: '',
                                                society: '',
                                                collage: '',
                                                country: '',
                                                city: ''
                                            });
                                            setUrlErrors({});
                                            setShowNewSociety(false);
                                            setShowNewCollege(false);
                                            setCountrySearch('');
                                            setCitySearch('');
                                        }}
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FA5054] hover:bg-[#e94448]'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Updating...</span>
                                            </div>
                                        ) : (
                                            'Update'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                />
            )}

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

export default WebAnalytics;