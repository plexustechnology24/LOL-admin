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


const HotnessContent = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [Category, setCategory] = useState('');
    const [CategoryId, setCategoryId] = useState('');          // NEW: track categoryId
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isBulk: false });
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // NEW: dynamic categories from API
    const [allCategories, setAllCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [savedSelection, setSavedSelection] = useState(null);
    const [errors, setErrors] = useState({});
    const emojiPickerRef = useRef(null);
    const editorRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter dropdown
    const [isAccessOpen, setIsAccessOpen] = useState(false);
    const [activeTab2, setActiveTab2] = useState('');

    // Form category dropdown
    const [isFormCategoryOpen, setIsFormCategoryOpen] = useState(false);
    const formCategoryDropdownRef = useRef(null);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;


    // ─── Fetch categories from HotnessCategory API ────────────────────────────
    const fetchCategories = useCallback(() => {
        setCategoriesLoading(true);
        axios.post('https://api.lolcards.link/api/hotness/category/read', { page: 1, limit: 100 })
            .then((res) => {
                if (res.data.allCategories) {
                    setAllCategories(res.data.allCategories);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch categories', err);
                toast.error("Failed to load categories");
            })
            .finally(() => setCategoriesLoading(false));
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Close form category dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formCategoryDropdownRef.current && !formCategoryDropdownRef.current.contains(event.target)) {
                setIsFormCategoryOpen(false);
            }
        };
        if (isFormCategoryOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isFormCategoryOpen]);


    // ─── Draft.js helpers ─────────────────────────────────────────────────────
    const convertContentToHTML = (contentState) => {
        const rawContent = convertToRaw(contentState);
        let html = '';

        rawContent.blocks.forEach(block => {
            let text = block.text;
            const inlineStyles = [];

            block.inlineStyleRanges.forEach(style => {
                inlineStyles.push({ start: style.offset, end: style.offset + style.length, style: style.style });
            });

            inlineStyles.sort((a, b) => b.start - a.start);

            inlineStyles.forEach(({ start, end, style }) => {
                const before = text.slice(0, start);
                const styled = text.slice(start, end);
                const after = text.slice(end);

                if (style === 'BOLD')      text = before + '<b>' + styled + '</b>' + after;
                else if (style === 'ITALIC')    text = before + '<i>' + styled + '</i>' + after;
                else if (style === 'UNDERLINE') text = before + '<u>' + styled + '</u>' + after;
            });

            html += text;
        });

        return html;
    };

    const convertHTMLToContent = (html) => {
        if (!html) return EditorState.createEmpty();

        const blocks = [];
        let plainText = '';
        const inlineStyles = [];
        let currentPos = 0;

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
                inlineStyles.push({ offset: startPos, length: currentPos - startPos, style: 'BOLD' });
            } else if (node.nodeName === 'I' || node.nodeName === 'EM') {
                const startPos = currentPos;
                node.childNodes.forEach(processNode);
                inlineStyles.push({ offset: startPos, length: currentPos - startPos, style: 'ITALIC' });
            } else if (node.nodeName === 'U') {
                const startPos = currentPos;
                node.childNodes.forEach(processNode);
                inlineStyles.push({ offset: startPos, length: currentPos - startPos, style: 'UNDERLINE' });
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

        return EditorState.createWithContent(
            convertFromRaw({ blocks, entityMap: {} })
        );
    };

    const renderHTMLContent = (htmlContent) => (
        <span dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );


    // ─── Delete helpers ───────────────────────────────────────────────────────
    const openDeleteModal = (id = null, isBulk = false) => {
        if (isBulk && selectedItems.length === 0) { toast.info("No items selected for deletion."); return; }
        setDeleteModal({ isOpen: true, id, isBulk });
    };

    const closeDeleteModal = () => setDeleteModal({ isOpen: false, id: null, isBulk: false });

    const clearAllFilters = () => {
        setActiveTab2('');
        setSelectedItems([]);
        setSelectAll(false);
        setCurrentPage(1);
        getData(1);
        toast.info("All filters cleared");
    };


    // ─── Editor handlers ──────────────────────────────────────────────────────
    const handleBoldToggle      = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
    const handleItalicToggle    = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
    const handleUnderlineToggle = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));

    const handleEditorStateChange = (state) => {
        setEditorState(state);
        if (errors.description) {
            setErrors(prev => { const e = { ...prev }; delete e.description; return e; });
        }
    };

    const handleBeforeInputWithStyleClear = (chars, editorState) => {
        const currentLength = [...editorState.getCurrentContent().getPlainText()].length;
        if (currentLength >= 100) return 'handled';

        if (chars === ' ') {
            const newContentState = Modifier.replaceText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                ' ',
                null
            );
            setEditorState(EditorState.push(editorState, newContentState, 'insert-characters'));
            return 'handled';
        }
        return 'not-handled';
    };

    const sanitizeEmojiPlaceholders = (text) => text.replace(/:[a-z_]+:/g, match => match);

    const handlePastedText = (text, html, editorState) => {
        const sanitizedText = sanitizeEmojiPlaceholders(text);
        const contentState   = editorState.getCurrentContent();
        const selection      = editorState.getSelection();
        const currentLength  = [...contentState.getPlainText()].length;
        const available      = 100 - currentLength;

        if (available <= 0) return 'handled';

        const finalText = [...sanitizedText].slice(0, available).join('');
        const newContentState = Modifier.replaceText(contentState, selection, finalText);
        setEditorState(EditorState.push(editorState, newContentState, 'insert-characters'));
        return 'handled';
    };

    const handleEmojiSelect = (emoji) => {
        const contentState = editorState.getCurrentContent();
        const selection    = savedSelection || editorState.getSelection();

        const newContentState = Modifier.replaceText(contentState, selection, emoji.emoji);
        const newEditorState  = EditorState.push(editorState, newContentState, 'insert-characters');

        const newSelection = selection.merge({
            anchorOffset: selection.getAnchorOffset() + emoji.emoji.length,
            focusOffset:  selection.getFocusOffset()  + emoji.emoji.length,
        });

        setEditorState(EditorState.forceSelection(newEditorState, newSelection));
        setSavedSelection(null);
        if (editorRef.current) setTimeout(() => editorRef.current.focus(), 0);
    };


    // ─── Data fetching ────────────────────────────────────────────────────────
    const getData = useCallback((page = null) => {
        setLoading(true);
        const payload = {
            page:     page !== null ? page : currentPage,
            limit:    itemsPerPage,
            category: activeTab2 || undefined,
            question: "hotness"
        };

        axios.post('https://api.lolcards.link/api/content/read', payload)
            .then((res) => {
                setData(res.data.data);
                setPagination(res.data.pagination);
                setFilteredData(res.data.data);

                if (res.data.pagination) {
                    const totalPages    = res.data.pagination.totalPages;
                    const requestedPage = page !== null ? page : currentPage;
                    if (requestedPage > totalPages && totalPages > 0) {
                        setCurrentPage(totalPages);
                        getData(totalPages);
                    }
                }
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

    useEffect(() => { setCurrentPage(1); getData(1); }, [activeTab2]);
    useEffect(() => { if (!loading) getData(); },           [currentPage]);
    useEffect(() => { setCurrentPage(1); },                 []);


    // ─── Selection handlers ───────────────────────────────────────────────────
    const handleSelectAll = () => {
        if (!selectAll) setSelectedItems(currentItems.map(item => item._id));
        else            setSelectedItems([]);
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id));
            if (selectAll) setSelectAll(false);
        } else {
            setSelectedItems([...selectedItems, id]);
            const allSelected = currentItems.every(item => selectedItems.includes(item._id) || item._id === id);
            setSelectAll(allSelected);
        }
    };

    useEffect(() => {
        if (currentItems.length > 0 && selectedItems.length > 0) {
            setSelectAll(currentItems.every(item => selectedItems.includes(item._id)));
        } else {
            setSelectAll(false);
        }
    }, [currentItems, selectedItems]);


    // ─── Delete handlers ──────────────────────────────────────────────────────
    const handleDeleteSelected = () => {
        setIsDeleting(true);
        axios.post('https://api.lolcards.link/api/admin/deleteMultiple', { ids: selectedItems, TypeId: "16" })
            .then(() => {
                toast.success(`Successfully deleted ${selectedItems.length} items.`);
                getData();
            })
            .catch((err) => { console.error(err); toast.error("Failed to delete selected items."); })
            .finally(() => { setIsDeleting(false); closeDeleteModal(); });
    };

    const handleDelete = () => {
        axios.delete(`https://api.lolcards.link/api/content/delete/${deleteModal.id}`, { data: { question: "hotness" } })
            .then((res) => {
                if (currentItems.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
                else getData(currentPage);
                closeDeleteModal();
                toast.success(res.data.message);
            })
            .catch((err) => { console.error(err); toast.error("An error occurred. Please try again."); });
    };


    // ─── Modal helpers ────────────────────────────────────────────────────────
    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setEditorState(EditorState.createEmpty());
                setCategory('');
                setCategoryId('');
            }
        } else {
            setEditorState(EditorState.createEmpty());
            setCategory('');
            setCategoryId('');
        }
        setVisible(!visible);
    };


    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!Category) { toast.error('Please select a category'); return; }

        const plainText = editorState.getCurrentContent().getPlainText().trim();
        if (!plainText)                            { toast.error('Content is required');                        return; }
        if ([...plainText].length > 100)           { toast.error('Content must not exceed 100 characters');     return; }

        try {
            setIsSubmitting(true);
            const htmlContent = convertContentToHTML(editorState.getCurrentContent());

            const payload = {
                Content:    htmlContent,
                Category:   Category,
                categoryId: CategoryId,   // ← pass categoryId
                question:   "hotness"
            };

            if (id) {
                await axios.patch(`https://api.lolcards.link/api/content/update/${id}`, payload);
            } else {
                await axios.post('https://api.lolcards.link/api/content/create', payload);
            }

            setEditorState(EditorState.createEmpty());
            setCategory('');
            setCategoryId('');
            setId(undefined);
            setVisible(false);
            getData(currentPage);
            toast.success(id ? 'Content updated successfully' : 'Content created successfully');
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // ─── Edit ─────────────────────────────────────────────────────────────────
    const handleEdit = (content) => {
        const newEditorState = convertHTMLToContent(content.Content || '');
        setEditorState(newEditorState);
        setCategory(content.Category || '');

        // Resolve categoryId from allCategories by matching title
        const matched = allCategories.find(c => c.title === content.Category);
        setCategoryId(matched ? matched.categoryId : (content.categoryId || ''));

        setId(content._id);
        setVisible(true);
    };


    // ─── Outside-click for filter & emoji ────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setIsAccessOpen(false);

            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
                setSavedSelection(null);
            }
        };
        if (isAccessOpen || showEmojiPicker)
            document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isAccessOpen, showEmojiPicker]);


    // ─── Copy ─────────────────────────────────────────────────────────────────
    const handleCopyToClipboard = (content) => {
        if (content?.Content) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content.Content;
            navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || '')
                .then(() => toast.success("Content copied to clipboard!"))
                .catch(() => toast.error("Failed to copy."));
        } else {
            toast.error("No Content to copy!");
        }
    };

    const toolbarOptions = { options: [] };

    const currentStyle = editorState.getCurrentInlineStyle();
    const isBold      = currentStyle.has('BOLD');
    const isItalic    = currentStyle.has('ITALIC');
    const isUnderline = currentStyle.has('UNDERLINE');

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    // Helper: find image for a category title
    const getCategoryImage = (title) => {
        const cat = allCategories.find(c => c.title === title);
        return cat ? cat.image : null;
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Hotness Content" />

            <div className="space-y-6 sticky left-0">
                <div
                    className="rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
                    style={{ minHeight: "600px" }}
                >
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 gap-4">

                            {/* Left: bulk-delete / clear */}
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
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

                            {/* Right: filter dropdown + add button */}
                            <div className="flex gap-3">

                                {/* ── Filter dropdown with images ── */}
                                <div className="relative inline-block w-64" ref={dropdownRef}>
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:border-gray-800 border rounded-md text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        onClick={() => setIsAccessOpen(!isAccessOpen)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {activeTab2 && getCategoryImage(activeTab2) && (
                                                <img
                                                    src={getCategoryImage(activeTab2)}
                                                    alt={activeTab2}
                                                    className="w-5 h-5 rounded-full object-contain"
                                                />
                                            )}
                                            <span>{activeTab2 === '' ? 'All Categories' : activeTab2}</span>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </button>

                                    {isAccessOpen && (
                                        <div className="absolute w-full h-[300px] overflow-auto mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1">
                                            {/* All Categories option */}
                                            <button
                                                onClick={() => { setActiveTab2(''); setIsAccessOpen(false); }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${activeTab2 === '' ? 'bg-gray-100 dark:bg-white/10' : ''}`}
                                            >
                                                All Categories
                                            </button>

                                            {/* Dynamic categories */}
                                            {categoriesLoading ? (
                                                <div className="px-4 py-2 text-sm text-gray-400">Loading…</div>
                                            ) : (
                                                allCategories.map((cat) => (
                                                    <button
                                                        key={cat.categoryId}
                                                        onClick={() => { setActiveTab2(cat.title); setIsAccessOpen(false); }}
                                                        className={`flex items-center gap-3 w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${activeTab2 === cat.title ? 'bg-gray-100 dark:bg-white/10' : ''}`}
                                                    >
                                                        {cat.image && (
                                                            <img
                                                                src={cat.image}
                                                                alt={cat.title}
                                                                className="w-6 h-6 rounded-full object-contain flex-shrink-0"
                                                            />
                                                        )}
                                                        <span>{cat.title}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

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

                    {/* Table */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
                                            <div className="flex items-center justify-center">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectAll} onChange={handleSelectAll} />
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Hotness Content</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Category</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems && currentItems.length > 0 ? (
                                        currentItems.map((content, index) => (
                                            <TableRow key={content._id}>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-center">
                                                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            checked={selectedItems.includes(content._id)}
                                                            onChange={() => handleSelectItem(content._id)} />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 flex items-center justify-center gap-4">
                                                    {renderHTMLContent(content.Content)}
                                                    <button className="text-gray-600 hover:text-gray-800" onClick={() => handleCopyToClipboard(content)}>
                                                        <FontAwesomeIcon icon={faCopy} />
                                                    </button>
                                                </TableCell>

                                                {/* Category cell – shows image + title */}
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getCategoryImage(content.Category) && (
                                                            <img
                                                                src={getCategoryImage(content.Category)}
                                                                alt={content.Category}
                                                                className="w-6 h-6 rounded-full object-contain"
                                                            />
                                                        )}
                                                        <span>{content.Category || 'N/A'}</span>
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


            {/* ── Add / Edit modal ── */}
            {visible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !isSubmitting && toggleModal('add')} />
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">{id ? "Edit Card Content" : "Add Card Content"}</h3>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                <div className="py-2">

                                    {/* ── Category custom dropdown with images ── */}
                                    <div className="py-2 mb-8">
                                        <label className="block font-medium mb-2">
                                            Category
                                            <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                        </label>

                                        <div className="relative" ref={formCategoryDropdownRef}>
                                            {/* Trigger */}
                                            <button
                                                type="button"
                                                disabled={isSubmitting || categoriesLoading}
                                                onClick={() => setIsFormCategoryOpen(!isFormCategoryOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                            >
                                                {Category ? (
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryImage(Category) && (
                                                            <img
                                                                src={getCategoryImage(Category)}
                                                                alt={Category}
                                                                className="w-6 h-6 rounded-full object-contain"
                                                            />
                                                        )}
                                                        <span className="text-gray-700">{Category}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        {categoriesLoading ? 'Loading categories…' : 'Select Category'}
                                                    </span>
                                                )}
                                                <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-sm" />
                                            </button>

                                            {/* Dropdown options */}
                                            {isFormCategoryOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                                    {allCategories.length === 0 ? (
                                                        <div className="px-4 py-3 text-sm text-gray-400">No categories found</div>
                                                    ) : (
                                                        allCategories.map((cat) => (
                                                            <button
                                                                key={cat.categoryId}
                                                                type="button"
                                                                onClick={() => {
                                                                    setCategory(cat.title);
                                                                    setCategoryId(cat.categoryId);
                                                                    setIsFormCategoryOpen(false);
                                                                }}
                                                                className={`flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${Category === cat.title ? 'bg-gray-100 font-medium' : ''}`}
                                                            >
                                                                {cat.image && (
                                                                    <img
                                                                        src={cat.image}
                                                                        alt={cat.title}
                                                                        className="w-7 h-7 rounded-full object-contain flex-shrink-0 border border-gray-200"
                                                                    />
                                                                )}
                                                                <span className="text-gray-700">{cat.title}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Content editor ── */}
                                    <div className="mb-4 relative">
                                        <label className="block font-medium mb-2">
                                            Content
                                            <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                        </label>
                                        <div className="bg-gray-100 p-2 mb-2 rounded text-sm">
                                            <p>Type your message and use the emoji picker for emojis. (Max 100 characters)</p>
                                        </div>

                                        <div
                                            className={`relative border rounded ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                                            ref={editorRef}
                                        >
                                            {/* Formatting toolbar */}
                                            <div className="border-b border-gray-300 p-2 bg-gray-50 flex gap-2">
                                                <button type="button" onClick={handleBoldToggle} disabled={isSubmitting}
                                                    className={`px-3 py-1 rounded ${isBold ? 'bg-[#fa4b56] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-400 transition-colors`}
                                                    title="Bold (Ctrl+B)">
                                                    <FontAwesomeIcon icon={faBold} />
                                                </button>
                                                <button type="button" onClick={handleItalicToggle} disabled={isSubmitting}
                                                    className={`px-3 py-1 rounded ${isItalic ? 'bg-[#fa4b56] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-400 transition-colors`}
                                                    title="Italic (Ctrl+I)">
                                                    <FontAwesomeIcon icon={faItalic} />
                                                </button>
                                                <button type="button" onClick={handleUnderlineToggle} disabled={isSubmitting}
                                                    className={`px-3 py-1 rounded ${isUnderline ? 'bg-[#fa4b56] text-white' : 'bg-gray-200 text-gray-700'} hover:bg-gray-400 transition-colors`}
                                                    title="Underline (Ctrl+U)">
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

                                            {/* Footer: char count + emoji */}
                                            <div className="border-t border-gray-300 p-2 flex justify-between items-center">
                                                <span className={`text-sm ${[...editorState.getCurrentContent().getPlainText()].length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {[...editorState.getCurrentContent().getPlainText()].length}/100
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
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    <EmojiPicker
                                                        onEmojiClick={handleEmojiSelect}
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

                                {/* Buttons */}
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
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
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

            {/* ── Delete confirmation modal ── */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            {deleteModal.isBulk ? 'Delete Selected Items' : 'Delete Hotness Content'}
                        </h2>
                        <p className="text-gray-700 mb-6">
                            {deleteModal.isBulk
                                ? `Are you sure you want to delete ${selectedItems.length} selected items?`
                                : 'Are you sure you want to delete this Hotness Content?'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={closeDeleteModal} disabled={isDeleting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-70">
                                Cancel
                            </button>
                            <button
                                onClick={deleteModal.isBulk ? handleDeleteSelected : handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-70">
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

export default HotnessContent;