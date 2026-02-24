import React, { useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// img
import dice from "../../assest/dice.png"

const Message = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [bluffBgPreview, setBluffBgPreview] = useState('');
    const [isLoadingBgPreview, setIsLoadingBgPreview] = useState(false);

    // Add the categories array
    const bluffCategories = [
        {
            id: 'Money',
            label: 'Money',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/money.png",
        },
        {
            id: 'Love',
            label: 'Love',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/love.png",
        },
        {
            id: 'Flex',
            label: 'Flex',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/flex.png",
        },
        {
            id: 'Clout',
            label: 'Clout',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/clout.png",
        },
        {
            id: 'Wins',
            label: 'Wins',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/wins.png",
        },
        {
            id: 'Cringe',
            label: 'Cringe',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/cringe.png",
        },
        {
            id: 'Savage',
            label: 'Savage',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/savage.png",
        },
        {
            id: 'Power',
            label: 'Power',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question9/power.png",
        },
    ];

    // Friend/Crush/Love categories (English only)
    const friendCategories = [
        {
            id: 0,
            label: 'Bestie',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Friend/Bestie.png",
        },
        {
            id: 1,
            label: 'Chaos Buddy',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Friend/ChaosBuddy.png",
        },
        {
            id: 2,
            label: 'Just Vibes Friend',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Friend/JustVibesFriend.png",
        },
        {
            id: 3,
            label: 'Social Media Friend',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Friend/SocialMediaFriend.png",
        },
        {
            id: 4,
            label: 'School Friend',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Friend/SchoolFriend.png",
        },
        {
            id: 5,
            label: 'College Buddy',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Friend/CollegeBuddy.png",
        }
    ];

    const loveCategories = [
        {
            id: 0,
            label: 'Soft Crush',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Love/SoftCrush.png",
        },
        {
            id: 1,
            label: 'Deep Love',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Love/DeepLove.png",
        },
        {
            id: 2,
            label: 'Unspoken Love',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Love/UnspokenLove.png",
        },
        {
            id: 3,
            label: 'Ex Love',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Love/ExLove.png",
        },
        {
            id: 4,
            label: 'One-Sided Love',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Love/OneSidedLove.png",
        },
        {
            id: 5,
            label: 'Faded Love',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Love/FadedLove.png",
        }
    ];

    const crushCategories = [
        {
            id: 0,
            label: 'Soft Crush',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Crush/SoftCrush.png",
        },
        {
            id: 1,
            label: 'Secret Crush',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Crush/SecretCrush.png",
        },
        {
            id: 2,
            label: 'Just Vibes Crush',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Crush/JustVibesCrush.png",
        },
        {
            id: 3,
            label: 'Story Viewer Crush',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Crush/StoryViewerCrush.png",
        },
        {
            id: 4,
            label: 'Lowkey Crush Friend',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Crush/LowkeyCrushFriend.png",
        },
        {
            id: 5,
            label: 'Unspoken Crush',
            image: "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/images/question7/CategoryImage/Crush/UnspokenCrush.png",
        }
    ];

    // Selected category state
    const [selectedCategory, setSelectedCategory] = useState("V2hvVGFsa2lu"); // Default to first category

    // Category mapping with decoded names
    const categoryQuestionCount = {
        "V2hvVGFsa2lu": { name: "Who Talkin", count: "1 ques" },
        "UGljIFJvYXN0": { name: "Pic Roast", count: "2 ques" },
        "QW5ub3kgZnVuIENhcmQ=": { name: "Annoy fun Card", count: "3 ques" },
        "RW1vdGlvbg==": { name: "Emotion", count: "4 ques" },
        "Q29uZmVzc2lvbg==": { name: "Confession", count: "5 ques" },
        "UXVlc3Rpb24=": { name: "Question", count: "5 ques" },
        "SG90bmVzcw==": { name: "Hotness", count: "6 ques" },
        "RnJpZW5k": { name: "Friend", count: "7 ques" },
        "Q3J1c2g=": { name: "Crush", count: "7 ques" },
        "TG92ZQ==": { name: "Love", count: "7 ques" },
        "Um9hc3Q=": { name: "Roast", count: "8 ques" },
        "Qmx1ZmY=": { name: "Bluff", count: "9 ques" },
        "Q2hhbGxlbmdl": { name: "Challenge", count: "10 ques" }
    };

    // Field mapping for each category
    const categoryFields = {
        "V2hvVGFsa2lu": { // 1 - Who Talkin
            fields: ['word', 'contentFile'],
            labels: {
                word: 'Word',
                contentFile: 'Content File'
            }
        },
        "UGljIFJvYXN0": { // 2 - Pic Roast
            fields: ['image', 'comment', 'quetype'],
            labels: {
                image: 'Image',
                comment: 'Comment',
                quetype: 'Question Type'
            }
        },
        "QW5ub3kgZnVuIENhcmQ=": { // 3 - Annoy fun Card
            fields: ['annoyimage', 'nickname', 'annoycardtitle', 'annoyans', 'cardBg', 'shapeUrl', 'fontname', 'shapename'],
            labels: {
                annoyimage: 'Annoy Image',
                nickname: 'Nickname',
                annoycardtitle: 'Annoy Card Title (Array)',
                annoyans: 'Annoy Answer (Array)',
                cardBg: 'Card Background',
                shapeUrl: 'Shape URL',
                fontname: 'Font Name',
                shapename: 'Shape Name'
            }
        },
        "RW1vdGlvbg==": { // 4 - Emotion
            fields: ['emotionBg', 'emotionEmoji', 'emotionContent', 'emotionTitle', 'emotionVoice'],
            labels: {
                emotionBg: 'Emotion Background',
                emotionEmoji: 'Emotion Emoji',
                emotionContent: 'Emotion Content',
                emotionTitle: 'Emotion Title',
                emotionVoice: 'Emotion Voice'
            }
        },
        "Q29uZmVzc2lvbg==": { // 5 - Confession
            fields: ['confessionType', 'confessionTitle', 'confessionContent', 'confessionVoice', 'confessionEmoji'],
            labels: {
                confessionType: 'Confession Type',
                confessionTitle: 'Confession Title',
                confessionContent: 'Confession Content',
                confessionVoice: 'Confession Voice',
                confessionEmoji: 'Confession Emoji'
            }
        },
        "UXVlc3Rpb24=": { // 5 - Question (same fields as Confession)
            fields: ['confessionType', 'confessionTitle', 'confessionContent', 'confessionVoice', 'confessionEmoji'],
            labels: {
                confessionType: 'Question Type',
                confessionTitle: 'Question Title',
                confessionContent: 'Question Content',
                confessionVoice: 'Question Voice',
                confessionEmoji: 'Question Emoji'
            }
        },
        "SG90bmVzcw==": { // 6 - Hotness
            fields: ['hotnessBg', 'hotnessName', 'hotnessEmoji', 'hotnessHand', 'hotnessComment'],
            labels: {
                hotnessBg: 'Hotness Background',
                hotnessName: 'Hotness Name',
                hotnessEmoji: 'Hotness Emoji',
                hotnessHand: 'Hotness Hand',
                hotnessComment: 'Hotness Comment'
            }
        },
        "RnJpZW5k": { // 7 - Friend
            fields: ['friendEmoji', 'friendBg', 'friendContent', 'friendName'],
            labels: {
                friendBg: 'Friend Background',
                friendContent: 'Friend Content',
                friendEmoji: 'Friend Emoji',
                friendName: 'Friend Name'
            }
        },
        "Q3J1c2g=": { // 7 - Crush (same as Friend)
            fields: ['friendEmoji', 'friendBg', 'friendContent', 'friendName'],
            labels: {
                friendBg: 'Crush Background',
                friendContent: 'Crush Content',
                friendEmoji: 'Crush Emoji',
                friendName: 'Crush Name'
            }
        },
        "TG92ZQ==": { // 7 - Love (same as Friend)
            fields: ['friendEmoji', 'friendBg', 'friendContent', 'friendName'],
            labels: {
                friendBg: 'Love Background',
                friendContent: 'Love Content',
                friendEmoji: 'Love Emoji',
                friendName: 'Love Name'
            }
        },
        "Um9hc3Q=": { // 8 - Roast
            fields: ['roastType', 'roastContent', 'roastVoice', 'roastEmoji'],
            labels: {
                roastType: 'Roast Type',
                roastContent: 'Roast Content',
                roastVoice: 'Roast Voice',
                roastEmoji: 'Roast Emoji'
            }
        },
        "Qmx1ZmY=": { // 9 - Bluff
            fields: ['bluffEmoji', 'bluffBg', 'bluffContent'],
            labels: {
                bluffEmoji: 'Bluff Emoji',
                bluffBg: 'Bluff Background',
                bluffContent: 'Bluff Content',
            }
        },
        "Q2hhbGxlbmdl": { // 10 - Challenge
            fields: ['challengeContent'],
            labels: {
                challengeContent: 'Challenge Content'
            }
        }
    };

    // Form state - all possible fields
    const [formData, setFormData] = useState({
        word: '',
        contentFile: '',
        image: '',
        comment: '',
        quetype: '',
        annoyimage: '',
        nickname: '',
        annoycardtitle: [],
        annoyans: [],
        cardBg: '',
        shapeUrl: '',
        fontname: '',
        shapename: '',
        emotionBg: '',
        emotionEmoji: '',
        emotionContent: '',
        emotionTitle: '',
        emotionVoice: '',
        confessionType: '',
        confessionTitle: '',
        confessionContent: '',
        confessionVoice: '',
        confessionEmoji: '',
        hotnessBg: '',
        hotnessName: '',
        hotnessEmoji: '',
        hotnessHand: '',
        hotnessComment: '',
        friendBg: '',
        friendContent: '',
        friendEmoji: '',
        friendName: '',
        roastType: '',
        roastContent: '',
        roastVoice: '',
        roastEmoji: '',
        bluffBg: '',
        bluffContent: '',
        bluffEmoji: '',
        challengeContent: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalItems, setTotalItems] = useState(0);

    // Temporary array inputs for array fields
    const [arrayInputs, setArrayInputs] = useState({
        annoycardtitle: '',
        annoyans: ''
    });

    // Dice loading state for Challenge category
    const [isDiceLoading, setIsDiceLoading] = useState(false);

    // Friend/Crush/Love category states
    const [friendCrushLoveBgPreview, setFriendCrushLoveBgPreview] = useState('');
    const [isLoadingFCLBgPreview, setIsLoadingFCLBgPreview] = useState(false);

    useEffect(() => {
        getData(currentPage);
    }, [itemsPerPage, selectedCategory]);

    const getData = async (page = currentPage) => {
        try {
            setLoading(true);
            const requestData = {
                category: selectedCategory
            };

            const response = await axios.post('https://api.lolcards.link/api/message/read', requestData);

            // Handle different response statuses
            if (response.data.status === 1) {
                setData(response.data.data || []);
                setTotalItems(response.data.data?.length || 0);
            } else {
                // If status is 2 (No Inbox Found) or any other status
                setData([]);
                setTotalItems(0);
            }

            setCurrentPage(page);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data.");
            // Set empty data on error
            setData([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };
    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                resetForm();
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const resetForm = () => {
        setFormData({
            word: '',
            contentFile: '',
            image: '',
            comment: '',
            quetype: '',
            annoyimage: '',
            nickname: '',
            annoycardtitle: [],
            annoyans: [],
            cardBg: '',
            shapeUrl: '',
            fontname: '',
            shapename: '',
            emotionBg: '',
            emotionEmoji: '',
            emotionContent: '',
            emotionTitle: '',
            emotionVoice: '',
            confessionType: '',
            confessionTitle: '',
            confessionContent: '',
            confessionVoice: '',
            confessionEmoji: '',
            hotnessBg: '',
            hotnessName: '',
            hotnessEmoji: '',
            hotnessHand: '',
            hotnessComment: '',
            friendBg: '',
            friendContent: '',
            friendEmoji: '',
            friendName: '',
            roastType: '',
            roastContent: '',
            roastVoice: '',
            roastEmoji: '',
            bluffBg: '',
            bluffContent: '',
            bluffEmoji: '',
            challengeContent: ''
        });
        setArrayInputs({
            annoycardtitle: '',
            annoyans: ''
        });
        setId(null);
        setErrors({});
        setBluffBgPreview('');
        setFriendCrushLoveBgPreview('');
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleArrayAdd = (field) => {
        const value = arrayInputs[field].trim();
        if (value) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value]
            }));
            setArrayInputs(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleArrayRemove = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Fetch random challenge content
    const fetchRandomChallenge = async () => {
        if (isDiceLoading) return;

        try {
            setIsDiceLoading(true);

            const response = await axios.post(
                "https://api.lolcards.link/api/web/challenge/content",
                {
                    lanText: "en"
                }
            );

            if (response.data.status === 1) {
                let newContent = response.data.data.Content;
                // Remove <b> and </b> tags
                newContent = newContent.replace(/<\/?b>/gi, "");

                // Update the challengeContent field
                setFormData(prev => ({
                    ...prev,
                    challengeContent: newContent
                }));

                // Clear error if exists
                if (errors.challengeContent) {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.challengeContent;
                        return newErrors;
                    });
                }
            }
        } catch (error) {
            console.error("API Error:", error);
            toast.error("Content not available");
        } finally {
            setIsDiceLoading(false);
        }
    };

    const fetchBluffBackground = async (emoji) => {
        setIsLoadingBgPreview(true);
        const startTime = Date.now();

        try {
            const response = await axios.post(
                'https://api.lolcards.link/api/web/bluff/cardpreview',
                { category: emoji }
            );

            const fetchedData = response.data.data;

            // Preload image
            const img = new Image();
            img.src = fetchedData.CardBg;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1000 - elapsedTime);

            setTimeout(() => {
                setBluffBgPreview(fetchedData.CardBg);
                setFormData(prev => ({
                    ...prev,
                    bluffBg: fetchedData.CardBg
                }));
                setIsLoadingBgPreview(false);
            }, remainingTime);

        } catch (error) {
            console.error('Error fetching background:', error);

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1000 - elapsedTime);

            setTimeout(() => {
                setIsLoadingBgPreview(false);
                toast.error('Failed to load background');
            }, remainingTime);
        }
    };

    // Fetch Friend/Crush/Love background
    const fetchFriendCrushLoveBackground = async () => {
        if (isLoadingFCLBgPreview) return;

        setIsLoadingFCLBgPreview(true);
        const startTime = Date.now();

        try {
            const response = await axios.post('https://api.lolcards.link/api/web/friend/cardpreview');

            const fetchedData = response.data.data;

            // Preload image
            const img = new Image();
            img.src = fetchedData.CardBg;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1000 - elapsedTime);

            setTimeout(() => {
                setFriendCrushLoveBgPreview(fetchedData.CardBg);
                setFormData(prev => ({
                    ...prev,
                    friendBg: fetchedData.CardBg
                }));
                setIsLoadingFCLBgPreview(false);
            }, remainingTime);

        } catch (error) {
            console.error('Error fetching background:', error);

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 1000 - elapsedTime);

            setTimeout(() => {
                setIsLoadingFCLBgPreview(false);
                toast.error('Failed to load background');
            }, remainingTime);
        }
    };

    const validate = () => {
        const newErrors = {};
        const currentFields = categoryFields[selectedCategory].fields;

        currentFields.forEach(field => {
            const value = formData[field];
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    newErrors[field] = `${categoryFields[selectedCategory].labels[field]} is required`;
                }
            } else if (!value || value.trim() === '') {
                newErrors[field] = `${categoryFields[selectedCategory].labels[field]} is required`;
            }
        });

        return newErrors;
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

            // Prepare data - only send fields relevant to selected category
            const currentFields = categoryFields[selectedCategory].fields;
            const submitData = {
                category: selectedCategory
            };

            currentFields.forEach(field => {
                submitData[field] = formData[field];
            });

            const endpoint = id
                ? `https://api.lolcards.link/api/message/update/${id}`
                : 'https://api.lolcards.link/api/message/create';
            const method = id ? 'patch' : 'post';

            const response = await axios[method](endpoint, submitData);

            toast.success(response.data.message);
            resetForm();
            setVisible(false);
            getData(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (message) => {
        if (!isSubmitting) {
            setId(message._id);

            // Set form data from message
            const newFormData = { ...formData };
            Object.keys(newFormData).forEach(key => {
                if (message[key] !== undefined) {
                    newFormData[key] = message[key];
                }
            });
            setFormData(newFormData);

            setVisible(true);
        }
    };

    const handleDelete = async (id) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this message?")) {
            try {
                setIsSubmitting(true);
                const response = await axios.delete(`https://api.lolcards.link/api/message/delete/${id}`);
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

    const renderFormField = (field) => {
        const label = categoryFields[selectedCategory].labels[field];
        const isArray = Array.isArray(formData[field]);

        // Special handling for Friend/Crush/Love categories - Emoji field
        if (['RnJpZW5k', 'Q3J1c2g=', 'TG92ZQ=='].includes(selectedCategory) && field === 'friendEmoji') {
            let categories;
            let categoryName;

            if (selectedCategory === 'RnJpZW5k') {
                categories = friendCategories;
                categoryName = 'Friend';
            } else if (selectedCategory === 'Q3J1c2g=') {
                categories = crushCategories;
                categoryName = 'Crush';
            } else {
                categories = loveCategories;
                categoryName = 'Love';
            }

            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                    handleInputChange(field, category.image);
                                    handleInputChange('friendName', category.label);
                                }}
                                disabled={isSubmitting}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${formData[field] === category.image
                                        ? 'border-[#FA4B56] bg-[#FA4B56]/10'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <img
                                    src={category.image}
                                    alt={category.label}
                                    className="w-full h-16 object-contain mb-2"
                                />
                                <span className="text-sm font-medium">{category.label}</span>
                            </button>
                        ))}
                    </div>
                    {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                    )}
                </div>
            );
        }

        // Special handling for Friend/Crush/Love categories - Name field (auto-filled, hidden)
        if (['RnJpZW5k', 'Q3J1c2g=', 'TG92ZQ=='].includes(selectedCategory) && field === 'friendName') {
            return (
                <input
                    key={field}
                    type="hidden"
                    value={formData[field]}
                />
            );
        }

        // Special handling for Friend/Crush/Love categories - Background field with dice
        if (['RnJpZW5k', 'Q3J1c2g=', 'TG92ZQ=='].includes(selectedCategory) && field === 'friendBg') {
            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 relative">
                        {isLoadingFCLBgPreview ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="w-10 h-10 border-2 border-gray-300 border-t-[#FA4B56] rounded-full animate-spin"></div>
                            </div>
                        ) : friendCrushLoveBgPreview ? (
                            <div className="relative">
                                <img
                                    src={friendCrushLoveBgPreview}
                                    alt="Background Preview"
                                    className="w-full h-48 object-contain rounded-lg"
                                />
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Click dice to generate new background
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                Click dice to generate background
                            </div>
                        )}

                        {/* Dice Button */}
                        <button
                            type="button"
                            onClick={fetchFriendCrushLoveBackground}
                            disabled={isLoadingFCLBgPreview || isSubmitting}
                            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            title="Get random background"
                        >
                            {isLoadingFCLBgPreview ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FA4B56] rounded-full animate-spin"></div>
                            ) : (
                                <img src={dice} alt="dice" className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <input
                        type="hidden"
                        value={formData[field]}
                    />
                    {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                    )}
                </div>
            );
        }

        // Special handling for Friend/Crush/Love categories - Content field (150 char limit)
        if (['RnJpZW5k', 'Q3J1c2g=', 'TG92ZQ=='].includes(selectedCategory) && field === 'friendContent') {
            const charCount = formData[field]?.length || 0;
            const maxChars = 150;

            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <textarea
                        value={formData[field]}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length <= maxChars) {
                                handleInputChange(field, newValue);
                            }
                        }}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        disabled={isSubmitting}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 resize-none ${errors[field] ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <div>
                            {errors[field] && (
                                <p className="text-red-500 text-sm">{errors[field]}</p>
                            )}
                        </div>
                        <p className={`text-sm ${charCount > maxChars * 0.9
                                ? 'text-red-500'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {charCount}/{maxChars}
                        </p>
                    </div>
                </div>
            );
        }

        // Special handling for Bluff category
        if (selectedCategory === 'Qmx1ZmY=' && field === 'bluffEmoji') {
            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {bluffCategories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                    handleInputChange(field, category.image);
                                    fetchBluffBackground(category.label);
                                }}
                                disabled={isSubmitting}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${formData[field] === category.image
                                        ? 'border-[#FA4B56] bg-[#FA4B56]/10'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <img
                                    src={category.image}
                                    alt={category.label}
                                    className="w-full h-12 object-contain mb-2"
                                />
                                <span className="text-sm font-medium">{category.label}</span>
                            </button>
                        ))}
                    </div>
                    {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                    )}
                </div>
            );
        }

        if (selectedCategory === 'Qmx1ZmY=' && field === 'bluffBg') {
            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        {isLoadingBgPreview ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="w-10 h-10 border-2 border-gray-300 border-t-[#FA4B56] rounded-full animate-spin"></div>
                            </div>
                        ) : bluffBgPreview ? (
                            <div className="relative">
                                <img
                                    src={bluffBgPreview}
                                    alt="Background Preview"
                                    className="w-full h-48 object-contain rounded-lg"
                                />
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Background will be generated based on selected emoji
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                Select an emoji category to preview background
                            </div>
                        )}
                    </div>
                    <input
                        type="hidden"
                        value={formData[field]}
                    />
                    {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                    )}
                </div>
            );
        }

        if (selectedCategory === 'Qmx1ZmY=' && field === 'bluffContent') {
            const charCount = formData[field]?.length || 0;
            const maxChars = 150;

            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <textarea
                        value={formData[field]}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            if (newValue.length <= maxChars) {
                                handleInputChange(field, newValue);
                            }
                        }}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        disabled={isSubmitting}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 resize-none ${errors[field] ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <div>
                            {errors[field] && (
                                <p className="text-red-500 text-sm">{errors[field]}</p>
                            )}
                        </div>
                        <p className={`text-sm ${charCount > maxChars * 0.9
                                ? 'text-red-500'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {charCount}/{maxChars}
                        </p>
                    </div>
                </div>
            );
        }

        if (isArray) {
            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={arrayInputs[field] || ''}
                            onChange={(e) => setArrayInputs(prev => ({
                                ...prev,
                                [field]: e.target.value
                            }))}
                            placeholder={`Add ${label}`}
                            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button
                            type="button"
                            onClick={() => handleArrayAdd(field)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData[field].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <span className="text-sm">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => handleArrayRemove(field, index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                    )}
                </div>
            );
        }

        // Special handling for Challenge Content (textarea with dice button)
        if (field === 'challengeContent' && selectedCategory === 'Q2hhbGxlbmdl') {
            const charCount = formData[field]?.length || 0;
            const maxChars = 150;

            return (
                <div key={field} className="mb-4">
                    <label className="block font-medium mb-2">
                        {label}
                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                    </label>
                    <div className="relative">
                        <textarea
                            value={formData[field]}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= maxChars) {
                                    handleInputChange(field, newValue);
                                }
                            }}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            disabled={isSubmitting}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 resize-none ${errors[field] ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {/* Dice Button */}
                        <button
                            type="button"
                            onClick={fetchRandomChallenge}
                            disabled={isDiceLoading || isSubmitting}
                            className="absolute right-2 bottom-4 p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            title="Get random challenge"
                        >
                            {isDiceLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FA4B56] rounded-full animate-spin"></div>
                            ) : (
                                <img src={dice} alt="dice" className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {/* Character Counter */}
                    <div className="flex justify-between items-center mt-1">
                        <div>
                            {errors[field] && (
                                <p className="text-red-500 text-sm">{errors[field]}</p>
                            )}
                        </div>
                        <p className={`text-sm ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {charCount}/{maxChars}
                        </p>
                    </div>
                </div>
            );
        }

        // Default input field for other fields
        return (
            <div key={field} className="mb-4">
                <label className="block font-medium mb-2">
                    {label}
                    <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                </label>
                <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors[field] ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                )}
            </div>
        );
    };

    const getTableHeaders = () => {
        const fields = categoryFields[selectedCategory].fields;
        return ['Index', ...fields.map(f => categoryFields[selectedCategory].labels[f])];
    };

    const renderTableRow = (message, index) => {
        const fields = categoryFields[selectedCategory].fields;
        const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

        return (
            <TableRow key={message._id}>
                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    {indexOfFirstItem + index + 1}
                </TableCell>
                {fields.map(field => {
                    // Get value from answer object
                    const value = message.answer?.[field];

                    return (
                        <TableCell key={field} className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                            {Array.isArray(value)
                                ? value.join(', ')
                                : (value || '-')
                            }
                        </TableCell>
                    );
                })}
            </TableRow>
        );
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: "hidden" }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Message Management" />

            {/* Category Chips */}
            <div className="mb-6 sticky left-0">
                <div className="bg-white dark:bg-white/[0.03] rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-3 dark:text-gray-300">Select Category</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(categoryQuestionCount).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setSelectedCategory(key);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-1 rounded-lg transition-all duration-200 w-[150px] ${selectedCategory === key
                                        ? 'bg-[#FA4B56] text-white shadow-lg transform scale-105'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="font-medium">{value.name}</span>
                                    <span className="text-xs opacity-75">{value.count}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6 sticky left-0">
                <div className="rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" style={{ minHeight: "600px" }}>
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">
                            <h2 className="text-xl font-semibold dark:text-gray-300">
                                {categoryQuestionCount[selectedCategory].name} Messages
                            </h2>
                            <Button
                                onClick={() => toggleModal('add')}
                                className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                style={{ background: "#FA4B56" }}
                            >
                                <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Message
                            </Button>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        {getTableHeaders().map((header, index) => (
                                            <TableCell
                                                key={index}
                                                isHeader
                                                className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700"
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {data && data.length > 0 ? (
                                        data.map((message, index) => renderTableRow(message, index))
                                    ) : (
                                        <tr>
                                            <td colSpan={getTableHeaders().length} className="text-center pt-5 pb-4 dark:text-gray-400">
                                                No Data Found
                                            </td>
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
                totalPages={Math.ceil((totalItems || 0) / itemsPerPage)}
                onPageChange={(page) => getData(page)}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems || 0}
            />


            {/* Modal */}
            {visible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && toggleModal('add')}
                    ></div>

                    <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 dark:bg-gray-800 dark:text-gray-300 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold">
                                {id ? `Edit ${categoryQuestionCount[selectedCategory].name} Message` : `Add ${categoryQuestionCount[selectedCategory].name} Message`}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                {categoryFields[selectedCategory].fields.map(field => renderFormField(field))}

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

            <ToastContainer position="top-center" className="!z-[99999]" />

        </div>
    );
};

export default Message;