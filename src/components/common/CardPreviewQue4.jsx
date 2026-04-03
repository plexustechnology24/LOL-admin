import React from "react";

import top from "../../assest/ecardtop.png"
import bottom from "../../assest/ecardbottom.png"


const CardPreviewQue4 = ({ image }) => {

    const questionText = "Guess my mood"
    const comment = "Life is a journey filled with learning, growth, and challenges. Every step teaches something new, shaping our thoughts and making us stronger each day."

    return (
        <div
            className="absolute top-0 left-1/2 h-full flex flex-col items-center justify-center w-full transform -translate-x-1/2 text-gray-800 last:rounded-lg shadow-lg text-center"
        >
            <div className="flex flex-col items-center justify-between h-[650px] rounded-3xl  border-4 border-black overflow-hidden w-full"
                style={{
                    backgroundImage: image ? `url(${image})` : "none", // ✅ set bg image
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >

                {/* Name Shape */}
                <div className="mx-auto flex justify-center items-center w-3/4 h-1/8">
                    <div
                        className="mx-auto flex justify-center items-center mt-2 p-2 pt-1 px-4 bg-center bg-no-repeat"
                        style={{
                            width: "90%",
                            minHeight: "80px",
                            backgroundImage: `url(${top})`,
                            backgroundSize: "100% 100%",
                        }}
                    >
                        <p
                            className="m-0 text-center leading-[18px] bricolage-grotesque"
                            style={{
                                fontSize: questionText.length > 60
                                    ? "clamp(17px, 2vw, 17px)"
                                    : questionText.length > 40
                                        ? "clamp(17px, 2.2vw, 17px)"
                                        : "clamp(20px, 2.5vw, 22px)",
                            }}
                        >
                            {questionText}
                        </p>
                    </div>
                </div>

                {/* Avatar Section */}
                <div
                    className={`circle my-1 mb-2 mx-auto relative rounded-full flex justify-center items-center bg-white border-[3px] border-[#353435]`}
                    style={{
                        width: "165px",
                        height: "165px",
                    }}
                >
                    <img src={'https://lol-image-bucket.s3.amazonaws.com/images/question4/Emoji/UserCardBg-09b3e102-8a4c-4894-b97d-576fc39a368f.png'} alt={"emoji"} className='w-100 h-100' />

                </div>

                {/* Answers Table */}
                <div className="pt-2 pb-8 px-6 flex justify-center items-center font-black w-full h-[32%]">
                    <div className="flex justify-center items-center overflow-hidden bg-white h-full w-[95%] rounded-[10px] border-2 border-[#363435]">

                        <div
                            className="w-full relative h-full flex flex-col items-center justify-center bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${bottom})`, backgroundSize: "100% 100%" }}
                        >
                            <div className="flex justify-center items-center w-full text-[18px] h-[30%] bricolage-grotesque bg-[#F6F6F6] border-b border-[#A5A5A5]">
                                Sad
                            </div>

                            <div className="w-full relative flex items-center justify-center px-1 min-h-[70%]">
                                <div
                                    className={`p-2 text-[17px] leading-[19px] text-center cursor-pointer break-all w-full bricolage-grotesque`}
                                    style={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                                >
                                    {comment}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default CardPreviewQue4;