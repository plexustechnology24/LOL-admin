import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEnvelopeOpen, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";

// img
import instagram from "../../assest/instagram.svg"
import tiktok from "../../assest/tiktok.svg"
import snapchat from "../../assest/snapchat.svg"


const Collab = () => {
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isBulk: false });
    const searchContainerRef = useRef(null);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim() === '') {
            setCurrentPage(1);
            getData(1, '');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Reset to first page when searching
        setCurrentPage(1);
        // Perform search with backend
        getData(1, searchTerm.trim());
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        // Get data without search term
        getData(1, '');
    };

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [Items, setTotalItems] = useState();

    const getData = async (page = currentPage, search = searchTerm) => {
        try {
            setLoading(true);

            const requestData = {
                page: page,
                limit: itemsPerPage,
                search: search.trim() // Add search parameter
            };
            const response = await axios.post('https://api.lolcards.link/api/collab/read', requestData);

            // setData(response.data.data);
            setFilteredData(response.data.data); // Backend handles filtering now

            setSelectAll(false);

            setCurrentPage(response.data.pagination.currentPage);
            setTotalItems(response.data.pagination.totalItems);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData(currentPage, searchTerm);
    }, [itemsPerPage]); // Re-fetch when items per page changes


    useEffect(() => {
        const hasAutoMarked = sessionStorage.getItem('hasAutoMarkedAsRead');

        if (hasAutoMarked === 'true') {
            return; // Skip if already executed
        }

        const timer = setTimeout(async () => {
            // Find all unread items
            const unreadItems = filteredData.filter(item => !item.read);

            if (unreadItems.length > 0) {
                try {
                    // Mark all unread items as read
                    const updatePromises = unreadItems.map(item =>
                        axios.put(
                            `https://api.lolcards.link/api/collab/update/${item._id}`,
                            { read: true }
                        )
                    );

                    await Promise.all(updatePromises);

                    // Refresh data to show updated read status
                    getData(currentPage, searchTerm);

                    toast.info(`Marked ${unreadItems.length} item(s) as read`);

                    sessionStorage.setItem('hasAutoMarkedAsRead', 'true');
                } catch (err) {
                    console.error('Error auto-marking items as read:', err);
                }
            } else {
                // Even if no items to mark, set the flag to prevent future checks
                sessionStorage.setItem('hasAutoMarkedAsRead', 'true');
            }
        }, 5000); // 5 seconds

        // Cleanup timer on unmount or when filteredData changes
        return () => clearTimeout(timer);
    }, [filteredData]);

    const totalItems = filteredData.length;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const getSortedData = (data) => {
        return [...data].sort((a, b) => {
            // If 'a' is unread and 'b' is read, 'a' comes first
            if (!a.read && b.read) return -1;
            // If 'a' is read and 'b' is unread, 'b' comes first
            if (a.read && !b.read) return 1;
            // Otherwise maintain original order
            return 0;
        });
    };

    // Update the currentItems calculation
    const sortedData = getSortedData(filteredData);
    const currentItems = sortedData;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success("Email copied to clipboard!");
            })
            .catch(() => {
                alert("No id to copy!");
            });
    };

    const getSocialMediaUrl = (platform, id) => {
        if (!id) return null;

        const urls = {
            instagram: `https://instagram.com/${id}`,
            snapchat: `https://snapchat.com/add/${id}`,
            tiktok: `https://tiktok.com/@${id}`
        };

        return urls[platform];
    };

    const openDeleteModal = (id = null, isBulk = false) => {
        if (isBulk && selectedItems.length === 0) {
            toast.info("No items selected for deletion.");
            return;
        }
        setDeleteModal({ isOpen: true, id, isBulk });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, id: null, isBulk: false });
    };

    const clearAllFilters = () => {
        setSelectedItems([]);
        setSelectAll(false);
        setCurrentPage(1);
        getData(1);
        toast.info("All filters cleared");
    };

    const handleSelectAll = () => {
        if (!selectAll) {
            const allIds = currentItems.map(item => item._id);
            setSelectedItems(allIds);
        } else {
            setSelectedItems([]);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
            if (selectAll) setSelectAll(false);
        } else {
            setSelectedItems([...selectedItems, id]);
            const allSelected = currentItems.every(item =>
                selectedItems.includes(item._id) || item._id === id
            );
            setSelectAll(allSelected);
        }
    };

    const handleDeleteSelected = () => {
        setIsDeleting(true);

        const payload = {
            ids: selectedItems,
            TypeId: "10"
        };

        axios.post('https://api.lolcards.link/api/admin/deleteMultiple', payload)
            .then(() => {
                toast.success(`Successfully deleted ${selectedItems.length} items.`);

                // Clear selection after delete
                setSelectedItems([]);
                setSelectAll(false);

                getData(currentPage, searchTerm);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to delete selected items. Please try again.");
            })
            .finally(() => {
                setIsDeleting(false);
                closeDeleteModal();
            });
    };
    useEffect(() => {
        if (currentItems.length > 0 && selectedItems.length > 0) {
            const allCurrentItemsSelected = currentItems.every(item =>
                selectedItems.includes(item._id)
            );
            setSelectAll(allCurrentItemsSelected);
        } else {
            setSelectAll(false);
        }
    }, [currentItems, selectedItems]);

    const handleCopySocialId = (id, platform) => {
        navigator.clipboard.writeText(id)
            .then(() => {
                toast.success(`${platform} ID copied to clipboard!`);
            })
            .catch(() => {
                toast.error("Failed to copy!");
            });
    };

    const renderSocialMediaIcon = (id, platform) => {
        if (!id) return null;

        const url = getSocialMediaUrl(platform, id);

        const imageMap = {
            instagram: instagram,
            snapchat: snapchat,
            tiktok: tiktok
        };

        const imageSrc = imageMap[platform];
        if (!imageSrc) return null;

        return (
            <div className="relative group/social w-12 h-12 mx-auto">
                {/* Social Media Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={imageSrc}
                        alt={platform}
                        className="w-8 h-8 transition-transform"
                        title={id}
                    />
                </div>

                {/* Hover Overlay with Copy and Link buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover/social:opacity-100 rounded-full flex items-center justify-center gap-2 transition-opacity duration-200 z-10">
                    <button
                        onClick={() => handleCopySocialId(id, platform)}
                        className="text-white hover:text-blue-300 transition-colors"
                        title={`Copy ${platform} ID`}
                    >
                        <FontAwesomeIcon icon={faCopy} />
                    </button>

                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-green-300 transition-colors"
                        title={`Open ${platform} profile`}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        );
    };

    const handleMarkAsRead = async (id, currentRead) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const response = await axios.put(
                `https://api.lolcards.link/api/collab/update/${id}`,
                { read: !currentRead }   // 🔁 toggle
            );

            toast.success(
                response.data.message ||
                (!currentRead ? "Marked as read!" : "Marked as unread!")
            );

            getData(currentPage, searchTerm);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDelete = () => {
        axios
            .delete(`https://api.lolcards.link/api/collab/delete/${deleteModal.id}`)
            .then((res) => {
                if (currentItems.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    getData(currentPage);
                }
                closeDeleteModal();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
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
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="App Collabration" />
            <div className="space-y-6 sticky left-0">
                <div className="flex gap-4">
                    {/* NEW: Delete Selected Button */}
                    {selectedItems.length > 0 && (
                        <Button
                            onClick={() => openDeleteModal(null, true)}
                            disabled={isDeleting}
                            variant="danger"
                            className="d-flex align-items-center gap-2 py-1"
                            style={{ fontSize: "14px", color: "#f13838", border: "none" }}
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faTrash} className="pe-3" />
                                    <span>DELETE SELECTED ({selectedItems.length})</span>
                                </>
                            )}
                        </Button>
                    )}

                    {selectedItems.length > 0 && (
                        <Button
                            onClick={clearAllFilters}
                            variant="outline-secondary"
                            className="d-flex align-items-center gap-2 py-1 border-0 bg-transparent"
                            style={{ fontSize: "14px", color: "#f13838" }}
                        >
                            CLEAR ALL
                        </Button>
                    )}

                </div>

                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">
                            <div className="flex gap-4">
                                <div ref={searchContainerRef} className="relative">
                                    <form onSubmit={handleSearchSubmit}>
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
                                                placeholder="Search by email, name, city, phone, or social IDs..."
                                                aria-label="Search by emails"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-md text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                                            />
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                {searchTerm && (
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-[7px] py-[4.5px] text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                        onClick={handleClearSearch}
                                                        title="Clear search"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                )}
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center px-[7px] py-[4.5px] text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                                    title="Search"
                                                >
                                                    <FontAwesomeIcon icon={faSearch} />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Type</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">App Login Email Id</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Email Id</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Name</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Phone Number</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">City</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Social Media</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Status</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((collab, index) => (
                                            <TableRow key={collab._id} className={!collab.read ? "bg-gray-50 dark:bg-blue-900/10" : ""}>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                            checked={selectedItems.includes(collab._id)}
                                                            onChange={() => handleSelectItem(collab._id)}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {!collab.read && (
                                                            <span className="px-2 py-[2px] text-xs font-semibold text-red-500  
                       shadow border-2 border-red-400/60 
                       rounded-full uppercase tracking-wide">
                                                                new
                                                            </span>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {indexOfFirstItem + index + 1}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-900 break-all w-[150px]">
                                                            {collab.type || "App"}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">

                                                        <span className="text-sm text-gray-900 break-all w-[150px]">
                                                            {collab.id || "-"}
                                                        </span>

                                                        {collab.id && (
                                                            <button
                                                                className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                                                                onClick={() => handleCopyToClipboard(collab.id)}
                                                            >
                                                                <FontAwesomeIcon icon={faCopy} />
                                                            </button>
                                                        )}

                                                    </div>
                                                </TableCell>


                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 ">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <span className="text-sm text-gray-900 break-all w-[150px]">
                                                            {collab.email || "-"}
                                                        </span>
                                                        <button
                                                            className="text-gray-600 hover:text-gray-800"
                                                            onClick={() => handleCopyToClipboard(collab.email)}
                                                            title="Copy to clipboard"
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{collab.name}</TableCell>
                                                <TableCell
                                                    className="py-3 px-2 border-r border-gray-200 
             dark:border-gray-700 dark:text-gray-400 
             w-[100px] max-w-[100px] 
             break-words whitespace-normal"
                                                >
                                                    {collab.number || "-"}
                                                </TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{collab.city}</TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex flex-col items-center justify-center gap-3 py-2">
                                                        {renderSocialMediaIcon(collab.instaId, 'instagram')}
                                                        {renderSocialMediaIcon(collab.snapId, 'snapchat')}
                                                        {renderSocialMediaIcon(collab.tiktokId, 'tiktok')}
                                                        {!collab.instaId && !collab.snapId && !collab.tiktokId && (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <button
                                                        className={`${collab.read
                                                            ? "text-green-600 hover:text-gray-500"
                                                            : "text-gray-400 hover:text-green-600"
                                                            }`}
                                                        onClick={() => handleMarkAsRead(collab._id, collab.read)}
                                                        title={collab.read ? "Mark as unread" : "Mark as read"}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={collab.read ? faEnvelopeOpen : faEnvelope}
                                                            className="text-lg"
                                                        />
                                                    </button>
                                                </TableCell>


                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex align-middle justify-center gap-4">
                                                        <button className="text-red-600" onClick={() => openDeleteModal(collab._id)}>
                                                            <FontAwesomeIcon icon={faTrash}
                                                                className="text-lg" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={12} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                        </tr>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Only show pagination if there are multiple pages */}
            {totalPages > 0 && (
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(Items / itemsPerPage)}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        setSelectedItems([]);
                        getData(page, searchTerm);
                        setSelectAll(false);
                    }}
                    itemsPerPage={itemsPerPage}
                    totalItems={Items}
                />
            )}


            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">

                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            {deleteModal.isBulk ? 'Delete Selected Items' : 'Delete App Collabration'}
                        </h2>

                        <p className="text-gray-700 mb-6">
                            {deleteModal.isBulk
                                ? `Are you sure you want to delete ${selectedItems.length} selected items?`
                                : 'Are you sure you want to delete this App Collabration?'
                            }
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-70"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={deleteModal.isBulk ? handleDeleteSelected : handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-70"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default Collab;