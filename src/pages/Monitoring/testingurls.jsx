import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

const TestingUrls = () => {
    const testingData = [
        { category: "WhoTalkin", link: "https://lolcards.link/test/V2hvVGFsa2lu" },
        { 
            category: "Pic Roast", 
            subcategories: [
                { name: "Video", link: "https://lolcards.link/test/UGljIFJvYXN0/1" },
                { name: "Image", link: "https://lolcards.link/test/UGljIFJvYXN0/2" }
            ]
        },
        { category: "Annoy fun Card", link: "https://lolcards.link/test/QW5ub3kgZnVuIENhcmQ=" },
        { category: "Emotion", link: "https://lolcards.link/test/RW1vdGlvbg==" },
        { category: "Confession & Question", link: "https://lolcards.link/test/Q29uZmVzc2lvbg==" },
        { category: "Hotness", link: "https://lolcards.link/test/SG90bmVzcw==" },
        { category: "Friend & Love & Crush", link: "https://lolcards.link/test/RnJpZW5k" },
        { category: "Roast", link: "https://lolcards.link/test/Um9hc3Q=" },
        { category: "Bluff", link: "https://lolcards.link/test/Qmx1ZmY=" },
        { category: "Challenge", link: "https://lolcards.link/test/Q2hhbGxlbmdl" },
        { category: "Heaven Hell", link: "https://lolcards.link/test/SGVhdmVuSGVsbA==" },
    ];

    const handleCopyToClipboard = (url) => {
        if (url) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    toast.success("Link copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                    toast.error("Failed to copy link!");
                });
        } else {
            toast.error("No URL to copy!");
        }
    };

    return (
        <div>
            {/* <PageBreadcrumb pageTitle="Testing Urls" /> */}

            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Category</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2">Link</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {testingData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="py-4 px-2 border-r border-gray-200 dark:border-gray-700">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="py-4 px-2 border-r border-gray-200 dark:border-gray-700">
                                                {item.category}
                                            </TableCell>
                                            <TableCell className="py-4 px-2">
                                                {item.subcategories ? (
                                                    <div className="space-y-2">
                                                        {item.subcategories.map((sub, subIndex) => (
                                                            <div key={subIndex} className="flex items-center justify-center gap-2">
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                    {sub.name}:
                                                                </span>
                                                                <a 
                                                                    href={sub.link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                                                >
                                                                    {sub.link}
                                                                </a>
                                                                <button
                                                                    onClick={() => handleCopyToClipboard(sub.link)}
                                                                    className="ml-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                                                    title="Copy link"
                                                                >
                                                                    <FontAwesomeIcon icon={faCopy} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <a 
                                                            href={item.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                                        >
                                                            {item.link}
                                                        </a>
                                                        <button
                                                            onClick={() => handleCopyToClipboard(item.link)}
                                                            className="ml-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                                            title="Copy link"
                                                        >
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default TestingUrls;