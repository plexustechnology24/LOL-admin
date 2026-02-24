import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRepeat, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, Modifier } from 'draft-js';
import EmojiPicker from 'emoji-picker-react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { faCopy, faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";


const PushNotification = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    // const [selectedType, setSelectedType] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [repeatLoading, setRepeatLoading] = useState({}); // Track loading state for repeat buttons
    const [searchTerm, setSearchTerm] = useState('');
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


    const dropdownRef = useRef(null);
    const languageDropdownRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const editorRef = useRef(null);

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [Items, setTotalItems] = useState();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)
            ) {
                setIsOpen2(false);
                setIsLanguageDropdownOpen(false);
            }
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (isOpen2 || isLanguageDropdownOpen || showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen2, isLanguageDropdownOpen, showEmojiPicker]);


    // const notificationTypes = [
    //     { id: 'LOL', label: 'English' },
    //     { id: 'प्रेंकस्टर', label: 'Hindi' }
    // ];

    // Remove all formatting toolbar options
    const toolbarOptions = {
        options: [], // Empty array to hide all toolbar options
    };

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                // setSelectedType('');
                setEditorState(EditorState.createEmpty());
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const getData = async (page = currentPage, search = searchTerm) => {
        try {
            setLoading(true);

            // For AutoNotification component
            const requestData = {
                type: "push",
                page: page,
                limit: itemsPerPage,
                search: search.trim() // Add search parameter
            };
            const response = await axios.post('https://api.lolcards.link/api/notification/read', requestData);

            setData(response.data.data);
            setFilteredData(response.data.data); // Backend handles filtering now

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
        getData(currentPage,searchTerm);
    }, [itemsPerPage]); // Re-fetch when items per page changes

    // Handle repeat notification
    const handleRepeat = async (notification) => {
        try {
            setRepeatLoading(prev => ({ ...prev, [notification._id]: true }));

            const response = await axios.post('https://api.lolcards.link/api/notification/create', {
                Title: notification.Title,
                Description: notification.Description,
                type: 'push'
            });

            toast.success("Notification repeated successfully!");

            // Option 1: Refresh data without showing main loading
            // Just fetch new data and update state directly
            const refreshResponse = await axios.post('https://api.lolcards.link/api/notification/read', {
                type: "push",
                page: currentPage,
                limit: itemsPerPage
            });

            setData(refreshResponse.data.data);
            setFilteredData(refreshResponse.data.data);
            setTotalItems(refreshResponse.data.pagination.totalItems);

        } catch (err) {
            console.error(err);
            toast.error("Failed to repeat notification. Please try again.");
        } finally {
            setRepeatLoading(prev => ({ ...prev, [notification._id]: false }));
        }
    };
    const validate = () => {
        const newErrors = {};
        // if (!selectedType) newErrors.type = 'Please select a notification type';

        const plainText = editorState.getCurrentContent().getPlainText().trim();
        if (!plainText) newErrors.description = 'Notification Description is required';

        return newErrors;
    };

    const handleTypeSelect = (typeId) => {
        if (!isSubmitting) {
            // setSelectedType(typeId);
            // Only clear the type error if it exists
            if (errors.type) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.type;
                    return newErrors;
                });
            }
        }
    };

    // Simplified version without formatting conversion
    const convertToOneSignalFormat = (editorState) => {
        const content = editorState.getCurrentContent();
        return content.getPlainText();
    };

    const handleEmojiSelect = (emoji) => {
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();

        // Insert emoji at the current cursor position
        const newContentState = Modifier.replaceText(
            contentState,
            selection,
            emoji.emoji
        );

        // Create new editor state with the modified content
        const newEditorState = EditorState.push(
            editorState,
            newContentState,
            'insert-characters'
        );

        // Move cursor to after the inserted emoji
        const newSelection = selection.merge({
            anchorOffset: selection.getAnchorOffset() + emoji.emoji.length,
            focusOffset: selection.getFocusOffset() + emoji.emoji.length,
        });

        const finalEditorState = EditorState.forceSelection(newEditorState, newSelection);

        setEditorState(finalEditorState);

        // Keep emoji picker open and focus back to editor
        if (editorRef.current) {
            setTimeout(() => {
                editorRef.current.focus();
            }, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);

            // Get plain text without formatting
            const plainText = convertToOneSignalFormat(editorState);

            const request = id !== undefined
                ? axios.patch(`https://api.lolcards.link/api/notification/update/${id}`, {
                    Title: "LOL",
                    Description: plainText
                })
                : axios.post('https://api.lolcards.link/api/notification/create', {
                    Title: "LOL",
                    Description: plainText,
                    type: 'push'
                });

            const res = await request;
            // setSelectedType('');
            setEditorState(EditorState.createEmpty());
            getData();
            toast.success(res.data.message);
            toggleModal('add');
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleEditorStateChange = (state) => {
        setEditorState(state);

        if (errors.description) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        }
    };

    // Add this function to sanitize input with emoji placeholders
    const sanitizeEmojiPlaceholders = (text) => {
        // This regex will match patterns like ":emoji_name:" and escape them
        return text.replace(/:[a-z_]+:/g, (match) => {
            return match; // Keep the text as is, don't try to convert to emoji
        });
    };

    // Modify your paste handling
    const handlePastedText = (text, html, editorState) => {
        // Sanitize the pasted text to handle emoji placeholders
        const sanitizedText = sanitizeEmojiPlaceholders(text);

        // Get the current selection
        const selection = editorState.getSelection();

        // Get the current content
        const contentState = editorState.getCurrentContent();

        // Insert the sanitized text at the current selection
        const newContentState = Modifier.replaceText(
            contentState,
            selection,
            sanitizedText
        );

        // Create new editor state with the modified content
        const newEditorState = EditorState.push(
            editorState,
            newContentState,
            'insert-characters'
        );

        // Update the editor state
        setEditorState(newEditorState);

        // Return true to indicate we've handled the paste
        return true;
    };

    const totalItems = filteredData.length;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Function to display plain text content in the table
    const displayFormattedContent = (content) => {
        if (typeof content === 'string') {
            return content;
        }
        return content;
    };

    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success("Notification copied to clipboard!");
            })
            .catch(() => {
                alert("No id to copy!");
            });
    };

    const handleDelete = async (id) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this Push notification?")) {
            try {
                setIsSubmitting(true);
                const response = await axios.delete(
                    `https://api.lolcards.link/api/notification/delete/${id}`,
                    { data: { type: "push" } }
                );
                toast.success(response.data.message);
                getData(currentPage);
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
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Push-Notification" />
            <div className="space-y-6 sticky left-0">
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
                                                placeholder="Search by description..."
                                                aria-label="Search by description"
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
                            <div className="flex flex-wrap gap-3 align-middle justify-center">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => toggleModal('add')}
                                        className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                        style={{ background: "#FA4B56" }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Push Notification
                                    </Button>
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
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Notification Title</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Notification Description</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((notification, index) => (
                                            <TableRow key={notification._id}>
                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{notification.Title}</TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex items-center justify-center gap-4">
                                                        {displayFormattedContent(notification.Description)}
                                                        <button
                                                            className="text-gray-600 hover:text-gray-800"
                                                            onClick={() => handleCopyToClipboard(notification.Description)}
                                                            title="Copy to clipboard"
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex align-middle justify-center gap-4">
                                                        <button
                                                            style={{ color: "#0385C3" }}
                                                            onClick={() => handleRepeat(notification)}
                                                            disabled={repeatLoading[notification._id]}
                                                            title="Repeat this notification"
                                                            className="relative"
                                                        >
                                                            {repeatLoading[notification._id] ? (
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faRepeat} className="text-lg" />
                                                            )}
                                                        </button>
                                                        <button className="text-red-600" onClick={() => handleDelete(notification._id)}>
                                                            <FontAwesomeIcon icon={faTrash}
                                                                className="text-lg" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
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
                        getData(page, searchTerm);
                    }}
                    itemsPerPage={itemsPerPage}
                    totalItems={Items}
                />
            )}

            {visible && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center">
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && toggleModal('add')}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300">
                        {/* Header */}
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Push Notification" : "Push Notification"}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                {/* Rich Text Editor for description */}
                                <div className="mb-4 relative">
                                    <label className="block font-medium mb-2">
                                        Push Notification Description
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-2 mb-2 rounded text-sm">
                                        <p>Type your message and use emoji picker for adding emojis.</p>
                                    </div>

                                    {/* Rich Text Editor */}
                                    <div
                                        className={`relative border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        ref={editorRef}
                                    >
                                        <Editor
                                            editorState={editorState}
                                            wrapperClassName="demo-wrapper"
                                            editorClassName="demo-editor px-2 m-0 border-0 min-h-[100px] dark:text-gray-300 dark:bg-gray-800"
                                            onEditorStateChange={handleEditorStateChange}
                                            toolbar={toolbarOptions}
                                            placeholder="Enter description"
                                            readOnly={isSubmitting}
                                            handlePastedText={handlePastedText}
                                        />

                                        {/* Emoji Button */}
                                        <div className=" border-gray-300 p-2 flex justify-end">
                                            <button
                                                type="button"
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                disabled={isSubmitting}
                                            >
                                                <FontAwesomeIcon icon={faFaceSmile} size="lg" />
                                            </button>
                                        </div>

                                        {/* Emoji Picker */}
                                        {showEmojiPicker && (
                                            <div
                                                ref={emojiPickerRef}
                                                className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50"
                                                onMouseDown={(e) => {
                                                    // Prevent the editor from losing focus when clicking on emoji picker
                                                    e.preventDefault();
                                                }}
                                            >
                                                <EmojiPicker
                                                    onEmojiClick={(emoji) => {
                                                        handleEmojiSelect(emoji);
                                                        // Optionally close picker after selection
                                                        // setShowEmojiPicker(false);
                                                    }}
                                                    width={300}
                                                    height={400}
                                                    previewConfig={{ showPreview: false }}
                                                    emojiStyle="native"
                                                    emojiVersion="12.0"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => toggleModal()}
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200"
                                        style={{ backgroundColor: "#FA4B56" }}
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

export default PushNotification;