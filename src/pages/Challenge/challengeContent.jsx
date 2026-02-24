import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faEdit, faPlus, faTrash, faBold, faItalic, faUnderline } from "@fortawesome/free-solid-svg-icons";
import { faCopy, faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { Editor } from 'react-draft-wysiwyg';
import EmojiPicker from 'emoji-picker-react';
import { EditorState, Modifier, convertToRaw, convertFromRaw, RichUtils } from 'draft-js';


const ChallengeContent = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isBulk: false });
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [savedSelection, setSavedSelection] = useState(null); // NEW: Save cursor position
    const [errors, setErrors] = useState({});
    const emojiPickerRef = useRef(null);
    const editorRef = useRef(null);
    const dropdownRef = useRef(null);

    const [isAccessOpen, setIsAccessOpen] = useState(false);
    const [activeTab2, setActiveTab2] = useState('');

    const accessTypes = [
        { id: 'Angry', label: 'Angry' },
        { id: 'Happy', label: 'Happy' },
        { id: 'Love', label: 'Love' },
        { id: 'Sad', label: 'Sad' }
    ];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;


    // Convert Draft.js content to HTML for storage
    const convertContentToHTML = (contentState) => {
        const rawContent = convertToRaw(contentState);
        let html = '';

        rawContent.blocks.forEach(block => {
            let text = block.text;
            const inlineStyles = [];

            // Collect all inline styles with their ranges
            block.inlineStyleRanges.forEach(style => {
                inlineStyles.push({
                    start: style.offset,
                    end: style.offset + style.length,
                    style: style.style
                });
            });

            // Sort by start position (descending) to apply styles from end to start
            inlineStyles.sort((a, b) => b.start - a.start);

            // Apply styles
            inlineStyles.forEach(({ start, end, style }) => {
                const before = text.slice(0, start);
                const styled = text.slice(start, end);
                const after = text.slice(end);

                if (style === 'BOLD') {
                    text = before + '<b>' + styled + '</b>' + after;
                } else if (style === 'ITALIC') {
                    text = before + '<i>' + styled + '</i>' + after;
                } else if (style === 'UNDERLINE') {
                    text = before + '<u>' + styled + '</u>' + after;
                }
            });

            html += text;
        });

        return html;
    };

    // Convert HTML back to Draft.js content
    const convertHTMLToContent = (html) => {
        if (!html) return EditorState.createEmpty();

        const blocks = [];
        let plainText = '';
        const inlineStyles = [];
        let currentPos = 0;

        // Parse HTML and extract text with tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                plainText += text;
                currentPos += text.length;
            } else if (node.nodeName === 'B' || node.nodeName === 'STRONG') {
                const startPos = currentPos;
                node.childNodes.forEach(processNode);
                const endPos = currentPos;
                inlineStyles.push({
                    offset: startPos,
                    length: endPos - startPos,
                    style: 'BOLD'
                });
            } else if (node.nodeName === 'I' || node.nodeName === 'EM') {
                const startPos = currentPos;
                node.childNodes.forEach(processNode);
                const endPos = currentPos;
                inlineStyles.push({
                    offset: startPos,
                    length: endPos - startPos,
                    style: 'ITALIC'
                });
            } else if (node.nodeName === 'U') {
                const startPos = currentPos;
                node.childNodes.forEach(processNode);
                const endPos = currentPos;
                inlineStyles.push({
                    offset: startPos,
                    length: endPos - startPos,
                    style: 'UNDERLINE'
                });
            } else {
                node.childNodes.forEach(processNode);
            }
        };

        tempDiv.childNodes.forEach(processNode);

        blocks.push({
            key: 'first-block',
            text: plainText,
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: inlineStyles,
            entityRanges: [],
            data: {}
        });

        const contentState = convertFromRaw({
            blocks: blocks,
            entityMap: {}
        });

        return EditorState.createWithContent(contentState);
    };

    // Render content with HTML (for display in table)
    const renderHTMLContent = (htmlContent) => {
        return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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
        setActiveTab2('');
        setSelectedItems([]);
        setSelectAll(false);
        setCurrentPage(1);
        getData(1);
        toast.info("All filters cleared");
    };




    const handleBoldToggle = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
    };

    const handleItalicToggle = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
    };

    const handleUnderlineToggle = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
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

    // ADD THIS NEW FUNCTION
    const handleBeforeInputWithStyleClear = (chars, editorState) => {
        const currentText = editorState.getCurrentContent().getPlainText();
        const currentLength = [...currentText].length; // Use spread operator

        // Check character limit
        if (currentLength >= 150) {
            return 'handled';
        }

        // If space is pressed, remove all inline styles
        if (chars === ' ') {
            const contentState = editorState.getCurrentContent();
            const selection = editorState.getSelection();

            // Insert space without any styles
            const newContentState = Modifier.replaceText(
                contentState,
                selection,
                ' ',
                null // This clears all inline styles
            );

            const newEditorState = EditorState.push(
                editorState,
                newContentState,
                'insert-characters'
            );

            setEditorState(newEditorState);
            return 'handled';
        }

        return 'not-handled';
    };

    const sanitizeEmojiPlaceholders = (text) => {
        return text.replace(/:[a-z_]+:/g, (match) => {
            return match;
        });
    };

    const handleBeforeInput = (chars, editorState) => {
        const currentText = editorState.getCurrentContent().getPlainText();
        const currentLength = [...currentText].length; // Use spread operator

        if (currentLength >= 150) {
            return 'handled';  // stops further typing
        }
        return 'not-handled';
    };

    const handlePastedText = (text, html, editorState) => {
        const sanitizedText = sanitizeEmojiPlaceholders(text);

        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const currentText = contentState.getPlainText();

        const currentLength = [...currentText].length; // Use spread operator
        const availableChars = 150 - currentLength;

        // If no space left, block paste
        if (availableChars <= 0) {
            return 'handled';
        }

        // Trim using spread operator for accurate emoji counting
        const textArray = [...sanitizedText];
        const finalText = textArray.slice(0, availableChars).join('');

        const newContentState = Modifier.replaceText(
            contentState,
            selection,
            finalText
        );

        const newEditorState = EditorState.push(
            editorState,
            newContentState,
            'insert-characters'
        );

        setEditorState(newEditorState);
        return 'handled'; // prevent default paste
    };


    const validate = () => {
        const newErrors = {};
        const plainText = editorState.getCurrentContent().getPlainText().trim();
        if (!plainText) newErrors.description = 'Notification Description is required';
        return newErrors;
    };

    const handleEmojiSelect = (emoji) => {
        const contentState = editorState.getCurrentContent();

        // Use saved selection or current selection
        const selection = savedSelection || editorState.getSelection();

        // Insert emoji at the saved cursor position
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

        // Calculate new cursor position (after the emoji)
        const newSelection = selection.merge({
            anchorOffset: selection.getAnchorOffset() + emoji.emoji.length,
            focusOffset: selection.getFocusOffset() + emoji.emoji.length,
        });

        // Force selection to the new position
        const finalEditorState = EditorState.forceSelection(newEditorState, newSelection);

        setEditorState(finalEditorState);

        // Clear saved selection
        setSavedSelection(null);

        // Keep emoji picker open and focus back to editor
        if (editorRef.current) {
            setTimeout(() => {
                editorRef.current.focus();
            }, 0);
        }
    };

    const getData = useCallback((page = null) => {
        setLoading(true);
        const payload = {
            page: page !== null ? page : currentPage,
            limit: itemsPerPage
        };

        axios.post('https://api.lolcards.link/api/challenge/content/read', payload)
            .then((res) => {
                setData(res.data.data);
                setPagination(res.data.pagination);
                setFilteredData(res.data.data);
                if (res.data.pagination) {
                    const totalPages = res.data.pagination.totalPages;
                    const requestedPage = page !== null ? page : currentPage;
                    if (requestedPage > totalPages && totalPages > 0) {
                        setCurrentPage(totalPages);
                        getData(totalPages);
                    }
                }
                // Reset selection when data is refreshed
                setSelectedItems([]);
                setSelectAll(false);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data");
            });
    }, [currentPage, itemsPerPage, activeTab2]);

    useEffect(() => {
        setCurrentPage(1);
        getData(1);
    }, [activeTab2]);

    useEffect(() => {
        if (!loading) {
            getData();
        }
    }, [currentPage]);

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
            TypeId: "12" // Use appropriate TypeId for Challenge content
        };

        axios.post('https://api.lolcards.link/api/admin/deleteMultiple', payload)
            .then(() => {
                toast.success(`Successfully deleted ${selectedItems.length} items.`);
                getData();
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

    const handleDelete = () => {
        axios
            .delete(`https://api.lolcards.link/api/challenge/content/delete/${deleteModal.id}`)
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

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setEditorState(EditorState.createEmpty());
            }
        } else {
            setEditorState(EditorState.createEmpty());
        }
        setVisible(!visible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validate content from editor
        const plainText = editorState.getCurrentContent().getPlainText().trim();
        if (!plainText) {
            toast.error('Content is required');
            return;
        }

        // Check character limit
        if ([...plainText].length > 150) {
            toast.error('Content must not exceed 150 characters');
            return;
        }

        try {
            setIsSubmitting(true);
            // Convert content to HTML for storage
            const htmlContent = convertContentToHTML(editorState.getCurrentContent());


            const payload = {
                Content: htmlContent,
            };

            if (id) {
                await axios.patch(
                    `https://api.lolcards.link/api/challenge/content/update/${id}`,
                    payload
                );
            } else {
                await axios.post(
                    'https://api.lolcards.link/api/challenge/content/create',
                    payload
                );
            }

            setEditorState(EditorState.createEmpty());
            setId(undefined);
            setVisible(false);
            getData(currentPage);

        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (content) => {
        const newEditorState = convertHTMLToContent(content.Content || '');
        setEditorState(newEditorState);
        setId(content._id);
        setVisible(true);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, []);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsAccessOpen(false);
            }

            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
                setSavedSelection(null); // Clear saved selection when closing picker
            }
        };

        if (isAccessOpen || showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isAccessOpen, showEmojiPicker]);

    const handleCopyToClipboard = (content) => {
        if (content?.Content) {
            // Strip HTML tags for plain text copy
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content.Content;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';

            navigator.clipboard.writeText(plainText)
                .then(() => {
                    toast.success("Content copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            // alert("No Content to copy!");
            toast.error("No Content to copy!");
        }
    };

    const toolbarOptions = {
        options: [],
    };

    // Check if current selection has bold style
    const currentStyle = editorState.getCurrentInlineStyle();
    const isBold = currentStyle.has('BOLD');
    const isItalic = currentStyle.has('ITALIC');
    const isUnderline = currentStyle.has('UNDERLINE');

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Challenge Content" />

            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 gap-4">
                            <div className="flex gap-4">
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

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => toggleModal('add')}
                                    className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                    style={{ background: "#FA4B56" }}
                                >
                                    <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Content
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">

                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Challenge Content</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems && currentItems.length > 0 ? (
                                        currentItems.map((content, index) => (
                                            <TableRow key={content._id}>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            checked={selectedItems.includes(content._id)}
                                                            onChange={() => handleSelectItem(content._id)}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>

                                                <TableCell
                                                    className="py-3 px-2 border-r border-gray-200 
             dark:border-gray-700 dark:text-gray-400 
             w-[650px] max-w-[650px]"
                                                >
                                                    <div className="flex items-center gap-4">

                                                        <div className="flex-1 min-w-0 break-words whitespace-normal">
                                                            {renderHTMLContent(content.Content)}
                                                        </div>

                                                        <button
                                                            className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                                                            onClick={() => handleCopyToClipboard(content)}
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>

                                                    </div>
                                                </TableCell>


                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex align-middle justify-center gap-4 h-full">
                                                        <button style={{ color: "#0385C3" }} onClick={() => handleEdit(content)}>
                                                            <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                        </button>
                                                        <button className="text-red-600" onClick={() => openDeleteModal(content._id)}>
                                                            <FontAwesomeIcon icon={faTrash} className="text-lg" />
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
                </div>
            </div>


            <CustomPagination
                currentPage={currentPage}
                totalPages={pagination ? pagination.totalPages : Math.ceil(filteredData.length / itemsPerPage)}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    setSelectedItems([]);
                    setSelectAll(false);
                    getData(page);
                }}
                itemsPerPage={itemsPerPage}
                totalItems={pagination ? pagination.total : filteredData.length}
            />



            {visible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !isSubmitting && toggleModal('add')}></div>
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Card Content" : "Add Card Content"}
                            </h3>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                <div className="py-2">

                                    <div className="mb-4 relative">
                                        <label className="block font-medium mb-2">
                                            Content
                                            <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                        </label>
                                        <div className="bg-gray-100 p-2 mb-2 rounded text-sm">
                                            <p>Type your message and emoji picker for emojis. (Max 150 characters)</p>
                                        </div>

                                        <div
                                            className={`relative border rounded ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                                            ref={editorRef}
                                        >
                                            {/* Custom Bold Button */}
                                            <div className="border-b border-gray-300 p-2 bg-gray-50 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleBoldToggle}
                                                    className={`px-3 py-1 rounded ${isBold ? 'bg-[#fa4b56] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-400 transition-colors`}
                                                    disabled={isSubmitting}
                                                    title="Bold (Ctrl+B)"
                                                >
                                                    <FontAwesomeIcon icon={faBold} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleItalicToggle}
                                                    className={`px-3 py-1 rounded ${isItalic ? 'bg-[#fa4b56] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-400 transition-colors`}
                                                    disabled={isSubmitting}
                                                    title="Italic (Ctrl+I)"
                                                >
                                                    <FontAwesomeIcon icon={faItalic} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleUnderlineToggle}
                                                    className={`px-3 py-1 rounded ${isUnderline ? 'bg-[#fa4b56] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-400 transition-colors`}
                                                    disabled={isSubmitting}
                                                    title="Underline (Ctrl+U)"
                                                >
                                                    <FontAwesomeIcon icon={faUnderline} />
                                                </button>
                                            </div>

                                            <Editor
                                                editorState={editorState}
                                                wrapperClassName="demo-wrapper"
                                                editorClassName="demo-editor px-2 m-0 border-0 min-h-[100px]"
                                                onEditorStateChange={handleEditorStateChange}
                                                toolbar={toolbarOptions}
                                                placeholder="Enter content"
                                                readOnly={isSubmitting}
                                                handleBeforeInput={(chars) => handleBeforeInputWithStyleClear(chars, editorState)}
                                                handlePastedText={(text, html) => handlePastedText(text, html, editorState)}
                                            />


                                            <div className="border-t border-gray-300 p-2 flex justify-between items-center">
                                                <span className={`text-sm ${[...editorState.getCurrentContent().getPlainText()].length > 150 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {[...editorState.getCurrentContent().getPlainText()].length}/150
                                                </span>
                                                <button
                                                    type="button"
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={() => {
                                                        setSavedSelection(editorState.getSelection());
                                                        setShowEmojiPicker(!showEmojiPicker);
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    <FontAwesomeIcon icon={faFaceSmile} size="lg" />
                                                </button>
                                            </div>

                                            {showEmojiPicker && (
                                                <div
                                                    ref={emojiPickerRef}
                                                    className="absolute bottom-0 right-0 bg-white shadow-lg rounded-lg z-50"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <EmojiPicker
                                                        onEmojiClick={(emoji) => {
                                                            handleEmojiSelect(emoji);
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

                                        {errors.content && (
                                            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-4">
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
                                        className="w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
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

            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            {deleteModal.isBulk ? 'Delete Selected Items' : 'Delete Challenge Content'}
                        </h2>

                        <p className="text-gray-700 mb-6">
                            {deleteModal.isBulk
                                ? `Are you sure you want to delete ${selectedItems.length} selected items?`
                                : 'Are you sure you want to delete this Challenge Content?'
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

export default ChallengeContent;