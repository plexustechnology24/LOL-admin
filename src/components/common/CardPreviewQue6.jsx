import React from "react";

const CardPreviewQue6 = ({ image, layoutMode = false }) => {

    const questionText = "Do I look cute or just funny? Answer anonymously"
    const comment = "Life is a journey filled with learning, growth, and challenges. Every step teaches something new, shaping our thoughts and making us stronger each day."

    return (
        <div
            className="absolute top-0 left-1/2 h-full flex flex-col items-center justify-center w-full transform -translate-x-1/2 text-gray-800 rounded-lg shadow-lg text-center"
        >
            <div
                className="flex flex-col items-center justify-between rounded-3xl border-4 border-black overflow-hidden w-full"
                style={{
                    height: layoutMode ? '400px' : '650px',
                    transition: 'height 0.3s ease',
                    backgroundImage: image ? `url(${image})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Name Shape */}
                <div className="mx-auto flex justify-center items-center w-[100%] h-[130px]">
                    <div
                        className={`w-full relative bg-transparent`}
                        style={{ height: "100px" }}
                    >
                        {/* SVG Background */}
                        <svg
                            viewBox="0 0 318 138"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="-mt-[30px]"
                        >
                            <path
                                d="M158.401 137.277C73.2446 137.277 3.54763 93.7502 -2.05626 90.1595H-2.4209V20.3472C-2.4209 8.54535 6.11304 -1.02231 16.6396 -1.02231H300.578C311.105 -1.02231 319.639 8.54535 319.639 20.3472V90.1595C319.617 90.1738 247.207 137.277 158.401 137.277Z"
                                fill="white"
                            />
                            <path
                                d="M158.401 137.277C73.2446 137.277 3.54763 93.7502 -2.05626 90.1595H-2.4209V20.3472C-2.4209 8.54535 6.11305 -1.02231 16.6396 -1.02231H300.578C311.105 -1.02231 319.639 8.54535 319.639 20.3472V90.1595C319.617 90.1738 247.207 137.277 158.401 137.277Z"
                                stroke="#231F20"
                                strokeWidth="0.44"
                            />
                        </svg>

                        {/* Text */}
                        <span
                            className="text-black absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] top-[60%] text-center bricolage-grotesque4 text-[20px]"
                        >
                            {questionText}
                        </span>
                    </div>
                </div>

                {/* Avatar Section */}
                <div
                    className="circle my-1 mb-2 mx-auto relative rounded-full flex justify-center items-center overflow-hidden bg-white border-[1px] border-[#353435]"
                    style={{
                        width: layoutMode ? "110px" : "135px",
                        height: layoutMode ? "110px" : "135px",
                        transition: 'width 0.3s ease, height 0.3s ease',
                    }}
                >
                    <img
                        src="https://lol-image-bucket.s3.amazonaws.com/images/question6/category/UserCardBg-874b649c-fb27-4739-8498-7a52450b54b9.png"
                        alt="emoji"
                        className="w-100 h-100"
                    />
                </div>

                {/* Label Banner */}
                <div
                    className="flex-grow flex items-center justify-center mx-auto bg-center bg-no-repeat text-center"
                    style={{
                        backgroundImage: `url(${"https://lol-image-bucket.s3.amazonaws.com/images/question6/cardImage/UserCardBg-acc60fa7-e205-469d-a94c-9d7929382b91.png"})`,
                        backgroundSize: "100% 70px",
                        height: layoutMode ? '50px' : "70px",
                        width: "80%",
                    }}
                >
                    <span className="text-black px-5 bricolage-grotesque text-[18px] break-words">
                        Bluffer
                    </span>
                </div>

                {/* Answers Table — hidden in layoutMode */}
                {!layoutMode && (
                    <div className="px-6 pt-2 pb-8 flex justify-center items-center font-black w-full h-[30%]">
                        <div className="flex justify-center items-center overflow-hidden bg-white h-full w-[95%] rounded-[19px] border-2 border-[#363435]">
                            <div
                                className="w-full p-8 cursor-pointer bricolage-grotesque text-center"
                                style={{
                                    fontSize: '18px',
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '19px',
                                }}
                            >
                                {comment}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardPreviewQue6;